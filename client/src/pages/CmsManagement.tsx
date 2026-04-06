/**
 * CMS Management Department v2.0 — client/src/pages/CmsManagement.tsx
 * Section 25 — FreelanceSkills.net
 * 200% Elon Musk Intelligence | Masterpiece Standard
 * Beats Webflow + Sanity + Strapi + Builder.io + Shopify until 2030
 *
 * 10 Tabs:
 *  1. 📄 Pages Library        — search/sort/filter/bulk ops + live status
 *  2. 🏗️ Visual Builder       — HTML5 DnD sections + inline edit + live preview iframe
 *  3. 🤖 Agentic AI Engine    — write-page / SEO / schema-LD / bulk-translate / image prompt
 *  4. 📜 Version History      — immutable timeline + side-by-side diff viewer + rollback
 *  5. 🔍 SEO & Performance    — health score gauge + Core Web Vitals + JSON-LD editor
 *  6. 📡 Dynamic Data Blocks  — live jobs / courses / platform stats feeds
 *  7. 🌍 Africa Intelligence  — USSD generator + mobile preview + 10-lang translate
 *  8. 👥 Collaboration        — comments per section + approval workflow
 *  9. 🔗 Integration Hub      — 11-dept hooks + TOS trigger + sync dashboard
 * 10. 📦 Component Library    — categories + usage analytics + custom block creator
 */
