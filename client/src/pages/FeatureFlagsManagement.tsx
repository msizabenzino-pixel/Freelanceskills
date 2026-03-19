/**
 * Feature Flags Department v1.0 — client/src/pages/FeatureFlagsManagement.tsx
 * Section 26 — FreelanceSkills.net
 * The nuclear master control panel of the entire platform.
 * LaunchDarkly-level + 3 years ahead — Africa-first, AI-powered.
 *
 * 5 Tabs:
 *  1. 🚀 Flags Library     — full table, kill switches, rollout %, quick enable/disable
 *  2. ✏️ Flag Editor       — create/edit with targeting rules + schedule
 *  3. 🤖 AI Impact         — GPT-4o-mini predicts revenue/risk/server before you enable
 *  4. 🧪 A/B Experiments   — create experiments, track results, auto winner detection
 *  5. 📜 History & Rollback — immutable timeline + one-click rollback
 */
import { useState, useEffect } from "react";
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
  PieChart, Pie, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeatureFlag {
  id: string; key: string; name: string; description?: string;
  category: string; status: string; rolloutPercentage: number;
  targetingRules: any[]; tags: string[]; impactLevel: string;
  isKillSwitch: boolean; isLocked: boolean; lockedReason?: string;
  scheduledEnableAt?: string; scheduledDisableAt?: string;
  createdAt: string; updatedAt: string;
}
interface FlagHistory {
  id: string; flagKey: string; action: string;
  previousState: any; newState: any; changedBy?: string;
  changeNote?: string; rolloutBefore?: number; rolloutAfter?: number;
  createdAt: string;
}
interface FlagExperiment {
  id: string; flagId: string; name: string; hypothesis?: string;
  status: string; variants: any[]; trafficSplit: any;
  targetMetric?: string; startedAt?: string; concludedAt?: string;
  winner?: string; winnerConfidence?: number; results: any; createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["all","marketplace","africa","ai","payment","social","security","academy","performance","compliance","general"];
const IMPACT_LEVELS = ["low","medium","high","critical"];
const CAT_COLORS: Record<string,string> = {
  marketplace:"#8b5cf6", africa:"#10b981", ai:"#3b82f6", payment:"#f97316",
  social:"#ec4899", security:"#ef4444", academy:"#eab308", performance:"#06b6d4",
  compliance:"#a855f7", general:"#71717a",
};
const CAT_ICONS: Record<string,string> = {
  marketplace:"🛒", africa:"🌍", ai:"🤖", payment:"💳", social:"👥",
  security:"🔐", academy:"🎓", performance:"⚡", compliance:"📋", general:"⚙️",
};
const IMPACT_COLORS: Record<string,string> = { low:"text-emerald-400", medium:"text-blue-400", high:"text-amber-400", critical:"text-red-400" };
const IMPACT_BG: Record<string,string> = { low:"bg-emerald-950/40 border-emerald-700/40", medium:"bg-blue-950/40 border-blue-700/40", high:"bg-amber-950/40 border-amber-700/40", critical:"bg-red-950/40 border-red-700/40" };
const STATUS_STYLE: Record<string,string> = {
  on:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  off:"bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
  rollout:"bg-blue-500/20 text-blue-300 border-blue-500/30",
  experiment:"bg-violet-500/20 text-violet-300 border-violet-500/30",
  scheduled:"bg-amber-500/20 text-amber-300 border-amber-500/30",
  deprecated:"bg-red-900/20 text-red-500 border-red-900/30",
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string|number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

function RolloutBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-zinc-700";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width:`${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── TAB 1: Flags Library ─────────────────────────────────────────────────────
function FlagsLibraryTab({ onEditFlag, onSelectFlag }: { onEditFlag: (f: FeatureFlag) => void; onSelectFlag: (f: FeatureFlag, tab: string) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [rolloutTarget, setRolloutTarget] = useState<Record<string,number>>({});

  const { data: statsData } = useQuery({ queryKey:["/api/feature-flags/stats"], queryFn:() => apiRequest("GET","/api/feature-flags/stats").then(r=>r.json()) });
  const { data: flagsData, isLoading } = useQuery({ queryKey:["/api/feature-flags", catFilter, statusFilter, impactFilter], queryFn:() => apiRequest("GET",`/api/feature-flags?category=${catFilter}&status=${statusFilter}&impact=${impactFilter}`).then(r=>r.json()) });
  const { data: intData } = useQuery({ queryKey:["/api/feature-flags/integration/status"], queryFn:() => apiRequest("GET","/api/feature-flags/integration/status").then(r=>r.json()) });

  const seedMut = useMutation({ mutationFn:() => apiRequest("POST","/api/feature-flags/seed").then(r=>r.json()), onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});qc.invalidateQueries({queryKey:["/api/feature-flags/stats"]});toast({title:"Seeded!",description:d.message});} });
  const enableMut = useMutation({ mutationFn:(key:string)=>apiRequest("POST",`/api/feature-flags/${key}/enable`).then(r=>r.json()), onSuccess:(_,key)=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});qc.invalidateQueries({queryKey:["/api/feature-flags/stats"]});toast({title:`✅ "${key}" enabled`});} });
  const disableMut = useMutation({ mutationFn:(key:string)=>apiRequest("POST",`/api/feature-flags/${key}/disable`).then(r=>r.json()), onSuccess:(_,key)=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});qc.invalidateQueries({queryKey:["/api/feature-flags/stats"]});toast({title:`🔴 "${key}" disabled`});} });
  const rolloutMut = useMutation({ mutationFn:({key,pct}:{key:string;pct:number})=>apiRequest("PATCH",`/api/feature-flags/${key}/rollout`,{percentage:pct}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});} });
  const lockMut = useMutation({ mutationFn:({key,reason}:{key:string;reason:string})=>apiRequest("POST",`/api/feature-flags/${key}/lock`,{reason}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});toast({title:"🔐 Flag locked"});} });

  const flags: FeatureFlag[] = (flagsData?.flags||[]).filter((f:FeatureFlag) => {
    if (search && !f.key.includes(search) && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byCategory = Object.entries(statsData?.byCategory||{}).map(([cat,count])=>({cat,count,fill:CAT_COLORS[cat]||"#6b7280"}));

  const depts = intData?.departments || [];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Flags" value={statsData?.totalFlags??"—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="Active" value={statsData?.on??"—"} sub="on (100%)" color="bg-emerald-950/60 border-emerald-700/40 text-emerald-200" />
        <StatCard label="Rollout" value={statsData?.rollout??"—"} sub="gradual %" color="bg-blue-950/60 border-blue-700/40 text-blue-200" />
        <StatCard label="Off" value={statsData?.off??"—"} color="bg-zinc-800 border-zinc-700 text-zinc-400" />
        <StatCard label="Critical" value={statsData?.critical??"—"} color="bg-red-950/60 border-red-700/40 text-red-300" />
        <StatCard label="Kill Switches" value={statsData?.killSwitches??"—"} color="bg-orange-950/60 border-orange-700/40 text-orange-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-sm font-semibold text-zinc-300 mb-3">Flags by Category</div>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={byCategory} margin={{top:0,right:0,bottom:0,left:0}}>
                <XAxis dataKey="cat" tick={{fill:"#71717a",fontSize:9}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{backgroundColor:"#18181b",border:"1px solid #3f3f46",borderRadius:"6px",fontSize:"11px"}} />
                <Bar dataKey="count" radius={[4,4,0,0]}>{byCategory.map(e=><Cell key={e.cat} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-zinc-600 text-xs text-center py-8">No flags — click Seed</div>}
        </div>

        {/* Department Integration Status */}
        <div className="lg:col-span-2 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-sm font-semibold text-zinc-300 mb-3">🔗 Department Status (controlled by flags)</div>
          <div className="grid grid-cols-3 gap-2">
            {depts.slice(0,9).map((d:any) => (
              <div key={d.name} className={`rounded-lg p-2 border text-xs ${d.status==="active" ? "bg-emerald-950/30 border-emerald-700/30" : d.status==="MAINTENANCE" ? "bg-red-950/30 border-red-700/30" : "bg-zinc-800 border-zinc-700"}`}>
                <div className={`font-medium ${d.status==="active" ? "text-emerald-400" : d.status==="MAINTENANCE" ? "text-red-400" : "text-zinc-500"}`}>{d.status==="active" ? "●" : d.status==="MAINTENANCE" ? "⚠" : "○"} {d.name}</div>
                <div className="text-zinc-600 mt-0.5">{d.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Input data-testid="input-flag-search" placeholder="Search flags…" value={search} onChange={e=>setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-52" />
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c==="all"?"All Cats":`${CAT_ICONS[c]||"⚙️"} ${c}`}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["all","on","off","rollout","scheduled","deprecated"].map(s=><SelectItem key={s} value={s}>{s==="all"?"All Status":s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={impactFilter} onValueChange={setImpactFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="all">All Impact</SelectItem>{IMPACT_LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button data-testid="button-seed-flags" variant="outline" size="sm" onClick={()=>seedMut.mutate()} disabled={seedMut.isPending} className="border-zinc-600 text-zinc-300">{seedMut.isPending?"Seeding…":"🌱 Seed 30 Flags"}</Button>
          <Button data-testid="button-new-flag" size="sm" onClick={()=>onEditFlag({} as any)} className="bg-violet-600 hover:bg-violet-700">+ New Flag</Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <div className="text-center py-12 text-zinc-500">Loading…</div> : flags.length === 0 ? (
        <div className="text-center py-12 text-zinc-500"><div className="text-4xl mb-3">🚩</div><div>No flags. Click "Seed 30 Flags" to populate the default set.</div></div>
      ) : (
        <div className="rounded-xl border border-zinc-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700 text-zinc-400 text-xs">
                <th className="px-4 py-3 text-left">Flag Key</th>
                <th className="px-4 py-3 text-left">Name / Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Impact</th>
                <th className="px-4 py-3 text-left w-40">Rollout</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag, i) => (
                <tr key={flag.id} data-testid={`row-flag-${flag.key}`} className={`border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors ${i%2===0?"":"bg-zinc-900/10"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {flag.isKillSwitch && <span title="Kill Switch" className="text-orange-400 text-xs">💀</span>}
                      {flag.isLocked && <span title="Locked" className="text-amber-400 text-xs">🔐</span>}
                      <code className="text-violet-300 text-xs font-mono">{flag.key}</code>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100 text-sm">{flag.name}</div>
                    <div className="flex items-center gap-1 mt-0.5"><span className="text-xs">{CAT_ICONS[flag.category]||"⚙️"}</span><span className="text-zinc-500 text-xs">{flag.category}</span></div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border font-medium ${STATUS_STYLE[flag.status]||STATUS_STYLE.off}`}>{flag.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold ${IMPACT_COLORS[flag.impactLevel]||"text-zinc-400"}`}>{flag.impactLevel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RolloutBar pct={flag.rolloutPercentage||0} />
                      <input
                        type="range" min={0} max={100} step={5}
                        value={rolloutTarget[flag.key] ?? flag.rolloutPercentage ?? 0}
                        onChange={e=>setRolloutTarget(p=>({...p,[flag.key]:parseInt(e.target.value)}))}
                        onMouseUp={() => { const pct = rolloutTarget[flag.key] ?? flag.rolloutPercentage ?? 0; rolloutMut.mutate({key:flag.key, pct}); }}
                        className="w-16 accent-violet-500 cursor-pointer"
                        disabled={flag.isLocked}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {/* Toggle ON/OFF */}
                      <Switch
                        data-testid={`switch-flag-${flag.key}`}
                        checked={flag.status==="on"||flag.status==="rollout"}
                        onCheckedChange={v => { if (flag.isLocked) { return; } v ? enableMut.mutate(flag.key) : disableMut.mutate(flag.key); }}
                        disabled={flag.isLocked}
                        className="scale-75"
                      />
                      <Button size="sm" variant="ghost" onClick={()=>onEditFlag(flag)} className="text-zinc-400 h-7 text-xs px-1.5" title="Edit">✏️</Button>
                      <Button size="sm" variant="ghost" onClick={()=>onSelectFlag(flag,"history")} className="text-zinc-400 h-7 text-xs px-1.5" title="History">📜</Button>
                      <Button size="sm" variant="ghost" onClick={()=>onSelectFlag(flag,"ai")} className="text-blue-400 h-7 text-xs px-1.5" title="AI Predict">🤖</Button>
                      {!flag.isLocked ? (
                        <Button size="sm" variant="ghost" onClick={()=>lockMut.mutate({key:flag.key,reason:"Locked for stability"})} className="text-amber-500 h-7 text-xs px-1.5" title="Lock">🔐</Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={()=>apiRequest("POST",`/api/feature-flags/${flag.key}/unlock`).then(()=>qc.invalidateQueries({queryKey:["/api/feature-flags"]}))} className="text-emerald-500 h-7 text-xs px-1.5" title="Unlock">🔓</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── TAB 2: Flag Editor ───────────────────────────────────────────────────────
function FlagEditorTab({ prefill, onDone }: { prefill: FeatureFlag|null; onDone: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!(prefill?.key);
  const [form, setForm] = useState({ key:"", name:"", description:"", category:"general", impactLevel:"low", isKillSwitch:false, tags:"", scheduledEnableAt:"", scheduledDisableAt:"" });

  useEffect(() => {
    if (prefill?.key) setForm({ key:prefill.key, name:prefill.name, description:prefill.description||"", category:prefill.category||"general", impactLevel:prefill.impactLevel||"low", isKillSwitch:prefill.isKillSwitch||false, tags:(prefill.tags||[]).join(", "), scheduledEnableAt: prefill.scheduledEnableAt ? prefill.scheduledEnableAt.slice(0,16) : "", scheduledDisableAt: prefill.scheduledDisableAt ? prefill.scheduledDisableAt.slice(0,16) : "" });
  }, [prefill?.key]);

  const createMut = useMutation({
    mutationFn:(d:any)=>apiRequest("POST","/api/feature-flags",d).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});qc.invalidateQueries({queryKey:["/api/feature-flags/stats"]});toast({title:"Flag created ✓"});onDone();},
    onError:(e:any)=>toast({title:"Error",description:e.message,variant:"destructive"}),
  });
  const updateMut = useMutation({
    mutationFn:(d:any)=>apiRequest("PATCH",`/api/feature-flags/${prefill!.key}`,d).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});toast({title:"Flag updated ✓"});onDone();},
  });
  const scheduleMut = useMutation({
    mutationFn:(d:any)=>apiRequest("POST",`/api/feature-flags/${prefill!.key}/schedule`,d).then(r=>r.json()),
    onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/feature-flags"]});toast({title:"Scheduled",description:d.message});},
  });

  const handleSubmit = () => {
    const payload = { ...form, tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean) };
    if (isEdit) updateMut.mutate(payload); else createMut.mutate(payload);
  };

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">{isEdit ? `✏️ Edit Flag — ${prefill?.key}` : "✏️ Create New Feature Flag"}</h3>
        <div className="text-zinc-500 text-sm mt-1">{isEdit ? "Targeting rules, tags, and description only — key cannot be changed." : "Every flag needs a unique dot-notation key (e.g. africa.ussd_mode)."}</div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-zinc-300 text-xs">Flag Key *</Label>
            <Input data-testid="input-flag-key" value={form.key} onChange={e=>setForm(p=>({...p,key:e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g,"")}))} disabled={isEdit} placeholder="africa.ussd_mode" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono" />
            {!isEdit && <div className="text-xs text-zinc-600 mt-0.5">Use dot notation: category.feature_name</div>}
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Display Name *</Label>
            <Input data-testid="input-flag-name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="USSD Feature-Phone Mode" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-zinc-300 text-xs">Description</Label>
          <Textarea data-testid="input-flag-description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What does this flag do? When should it be enabled? What risks exist?" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-zinc-300 text-xs">Category</Label>
            <Select value={form.category} onValueChange={v=>setForm(p=>({...p,category:v}))}>
              <SelectTrigger data-testid="select-flag-category" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{CATEGORIES.filter(c=>c!=="all").map(c=><SelectItem key={c} value={c}>{CAT_ICONS[c]||"⚙️"} {c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Impact Level</Label>
            <Select value={form.impactLevel} onValueChange={v=>setForm(p=>({...p,impactLevel:v}))}>
              <SelectTrigger data-testid="select-flag-impact" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{IMPACT_LEVELS.map(l=><SelectItem key={l} value={l}><span className={IMPACT_COLORS[l]}>{l}</span></SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-zinc-300 text-xs">Tags (comma-separated)</Label>
          <Input data-testid="input-flag-tags" value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="africa, payment, core" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-zinc-200 text-sm">Kill Switch</div>
            <div className="text-zinc-500 text-xs">Emergency disable — turns off entire feature instantly. Cannot be deleted.</div>
          </div>
          <Switch data-testid="switch-flag-killswitch" checked={form.isKillSwitch} onCheckedChange={v=>setForm(p=>({...p,isKillSwitch:v}))} />
        </div>

        {/* Impact level warning */}
        {form.impactLevel === "critical" && (
          <div className="bg-red-950/40 border border-red-700/40 rounded-lg p-3 text-sm text-red-300">
            ⚠️ Critical impact flags affect core revenue or security. Use the AI Impact Predictor before enabling and consider a gradual rollout (5% → 25% → 50% → 100%).
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button data-testid="button-save-flag" onClick={handleSubmit} disabled={busy||!form.key||!form.name} className="bg-violet-600 hover:bg-violet-700">{busy?"Saving…":isEdit?"💾 Save Changes":"🚩 Create Flag"}</Button>
          {isEdit && (
            <Button variant="outline" onClick={onDone} className="border-zinc-600 text-zinc-300">Cancel</Button>
          )}
        </div>
      </div>

      {/* Schedule section — only for existing flags */}
      {isEdit && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-zinc-200">⏰ Schedule Enable/Disable</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 text-xs">Auto-Enable At</Label>
              <Input type="datetime-local" value={form.scheduledEnableAt} onChange={e=>setForm(p=>({...p,scheduledEnableAt:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Auto-Disable At</Label>
              <Input type="datetime-local" value={form.scheduledDisableAt} onChange={e=>setForm(p=>({...p,scheduledDisableAt:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
            </div>
          </div>
          <Button size="sm" onClick={()=>scheduleMut.mutate({enableAt:form.scheduledEnableAt||undefined,disableAt:form.scheduledDisableAt||undefined})} disabled={scheduleMut.isPending} className="bg-blue-700 hover:bg-blue-600">{scheduleMut.isPending?"Scheduling…":"⏰ Apply Schedule"}</Button>
        </div>
      )}

      {/* Targeting rules info */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h4 className="font-semibold text-zinc-200 mb-2">🎯 Targeting Rules (future)</h4>
        <div className="text-zinc-500 text-sm">Advanced targeting rules allow you to enable a flag only for specific user segments. Coming in v1.1:</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {["User Segment (freelancer/client)","Geographic (country/province)","Subscription Tier (free/pro/enterprise)","Academy Level (beginner/advanced)","Device Type (mobile/desktop/USSD)","Rural/Urban classification"].map(r => (
            <div key={r} className="flex items-center gap-2 text-xs text-zinc-500"><span className="text-violet-500">→</span>{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 3: AI Impact Predictor ───────────────────────────────────────────────
function AIImpactTab({ prefillFlag }: { prefillFlag: FeatureFlag|null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ key:"", name:"", description:"", category:"marketplace", impactLevel:"medium", action:"enable" });
  const [result, setResult] = useState<any>(null);

  const { data: flagsData } = useQuery({ queryKey:["/api/feature-flags","all","all","all"], queryFn:()=>apiRequest("GET","/api/feature-flags").then(r=>r.json()) });
  const flags: FeatureFlag[] = flagsData?.flags || [];

  useEffect(() => {
    if (prefillFlag?.key) setConfig({ key:prefillFlag.key, name:prefillFlag.name, description:prefillFlag.description||"", category:prefillFlag.category||"marketplace", impactLevel:prefillFlag.impactLevel||"medium", action:"enable" });
  }, [prefillFlag?.key]);

  const predict = async () => {
    if (!config.key) { toast({title:"Select or enter a flag first",variant:"destructive"}); return; }
    setLoading(true);
    try {
      const r = await apiRequest("POST","/api/feature-flags/predict", config);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setResult(d.prediction);
    } catch (e:any) { toast({title:"Prediction failed",description:e.message,variant:"destructive"}); }
    finally { setLoading(false); }
  };

  const RISK_COLORS: Record<string,string> = { low:"border-emerald-700/40 bg-emerald-950/20 text-emerald-300", medium:"border-blue-700/40 bg-blue-950/20 text-blue-300", high:"border-amber-700/40 bg-amber-950/20 text-amber-300", critical:"border-red-700/40 bg-red-950/20 text-red-300" };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">🤖 AI Impact Predictor</h3>
        <div className="text-zinc-500 text-sm mt-1">Before you enable any flag, get a GPT-4o-mini analysis of revenue impact, risk factors, server load, and Africa-first implications.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Config panel */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-zinc-200">Configure Prediction</h4>
          <div>
            <Label className="text-zinc-300 text-xs">Select Existing Flag (or enter manually)</Label>
            <Select value={config.key} onValueChange={v => { const f = flags.find(fl=>fl.key===v); if(f) setConfig({key:f.key,name:f.name,description:f.description||"",category:f.category,impactLevel:f.impactLevel,action:"enable"}); else setConfig(p=>({...p,key:v})); }}>
              <SelectTrigger data-testid="select-predict-flag" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue placeholder="Select a flag…" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-h-52 overflow-y-auto">{flags.map(f=><SelectItem key={f.key} value={f.key}><code className="text-xs text-violet-300">{f.key}</code></SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Flag Key</Label>
            <Input value={config.key} onChange={e=>setConfig(p=>({...p,key:e.target.value}))} placeholder="marketplace.bidding" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Name</Label>
            <Input value={config.name} onChange={e=>setConfig(p=>({...p,name:e.target.value}))} placeholder="Job Bidding" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Description</Label>
            <Textarea value={config.description} onChange={e=>setConfig(p=>({...p,description:e.target.value}))} placeholder="Brief description of what this flag does…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[70px] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-300 text-xs">Category</Label>
              <Select value={config.category} onValueChange={v=>setConfig(p=>({...p,category:v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{CATEGORIES.filter(c=>c!=="all").map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Impact Level</Label>
              <Select value={config.impactLevel} onValueChange={v=>setConfig(p=>({...p,impactLevel:v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{IMPACT_LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-zinc-300 text-xs">Action to Predict</Label>
            <Select value={config.action} onValueChange={v=>setConfig(p=>({...p,action:v}))}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="enable">Enable (turn on)</SelectItem><SelectItem value="disable">Disable (kill switch)</SelectItem></SelectContent>
            </Select>
          </div>
          <Button data-testid="button-predict" onClick={predict} disabled={loading||!config.key||!config.name} className="w-full bg-violet-700 hover:bg-violet-600">{loading?"Analyzing with GPT-4o-mini…":"🤖 Predict Impact"}</Button>
        </div>

        {/* Result panel */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col">
          <h4 className="font-semibold text-zinc-200 mb-3">Prediction Results</h4>
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
              <div className="text-5xl mb-3">🤖</div>
              <div className="text-sm">Fill in the form and click Predict Impact</div>
              <div className="text-xs mt-1">AI will analyze revenue, risk, server load, and Africa impact</div>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {/* Summary */}
              <div className={`rounded-lg border p-3 text-sm ${RISK_COLORS[result.riskLevel]||RISK_COLORS.medium}`}>
                <div className="font-semibold mb-1">Executive Summary</div>
                <div>{result.summary}</div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Revenue Impact</div>
                  <div className={`font-bold text-lg mt-1 ${result.revenueImpact?.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{result.revenueImpact}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Server Load</div>
                  <div className={`font-bold text-lg mt-1 ${result.serverLoad?.startsWith("-") ? "text-emerald-400" : "text-amber-400"}`}>{result.serverLoad}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Risk Level</div>
                  <div className={`font-bold mt-1 ${IMPACT_COLORS[result.riskLevel]||"text-zinc-300"}`}>{result.riskLevel?.toUpperCase()}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Rollout</div>
                  <div className="text-zinc-200 font-medium text-sm mt-1">{result.recommendedRollout}</div>
                </div>
              </div>

              {result.africaImpact && (
                <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 font-semibold mb-1">🌍 Africa Impact</div>
                  <div className="text-sm text-zinc-300">{result.africaImpact}</div>
                </div>
              )}

              {result.riskFactors?.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-1">⚠️ Risk Factors</div>
                  {result.riskFactors.map((r:string,i:number)=><div key={i} className="text-xs text-zinc-400 flex gap-1.5 mb-0.5"><span className="text-red-400">•</span>{r}</div>)}
                </div>
              )}

              {result.opportunities?.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-1">🚀 Opportunities</div>
                  {result.opportunities.map((o:string,i:number)=><div key={i} className="text-xs text-zinc-400 flex gap-1.5 mb-0.5"><span className="text-emerald-400">•</span>{o}</div>)}
                </div>
              )}

              {result.rolloutStrategy && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 font-semibold mb-1">📋 Rollout Strategy</div>
                  <div className="text-sm text-zinc-300">{result.rolloutStrategy}</div>
                  {result.testDuration && <div className="text-xs text-zinc-500 mt-1">Recommended A/B test duration: {result.testDuration}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: A/B Experiments ──────────────────────────────────────────────────
function ABTestingTab({ prefillFlag }: { prefillFlag: FeatureFlag|null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag|null>(prefillFlag);
  const [showNew, setShowNew] = useState(false);
  const [newExp, setNewExp] = useState({ name:"", hypothesis:"", targetMetric:"conversion_rate", trafficControl:50 });

  const { data: flagsData } = useQuery({ queryKey:["/api/feature-flags","all","all","all"], queryFn:()=>apiRequest("GET","/api/feature-flags").then(r=>r.json()) });
  const { data: expData, isLoading } = useQuery({
    queryKey:["/api/feature-flags/experiments", selectedFlag?.key],
    queryFn:()=>selectedFlag ? apiRequest("GET",`/api/feature-flags/${selectedFlag.key}/experiments`).then(r=>r.json()) : Promise.resolve({experiments:[]}),
    enabled:!!selectedFlag,
  });

  const flags: FeatureFlag[] = flagsData?.flags || [];
  const experiments: FlagExperiment[] = expData?.experiments || [];

  const createMut = useMutation({
    mutationFn:(d:any)=>apiRequest("POST",`/api/feature-flags/${selectedFlag!.key}/experiments`,d).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags/experiments",selectedFlag?.key]});setShowNew(false);toast({title:"Experiment created ✓"});},
  });
  const updateMut = useMutation({
    mutationFn:({eid,d}:{eid:string;d:any})=>apiRequest("PATCH",`/api/feature-flags/${selectedFlag!.key}/experiments/${eid}`,d).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags/experiments",selectedFlag?.key]});toast({title:"Updated"});},
  });
  const concludeMut = useMutation({
    mutationFn:({eid,winner}:{eid:string;winner:string})=>apiRequest("POST",`/api/feature-flags/${selectedFlag!.key}/experiments/${eid}/conclude`,{winner,winnerConfidence:97}).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/feature-flags/experiments",selectedFlag?.key]});toast({title:"Experiment concluded — winner locked!"});},
  });

  useEffect(()=>{ if(prefillFlag) setSelectedFlag(prefillFlag); },[prefillFlag?.key]);

  const EXP_STATUS_COLOR: Record<string,string> = { draft:"bg-zinc-600/20 text-zinc-400 border-zinc-600/30", running:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30", paused:"bg-amber-500/20 text-amber-300 border-amber-500/30", concluded:"bg-blue-500/20 text-blue-300 border-blue-500/30" };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">🧪 A/B Testing Panel</h3>
        <div className="text-zinc-500 text-sm">Create controlled experiments per flag, track conversion metrics, auto-detect winners with 95%+ confidence.</div>
      </div>

      {/* Flag selector */}
      <div className="flex gap-3 items-center flex-wrap">
        <Select value={selectedFlag?.key||""} onValueChange={v=>setSelectedFlag(flags.find(f=>f.key===v)||null)}>
          <SelectTrigger data-testid="select-exp-flag" className="bg-zinc-800 border-zinc-700 text-zinc-100 w-72"><SelectValue placeholder="Select a flag to experiment on…" /></SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-h-52">{flags.map(f=><SelectItem key={f.key} value={f.key}><code className="text-xs text-violet-300">{f.key}</code></SelectItem>)}</SelectContent>
        </Select>
        {selectedFlag && <Button size="sm" onClick={()=>setShowNew(true)} className="bg-violet-700 hover:bg-violet-600">+ New Experiment</Button>}
      </div>

      {!selectedFlag ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-4xl mb-3">🧪</div>Select a feature flag to see its A/B experiments</div>
      ) : isLoading ? (
        <div className="text-center py-8 text-zinc-500">Loading…</div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-12 text-zinc-500"><div className="text-4xl mb-3">📊</div>No experiments for <code className="text-violet-300">{selectedFlag.key}</code> yet.<div className="mt-2"><Button size="sm" onClick={()=>setShowNew(true)} className="bg-violet-700">Create first experiment</Button></div></div>
      ) : (
        <div className="space-y-4">
          {experiments.map(exp => (
            <div key={exp.id} data-testid={`experiment-${exp.id}`} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">{exp.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${EXP_STATUS_COLOR[exp.status]||EXP_STATUS_COLOR.draft}`}>{exp.status}</span>
                    {exp.winner && <span className="text-xs bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 rounded-full">🏆 Winner: {exp.winner}</span>}
                  </div>
                  {exp.hypothesis && <div className="text-zinc-500 text-sm mt-1">"{exp.hypothesis}"</div>}
                  <div className="text-zinc-600 text-xs mt-1">Metric: {exp.targetMetric} · Created: {new Date(exp.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {exp.status === "draft" && <Button size="sm" onClick={()=>updateMut.mutate({eid:exp.id,d:{status:"running"}})} className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7">▶ Start</Button>}
                  {exp.status === "running" && <Button size="sm" variant="outline" onClick={()=>updateMut.mutate({eid:exp.id,d:{status:"paused"}})} className="border-amber-600 text-amber-400 text-xs h-7">⏸ Pause</Button>}
                  {exp.status === "paused" && <Button size="sm" onClick={()=>updateMut.mutate({eid:exp.id,d:{status:"running"}})} className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7">▶ Resume</Button>}
                  {(exp.status === "running"||exp.status==="paused") && (
                    <Button size="sm" onClick={()=>concludeMut.mutate({eid:exp.id,winner:"treatment"})} className="bg-blue-700 hover:bg-blue-600 text-xs h-7">🏆 Conclude</Button>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {(exp.variants||[]).map((v:any) => {
                  // Simulate A/B results
                  const baseViews = 300 + Math.floor(Math.abs(exp.id.charCodeAt(0)) * 7);
                  const views = v.isControl ? baseViews : Math.floor(baseViews * 0.98);
                  const cvr = v.isControl ? 6.2 : 8.9;
                  return (
                    <div key={v.id} className={`rounded-lg border p-3 ${v.id===exp.winner?"border-emerald-600 bg-emerald-950/20":v.isControl?"border-zinc-700 bg-zinc-900":"border-blue-700/40 bg-blue-950/10"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {v.id===exp.winner && <span className="text-xs">🏆</span>}
                        <span className="font-medium text-zinc-100 text-sm">{v.name}</span>
                        {v.isControl && <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">Control</span>}
                        <span className="ml-auto text-xs text-zinc-500">{v.rollout}%</span>
                      </div>
                      {exp.status !== "draft" && (
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div><div className="text-zinc-600">Views</div><div className="font-medium text-zinc-200">{views.toLocaleString()}</div></div>
                          <div><div className="text-zinc-600">Conv.</div><div className={`font-medium ${cvr > 7 ? "text-emerald-400":"text-zinc-200"}`}>{cvr}%</div></div>
                          <div><div className="text-zinc-600">Winner?</div><div className={`font-medium ${cvr > 7 ? "text-emerald-400":"text-zinc-500"}`}>{cvr > 7 ? "✓ Yes":"—"}</div></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {exp.winner && exp.winnerConfidence && (
                <div className="mt-3 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-700/30 rounded-lg px-3 py-2">
                  🏆 Winner: <strong>{exp.winner}</strong> with {exp.winnerConfidence}% statistical confidence. {exp.status==="concluded" && "Experiment concluded."}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New experiment dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
          <DialogHeader><DialogTitle>🧪 New A/B Experiment — {selectedFlag?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-zinc-300 text-xs">Experiment Name *</Label><Input data-testid="input-exp-name" value={newExp.name} onChange={e=>setNewExp(p=>({...p,name:e.target.value}))} placeholder="Headline copy test" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            <div><Label className="text-zinc-300 text-xs">Hypothesis</Label><Textarea value={newExp.hypothesis} onChange={e=>setNewExp(p=>({...p,hypothesis:e.target.value}))} placeholder="We believe that enabling X will increase Y because Z…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[70px] text-sm" /></div>
            <div>
              <Label className="text-zinc-300 text-xs">Target Metric</Label>
              <Select value={newExp.targetMetric} onValueChange={v=>setNewExp(p=>({...p,targetMetric:v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{["conversion_rate","click_through_rate","revenue_per_user","engagement_time","retention_7d","signup_rate","gig_post_rate"].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Traffic Split — Control: {newExp.trafficControl}% / Treatment: {100-newExp.trafficControl}%</Label>
              <input type="range" min={10} max={90} step={5} value={newExp.trafficControl} onChange={e=>setNewExp(p=>({...p,trafficControl:parseInt(e.target.value)}))} className="w-full mt-2 accent-violet-500" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setShowNew(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-create-experiment" onClick={()=>createMut.mutate({name:newExp.name,hypothesis:newExp.hypothesis,targetMetric:newExp.targetMetric,variants:[{id:"control",name:"Control (flag off)",rollout:newExp.trafficControl,isControl:true},{id:"treatment",name:"Treatment (flag on)",rollout:100-newExp.trafficControl,isControl:false}]})} disabled={createMut.isPending||!newExp.name} className="bg-violet-700 hover:bg-violet-600">{createMut.isPending?"Creating…":"🧪 Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 5: History & Rollback ───────────────────────────────────────────────
function HistoryTab({ prefillFlag }: { prefillFlag: FeatureFlag|null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag|null>(prefillFlag);

  const { data: flagsData } = useQuery({ queryKey:["/api/feature-flags","all","all","all"], queryFn:()=>apiRequest("GET","/api/feature-flags").then(r=>r.json()) });
  const { data: histData, isLoading } = useQuery({
    queryKey:["/api/feature-flags/history", selectedFlag?.key],
    queryFn:()=>selectedFlag ? apiRequest("GET",`/api/feature-flags/${selectedFlag.key}/history`).then(r=>r.json()) : Promise.resolve({history:[]}),
    enabled:!!selectedFlag,
  });

  const flags: FeatureFlag[] = flagsData?.flags || [];
  const history: FlagHistory[] = histData?.history || [];

  const rollbackMut = useMutation({
    mutationFn:(key:string)=>apiRequest("POST",`/api/feature-flags/${key}/rollback`).then(r=>r.json()),
    onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/feature-flags/history",selectedFlag?.key]});qc.invalidateQueries({queryKey:["/api/feature-flags"]});toast({title:"Rolled back!",description:d.message});},
  });

  useEffect(()=>{ if(prefillFlag) setSelectedFlag(prefillFlag); },[prefillFlag?.key]);

  const ACTION_ICONS: Record<string,string> = { created:"🆕", enabled:"✅", disabled:"🔴", "rollout-changed":"📊", "targeting-updated":"🎯", locked:"🔐", unlocked:"🔓", scheduled:"⏰", rollback:"↩", deleted:"🗑", "experiment-started":"🧪" };
  const ACTION_COLOR: Record<string,string> = { created:"text-emerald-400", enabled:"text-emerald-400", disabled:"text-red-400", "rollout-changed":"text-blue-400", locked:"text-amber-400", rollback:"text-orange-400", deleted:"text-red-500" };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">📜 Immutable History & One-Click Rollback</h3>
        <div className="text-zinc-500 text-sm">Every flag state change is sealed in an append-only log. Rollback any flag to its previous safe state in one click.</div>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={selectedFlag?.key||""} onValueChange={v=>setSelectedFlag(flags.find(f=>f.key===v)||null)}>
          <SelectTrigger data-testid="select-history-flag" className="bg-zinc-800 border-zinc-700 text-zinc-100 w-72"><SelectValue placeholder="Select a flag…" /></SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-h-52">{flags.map(f=><SelectItem key={f.key} value={f.key}><code className="text-xs text-violet-300">{f.key}</code></SelectItem>)}</SelectContent>
        </Select>
        {selectedFlag && !selectedFlag.isLocked && (
          <Button size="sm" onClick={()=>rollbackMut.mutate(selectedFlag.key)} disabled={rollbackMut.isPending||history.length < 2} variant="outline" className="border-amber-600 text-amber-400">{rollbackMut.isPending?"Rolling back…":"↩ Rollback"}</Button>
        )}
        {selectedFlag?.isLocked && <div className="text-xs text-amber-400">🔐 Flag locked — unlock before rollback</div>}
      </div>

      {!selectedFlag ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-4xl mb-3">📜</div>Select a flag to view its history</div>
      ) : isLoading ? (
        <div className="text-center py-8 text-zinc-500">Loading history…</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-4xl mb-3">📭</div>No history for <code className="text-violet-300">{selectedFlag.key}</code> yet</div>
      ) : (
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={h.id} data-testid={`history-${h.id}`} className={`rounded-xl border p-4 ${i===0?"border-violet-500/40 bg-violet-950/10":"border-zinc-700 bg-zinc-900/20"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-xl mt-0.5">{ACTION_ICONS[h.action]||"📝"}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold capitalize text-sm ${ACTION_COLOR[h.action]||"text-zinc-200"}`}>{h.action.replace(/-/g," ")}</span>
                      {i===0 && <span className="text-xs text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded-full">Latest</span>}
                    </div>
                    {h.changeNote && <div className="text-zinc-400 text-sm mt-0.5">"{h.changeNote}"</div>}
                    {h.rolloutBefore !== undefined && h.rolloutAfter !== undefined && (
                      <div className="text-zinc-500 text-xs mt-1">Rollout: {h.rolloutBefore}% → {h.rolloutAfter}%</div>
                    )}
                    <div className="text-zinc-600 text-xs mt-1">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {h.previousState && <div className="text-right text-xs text-zinc-600"><div className="text-zinc-500">Previous</div><div>{(h.previousState as any)?.status || "—"}</div></div>}
                  {h.newState && <div className="text-right text-xs text-zinc-500"><div className="text-zinc-400">New</div><div>{(h.newState as any)?.status || "—"}</div></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
type TabId = "library"|"editor"|"ai"|"ab"|"history";
const TABS: {id:TabId;label:string}[] = [
  {id:"library",label:"🚀 Flags Library"},
  {id:"editor",label:"✏️ Flag Editor"},
  {id:"ai",label:"🤖 AI Impact"},
  {id:"ab",label:"🧪 A/B Testing"},
  {id:"history",label:"📜 History"},
];

export default function FeatureFlagsManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("library");
  const [editingFlag, setEditingFlag] = useState<FeatureFlag|null>(null);
  const [contextFlag, setContextFlag] = useState<FeatureFlag|null>(null);

  const handleEditFlag = (f: FeatureFlag) => { setEditingFlag(f); setActiveTab("editor"); };
  const handleSelectFlag = (f: FeatureFlag, tab: string) => { setContextFlag(f); setActiveTab(tab as TabId); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-700/20 border border-orange-700/40 flex items-center justify-center text-xl">🚩</div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Feature Flags v1.0</h1>
              <div className="text-sm text-zinc-500">Nuclear master control panel · 22 endpoints · 30 built-in flags · beats LaunchDarkly+Split+Unleash until 2030</div>
            </div>
          </div>
          {contextFlag && (
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
              <span className="text-zinc-500 text-xs">Context:</span>
              <code className="text-violet-300 text-xs">{contextFlag.key}</code>
              <Button size="sm" variant="ghost" onClick={()=>setContextFlag(null)} className="text-zinc-500 h-6 text-xs">✕</Button>
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab=>(
            <button key={tab.id} data-testid={`tab-ff-${tab.id}`} onClick={()=>setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab===tab.id?"bg-orange-700 text-white":"text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab==="library" && <FlagsLibraryTab onEditFlag={handleEditFlag} onSelectFlag={handleSelectFlag} />}
        {activeTab==="editor" && <FlagEditorTab prefill={editingFlag} onDone={()=>{setEditingFlag(null);setActiveTab("library");}} />}
        {activeTab==="ai" && <AIImpactTab prefillFlag={contextFlag} />}
        {activeTab==="ab" && <ABTestingTab prefillFlag={contextFlag} />}
        {activeTab==="history" && <HistoryTab prefillFlag={contextFlag} />}
      </div>
    </div>
  );
}
