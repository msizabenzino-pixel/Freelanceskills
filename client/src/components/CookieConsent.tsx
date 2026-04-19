import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom-2 duration-300"
      data-testid="banner-cookie-consent"
    >
      <div className="container mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400 leading-none">
          We use cookies to improve your experience.{" "}
          <Link href="/privacy">
            <a className="text-emerald-400 hover:underline font-medium" data-testid="link-cookie-policy">
              Cookie Policy
            </a>
          </Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            data-testid="button-decline-cookies"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            data-testid="button-accept-cookies"
          >
            Accept
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
