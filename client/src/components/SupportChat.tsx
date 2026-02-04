import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone,
  HelpCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  Loader2,
  ExternalLink
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  options?: { label: string; value: string; icon?: any }[];
}

const SUPPORT_CATEGORIES = [
  { 
    id: "profile", 
    label: "Profile & Account Help", 
    icon: FileText,
    description: "Creating or updating your profile",
    color: "bg-blue-500"
  },
  { 
    id: "query", 
    label: "General Questions", 
    icon: HelpCircle,
    description: "How things work, pricing, etc.",
    color: "bg-green-500"
  },
  { 
    id: "complaint", 
    label: "Report a Problem", 
    icon: AlertCircle,
    description: "Issues with orders, payments, or users",
    color: "bg-amber-500"
  },
];

const AI_RESPONSES: Record<string, { message: string; followUp?: string[] }> = {
  profile: {
    message: "I can help you with your profile! Here are some common questions:",
    followUp: [
      "How do I create a profile?",
      "How do I upload my CV?",
      "How do I get verified?",
      "I need help from a human"
    ]
  },
  query: {
    message: "Happy to answer your questions! What would you like to know?",
    followUp: [
      "How does payment work?",
      "What are the fees?",
      "How do I book a tasker?",
      "Talk to support team"
    ]
  },
  complaint: {
    message: "I'm sorry you're experiencing an issue. Let me help you:",
    followUp: [
      "Problem with a freelancer",
      "Payment issue",
      "Someone asked for off-platform payment",
      "Speak to a human now"
    ]
  },
  "How do I create a profile?": {
    message: "Creating a profile is easy! You can:\n\n1. **Sign up** using the button at the top right\n2. **Upload your CV** and our AI will create your profile automatically\n3. **Or fill it out manually** - add your skills, experience, and a photo\n\nWould you like me to guide you through the AI profile builder?"
  },
  "How do I upload my CV?": {
    message: "Great question! To use our AI Profile Builder:\n\n1. Go to **Dashboard > Create Profile**\n2. Click **\"Upload CV\"** button\n3. Select your CV (PDF or Word)\n4. Our AI reads it and creates your profile\n5. Review and approve or edit\n\nIt takes about 30 seconds!"
  },
  "How do I get verified?": {
    message: "Getting verified builds trust with clients! Here's how:\n\n**Basic Verification** (Free):\n- Verify your email and phone\n\n**Full Verification** (Recommended):\n- Upload your ID document\n- Add qualifications/certificates\n- Professional body registration (if applicable)\n\nVerified profiles get 3x more bookings!"
  },
  "How does payment work?": {
    message: "We use a secure **escrow system** to protect both parties:\n\n1. Client pays when booking\n2. Money is held safely by us\n3. Freelancer completes the work\n4. Client approves the work\n5. Payment released to freelancer\n\nNo one can run off with the money!"
  },
  "What are the fees?": {
    message: "Our pricing is simple:\n\n**Free Plan:**\n- No monthly fees\n- 10% commission on completed jobs\n\n**Pro Plan:**\n- Only 5% commission\n- Priority in search results\n- Pro badge on profile\n\nYou only pay when you earn!"
  },
  "How do I book a tasker?": {
    message: "Booking is quick and easy:\n\n1. Browse **Services** or search for what you need\n2. View profiles and reviews\n3. Click **Book Now** on a service package\n4. Choose date/time and pay securely\n5. Get confirmation and chat with your tasker\n\nNeed same-day service? Filter by 'Available Today'!"
  },
};

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (content: string, options?: Message["options"]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content,
        options
      }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
    
    const category = SUPPORT_CATEGORIES.find(c => c.id === categoryId);
    setMessages([{
      id: "1",
      type: "user",
      content: category?.label || categoryId
    }]);

    const response = AI_RESPONSES[categoryId];
    if (response) {
      addBotMessage(response.message, response.followUp?.map(q => ({ label: q, value: q })));
    }
  };

  const handleOptionClick = (value: string) => {
    if (value.toLowerCase().includes("human") || value.toLowerCase().includes("support team") || value.toLowerCase().includes("speak to")) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", content: value }]);
      addBotMessage("I'll connect you with our support team right away! You can:\n\n📱 **WhatsApp:** +27 60 123 4567\n📧 **Email:** support@freelanceskill.co.za\n📞 **Call:** 0800 123 456 (Free)\n\nOur team is available:\n🕐 Mon-Fri: 8am - 8pm\n🕐 Sat-Sun: 9am - 5pm\n\nAverage response time: **< 5 minutes** on WhatsApp!");
      return;
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", content: value }]);
    
    const response = AI_RESPONSES[value];
    if (response) {
      addBotMessage(response.message);
    } else {
      addBotMessage("Let me find that information for you... \n\nIf you'd prefer to speak with a human, our team is ready to help on WhatsApp: +27 60 123 4567");
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content: inputValue
    }]);
    
    const query = inputValue.toLowerCase();
    setInputValue("");

    // Simple AI matching
    if (query.includes("profile") || query.includes("cv") || query.includes("account")) {
      addBotMessage("For profile help, I can assist with:\n\n• Creating a new profile\n• Uploading your CV for AI profile generation\n• Getting verified\n• Updating your information\n\nWhat would you like help with specifically?");
    } else if (query.includes("pay") || query.includes("money") || query.includes("fee") || query.includes("commission")) {
      addBotMessage(AI_RESPONSES["How does payment work?"].message);
    } else if (query.includes("human") || query.includes("person") || query.includes("agent") || query.includes("support")) {
      addBotMessage("I'll connect you with our support team! 🙋\n\n📱 **WhatsApp (Fastest):** +27 60 123 4567\n📧 **Email:** support@freelanceskill.co.za\n📞 **Call:** 0800 123 456\n\nOur team typically responds within 5 minutes on WhatsApp!");
    } else {
      addBotMessage("Thanks for your question! Let me help you with that.\n\nIf I can't fully answer your question, our support team is available on WhatsApp: **+27 60 123 4567**\n\nThey're friendly and quick to respond! 😊");
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowCategories(true);
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        data-testid="button-support-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">FreelanceSkills Support</h3>
                <p className="text-xs text-white/80">We typically reply instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {showCategories ? (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm">
                    👋 Hi there! I'm your AI assistant. How can I help you today?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">Choose a category:</p>
                <div className="space-y-2">
                  {SUPPORT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 text-left"
                      data-testid={`button-category-${cat.id}`}
                    >
                      <div className={`w-10 h-10 ${cat.color} rounded-full flex items-center justify-center text-white`}>
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-center text-muted-foreground mb-2">Or contact us directly:</p>
                  <a 
                    href="https://wa.me/27601234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">WhatsApp Us</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${
                      msg.type === "user" 
                        ? "bg-primary text-white rounded-2xl rounded-br-sm" 
                        : "bg-white shadow-sm rounded-2xl rounded-bl-sm"
                    } p-3`}>
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      {msg.options && (
                        <div className="mt-3 space-y-2">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt.value)}
                              className="w-full text-left text-sm px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {!showCategories && (
            <div className="p-3 border-t bg-white">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={resetChat}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  ← Start over
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
