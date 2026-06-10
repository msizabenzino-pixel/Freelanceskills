import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export function useSocketNotifications(userId: string | undefined) {
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("authenticate", userId);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Listen for new message notifications
    socket.on("notification", (data: { type: string; conversationId: string; senderId: string; preview: string; messageId: string; createdAt: string }) => {
      if (data.type === "new_message") {
        // Invalidate unread count
        queryClient.invalidateQueries({ queryKey: ["/api/conversations/unread-count"] });
        // Invalidate conversation list
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
    });

    // Also listen for new messages directly to update any cached message lists
    socket.on("new_message", (message: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    });

    // Listen for messages_read to refresh counts
    socket.on("messages_read", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/unread-count"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { socketConnected, socket: socketRef.current };
}
