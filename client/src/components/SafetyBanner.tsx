import { useState } from "react";
import { Shield, AlertTriangle, X, Lock, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SafetyBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("safetyBannerDismissed") === "true";
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("safetyBannerDismissed", "true");
  };

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Stay Safe:</strong> Never share bank details or pay outside FreelanceSkills. 
            <SafetyDialog>
              <button className="underline ml-1 hover:text-amber-900">Learn more about our protection</button>
            </SafetyDialog>
          </p>
        </div>
        <button onClick={handleDismiss} className="text-amber-600 hover:text-amber-800">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SafetyDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            FreelanceSkills Trust & Safety
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <section>
            <h3 className="font-semibold flex items-center gap-2 text-lg mb-3">
              <Lock className="h-5 w-5 text-green-600" />
              Your Payment Protection
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-green-800">When you book through FreelanceSkills:</p>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Your payment is held securely in escrow
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Funds are only released when you confirm completion
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Access to our dispute resolution team
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Full transaction history for your records
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold flex items-center gap-2 text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Off-Platform Warning
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                Deals made outside FreelanceSkills are NOT protected:
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4">
                <li>• We cannot help recover payments made off-platform</li>
                <li>• You lose access to dispute resolution</li>
                <li>• No refund protection available</li>
                <li>• Both parties risk being permanently banned</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold flex items-center gap-2 text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Never Do This
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <ul className="text-sm text-amber-800 space-y-2">
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  Pay before work is completed and approved
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  Share bank account or card details in messages
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  Click suspicious links or download unknown files
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  Move communication to WhatsApp, email, or phone
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  Pay with gift cards, crypto, or wire transfers
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold flex items-center gap-2 text-lg mb-3">
              <Info className="h-5 w-5 text-blue-600" />
              How to Stay Safe
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-800 mb-2">For Clients:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Verify freelancer reviews and history</li>
                  <li>• Use escrow - never pay directly</li>
                  <li>• Set clear milestones and deliverables</li>
                  <li>• Report suspicious requests immediately</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-800 mb-2">For Freelancers:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Never start without platform confirmation</li>
                  <li>• Document all work with evidence</li>
                  <li>• Use milestones for large projects</li>
                  <li>• Report clients requesting direct pay</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="bg-slate-100 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600">
              <strong>Disclaimer:</strong> FreelanceSkills is not responsible for transactions, agreements, 
              or payments made outside our platform. For your protection, always use our secure 
              booking and payment system.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TrustBadge({ type }: { type: 'verified' | 'pro' | 'topRated' | 'backgroundChecked' }) {
  const badges = {
    verified: { icon: CheckCircle, label: "Verified", color: "text-green-600 bg-green-50" },
    pro: { icon: Shield, label: "Pro", color: "text-amber-600 bg-amber-50" },
    topRated: { icon: Shield, label: "Top Rated", color: "text-blue-600 bg-blue-50" },
    backgroundChecked: { icon: Shield, label: "Background Checked", color: "text-purple-600 bg-purple-50" },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
      <Icon className="h-3 w-3" />
      {badge.label}
    </span>
  );
}
