import { Server } from "socket.io";
import { type Server as HttpServer } from "http";
import { storage } from "./storage";
import { checkMessageSafety } from "@shared/safety";
import { insertMessageSchema } from "@shared/schema";
import { log } from "./index";

let ioInstance: Server | null = null;

export function getIO(): Server | null {
  return ioInstance;
}

export function emitJobNotification(event: string, data: any) {
  if (ioInstance) {
    ioInstance.to("job_notifications").emit(event, data);
    log(`Job notification emitted: ${event}`, "socket");
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
}

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  ioInstance = io;

  const onlineUsers = new Map<string, string>();
  const userSockets = new Map<string, Set<string>>(); // userId -> socket ids

  io.on("connection", (socket) => {
    // Authenticate socket with userId
    socket.on("authenticate", (userId: string) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.join(`user_${userId}`);

      // Track multiple sockets per user
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(socket.id);

      io.emit("user_online", userId);
      log(`User ${userId} authenticated on socket ${socket.id}`, "socket");
    });

    socket.on("join_room", (room: string) => {
      const allowedRooms = ["analytics_room", "monitoring_room", "performance_room", "compliance_room", "support_room"];
      if (allowedRooms.includes(room)) {
        socket.join(room);
        log(`Socket ${socket.id} joined room: ${room}`, "socket");
      }
    });

    socket.on("subscribe_jobs", (filters?: { category?: string; location?: string }) => {
      socket.join("job_notifications");
      if (filters?.category) socket.join(`jobs_${filters.category}`);
      if (filters?.location) socket.join(`jobs_${filters.location}`);
      log(`Socket ${socket.id} subscribed to job notifications`, "socket");
    });

    socket.on("unsubscribe_jobs", () => {
      socket.leave("job_notifications");
      log(`Socket ${socket.id} unsubscribed from job notifications`, "socket");
    });

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      log(`Socket ${socket.id} joined conversation ${conversationId}`, "socket");
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      log(`Socket ${socket.id} left conversation ${conversationId}`, "socket");
    });

    // Typing indicators
    socket.on("typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit("typing", data);
    });

    socket.on("stop_typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit("stop_typing", data);
    });

    // Send message via socket — persists to DB + broadcasts
    socket.on("send_message", async (data: { conversationId: string; senderId: string; content: string }) => {
      try {
        if (!data.conversationId || !data.senderId || !data.content?.trim()) {
          socket.emit("message_error", { message: "Missing required fields" });
          return;
        }

        const safetyResult = checkMessageSafety(data.content);

        const validatedData = insertMessageSchema.parse({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: safetyResult.sanitizedContent,
        });

        const message = await storage.sendMessage(validatedData);

        const messageWithSafety = {
          ...message,
          safetyWarnings: safetyResult.violations.filter((v: any) => v.severity === "warning"),
          isBlocked: !safetyResult.isClean && safetyResult.violations.some((v: any) => v.severity === "blocked"),
        };

        if (messageWithSafety.isBlocked) {
          socket.emit("message_error", {
            message: "Message blocked for safety reasons",
            hint: "For your protection, sharing contact details is not allowed.",
          });
          return;
        }

        // Broadcast to all members of the conversation
        io.to(`conversation_${data.conversationId}`).emit("new_message", messageWithSafety);

        // Confirm to sender
        socket.emit("message_sent", { messageId: message.id, conversationId: data.conversationId });

        // Send notification to recipient (the other user)
        const conversation = await storage.getConversation(data.conversationId);
        if (conversation) {
          const recipientId = conversation.participant1Id === data.senderId
            ? conversation.participant2Id
            : conversation.participant1Id;

          io.to(`user_${recipientId}`).emit("notification", {
            type: "new_message",
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderName: data.senderId,
            preview: data.content.slice(0, 100),
            messageId: message.id,
            createdAt: message.createdAt,
          });
        }

        log(`Message sent in conversation ${data.conversationId}`, "socket");
      } catch (error) {
        log(`Error sending message via socket: ${error}`, "socket");
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("mark_read", async (data: { conversationId: string; userId: string }) => {
      try {
        const count = await storage.markMessagesAsRead(data.conversationId, data.userId);
        if (count > 0) {
          socket.to(`conversation_${data.conversationId}`).emit("messages_read", data);
        }
      } catch (error) {
        log(`Error marking messages read: ${error}`, "socket");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
            onlineUsers.delete(userId);
            io.emit("user_offline", userId);
            log(`User ${userId} went offline (all sockets closed)`, "socket");
          } else {
            log(`User ${userId} socket closed, ${sockets.size} remaining`, "socket");
          }
        }
      }
    });
  });

  return io;
}
