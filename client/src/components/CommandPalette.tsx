import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, Briefcase, Users, BookOpen, MessageSquare, LayoutDashboard,
  Search, Settings, Trophy, HelpCircle, FileText, Star,
  ArrowUpRight, Loader2, Zap, Shield, Globe
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home, group: "Pages" },
  { label: "Find Work", href: "/jobs", icon: Briefcase, group: "Pages" },
  { label: "Find Talent", href: "/find-talent", icon: Users, group: "Pages" },
  { label: "Post a Job", href: "/post-job", icon: FileText, group: "Pages", auth: true },
  { label: "Messages", href: "/messages", icon: MessageSquare, group: "Pages", auth: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Pages", auth: true },
  { label: "Rewards", href: "/rewards", icon: Trophy, group: "Pages", auth: true },
  { label: "Academy", href: "/academy", icon: BookOpen, group: "Learn" },
  { label: "AI Brief Generator", href: "/jobs#ai-brief", icon: Zap, group: "Tools" },
  { label: "How to Hire", href: "/how-to-hire", icon: HelpCircle, group: "Learn" },
  { label: "How to Get Hired", href: "/how-to-get-hired", icon: Star, group: "Learn" },
  { label: "Background Checks", href: "/background-checks", icon: Shield, group: "Trust" },
  { label: "Global Jobs", href: "/jobs?country=all", icon: Globe, group: "Tools" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");

  const { data: searchResults, isLoading: isSearching } = useQuery<any>({
    queryKey: ["/api/command-search", query],
    queryFn: async () => {
      if (query.length < 2) return { freelancers: [], jobs: [] };
      const [fRes, jRes] = await Promise.all([
        fetch(`/api/cached/freelancers?query=${encodeURIComponent(query)}&limit=4`, { credentials: "include" }),
        fetch(`/api/aggregated-jobs?q=${encodeURIComponent(query)}&limit=4`, { credentials: "include" }),
      ]);
      const freelancers = fRes.ok ? await fRes.json() : [];
      const jobs = jRes.ok ? (await jRes.json()).jobs ?? [] : [];
      return { freelancers: freelancers.slice(0, 4), jobs: jobs.slice(0, 4) };
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });

  const go = useCallback((href: string) => {
    onOpenChange(false);
    setQuery("");
    setTimeout(() => navigate(href), 80);
  }, [navigate, onOpenChange]);

  const visibleNavItems = NAV_ITEMS.filter(item => !item.auth || isAuthenticated);
  const filtered = query.length < 1
    ? visibleNavItems
    : visibleNavItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.group.toLowerCase().includes(query.toLowerCase())
      );

  const groups = Array.from(new Set(filtered.map(i => i.group)));

  const freelancers: any[] = searchResults?.freelancers || [];
  const jobs: any[] = searchResults?.jobs || [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, jobs, freelancers…"
        value={query}
        onValueChange={setQuery}
        data-testid="input-command-palette"
      />
      <CommandList className="max-h-[520px]">
        <CommandEmpty>
          {isSearching
            ? <span className="flex items-center gap-2 justify-center py-2 text-muted-foreground text-sm"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…</span>
            : "No results found."}
        </CommandEmpty>

        {filtered.length > 0 && groups.map(group => (
          <CommandGroup key={group} heading={group}>
            {filtered.filter(i => i.group === group).map(item => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => go(item.href)}
                className="flex items-center gap-2 cursor-pointer"
                data-testid={`cmd-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {query.length >= 2 && (
          <>
            {jobs.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Jobs">
                  {jobs.map((job: any) => (
                    <CommandItem
                      key={job.id}
                      value={`job-${job.id}`}
                      onSelect={() => go(`/jobs?q=${encodeURIComponent(job.title)}`)}
                      className="flex items-center gap-2 cursor-pointer"
                      data-testid={`cmd-job-${job.id}`}
                    >
                      <Briefcase className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="block truncate text-sm">{job.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{job.company} · {job.location}</span>
                      </div>
                      <ArrowUpRight className="h-3 w-3 ml-auto text-muted-foreground flex-shrink-0" />
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="search-all-jobs"
                    onSelect={() => go(`/jobs?q=${encodeURIComponent(query)}`)}
                    className="flex items-center gap-2 cursor-pointer text-primary"
                    data-testid="cmd-search-all-jobs"
                  >
                    <Search className="h-4 w-4 flex-shrink-0" />
                    <span>Search all jobs for "<strong>{query}</strong>"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {freelancers.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Freelancers">
                  {freelancers.map((f: any) => (
                    <CommandItem
                      key={f.id}
                      value={`freelancer-${f.id}`}
                      onSelect={() => go(`/profile/${f.id}`)}
                      className="flex items-center gap-2 cursor-pointer"
                      data-testid={`cmd-freelancer-${f.id}`}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                        {(f.title || f.category || "?")[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-sm">{f.title || f.category}</span>
                        <span className="block truncate text-xs text-muted-foreground">{f.location}</span>
                      </div>
                      <ArrowUpRight className="h-3 w-3 ml-auto text-muted-foreground flex-shrink-0" />
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="search-all-talent"
                    onSelect={() => go(`/find-talent?q=${encodeURIComponent(query)}`)}
                    className="flex items-center gap-2 cursor-pointer text-primary"
                    data-testid="cmd-search-all-talent"
                  >
                    <Search className="h-4 w-4 flex-shrink-0" />
                    <span>Find all freelancers matching "<strong>{query}</strong>"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {jobs.length === 0 && freelancers.length === 0 && !isSearching && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Search">
                  <CommandItem
                    value="search-jobs-fallback"
                    onSelect={() => go(`/jobs?q=${encodeURIComponent(query)}`)}
                    className="cursor-pointer"
                    data-testid="cmd-search-jobs-fallback"
                  >
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    Search jobs for "<strong>{query}</strong>"
                  </CommandItem>
                  <CommandItem
                    value="search-talent-fallback"
                    onSelect={() => go(`/find-talent?q=${encodeURIComponent(query)}`)}
                    className="cursor-pointer"
                    data-testid="cmd-search-talent-fallback"
                  >
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    Find freelancers matching "<strong>{query}</strong>"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
