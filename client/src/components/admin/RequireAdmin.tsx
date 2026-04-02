import { useLocation } from "wouter";
import { Loader2, ShieldX, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import type { AdminPermission } from "@/types/admin";

interface RequireAdminProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
}

export function RequireAdmin({ children, requiredPermission }: RequireAdminProps) {
  const [, navigate] = useLocation();
  const freeMode = true;
  const { isLoading, isAuthenticated, isAdmin, permissions } = useAdminAuth();
  const currentPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/admin";

  if (freeMode) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <Card className="max-w-md w-full">
            <CardContent className="py-10 text-center space-y-4">
              <h2 className="text-2xl font-bold text-primary">Sign In Required</h2>
              <p className="text-muted-foreground">You need to sign in with an admin account to access this area.</p>
              <Button onClick={() => navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin || (requiredPermission && !permissions.includes(requiredPermission))) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <Card className="max-w-lg w-full border-destructive/30">
            <CardContent className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <ShieldX className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Your account does not have permission for this admin section.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
