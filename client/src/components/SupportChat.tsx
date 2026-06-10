import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  getOrCreateSupportChat,
  sendSupportMessage,
  subscribeSupportMessages,
  type ChatMessage,
} from "@/lib/firebaseAppData";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Phone,
  Loader2,
  ExternalLink,
  AlertCircle,
  User,
  Shield,
} from "lucide-react";

const BOT_FALLBACKS: Array<{ when: RegExp; reply: string }> = [
  {
    when: /price|fee|commission/i,
    reply:
      "Free plan has no monthly fee and 10% commission. Premium reduces commission and adds visibility benefits.",
  },
  {
    when: /book|tasker|service/i,
    reply:
      "Open Services, choose a category, and click Book Tasker. Your booking and request will be saved instantly.",
  },
  {
    when: /profile|onboarding|photo|skills/i,
    reply:
      "Go to Freelancer Onboarding to complete profile steps, upload photo, and save skills and expertise.",
  },
];

function getBotReply(text: string) {
  const matched = BOT_FALLBACKS.find((item) => item.when.test(text));
  if (matched) return matched.reply;
  return "Thanks for your message. Our support team can also help on WhatsApp: https://wa.me/27722324636";
}

function formatTime(date?: Date | null) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getSenderLabel(type: string) {
  switch (type) {
    case "user":
      return "You";
    case "support":
      return "Support";
    case "system":
      return "System";
    default:
      return "Support";
  }
}

function getSenderIcon(type: string) {
  switch (type) {
    case "user":
      return User;
    case "support":
      return Bot;
    case "system":
      return Shield;
    default:
      return Bot;
  }
}

