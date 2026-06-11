import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { MessageCircle, Check, Bell, DollarSign, Package, ShieldCheck, Trophy, Mail, Wallet } from "lucide-react";

const TEMPLATES = [
  {
    id: "proposal_received",
    name: "Proposal Received",
    desc: "When a freelancer submits a proposal",
    icon: Mail,
    example: "📝 New proposal from Thabo M. for \"Website Design\" - R5,500. Tap to review.",
    enabled: true,
  },
  {
    id: "proposal_accepted",
    name: "Proposal Accepted",
    desc: "When your proposal is accepted",
    icon: Check,
    example: "✅ Your proposal for \"Logo Design\" was ACCEPTED! Project starts now.",
    enabled: true,
  },
  {
    id: "payment_released",
    name: "Payment Released",
    desc: "When escrow payment is released",
    icon: DollarSign,
    example: "💰 R3,500 released to your account! Funds available for withdrawal.",
    enabled: true,
  },
  {
    id: "delivery",
    name: "Delivery Complete",
    desc: "When work is delivered",
    icon: Package,
    example: "📦 Your freelancer delivered \"Website\"! Review and approve.",
    enabled: true,
  },
  {
    id: "dispute",
    name: "Dispute Alert",
    desc: "When a dispute is opened",
    icon: ShieldCheck,
    example: "⚠️ A dispute was opened on your project. Our team is reviewing.",
    enabled: true,
  },
  {
    id: "level_up",
    name: "Level Up",
    desc: "When you reach a new seller level",
    icon: Trophy,
    example: "🎉 Congratulations! You reached Level 2! More benefits unlocked.",
    enabled: true,
  },
  {
    id: "new_message",
    name: "New Message",
    desc: "When you receive a new message",
    icon: MessageCircle,
    example: "💬 New message from Sarah K.: \"Can you start tomorrow?\"",
    enabled: false,
  },
  {
    id: "weekly_earnings",
    name: "Weekly Earnings",
    desc: "Weekly earnings summary",
    icon: Wallet,
    example: "📈 Your weekly earnings: R12,400. 3 projects completed. Keep it up!",
    enabled: false,
  },
];

export default function WhatsAppNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [phone, setPhone] = useState("");

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-lg">
            <h1 className="text-2xl font-bold text-white mb-2">WhatsApp Notifications</h1>
            <p className="text-sm text-slate-500 mb-6">Get real-time updates via WhatsApp</p>

            {/* Enable Toggle */}
            <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">WhatsApp Notifications</h2>
                  <p className="text-sm text-slate-500">Receive alerts on your phone</p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </Card>

            {/* Phone Number */}
            {enabled && (
              <Card className="bg-slate-900 border-slate-800 p-6 mb-6">
                <label className="text-sm font-semibold text-white mb-2 block">WhatsApp Number</label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-400 border border-slate-700">+27</span>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="82 123 4567"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <Button className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" disabled={phone.length < 9}>
                  Verify Number
                </Button>
              </Card>
            )}

            {/* Templates */}
            {enabled && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white mb-2">Notification Types</h2>
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Card key={t.id} className="bg-slate-900 border-slate-800 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">{t.name}</div>
                            <Switch
                              checked={t.enabled}
                              onCheckedChange={() => toggleTemplate(t.id)}
                              className="scale-75"
                            />
                          </div>
                          <div className="text-xs text-slate-500 mb-2">{t.desc}</div>
                          <div className="text-xs text-slate-400 bg-slate-800 rounded-lg p-2 border border-slate-700">
                            {t.example}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