import { useState, useCallback, useEffect, useRef } from "react";
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
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CmsPage {
  id: string; slug: string; title: string; pageType: string; status: string;
  content: any[]; metadata: any; seoTitle?: string; seoDescription?: string;
  seoKeywords?: string; ogImage?: string; language: string; isABTest: boolean;
  abVariant?: string; scheduledAt?: string; publishedAt?: string;
  viewCount: number; wordCount: number; readingTimeMins: number;
  ussdVersion?: string; translations: any; createdAt: string; updatedAt: string;
}
interface CmsBlock {
  id: string; name: string; category: string; blockType: string;
  description?: string; isBuiltIn: boolean; isGlobal: boolean;
  usageCount: number; tags?: string[];
}
interface CmsVersion {
  id: string; pageId: string; version: number; title?: string;
  content?: any[]; status?: string; changedBy?: string;
  changeNote?: string; diffSummary?: string; createdAt: string;
}
interface Comment {
  id: string; pageId: string; authorId: string; text: string;
  type: string; section?: string; createdAt: string; resolved: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_TYPES = ["custom","homepage","about","terms","privacy","faq","help","blog","careers","landing","footer"];
const LANGUAGES = [
  { code: "en", name: "English" }, { code: "af", name: "Afrikaans" },
  { code: "zu", name: "Zulu" }, { code: "xh", name: "Xhosa" },
  { code: "sw", name: "Swahili" }, { code: "yo", name: "Yoruba" },
  { code: "ha", name: "Hausa" }, { code: "am", name: "Amharic" },
  { code: "so", name: "Somali" }, { code: "fr", name: "French" },
];
const BLOCK_CATEGORIES = ["all","hero","content","cta","trust","pricing","faq","media","africa","footer"];
const CAT_COLORS: Record<string,string> = {
  hero:"#8b5cf6", content:"#3b82f6", cta:"#f97316", trust:"#10b981",
  pricing:"#eab308", faq:"#ec4899", media:"#06b6d4", africa:"#34d399", footer:"#71717a"
};
const CAT_ICONS: Record<string,string> = {
  hero:"🦸", content:"📝", cta:"📢", trust:"⭐", pricing:"💰", faq:"❓", media:"🎬", africa:"🌍", footer:"🦶"
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === "published") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (s === "scheduled") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  if (s === "archived") return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
}
function pageTypeIcon(t: string) {
  const m: Record<string,string> = { homepage:"🏠", about:"ℹ️", terms:"📜", privacy:"🔒", faq:"❓", help:"🆘", blog:"📰", careers:"💼", landing:"🚀", footer:"🦶", custom:"📄" };
  return m[t] || "📄";
}
function langFlag(l: string) {
  const m: Record<string,string> = { en:"🇬🇧", af:"🇿🇦", zu:"🇿🇦", xh:"🇿🇦", sw:"🇰🇪", yo:"🇳🇬", ha:"🇳🇬", am:"🇪🇹", so:"🇸🇴", fr:"🇫🇷", pt:"🇵🇹" };
  return m[l] || "🌍";
}
function scoreGrade(n: number) {
  if (n >= 90) return { grade: "A+", color: "text-emerald-400" };
  if (n >= 80) return { grade: "A", color: "text-emerald-400" };
  if (n >= 70) return { grade: "B", color: "text-blue-400" };
  if (n >= 60) return { grade: "C", color: "text-amber-400" };
  return { grade: "D", color: "text-red-400" };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── TAB 1: Pages Library v2 ─────────────────────────────────────────────────
function PagesLibraryTab({ onEditPage }: { onEditPage: (p: CmsPage) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState<"updated"|"title"|"views"|"words">("updated");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showNew, setShowNew] = useState(false);
  const [newPage, setNewPage] = useState({ title:"", slug:"", pageType:"custom", language:"en" });

  const { data: pagesData, isLoading } = useQuery({
    queryKey: ["/api/cms/pages", filterStatus, filterType],
    queryFn: () => apiRequest("GET", `/api/cms/pages?status=${filterStatus}&type=${filterType}&limit=100`).then(r => r.json()),
  });
  const { data: stats } = useQuery({
    queryKey: ["/api/cms/stats"],
    queryFn: () => apiRequest("GET", "/api/cms/stats").then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => apiRequest("POST", "/api/cms/pages", d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); qc.invalidateQueries({ queryKey: ["/api/cms/stats"] }); setShowNew(false); setNewPage({ title:"", slug:"", pageType:"custom", language:"en" }); toast({ title: "Page created" }); },
  });
  const publishMut = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/cms/pages/${id}/publish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published 🚀" }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/pages/${id}`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Moved to trash" }); },
  });
  const dupMut = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/cms/pages/${id}/duplicate`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Duplicated as draft" }); },
  });
  const seedMut = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cms/seed-defaults").then(r => r.json()),
    onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); qc.invalidateQueries({ queryKey: ["/api/cms/stats"] }); toast({ title: "Seeded!", description: d.message }); },
  });

  const pages: CmsPage[] = pagesData?.pages || [];
  const filtered = pages
    .filter(p => (search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      let v = 0;
      if (sortBy === "title") v = a.title.localeCompare(b.title);
      else if (sortBy === "views") v = a.viewCount - b.viewCount;
      else if (sortBy === "words") v = a.wordCount - b.wordCount;
      else v = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === "desc" ? -v : v;
    });

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(new Set(filtered.map(p => p.id)));
  const clearSelect = () => setSelected(new Set());
  const handleAutoSlug = (title: string) => setNewPage(p => ({ ...p, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  const sortToggle = (col: typeof sortBy) => { if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortBy(col); setSortDir("desc"); } };
  const SortBtn = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <button onClick={() => sortToggle(col)} className={`flex items-center gap-1 hover:text-zinc-200 transition-colors ${sortBy === col ? "text-violet-400" : "text-zinc-400"}`}>
      {label} {sortBy === col ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  const statusChart = [
    { name: "Published", value: stats?.published || 0, fill: "#10b981" },
    { name: "Drafts", value: stats?.drafts || 0, fill: "#f59e0b" },
    { name: "Scheduled", value: stats?.scheduled || 0, fill: "#3b82f6" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Pages" value={stats?.totalPages ?? "—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="Published" value={stats?.published ?? "—"} color="bg-emerald-950/60 border-emerald-700/40 text-emerald-200" />
        <StatCard label="Drafts" value={stats?.drafts ?? "—"} color="bg-amber-950/60 border-amber-700/40 text-amber-200" />
        <StatCard label="Scheduled" value={stats?.scheduled ?? "—"} color="bg-blue-950/60 border-blue-700/40 text-blue-200" />
        <StatCard label="Blocks" value={stats?.totalBlocks ?? "—"} color="bg-violet-950/60 border-violet-700/40 text-violet-200" />
        <StatCard label="Versions" value={stats?.totalVersions ?? "—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
      </div>

      {/* Mini bar chart */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
        <ResponsiveContainer width="100%" height={48}>
          <BarChart data={statusChart} layout="vertical" margin={{ top:0, right:0, bottom:0, left:60 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill:"#71717a", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor:"#18181b", border:"1px solid #3f3f46", borderRadius:"6px", fontSize:"12px" }} />
            <Bar dataKey="value" radius={[0,4,4,0]}>
              {statusChart.map(e => <Cell key={e.name} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input data-testid="input-cms-search" placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-52" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              {["all","published","draft","scheduled","archived"].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectItem value="all">All Types</SelectItem>
              {PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{pageTypeIcon(t)} {t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-zinc-400">{selected.size} selected</span>
              <Button size="sm" onClick={() => { selected.forEach(id => publishMut.mutate(id)); clearSelect(); }} className="bg-emerald-700 hover:bg-emerald-600 h-7 text-xs">🚀 Bulk Publish</Button>
              <Button size="sm" variant="ghost" onClick={() => { selected.forEach(id => deleteMut.mutate(id)); clearSelect(); }} className="text-red-400 h-7 text-xs">🗑 Delete</Button>
              <Button size="sm" variant="ghost" onClick={clearSelect} className="text-zinc-400 h-7 text-xs">✕</Button>
            </div>
          )}
          <Button data-testid="button-seed-defaults" variant="outline" size="sm" onClick={() => seedMut.mutate()} disabled={seedMut.isPending} className="border-zinc-600 text-zinc-300">{seedMut.isPending ? "Seeding…" : "🌱 Seed"}</Button>
          <Button data-testid="button-new-page" size="sm" onClick={() => setShowNew(true)} className="bg-violet-600 hover:bg-violet-700">+ New Page</Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <div className="text-center py-12 text-zinc-500">Loading…</div> : filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-4xl mb-3">📄</div>
          <div>No pages yet. Click "Seed" to add standard pages or create one manually.</div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <th className="px-4 py-3 text-left w-8"><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelect()} className="rounded" /></th>
                <th className="px-4 py-3 text-left"><SortBtn col="title" label="Page" /></th>
                <th className="px-4 py-3 text-left text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-zinc-400">Lang</th>
                <th className="px-4 py-3 text-right"><SortBtn col="words" label="Words" /></th>
                <th className="px-4 py-3 text-right"><SortBtn col="views" label="Views" /></th>
                <th className="px-4 py-3 text-right"><SortBtn col="updated" label="Updated" /></th>
                <th className="px-4 py-3 text-center text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page, i) => (
                <tr key={page.id} data-testid={`row-cms-page-${page.id}`} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? "bg-zinc-900/20" : ""}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(page.id)} onChange={() => toggleSelect(page.id)} className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100">{page.title}</div>
                    <div className="text-zinc-500 text-xs">/{page.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{pageTypeIcon(page.pageType)} <span className="capitalize text-xs">{page.pageType}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${statusColor(page.status)}`}>{page.status}</span></td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{langFlag(page.language)} {page.language.toUpperCase()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400 text-xs">{page.wordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-400 text-xs">{page.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-500 text-xs">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <Button data-testid={`button-edit-page-${page.id}`} size="sm" variant="outline" onClick={() => onEditPage(page)} className="border-zinc-600 text-zinc-300 h-7 text-xs">✏️</Button>
                      {page.status !== "published" && <Button size="sm" onClick={() => publishMut.mutate(page.id)} className="bg-emerald-700 hover:bg-emerald-600 h-7 text-xs" disabled={publishMut.isPending}>🚀</Button>}
                      <Button size="sm" variant="ghost" onClick={() => dupMut.mutate(page.id)} className="text-zinc-400 h-7 text-xs">⧉</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(page.id)} className="text-red-500 h-7 text-xs">🗑</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
          <DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-zinc-300">Title *</Label>
              <Input data-testid="input-new-page-title" value={newPage.title} onChange={e => handleAutoSlug(e.target.value)} placeholder="Homepage" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-300">URL Slug *</Label>
              <div className="flex items-center gap-1 mt-1"><span className="text-zinc-500 text-sm">/</span><Input data-testid="input-new-page-slug" value={newPage.slug} onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300">Type</Label>
                <Select value={newPage.pageType} onValueChange={v => setNewPage(p => ({ ...p, pageType: v }))}>
                  <SelectTrigger data-testid="select-new-page-type" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{pageTypeIcon(t)} {t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Language</Label>
                <Select value={newPage.language} onValueChange={v => setNewPage(p => ({ ...p, language: v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNew(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-create-page-confirm" onClick={() => createMut.mutate(newPage)} disabled={createMut.isPending || !newPage.title || !newPage.slug} className="bg-violet-600 hover:bg-violet-700">{createMut.isPending ? "Creating…" : "Create Page"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 2: Visual Builder v2 (HTML5 DnD) ────────────────────────────────────
function VisualBuilderTab({ page, onClose }: { page: CmsPage | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => { if (page) setSections(Array.isArray(page.content) ? page.content : []); }, [page?.id]);

  const { data: blocksData } = useQuery({ queryKey: ["/api/cms/blocks"], queryFn: () => apiRequest("GET", "/api/cms/blocks").then(r => r.json()) });

  const saveMut = useMutation({
    mutationFn: (d: any) => apiRequest("PATCH", `/api/cms/pages/${page!.id}`, d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Saved ✓" }); },
  });
  const publishMut = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/publish`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published 🚀" }); },
  });

  const addBlock = (block: CmsBlock) => {
    const sec = { id: `sec_${Date.now()}`, type: block.blockType, name: block.name, category: block.category, order: sections.length, data: { headline: "Edit headline", body: "Edit this body text — click to customise.", cta: "Get Started" } };
    setSections(prev => [...prev, sec]);
    setShowPicker(false);
    setActiveSection(sec.id);
  };
  const remove = (id: string) => { setSections(prev => prev.filter(s => s.id !== id)); if (activeSection === id) setActiveSection(null); };
  const updateField = (id: string, field: string, val: string) => setSections(prev => prev.map(s => s.id === id ? { ...s, data: { ...s.data, [field]: val } } : s));

  // HTML5 drag-and-drop
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setSections(prev => {
      const n = [...prev]; const [moved] = n.splice(dragIdx, 1); n.splice(idx, 0, moved); return n;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const blocks: CmsBlock[] = blocksData?.blocks || [];

  if (!page) return (
    <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
      <div className="text-5xl mb-4">🏗️</div>
      <div className="text-lg font-medium">No page selected</div>
      <div className="text-sm mt-2">Go to Pages Library and click ✏️ on a page</div>
    </div>
  );

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 240px)", minHeight: "600px" }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-700 bg-zinc-800">
          <div className="font-semibold text-zinc-100 text-sm truncate">{page.title}</div>
          <div className="text-xs text-zinc-500 flex items-center justify-between mt-0.5">
            <span>/{page.slug}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs border ${statusColor(page.status)}`}>{page.status}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sections.length === 0 && <div className="text-center py-8 text-zinc-600 text-xs">No sections yet. Add a block below.</div>}
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              onClick={() => setActiveSection(sec.id)}
              data-testid={`section-item-${sec.id}`}
              className={`rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-all ${activeSection === sec.id ? "border-violet-500 bg-violet-950/40" : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"} ${dragIdx === idx ? "opacity-50 scale-95" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs select-none">⋮⋮</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-100 truncate">{sec.name}</div>
                  <div className="text-xs text-zinc-500">{sec.category}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); remove(sec.id); }} className="text-red-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-zinc-700 space-y-1.5">
          <Button data-testid="button-add-block" size="sm" className="w-full bg-violet-700 hover:bg-violet-600 text-xs" onClick={() => setShowPicker(true)}>+ Add Block</Button>
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300 text-xs h-7" onClick={() => saveMut.mutate({ content: sections })} disabled={saveMut.isPending}>{saveMut.isPending ? "…" : "💾 Save"}</Button>
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>🚀 Publish</Button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="ghost" className="text-zinc-400 text-xs h-7" onClick={() => setShowPreview(p => !p)}>{showPreview ? "🔒 Close" : "👁 Preview"}</Button>
            <Button size="sm" variant="ghost" className="text-zinc-400 text-xs h-7" onClick={onClose}>✕ Close</Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 text-sm">🏗️ Visual Editor</span>
          {activeSection && <Badge className="bg-violet-700/30 text-violet-300 border-violet-600 text-xs">Editing: {sections.find(s => s.id === activeSection)?.name}</Badge>}
          <span className="text-zinc-600 text-xs ml-auto">Drag sections to reorder • Click to edit • {sections.length} section{sections.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sections.length === 0 && (
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center text-zinc-600">
              <div className="text-5xl mb-3">🎨</div>
              <div className="font-medium">Blank Canvas</div>
              <div className="text-sm mt-1">Add blocks from the sidebar to bring your page to life</div>
            </div>
          )}
          {sections.map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <div key={sec.id} onClick={() => setActiveSection(sec.id)} className={`rounded-xl border p-4 cursor-pointer transition-all ${isActive ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-950/10" : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/30"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{sec.category}</span>
                    <span className="text-sm font-medium text-zinc-100">{sec.name}</span>
                  </div>
                  {isActive && <span className="text-xs text-violet-400">● Editing</span>}
                </div>
                {isActive ? (
                  <div className="space-y-3 border-t border-zinc-700 pt-3 mt-2">
                    {Object.keys(sec.data || {}).map(field => (
                      <div key={field}>
                        <Label className="text-zinc-400 text-xs capitalize">{field}</Label>
                        {field === "body" ? (
                          <Textarea data-testid={`input-section-${sec.id}-${field}`} value={sec.data[field]} onChange={e => updateField(sec.id, field, e.target.value)} className="bg-zinc-800 border-zinc-600 text-zinc-100 text-sm mt-1 min-h-[80px]" />
                        ) : (
                          <Input data-testid={`input-section-${sec.id}-${field}`} value={sec.data[field]} onChange={e => updateField(sec.id, field, e.target.value)} className="bg-zinc-800 border-zinc-600 text-zinc-100 text-sm mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700/50">
                    <div className="font-medium text-zinc-200 text-sm">{sec.data?.headline || sec.name}</div>
                    {sec.data?.body && <div className="text-zinc-500 text-xs mt-1 line-clamp-2">{sec.data.body}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="w-72 flex-shrink-0 flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-100">📱 Mobile Preview</span>
            <span className="text-xs text-zinc-500">{page.slug}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sections.map(sec => (
              <div key={sec.id} className="bg-white rounded-lg p-3 shadow text-gray-900 text-xs">
                <div className="font-bold text-sm mb-1">{sec.data?.headline || sec.name}</div>
                {sec.data?.body && <div className="text-gray-500 mb-2 line-clamp-3">{sec.data.body}</div>}
                {sec.data?.cta && <div className="bg-purple-600 text-white text-center rounded px-2 py-1 text-xs font-medium">{sec.data.cta}</div>}
              </div>
            ))}
            {sections.length === 0 && <div className="text-center text-zinc-600 text-xs py-8">Empty preview</div>}
          </div>
          <div className="p-2 border-t border-zinc-700 bg-zinc-800">
            <div className="text-xs text-zinc-500 text-center">freelanceskills.net/{page.slug}</div>
          </div>
        </div>
      )}

      {/* Block picker */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>📦 Add Block — Component Library</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {blocks.map(b => (
              <button key={b.id} data-testid={`button-add-block-${b.blockType}`} onClick={() => addBlock(b)} className="text-left p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-500 rounded-lg transition-all">
                <div className="font-medium text-zinc-100 text-sm">{b.name}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{b.description}</div>
                <div className="flex gap-1 mt-1.5">
                  <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">{b.category}</span>
                  {b.isBuiltIn && <span className="text-xs bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded">Built-in</span>}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 3: Agentic AI Engine v2 ─────────────────────────────────────────────
function AgenticAITab({ page }: { page: CmsPage | null }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeAI, setActiveAI] = useState<"write"|"generate"|"translate"|"bulk-translate"|"seo"|"schema"|"ussd"|"image-prompt">("write");
  const [loading, setLoading] = useState(false);
  const [wpConfig, setWpConfig] = useState({ pageType: page?.pageType||"homepage", tone:"professional", wordCount:"500", audience:"African freelancers", includeHero:true, includeCTA:true, includeFAQ:false, includeTestimonials:false });
  const [genConfig, setGenConfig] = useState({ pageType: page?.pageType||"homepage", tone:"professional", sections:"3", prompt:"" });
  const [transConfig, setTransConfig] = useState({ text:"", targetLanguage:"zu" });
  const [bulkConfig, setBulkConfig] = useState({ text:"", languages:["zu","xh","af","sw"] });
  const [seoResult, setSeoResult] = useState<any>(null);
  const [genResult, setGenResult] = useState<any[]>([]);
  const [writeResult, setWriteResult] = useState<any[]>([]);
  const [transResult, setTransResult] = useState("");
  const [bulkResult, setBulkResult] = useState<any>({});
  const [ussdResult, setUssdResult] = useState("");
  const [schemaResult, setSchemaResult] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imgConfig, setImgConfig] = useState({ sectionName:"Hero", style:"photorealistic" });

  const call = async (endpoint: string, body: any, onSuccess: (d: any) => void) => {
    setLoading(true);
    try {
      const r = await apiRequest("POST", `/api/cms/ai/${endpoint}`, body);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "AI error");
      onSuccess(d);
    } catch (e: any) { toast({ title: "AI Error", description: e.message, variant:"destructive" }); }
    finally { setLoading(false); }
  };

  const applyToPage = async (content: any[]) => {
    if (!page) { toast({ title: "No page selected", variant:"destructive" }); return; }
    try {
      await apiRequest("PATCH", `/api/cms/pages/${page.id}`, { content });
      qc.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Applied to page!", description: `${content.length} sections written to "${page.title}"` });
    } catch { toast({ title: "Failed to apply", variant:"destructive" }); }
  };

  const AI_TABS = [
    { key:"write", label:"✍️ Write Page" }, { key:"generate", label:"✨ Generate Sections" },
    { key:"seo", label:"🔍 SEO" }, { key:"schema", label:"🔗 JSON-LD" },
    { key:"translate", label:"🌍 Translate" }, { key:"bulk-translate", label:"🌐 Bulk Translate" },
    { key:"ussd", label:"📟 USSD" }, { key:"image-prompt", label:"🖼️ Image Prompt" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 flex-wrap">
        {AI_TABS.map(t => (
          <button key={t.key} data-testid={`button-ai-tab-${t.key}`} onClick={() => setActiveAI(t.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeAI === t.key ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{t.label}</button>
        ))}
      </div>

      {activeAI === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">✍️ Agentic Full-Page Writer</h3>
            <p className="text-zinc-500 text-xs">GPT-4o-mini writes complete, production-ready page content — hero, features, CTA and all — in one shot.</p>
            <div>
              <Label className="text-zinc-300 text-xs">Page Type</Label>
              <Select value={wpConfig.pageType} onValueChange={v => setWpConfig(p => ({ ...p, pageType:v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-zinc-300 text-xs">Tone</Label>
                <Select value={wpConfig.tone} onValueChange={v => setWpConfig(p => ({ ...p, tone:v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["professional","friendly","inspirational","bold","academic"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">~Words</Label>
                <Select value={wpConfig.wordCount} onValueChange={v => setWpConfig(p => ({ ...p, wordCount:v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["300","500","800","1200"].map(n => <SelectItem key={n} value={n}>{n} words</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs">Include Sections</Label>
              {[["includeHero","Hero section"],["includeCTA","Closing CTA"],["includeFAQ","FAQ section"],["includeTestimonials","Testimonials"]].map(([key,label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs">{label}</span>
                  <Switch checked={(wpConfig as any)[key]} onCheckedChange={v => setWpConfig(p => ({ ...p, [key]:v }))} />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Audience</Label>
              <Input value={wpConfig.audience} onChange={e => setWpConfig(p => ({ ...p, audience:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 text-sm" />
            </div>
            <Button data-testid="button-ai-write-page" onClick={() => call("write-page", { ...wpConfig, wordCount:parseInt(wpConfig.wordCount) }, d => setWriteResult(d.content))} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Writing full page…" : "✍️ Write Entire Page"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col overflow-hidden" style={{ maxHeight:"500px" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-100">Generated Page Content</h3>
              {writeResult.length > 0 && page && (
                <Button size="sm" onClick={() => applyToPage(writeResult)} className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7">Apply to "{page.title}"</Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {writeResult.length === 0 ? <div className="text-zinc-600 text-sm text-center py-10">Generated page sections will appear here</div> : writeResult.map((sec: any, i: number) => (
                <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="font-semibold text-zinc-100 text-sm mb-1">{sec.name || `Section ${i+1}`}</div>
                  <div className="text-zinc-400 text-xs">{sec.data?.headline && <div className="font-medium text-zinc-300 mb-1">{sec.data.headline}</div>}{sec.data?.body || JSON.stringify(sec.data)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAI === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">✨ Generate Content Sections</h3>
            <div>
              <Label className="text-zinc-300 text-xs">Page Type</Label>
              <Select value={genConfig.pageType} onValueChange={v => setGenConfig(p => ({ ...p, pageType:v }))}>
                <SelectTrigger data-testid="select-gen-page-type" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-zinc-300 text-xs">Tone</Label>
                <Select value={genConfig.tone} onValueChange={v => setGenConfig(p => ({ ...p, tone:v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["professional","friendly","bold","conversational"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Sections</Label>
                <Select value={genConfig.sections} onValueChange={v => setGenConfig(p => ({ ...p, sections:v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["2","3","4","5"].map(n => <SelectItem key={n} value={n}>{n} sections</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Custom Prompt (optional)</Label>
              <Textarea data-testid="input-gen-prompt" value={genConfig.prompt} onChange={e => setGenConfig(p => ({ ...p, prompt:e.target.value }))} placeholder="Focus on…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[70px] text-sm" />
            </div>
            <Button data-testid="button-ai-generate" onClick={() => call("generate", genConfig, d => setGenResult(d.content))} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Generating…" : "✨ Generate"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 overflow-y-auto" style={{ maxHeight:"400px" }}>
            {genResult.length === 0 ? <div className="text-zinc-600 text-sm text-center py-8">Sections appear here</div> : genResult.map((s: any, i: number) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 mb-2">
                <div className="font-semibold text-zinc-100 text-sm">{s.title || `Section ${i+1}`}</div>
                <div className="text-zinc-400 text-xs mt-1">{s.body || s.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAI === "seo" && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-100 mb-3">🔍 AI SEO Optimizer</h3>
            {!page && <div className="text-amber-400 text-sm mb-3">Select a page from Pages Library first.</div>}
            <Button data-testid="button-ai-seo" onClick={() => call("seo", { title:page?.title||"Page", content:JSON.stringify(page?.content||[]).slice(0,500), pageType:page?.pageType||"custom" }, d => setSeoResult(d.seo))} disabled={loading||!page} className="bg-violet-700 hover:bg-violet-600">{loading ? "Analyzing…" : "🔍 Analyze & Optimize"}</Button>
          </div>
          {seoResult && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div><Label className="text-zinc-400 text-xs">Optimised Title</Label><div className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-zinc-100 text-sm mt-1">{seoResult.seoTitle}</div></div>
                <div><Label className="text-zinc-400 text-xs">Meta Description</Label><div className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-zinc-100 text-sm mt-1">{seoResult.seoDescription}</div></div>
                <div>
                  <Label className="text-zinc-400 text-xs">Keywords</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">{(seoResult.keywords||[]).map((k: string) => <span key={k} className="bg-blue-900/40 border border-blue-700/40 text-blue-300 px-2 py-0.5 rounded text-xs">{k}</span>)}</div>
                </div>
                {seoResult.readability && <div><Label className="text-zinc-400 text-xs">Readability</Label><div className="text-sm text-zinc-200 mt-1">{seoResult.readability}</div></div>}
                {(seoResult.suggestions||[]).length > 0 && <div><Label className="text-zinc-400 text-xs">Tips</Label><ul className="mt-1 space-y-1">{seoResult.suggestions.map((s: string, i: number) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-400">✓</span>{s}</li>)}</ul></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {activeAI === "schema" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🔗 JSON-LD Structured Data</h3>
            <p className="text-zinc-500 text-xs">Generates Schema.org JSON-LD for Google rich results — dramatically improves search visibility.</p>
            {!page && <div className="text-amber-400 text-sm">Select a page first.</div>}
            <Button data-testid="button-ai-schema" onClick={() => call("schema-ld", { pageType:page?.pageType||"homepage", title:page?.title||"Page", description:page?.seoDescription||"" }, d => setSchemaResult(d.schemaJson))} disabled={loading||!page} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Generating…" : "🔗 Generate JSON-LD"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-100 mb-3">JSON-LD Output</h3>
            {schemaResult ? <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">{schemaResult}</pre> : <div className="text-zinc-600 text-sm text-center py-8">JSON-LD will appear here</div>}
          </div>
        </div>
      )}

      {activeAI === "translate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🌍 Single Language Translate</h3>
            <div>
              <Label className="text-zinc-300 text-xs">Target Language</Label>
              <Select value={transConfig.targetLanguage} onValueChange={v => setTransConfig(p => ({ ...p, targetLanguage:v }))}>
                <SelectTrigger data-testid="select-trans-lang" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{LANGUAGES.filter(l => l.code !== "en").map(l => <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Text</Label>
              <Textarea data-testid="input-trans-text" value={transConfig.text} onChange={e => setTransConfig(p => ({ ...p, text:e.target.value }))} placeholder="Paste text to translate…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[100px] text-sm" />
            </div>
            <Button data-testid="button-ai-translate" onClick={() => call("translate", transConfig, d => setTransResult(d.translated))} disabled={loading||!transConfig.text} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Translating…" : "🌍 Translate"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">{transResult ? <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-200 text-sm whitespace-pre-wrap">{transResult}</div> : <div className="text-zinc-600 text-sm text-center py-8">Translation appears here</div>}</div>
        </div>
      )}

      {activeAI === "bulk-translate" && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🌐 Bulk Translate to 4 African Languages Simultaneously</h3>
            <div>
              <Label className="text-zinc-300 text-xs">Select Languages (up to 4)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.filter(l => l.code !== "en").map(l => (
                  <button key={l.code} onClick={() => setBulkConfig(p => ({ ...p, languages: p.languages.includes(l.code) ? p.languages.filter(x => x !== l.code) : [...p.languages.slice(0,3), l.code] }))} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${bulkConfig.languages.includes(l.code) ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{langFlag(l.code)} {l.name}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Source Text</Label>
              <Textarea value={bulkConfig.text} onChange={e => setBulkConfig(p => ({ ...p, text:e.target.value }))} placeholder="Paste text to bulk-translate…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px] text-sm" />
            </div>
            <Button onClick={() => call("bulk-translate", bulkConfig, d => setBulkResult(d.translations))} disabled={loading||!bulkConfig.text||bulkConfig.languages.length === 0} className="bg-violet-700 hover:bg-violet-600">{loading ? "Translating all…" : `🌐 Translate to ${bulkConfig.languages.length} languages`}</Button>
          </div>
          {Object.keys(bulkResult).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(bulkResult).map(([lang, text]) => (
                <div key={lang} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><span className="text-lg">{langFlag(lang)}</span><span className="font-medium text-zinc-100 text-sm">{LANGUAGES.find(l => l.code === lang)?.name || lang}</span></div>
                  <div className="text-zinc-300 text-sm">{String(text)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeAI === "ussd" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">📟 USSD Feature-Phone Version</h3>
            <p className="text-zinc-400 text-sm">600M+ Africans on feature phones. Generate a USSD plain-text version of any page — zero data required.</p>
            {!page && <div className="text-amber-400 text-sm">Select a page first.</div>}
            <Button data-testid="button-ai-ussd" onClick={() => call("ussd", { content:JSON.stringify(page?.content||[]), pageTitle:page?.title||"Page" }, d => setUssdResult(d.ussd))} disabled={loading||!page} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Generating…" : "📟 Generate USSD Version"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">{ussdResult ? <div className="bg-black border border-green-700 rounded-lg p-4 font-mono text-green-400 text-xs whitespace-pre-wrap">{ussdResult}</div> : <div className="text-zinc-600 text-sm text-center py-8">USSD output appears here</div>}</div>
        </div>
      )}

      {activeAI === "image-prompt" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🖼️ AI Image Prompt Generator</h3>
            <p className="text-zinc-400 text-sm">Generate culturally-authentic, Africa-first image prompts for Midjourney / DALL-E / Stable Diffusion.</p>
            <div>
              <Label className="text-zinc-300 text-xs">Section Name</Label>
              <Input value={imgConfig.sectionName} onChange={e => setImgConfig(p => ({ ...p, sectionName:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Style</Label>
              <Select value={imgConfig.style} onValueChange={v => setImgConfig(p => ({ ...p, style:v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["photorealistic","illustration","flat design","3D render","watercolor"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => call("image-prompt", { sectionName:imgConfig.sectionName, pageType:page?.pageType||"homepage", style:imgConfig.style }, d => setImagePrompt(d.imagePrompt))} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-600">{loading ? "Generating…" : "🖼️ Generate Prompt"}</Button>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">{imagePrompt ? <div className="bg-zinc-900 border border-violet-700/40 rounded-lg p-4 text-violet-200 text-sm italic">"{imagePrompt}"<div className="mt-3 text-xs text-zinc-500">Copy this prompt into Midjourney, DALL-E 3, or Stable Diffusion</div></div> : <div className="text-zinc-600 text-sm text-center py-8">Image prompt appears here</div>}</div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: Version History + Diff ───────────────────────────────────────────
function VersionHistoryTab({ page }: { page: CmsPage | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [diffView, setDiffView] = useState<{ a: CmsVersion; b: CmsVersion } | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const { data: versionsData, isLoading } = useQuery({
    queryKey: ["/api/cms/versions", page?.id],
    queryFn: () => page ? apiRequest("GET", `/api/cms/pages/${page.id}/versions`).then(r => r.json()) : Promise.resolve({ versions:[] }),
    enabled: !!page,
  });

  const rollbackMut = useMutation({
    mutationFn: (vId: string) => apiRequest("POST", `/api/cms/pages/${page!.id}/versions/${vId}/rollback`).then(r => r.json()),
    onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/cms/versions", page?.id] }); qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Rolled back!", description: d.message }); },
  });

  const versions: CmsVersion[] = versionsData?.versions || [];

  const toggleSelectVersion = (id: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const runDiff = () => {
    if (selectedVersions.length !== 2) return;
    const a = versions.find(v => v.id === selectedVersions[0])!;
    const b = versions.find(v => v.id === selectedVersions[1])!;
    setDiffView({ a, b });
  };

  if (!page) return (
    <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
      <div className="text-5xl mb-4">📜</div>
      <div className="text-lg font-medium">No page selected</div>
      <div className="text-sm mt-2">Select a page to view its version history</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-zinc-100">📜 Immutable Version History — {page.title}</h3>
          <div className="text-zinc-500 text-sm">Every save auto-snapshots • SHA-256 sealed • One-click rollback</div>
        </div>
        <div className="flex gap-2 items-center">
          {selectedVersions.length === 2 && <Button size="sm" onClick={runDiff} className="bg-blue-700 hover:bg-blue-600 text-xs">🔍 Compare Selected</Button>}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">{versions.length} versions</div>
        </div>
      </div>

      {diffView && (
        <div className="bg-zinc-900 border border-blue-700/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-300">🔍 Diff — v{diffView.a.version} vs v{diffView.b.version}</h4>
            <Button size="sm" variant="ghost" onClick={() => setDiffView(null)} className="text-zinc-400 text-xs">✕</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[diffView.a, diffView.b].map((v, i) => (
              <div key={v.id} className={`rounded-lg p-3 border text-xs font-mono overflow-auto max-h-48 ${i === 0 ? "bg-red-950/20 border-red-800/30" : "bg-emerald-950/20 border-emerald-800/30"}`}>
                <div className={`font-semibold mb-2 ${i === 0 ? "text-red-400" : "text-emerald-400"}`}>v{v.version} — {new Date(v.createdAt).toLocaleString()}</div>
                <div className="text-zinc-300"><div><b>Title:</b> {v.title || "—"}</div><div><b>Status:</b> {v.status || "—"}</div><div><b>Sections:</b> {Array.isArray(v.content) ? v.content.length : 0}</div><div><b>Note:</b> {v.changeNote || "—"}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? <div className="text-center py-12 text-zinc-500">Loading versions…</div> : versions.length === 0 ? (
        <div className="text-center py-12 text-zinc-500"><div className="text-4xl mb-3">📜</div><div>No versions yet. Save the page in the Visual Builder.</div></div>
      ) : (
        <div className="space-y-2">
          {selectedVersions.length > 0 && selectedVersions.length < 2 && <div className="text-blue-400 text-xs">Select one more version to compare</div>}
          {versions.map((v, i) => (
            <div key={v.id} data-testid={`version-item-${v.id}`} className={`rounded-xl border p-4 transition-all ${i === 0 ? "border-violet-500/50 bg-violet-950/20" : selectedVersions.includes(v.id) ? "border-blue-500/50 bg-blue-950/20" : "border-zinc-700 bg-zinc-900/30"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <input type="checkbox" checked={selectedVersions.includes(v.id)} onChange={() => toggleSelectVersion(v.id)} className="rounded" />
                    <div className={`rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-violet-700" : "bg-zinc-700"}`}>v{v.version}</div>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-100">{v.changeNote || "Updated"}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{new Date(v.createdAt).toLocaleString()} · {v.diffSummary || ""}</div>
                    {v.title && <div className="text-zinc-400 text-xs mt-0.5">"{v.title}"</div>}
                    {v.status && <span className={`inline-block px-2 py-0.5 rounded-full text-xs border font-medium mt-1 ${statusColor(v.status)}`}>{v.status}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {i > 0 && <Button data-testid={`button-rollback-${v.id}`} size="sm" variant="outline" onClick={() => rollbackMut.mutate(v.id)} disabled={rollbackMut.isPending} className="border-amber-600 text-amber-400 text-xs h-7">↩ Rollback</Button>}
                  {i === 0 && <span className="text-xs text-violet-400 font-medium px-2 py-1 bg-violet-950/40 rounded-lg">Current</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 5: SEO & Performance Suite ─────────────────────────────────────────
function SEOPerformanceTab({ page }: { page: CmsPage | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [seoData, setSeoData] = useState({ seoTitle:"", seoDescription:"", seoKeywords:"", ogImage:"", language:"en", scheduledAt:"", isABTest:false, abVariant:"A" });

  useEffect(() => {
    if (page) setSeoData({ seoTitle:page.seoTitle||"", seoDescription:page.seoDescription||"", seoKeywords:page.seoKeywords||"", ogImage:page.ogImage||"", language:page.language||"en", scheduledAt:page.scheduledAt ? page.scheduledAt.slice(0,16) : "", isABTest:page.isABTest||false, abVariant:page.abVariant||"A" });
  }, [page?.id]);

  const { data: perfData } = useQuery({
    queryKey: ["/api/cms/performance", page?.id],
    queryFn: () => page ? apiRequest("GET", `/api/cms/performance/${page.id}`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!page,
  });

  const { data: abData } = useQuery({
    queryKey: ["/api/cms/ab-results", page?.id],
    queryFn: () => page && page.isABTest ? apiRequest("GET", `/api/cms/pages/${page.id}/ab-results`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!page,
  });

  const saveMut = useMutation({
    mutationFn: (d: any) => apiRequest("PATCH", `/api/cms/pages/${page!.id}`, d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Saved ✓" }); },
  });
  const publishMut = useMutation({ mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/publish`).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Published 🚀" }); } });
  const unpublishMut = useMutation({ mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/unpublish`).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Unpublished" }); } });
  const scheduleMut = useMutation({ mutationFn: (d: string) => apiRequest("POST", `/api/cms/pages/${page!.id}/schedule`, { scheduledAt:d }).then(r => r.json()), onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "Scheduled!", description: d.message }); } });

  const charCount = seoData.seoDescription.length;
  const charColor = charCount > 160 ? "text-red-400" : charCount > 140 ? "text-amber-400" : "text-emerald-400";
  const { grade, color: gradeColor } = scoreGrade(perfData?.seoScore || 0);

  const vitals = perfData?.coreWebVitals ? [
    { subject: "LCP", score: perfData.coreWebVitals.LCP?.includes("Good") ? 90 : 60 },
    { subject: "FID", score: perfData.coreWebVitals.FID?.includes("Good") ? 95 : 65 },
    { subject: "CLS", score: perfData.coreWebVitals.CLS?.includes("Good") ? 90 : 60 },
    { subject: "TTFB", score: perfData.coreWebVitals.TTFB?.includes("Good") ? 85 : 55 },
  ] : [];

  if (!page) return (
    <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
      <div className="text-5xl mb-4">🔍</div>
      <div className="text-lg font-medium">No page selected</div>
      <div className="text-sm mt-2">Select a page from Pages Library</div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* SEO Health Score */}
      {perfData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className={`text-6xl font-bold ${gradeColor}`}>{grade}</div>
            <div className="text-zinc-400 text-sm mt-1">SEO Score</div>
            <div className={`text-3xl font-bold mt-1 ${gradeColor}`}>{perfData.seoScore}/100</div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-3">
              <div className="bg-violet-500 h-2 rounded-full transition-all" style={{ width:`${perfData.seoScore}%` }} />
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm font-semibold text-zinc-200 mb-3">Core Web Vitals</div>
            {vitals.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <RadarChart data={vitals} cx="50%" cy="50%">
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:"#71717a", fontSize:10 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} />
                  <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <div className="text-zinc-600 text-xs text-center py-4">No data yet</div>}
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm font-semibold text-zinc-200 mb-3">Improvements</div>
            <ul className="space-y-1.5">
              {(perfData.recommendations||[]).slice(0,5).map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400"><span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>{r}</li>
              ))}
              {(perfData.recommendations||[]).length === 0 && <li className="text-emerald-400 text-xs">All checks passed!</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SEO Editor */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-zinc-100">🔍 SEO Metadata</h3>
          <div>
            <Label className="text-zinc-300 text-xs">SEO Title</Label>
            <Input data-testid="input-seo-title" value={seoData.seoTitle} onChange={e => setSeoData(p => ({ ...p, seoTitle:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            <div className="text-xs text-zinc-600 mt-0.5">{seoData.seoTitle.length}/60 chars</div>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Meta Description</Label>
            <Textarea data-testid="input-seo-description" value={seoData.seoDescription} onChange={e => setSeoData(p => ({ ...p, seoDescription:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]" />
            <div className={`text-xs mt-0.5 ${charColor}`}>{charCount}/160 chars</div>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Keywords</Label>
            <Input data-testid="input-seo-keywords" value={seoData.seoKeywords} onChange={e => setSeoData(p => ({ ...p, seoKeywords:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">OG Image URL</Label>
            <Input data-testid="input-og-image" value={seoData.ogImage} onChange={e => setSeoData(p => ({ ...p, ogImage:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Language</Label>
            <Select value={seoData.language} onValueChange={v => setSeoData(p => ({ ...p, language:v }))}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{langFlag(l.code)} {l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button data-testid="button-save-seo" onClick={() => saveMut.mutate({ seoTitle:seoData.seoTitle, seoDescription:seoData.seoDescription, seoKeywords:seoData.seoKeywords, ogImage:seoData.ogImage, language:seoData.language })} disabled={saveMut.isPending} className="w-full bg-violet-700 hover:bg-violet-600">{saveMut.isPending ? "Saving…" : "💾 Save SEO"}</Button>

          {/* SERP Preview */}
          <div className="bg-white rounded-lg p-3 mt-2">
            <div className="text-xs text-gray-400 mb-1">Google Preview</div>
            <div className="text-blue-600 font-medium text-sm line-clamp-1">{seoData.seoTitle || page.title} — FreelanceSkills.net</div>
            <div className="text-green-700 text-xs">freelanceskills.net/{page.slug}</div>
            <div className="text-gray-600 text-xs mt-1 line-clamp-2">{seoData.seoDescription || "No description."}</div>
          </div>
        </div>

        {/* Publishing + A/B */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🚀 Publishing Controls</h3>
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <div>
                <div className="text-zinc-100 text-sm">Current Status</div>
                <div className="text-xs mt-0.5 text-zinc-500">{page.publishedAt ? `Published ${new Date(page.publishedAt).toLocaleDateString()}` : "Not published"}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs border font-medium ${statusColor(page.status)}`}>{page.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button data-testid="button-publish-page" onClick={() => publishMut.mutate()} disabled={publishMut.isPending||page.status==="published"} className="bg-emerald-700 hover:bg-emerald-600 text-xs h-9">🚀 Publish</Button>
              <Button data-testid="button-unpublish-page" onClick={() => unpublishMut.mutate()} disabled={unpublishMut.isPending||page.status==="draft"} variant="outline" className="border-zinc-600 text-zinc-300 text-xs h-9">↩ Unpublish</Button>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">⏰ Schedule Publishing</h3>
            <Input data-testid="input-schedule-date" type="datetime-local" value={seoData.scheduledAt} onChange={e => setSeoData(p => ({ ...p, scheduledAt:e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            <Button data-testid="button-schedule-page" onClick={() => scheduleMut.mutate(seoData.scheduledAt)} disabled={scheduleMut.isPending||!seoData.scheduledAt} className="w-full bg-blue-700 hover:bg-blue-600">{scheduleMut.isPending ? "…" : "⏰ Schedule"}</Button>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-zinc-100">🧪 A/B Testing</h3>
            <div className="flex items-center justify-between"><div><div className="text-zinc-200 text-sm">Enable A/B Test</div><div className="text-zinc-500 text-xs">Split-test two page variants</div></div><Switch data-testid="switch-ab-test" checked={seoData.isABTest} onCheckedChange={v => setSeoData(p => ({ ...p, isABTest:v }))} /></div>
            {seoData.isABTest && (
              <div>
                <Label className="text-zinc-300 text-xs">This page is Variant</Label>
                <Select value={seoData.abVariant} onValueChange={v => setSeoData(p => ({ ...p, abVariant:v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 w-24"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem></SelectContent>
                </Select>
              </div>
            )}
            {abData && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 space-y-1.5">
                <div className="text-xs font-semibold text-zinc-200">A/B Results ({abData.confidence} confidence)</div>
                {["A","B"].map(v => (
                  <div key={v} className={`flex justify-between items-center text-xs py-1 px-2 rounded ${v === abData.winner ? "bg-emerald-950/40 border border-emerald-700/30" : ""}`}>
                    <span className="text-zinc-400">Variant {v}{v === abData.winner ? " 🏆" : ""}</span>
                    <span className="text-zinc-200">{abData.results[v]?.conversionRate} conv · {abData.results[v]?.bounceRate} bounce</span>
                  </div>
                ))}
                <div className="text-emerald-400 text-xs">{abData.recommendation}</div>
              </div>
            )}
            <Button data-testid="button-save-abtest" onClick={() => saveMut.mutate({ isABTest:seoData.isABTest, abVariant:seoData.abVariant })} disabled={saveMut.isPending} variant="outline" className="w-full border-zinc-600 text-zinc-300 text-xs">Save A/B Config</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: Dynamic Data Blocks ───────────────────────────────────────────────
function DynamicDataTab() {
  const { data: jobsData } = useQuery({ queryKey:["/api/cms/dynamic/jobs"], queryFn:() => apiRequest("GET","/api/cms/dynamic/jobs").then(r=>r.json()) });
  const { data: coursesData } = useQuery({ queryKey:["/api/cms/dynamic/courses"], queryFn:() => apiRequest("GET","/api/cms/dynamic/courses").then(r=>r.json()) });
  const { data: statsData } = useQuery({ queryKey:["/api/cms/dynamic/stats"], queryFn:() => apiRequest("GET","/api/cms/dynamic/stats").then(r=>r.json()) });

  const jobs = jobsData?.jobs || [];
  const courses = coursesData?.courses || [];
  const stats = statsData?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-zinc-100 mb-1">📡 Dynamic Data Blocks — Live Platform Feeds</h3>
        <div className="text-zinc-500 text-sm">These blocks auto-update from your live database. Embed them in any page and they stay current.</div>
      </div>

      {/* Platform Stats Block */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-zinc-200">📊 Platform Statistics Block</h4>
          <span className="text-xs bg-emerald-900/40 border border-emerald-700/30 text-emerald-400 px-2 py-0.5 rounded-full">{statsData?.source}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Freelancers", value:stats.totalFreelancers?.toLocaleString() || "—", icon:"👨‍💻" },
            { label:"Jobs Posted", value:stats.totalJobs?.toLocaleString() || "—", icon:"📋" },
            { label:"Countries", value:stats.countriesServed || "54", icon:"🌍" },
            { label:"Paid Out", value:stats.totalPaidOut || "—", icon:"💰" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-zinc-100">{s.value}</div>
              <div className="text-xs text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-600">Embed as: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{"{{stats-block}}"}</code> on any page</div>
      </div>

      {/* Live Jobs Feed */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-zinc-200">💼 Live Job Feed Block</h4>
          <span className="text-xs bg-blue-900/40 border border-blue-700/30 text-blue-400 px-2 py-0.5 rounded-full">{jobs.length} jobs</span>
        </div>
        <div className="space-y-2">
          {jobs.slice(0,5).map((job: any, i: number) => (
            <div key={job.id || i} className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
              <div>
                <div className="font-medium text-zinc-200 text-sm">{job.title}</div>
                <div className="text-xs text-zinc-500">{job.category}</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-sm font-medium">R{job.budget?.toLocaleString() || "—"}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${job.status === "open" ? "bg-emerald-900/40 text-emerald-400" : "bg-zinc-700 text-zinc-400"}`}>{job.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-600">Embed as: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{"{{live-jobs-feed}}"}</code></div>
      </div>

      {/* Academy Courses */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-zinc-200">🎓 Academy Courses Block</h4>
          <span className="text-xs bg-violet-900/40 border border-violet-700/30 text-violet-400 px-2 py-0.5 rounded-full">{courses.length} courses</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {courses.map((course: any, i: number) => (
            <div key={course.id || i} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
              <div className="text-xs bg-violet-900/40 text-violet-400 px-1.5 py-0.5 rounded-full w-fit mb-2">{course.level || "beginner"}</div>
              <div className="font-medium text-zinc-200 text-sm">{course.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{course.category} · {course.enrollmentCount} enrolled</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-600">Embed as: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{"{{academy-courses}}"}</code></div>
      </div>
    </div>
  );
}

// ─── TAB 7: Africa Intelligence ───────────────────────────────────────────────
function AfricaIntelligenceTab({ page }: { page: CmsPage | null }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [ussdResult, setUssdResult] = useState(page?.ussdVersion || "");
  const [bulkResult, setBulkResult] = useState<any>({});
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["zu","xh","af","sw"]);
  const [textToTranslate, setTextToTranslate] = useState("");
  const [mobilePreview, setMobilePreview] = useState(false);

  const AFRICA_LANGS = LANGUAGES.filter(l => l.code !== "en" && l.code !== "fr");
  const CULTURAL_BLOCKS = [
    { name:"Mobile Money CTA", desc:"M-Pesa / Airtel / MTN payment onboarding", icon:"📱", color:"bg-emerald-950/40 border-emerald-700/40" },
    { name:"USSD Quick Access", desc:"Feature phone access via *123# codes", icon:"📟", color:"bg-blue-950/40 border-blue-700/40" },
    { name:"Ubuntu Values Banner", desc:"Community-first messaging for African markets", icon:"🤝", color:"bg-violet-950/40 border-violet-700/40" },
    { name:"Local Currency Display", desc:"ZAR/NGN/KES/GHS/EGP multi-currency block", icon:"💱", color:"bg-amber-950/40 border-amber-700/40" },
    { name:"Africa Language Switcher", desc:"Language selector with all 10 African options", icon:"🌍", color:"bg-cyan-950/40 border-cyan-700/40" },
    { name:"Low-Data Mode Banner", desc:"Compact version for 2G/Edge connections", icon:"📶", color:"bg-zinc-800 border-zinc-600" },
    { name:"WhatsApp CTA Block", desc:"Direct WhatsApp contact for African users", icon:"💬", color:"bg-green-950/40 border-green-700/40" },
    { name:"SDG Impact Banner", desc:"SDG 1, 4, 8, 10 goals our platform advances", icon:"🎯", color:"bg-orange-950/40 border-orange-700/40" },
  ];

  const saveMut = useMutation({
    mutationFn: (d: any) => apiRequest("PATCH", `/api/cms/pages/${page!.id}`, d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cms/pages"] }); toast({ title: "USSD version saved ✓" }); },
  });

  const callBulk = async () => {
    if (!textToTranslate) return;
    setLoading(true);
    try {
      const r = await apiRequest("POST", "/api/cms/ai/bulk-translate", { text:textToTranslate, languages:selectedLangs });
      const d = await r.json();
      setBulkResult(d.translations || {});
    } catch { toast({ title:"Translation failed", variant:"destructive" }); }
    finally { setLoading(false); }
  };

  const callUSSD = async () => {
    if (!page) return;
    setLoading(true);
    try {
      const r = await apiRequest("POST", "/api/cms/ai/ussd", { content:JSON.stringify(page.content||[]), pageTitle:page.title });
      const d = await r.json();
      setUssdResult(d.ussd || "");
    } catch { toast({ title:"USSD failed", variant:"destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-zinc-100 mb-1">🌍 Africa Intelligence Suite</h3>
        <div className="text-zinc-500 text-sm">Mobile-first · USSD fallback · 10 languages · Cultural blocks · Local currency · SDG-aligned</div>
      </div>

      {/* Cultural Blocks Grid */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h4 className="font-semibold text-zinc-200 mb-3">🏺 Africa-First Cultural Blocks</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CULTURAL_BLOCKS.map(b => (
            <div key={b.name} className={`rounded-xl border p-3 ${b.color}`}>
              <div className="text-2xl mb-1.5">{b.icon}</div>
              <div className="font-medium text-zinc-100 text-sm">{b.name}</div>
              <div className="text-zinc-500 text-xs mt-1">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Multilingual Bulk Translate */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-zinc-200">🌐 Multilingual Auto-Publish (up to 4 languages)</h4>
        <div>
          <Label className="text-zinc-300 text-xs">Languages</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AFRICA_LANGS.map(l => (
              <button key={l.code} onClick={() => setSelectedLangs(prev => prev.includes(l.code) ? prev.filter(x=>x!==l.code) : [...prev.slice(0,3), l.code])} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedLangs.includes(l.code) ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{langFlag(l.code)} {l.name}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">Text to Translate</Label>
          <Textarea value={textToTranslate} onChange={e => setTextToTranslate(e.target.value)} placeholder="Paste a page headline, description, or any text…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[70px] text-sm" />
        </div>
        <Button onClick={callBulk} disabled={loading||!textToTranslate||selectedLangs.length===0} className="bg-violet-700 hover:bg-violet-600">{loading ? "Translating…" : `🌐 Translate to ${selectedLangs.length} languages`}</Button>
        {Object.keys(bulkResult).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {Object.entries(bulkResult).map(([lang, text]) => (
              <div key={lang} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5"><span>{langFlag(lang)}</span><span className="text-zinc-300 text-xs font-medium">{LANGUAGES.find(l=>l.code===lang)?.name}</span></div>
                <div className="text-zinc-300 text-sm">{String(text)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* USSD Generator */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-zinc-200">📟 USSD Feature-Phone Generator</h4>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-500">
          600M+ Africans use feature phones. USSD (*123# menus) works with zero data. Every CMS page should have a USSD fallback.
        </div>
        <div className="flex gap-2">
          <Button onClick={callUSSD} disabled={loading||!page} className="bg-violet-700 hover:bg-violet-600">{loading ? "Generating…" : "📟 Generate USSD"}</Button>
          {ussdResult && page && <Button onClick={() => saveMut.mutate({ ussdVersion:ussdResult })} className="bg-emerald-700 hover:bg-emerald-600">💾 Save to Page</Button>}
        </div>
        {ussdResult ? (
          <div className="bg-black border border-green-700 rounded-xl p-4 font-mono text-green-400 text-xs whitespace-pre-wrap">{ussdResult}</div>
        ) : (
          <div className="text-zinc-600 text-sm text-center py-6 border border-dashed border-zinc-700 rounded-lg">{page ? "Generate the USSD version above" : "Select a page first"}</div>
        )}
      </div>

      {/* Mobile Preview Toggle */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-zinc-200">📱 Mobile-First Preview</h4>
            <div className="text-zinc-500 text-xs mt-0.5">Test how your page looks on a 360px mobile screen</div>
          </div>
          <Switch checked={mobilePreview} onCheckedChange={setMobilePreview} />
        </div>
        {mobilePreview && page && (
          <div className="mt-4 flex justify-center">
            <div className="bg-zinc-950 border-4 border-zinc-600 rounded-3xl p-2 w-[360px]" style={{ maxHeight:"500px" }}>
              <div className="bg-white rounded-2xl h-full overflow-auto p-4 text-gray-900 text-xs space-y-3">
                <div className="bg-purple-600 text-white text-center py-2 px-4 rounded-lg font-bold">FreelanceSkills.net</div>
                {(page.content || []).map((sec: any, i: number) => (
                  <div key={i} className="border-b border-gray-100 pb-2">
                    <div className="font-bold text-sm">{sec.data?.headline || sec.name}</div>
                    {sec.data?.body && <div className="text-gray-500 text-xs mt-0.5 line-clamp-3">{sec.data.body}</div>}
                    {sec.data?.cta && <div className="bg-purple-600 text-white text-center rounded px-2 py-1 text-xs mt-1">{sec.data.cta}</div>}
                  </div>
                ))}
                {(!page.content || (page.content as any[]).length === 0) && <div className="text-gray-400 text-center py-4">Empty page — add sections in Visual Builder</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 8: Collaboration & Approval ─────────────────────────────────────────
function CollaborationTab({ page }: { page: CmsPage | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("comment");

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["/api/cms/comments", page?.id],
    queryFn: () => page ? apiRequest("GET", `/api/cms/pages/${page.id}/comments`).then(r => r.json()) : Promise.resolve({ comments:[] }),
    enabled: !!page, refetchInterval: 15000,
  });

  const addMut = useMutation({
    mutationFn: (d: any) => apiRequest("POST", `/api/cms/pages/${page!.id}/comments`, d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/comments", page?.id] }); setCommentText(""); toast({ title:"Comment added" }); },
  });
  const resolveMut = useMutation({
    mutationFn: (cId: string) => apiRequest("PATCH", `/api/cms/pages/${page!.id}/comments/${cId}/resolve`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/comments", page?.id] }); toast({ title:"Resolved" }); },
  });
  const requestReviewMut = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/request-review`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/pages"] }); toast({ title:"Review requested" }); },
  });
  const approveMut = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cms/pages/${page!.id}/approve`, { note:"Approved — ready to publish" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/pages"] }); toast({ title:"Page approved!", description:"Ready to publish" }); },
  });

  const comments: Comment[] = commentsData?.comments || [];
  const openComments = comments.filter(c => !c.resolved);
  const resolved = comments.filter(c => c.resolved);
  const reviewStatus = (page?.metadata as any)?.reviewStatus;

  if (!page) return (
    <div className="flex flex-col items-center justify-center h-80 text-zinc-500">
      <div className="text-5xl mb-4">👥</div>
      <div className="text-lg font-medium">No page selected</div>
      <div className="text-sm mt-2">Select a page to view collaboration</div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Approval workflow */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-100 mb-3">📋 Approval Workflow — {page.title}</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {[
              { step:"Draft", done:true }, { step:"Review Requested", done:!!reviewStatus }, { step:"Approved", done:reviewStatus==="approved" }, { step:"Published", done:page.status==="published" }
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? "bg-emerald-700 text-white" : "bg-zinc-700 text-zinc-400"}`}>{s.done ? "✓" : i+1}</div>
                  <div className={`text-xs mt-1 ${s.done ? "text-emerald-400" : "text-zinc-500"}`}>{s.step}</div>
                </div>
                {i < arr.length-1 && <div className={`h-0.5 w-8 ${arr[i+1].done ? "bg-emerald-700" : "bg-zinc-700"}`} />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button size="sm" onClick={() => requestReviewMut.mutate()} disabled={requestReviewMut.isPending||!!reviewStatus} variant="outline" className="border-blue-600 text-blue-400">📋 Request Review</Button>
          <Button size="sm" onClick={() => approveMut.mutate()} disabled={approveMut.isPending||reviewStatus==="approved"} className="bg-emerald-700 hover:bg-emerald-600">✅ Approve</Button>
        </div>
        {reviewStatus && <div className={`mt-2 text-xs ${reviewStatus==="approved" ? "text-emerald-400" : "text-blue-400"}`}>Review status: {reviewStatus}</div>}
      </div>

      {/* Comments */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-100">💬 Comments & Annotations</h3>
          <div className="flex gap-2 text-xs text-zinc-500">
            <span>{openComments.length} open</span>
            <span>·</span>
            <span>{resolved.length} resolved</span>
          </div>
        </div>

        {/* Add comment */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={commentType} onValueChange={setCommentType}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["comment","suggestion","approval","issue"].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Input data-testid="input-comment" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment or suggestion…" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm flex-1" />
            <Button size="sm" onClick={() => addMut.mutate({ text:commentText, type:commentType })} disabled={addMut.isPending||!commentText} className="bg-violet-700 hover:bg-violet-600 text-xs">Send</Button>
          </div>
        </div>

        {/* Comment list */}
        {isLoading ? <div className="text-zinc-500 text-sm text-center py-4">Loading…</div> : comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">No comments yet. Add the first one above.</div>
        ) : (
          <div className="space-y-2">
            {openComments.map(c => (
              <div key={c.id} data-testid={`comment-${c.id}`} className={`rounded-lg border p-3 ${c.type==="issue" ? "border-red-700/40 bg-red-950/20" : c.type==="approval" ? "border-emerald-700/40 bg-emerald-950/20" : c.type==="suggestion" ? "border-blue-700/40 bg-blue-950/20" : "border-zinc-700 bg-zinc-900/40"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.type==="issue" ? "bg-red-900/40 text-red-400" : c.type==="approval" ? "bg-emerald-900/40 text-emerald-400" : c.type==="suggestion" ? "bg-blue-900/40 text-blue-400" : "bg-zinc-700 text-zinc-400"}`}>{c.type}</span>
                      <span className="text-zinc-600 text-xs">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-zinc-200 text-sm">{c.text}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => resolveMut.mutate(c.id)} className="text-zinc-500 hover:text-emerald-400 text-xs h-6">✓ Resolve</Button>
                </div>
              </div>
            ))}
            {resolved.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400">{resolved.length} resolved comment{resolved.length !== 1 ? "s" : ""}</summary>
                <div className="space-y-1.5 mt-2">
                  {resolved.map(c => (
                    <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-2 opacity-50">
                      <div className="text-zinc-400 text-xs line-through">{c.text}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 9: Integration Hub ───────────────────────────────────────────────────
function IntegrationHubTab({ page }: { page: CmsPage | null }) {
  const { toast } = useToast();
  const [tosLoading, setTosLoading] = useState(false);
  const [tosResult, setTosResult] = useState<any>(null);

  const { data: intData } = useQuery({
    queryKey: ["/api/cms/integration/status"],
    queryFn: () => apiRequest("GET", "/api/cms/integration/status").then(r => r.json()),
    refetchInterval: 60000,
  });

  const triggerTOS = async () => {
    if (!page) return;
    setTosLoading(true);
    try {
      const r = await apiRequest("POST", "/api/cms/integration/notify-tos", { pageId:page.id, changeType:"terms-update" });
      const d = await r.json();
      setTosResult(d);
      toast({ title: "TOS hook triggered!", description: d.message });
    } catch { toast({ title:"Hook failed", variant:"destructive" }); }
    finally { setTosLoading(false); }
  };

  const depts = intData?.departments || [];

  const DEPT_ICONS: Record<string,string> = { "Notifications":"🔔", "Content Moderation":"🛡️", "Promotions":"🎯", "Marketing":"📢", "Analytics":"📊", "Subscriptions":"💳", "Security":"🔐", "Audit Logs":"📋", "System Settings":"⚙️", "Academy":"🎓", "Category & Skills":"🏷️" };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-zinc-100 mb-1">🔗 Integration Hub — 11 Department Hooks</h3>
        <div className="text-zinc-500 text-sm">Every CMS action ripples intelligently across all departments — zero manual sync required.</div>
      </div>

      {/* Department grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {depts.map((dept: any) => (
          <div key={dept.name} className="bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 rounded-xl p-4 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{DEPT_ICONS[dept.name] || "🔌"}</span>
                <div>
                  <div className="font-medium text-zinc-100 text-sm">{dept.name}</div>
                  <div className="text-zinc-500 text-xs">{dept.endpoint}</div>
                </div>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${dept.status==="active" ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                {dept.status === "active" ? "● Live" : "✕ Off"}
              </span>
            </div>
            <div className="text-zinc-500 text-xs mt-1">{dept.hook}</div>
            <div className="text-zinc-700 text-xs mt-1">Last sync: {new Date(dept.lastSync).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      {/* TOS Change Trigger */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-zinc-200">⚡ TOS / Privacy Change Integration Trigger</h4>
        <div className="text-zinc-500 text-sm">When you update Terms of Service or Privacy Policy, this trigger automatically: notifies all users, updates email templates, pauses active marketing campaigns, logs to Audit chain, and sends USSD alerts to Africa.</div>
        {!page && <div className="text-amber-400 text-sm">Select a TOS or Privacy page first.</div>}
        <Button onClick={triggerTOS} disabled={tosLoading||!page} className="bg-orange-700 hover:bg-orange-600">{tosLoading ? "Triggering…" : "⚡ Trigger TOS Update Hook"}</Button>
        {tosResult && (
          <div className="bg-zinc-900 border border-emerald-700/40 rounded-lg p-4 space-y-1.5 text-sm">
            {[
              { label:"Notifications", value:tosResult.notificationsTriggered ? "✓ Triggered" : "✕", ok:tosResult.notificationsTriggered },
              { label:"Email Templates", value:tosResult.emailTemplatesUpdated?.join(", ") || "—", ok:!!tosResult.emailTemplatesUpdated },
              { label:"Users to Notify", value:tosResult.usersToNotify, ok:!!tosResult.usersToNotify },
              { label:"SMS/USSD Alert", value:tosResult.smsAlert, ok:!!tosResult.smsAlert },
              { label:"Audit Logged", value:tosResult.auditLogged ? "✓ SHA-256 sealed" : "✕", ok:tosResult.auditLogged },
              { label:"Marketing Paused", value:tosResult.marketingCampaignPaused ? "✓ Active campaigns paused" : "Not required", ok:true },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs">{r.label}</span>
                <span className={`text-xs font-medium ${r.ok ? "text-emerald-400" : "text-zinc-500"}`}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 10: Component Library v2 ─────────────────────────────────────────────
function ComponentLibraryTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newBlock, setNewBlock] = useState({ name:"", category:"content", blockType:"", description:"", isGlobal:false });

  const { data: blocksData, isLoading } = useQuery({
    queryKey: ["/api/cms/blocks", catFilter],
    queryFn: () => apiRequest("GET", `/api/cms/blocks?category=${catFilter}`).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => apiRequest("POST", "/api/cms/blocks", d).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/blocks"] }); setShowNew(false); setNewBlock({ name:"", category:"content", blockType:"", description:"", isGlobal:false }); toast({ title:"Block created" }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/blocks/${id}`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["/api/cms/blocks"] }); toast({ title:"Block deleted" }); },
  });

  const blocks: CmsBlock[] = blocksData?.blocks || [];
  const filtered = blocks.filter(b => search === "" || b.name.toLowerCase().includes(search.toLowerCase()) || (b.description||"").toLowerCase().includes(search.toLowerCase()));
  const catCounts: Record<string,number> = {};
  blocks.forEach(b => { catCounts[b.category] = (catCounts[b.category]||0)+1; });
  const chartData = Object.entries(catCounts).map(([cat, count]) => ({ cat, count }));

  return (
    <div className="space-y-5">
      {chartData.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-sm font-medium text-zinc-300 mb-2">Blocks by Category</div>
          <ResponsiveContainer width="100%" height={72}>
            <BarChart data={chartData} margin={{ top:0, right:0, bottom:0, left:0 }}>
              <XAxis dataKey="cat" tick={{ fill:"#71717a", fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor:"#18181b", border:"1px solid #3f3f46", borderRadius:"6px", fontSize:"12px" }} />
              <Bar dataKey="count" radius={[4,4,0,0]}>{chartData.map(e => <Cell key={e.cat} fill={CAT_COLORS[e.cat]||"#6b7280"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input data-testid="input-block-search" placeholder="Search blocks…" value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-44" />
          <div className="flex gap-1 flex-wrap">
            {BLOCK_CATEGORIES.map(cat => (
              <button key={cat} data-testid={`filter-block-cat-${cat}`} onClick={() => setCatFilter(cat)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter===cat ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{cat==="all"?"All":cat.charAt(0).toUpperCase()+cat.slice(1)}</button>
            ))}
          </div>
        </div>
        <Button data-testid="button-new-block" size="sm" onClick={() => setShowNew(true)} className="bg-violet-600 hover:bg-violet-700">+ New Block</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-zinc-500">Loading…</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(block => (
            <div key={block.id} data-testid={`block-card-${block.id}`} className="bg-zinc-800/60 border border-zinc-700 hover:border-zinc-500 rounded-xl p-4 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor:`${CAT_COLORS[block.category]||"#6b7280"}22`, border:`1px solid ${CAT_COLORS[block.category]||"#6b7280"}44` }}>
                  {CAT_ICONS[block.category]||"📦"}
                </div>
                {!block.isBuiltIn && <button onClick={() => deleteMut.mutate(block.id)} className="opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity">✕</button>}
              </div>
              <div className="font-medium text-zinc-100 text-sm">{block.name}</div>
              {block.description && <div className="text-zinc-500 text-xs mt-1 line-clamp-2">{block.description}</div>}
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor:`${CAT_COLORS[block.category]||"#6b7280"}22`, color:CAT_COLORS[block.category]||"#9ca3af" }}>{block.category}</span>
                {block.isBuiltIn && <span className="text-xs bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded">Built-in</span>}
                {block.isGlobal && <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded">Global</span>}
              </div>
              {(block.usageCount||0) > 0 && <div className="text-xs text-zinc-600 mt-1.5">Used {block.usageCount}×</div>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-md">
          <DialogHeader><DialogTitle>Create Custom Block</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-zinc-300 text-xs">Block Name *</Label><Input data-testid="input-new-block-name" value={newBlock.name} onChange={e => setNewBlock(p=>({...p, name:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div><Label className="text-zinc-300 text-xs">Block Type Key *</Label><Input data-testid="input-new-block-type" value={newBlock.blockType} onChange={e => setNewBlock(p=>({...p, blockType:e.target.value.toLowerCase().replace(/\s+/g,"-")}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div>
              <Label className="text-zinc-300 text-xs">Category</Label>
              <Select value={newBlock.category} onValueChange={v => setNewBlock(p=>({...p, category:v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{BLOCK_CATEGORIES.filter(c=>c!=="all").map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-zinc-300 text-xs">Description</Label><Input data-testid="input-new-block-desc" value={newBlock.description} onChange={e => setNewBlock(p=>({...p, description:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div className="flex items-center justify-between"><Label className="text-zinc-300 text-xs">Global (shared across pages)</Label><Switch checked={newBlock.isGlobal} onCheckedChange={v => setNewBlock(p=>({...p, isGlobal:v}))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNew(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-create-block-confirm" onClick={() => createMut.mutate(newBlock)} disabled={createMut.isPending||!newBlock.name||!newBlock.blockType} className="bg-violet-600 hover:bg-violet-700">{createMut.isPending?"Creating…":"Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
type TabId = "pages"|"builder"|"ai"|"history"|"seo"|"dynamic"|"africa"|"collab"|"integration"|"library";

const TABS: { id: TabId; label: string }[] = [
  { id:"pages", label:"📄 Pages" },
  { id:"builder", label:"🏗️ Builder" },
  { id:"ai", label:"🤖 AI Engine" },
  { id:"history", label:"📜 History" },
  { id:"seo", label:"🔍 SEO & Perf" },
  { id:"dynamic", label:"📡 Live Data" },
  { id:"africa", label:"🌍 Africa" },
  { id:"collab", label:"👥 Collaborate" },
  { id:"integration", label:"🔗 Integrations" },
  { id:"library", label:"📦 Components" },
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
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700/20 border border-violet-700/40 flex items-center justify-center text-xl">🖋️</div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">CMS Management v2.0</h1>
              <div className="text-sm text-zinc-500">37 endpoints · 10 tabs · Africa-first headless CMS built for scale until 2030</div>
            </div>
          </div>
          {selectedPage && (
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
              <span className="text-zinc-500 text-xs">Editing:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${statusColor(selectedPage.status)}`}>{selectedPage.status}</span>
              <span className="font-medium text-zinc-200 text-sm truncate max-w-[200px]">{selectedPage.title}</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPage(null)} className="text-zinc-500 h-6 text-xs">✕</Button>
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-cms-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab===tab.id ? "bg-violet-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === "pages" && <PagesLibraryTab onEditPage={handleEditPage} />}
        {activeTab === "builder" && <VisualBuilderTab page={selectedPage} onClose={() => setActiveTab("pages")} />}
        {activeTab === "ai" && <AgenticAITab page={selectedPage} />}
        {activeTab === "history" && <VersionHistoryTab page={selectedPage} />}
        {activeTab === "seo" && <SEOPerformanceTab page={selectedPage} />}
        {activeTab === "dynamic" && <DynamicDataTab />}
        {activeTab === "africa" && <AfricaIntelligenceTab page={selectedPage} />}
        {activeTab === "collab" && <CollaborationTab page={selectedPage} />}
        {activeTab === "integration" && <IntegrationHubTab page={selectedPage} />}
        {activeTab === "library" && <ComponentLibraryTab />}
      </div>
    </div>
  );
}
