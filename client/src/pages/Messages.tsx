import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoCallDialog } from "@/components/VideoCall";
import { ContractBuilder } from "@/components/ContractMilestones";
import { Search, MoreVertical, Phone, Video, Send, Paperclip, CheckCheck, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const conversations = [
  {
    id: 1,
    name: "Thabo M.",
    role: "Senior Electrician",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200",
    lastMessage: "I can be there by 2 PM tomorrow.",
    time: "10:30 AM",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Sarah L.",
    role: "Safety Officer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    lastMessage: "Here is the revised safety file.",
    time: "Yesterday",
    unread: 0,
    online: false
  },
  {
    id: 3,
    name: "Capitec Support",
    role: "Enterprise Client",
    avatar: "C",
    lastMessage: "Payment for Milestone 1 released.",
    time: "2 days ago",
    unread: 0,
    online: false
  }
];

const messages = [
  { id: 1, sender: "them", text: "Hi! I saw your job posting for the electrical rewiring.", time: "10:00 AM" },
  { id: 2, sender: "me", text: "Hi Thabo. Yes, we need someone for our Sandton office.", time: "10:05 AM" },
  { id: 3, sender: "them", text: "I have experience with commercial installations. Are the materials already on site?", time: "10:10 AM" },
  { id: 4, sender: "me", text: "Not yet. We need you to assess first.", time: "10:12 AM" },
  { id: 5, sender: "them", text: "Understood. I can be there by 2 PM tomorrow for a quote.", time: "10:30 AM" }
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [inputText, setInputText] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showContract, setShowContract] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex pt-20 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border bg-white flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold font-display text-primary mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search messages..." className="pl-9 bg-muted/30" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                    selectedChat.id === chat.id && "bg-accent/5 border-l-4 border-l-accent"
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-sm truncate">{chat.name}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{chat.time}</span>
                    </div>
                    <p className={cn(
                      "text-xs truncate",
                      chat.unread > 0 ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-accent text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {chat.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 relative hidden md:flex">
          {/* Chat Header */}
          <div className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedChat.avatar} />
                <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-sm">{selectedChat.name}</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {selectedChat.role} • <span className="text-green-600">Online</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button variant="ghost" size="icon" data-testid="button-phone-call"><Phone className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowVideoCall(true)} data-testid="button-video-call-message"><Video className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowContract(true)} data-testid="button-create-contract"><FileText className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex justify-center">
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">Today</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex gap-3 max-w-[80%]",
                  msg.sender === 'me' ? "ml-auto flex-row-reverse" : ""
                )}>
                  {msg.sender === 'them' && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.sender === 'me' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-foreground rounded-tl-none border border-border"
                  )}>
                    <p>{msg.text}</p>
                    <div className={cn(
                      "text-[10px] mt-1 flex justify-end items-center gap-1",
                      msg.sender === 'me' ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {msg.time}
                      {msg.sender === 'me' && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            <div className="bg-muted/30 border border-border rounded-xl flex items-end p-2 gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <textarea 
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2 text-sm"
                placeholder="Type a message..."
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button className="h-10 w-10 shrink-0 bg-primary text-white rounded-lg hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Keep conversations on FreelanceSkill for your protection.
            </p>
          </div>
        </div>
      </div>
      
      <VideoCallDialog 
        open={showVideoCall} 
        onClose={() => setShowVideoCall(false)}
        recipientName={selectedChat.name}
      />
      
      <ContractBuilder
        open={showContract}
        onClose={() => setShowContract(false)}
        onComplete={(contract) => console.log("Contract created:", contract)}
      />
    </div>
  );
}