export function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [supportTyping, setSupportTyping] = useState(false);

  const welcomeText = useMemo(() => {
    if (!user?.id) {
      return "Sign in to start a saved support conversation.";
    }
    return "Hi! Ask anything about jobs, services, plans, or your account.";
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Socket.io integration for real-time support chat
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const socket = io(window.location.origin, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("authenticate", user.id);
      if (chatId) socket.emit("join_conversation", `support_${chatId}`);
    });

    socket.on("new_message", (message: any) => {
      if (message.senderType === "support" || message.senderType === "system") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, {
            id: message.id || `${Date.now()}-${Math.random()}`,
            content: message.content,
            senderType: message.senderType || "support",
            createdAt: message.createdAt || new Date().toISOString(),
          }];
        });
      }
    });

    socket.on("typing", (data: any) => {
      if (data.conversationId === `support_${chatId}`) {
        setSupportTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setSupportTyping(false), 2500);
      }
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isOpen, user?.id, chatId]);

  // Firebase fallback for loading chat history
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let unsubscribe: (() => void) | null = null;
    setIsBootstrapping(true);
    setChatError(null);

    getOrCreateSupportChat(user.id)
      .then((id) => {
        setChatId(id);
        unsubscribe = subscribeSupportMessages(id, (nextMessages) => {
          setMessages(nextMessages);
        });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to load support chat.";
        setChatError(message);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, user?.id]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !chatId || !user?.id || isSending) return;

    setIsSending(true);
    setChatError(null);

    try {
      setInputValue("");
      // Send via socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", {
          conversationId: `support_${chatId}`,
          senderId: user.id,
          content: trimmed,
        });
      }
      // Persist to Firebase
      await sendSupportMessage({
        chatId,
        senderType: "user",
        senderId: user.id,
        content: trimmed,
      });

      const botReply = getBotReply(trimmed);
      await sendSupportMessage({
        chatId,
        senderType: "support",
        content: botReply,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message.";
      setChatError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 border border-white/15"
        style={{
          background: "linear-gradient(135deg, #19B8FF 0%, #15A3E0 100%)",
          color: "#ffffff",
        }}
        data-testid="button-support-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-96 h-[32rem] rounded-2xl shadow-[0_14px_42px_rgba(0,0,0,0.35)] flex flex-col z-[55] overflow-hidden border md:w-96"
          style={{
            backgroundColor: "#0F1115",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #7CFF4F 0%, #19B8FF 100%)",
              color: "#0F1115",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">FreelanceSkills Support</h3>
                <p className="text-xs opacity-70">Realtime chat</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: "#0F1115" }}
          >
            {/* Welcome banner */}
            <div
              className="rounded-xl p-3 text-sm border"
              style={{
                backgroundColor: "#1B2130",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#A7B0C0",
              }}
            >
              {welcomeText}
            </div>

            {/* Loading state */}
            {isBootstrapping && (
              <div className="py-8 flex items-center justify-center" style={{ color: "#A7B0C0" }}>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading conversation...
              </div>
            )}

            {/* Error state */}
            {!isBootstrapping && chatError && (
              <div
                className="rounded-lg border p-3 text-sm flex gap-2"
                style={{
                  borderColor: "rgba(239,68,68,0.4)",
                  backgroundColor: "rgba(239,68,68,0.15)",
                  color: "#FCA5A5",
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {chatError}
              </div>
            )}

            {/* Empty state */}
            {!isBootstrapping && !chatError && messages.length === 0 && user?.id && (
              <div className="py-8 text-center text-sm" style={{ color: "#A7B0C0" }}>
                No messages yet. Start the conversation below.
              </div>
            )}

            {/* Messages */}
            {!isBootstrapping &&
              !chatError &&
              messages.map((msg) => {
                const isUser = msg.senderType === "user";
                const isSystem = msg.senderType === "system";
                const Icon = getSenderIcon(msg.senderType);

                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        isUser
                          ? "rounded-br-sm"
                          : isSystem
                            ? "rounded-bl-sm"
                            : "rounded-bl-sm"
                      }`}
                      style={
                        isUser
                          ? {
                              backgroundColor: "#19B8FF",
                              color: "#0F1115",
                            }
                          : isSystem
                            ? {
                                backgroundColor: "#1B2130",
                                color: "#7CFF4F",
                                border: "1px solid rgba(124,255,79,0.25)",
                              }
                            : {
                                backgroundColor: "#1B2130",
                                color: "#F5F7FA",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                      }
                    >
                      {/* Sender label for non-user messages */}
                      {!isUser && (
                        <div className="flex items-center gap-1 mb-1 opacity-60">
                          <Icon className="w-3 h-3" />
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {getSenderLabel(msg.senderType)}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                      <p
                        className="mt-1 text-[10px]"
                        style={{
                          color: isUser
                            ? "rgba(15,17,21,0.7)"
                            : isSystem
                              ? "rgba(124,255,79,0.6)"
                              : "#A7B0C0",
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

            {/* Typing indicator */}
            {supportTyping && !isSending && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm p-3 flex items-center gap-2"
                  style={{
                    backgroundColor: "#1B2130",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#A7B0C0",
                  }}
                >
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  <span className="text-sm">Support is typing...</span>
                </div>
              </div>
            )}

            {/* Sending indicator */}
            {isSending && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm p-3 flex items-center gap-2"
                  style={{
                    backgroundColor: "#1B2130",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#A7B0C0",
                  }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sending...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="p-3 border-t"
            style={{
              backgroundColor: "#1B2130",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {!user?.id ? (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "#A7B0C0" }}>
                  Please sign in to send messages.
                </p>
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "/auth?redirect=/dashboard")}
                >
                  Sign in
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={!chatId || isSending}
                    style={{
                      backgroundColor: "#0F1115",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "#F5F7FA",
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || !chatId || isSending}
                    style={{
                      backgroundColor: "#19B8FF",
                      color: "#0F1115",
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-center">
                  <a
                    href="https://wa.me/27722324636"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 hover:underline"
                    style={{ color: "#19B8FF" }}
                  >
                    <Phone className="h-3 w-3" />
                    WhatsApp Support
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
