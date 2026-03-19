/**
 * CMS Management Department — client/src/pages/CmsManagement.tsx
 * Section 25 — FreelanceSkills.net
 * 200% Elon Musk Intelligence | Beats Webflow + Sanity + Strapi + Builder.io until 2030
 * 6 Tabs: Pages Library · Visual Builder · AI Assistant · Version History · SEO & Publishing · Component Library
 */
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CmsPage {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  status: string;
  content: any[];
  metadata: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  language: string;
  isABTest: boolean;
  abVariant?: string;
  scheduledAt?: string;
  publishedAt?: string;
  viewCount: number;
  wordCount: number;
  readingTimeMins: number;
  ussdVersion?: string;
  translations: any;
  createdAt: string;
  updatedAt: string;
}

interface CmsBlock {
  id: string;
  name: string;
  category: string;
  blockType: string;
  description?: string;
  isBuiltIn: boolean;
  isGlobal: boolean;
  usageCount: number;
  tags?: string[];
}

interface CmsVersion {
  id: string;
  pageId: string;
  version: number;
  title?: string;
  content?: any[];
  status?: string;
  changedBy?: string;
  changeNote?: string;
  diffSummary?: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "published") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (status === "scheduled") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  if (status === "archived") return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
}

function pageTypeIcon(type: string) {
  const icons: Record<string, string> = {
    homepage: "🏠", about: "ℹ️", terms: "📜", privacy: "🔒",
    faq: "❓", help: "🆘", blog: "📰", careers: "💼",
    landing: "🚀", footer: "🦶", custom: "📄",
  };
  return icons[type] || "📄";
}

function langFlag(lang: string) {
  const flags: Record<string, string> = {
    en: "🇬🇧", af: "🇿🇦", zu: "🇿🇦", xh: "🇿🇦",
    sw: "🇰🇪", yo: "🇳🇬", ha: "🇳🇬", am: "🇪🇹",
    so: "🇸🇴", fr: "🇫🇷", pt: "🇵🇹",
  };
  return flags[lang] || "🌍";
}

const BLOCK_CATEGORIES = ["all", "hero", "content", "cta", "trust", "pricing", "faq", "media", "africa", "footer"];
const PAGE_TYPES = ["custom", "homepage", "about", "terms", "privacy", "faq", "help", "blog", "careers", "landing", "footer"];
const LANGUAGES = [
  { code: "en", name: "English" }, { code: "af", name: "Afrikaans" },
  { code: "zu", name: "Zulu (isiZulu)" }, { code: "xh", name: "Xhosa (isiXhosa)" },
  { code: "sw", name: "Swahili" }, { code: "yo", name: "Yoruba" },
  { code: "ha", name: "Hausa" }, { code: "am", name: "Amharic" },
  { code: "so", name: "Somali" }, { code: "fr", name: "French" },
];

