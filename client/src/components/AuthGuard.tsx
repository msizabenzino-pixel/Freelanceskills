import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Loader2, Shield } from "lucide-react";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
  message?: string;
}

export function AuthGuard({ children, message = "You need to sign in to access this page." }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full" data-testid="auth-guard-card">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button
                size="lg"
                className="gap-2 font-bold"
                onClick={() => navigate("/auth")}
                data-testid="button-sign-in"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
