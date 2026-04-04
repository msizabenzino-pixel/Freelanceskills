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
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Phone,
  Loader2,
  ExternalLink,
  AlertCircle,
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
  return "Thanks for your message. Our support team can also help on WhatsApp: https://wa.me/27601234567";
}

function formatTime(date?: Date | null) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const welcomeText = useMemo(() => {
    if (!user?.id) {
      return "Sign in to start a saved support conversation.";
    }
    return "Hi! Ask anything about jobs, services, plans, or your account.";
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 border border-white/10"
        data-testid="button-support-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-96 h-[32rem] bg-card rounded-2xl shadow-[var(--shadow-lg)] flex flex-col z-[55] overflow-hidden border border-border md:w-96">
          <div className="bg-brand-gradient text-[#0F1115] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">FreelanceSkills Support</h3>
                <p className="text-xs text-black/70">Realtime chat</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
            <div className="bg-card border border-border rounded-xl p-3 text-sm text-muted-foreground">
              {welcomeText}
            </div>

            {isBootstrapping && (
              <div className="py-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading conversation...
              </div>
            )}

            {!isBootstrapping && chatError && (
              <div className="rounded-lg border border-red-400/40 bg-destructive/15 p-3 text-sm text-red-200 flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {chatError}
              </div>
            )}

            {!isBootstrapping && !chatError && messages.length === 0 && user?.id && (
              <div className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</div>
            )}

            {!isBootstrapping &&
              !chatError &&
              messages.map((msg) => {
                const isUser = msg.senderType === "user";
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card text-foreground border border-border rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm p-3 flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sending...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-card">
            {!user?.id ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Please sign in to send messages.</p>
                <Button className="w-full" onClick={() => (window.location.href = "/login?redirect=/dashboard")}>Sign in</Button>
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
                    className="flex-1 text-foreground"
                    disabled={!chatId || isSending}
                  />
                  <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || !chatId || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-center">
                  <a
                    href="https://wa.me/27601234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
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
