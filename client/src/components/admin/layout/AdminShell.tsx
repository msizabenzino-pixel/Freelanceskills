import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Bell, ChevronRight, Command, LogOut, Menu, Search, Settings, ShieldCheck, UserCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ADMIN_MODULES, hasPermission } from "@/lib/admin/permissions";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

function labelFromPath(path: string) {
  return path
    .replace("/admin", "")
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replaceAll("-", " "));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { identity, permissions, user, role } = useAdminAuth();
  const { toast } = useToast();

  const navItems = useMemo(
    () => ADMIN_MODULES.filter((item) => hasPermission(permissions, item.readPermission)),
    [permissions]
  );

  const filteredNavItems = useMemo(() => {
    if (!search.trim()) return navItems;
    const q = search.trim().toLowerCase();
    return navItems.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(q));
  }, [navItems, search]);

  const crumbs = labelFromPath(location);

  const Sidebar = (
    <aside className="w-72 shrink-0 bg-primary text-primary-foreground border-r border-primary/30 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-white/10">
        <button className="text-left" onClick={() => navigate("/admin/overview")}>
          <p className="text-lg font-bold tracking-tight">FreelanceSkills Admin</p>
          <p className="text-xs text-white/70">Operations Command Center</p>
        </button>
      </div>

      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules"
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <button
                key={item.key}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={
                  "w-full text-left px-3 py-2.5 rounded-lg transition-colors " +
                  (isActive
                    ? "bg-white text-primary font-semibold"
                    : "text-white/90 hover:bg-white/10")
                }
              >
                <p className="text-sm">{item.title}</p>
                <p className={"text-xs " + (isActive ? "text-primary/80" : "text-white/60")}>{item.description}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Role</span>
          <Badge className="bg-white/15 text-white border-white/20">{role || "analyst"}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Account</span>
          <span className="text-xs text-white/90 truncate max-w-[160px]">{identity?.displayName || user?.email || "admin"}</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex h-screen sticky top-0">{Sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-80 max-w-[92vw]">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-4 md:px-6 h-16 flex items-center gap-3">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
                {crumbs.map((crumb, index) => (
                  <span key={`${crumb}-${index}`} className="inline-flex items-center gap-1 capitalize">
                    <ChevronRight className="w-3 h-3" />
                    {crumb}
                  </span>
                ))}
              </div>
              <p className="font-semibold truncate">Platform Management Console</p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate("/admin/mission-control");
                  toast({
                    title: "Quick Action",
                    description: "Opened Mission Control for high-priority operations.",
                  });
                }}
              >
                <Command className="w-4 h-4 mr-2" />
                Quick Action
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigate("/admin/notifications");
                  toast({
                    title: "Notifications",
                    description: "Opened admin notifications center.",
                  });
                }}
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigate("/admin/system-settings");
                  toast({
                    title: "System Settings",
                    description: "Opened platform settings.",
                  });
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <UserCircle2 className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">{identity?.displayName || user?.email || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Session</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>User Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/system-settings")}>System Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")}>Public Site</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")}><LogOut className="w-4 h-4 mr-2" />Exit Admin</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
