import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { VideoCallDialog } from "@/components/VideoCall";
import { ContractBuilder } from "@/components/ContractMilestones";
import {
  Search, MoreVertical, Phone, Video, Send, Paperclip, CheckCheck,
  ShieldCheck, FileText, Shield, X, AlertTriangle, MessageSquare,
  Star, Pin, Smile, Zap, ChevronRight, BriefcaseBusiness,
  Mic, Image, Clock, Check, Filter, Archive, Users, Briefcase,
  Reply, Copy, Trash2, Flag, Bell, BellOff, Info, TrendingUp,
  ThumbsUp, Heart, Laugh, Frown, Flame, Award, ChevronDown,
  Hash, Plus, Settings, ArrowLeft, Download
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";

// ── Types ─────────────────────────────────────────────────────────────────────
type Reaction = { emoji: string; count: number; reacted: boolean };
type PinnedMsg = { id: string; content: string; senderName: string };
type TabFilter = "all" | "clients" | "freelancers" | "archived";

const QUICK_REPLIES = [
  { label: "Interested", text: "Hi! I'm very interested in this project. Can we discuss further?" },
  { label: "Available", text: "I'm available to start immediately. Let me know your timeline." },
  { label: "Quote ready", text: "I've reviewed your requirements. I can provide a detailed quote within 24 hours." },
  { label: "Need details", text: "Thank you for reaching out. Could you share more details about the scope and budget?" },
  { label: "Check-in", text: "Just checking in — how's everything going with the project?" },
  { label: "Milestone done", text: "✅ The milestone has been completed. Please review and approve when ready." },
  { label: "Revision noted", text: "Revision noted! I'll have the updates ready by end of day." },
  { label: "Payment thanks", text: "Thank you for the payment! It's a pleasure working with you." },
];

const REACTIONS = ["👍", "❤️", "🔥", "✅", "😂", "🎉"];

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMMM");
}

