import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoCallDialog } from "@/components/VideoCall";
import { ContractBuilder } from "@/components/ContractMilestones";
import { Search, MoreVertical, Phone, Video, Send, Paperclip, CheckCheck, ShieldCheck, FileText, Shield, X, AlertTriangle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { io, Socket } from "socket.io-client";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showSafetyPopup, setShowSafetyPopup] = useState(() => {
    return localStorage.getItem("messageSafetyShown") !== "true";
  });
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
  });

  const selectedConversation = conversations.find((c: any) => c.id === selectedConversationId);

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<any[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  useEffect(() => {
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user) {
        socket.emit("authenticate", user.id);
      }
    });

    socket.on("user_online", (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user_offline", (userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("new_message", (message: any) => {
      queryClient.setQueryData(["/api/conversations", message.conversationId, "messages"], (old: any[] | undefined) => {
        if (!old) return [message];
        if (old.some(m => m.id === message.id)) return old;
        return [...old, message];
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    });

    socket.on("typing", (data: { conversationId: string, userId: string }) => {
      if (data.conversationId === selectedConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
      }
    });

    socket.on("stop_typing", (data: { conversationId: string, userId: string }) => {
      if (data.conversationId === selectedConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
      }
    });

    return () => {
      socket.disconnect();
    };
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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: (newMessage) => {
      setInputText("");
      // Socket will broadcast the new message, but we can also update locally for better UX
      // Though the socket listener handles it already.
      if (socketRef.current && selectedConversationId) {
        socketRef.current.emit("stop_typing", { conversationId: selectedConversationId, userId: user?.id });
      }
    },
  });

  const handleSendMessage = () => {
    if (!inputText.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(inputText);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (socketRef.current && selectedConversationId && user) {
      socketRef.current.emit("typing", { conversationId: selectedConversationId, userId: user.id });
      
      // Debounced stop typing would be better, but simple for now
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stop_typing", { conversationId: selectedConversationId, userId: user.id });
        }
      }, 3000);
    }
  };

  const dismissSafetyPopup = () => {
    setShowSafetyPopup(false);
    localStorage.setItem("messageSafetyShown", "true");
  };

  return (
    <AuthGuard message="Sign in to view and send messages to freelancers and clients.">
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main id="main-content" className="flex-1 flex pt-24 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold font-display text-primary mb-4" data-testid="text-messages-title">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search messages..." className="pl-9 bg-muted/30" data-testid="input-search-messages" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {isLoadingConversations ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b border-border animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center" data-testid="empty-conversations">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-sm text-muted-foreground">No messages yet. Start a conversation from a freelancer's profile.</p>
                </div>
              ) : (
                conversations.map((chat: any) => (
                  <button
                    key={chat.id}
                    data-testid={`button-chat-item-${chat.id}`}
                    onClick={() => setSelectedConversationId(chat.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                      selectedConversationId === chat.id && "bg-accent/5 border-l-4 border-l-accent"
                    )}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chat.otherUser.avatar} />
                        <AvatarFallback>{chat.otherUser.name[0]}</AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(chat.otherUser.id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-sm truncate">{chat.otherUser.name}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), "p") : ""}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        chat.unreadCount > 0 ? "text-primary font-bold" : "text-muted-foreground"
                      )}>
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-accent text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted relative hidden md:flex">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                    <AvatarFallback>{selectedConversation.otherUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sm">{selectedConversation.otherUser.name}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {selectedConversation.otherUser.role} • 
                      {onlineUsers.has(selectedConversation.otherUser.id) ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        <span className="text-muted-foreground">Offline</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Button variant="ghost" size="icon" data-testid="button-phone-call"><Phone className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowVideoCall(true)} data-testid="button-video-call-message"><Video className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowContract(true)} data-testid="button-create-contract"><FileText className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" data-testid="button-more-options"><MoreVertical className="w-5 h-5" /></Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">Today</span>
                  </div>

                  {/* Safety System Message */}
                  <div className="flex justify-center" data-testid="safety-message">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-800 text-sm">Stay Protected</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Keep all communication on FreelanceSkills. Never share bank details or pay outside the platform. 
                        Your payments are protected by escrow.
                      </p>
                    </div>
                  </div>
                  
                  {isLoadingMessages ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <>
                      {messages.map((msg: any) => (
                        <div key={msg.id} 
                          data-testid={`message-item-${msg.id}`}
                          className={cn(
                          "flex gap-3 max-w-[80%]",
                          msg.senderId === user?.id ? "ml-auto flex-row-reverse" : ""
                        )}>
                          {msg.senderId !== user?.id && (
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarImage src={selectedConversation.otherUser.avatar} />
                              <AvatarFallback>{selectedConversation.otherUser.name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={cn(
                            "p-3 rounded-2xl text-sm shadow-sm",
                            msg.senderId === user?.id 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-card text-foreground rounded-tl-none border border-border"
                          )}>
                            <p>{msg.content}</p>
                            <div className={cn(
                              "text-[10px] mt-1 flex justify-end items-center gap-1",
                              msg.senderId === user?.id ? "text-white/70" : "text-muted-foreground"
                            )}>
                              {msg.createdAt ? format(new Date(msg.createdAt), "p") : ""}
                              {msg.senderId === user?.id && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      ))}
                      {typingUsers[selectedConversation.otherUser.id] && (
                        <div className="flex gap-3 max-w-[80%] items-center">
                           <Avatar className="w-8 h-8">
                            <AvatarImage src={selectedConversation.otherUser.avatar} />
                            <AvatarFallback>{selectedConversation.otherUser.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted px-3 py-2 rounded-2xl text-xs text-muted-foreground animate-pulse">
                            {selectedConversation.otherUser.name} is typing...
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-card border-t border-border">
                <div className="bg-muted/30 border border-border rounded-xl flex items-end p-2 gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 shrink-0" data-testid="button-attach-file">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <textarea 
                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2 text-sm"
                    placeholder="Type a message..."
                    rows={1}
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="textarea-message-input"
                  />
                  <Button 
                    className="h-10 w-10 shrink-0 bg-primary text-white rounded-lg hover:bg-primary/90" 
                    data-testid="button-send-message"
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Keep conversations on FreelanceSkills for your protection.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <VideoCallDialog 
        open={showVideoCall} 
        onClose={() => setShowVideoCall(false)}
        recipientName={selectedConversation?.otherUser.name || ""}
      />
      
      <ContractBuilder
        open={showContract}
        onClose={() => setShowContract(false)}
        onComplete={(contract) => console.log("Contract created:", contract)}
      />

      {/* Safety Popup on First Visit */}
      <Dialog open={showSafetyPopup} onOpenChange={setShowSafetyPopup}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-6 w-6 text-primary" />
              Stay Safe on FreelanceSkills
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-800 mb-2 text-sm">Your payments are protected:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Funds held in secure escrow
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Released only after you approve
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Full dispute resolution support
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800 mb-2 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Never do this:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" /> Share bank details in messages
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" /> Pay outside the platform
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4" /> Move to WhatsApp/email to avoid fees
                </li>
              </ul>
            </div>

            <Button onClick={dismissSafetyPopup} className="w-full">
              I Understand - Start Chatting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AuthGuard>
  );
}
