import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
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
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-2xl animate-in slide-in-from-bottom-full duration-500"
      data-testid="banner-cookie-consent"
    >
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <Link href="/privacy">
            <a className="text-primary hover:underline font-medium" data-testid="link-cookie-policy">
              Cookie Policy
            </a>
          </Link>
          .
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 md:flex-none"
            onClick={handleDecline}
            data-testid="button-decline-cookies"
          >
            Decline
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 md:flex-none"
            onClick={handleAccept}
            data-testid="button-accept-cookies"
          >
            Accept
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex" 
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