function ReadReceipt({ isOwn, isRead }: { isOwn: boolean; isRead: boolean }) {
  if (!isOwn) return null;
  return (
    <span className={cn("inline-flex", isRead ? "text-emerald-400" : "text-white/50")}>
      <CheckCheck className="w-3.5 h-3.5" />
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showSafetyPopup, setShowSafetyPopup] = useState(() =>
    localStorage.getItem("messageSafetyShown") !== "true"
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showProposalCard, setShowProposalCard] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMsg[]>([]);
  const [starredMessages, setStarredMessages] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalDays, setProposalDays] = useState("");
  const [proposalNote, setProposalNote] = useState("");
  const [showMobileConvList, setShowMobileConvList] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
  });

  const selectedConversation = conversations.find((c: any) => c.id === selectedConversationId);

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<any[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user) socket.emit("authenticate", user.id);
    });

    socket.on("user_online", (userId: string) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });
    socket.on("user_offline", (userId: string) => {
      setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
    });

    socket.on("new_message", (message: any) => {
      queryClient.setQueryData(
        ["/api/conversations", message.conversationId, "messages"],
        (old: any[] | undefined) => {
          if (!old) return [message];
          if (old.some(m => m.id === message.id)) return old;
          return [...old, message];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    });

    socket.on("typing", (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === selectedConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
      }
    });
    socket.on("stop_typing", (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === selectedConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
      }
    });

    return () => { socket.disconnect(); };
  }, [user, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId && socketRef.current) {
      socketRef.current.emit("join_conversation", selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // ── Send Message ──────────────────────────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setInputText("");
      setReplyingTo(null);
      if (socketRef.current && selectedConversationId) {
        socketRef.current.emit("stop_typing", { conversationId: selectedConversationId, userId: user?.id });
      }
    },
  });

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(text);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (socketRef.current && selectedConversationId && user) {
      socketRef.current.emit("typing", { conversationId: selectedConversationId, userId: user.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("stop_typing", { conversationId: selectedConversationId, userId: user.id });
      }, 2500);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setReactions(prev => {
      const msgReactions = [...(prev[messageId] || [])];
      const idx = msgReactions.findIndex(r => r.emoji === emoji);
      if (idx >= 0) {
        const updated = { ...msgReactions[idx], reacted: !msgReactions[idx].reacted, count: msgReactions[idx].reacted ? msgReactions[idx].count - 1 : msgReactions[idx].count + 1 };
        if (updated.count <= 0) { msgReactions.splice(idx, 1); } else { msgReactions[idx] = updated; }
      } else {
        msgReactions.push({ emoji, count: 1, reacted: true });
      }
      return { ...prev, [messageId]: msgReactions };
    });
    setHoveredMessageId(null);
  };

  const handlePinMessage = (msg: any) => {
    const otherUser = selectedConversation?.otherUser;
    setPinnedMessages(prev => {
      if (prev.some(p => p.id === msg.id)) return prev.filter(p => p.id !== msg.id);
      return [...prev, { id: msg.id, content: msg.content, senderName: msg.senderId === user?.id ? "You" : (otherUser?.name || "Them") }];
    });
  };

  const handleStarMessage = (messageId: string) => {
    setStarredMessages(prev => {
      const n = new Set(prev);
      n.has(messageId) ? n.delete(messageId) : n.add(messageId);
      return n;
    });
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleSendProposal = () => {
    if (!proposalPrice || !proposalDays) return;
    const proposalText = `📋 **Project Proposal**\n💰 Rate: R${proposalPrice}\n⏱ Delivery: ${proposalDays} day${Number(proposalDays) !== 1 ? "s" : ""}\n📝 ${proposalNote || "Ready to start immediately."}`;
    sendMessageMutation.mutate(proposalText);
    setShowProposalCard(false);
    setProposalPrice(""); setProposalDays(""); setProposalNote("");
  };

  // ── Filtered Conversations ────────────────────────────────────────────────
  const filteredConversations = conversations.filter((c: any) => {
    const name = (c.otherUser?.name || "").toLowerCase();
    const lastMsg = (c.lastMessage || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || name.includes(q) || lastMsg.includes(q);
    if (!matchesSearch) return false;
    if (activeTab === "clients") return c.otherUser?.role === "client";
    if (activeTab === "freelancers") return c.otherUser?.role === "freelancer";
    if (activeTab === "archived") return c.archived === true;
    return true;
  });

  // ── Group messages by date ────────────────────────────────────────────────
  const groupedMessages: { label: string; messages: any[] }[] = [];
  messages.forEach((msg: any) => {
    const d = msg.createdAt ? new Date(msg.createdAt) : new Date();
    const label = getDateLabel(d);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.label === label) { last.messages.push(msg); }
    else { groupedMessages.push({ label, messages: [msg] }); }
  });

  const isTyping = selectedConversation && typingUsers[selectedConversation.otherUser?.id];
  const isOnline = selectedConversation && onlineUsers.has(selectedConversation.otherUser?.id);

  // ── Conversation List Panel ───────────────────────────────────────────────
  const ConversationList = () => (
    <div className={cn(
      "flex flex-col border-r border-border bg-slate-950 h-full",
      "w-full md:w-80 lg:w-96",
      !showMobileConvList && "hidden md:flex"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white" data-testid="text-messages-title">Messages</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-emerald-400">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-emerald-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 bg-slate-900 border-slate-800 text-sm h-9 focus-visible:ring-emerald-500/30"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            data-testid="input-search-messages"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {(["all", "clients", "freelancers", "archived"] as TabFilter[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`button-tab-${tab}`}
              className={cn(
                "flex-1 text-[11px] font-medium py-1.5 rounded-md capitalize transition-colors",
                activeTab === tab
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-muted-foreground hover:text-white hover:bg-slate-800"
              )}
            >
              {tab === "all" ? "All" : tab === "clients" ? "Clients" : tab === "freelancers" ? "Freelancers" : "Archived"}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {isLoadingConversations ? (
          <div className="p-4 space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-800 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center" data-testid="empty-conversations">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No conversations match your search." : "No messages yet. Start a conversation from a freelancer's profile."}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((chat: any) => {
              const isActive = selectedConversationId === chat.id;
              const online = onlineUsers.has(chat.otherUser?.id);
              return (
                <button
                  key={chat.id}
                  data-testid={`button-chat-item-${chat.id}`}
                  onClick={() => {
                    setSelectedConversationId(chat.id);
                    setShowMobileConvList(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900/70 transition-all text-left group",
                    isActive && "bg-emerald-500/8 border-l-[3px] border-l-emerald-500"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={chat.otherUser?.avatar} />
                      <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold">
                        {(chat.otherUser?.name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className={cn("text-sm font-semibold truncate", isActive ? "text-white" : "text-slate-200")}>
                        {chat.otherUser?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                        {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), isToday(new Date(chat.lastMessageAt)) ? "p" : "dd MMM") : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-xs truncate leading-tight mt-0.5",
                        chat.unreadCount > 0 ? "text-white font-medium" : "text-slate-500"
                      )}>
                        {chat.lastMessage || "Start the conversation"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // ── Message Bubble ─────────────────────────────────────────────────────────
  const MessageBubble = ({ msg }: { msg: any }) => {
    const isOwn = msg.senderId === user?.id;
    const msgReactions = reactions[msg.id] || [];
    const isPinned = pinnedMessages.some(p => p.id === msg.id);
    const isStarred = starredMessages.has(msg.id);
    const isHovered = hoveredMessageId === msg.id;

    // Render proposal cards differently
    const isProposal = msg.content?.startsWith("📋 **Project Proposal**");

    return (
      <div
        className={cn("group flex gap-2 relative", isOwn ? "flex-row-reverse" : "")}
        onMouseEnter={() => setHoveredMessageId(msg.id)}
        onMouseLeave={() => setHoveredMessageId(null)}
        data-testid={`message-item-${msg.id}`}
      >
        {!isOwn && (
          <Avatar className="w-7 h-7 mt-1 shrink-0">
            <AvatarImage src={selectedConversation?.otherUser?.avatar} />
            <AvatarFallback className="text-[10px] bg-slate-700">
              {(selectedConversation?.otherUser?.name || "?")[0]}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn("flex flex-col max-w-[72%]", isOwn ? "items-end" : "items-start")}>
          {/* Reply preview */}
          {replyingTo?.id === msg.id && (
            <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
              <Reply className="w-3 h-3" /> Replying
            </div>
          )}

          {/* Pinned indicator */}
          {isPinned && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1">
              <Pin className="w-3 h-3" /> Pinned
            </div>
          )}

          {/* Proposal Card */}
          {isProposal ? (
            <div className={cn(
              "rounded-2xl border text-sm shadow-sm overflow-hidden",
              isOwn ? "border-emerald-500/30 rounded-tr-none" : "border-slate-700 rounded-tl-none"
            )}>
              <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20 flex items-center gap-2">
                <BriefcaseBusiness className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-xs">Project Proposal</span>
              </div>
              <div className="p-3 bg-slate-900 space-y-1">
                {msg.content.split("\n").slice(1).map((line: string, i: number) => (
                  <p key={i} className={cn("text-sm", line.startsWith("💰") ? "text-emerald-400 font-semibold" : "text-slate-300")}>
                    {line.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
              <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex gap-2">
                <Button size="sm" className="flex-1 h-7 text-xs bg-emerald-500 hover:bg-emerald-600">Accept</Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-slate-700">Decline</Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "px-3.5 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed",
              isOwn
                ? "bg-emerald-600 text-white rounded-tr-none"
                : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          )}

          {/* Timestamp + read receipt */}
          <div className={cn("flex items-center gap-1 mt-1", isOwn ? "flex-row-reverse" : "")}>
            <span className="text-[10px] text-slate-500">
              {msg.createdAt ? format(new Date(msg.createdAt), "p") : ""}
            </span>
            {isOwn && <ReadReceipt isOwn={isOwn} isRead={msg.isRead} />}
            {isStarred && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
          </div>

          {/* Reactions */}
          {msgReactions.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1">
              {msgReactions.map(r => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(msg.id, r.emoji)}
                  className={cn(
                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                    r.reacted
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                  )}
                >
                  {r.emoji} {r.count > 1 && <span>{r.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Action Toolbar — appears on hover */}
        {isHovered && (
          <div className={cn(
            "absolute flex items-center gap-0.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-20 -top-10",
            isOwn ? "right-8" : "left-8"
          )}>
            {/* Quick emoji reactions */}
            {REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(msg.id, emoji)}
                className="text-base hover:scale-125 transition-transform px-0.5"
              >
                {emoji}
              </button>
            ))}
            <div className="w-px bg-slate-700 mx-1 h-4" />
            <button
              onClick={() => setReplyingTo(msg)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePinMessage(msg)}
              className={cn("p-1.5 rounded hover:bg-slate-800", isPinned ? "text-amber-400" : "text-slate-400 hover:text-white")}
              title="Pin message"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStarMessage(msg.id)}
              className={cn("p-1.5 rounded hover:bg-slate-800", isStarred ? "text-amber-400" : "text-slate-400 hover:text-white")}
              title="Star message"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(msg.content)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── Context Panel (right column) ──────────────────────────────────────────
  const ContextPanel = () => {
    const other = selectedConversation?.otherUser;
    if (!other) return null;
    return (
      <div className="w-72 bg-slate-950 border-l border-border/50 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border/50 text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={other.avatar} />
            <AvatarFallback className="bg-emerald-900 text-emerald-300 text-xl font-bold">{(other.name || "?")[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-white">{other.name}</h3>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{other.role}</p>
          <div className={cn("flex items-center justify-center gap-1.5 mt-2 text-xs", isOnline ? "text-emerald-400" : "text-slate-500")}>
            <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
            {isOnline ? "Online now" : "Offline"}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Pin className="w-3 h-3" /> Pinned Messages
                </h4>
                <div className="space-y-2">
                  {pinnedMessages.map(p => (
                    <div key={p.id} className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <p className="text-xs text-slate-300 truncate">{p.content}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{p.senderName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Profile Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Jobs Done", value: "47" },
                  { label: "Rating", value: "4.9★" },
                  { label: "Response", value: "< 1h" },
                  { label: "On Time", value: "98%" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 text-center">
                    <p className="text-sm font-bold text-emerald-400">{s.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick Actions</h4>
              <div className="space-y-1.5">
                {[
                  { icon: FileText, label: "Create Contract", action: () => setShowContract(true) },
                  { icon: Video, label: "Start Video Call", action: () => setShowVideoCall(true) },
                  { icon: BriefcaseBusiness, label: "Send Proposal", action: () => setShowProposalCard(true) },
                  { icon: Star, label: "Starred Messages", action: () => {} },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <a.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">Escrow Protected</span>
              </div>
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                All payments on FreelanceSkills are held in secure escrow. Never pay outside the platform.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <AuthGuard message="Sign in to view and send messages to freelancers and clients.">
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
        <Navbar />

        <main id="main-content" className="flex-1 flex pt-16 overflow-hidden">
          {/* Conversation List */}
          <ConversationList />

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden",
            showMobileConvList && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-border/50 bg-slate-950 flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <Button
                      variant="ghost" size="icon"
                      className="md:hidden text-muted-foreground h-8 w-8"
                      onClick={() => setShowMobileConvList(true)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="relative">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={selectedConversation.otherUser?.avatar} />
                        <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold text-sm">
                          {(selectedConversation.otherUser?.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {selectedConversation.otherUser?.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {isTyping ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="inline-flex gap-0.5">
                              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </span>
                            typing...
                          </span>
                        ) : (
                          <span className={isOnline ? "text-emerald-400" : "text-slate-500"}>
                            {isOnline ? "Online now" : "Offline"} • {selectedConversation.otherUser?.role}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-400 h-9 w-9" data-testid="button-phone-call">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-400 h-9 w-9" onClick={() => setShowVideoCall(true)} data-testid="button-video-call-message">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-400 h-9 w-9" onClick={() => setShowContract(true)} data-testid="button-create-contract">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className={cn("h-9 w-9 hover:text-emerald-400", showContext ? "text-emerald-400" : "text-muted-foreground")} onClick={() => setShowContext(v => !v)}>
                      <Info className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-9 w-9" data-testid="button-more-options">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-sm">
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-slate-800">
                          <Bell className="w-4 h-4 mr-2" /> Mute notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-slate-800">
                          <Archive className="w-4 h-4 mr-2" /> Archive conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-slate-800">
                          <Star className="w-4 h-4 mr-2" /> View starred messages
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem className="text-red-400 focus:bg-slate-800 focus:text-red-400">
                          <Flag className="w-4 h-4 mr-2" /> Report conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 bg-slate-950">
                  <div className="px-4 py-4 space-y-4 min-h-full">
                    {/* Safety Banner (once, at top) */}
                    <div className="flex justify-center" data-testid="safety-message">
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-400">
                        <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>All transactions protected by FreelanceSkills Escrow</span>
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                    </div>

                    {isLoadingMessages ? (
                      <div className="flex flex-col gap-4 mt-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("flex gap-3 animate-pulse", i % 2 === 0 ? "" : "flex-row-reverse")}>
                            <div className="w-7 h-7 bg-slate-800 rounded-full shrink-0" />
                            <div className={cn("rounded-2xl h-10 bg-slate-800", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                          <MessageSquare className="w-7 h-7 text-slate-600" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">Start the conversation</h3>
                        <p className="text-sm text-slate-500 max-w-xs">
                          This is the beginning of your conversation with {selectedConversation.otherUser?.name}. Say hello!
                        </p>
                        <Button
                          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white h-9 text-sm"
                          onClick={() => { setInputText("Hi! I'm interested in working with you."); inputRef.current?.focus(); }}
                        >
                          Say Hello 👋
                        </Button>
                      </div>
                    ) : (
                      groupedMessages.map(group => (
                        <div key={group.label}>
                          {/* Date separator */}
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-slate-800" />
                            <span className="text-[11px] text-slate-500 font-medium px-2">{group.label}</span>
                            <div className="flex-1 h-px bg-slate-800" />
                          </div>
                          <div className="space-y-3">
                            {group.messages.map((msg: any) => (
                              <MessageBubble key={msg.id} msg={msg} />
                            ))}
                          </div>
                        </div>
                      ))
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Reply Templates */}
                {showQuickReplies && (
                  <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" /> Quick Replies
                      </span>
                      <button onClick={() => setShowQuickReplies(false)} className="text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.map(qr => (
                        <button
                          key={qr.label}
                          onClick={() => handleQuickReply(qr.text)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700 rounded-full text-xs text-slate-300 hover:text-emerald-300 transition-colors"
                          data-testid={`button-quick-reply-${qr.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Preview */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                    <div className="flex-1 bg-slate-800 rounded-lg px-3 py-2 border-l-2 border-emerald-500">
                      <p className="text-[10px] text-emerald-400 font-medium mb-0.5">Replying to message</p>
                      <p className="text-xs text-slate-400 truncate">{replyingTo.content}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-end gap-2 p-2 focus-within:border-emerald-500/50 transition-colors">
                    {/* Attachment */}
                    <div className="flex gap-1 items-end pb-1 shrink-0">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-400 h-8 w-8" data-testid="button-attach-file">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-400 h-8 w-8" data-testid="button-attach-image">
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Text Input */}
                    <textarea
                      ref={inputRef}
                      className="flex-1 bg-transparent border-0 outline-none resize-none max-h-28 min-h-[2rem] py-1.5 text-sm text-white placeholder:text-slate-500"
                      placeholder="Type a message... (Shift+Enter for new line)"
                      rows={1}
                      value={inputText}
                      onChange={handleTyping}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      data-testid="textarea-message-input"
                    />

                    {/* Right Actions */}
                    <div className="flex gap-1 items-end pb-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className={cn("h-8 w-8", showQuickReplies ? "text-emerald-400" : "text-slate-500 hover:text-emerald-400")}
                        onClick={() => setShowQuickReplies(v => !v)}
                        title="Quick replies"
                        data-testid="button-quick-replies"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-emerald-400"
                        onClick={() => setShowProposalCard(true)}
                        title="Send proposal"
                        data-testid="button-send-proposal"
                      >
                        <BriefcaseBusiness className="w-4 h-4" />
                      </Button>
                      <Button
                        className={cn(
                          "h-9 w-9 rounded-lg transition-colors",
                          inputText.trim()
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        )}
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !inputText.trim()}
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Escrow-protected · Never share bank details or pay outside FreelanceSkills
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-950">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-9 h-9 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">Your Inbox</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Select a conversation from the left to start messaging, or browse freelancers to start a new chat.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Context Panel (right) — desktop only, toggled */}
          {showContext && selectedConversation && (
            <div className="hidden lg:flex">
              <ContextPanel />
            </div>
          )}
        </main>

        {/* ── Proposal Card Dialog ── */}
        <Dialog open={showProposalCard} onOpenChange={setShowProposalCard}>
          <DialogContent className="max-w-md bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <BriefcaseBusiness className="w-5 h-5 text-emerald-400" />
                Send a Proposal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Rate (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R</span>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white pl-7"
                      placeholder="5,000"
                      value={proposalPrice}
                      onChange={e => setProposalPrice(e.target.value)}
                      data-testid="input-proposal-price"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Delivery (days)</label>
                  <Input
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="7"
                    value={proposalDays}
                    onChange={e => setProposalDays(e.target.value)}
                    data-testid="input-proposal-days"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Note (optional)</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white text-sm p-3 resize-none h-20 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Briefly describe your approach..."
                  value={proposalNote}
                  onChange={e => setProposalNote(e.target.value)}
                  data-testid="textarea-proposal-note"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-700 text-slate-300" onClick={() => setShowProposalCard(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleSendProposal}
                  disabled={!proposalPrice || !proposalDays}
                  data-testid="button-submit-proposal"
                >
                  Send Proposal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Safety First-Visit Popup ── */}
        <Dialog open={showSafetyPopup} onOpenChange={setShowSafetyPopup}>
          <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-white">
                <Shield className="h-6 w-6 text-emerald-400" />
                Stay Safe on FreelanceSkills
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="font-semibold text-emerald-300 mb-2 text-sm">Your payments are protected:</p>
                <ul className="text-sm text-emerald-200/80 space-y-1.5">
                  {["Funds held in secure PayFast escrow", "Released only after your approval", "Full dispute resolution team"].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="font-semibold text-red-300 mb-2 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Never do this:
                </p>
                <ul className="text-sm text-red-200/80 space-y-1.5">
                  {["Share bank details in messages", "Pay outside the FreelanceSkills platform", "Move to WhatsApp/email to dodge fees"].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => { setShowSafetyPopup(false); localStorage.setItem("messageSafetyShown", "true"); }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                data-testid="button-dismiss-safety"
              >
                I Understand — Start Chatting
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <VideoCallDialog
          open={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          recipientName={selectedConversation?.otherUser?.name || ""}
        />
        <ContractBuilder
          open={showContract}
          onClose={() => setShowContract(false)}
          onComplete={() => {}}
        />
      </div>
      <Footer />
    </AuthGuard>
  );
}
