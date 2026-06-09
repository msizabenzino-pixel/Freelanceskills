import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogIn, UserPlus, CheckCircle2, Zap, Shield } from "lucide-react";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  redirectPath?: string;
  context?: "apply" | "save" | "message" | "generic";
}

const CONTEXT_COPY = {
  apply: {
    heading: "Create a profile to apply",
    sub: "It takes about 30 seconds. Your application will be waiting for you right after.",
    icon: "🚀",
  },
  save: {
    heading: "Sign in to save this job",
    sub: "Create a free account to save jobs and get personalised matches.",
    icon: "💼",
  },
  message: {
    heading: "Sign in to send a message",
    sub: "Create a free account to contact clients and freelancers.",
    icon: "💬",
  },
  generic: {
    heading: "Sign in to continue",
    sub: "Create a free account or sign in to access this feature.",
    icon: "✨",
  },
};

export function AuthRequiredModal({
  open,
  onClose,
  redirectPath = "/jobs",
  context = "generic",
}: AuthRequiredModalProps) {
  const [, navigate] = useLocation();
  const copy = CONTEXT_COPY[context];
  const encoded = encodeURIComponent(redirectPath);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 text-white p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-6 text-center">
          <div className="text-4xl mb-2">{copy.icon}</div>
          <h2 className="text-xl font-bold text-white">{copy.heading}</h2>
          <p className="text-sm text-emerald-100 mt-1">{copy.sub}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5 space-y-3">
          {[
            { icon: <Zap className="w-4 h-4 text-emerald-400" />, text: "AI-powered job matching for your skills" },
            { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: "Track all your applications in one place" },
            { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "POPIA-compliant — your data is protected" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              {icon}
              <span className="text-sm text-slate-300">{text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 space-y-3">
          <Button
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl gap-2"
            onClick={() => {
              onClose();
              navigate(`/signup?redirect=${encoded}`);
            }}
            data-testid="button-auth-modal-signup"
          >
            <UserPlus className="w-4 h-4" />
            Create free account — 30 seconds
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-xl gap-2"
            onClick={() => {
              onClose();
              navigate(`/auth?redirect=${encoded}`);
            }}
            data-testid="button-auth-modal-login"
          >
            <LogIn className="w-4 h-4" />
            Sign in to existing account
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors pt-1"
            data-testid="button-auth-modal-dismiss"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