const BLOCK_TYPE_COLORS: Record<string, string> = {
  hero: "violet", content: "blue", cta: "orange", trust: "green",
  pricing: "yellow", faq: "pink", media: "cyan", africa: "emerald",
  footer: "zinc",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── TAB 1: Pages Library ─────────────────────────────────────────────────────
function PagesLibraryTab({ onEditPage }: { onEditPage: (page: CmsPage) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "", pageType: "custom", language: "en" });

  const { data: pagesData, isLoading } = useQuery({
    queryKey: ["/api/cms/pages", filterStatus, filterType],
    queryFn: () => apiRequest("GET", `/api/cms/pages?status=${filterStatus}&type=${filterType}&limit=100`).then(r => r.json()),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/cms/stats"],
    queryFn: () => apiRequest("GET", "/api/cms/stats").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cms/pages", data).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      qc.invalidateQueries({ queryKey: ["/api/cms/stats"] });
      setShowNewPage(false);
      setNewPage({ title: "", slug: "", pageType: "custom", language: "en" });
      toast({ title: "Page created", description: "New page added as draft" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/cms/pages/${id}/publish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published!" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/pages/${id}`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Page moved to trash" }); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/cms/pages/${id}/duplicate`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Duplicated as draft" }); },
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cms/seed-defaults").then(r => r.json()),
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      qc.invalidateQueries({ queryKey: ["/api/cms/stats"] });
      toast({ title: "Seeded!", description: d.message });
    },
  });

  const pages: CmsPage[] = pagesData?.pages || [];
  const filtered = pages.filter(p =>
    (search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAutoSlug = (title: string) => {
    setNewPage(prev => ({ ...prev, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Pages" value={stats?.totalPages ?? "—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="Published" value={stats?.published ?? "—"} color="bg-emerald-950/60 border-emerald-700/40 text-emerald-200" />
        <StatCard label="Drafts" value={stats?.drafts ?? "—"} color="bg-amber-950/60 border-amber-700/40 text-amber-200" />
        <StatCard label="Scheduled" value={stats?.scheduled ?? "—"} color="bg-blue-950/60 border-blue-700/40 text-blue-200" />
        <StatCard label="Blocks" value={stats?.totalBlocks ?? "—"} color="bg-violet-950/60 border-violet-700/40 text-violet-200" />
        <StatCard label="Versions" value={stats?.totalVersions ?? "—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input
            data-testid="input-cms-search"
            placeholder="Search pages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 w-52"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              {["all", "published", "draft", "scheduled", "archived"].map(s => (
                <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectItem value="all">All Types</SelectItem>
              {PAGE_TYPES.map(t => (
                <SelectItem key={t} value={t}>{pageTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button data-testid="button-seed-defaults" variant="outline" size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="border-zinc-600 text-zinc-300">
            {seedMutation.isPending ? "Seeding…" : "🌱 Seed Defaults"}
          </Button>
          <Button data-testid="button-new-page" size="sm" onClick={() => setShowNewPage(true)} className="bg-violet-600 hover:bg-violet-700">
            + New Page
          </Button>
        </div>
      </div>

      {/* Pages table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading pages…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-4xl mb-3">📄</div>
          <div>No pages yet. Click "Seed Defaults" to add the standard pages or create one manually.</div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Page</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Lang</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Words</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Views</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Updated</th>
                <th className="text-center px-4 py-3 text-zinc-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page, i) => (
                <tr key={page.id} data-testid={`row-cms-page-${page.id}`} className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${i % 2 === 0 ? "bg-zinc-900/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100">{page.title}</div>
                    <div className="text-zinc-500 text-xs">/{page.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {pageTypeIcon(page.pageType)} <span className="capitalize">{page.pageType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${statusColor(page.status)}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{langFlag(page.language)} {page.language.toUpperCase()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{page.wordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{page.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-500 text-xs">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <Button data-testid={`button-edit-page-${page.id}`} size="sm" variant="outline" onClick={() => onEditPage(page)} className="border-zinc-600 text-zinc-300 h-7 text-xs">✏️ Edit</Button>
                      {page.status !== "published" && (
                        <Button data-testid={`button-publish-page-${page.id}`} size="sm" onClick={() => publishMutation.mutate(page.id)} className="bg-emerald-700 hover:bg-emerald-600 h-7 text-xs" disabled={publishMutation.isPending}>🚀 Publish</Button>
                      )}
                      <Button data-testid={`button-duplicate-page-${page.id}`} size="sm" variant="ghost" onClick={() => duplicateMutation.mutate(page.id)} className="text-zinc-400 h-7 text-xs">⧉</Button>
                      <Button data-testid={`button-delete-page-${page.id}`} size="sm" variant="ghost" onClick={() => deleteMutation.mutate(page.id)} className="text-red-500 hover:text-red-400 h-7 text-xs">🗑</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Page Dialog */}
      <Dialog open={showNewPage} onOpenChange={setShowNewPage}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-zinc-300">Page Title *</Label>
              <Input data-testid="input-new-page-title" value={newPage.title} onChange={e => handleAutoSlug(e.target.value)} placeholder="Homepage" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-300">URL Slug *</Label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-zinc-500 text-sm">/</span>
                <Input data-testid="input-new-page-slug" value={newPage.slug} onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))} placeholder="homepage" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300">Page Type</Label>
                <Select value={newPage.pageType} onValueChange={v => setNewPage(p => ({ ...p, pageType: v }))}>
                  <SelectTrigger data-testid="select-new-page-type" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{pageTypeIcon(t)} {t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Language</Label>
                <Select value={newPage.language} onValueChange={v => setNewPage(p => ({ ...p, language: v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewPage(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-create-page-confirm" onClick={() => createMutation.mutate(newPage)} disabled={createMutation.isPending || !newPage.title || !newPage.slug} className="bg-violet-600 hover:bg-violet-700">
                {createMutation.isPending ? "Creating…" : "Create Page"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 2: Visual Builder ────────────────────────────────────────────────────
function VisualBuilderTab({ page, onClose }: { page: CmsPage | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (page) setSections(Array.isArray(page.content) ? page.content : []);
  }, [page?.id]);

  const { data: blocksData } = useQuery({
    queryKey: ["/api/cms/blocks"],
    queryFn: () => apiRequest("GET", "/api/cms/blocks").then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/cms/pages/${page!.id}`, data).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Saved ✓" }); },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/publish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published 🚀", description: "Page is now live" }); },
  });

  const addBlock = (block: CmsBlock) => {
    const newSection = {
      id: `sec_${Date.now()}`,
      type: block.blockType,
      name: block.name,
      category: block.category,
      order: sections.length,
      data: { headline: "Edit this headline", body: "Edit this body text", cta: "Get Started" },
    };
    setSections(prev => [...prev, newSection]);
    setShowBlockPicker(false);
    setActiveSection(newSection.id);
  };

  const removeSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setSections(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  };
  const moveDown = (idx: number) => {
    setSections(prev => {
      if (idx >= prev.length - 1) return prev;
      const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n;
    });
  };
  const updateSectionData = (id: string, field: string, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, data: { ...s.data, [field]: value } } : s));
  };

  const blocks: CmsBlock[] = blocksData?.blocks || [];

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <div className="text-5xl mb-4">🏗️</div>
        <div className="text-lg font-medium">No page selected</div>
        <div className="text-sm mt-2">Go to Pages Library and click "Edit" on a page</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Left: section list */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-zinc-100 text-sm truncate">{page.title}</div>
            <div className="text-xs text-zinc-500">/{page.slug}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-zinc-400 h-7 text-xs">✕</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {sections.length === 0 && (
            <div className="text-center py-8 text-zinc-600 text-xs">No sections yet. Add your first block below.</div>
          )}
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              data-testid={`section-item-${sec.id}`}
              onClick={() => setActiveSection(sec.id)}
              className={`rounded-lg border p-2.5 cursor-pointer transition-all ${activeSection === sec.id ? "border-violet-500 bg-violet-950/40" : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-zinc-100">{sec.name}</div>
                  <div className="text-xs text-zinc-500">{sec.category}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); moveUp(idx); }} className="text-zinc-500 hover:text-zinc-200 text-xs px-1">▲</button>
                  <button onClick={e => { e.stopPropagation(); moveDown(idx); }} className="text-zinc-500 hover:text-zinc-200 text-xs px-1">▼</button>
                  <button onClick={e => { e.stopPropagation(); removeSection(sec.id); }} className="text-red-500 hover:text-red-400 text-xs px-1">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-zinc-700 space-y-1.5">
          <Button data-testid="button-add-block" size="sm" className="w-full bg-violet-700 hover:bg-violet-600 text-xs" onClick={() => setShowBlockPicker(true)}>
            + Add Block
          </Button>
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300 text-xs h-7" onClick={() => saveMutation.mutate({ content: sections })} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "💾 Save"}
            </Button>
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? "…" : "🚀 Publish"}
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="w-full text-zinc-400 text-xs h-7" onClick={() => setPreview(p => !p)}>
            {preview ? "🔒 Close Preview" : "👁 Preview"}
          </Button>
        </div>
      </div>

      {/* Center: editor */}
      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center gap-2">
          <span className="text-zinc-400 text-sm">Visual Editor</span>
          {activeSection && <Badge className="bg-violet-700/30 text-violet-300 border-violet-600">Editing: {sections.find(s => s.id === activeSection)?.name}</Badge>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sections.length === 0 && (
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center text-zinc-600">
              <div className="text-4xl mb-3">🎨</div>
              <div>Your page is blank. Add blocks from the left panel.</div>
            </div>
          )}
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${isActive ? "border-violet-500 ring-1 ring-violet-500/30" : "border-zinc-700 hover:border-zinc-600"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{sec.category}</span>
                    <span className="text-sm font-medium text-zinc-100">{sec.name}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="space-y-3 mt-3 border-t border-zinc-700 pt-3">
                    {Object.keys(sec.data || {}).map(field => (
                      <div key={field}>
                        <Label className="text-zinc-400 text-xs capitalize">{field}</Label>
                        {field === "body" ? (
                          <Textarea
                            data-testid={`input-section-${sec.id}-${field}`}
                            value={sec.data[field]}
                            onChange={e => updateSectionData(sec.id, field, e.target.value)}
                            className="bg-zinc-800 border-zinc-600 text-zinc-100 text-sm mt-1 min-h-[80px]"
                          />
                        ) : (
                          <Input
                            data-testid={`input-section-${sec.id}-${field}`}
                            value={sec.data[field]}
                            onChange={e => updateSectionData(sec.id, field, e.target.value)}
                            className="bg-zinc-800 border-zinc-600 text-zinc-100 text-sm mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!isActive && (
                  <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-400 border border-zinc-700/50">
                    <div className="font-medium text-zinc-200 mb-1">{sec.data?.headline || sec.name}</div>
                    {sec.data?.body && <div className="text-xs text-zinc-500 line-clamp-2">{sec.data.body}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: preview (optional) */}
      {preview && (
        <div className="w-80 flex-shrink-0 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-700 bg-zinc-800">
            <div className="text-sm font-medium text-zinc-100">📱 Mobile Preview</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {sections.map(sec => (
              <div key={sec.id} className="bg-white rounded-lg p-3 text-gray-900 shadow text-xs">
                <div className="font-bold text-sm mb-1">{sec.data?.headline || sec.name}</div>
                {sec.data?.body && <div className="text-gray-600 mb-2">{sec.data.body}</div>}
                {sec.data?.cta && <div className="bg-purple-600 text-white text-center rounded px-2 py-1 text-xs font-medium">{sec.data.cta}</div>}
              </div>
            ))}
            {sections.length === 0 && <div className="text-center text-zinc-600 text-xs py-8">Empty page preview</div>}
          </div>
        </div>
      )}

      {/* Block picker dialog */}
      <Dialog open={showBlockPicker} onOpenChange={setShowBlockPicker}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📦 Component Library — Add Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {blocks.map(block => (
              <button
                key={block.id}
                data-testid={`button-add-block-${block.blockType}`}
                onClick={() => addBlock(block)}
                className="text-left p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-500 rounded-lg transition-all"
              >
                <div className="font-medium text-zinc-100 text-sm">{block.name}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{block.description}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">{block.category}</span>
                  {block.isBuiltIn && <span className="text-xs bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded">Built-in</span>}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 3: AI Assistant ──────────────────────────────────────────────────────
function AIAssistantTab({ page }: { page: CmsPage | null }) {
  const { toast } = useToast();
  const [activeAI, setActiveAI] = useState<"generate" | "translate" | "seo" | "ussd">("generate");
  const [genConfig, setGenConfig] = useState({ pageType: page?.pageType || "homepage", tone: "professional", sections: "3", prompt: "" });
  const [transConfig, setTransConfig] = useState({ text: "", targetLanguage: "zu" });
  const [seoResult, setSeoResult] = useState<any>(null);
  const [genResult, setGenResult] = useState<any[]>([]);
  const [transResult, setTransResult] = useState("");
  const [ussdResult, setUssdResult] = useState("");
  const [loading, setLoading] = useState(false);

  const callAI = async (endpoint: string, body: any, onSuccess: (d: any) => void) => {
    setLoading(true);
    try {
      const r = await apiRequest("POST", `/api/cms/ai/${endpoint}`, body);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "AI error");
      onSuccess(d);
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "generate", label: "🤖 Generate Content" },
          { key: "translate", label: "🌍 Translate" },
          { key: "seo", label: "🔍 SEO Optimizer" },
          { key: "ussd", label: "📟 USSD Version" },
        ] as const).map(t => (
          <button
            key={t.key}
            data-testid={`button-ai-tab-${t.key}`}
            onClick={() => setActiveAI(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeAI === t.key ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeAI === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-zinc-100">Configure Generation</h3>
            <div>
              <Label className="text-zinc-300">Page Type</Label>
              <Select value={genConfig.pageType} onValueChange={v => setGenConfig(p => ({ ...p, pageType: v }))}>
                <SelectTrigger data-testid="select-gen-page-type" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Tone</Label>
              <Select value={genConfig.tone} onValueChange={v => setGenConfig(p => ({ ...p, tone: v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {["professional", "friendly", "inspirational", "bold", "academic", "conversational"].map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Number of Sections</Label>
              <Select value={genConfig.sections} onValueChange={v => setGenConfig(p => ({ ...p, sections: v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {["2", "3", "4", "5", "6"].map(n => <SelectItem key={n} value={n}>{n} sections</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Custom Prompt (optional)</Label>
              <Textarea data-testid="input-gen-prompt" value={genConfig.prompt} onChange={e => setGenConfig(p => ({ ...p, prompt: e.target.value }))} placeholder="e.g. Write a compelling homepage for South African freelancers with bold Africa-first messaging…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]" />
            </div>
            <Button data-testid="button-ai-generate" onClick={() => callAI("generate", { pageType: genConfig.pageType, tone: genConfig.tone, sections: parseInt(genConfig.sections), prompt: genConfig.prompt || undefined }, d => setGenResult(d.content))} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-600">
              {loading ? "Generating…" : "✨ Generate Content"}
            </Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 overflow-y-auto max-h-[500px]">
            <h3 className="font-semibold text-zinc-100 mb-3">Generated Content</h3>
            {genResult.length === 0 ? (
              <div className="text-zinc-600 text-sm text-center py-8">Generated sections will appear here</div>
            ) : (
              <div className="space-y-3">
                {genResult.map((sec: any, i: number) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                    <div className="font-semibold text-zinc-100 text-sm mb-1">{sec.title || `Section ${i + 1}`}</div>
                    <div className="text-zinc-400 text-sm">{sec.body || sec.content || JSON.stringify(sec)}</div>
                    {sec.type && <div className="text-xs text-zinc-600 mt-1">{sec.type}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeAI === "translate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-zinc-100">🌍 Translate to African Languages</h3>
            <div>
              <Label className="text-zinc-300">Target Language</Label>
              <Select value={transConfig.targetLanguage} onValueChange={v => setTransConfig(p => ({ ...p, targetLanguage: v }))}>
                <SelectTrigger data-testid="select-trans-lang" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {LANGUAGES.filter(l => l.code !== "en").map(l => (
                    <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Text to Translate</Label>
              <Textarea data-testid="input-trans-text" value={transConfig.text} onChange={e => setTransConfig(p => ({ ...p, text: e.target.value }))} placeholder="Paste the text you want to translate…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[120px]" />
            </div>
            <Button data-testid="button-ai-translate" onClick={() => callAI("translate", transConfig, d => setTransResult(d.translated))} disabled={loading || !transConfig.text} className="w-full bg-violet-700 hover:bg-violet-600">
              {loading ? "Translating…" : "🌍 Translate"}
            </Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-100 mb-3">Translation Result</h3>
            {transResult ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-200 text-sm whitespace-pre-wrap">{transResult}</div>
            ) : (
              <div className="text-zinc-600 text-sm text-center py-8">Translation will appear here</div>
            )}
          </div>
        </div>
      )}

      {activeAI === "seo" && (
        <div className="space-y-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-zinc-100">🔍 AI SEO Optimizer</h3>
            <Button data-testid="button-ai-seo" onClick={() => callAI("seo", { title: page?.title || "My Page", content: JSON.stringify(page?.content || []).slice(0, 500), pageType: page?.pageType || "custom" }, d => setSeoResult(d.seo))} disabled={loading || !page} className="bg-violet-700 hover:bg-violet-600">
              {loading ? "Analyzing…" : "🔍 Analyze & Optimize SEO"}
            </Button>
            {!page && <div className="text-amber-400 text-sm">Select a page from the Pages Library first to run SEO analysis.</div>}
          </div>
          {seoResult && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-zinc-100">SEO Recommendations</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-zinc-400 text-xs">Optimised Title</Label>
                  <div className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-zinc-100 text-sm mt-1">{seoResult.seoTitle}</div>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Meta Description (160 chars)</Label>
                  <div className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-zinc-100 text-sm mt-1">{seoResult.seoDescription}</div>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Keywords</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(seoResult.keywords || []).map((k: string) => (
                      <span key={k} className="bg-blue-900/40 border border-blue-700/40 text-blue-300 px-2 py-0.5 rounded text-xs">{k}</span>
                    ))}
                  </div>
                </div>
                {seoResult.readability && (
                  <div>
                    <Label className="text-zinc-400 text-xs">Readability Score</Label>
                    <div className="text-sm text-zinc-200 mt-1">{seoResult.readability}</div>
                  </div>
                )}
                {(seoResult.suggestions || []).length > 0 && (
                  <div>
                    <Label className="text-zinc-400 text-xs">Improvement Tips</Label>
                    <ul className="mt-1 space-y-1">
                      {seoResult.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-400">✓</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeAI === "ussd" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-zinc-100">📟 USSD — Feature Phone Version</h3>
            <p className="text-zinc-400 text-sm">Generate a compressed, plain-text USSD version of any page for African users on feature phones with no data or limited internet.</p>
            <Button data-testid="button-ai-ussd" onClick={() => callAI("ussd", { content: JSON.stringify(page?.content || []), pageTitle: page?.title || "Page" }, d => setUssdResult(d.ussd))} disabled={loading || !page} className="w-full bg-violet-700 hover:bg-violet-600">
              {loading ? "Generating USSD…" : "📟 Generate USSD Version"}
            </Button>
            {!page && <div className="text-amber-400 text-sm">Select a page from the Pages Library first.</div>}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-500">
              <div className="font-semibold text-zinc-400 mb-1">Africa-First Feature:</div>
              <div>USSD text versions enable access for 600M+ Africans without smartphones. Works on any basic phone via *123# menus.</div>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-100 mb-3">USSD Output</h3>
            {ussdResult ? (
              <div className="bg-black border border-green-700 rounded-lg p-4 font-mono text-green-400 text-xs whitespace-pre-wrap">{ussdResult}</div>
            ) : (
              <div className="text-zinc-600 text-sm text-center py-8">USSD plain-text output will appear here</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: Version History ───────────────────────────────────────────────────
function VersionHistoryTab({ page }: { page: CmsPage | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: versionsData, isLoading } = useQuery({
    queryKey: ["/api/cms/versions", page?.id],
    queryFn: () => page ? apiRequest("GET", `/api/cms/pages/${page.id}/versions`).then(r => r.json()) : Promise.resolve({ versions: [] }),
    enabled: !!page,
  });

  const rollbackMutation = useMutation({
    mutationFn: ({ vId }: { vId: string }) => apiRequest("POST", `/api/cms/pages/${page!.id}/versions/${vId}/rollback`).then(r => r.json()),
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ["/api/cms/versions", page?.id] });
      qc.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Rolled back!", description: d.message });
    },
  });

  const versions: CmsVersion[] = versionsData?.versions || [];

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
        <div className="text-5xl mb-4">📜</div>
        <div className="text-lg font-medium">No page selected</div>
        <div className="text-sm mt-2">Select a page from Pages Library to see its version history</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-100">Version History — {page.title}</h3>
          <div className="text-zinc-500 text-sm">Immutable audit trail • Every save auto-versioned • One-click rollback</div>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading version history…</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-4xl mb-3">📜</div>
          <div>No versions yet. Save the page in the Visual Builder to create your first version.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v, i) => (
            <div key={v.id} data-testid={`version-item-${v.id}`} className={`rounded-xl border p-4 ${i === 0 ? "border-violet-500/50 bg-violet-950/20" : "border-zinc-700 bg-zinc-900/30"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? "bg-violet-700" : "bg-zinc-700"}`}>
                    v{v.version}
                  </div>
                  <div>
                    <div className="font-medium text-zinc-100">{v.changeNote || "Content updated"}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">
                      {new Date(v.createdAt).toLocaleString()} · {v.diffSummary || ""}
                    </div>
                    {v.title && <div className="text-zinc-400 text-sm mt-1">Title: {v.title}</div>}
                    {v.status && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border font-medium mt-1 ${statusColor(v.status)}`}>
                        {v.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {i > 0 && (
                    <Button
                      data-testid={`button-rollback-${v.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => rollbackMutation.mutate({ vId: v.id })}
                      disabled={rollbackMutation.isPending}
                      className="border-amber-600 text-amber-400 hover:bg-amber-950/40 text-xs"
                    >
                      ↩ Rollback
                    </Button>
                  )}
                  {i === 0 && <span className="text-xs text-violet-400 font-medium px-2 py-1">Current</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 5: SEO & Publishing ──────────────────────────────────────────────────
function SEOPublishingTab({ page }: { page: CmsPage | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [seoData, setSeoData] = useState({
    seoTitle: "", seoDescription: "", seoKeywords: "", ogImage: "",
    language: "en", scheduledAt: "",
    isABTest: false, abVariant: "A",
  });

  useEffect(() => {
    if (page) {
      setSeoData({
        seoTitle: page.seoTitle || "",
        seoDescription: page.seoDescription || "",
        seoKeywords: page.seoKeywords || "",
        ogImage: page.ogImage || "",
        language: page.language || "en",
        scheduledAt: page.scheduledAt ? page.scheduledAt.slice(0, 16) : "",
        isABTest: page.isABTest || false,
        abVariant: page.abVariant || "A",
      });
    }
  }, [page?.id]);

  const saveSeoMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/cms/pages/${page!.id}`, data).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "SEO settings saved ✓" }); },
  });

  const scheduleMutation = useMutation({
    mutationFn: (scheduledAt: string) => apiRequest("POST", `/api/cms/pages/${page!.id}/schedule`, { scheduledAt }).then(r => r.json()),
    onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Scheduled!", description: d.message }); },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/publish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published 🚀" }); },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/unpublish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Unpublished — reverted to draft" }); },
  });

  const charCount = seoData.seoDescription.length;
  const charColor = charCount > 160 ? "text-red-400" : charCount > 140 ? "text-amber-400" : "text-emerald-400";

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-lg font-medium">No page selected</div>
        <div className="text-sm mt-2">Select a page from Pages Library to manage SEO & publishing</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left: SEO */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-zinc-100">🔍 SEO Metadata — {page.title}</h3>
        <div>
          <Label className="text-zinc-300">SEO Title</Label>
          <Input data-testid="input-seo-title" value={seoData.seoTitle} onChange={e => setSeoData(p => ({ ...p, seoTitle: e.target.value }))} placeholder="Page title for search engines…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          <div className="text-xs text-zinc-600 mt-0.5">{seoData.seoTitle.length}/60 chars recommended</div>
        </div>
        <div>
          <Label className="text-zinc-300">Meta Description</Label>
          <Textarea data-testid="input-seo-description" value={seoData.seoDescription} onChange={e => setSeoData(p => ({ ...p, seoDescription: e.target.value }))} placeholder="Brief description for search results…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]" />
          <div className={`text-xs mt-0.5 ${charColor}`}>{charCount}/160 chars {charCount > 160 ? "(too long!)" : "(ideal: 140-160)"}</div>
        </div>
        <div>
          <Label className="text-zinc-300">Keywords (comma-separated)</Label>
          <Input data-testid="input-seo-keywords" value={seoData.seoKeywords} onChange={e => setSeoData(p => ({ ...p, seoKeywords: e.target.value }))} placeholder="freelance, South Africa, gig economy…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
        </div>
        <div>
          <Label className="text-zinc-300">OG Image URL</Label>
          <Input data-testid="input-og-image" value={seoData.ogImage} onChange={e => setSeoData(p => ({ ...p, ogImage: e.target.value }))} placeholder="https://freelanceskills.net/og/page.jpg" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
        </div>
        <div>
          <Label className="text-zinc-300">Language</Label>
          <Select value={seoData.language} onValueChange={v => setSeoData(p => ({ ...p, language: v }))}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button data-testid="button-save-seo" onClick={() => saveSeoMutation.mutate({ seoTitle: seoData.seoTitle, seoDescription: seoData.seoDescription, seoKeywords: seoData.seoKeywords, ogImage: seoData.ogImage, language: seoData.language })} disabled={saveSeoMutation.isPending} className="w-full bg-violet-700 hover:bg-violet-600">
          {saveSeoMutation.isPending ? "Saving…" : "💾 Save SEO Settings"}
        </Button>

        {/* SERP Preview */}
        <div className="bg-white rounded-lg p-3 border border-zinc-600">
          <div className="text-xs text-zinc-500 mb-1">SERP Preview</div>
          <div className="text-blue-600 font-medium text-sm line-clamp-1">{seoData.seoTitle || page.title} — FreelanceSkills.net</div>
          <div className="text-green-700 text-xs">freelanceskills.net/{page.slug}</div>
          <div className="text-gray-600 text-xs mt-1 line-clamp-2">{seoData.seoDescription || "No description set yet."}</div>
        </div>
      </div>

      {/* Right: Publishing */}
      <div className="space-y-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100">🚀 Publishing Controls</h3>
          <div className="flex items-center justify-between py-2 border-b border-zinc-700">
            <div>
              <div className="text-zinc-100 text-sm">Current Status</div>
              <div className={`text-xs mt-0.5 ${page.status === "published" ? "text-emerald-400" : page.status === "scheduled" ? "text-blue-400" : "text-amber-400"}`}>
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                {page.publishedAt && ` · Published ${new Date(page.publishedAt).toLocaleDateString()}`}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs border font-medium ${statusColor(page.status)}`}>{page.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button data-testid="button-publish-page" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending || page.status === "published"} className="bg-emerald-700 hover:bg-emerald-600 text-xs h-9">
              🚀 Publish Now
            </Button>
            <Button data-testid="button-unpublish-page" onClick={() => unpublishMutation.mutate()} disabled={unpublishMutation.isPending || page.status === "draft"} variant="outline" className="border-zinc-600 text-zinc-300 text-xs h-9">
              ↩ Unpublish
            </Button>
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100">⏰ Schedule Publishing</h3>
          <div>
            <Label className="text-zinc-300">Publish At</Label>
            <Input data-testid="input-schedule-date" type="datetime-local" value={seoData.scheduledAt} onChange={e => setSeoData(p => ({ ...p, scheduledAt: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          </div>
          <Button data-testid="button-schedule-page" onClick={() => scheduleMutation.mutate(seoData.scheduledAt)} disabled={scheduleMutation.isPending || !seoData.scheduledAt} className="w-full bg-blue-700 hover:bg-blue-600">
            {scheduleMutation.isPending ? "Scheduling…" : "⏰ Schedule Page"}
          </Button>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100">🧪 A/B Testing</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-zinc-200 text-sm">Enable A/B Test</div>
              <div className="text-zinc-500 text-xs">Split-test two versions of this page</div>
            </div>
            <Switch data-testid="switch-ab-test" checked={seoData.isABTest} onCheckedChange={v => setSeoData(p => ({ ...p, isABTest: v }))} />
          </div>
          {seoData.isABTest && (
            <div>
              <Label className="text-zinc-300">This page is Variant</Label>
              <Select value={seoData.abVariant} onValueChange={v => setSeoData(p => ({ ...p, abVariant: v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button data-testid="button-save-abtest" onClick={() => saveSeoMutation.mutate({ isABTest: seoData.isABTest, abVariant: seoData.abVariant })} disabled={saveSeoMutation.isPending} variant="outline" className="w-full border-zinc-600 text-zinc-300">
            Save A/B Config
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: Component Library ─────────────────────────────────────────────────
function ComponentLibraryTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: "", category: "content", blockType: "", description: "", isGlobal: false });

  const { data: blocksData, isLoading } = useQuery({
    queryKey: ["/api/cms/blocks", catFilter],
    queryFn: () => apiRequest("GET", `/api/cms/blocks?category=${catFilter}`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cms/blocks", data).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cms/blocks"] });
      setShowNewBlock(false);
      setNewBlock({ name: "", category: "content", blockType: "", description: "", isGlobal: false });
      toast({ title: "Block created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/blocks/${id}`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/blocks"] }); toast({ title: "Block deleted" }); },
  });

  const blocks: CmsBlock[] = blocksData?.blocks || [];
  const filtered = blocks.filter(b => search === "" || b.name.toLowerCase().includes(search.toLowerCase()) || (b.description || "").toLowerCase().includes(search.toLowerCase()));

  const catCounts: Record<string, number> = {};
  blocks.forEach(b => { catCounts[b.category] = (catCounts[b.category] || 0) + 1; });
  const chartData = Object.entries(catCounts).map(([cat, count]) => ({ cat, count }));

  const catColors: Record<string, string> = {
    hero: "#8b5cf6", content: "#3b82f6", cta: "#f97316", trust: "#10b981",
    pricing: "#eab308", faq: "#ec4899", media: "#06b6d4", africa: "#34d399",
    footer: "#71717a",
  };

  return (
    <div className="space-y-5">
      {chartData.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-sm font-medium text-zinc-300 mb-3">Blocks by Category</div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="cat" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.cat} fill={catColors[entry.cat] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input data-testid="input-block-search" placeholder="Search blocks…" value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-48" />
          <div className="flex gap-1 flex-wrap">
            {BLOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                data-testid={`filter-block-cat-${cat}`}
                onClick={() => setCatFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter === cat ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <Button data-testid="button-new-block" size="sm" onClick={() => setShowNewBlock(true)} className="bg-violet-600 hover:bg-violet-700">
          + New Block
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-zinc-500">Loading component library…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(block => (
            <div key={block.id} data-testid={`block-card-${block.id}`} className="bg-zinc-800/60 border border-zinc-700 hover:border-zinc-500 rounded-xl p-4 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg`} style={{ backgroundColor: `${catColors[block.category] || "#6b7280"}22`, border: `1px solid ${catColors[block.category] || "#6b7280"}44` }}>
                  {block.category === "hero" ? "🦸" : block.category === "africa" ? "🌍" : block.category === "media" ? "🎬" : block.category === "trust" ? "⭐" : block.category === "pricing" ? "💰" : block.category === "faq" ? "❓" : block.category === "footer" ? "🦶" : block.category === "cta" ? "📢" : "📦"}
                </div>
                {!block.isBuiltIn && (
                  <button onClick={() => deleteMutation.mutate(block.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-xs transition-opacity">✕</button>
                )}
              </div>
              <div className="font-medium text-zinc-100 text-sm leading-tight">{block.name}</div>
              {block.description && <div className="text-zinc-500 text-xs mt-1 line-clamp-2">{block.description}</div>}
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${catColors[block.category] || "#6b7280"}22`, color: catColors[block.category] || "#9ca3af" }}>{block.category}</span>
                {block.isBuiltIn && <span className="text-xs bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded">Built-in</span>}
                {block.isGlobal && <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded">Global</span>}
              </div>
              {(block.usageCount || 0) > 0 && (
                <div className="text-xs text-zinc-600 mt-1.5">Used {block.usageCount}× across pages</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Block Dialog */}
      <Dialog open={showNewBlock} onOpenChange={setShowNewBlock}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-zinc-300">Block Name *</Label>
              <Input data-testid="input-new-block-name" value={newBlock.name} onChange={e => setNewBlock(p => ({ ...p, name: e.target.value }))} placeholder="My Custom Hero" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-300">Block Type Key *</Label>
              <Input data-testid="input-new-block-type" value={newBlock.blockType} onChange={e => setNewBlock(p => ({ ...p, blockType: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="my-custom-hero" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-300">Category</Label>
              <Select value={newBlock.category} onValueChange={v => setNewBlock(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  {BLOCK_CATEGORIES.filter(c => c !== "all").map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Description</Label>
              <Input data-testid="input-new-block-desc" value={newBlock.description} onChange={e => setNewBlock(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this block…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Make Global (shared across pages)</Label>
              <Switch checked={newBlock.isGlobal} onCheckedChange={v => setNewBlock(p => ({ ...p, isGlobal: v }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewBlock(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-create-block-confirm" onClick={() => createMutation.mutate(newBlock)} disabled={createMutation.isPending || !newBlock.name || !newBlock.blockType} className="bg-violet-600 hover:bg-violet-700">
                {createMutation.isPending ? "Creating…" : "Create Block"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
type TabId = "pages" | "builder" | "ai" | "history" | "seo" | "library";

const TABS: { id: TabId; label: string }[] = [
  { id: "pages", label: "📄 Pages Library" },
  { id: "builder", label: "🏗️ Visual Builder" },
  { id: "ai", label: "🤖 AI Assistant" },
  { id: "history", label: "📜 Version History" },
  { id: "seo", label: "🔍 SEO & Publishing" },
  { id: "library", label: "📦 Component Library" },
];

export default function CmsManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("pages");
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);

  const handleEditPage = useCallback((page: CmsPage) => {
    setSelectedPage(page);
    setActiveTab("builder");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-700/20 border border-violet-700/40 flex items-center justify-center text-xl">🖋️</div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">CMS Management</h1>
                <div className="text-sm text-zinc-500">Content, pages, and AI publishing — beats Webflow + Sanity + Strapi until 2030</div>
              </div>
            </div>
          </div>
          {selectedPage && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">Editing:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs border font-medium ${statusColor(selectedPage.status)}`}>{selectedPage.status}</span>
              <span className="font-medium text-zinc-200 text-sm">{selectedPage.title}</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPage(null)} className="text-zinc-500 h-7 text-xs">✕ Deselect</Button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              data-testid={`tab-cms-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-violet-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === "pages" && <PagesLibraryTab onEditPage={handleEditPage} />}
        {activeTab === "builder" && <VisualBuilderTab page={selectedPage} onClose={() => setActiveTab("pages")} />}
        {activeTab === "ai" && <AIAssistantTab page={selectedPage} />}
        {activeTab === "history" && <VersionHistoryTab page={selectedPage} />}
        {activeTab === "seo" && <SEOPublishingTab page={selectedPage} />}
        {activeTab === "library" && <ComponentLibraryTab />}
      </div>
    </div>
  );
}
