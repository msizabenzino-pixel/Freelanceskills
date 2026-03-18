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
  });

  ioInstance = io;

  const onlineUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    socket.on("authenticate", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.join(`user_${userId}`);
      io.emit("user_online", userId);
      log(`User ${userId} authenticated on socket ${socket.id}`, "socket");
    });

    socket.on("join_room", (room: string) => {
      // Allow joining named rooms (analytics_room, etc.) — admin pages use this
      const allowedRooms = ["analytics_room"];
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

    socket.on("typing", (data: { conversationId: string, userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit("typing", data);
    });

    socket.on("stop_typing", (data: { conversationId: string, userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit("stop_typing", data);
    });

    socket.on("send_message", async (data: { conversationId: string, senderId: string, content: string }) => {
      try {
        const safetyResult = checkMessageSafety(data.content);
        
        // Even if safety check fails, we might want to handle it. 
        // The REST API also does this, but for real-time we broadcast the sanitized version.
        
        const validatedData = insertMessageSchema.parse({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: safetyResult.sanitizedContent,
        });

        const message = await storage.sendMessage(validatedData);
        
        const messageWithSafety = {
          ...message,
          safetyWarnings: safetyResult.violations.filter(v => v.severity === 'warning'),
          isBlocked: !safetyResult.isClean && safetyResult.violations.some(v => v.severity === 'blocked')
        };

        if (messageWithSafety.isBlocked) {
          socket.emit("message_error", { 
            message: "Message blocked for safety reasons",
            hint: "For your protection, sharing contact details is not allowed."
          });
          return;
        }

        io.to(`conversation_${data.conversationId}`).emit("new_message", messageWithSafety);
        log(`Message sent in conversation ${data.conversationId}`, "socket");
      } catch (error) {
        log(`Error sending message via socket: ${error}`, "socket");
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    socket.on("mark_read", async (data: { conversationId: string, userId: string }) => {
       // Implementation for marking messages as read in DB if needed
       // For now just broadcast the event
       socket.to(`conversation_${data.conversationId}`).emit("messages_read", data);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
        log(`User ${userId} disconnected`, "socket");
      }
    });
  });

  return io;
}
