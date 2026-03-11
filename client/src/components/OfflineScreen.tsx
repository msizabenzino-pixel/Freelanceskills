import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineScreen() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mb-6 rounded-full bg-muted p-4">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">No connection</h2>
      <p className="mb-8 text-muted-foreground">
        You're currently offline. Some features may be limited, but you can still browse cached jobs.
      </p>
      <Button 
        onClick={() => window.location.reload()} 
        className="flex items-center gap-2"
        data-testid="button-retry-connection"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry Connection
      </Button>
    </div>
  );
}
