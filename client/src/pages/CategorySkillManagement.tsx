/**
 * CATEGORY & SKILL MANAGEMENT — 200% INTELLIGENCE UPGRADE
 * FreelanceSkills.net — 16th Admin Section
 *
 * 7 SUPERPOWERED TABS:
 * 🌳 Tree View        — Hierarchical tree + real-time search + auto-tag panel
 * 🔧 Skills           — Sort/filter table + search boost + Academy badge + proficiency gauge
 * 📊 Analytics        — Heatmap · Conversion Funnel · Skill Gap Map · 30d Forecast
 * 📬 Suggestions      — AI confidence scores · bulk approve · evidence quality
 * 🎓 Proficiency      — Badge management · Academy links · verification status
 * 🌍 Africa First     — USSD market · mobile money · 11 languages · zero-competition skills
 * 📦 Import/Export    — Hierarchy CSV · validation report · auto-tag from description
 *
 * HOW WE OUTCLASS EVERY COMPETITOR:
 * Upwork   → Static 2012 taxonomy          → We: AI-updated daily, living graph
 * Fiverr   → No proficiency system         → We: 5 levels + Academy badges + client endorsements
 * Freelancer → No analytics                → We: Heatmaps, funnels, AI forecasts, skill gap map
 * PeoplePerHour → No Africa awareness      → We: USSD, M-Pesa, 11 languages, Africa-first intelligence
 * Toptal   → Invite-only, zero democracy   → We: Community voting + AI pre-screening + moderation
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter, ZAxis,
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const G = "#1DBF73";
const AMBER = "#d97706";
const PURPLE = "#7c3aed";
const BLUE = "#2563eb";
const AFRICA = "#059669";
const RED = "#ef4444";

const fmtNum = (n: number) => n>=1_000_000?`${(n/1_000_000).toFixed(1)}M`:n>=1_000?`${(n/1_000).toFixed(1)}K`:String(n||0);
const fmtZAR = (n: number) => `R${n||0}/hr`;
const fmtUSD = (n: number) => `$${n||0}/hr`;
const fmtPct = (n: number) => `${n>0?"+":""}${n}%`;
const cap = (s: string) => s?s.charAt(0).toUpperCase()+s.slice(1).replace(/_/g," "):"";

const LEVEL_COLORS: Record<string,string> = { Beginner:"#10b981", Intermediate:"#f59e0b", Expert:"#7c3aed", Specialist:"#ef4444", Native:"#059669", Fluent:"#0ea5e9", Professional:"#6366f1" };
const STATUS_BG: Record<string,string> = { active:"bg-green-50 text-green-700 border-green-200", hidden:"bg-gray-50 text-gray-500 border-gray-200", deprecated:"bg-red-50 text-red-600 border-red-200", pending:"bg-amber-50 text-amber-700 border-amber-200", approved:"bg-green-50 text-green-700 border-green-200", rejected:"bg-red-50 text-red-600 border-red-200" };
const PIE_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#059669","#64748b"];
const TYPE_ICONS: Record<string,string> = { category:"📁", subcategory:"📂", skill:"🔧" };

// ─── Micro-components ─────────────────────────────────────────────────────────
function Pill({ v, className="" }: { v: string; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${STATUS_BG[v]||"bg-gray-50 text-gray-500 border-gray-200"} ${className}`}>{cap(v)}</span>;
}
function TrendBar({ score, showLabel=true }: { score: number; showLabel?: boolean }) {
  const color = score>=90?RED:score>=75?AMBER:score>=50?BLUE:"#94a3b8";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 bg-gray-100 rounded-full h-1.5 shrink-0">
        <div className="h-1.5 rounded-full" style={{ width:`${Math.min(100,score)}%`, background:color }} />
      </div>
      {showLabel && <span className="text-[10px] font-bold shrink-0" style={{ color }}>{score}</span>}
    </div>
  );
}
function GrowthBadge({ pct }: { pct: number }) {
  if (!pct) return null;
  const color = pct>=50?RED:pct>=20?AMBER:pct>=5?G:"#94a3b8";
  return <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background:color+"20", color }}>{fmtPct(pct)}w</span>;
}
function KPICard({ icon, label, value, sub, color, small }: { icon:string; label:string; value:string|number; sub?:string; color?:string; small?:boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={small?"text-base":"text-xl"}>{icon}</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-black leading-none ${small?"text-xl":"text-2xl"}`} style={{ color:color||"#1f2937" }}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
function SortTh({ label, field, sortBy, sortDir, onSort }: { label:string; field:string; sortBy:string; sortDir:string; onSort:(f:string)=>void }) {
  const active = sortBy===field;
  return (
    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-700" onClick={()=>onSort(field)}>
      {label} {active?(sortDir==="desc"?"↓":"↑"):<span className="text-gray-300">↕</span>}
    </th>
  );
}
function ProficiencyBar({ dist }: { dist: Record<string,number> }) {
  const total = Object.values(dist).reduce((a,b)=>a+b,0);
  return (
    <div className="flex rounded-full overflow-hidden h-2 w-20 gap-px">
      {Object.entries(dist).map(([lvl,pct]) => (
        <div key={lvl} title={`${lvl}: ${pct}%`} style={{ width:`${pct}%`, background:LEVEL_COLORS[lvl]||"#94a3b8" }} />
      ))}
    </div>
  );
}
function BoostToggle({ on, onChange, size="sm" }: { on: boolean; onChange: ()=>void; size?:string }) {
  return (
    <button onClick={onChange} data-testid="btn-boost-toggle"
      className={`relative inline-flex items-center rounded-full transition-colors ${size==="sm"?"w-8 h-4":"w-10 h-5"} ${on?"bg-amber-500":"bg-gray-200"}`}>
      <span className={`inline-block rounded-full bg-white shadow transition-transform ${size==="sm"?"w-3 h-3 mx-0.5":"w-4 h-4 mx-0.5"} ${on?"translate-x-4":"translate-x-0"}`} />
    </button>
  );
}

// ─── HEATMAP Component ────────────────────────────────────────────────────────
function Heatmap({ data, categories }: { data: any[]; categories: string[] }) {
  const maxVal = Math.max(...data.flatMap(row => categories.map(cat => row[cat]||0)));
  const getColor = (val: number) => {
    const intensity = val / maxVal;
    if (intensity >= 0.85) return "#7c3aed";
    if (intensity >= 0.65) return "#a78bfa";
    if (intensity >= 0.45) return "#c4b5fd";
    if (intensity >= 0.25) return "#ede9fe";
    return "#f5f3ff";
  };
  return (
    <div className="overflow-x-auto">
      <table className="text-[10px] border-separate border-spacing-0.5">
        <thead>
          <tr>
            <th className="w-10" />
            {categories.map(cat => <th key={cat} className="text-gray-500 font-semibold px-1 pb-1 text-left whitespace-nowrap">{cat}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.day}>
              <td className="font-semibold text-gray-500 pr-2">{row.day}</td>
              {categories.map(cat => (
                <td key={cat} className="rounded" style={{ background: getColor(row[cat]||0), width: 44, height: 28 }}>
                  <div className="flex items-center justify-center h-full text-[9px] font-bold" style={{ color: (row[cat]||0)/maxVal >= 0.65 ? "#fff" : "#6b21a8" }}>
                    {row[cat]||0}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] text-gray-400">Low</span>
        {["#f5f3ff","#ede9fe","#c4b5fd","#a78bfa","#7c3aed"].map(c => <span key={c} className="w-5 h-3 rounded-sm inline-block" style={{ background:c }} />)}
        <span className="text-[9px] text-gray-400">High</span>
      </div>
    </div>
  );
}

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNode({ node, onAdd, onEdit, onDelete, depth=0, search="" }: {
  node:any; onAdd:(p:any)=>void; onEdit:(i:any)=>void;
  onDelete:(i:any)=>void; depth?:number; search?:string;
}) {
  const [exp, setExp] = useState(depth<2);
  const hasChildren = (node.subcategories?.length||0)+(node.directSkills?.length||0)+(node.skills?.length||0)>0;
  const hidden = search && !node.name.toLowerCase().includes(search.toLowerCase()) && !(node.skills||[]).some((s:any)=>s.name.toLowerCase().includes(search.toLowerCase())) && !(node.subcategories||[]).some((s:any)=>s.name.toLowerCase().includes(search.toLowerCase()));
  if (hidden) return null;
  const bgDepth = depth===0?"border-b border-gray-100":depth===1?"ml-2":"ml-4";

  return (
    <div>
      <div data-testid={`tree-node-${node.id}`}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group transition-colors cursor-pointer ${bgDepth}`}
        style={{ paddingLeft:`${10+depth*18}px` }}>
        {hasChildren
          ? <button onClick={()=>setExp(!exp)} className="text-gray-300 hover:text-gray-600 w-4 text-center text-[10px] shrink-0">{exp?"▼":"▶"}</button>
          : <span className="w-4 shrink-0"/>}
        <span className="text-base leading-none shrink-0">{node.icon}</span>
        <span className={`font-semibold text-gray-900 flex-1 min-w-0 truncate ${depth===0?"text-sm":"text-xs"}`}>{node.name}</span>
        <div className="hidden xl:flex items-center gap-3 text-[10px] text-gray-400 shrink-0">
          {node.gigCount!==undefined&&<span>{fmtNum(node.gigCount)} gigs</span>}
          {node.weeklyGrowth!==undefined&&node.weeklyGrowth!==0&&<GrowthBadge pct={node.weeklyGrowth}/>}
          {node.trendScore!==undefined&&<TrendBar score={node.trendScore} showLabel={false}/>}
          {node.zarRate!==undefined&&node.zarRate>0&&<span className="font-semibold" style={{color:G}}>{fmtZAR(node.zarRate)}</span>}
          {node.searchBoost&&<span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded-full font-bold">🚀 Boosted</span>}
          {node.isEmerging&&<span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1 py-0.5 rounded-full font-bold">🔥</span>}
        </div>
        <Pill v={node.status||"active"}/>
        <span className="text-[9px] text-gray-300 px-1 py-0.5 rounded bg-gray-50 border border-gray-100 shrink-0">{TYPE_ICONS[node.type||"skill"]}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {(node.type==="category"||node.type==="subcategory")&&(
            <button data-testid={`btn-add-child-${node.id}`} onClick={e=>{e.stopPropagation();onAdd(node);}} className="px-2 py-0.5 text-[9px] font-bold text-white rounded" style={{background:G}}>+Add</button>
          )}
          <button data-testid={`btn-edit-${node.id}`} onClick={e=>{e.stopPropagation();onEdit(node);}} className="px-2 py-0.5 text-[9px] font-semibold border border-gray-200 rounded hover:bg-gray-50">Edit</button>
          <button data-testid={`btn-delete-${node.id}`} onClick={e=>{e.stopPropagation();onDelete(node);}} className="px-2 py-0.5 text-[9px] font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">Del</button>
        </div>
      </div>
      {exp&&(
        <div>
          {node.subcategories?.map((sub:any)=><TreeNode key={sub.id} node={sub} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} depth={depth+1} search={search}/>)}
          {node.skills?.map((sk:any)=><TreeNode key={sk.id} node={{...sk,type:"skill"}} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} depth={depth+1} search={search}/>)}
          {node.directSkills?.map((sk:any)=><TreeNode key={sk.id} node={{...sk,type:"skill"}} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} depth={depth+1} search={search}/>)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CategorySkillManagement() {
  const [,navigate] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState("tree");

  // ── Data state ────────────────────────────────────────────────────────────
  const [treeData, setTreeData] = useState<any[]>([]);
  const [treeStats, setTreeStats] = useState<any>({});
  const [skills, setSkills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [africaData, setAfricaData] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Skill filters ─────────────────────────────────────────────────────────
  const [skillSearch, setSkillSearch] = useState("");
  const [skillCat, setSkillCat] = useState("");
  const [skillEmerging, setSkillEmerging] = useState(false);
  const [skillBoosted, setSkillBoosted] = useState(false);
  const [skillRegion, setSkillRegion] = useState("");
  const [sortBy, setSortBy] = useState("usageCount");
  const [sortDir, setSortDir] = useState("desc");
  const [treeSearch, setTreeSearch] = useState("");

  // ── Suggestion filters ────────────────────────────────────────────────────
  const [sugStatus, setSugStatus] = useState("pending");
  const [sugType, setSugType] = useState("");
  const [sugSource, setSugSource] = useState("");
  const [selectedSugs, setSelectedSugs] = useState<string[]>([]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addParent, setAddParent] = useState<any>(null);
  const [addType, setAddType] = useState<"category"|"subcategory"|"skill">("category");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [aiSugOpen, setAiSugOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiSugCat, setAiSugCat] = useState("technology-development");
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importFormat, setImportFormat] = useState("json");
  const [importResult, setImportResult] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [autoTagOpen, setAutoTagOpen] = useState(false);
  const [autoTagDesc, setAutoTagDesc] = useState("");
  const [autoTagResult, setAutoTagResult] = useState<any>(null);
  const [dupCheckName, setDupCheckName] = useState("");
  const [dupResult, setDupResult] = useState<any>(null);

  const [form, setForm] = useState({ name:"", description:"", icon:"🔧", color:"#6b7280", categoryId:"", proficiencyLevels:["Beginner","Intermediate","Expert"] });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string|null>(null);

  const handleSort = (f: string) => { if (sortBy===f) setSortDir(d=>d==="desc"?"asc":"desc"); else { setSortBy(f); setSortDir("desc"); } };

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search:skillSearch, categoryId:skillCat, emerging:String(skillEmerging), boosted:String(skillBoosted), region:skillRegion, sortBy, sortDir });
      const [treeR,skillR,catR,sugR] = await Promise.all([
        fetch("/api/taxonomy/tree"),
        fetch(`/api/taxonomy/skills?${params}`),
        fetch("/api/taxonomy/categories"),
        fetch(`/api/taxonomy/suggestions?status=${sugStatus}&type=${sugType}&source=${sugSource}`),
      ]);
      const [tree,skillD,catD,sugD] = await Promise.all([treeR.json(),skillR.json(),catR.json(),sugR.json()]);
      setTreeData(tree.tree||[]); setTreeStats(tree.stats||{});
      setSkills(skillD.skills||[]); setCategories(catD.categories||[]);
      setSuggestions(sugD.suggestions||[]);
    } catch { toast({ title:"Error loading taxonomy", variant:"destructive" }); }
    finally { setLoading(false); }
  }, [skillSearch,skillCat,skillEmerging,skillBoosted,skillRegion,sortBy,sortDir,sugStatus,sugType,sugSource]);

  const loadAnalytics = useCallback(async () => {
    try { const r = await fetch("/api/taxonomy/analytics"); setAnalytics(await r.json()); } catch {}
  }, []);

  const loadAfrica = useCallback(async () => {
    try { const r = await fetch("/api/taxonomy/africa"); setAfricaData(await r.json()); } catch {}
  }, []);

  const loadBadges = useCallback(async () => {
    try { const r = await fetch("/api/taxonomy/badges"); const d = await r.json(); setBadges(d.badges||[]); } catch {}
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (tab==="analytics") loadAnalytics(); if (tab==="africa") loadAfrica(); if (tab==="proficiency") loadBadges(); }, [tab]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  async function handleAdd() {
    setSaving(true);
    try {
      const url = addType==="skill"?"/api/taxonomy/skills":"/api/taxonomy/categories";
      const body = addType==="skill"
        ? { name:form.name, description:form.description, icon:form.icon, categoryId:form.categoryId, proficiencyLevels:form.proficiencyLevels }
        : { name:form.name, description:form.description, icon:form.icon, color:form.color, type:addType, parentId:addParent?.id||null };
      const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d = await r.json();
      if (r.status===409) { toast({ title:d.warning||"Already exists", description:d.matches?`Possible duplicates: ${d.matches.map((m:any)=>m.name).join(", ")}`:d.error, variant:"destructive" }); return; }
      if (!r.ok) throw new Error(d.error);
      toast({ title:"✅ Created!", description:d.message });
      setAddOpen(false); setForm({ name:"",description:"",icon:"🔧",color:"#6b7280",categoryId:"",proficiencyLevels:["Beginner","Intermediate","Expert"] });
      loadAll();
    } catch(e:any) { toast({ title:"Error",description:e.message,variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    setSaving(true);
    try {
      const url = editItem.type==="skill"?`/api/taxonomy/skills/${editItem.id}`:`/api/taxonomy/categories/${editItem.id}`;
      const r = await fetch(url,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast({ title:"✅ Updated!",description:d.message });
      setEditOpen(false); loadAll();
    } catch(e:any) { toast({ title:"Error",description:e.message,variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const url = deleteItem.type==="skill"?`/api/taxonomy/skills/${deleteItem.id}`:`/api/taxonomy/categories/${deleteItem.id}`;
      const r = await fetch(url,{method:"DELETE"});
      const d = await r.json();
      if (r.status===409) { toast({ title:"⚠️ Cascade Safety",description:d.error,variant:"destructive" }); setDeleteOpen(false); return; }
      toast({ title:"✅ Deleted",description:d.message });
      setDeleteOpen(false); loadAll();
    } catch(e:any) { toast({ title:"Error",description:e.message,variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function handleMerge() {
    setSaving(true);
    try {
      const r = await fetch("/api/taxonomy/merge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceId:mergeSource,targetId:mergeTarget,reason:"Admin merge"})});
      const d = await r.json();
      toast({ title:"🔀 Merged!",description:d.message });
      setMergeOpen(false); loadAll();
    } catch { toast({ title:"Merge failed",variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function toggleBoost(skillId: string, currentBoost: boolean) {
    const r = await fetch(`/api/taxonomy/skills/${skillId}/boost`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({boost:!currentBoost})});
    const d = await r.json();
    toast({ title: d.message });
    loadAll();
  }

  async function toggleFeature(skillId: string, currentFeatured: boolean) {
    const r = await fetch(`/api/taxonomy/skills/${skillId}/feature`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({featured:!currentFeatured})});
    const d = await r.json();
    toast({ title: d.message });
    loadAll();
  }

  async function runAiSuggest() {
    try {
      const r = await fetch("/api/taxonomy/suggest/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({category:aiSugCat})});
      const d = await r.json();
      setAiSuggestions(d.suggestions||[]);
    } catch { toast({ title:"AI scan failed",variant:"destructive" }); }
  }

  async function approveSuggestion(id: string) {
    setActionId(id);
    try {
      const r = await fetch(`/api/taxonomy/suggestions/${id}/approve`,{method:"PUT"});
      const d = await r.json();
      toast({ title:"✅ Approved!",description:d.message });
      loadAll();
    } catch { toast({ title:"Failed",variant:"destructive" }); }
    finally { setActionId(null); }
  }

  async function rejectSuggestion() {
    if (!rejectTarget) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/taxonomy/suggestions/${rejectTarget.id}/reject`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:rejectReason})});
      const d = await r.json();
      toast({ title:"❌ Rejected",description:d.message });
      setRejectOpen(false); setRejectReason(""); setRejectTarget(null); loadAll();
    } catch { toast({ title:"Failed",variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function bulkAction(action: "approve"|"reject") {
    if (!selectedSugs.length) return;
    setSaving(true);
    try {
      const r = await fetch("/api/taxonomy/suggestions/bulk",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:selectedSugs,action})});
      const d = await r.json();
      toast({ title:action==="approve"?"✅ Bulk Approved":"❌ Bulk Rejected",description:d.message });
      setSelectedSugs([]); loadAll();
    } catch { toast({ title:"Failed",variant:"destructive" }); }
    finally { setSaving(false); }
  }

  async function runAutoTag() {
    try {
      const r = await fetch("/api/taxonomy/auto-tag",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({description:autoTagDesc})});
      setAutoTagResult(await r.json());
    } catch { toast({ title:"Auto-tag failed",variant:"destructive" }); }
  }

  async function checkDuplicate() {
    if (!dupCheckName) return;
    try {
      const r = await fetch("/api/taxonomy/detect-duplicates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:dupCheckName})});
      setDupResult(await r.json());
    } catch {}
  }

  async function exportTaxonomy(fmt: string) {
    const r = await fetch(`/api/taxonomy/export?format=${fmt}`);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`taxonomy.${fmt==="csv"?"csv":"json"}`; a.click();
    URL.revokeObjectURL(url);
    toast({ title:`📦 Exported as ${fmt.toUpperCase()}` });
  }

  async function handleImport() {
    setSaving(true);
    try {
      const r = await fetch("/api/taxonomy/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:importData,format:importFormat})});
      const d = await r.json();
      if (r.status===422) { setImportResult(d); toast({ title:"⚠️ Validation Errors",description:`${d.errors.length} errors found`,variant:"destructive" }); return; }
      setImportResult(d);
      toast({ title:"✅ Import Complete",description:d.message });
      loadAll();
    } catch { toast({ title:"Import failed",variant:"destructive" }); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent mx-auto" style={{borderTopColor:PURPLE}}/>
        <p className="text-sm text-gray-500">Loading Taxonomy Intelligence Engine...</p>
      </div>
    </div>
  );

  const pendingSugCount = suggestions.filter(s=>s.status==="pending").length;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={()=>navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-sm shrink-0">← Admin</button>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0" style={{background:PURPLE}}>🗂️</div>
            <span className="font-bold text-gray-900 text-sm truncate">Category & Skill Management</span>
            <span className="hidden lg:inline text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold shrink-0">200% INTELLIGENCE · 16th SECTION</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button data-testid="btn-auto-tag" onClick={()=>setAutoTagOpen(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 hidden sm:flex items-center gap-1">🏷️ Auto-Tag</button>
            <button data-testid="btn-ai-suggest" onClick={()=>{setAiSugOpen(true);runAiSuggest();}} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white" style={{background:PURPLE}}>🤖 AI Scan</button>
            <button data-testid="btn-merge" onClick={()=>setMergeOpen(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">🔀 Merge</button>
            <button data-testid="btn-add-category" onClick={()=>{setAddType("category");setAddParent(null);setForm({name:"",description:"",icon:"📁",color:"#6b7280",categoryId:"",proficiencyLevels:[]});setAddOpen(true);}} className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{background:AMBER}}>+ Add</button>
          </div>
        </div>
      </nav>

      {/* KPI BANNER */}
      <div className="border-b border-purple-100 overflow-x-auto" style={{background:"linear-gradient(90deg,#faf5ff,#ede9fe,#faf5ff)"}}>
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex gap-5 text-[10px] font-bold text-purple-700 whitespace-nowrap">
          <span>🗂️ {treeStats.categories||9} Categories</span>
          <span>📂 {treeStats.subcategories||14} Subcategories</span>
          <span>🔧 {treeStats.skills||24} Skills</span>
          <span>🔥 {treeStats.emerging||8} Emerging</span>
          <span>🚀 {treeStats.boosted||9} Boosted</span>
          <span>📬 {pendingSugCount} Pending</span>
          <span>🌍 Africa-First: USSD · M-Pesa · 11 languages</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        <Tabs value={tab} onValueChange={setTab}>
          {/* TAB BAR */}
          <div className="overflow-x-auto pb-1 mb-5">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1 w-max h-auto">
              {([
                ["tree",        "🌳 Tree"],
                ["skills",      "🔧 Skills"],
                ["analytics",   "📊 Analytics"],
                ["suggestions", "📬 Suggestions", pendingSugCount],
                ["proficiency", "🎓 Proficiency"],
                ["africa",      "🌍 Africa First"],
                ["import",      "📦 Import/Export"],
              ] as [string,string,number?][]).map(([v,l,badge]) => (
                <TabsTrigger key={v} value={v} data-testid={`tab-${v}`}
                  className="text-[11px] font-semibold px-3 py-2 rounded-lg whitespace-nowrap data-[state=active]:text-white transition-all"
                  style={tab===v?{background:v==="africa"?AFRICA:PURPLE}:{}}>
                  {l}
                  {badge!=null&&badge>0&&<span className="ml-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded-full font-black">{badge}</span>}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ══════════════════════ TAB 1: TREE VIEW ══════════════════════ */}
          <TabsContent value="tree">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Input data-testid="input-tree-search" placeholder="Search categories, skills..." value={treeSearch} onChange={e=>setTreeSearch(e.target.value)} className="w-56 text-sm"/>
                <div className="flex gap-2 ml-auto">
                  {[["subcategory","📂 + Subcategory"],["skill","🔧 + Skill"]].map(([t,l])=>(
                    <button key={t} onClick={()=>{setAddType(t as any);setAddParent(null);setForm({name:"",description:"",icon:t==="skill"?"🔧":"📂",color:"#6b7280",categoryId:"",proficiencyLevels:t==="skill"?["Beginner","Intermediate","Expert"]:[]});setAddOpen(true);}} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">{l}</button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-3 text-[10px]">
                    {[["📁","Category","text-indigo-600"],["📂","Subcategory","text-purple-600"],["🔧","Skill","text-green-600"],["🚀","Boosted","text-amber-600"],["🔥","Emerging","text-red-500"]].map(([i,l,c])=>(
                      <span key={l} className={`flex items-center gap-1 font-semibold ${c}`}>{i}<span className="text-gray-400 font-normal">{l}</span></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">Hover node for actions · All changes live immediately</span>
                </div>
                <div className="max-h-[72vh] overflow-y-auto divide-y divide-gray-50">
                  {treeData.map(cat=>(
                    <TreeNode key={cat.id} node={cat} search={treeSearch}
                      onAdd={p=>{setAddParent(p);setAddType(p.type==="category"?"subcategory":"skill");setForm({name:"",description:"",icon:p.type==="category"?"📂":"🔧",color:"#6b7280",categoryId:p.type==="subcategory"?p.id:"",proficiencyLevels:["Beginner","Intermediate","Expert"]});setAddOpen(true);}}
                      onEdit={item=>{setEditItem(item);setForm({name:item.name,description:item.description||"",icon:item.icon||"📁",color:item.color||"#6b7280",categoryId:item.categoryId||"",proficiencyLevels:item.proficiencyLevels||[]});setEditOpen(true);}}
                      onDelete={item=>{setDeleteItem(item);setDeleteOpen(true);}}
                    />
                  ))}
                </div>
              </div>

              {/* Auto-tag mini-panel */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 text-sm mb-3">🏷️ Auto-Tag Intelligence — Paste Any Job/Gig Description</h3>
                <div className="flex gap-3 flex-wrap">
                  <Textarea data-testid="input-autotag-tree" rows={2} placeholder="e.g. 'Build a WhatsApp chatbot that integrates with M-Pesa for a SA e-commerce client...'" value={autoTagDesc} onChange={e=>setAutoTagDesc(e.target.value)} className="flex-1 min-w-[200px] text-xs"/>
                  <button onClick={runAutoTag} disabled={!autoTagDesc} className="px-4 py-2 text-xs font-bold text-white rounded-lg self-end" style={{background:PURPLE}}>🤖 Suggest Categories</button>
                </div>
                {autoTagResult?.signals?.length>0&&(
                  <div className="mt-3 flex flex-wrap gap-2">
                    {autoTagResult.signals.map((sig:any,i:number)=>(
                      <div key={i} className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs">
                        <div className="font-bold text-purple-900">{sig.category}</div>
                        <div className="text-purple-600 text-[10px]">{sig.confidence}% confidence · Skills: {sig.skills?.slice(0,3).join(", ")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Integration hooks panel */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">🔗 Where Taxonomy Powers the Platform — Integration Hooks</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { icon:"🔍", title:"Search & Matching", desc:"Skills + categories drive AI freelancer-to-client matching. Boosted skills rank first.", bg:"bg-indigo-50 border-indigo-200 text-indigo-800" },
                    { icon:"👤", title:"Freelancer Profiles", desc:"Freelancers tag skills with proficiency level. Client endorsements build trust score.", bg:"bg-green-50 border-green-200 text-green-800" },
                    { icon:"📋", title:"Gigs & Job Posts", desc:"All gigs/jobs must tag taxonomy categories — enforces clean searchable data.", bg:"bg-amber-50 border-amber-200 text-amber-800" },
                    { icon:"🎓", title:"Academy Courses", desc:"Trending + emerging skills auto-trigger Academy course recommendations to freelancers.", bg:"bg-purple-50 border-purple-200 text-purple-800" },
                    { icon:"🚨", title:"Abuse & Reports", desc:"Skill fraud detection — AI flags implausible skill claims (expert React with 2 weeks experience).", bg:"bg-red-50 border-red-200 text-red-800" },
                    { icon:"🔔", title:"Notifications", desc:"Admin notified on new suggestion. Submitter notified on approve/reject.", bg:"bg-blue-50 border-blue-200 text-blue-800" },
                    { icon:"⚖️", title:"Dispute Resolution", desc:"Skill level disputes (client: 'they said Expert but delivered Beginner') use taxonomy data.", bg:"bg-gray-50 border-gray-200 text-gray-700" },
                    { icon:"📊", title:"Analytics Engine", desc:"Every taxonomy action tracked — category growth, skill velocity, conversion rates.", bg:"bg-emerald-50 border-emerald-200 text-emerald-800" },
                  ].map(h=>(
                    <div key={h.title} className={`border rounded-xl p-3 ${h.bg}`}>
                      <div className="font-bold text-sm mb-1">{h.icon} {h.title}</div>
                      <div className="text-[10px] opacity-80">{h.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB 2: SKILLS ══════════════════════ */}
          <TabsContent value="skills">
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <Input data-testid="input-skill-search" placeholder="Search name, synonym..." value={skillSearch} onChange={e=>setSkillSearch(e.target.value)} className="w-44 text-xs"/>
                <select value={skillCat} onChange={e=>setSkillCat(e.target.value)} data-testid="filter-category" className="border border-gray-200 rounded-lg px-2 py-2 text-xs bg-white">
                  <option value="">All Categories</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <select value={skillRegion} onChange={e=>setSkillRegion(e.target.value)} data-testid="filter-region" className="border border-gray-200 rounded-lg px-2 py-2 text-xs bg-white">
                  <option value="">All Regions</option>
                  <option value="africa">🌍 Africa-First</option>
                  <option value="global">🌐 Global</option>
                </select>
                {[
                  [skillEmerging,()=>setSkillEmerging(!skillEmerging),"🔥 Emerging","red"],
                  [skillBoosted,()=>setSkillBoosted(!skillBoosted),"🚀 Boosted","amber"],
                ].map(([on,fn,label,col]:[any,any,any,any])=>(
                  <button key={label} onClick={fn} data-testid={`btn-filter-${label}`}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${on?`bg-${col}-500 text-white border-transparent`:"text-gray-600 border-gray-200"}`}
                    style={on?{background:col==="red"?RED:AMBER}:{}}>{label}</button>
                ))}
                <button onClick={loadAll} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">Apply</button>
                <span className="text-[10px] text-gray-400 ml-2">{skills.length} skills</span>
                <div className="ml-auto flex gap-2">
                  <button data-testid="btn-add-skill" onClick={()=>{setAddType("skill");setAddParent(null);setForm({name:"",description:"",icon:"🔧",color:"",categoryId:"",proficiencyLevels:["Beginner","Intermediate","Expert"]});setAddOpen(true);}} className="px-4 py-1.5 text-xs font-bold text-white rounded-lg" style={{background:AMBER}}>+ Add Skill</button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <SortTh label="Skill" field="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Category</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Proficiency</th>
                        <SortTh label="Freelancers" field="usageCount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <SortTh label="ZAR/hr" field="zarRate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <SortTh label="Trend" field="trendScore" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <SortTh label="Gap" field="opportunityGap" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <SortTh label="Growth/wk" field="weeklyGrowth" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">🚀 Boost</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Academy</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {skills.map(s=>(
                        <tr key={s.id} data-testid={`row-skill-${s.id}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 min-w-[160px]">
                              <span className="text-base shrink-0">{s.icon}</span>
                              <div>
                                <div className="font-semibold text-gray-900 leading-tight">{s.name}</div>
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  {s.isEmerging&&<span className="text-[8px] bg-red-50 text-red-600 border border-red-200 px-1 rounded-full font-bold">🔥 Emerging</span>}
                                  {s.isFeatured&&<span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-200 px-1 rounded-full font-bold">⭐ Featured</span>}
                                  {s.africaRelevance>=90&&<span className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1 rounded-full font-bold">🌍</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[10px] text-gray-600 whitespace-nowrap">{s.categoryName?.split(" ")[0]}</td>
                          <td className="px-3 py-3">
                            {s.proficiencyDistribution&&<div className="space-y-1">
                              <ProficiencyBar dist={s.proficiencyDistribution}/>
                              <div className="flex gap-1">
                                {(s.proficiencyLevels||[]).map((l:string)=>(
                                  <span key={l} className="text-[8px] px-1 rounded-full text-white font-semibold" style={{background:LEVEL_COLORS[l]||"#94a3b8"}}>{l[0]}</span>
                                ))}
                              </div>
                            </div>}
                          </td>
                          <td className="px-3 py-3 font-bold" style={{color:PURPLE}}>{fmtNum(s.usageCount)}</td>
                          <td className="px-3 py-3">
                            <div className="font-bold text-sm" style={{color:G}}>{fmtZAR(s.zarRate||s.avgHourlyRate)}</div>
                            <div className="text-[9px] text-gray-400">{fmtUSD(s.usdRate||0)}</div>
                          </td>
                          <td className="px-3 py-3"><TrendBar score={s.trendScore}/></td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <div className={`text-xs font-bold ${s.opportunityGap>40?"text-red-600":s.opportunityGap>20?"text-amber-600":s.opportunityGap>0?"text-blue-600":"text-gray-400"}`}>
                                {s.opportunityGap>0?"🔥":s.opportunityGap<0?"⚠️":"="} {s.opportunityGap}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3"><GrowthBadge pct={s.weeklyGrowth||0}/></td>
                          <td className="px-3 py-3">
                            <BoostToggle on={s.searchBoost||false} onChange={()=>toggleBoost(s.id,s.searchBoost)}/>
                          </td>
                          <td className="px-3 py-3">
                            {s.academyCourseTitle&&(
                              <a href={s.academyCourseLink||"#"} target="_blank" rel="noreferrer" className="text-[9px] text-purple-600 hover:underline leading-tight block max-w-[100px] truncate" title={s.academyCourseTitle}>
                                🎓 {s.academyCourseTitle?.split(":")[0]}
                              </a>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-1">
                              <button data-testid={`btn-edit-skill-${s.id}`} onClick={()=>{setEditItem({...s,type:"skill"});setForm({name:s.name,description:s.description||"",icon:s.icon||"🔧",color:"",categoryId:s.categoryId,proficiencyLevels:s.proficiencyLevels||[]});setEditOpen(true);}} className="px-2 py-1 text-[9px] font-semibold border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                              <button data-testid={`btn-delete-skill-${s.id}`} onClick={()=>{setDeleteItem({...s,type:"skill"});setDeleteOpen(true);}} className="px-2 py-1 text-[9px] font-semibold border border-red-200 text-red-600 rounded hover:bg-red-50">Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB 3: ANALYTICS ══════════════════════ */}
          <TabsContent value="analytics">
            {!analytics ? (
              <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{borderTopColor:PURPLE}}/></div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900">📊 200% Analytics Dashboard — 4 Intelligence Layers</h2>

                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <KPICard icon="🗂️" label="Categories" value={analytics.summary.totalCategories} color={PURPLE} small/>
                  <KPICard icon="🔧" label="Skills" value={analytics.summary.totalSkills} color={AMBER} small/>
                  <KPICard icon="🔍" label="Monthly Searches" value={fmtNum(analytics.summary.monthlySearches)} color={BLUE} small/>
                  <KPICard icon="📋" label="Gigs Tagged" value={fmtNum(analytics.summary.totalGigsTagged)} color={G} small/>
                  <KPICard icon="🔥" label="Fastest Growing" value={analytics.summary.fastestGrowing?.split(" ")[0]||"–"} sub={`+${analytics.summary.fastestGrowthRate}%/wk`} color={RED} small/>
                  <KPICard icon="🎯" label="Biggest Opportunity" value={analytics.summary.biggestOpportunity?.split(" ")[0]||"–"} sub={`Gap: ${analytics.summary.biggestOpportunityGap}`} color={AFRICA} small/>
                </div>

                {/* HEATMAP + Funnel */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-1">📅 Category Activity Heatmap (searches by day)</h3>
                    <p className="text-[10px] text-gray-400 mb-4">Darker = more searches. Plan campaigns for peak days.</p>
                    {analytics.heatmap&&<Heatmap data={analytics.heatmap} categories={analytics.heatmapCats||[]}/>}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-1">🔄 Conversion Funnel — Search → Hire</h3>
                    <p className="text-[10px] text-gray-400 mb-4">Where do clients drop off? Optimise low-conversion categories.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.funnel} layout="vertical" margin={{top:0,right:40,left:60,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis type="number" tick={{fontSize:9}} tickFormatter={fmtNum}/>
                        <YAxis dataKey="name" type="category" tick={{fontSize:9}} width={55}/>
                        <Tooltip formatter={(v:number,n:string)=>[fmtNum(v),cap(n)]}/>
                        <Bar dataKey="searched" name="Searched" fill="#e0e7ff" radius={[0,2,2,0]}/>
                        <Bar dataKey="applied" name="Applied" fill={PURPLE} radius={[0,2,2,0]}/>
                        <Bar dataKey="hired" name="Hired" fill={G} radius={[0,2,2,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Skill Gap Map + 30d Forecast */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-1">🎯 Skill Opportunity Gap Map</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Gap = Demand − Supply. High gap = freelancer opportunity.</p>
                    <div className="space-y-2">
                      {(analytics.skillGaps||[]).slice(0,8).map((s:any)=>(
                        <div key={s.name} className="flex items-center gap-3">
                          <div className="text-xs font-semibold text-gray-700 w-36 truncate">{s.icon} {s.name}</div>
                          <div className="flex-1 flex gap-1 items-center">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                              <div className="h-2 rounded-full" style={{width:`${s.demand}%`,background:BLUE}}/>
                              <div className="absolute top-0 h-2 rounded-full opacity-60" style={{width:`${s.supply}%`,background:G}}/>
                            </div>
                          </div>
                          <div className="font-black text-xs" style={{color:s.gap>50?RED:s.gap>25?AMBER:BLUE}}>+{s.gap}</div>
                          <div className="text-[10px] font-bold" style={{color:G}}>{fmtZAR(s.zarRate)}</div>
                          {s.isAfrica&&<span className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1 rounded-full font-bold">🌍</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-3 text-[9px] text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full inline-block bg-blue-500"/>Demand</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full inline-block" style={{background:G}}/>Supply</span>
                      <span>Gap = opportunity for freelancers</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-1">📈 30-Day Demand Forecast (AI Projected)</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Emerging skills demand vs. supply growth rate.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analytics.forecast?.[0]?.data||[]} margin={{top:5,right:5,left:0,bottom:5}}>
                        <defs>
                          <linearGradient id="gd1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={RED} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={RED} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="week" tick={{fontSize:9}}/>
                        <YAxis tick={{fontSize:9}} tickFormatter={fmtNum}/>
                        <Tooltip formatter={(v:number,n:string)=>[fmtNum(v),cap(n)]}/>
                        <Area type="monotone" dataKey="demand" stroke={RED} fill="url(#gd1)" strokeWidth={2} name="Demand"/>
                        <Area type="monotone" dataKey="supply" stroke={G} strokeWidth={2} fill="none" name="Supply"/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 flex-wrap mt-2">
                      {(analytics.forecast||[]).slice(0,4).map((f:any)=>(
                        <div key={f.name} className="text-[9px]">
                          <span className="font-bold">{f.icon} {f.name}:</span>
                          <span className="text-red-600 font-black ml-1">+{f.weeklyGrowth}%/wk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top categories + emerging skills */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Top Categories by Gig Volume</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.topCategoriesByGigs} margin={{top:5,right:5,left:0,bottom:40}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="name" tick={{fontSize:8}} interval={0} angle={-25} textAnchor="end" height={50}/>
                        <YAxis tick={{fontSize:9}} tickFormatter={fmtNum}/>
                        <Tooltip formatter={(v:number)=>fmtNum(v)}/>
                        <Bar dataKey="gigs" name="Gigs" radius={[3,3,0,0]}>
                          {analytics.topCategoriesByGigs?.map((e:any,i:number)=><Cell key={i} fill={e.color||PIE_COLORS[i%PIE_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">🔥 Emerging Skills — Forecast vs Opportunity</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(analytics.emergingSkills||[]).map((s:any)=>(
                        <div key={s.name} className="border border-red-200 bg-red-50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-base">{s.icon}</span>
                            <span className="font-bold text-gray-900 text-xs leading-tight">{s.name}</span>
                          </div>
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between"><span className="text-gray-500">Trend</span><TrendBar score={s.trendScore} showLabel={true}/></div>
                            <div className="flex justify-between"><span className="text-gray-500">Growth/wk</span><span className="font-black text-red-600">+{s.weeklyGrowth}%</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">30d Forecast</span><span className="font-black text-amber-600">+{s.forecast30d}%</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Gap</span><span className="font-black text-purple-600">{s.opportunityGap}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="font-bold" style={{color:G}}>{fmtZAR(s.avgHourlyRate)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avg rate bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Avg Hourly Rate (ZAR) by Category — SA Market Intelligence</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={analytics.avgRateByCategory} layout="vertical" margin={{top:0,right:50,left:80,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                      <XAxis type="number" tick={{fontSize:9}} tickFormatter={v=>`R${v}`}/>
                      <YAxis dataKey="category" type="category" tick={{fontSize:9}} width={76}/>
                      <Tooltip formatter={(v:number)=>`R${v}/hr`}/>
                      <Bar dataKey="rate" fill={G} radius={[0,3,3,0]}>
                        {analytics.avgRateByCategory?.map((_:any,i:number)=><Cell key={i} fill={[G,PURPLE,BLUE,AMBER,RED,"#06b6d4","#8b5cf6","#f59e0b"][i%8]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════ TAB 4: SUGGESTIONS ══════════════════════ */}
          <TabsContent value="suggestions">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📬 Taxonomy Suggestion Queue</h2>
                  <p className="text-xs text-gray-500">User + AI-submitted skill/category suggestions. Sorted by community votes × AI confidence score.</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSugs.length>0&&(
                    <>
                      <button onClick={()=>bulkAction("approve")} disabled={saving} className="px-3 py-1.5 text-xs font-bold text-white rounded-lg" style={{background:G}}>✅ Approve {selectedSugs.length}</button>
                      <button onClick={()=>bulkAction("reject")} disabled={saving} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50">❌ Reject {selectedSugs.length}</button>
                    </>
                  )}
                </div>
              </div>

              {/* Filter bar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-wrap gap-3 items-center">
                {[
                  ["pending","⏳ Pending",AMBER],["approved","✅ Approved",G],["rejected","❌ Rejected",RED],["","🔍 All","#6b7280"],
                ].map(([v,l,c])=>(
                  <button key={v} onClick={()=>setSugStatus(v)} data-testid={`btn-sug-status-${v||"all"}`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                    style={sugStatus===v?{background:c,color:"#fff",borderColor:"transparent"}:{color:"#6b7280",borderColor:"#e5e7eb"}}>{l}</button>
                ))}
                <select value={sugType} onChange={e=>setSugType(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option value="">All Types</option>
                  <option value="skill">🔧 Skill</option>
                  <option value="subcategory">📂 Subcategory</option>
                  <option value="category">📁 Category</option>
                </select>
                <select value={sugSource} onChange={e=>setSugSource(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option value="">All Sources</option>
                  <option value="ai">🤖 AI Detected</option>
                  <option value="user">👤 User Submitted</option>
                </select>
                <button onClick={loadAll} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">Apply</button>
              </div>

              {/* AI Scanner */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">🤖</span>
                <div>
                  <div className="font-bold text-purple-900 text-sm mb-0.5">AI Taxonomy Scanner — Continuous Intelligence</div>
                  <div className="text-[11px] text-purple-700">Monitors GitHub stars, Stack Overflow growth, job-board frequency, failed platform searches, and African market signals. New suggestions appear automatically. AI assigns confidence score + quality rating to each.</div>
                </div>
              </div>

              <div className="space-y-3">
                {suggestions.map(s=>(
                  <div key={s.id} data-testid={`suggestion-${s.id}`}
                    className={`bg-white border rounded-xl p-5 transition-colors ${selectedSugs.includes(s.id)?"ring-2 ring-purple-400":""} ${s.status==="pending"?"border-amber-200":s.status==="approved"?"border-green-200":"border-gray-100"}`}>
                    <div className="flex items-start gap-4 flex-wrap">
                      <input type="checkbox" checked={selectedSugs.includes(s.id)} onChange={e=>setSelectedSugs(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))} className="mt-1 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-lg">{TYPE_ICONS[s.type]||"❓"}</span>
                          <span className="font-bold text-gray-900">{s.name}</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-bold">{cap(s.type)}</span>
                          <Pill v={s.status}/>
                          {s.source==="ai"&&<span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full font-bold">🤖 AI Detected</span>}
                          {s.source==="user"&&<span className="text-[9px] bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded-full">👤 User</span>}
                          <span className="flex items-center gap-0.5 text-amber-600 text-xs font-bold">▲{s.votes}</span>
                          {s.aiConfidence!=null&&<span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">AI {s.aiConfidence}% confidence</span>}
                          {s.qualityScore!=null&&<span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${s.qualityScore>=90?"bg-green-50 text-green-700 border-green-200":s.qualityScore>=75?"bg-amber-50 text-amber-700 border-amber-200":"bg-gray-50 text-gray-500 border-gray-200"}`}>Quality {s.qualityScore}</span>}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{s.description}</p>
                        <p className="text-xs text-gray-500 mb-1"><strong>Reason:</strong> {s.reason}</p>
                        {s.evidence&&<p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1">📊 <strong>Evidence:</strong> {s.evidence}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {s.status==="pending"&&<>
                          <button data-testid={`btn-approve-${s.id}`} onClick={()=>approveSuggestion(s.id)} disabled={actionId===s.id} className="px-4 py-1.5 text-xs font-bold text-white rounded-lg" style={{background:G}}>{actionId===s.id?"...":"✅ Approve"}</button>
                          <button data-testid={`btn-reject-${s.id}`} onClick={()=>{setRejectTarget(s);setRejectOpen(true);}} className="px-4 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50">❌ Reject</button>
                        </>}
                        {s.status==="approved"&&<span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bold text-center">✅ Live</span>}
                        {s.status==="rejected"&&<span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-center">❌ Rejected</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {suggestions.length===0&&<div className="text-center py-12 text-gray-400">No suggestions match the current filters.</div>}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB 5: PROFICIENCY & BADGES ══════════════════════ */}
          <TabsContent value="proficiency">
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">🎓 Proficiency & Verification System</h2>
                <p className="text-xs text-gray-500 mt-1">Every skill has proficiency levels, optional client endorsements, Academy course links, and verification badges — obliterating Fiverr's flat-skills and Upwork's self-proclaimed expertise.</p>
              </div>

              {/* Proficiency levels explanation */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { level:"Beginner", color:"#10b981", desc:"Knows fundamentals. Has completed 1-3 small projects.", icon:"🌱" },
                  { level:"Intermediate", color:"#f59e0b", desc:"Works independently. Delivered 5+ client projects.", icon:"🔧" },
                  { level:"Expert", color:"#7c3aed", desc:"Advanced patterns, teaches others, strong portfolio.", icon:"⭐" },
                  { level:"Specialist", color:"#ef4444", desc:"Industry-recognized, public contributions, 3+ years.", icon:"🏆" },
                  { level:"Verified", color:"#3b82f6", desc:"Passed skill test + client endorsement confirmed.", icon:"✅" },
                ].map(p=>(
                  <div key={p.level} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="font-black text-lg mb-1">{p.icon}</div>
                    <div className="font-bold text-sm mb-1" style={{color:p.color}}>{p.level}</div>
                    <div className="text-[10px] text-gray-500">{p.desc}</div>
                    <div className="mt-2 h-1.5 rounded-full" style={{background:p.color+"30"}}>
                      <div className="h-1.5 rounded-full" style={{width:`${["Beginner","Intermediate","Expert","Specialist","Verified"].indexOf(p.level)*25}%`,background:p.color}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Badge management table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Skill Badges & Academy Certification Links</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Each badge links to an Academy course. Verification-required badges need a skill test pass + client endorsement.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr>
                      {["Skill","Badge","Academy Course","Endorsements","Proficiency Split","Verification","Status"].map(h=>(
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {(badges.length>0?badges:skills.slice(0,12)).map((b:any)=>(
                        <tr key={b.skillId||b.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-semibold text-gray-900">{b.skillName||b.name}</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg text-white inline-flex items-center gap-1" style={{background:b.badgeColor||PURPLE}}>
                              {b.badge||"🔧 Badge"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <a href={b.academyCourseLink||"#"} className="text-purple-600 hover:underline text-[10px] leading-tight block max-w-[160px] truncate">🎓 {b.academyCourseTitle||"–"}</a>
                          </td>
                          <td className="px-3 py-3 font-bold" style={{color:G}}>{fmtNum(b.endorsementCount||b.endorsementCount||0)}</td>
                          <td className="px-3 py-3">
                            {b.proficiencyDistribution&&<ProficiencyBar dist={b.proficiencyDistribution}/>}
                            {b.proficiencyDistribution&&<div className="text-[9px] text-gray-400 mt-0.5">
                              {Object.entries(b.proficiencyDistribution).map(([l,p])=>`${l[0]}:${p}%`).join(" · ")}
                            </div>}
                          </td>
                          <td className="px-3 py-3">
                            {b.verificationRequired
                              ? <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-bold">✅ Required</span>
                              : <span className="text-[9px] bg-gray-50 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-full">Optional</span>}
                          </td>
                          <td className="px-3 py-3"><Pill v="active"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Endorsement flow diagram */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Endorsement & Verification Flow</h3>
                <div className="flex flex-wrap gap-3 items-center justify-center text-center">
                  {[
                    { step:"1", label:"Freelancer claims skill", sub:"Selects proficiency level on profile", color:"#6366f1" },
                    { step:"→", label:"", sub:"", color:"transparent" },
                    { step:"2", label:"Client hires & pays", sub:"Escrow-protected job completed", color:"#10b981" },
                    { step:"→", label:"", sub:"", color:"transparent" },
                    { step:"3", label:"Client endorses", sub:"Confirms level after job completion", color:"#f59e0b" },
                    { step:"→", label:"", sub:"", color:"transparent" },
                    { step:"4", label:"Badge unlocked", sub:"Profile shows verified skill badge", color:"#7c3aed" },
                    { step:"→", label:"", sub:"", color:"transparent" },
                    { step:"5", label:"Academy suggested", sub:"Platform recommends next-level course", color:"#ef4444" },
                  ].map(({step,label,sub,color})=>step==="→"?(
                    <span key={step+label} className="text-gray-300 text-2xl hidden md:block">→</span>
                  ):(
                    <div key={step+label} className="border rounded-xl p-4 text-xs w-36" style={{borderColor:color+"40",background:color+"08"}}>
                      <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-white text-sm" style={{background:color}}>{step}</div>
                      <div className="font-bold text-gray-900 leading-tight mb-1">{label}</div>
                      <div className="text-[10px] text-gray-500">{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-400 text-center">
                  ⚠️ <strong>Anti-fraud:</strong> AI flags implausible skill claims (e.g., "Expert React with 2 weeks platform history") → routed to Abuse Management
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB 6: AFRICA FIRST ══════════════════════ */}
          <TabsContent value="africa">
            {!africaData ? (
              <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{borderTopColor:AFRICA}}/></div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">🌍 Africa-First Intelligence</h2>
                  <p className="text-xs text-gray-500 mt-1">No competitor on earth — Upwork, Fiverr, Freelancer.com, PeoplePerHour, or Toptal — has Africa-specific taxonomy. This is our total blue-ocean advantage.</p>
                </div>

                {/* Market opportunity banner */}
                <div className="rounded-xl p-5 text-white" style={{background:`linear-gradient(135deg,${AFRICA},#065f46)`}}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                      { icon:"📟", label:"Feature Phone Users", value:"560M", sub:"Accessible only via USSD" },
                      { icon:"💸", label:"Mobile Money Users", value:"500M+", sub:"M-Pesa, MTN MoMo, Airtel" },
                      { icon:"🗣️", label:"SA Language Speakers", value:"25M+", sub:"Zulu, Xhosa, Sotho unserved" },
                      { icon:"🏆", label:"Competitor Coverage", value:"0%", sub:"Zero platforms cover these" },
                    ].map(s=>(
                      <div key={s.label}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-3xl font-black mb-0.5">{s.value}</div>
                        <div className="text-sm font-semibold opacity-90">{s.label}</div>
                        <div className="text-[11px] opacity-70">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Africa skills table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Africa-First Skills — Zero Competitor Coverage</h3>
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">Avg opportunity gap: 79/100</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-green-50 border-b border-green-100"><tr>
                        {["Skill","Market","Opportunity Gap","Freelancers","ZAR/hr","Weekly Growth","Languages","Synonyms"].map(h=>(
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-green-800 uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {(africaData.skills||[]).map((s:any)=>(
                          <tr key={s.id} className="hover:bg-green-50 transition-colors">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{s.icon}</span>
                                <div>
                                  <div className="font-bold text-gray-900 leading-tight">{s.name}</div>
                                  <div className="text-[9px] text-green-700 bg-green-50 border border-green-200 px-1 rounded-full font-bold inline-block mt-0.5">🌍 Africa-First</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-[10px] text-gray-600 max-w-[180px]">{s.description?.slice(0,80)}...</td>
                            <td className="px-3 py-3">
                              <div className="font-black text-lg" style={{color:s.opportunityGap>60?RED:s.opportunityGap>40?AMBER:G}}>{s.opportunityGap}</div>
                              <div className="text-[9px] text-gray-400">demand − supply</div>
                            </td>
                            <td className="px-3 py-3 font-bold" style={{color:AFRICA}}>{fmtNum(s.usageCount)}</td>
                            <td className="px-3 py-3 font-bold" style={{color:G}}>{fmtZAR(s.zarRate||s.avgHourlyRate)}</td>
                            <td className="px-3 py-3"><GrowthBadge pct={s.weeklyGrowth||0}/></td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(s.languages||[]).map((l:string)=><span key={l} className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1 rounded-full font-bold">{l}</span>)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-[9px] text-gray-400 max-w-[120px]">{(s.aiSynonyms||[]).slice(0,2).join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile money ecosystem */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">💸 African Mobile Money Ecosystem — Developer Integration Opportunities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(africaData.intelligence?.mobileMoneyEcosystem||[]).map((m:any)=>(
                      <div key={m.name} className="border border-green-200 bg-green-50 rounded-xl p-4">
                        <div className="font-bold text-green-900 text-sm mb-1">💸 {m.name}</div>
                        <div className="text-[10px] text-green-700 space-y-1">
                          <div>🌍 Countries: {m.countries}</div>
                          <div>👤 Users: {m.users}</div>
                          <div>🔌 API: {m.api?"Available":"Contact required"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language support */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">🗣️ Multi-Language Taxonomy — 11 African Languages</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(africaData.intelligence?.languages||[]).map((l:any)=>(
                      <div key={l.code} className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-black text-gray-300">{l.code.toUpperCase()}</span>
                          <span className="font-bold text-gray-900 text-sm">{l.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          <div>Skills covered: <strong>{l.skillsCovered}</strong></div>
                          <div>Speakers: <strong>{l.speakers}</strong></div>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-gray-100">
                          <div className="h-1 rounded-full" style={{width:`${Math.min(100,(l.skillsCovered/10)*100)}%`,background:AFRICA}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* USSD market */}
                <div className="border-2 border-green-400 bg-green-50 rounded-xl p-5">
                  <h3 className="font-bold text-green-900 text-sm mb-3">📟 USSD Market Intelligence — Our #1 Blue Ocean</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {Object.entries(africaData.intelligence?.ussdMarket||{}).filter(([k])=>k!=="noCompetitorCoverage").map(([k,v])=>(
                      <div key={k} className="bg-white rounded-xl p-3 border border-green-200">
                        <div className="font-black text-xl text-green-900">{String(v)}</div>
                        <div className="text-[10px] text-green-700 mt-1">{cap(k.replace(/([A-Z])/g," $1"))}</div>
                      </div>
                    ))}
                    <div className="bg-white rounded-xl p-3 border border-red-200">
                      <div className="font-black text-xl text-red-600">ZERO</div>
                      <div className="text-[10px] text-red-700 mt-1">Competitor platform coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════ TAB 7: IMPORT/EXPORT ══════════════════════ */}
          <TabsContent value="import">
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">📦 Import/Export + AI Auto-Tag Intelligence</h2>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Export */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-2">📤 Export Taxonomy</h3>
                  <p className="text-xs text-gray-500 mb-4">Download the complete taxonomy with all metadata — rates, trends, opportunity gaps, Africa data, synonyms.</p>
                  <div className="space-y-2">
                    <button data-testid="btn-export-json" onClick={()=>exportTaxonomy("json")} className="w-full py-2.5 text-sm font-bold text-white rounded-xl" style={{background:PURPLE}}>📄 Export as JSON (full)</button>
                    <button data-testid="btn-export-csv" onClick={()=>exportTaxonomy("csv")} className="w-full py-2.5 text-sm font-bold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">📊 Export as CSV (hierarchy)</button>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-400 space-y-0.5">
                    <div>✅ Includes: trend scores, opportunity gaps</div>
                    <div>✅ ZAR + USD + NGN rates per skill</div>
                    <div>✅ Africa relevance + language codes</div>
                    <div>✅ Academy links + badge metadata</div>
                  </div>
                </div>

                {/* Import */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-2">📥 Bulk Import</h3>
                  <p className="text-xs text-gray-500 mb-4">Import skills/categories with hierarchy validation, duplicate detection, and a full validation report.</p>
                  <button data-testid="btn-open-import" onClick={()=>setImportOpen(true)} className="w-full py-2.5 text-sm font-bold text-white rounded-xl mb-3" style={{background:AMBER}}>📥 Open Import Tool</button>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <div>✅ CSV: validates hierarchy (parent → child)</div>
                    <div>✅ AI duplicate detection before insert</div>
                    <div>✅ Full validation report with row-by-row errors</div>
                    <div>✅ Up to 10,000 items per import</div>
                  </div>
                </div>

                {/* AI Auto-Tag */}
                <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-2">🏷️ Auto-Tag from Description</h3>
                  <p className="text-xs text-gray-500 mb-4">Paste any gig/job description — our AI suggests the best category + skills. Powers onboarding wizard and gig creation form.</p>
                  <Textarea data-testid="input-autotag" rows={4} placeholder="Paste any job or gig description here..." value={autoTagDesc} onChange={e=>{setAutoTagDesc(e.target.value);setAutoTagResult(null);}} className="text-xs mb-3"/>
                  <button data-testid="btn-autotag" onClick={runAutoTag} disabled={!autoTagDesc} className="w-full py-2.5 text-sm font-bold text-white rounded-xl" style={{background:PURPLE}}>🤖 Suggest Categories & Skills</button>
                  {autoTagResult?.signals?.length>0&&(
                    <div className="mt-3 space-y-2">
                      {autoTagResult.signals.map((sig:any,i:number)=>(
                        <div key={i} className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs">
                          <div className="font-bold text-purple-900 mb-1">{sig.category} <span className="font-normal text-purple-600">— {sig.confidence}% confidence</span></div>
                          <div className="text-purple-700 text-[10px]">Skills: {sig.skills?.join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Duplicate Checker */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">🔍 AI Duplicate Detection — Levenshtein + Token Overlap (6-signal)</h3>
                <div className="flex gap-3 flex-wrap">
                  <Input data-testid="input-dup-check" placeholder="Type a skill name to check for duplicates..." value={dupCheckName} onChange={e=>{setDupCheckName(e.target.value);setDupResult(null);}} className="flex-1 min-w-[200px] text-sm"/>
                  <button onClick={checkDuplicate} disabled={!dupCheckName} className="px-4 py-2 text-xs font-bold text-white rounded-lg" style={{background:PURPLE}}>🔍 Check</button>
                </div>
                {dupResult&&(
                  <div className="mt-3">
                    {dupResult.hasDuplicates
                      ? <div className="bg-red-50 border border-red-200 rounded-lg p-3"><div className="font-bold text-red-700 mb-2">⚠️ {dupResult.matches.length} potential duplicate(s) found:</div>{dupResult.matches.map((m:any)=><div key={m.id} className="text-xs text-red-600">• {m.name} — {m.similarity} match</div>)}</div>
                      : <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs font-bold text-green-700">✅ No duplicates found — safe to add</div>}
                    <div className="text-[10px] text-gray-400 mt-1">Method: {dupResult.method}</div>
                  </div>
                )}
              </div>

              {/* Competitor comparison */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">🏆 How We Out-Engineer Every Competitor</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { competitor:"Upwork", flag:"🇺🇸", problem:"2012 taxonomy, 0 AI, no suggestions, no synonyms, no analytics", us:"AI-updated daily, living taxonomy with trend intelligence, synonym graph" },
                    { competitor:"Fiverr", flag:"🇮🇱", problem:"Flat 3-level, no proficiency, no verification, no badge system", us:"5-level proficiency + Academy badges + client endorsements + verification" },
                    { competitor:"Freelancer.com", flag:"🇦🇺", problem:"1,200 skills in single dropdown, no analytics, no emerging skill detection", us:"Heatmaps, funnels, AI forecasts, skill gap map, 30-day demand projection" },
                    { competitor:"PeoplePerHour", flag:"🇬🇧", problem:"Static tags, zero Africa awareness, no bulk ops, no API", us:"Africa-first intelligence, USSD, M-Pesa, 11 languages, full bulk ops" },
                    { competitor:"Toptal", flag:"🌐", problem:"Invite-only, zero community, no suggestions, no democracy", us:"Community voting + AI pre-screening + bulk moderation + open submission" },
                  ].map(c=>(
                    <div key={c.competitor} className="border border-gray-100 rounded-xl p-4">
                      <div className="font-bold text-gray-900 text-sm mb-1">{c.flag} {c.competitor}</div>
                      <div className="text-[10px] text-red-500 mb-2">❌ {c.problem}</div>
                      <div className="text-[10px] text-green-700 font-semibold">✅ {c.us}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ══════════ DIALOGS ══════════ */}

      {/* ADD */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{addParent?`Add ${cap(addType)} under "${addParent.name}"`:`Add ${cap(addType)}`}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["category","subcategory","skill"] as const).map(t=>(
                <button key={t} onClick={()=>setAddType(t)} data-testid={`btn-type-${t}`}
                  className="py-2 text-xs font-bold rounded-lg border transition-colors"
                  style={addType===t?{background:PURPLE,color:"#fff",borderColor:PURPLE}:{color:"#6b7280",borderColor:"#e5e7eb"}}>
                  {TYPE_ICONS[t]} {cap(t)}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Name * (AI duplicate check runs on submit)</label>
              <Input data-testid="input-add-name" placeholder={addType==="skill"?"e.g. React Native":"e.g. Mobile Development"} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
            </div>
            {addType==="skill"&&(
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Category *</label>
                <Select value={form.categoryId} onValueChange={v=>setForm(p=>({...p,categoryId:v}))}>
                  <SelectTrigger data-testid="select-add-category"><SelectValue placeholder="Select category"/></SelectTrigger>
                  <SelectContent>{categories.map(c=><SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Icon (emoji)</label>
                <Input data-testid="input-add-icon" placeholder="🔧" value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))}/>
              </div>
              {addType!=="skill"&&<div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Color</label>
                <Input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="h-9 cursor-pointer"/>
              </div>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
              <Textarea data-testid="input-add-description" rows={2} placeholder="Optional description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
            </div>
            {addType==="skill"&&(
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Proficiency Levels</label>
                <div className="flex gap-2 flex-wrap">
                  {["Beginner","Intermediate","Expert","Specialist"].map(l=>(
                    <button key={l} onClick={()=>setForm(p=>({...p,proficiencyLevels:p.proficiencyLevels.includes(l)?p.proficiencyLevels.filter(x=>x!==l):[...p.proficiencyLevels,l]}))}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors"
                      style={form.proficiencyLevels.includes(l)?{background:LEVEL_COLORS[l],color:"#fff",borderColor:"transparent"}:{color:"#6b7280",borderColor:"#e5e7eb"}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setAddOpen(false)}>Cancel</Button>
            <Button data-testid="btn-confirm-add" disabled={!form.name||(addType==="skill"&&!form.categoryId)||saving} onClick={handleAdd} style={{background:PURPLE,color:"#fff"}}>
              {saving?"Saving...":` Add ${cap(addType)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit "{editItem?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Name</label><Input data-testid="input-edit-name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Icon</label><Input data-testid="input-edit-icon" value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label><Textarea data-testid="input-edit-description" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
            <Button data-testid="btn-confirm-edit" disabled={saving} onClick={handleEdit} style={{background:AMBER,color:"#fff"}}>{saving?"Saving...":"Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete "{deleteItem?.name}"?</DialogTitle></DialogHeader>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Uses <strong>soft-delete</strong> (status: deprecated) to preserve data integrity. Hard-delete blocked if &gt;1,000 freelancers use this skill.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">⚠️ Cascade safety check will block if children exist.</div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setDeleteOpen(false)}>Cancel</Button>
            <Button data-testid="btn-confirm-delete" disabled={saving} onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">{saving?"Deleting...":"Soft Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MERGE */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>🔀 Merge Duplicate Skills</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">All profiles, gigs, and jobs on the source skill migrate to the target. Source is soft-deleted.</p>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Source (merge away)</label>
              <Select value={mergeSource} onValueChange={setMergeSource}>
                <SelectTrigger data-testid="select-merge-source"><SelectValue placeholder="Select source skill"/></SelectTrigger>
                <SelectContent>{skills.map(s=><SelectItem key={s.id} value={s.id}>{s.icon} {s.name} ({fmtNum(s.usageCount)} users)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="text-center text-gray-400 text-xl">→</div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Target (keep)</label>
              <Select value={mergeTarget} onValueChange={setMergeTarget}>
                <SelectTrigger data-testid="select-merge-target"><SelectValue placeholder="Select target skill"/></SelectTrigger>
                <SelectContent>{skills.filter(s=>s.id!==mergeSource).map(s=><SelectItem key={s.id} value={s.id}>{s.icon} {s.name} ({fmtNum(s.usageCount)} users)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {mergeSource&&mergeTarget&&(
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                ⚠️ Migrates {fmtNum(skills.find(s=>s.id===mergeSource)?.usageCount||0)} profiles + {fmtNum(skills.find(s=>s.id===mergeSource)?.gigCount||0)} gigs. Irreversible.
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setMergeOpen(false)}>Cancel</Button>
            <Button data-testid="btn-confirm-merge" disabled={!mergeSource||!mergeTarget||saving} onClick={handleMerge} style={{background:PURPLE,color:"#fff"}}>{saving?"Merging...":"🔀 Confirm Merge"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI SUGGEST */}
      <Dialog open={aiSugOpen} onOpenChange={setAiSugOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>🤖 AI Trend Scanner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">AI monitors GitHub, Stack Overflow, job boards, SA market signals. Ranked by weekly growth × opportunity gap.</p>
            <Select value={aiSugCat} onValueChange={v=>{setAiSugCat(v);setAiSuggestions([]);}}>
              <SelectTrigger data-testid="select-ai-category"><SelectValue/></SelectTrigger>
              <SelectContent>
                {[["technology-development","💻 Technology & Dev"],["data-ai","🤖 Data & AI"],["africa-emerging","🌍 Africa & Emerging"],["design-creative","🎨 Design & Creative"],["marketing-growth","📈 Marketing & Growth"]].map(([v,l])=>(
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runAiSuggest} className="w-full" style={{background:PURPLE,color:"#fff"}}>🔍 Scan for Missing Skills</Button>
            {aiSuggestions.length>0&&(
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {aiSuggestions.map((sug:any)=>(
                  <div key={sug.name} className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-purple-900 text-sm">🔧 {sug.name}</div>
                        <div className="text-[10px] text-purple-700 mt-0.5">{sug.reason}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] text-red-600 font-black">+{sug.weeklyGrowth}%/wk</span>
                          <span className="text-[9px] text-purple-600 font-bold">AI: {sug.aiConfidence}%</span>
                        </div>
                      </div>
                      <button onClick={()=>{setForm({name:sug.name,description:sug.reason,icon:"🔧",color:"",categoryId:"",proficiencyLevels:["Beginner","Intermediate","Expert"]});setAddType("skill");setAiSugOpen(false);setAddOpen(true);}}
                        className="px-2 py-1 text-[10px] font-bold text-white rounded-lg shrink-0" style={{background:G}}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setAiSugOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>📥 Bulk Import Taxonomy</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {["json","csv"].map(f=>(
                <button key={f} onClick={()=>setImportFormat(f)} data-testid={`btn-format-${f}`}
                  className="py-2 text-xs font-bold rounded-lg border transition-colors"
                  style={importFormat===f?{background:AMBER,color:"#fff",borderColor:AMBER}:{color:"#6b7280",borderColor:"#e5e7eb"}}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <Textarea data-testid="input-import-data" rows={7} placeholder={importFormat==="json"?`[{"name":"React Native","type":"skill","categoryId":"sub-002"}]`:"name,type,parentId\nReact Native,skill,sub-002"} value={importData} onChange={e=>setImportData(e.target.value)} className="font-mono text-xs"/>
            {importResult&&(
              <div className={`rounded-lg p-3 text-xs ${importResult.errors?"bg-red-50 border border-red-200 text-red-700":"bg-green-50 border border-green-200 text-green-700"}`}>
                {importResult.errors?<><div className="font-bold mb-1">⚠️ Validation Errors:</div>{importResult.errors.map((e:string,i:number)=><div key={i}>• {e}</div>)}</>
                :<><div className="font-bold">✅ {importResult.message}</div>{importResult.warnings?.length>0&&<div className="mt-1 text-amber-700">{importResult.warnings.length} warnings</div>}</>}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setImportOpen(false)}>Cancel</Button>
            <Button data-testid="btn-confirm-import" disabled={!importData||saving} onClick={handleImport} style={{background:AMBER,color:"#fff"}}>{saving?"Importing...":"📥 Import & Validate"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reject "{rejectTarget?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Provide a reason — submitter will be notified via the Notifications system.</p>
            <Textarea data-testid="input-reject-reason" rows={3} placeholder="e.g. Already covered by 'React Native'..." value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>{setRejectOpen(false);setRejectReason("");}}>Cancel</Button>
            <Button data-testid="btn-confirm-reject" onClick={rejectSuggestion} disabled={saving} className="bg-red-600 text-white hover:bg-red-700">{saving?"Rejecting...":"❌ Reject & Notify"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
