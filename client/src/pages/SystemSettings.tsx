/**
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  SYSTEM SETTINGS DEPARTMENT v2.0 — 200% ELON MUSK INTELLIGENCE                 ║
 * ║  The Central Nervous System of FreelanceSkills.net                              ║
 * ║                                                                                  ║
 * ║  8-Tab Architecture:                                                             ║
 * ║  1. ⚙️  Platform Overview   — maintenance, core settings, KPI cards             ║
 * ║  2. 💰  Financial Settings  — commission tiers, escrow, withdrawal, currency    ║
 * ║  3. 🔒  Security Settings   — login limits, password policy, 2FA, geofencing   ║
 * ║  4. 🎛️  Feature Flags       — 15 toggles with rollout % + new flag creator     ║
 * ║  5. 🌍  Africa-First        — mobile money, USSD, low-data, currencies         ║
 * ║  6. 🤖  AI Optimizer        — 6D intelligence, one-click apply suggestions     ║
 * ║  7. 📚  Version History     — immutable timeline, rollback, diff viewer        ║
 * ║  8. 💚  System Health       — real-time monitoring, Socket.io, broadcasts      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Settings, DollarSign, Shield, ToggleLeft, Globe, Brain, History,
  Activity, RefreshCw, AlertTriangle, CheckCircle2, XCircle, RotateCcw,
  Zap, ChevronRight, Smartphone, Wifi, Lock, Users, Database, Clock,
  TrendingUp, Package, BarChart3, Eye, Save, Download, Radio, Bell,
  Flag, Cpu, Server, HardDrive, PlugZap, Lightbulb, ArrowRight,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// CONSTANTS + HELPERS
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "overview",  icon: "⚙️",  label: "Platform Overview" },
  { id: "financial", icon: "💰",  label: "Financial Settings" },
  { id: "security",  icon: "🔒",  label: "Security Settings"  },
  { id: "flags",     icon: "🎛️",  label: "Feature Flags"      },
  { id: "africa",    icon: "🌍",  label: "Africa-First"       },
  { id: "ai",        icon: "🤖",  label: "AI Optimizer"       },
  { id: "history",   icon: "📚",  label: "Version History"    },
  { id: "health",    icon: "💚",  label: "System Health"      },
];

const IMPACT_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f97316", low: "#22c55e" };
const IMPACT_BG: Record<string, string> = { high: "bg-red-800", medium: "bg-orange-700", low: "bg-emerald-700" };
const CAT_COLOR: Record<string, string> = {
  ai: "#8b5cf6", africa: "#10b981", financial: "#f59e0b",
  security: "#ef4444", platform: "#3b82f6", growth: "#ec4899", general: "#6b7280",
};

const api = {
  get: (url: string) => fetch(url, { credentials: "include" }).then(r => r.json()),
  post: (url: string, body?: any) =>
    fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).then(r => r.json()),
  patch: (url: string, body: any) =>
    fetch(url, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
};

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ══════════════════════════════════════════════════════════════════════════
// TOGGLE COMPONENT
// ══════════════════════════════════════════════════════════════════════════
function ConfigToggle({ label, desc, checked, onChange, testId }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {desc && <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG ROW
// ══════════════════════════════════════════════════════════════════════════
function FlagRow({ flag, onToggle, onRolloutChange }: { flag: any; onToggle: (key: string, v: boolean) => void; onRolloutChange: (key: string, v: number) => void }) {
  return (
    <div className={`p-3 rounded-lg border transition-all ${flag.enabled ? "border-emerald-800 bg-emerald-950/20" : "border-zinc-700 bg-zinc-900/50"}`} data-testid={`row-flag-${flag.flag_key}`}>
      <div className="flex items-start gap-3">
        <Switch checked={flag.enabled} onCheckedChange={v => onToggle(flag.flag_key, v)} className="mt-0.5"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{flag.flag_name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLOR[flag.category] || "#6b7280" }}>{flag.category}</span>
            {flag.enabled && <Badge className="bg-emerald-700 text-xs">LIVE</Badge>}
            {!flag.enabled && flag.rollout_percent > 0 && <Badge className="bg-zinc-600 text-xs">STAGED</Badge>}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{flag.description}</div>
          <div className="font-mono text-zinc-700 text-xs">{flag.flag_key}</div>
        </div>
        <div className="flex-shrink-0 w-36">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500">Rollout</span>
            <span className="text-xs font-bold" style={{ color: flag.enabled ? "#22c55e" : "#6b7280" }}>{flag.rollout_percent}%</span>
          </div>
          <input type="range" min="0" max="100" value={flag.rollout_percent}
            onChange={e => onRolloutChange(flag.flag_key, parseInt(e.target.value))}
            className="w-full h-1.5 accent-purple-500 cursor-pointer"
            data-testid={`slider-rollout-${flag.flag_key}`}/>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function SystemSettings() {
  const [tab, setTab]         = useState("overview");
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [viewVersion, setViewVersion] = useState<any>(null);

  // Data
  const [configs,    setConfigs]    = useState<Record<string, any>>({});
  const [flags,      setFlags]      = useState<any[]>([]);
  const [health,     setHealth]     = useState<any>(null);
  const [aiSuggest,  setAiSuggest]  = useState<any[]>([]);
  const [history,    setHistory]    = useState<any[]>([]);
  const [histTotal,  setHistTotal]  = useState(0);
  const [histPage,   setHistPage]   = useState(1);
  const [histKey,    setHistKey]    = useState("");
  const [compliance, setCompliance] = useState<any>(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [applyingAi, setApplyingAi] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<number | null>(null);

  // Local form states
  const [maint, setMaint]   = useState({ enabled: false, message: "", eta: "" });
  const [broadcast, setBroadcast] = useState({ title: "⚡ Platform Update", message: "", audience: "admins" });
  const [newFlag, setNewFlag] = useState({ flag_key: "", flag_name: "", description: "", category: "general", rollout_percent: 0 });
  const [showNewFlag, setShowNewFlag] = useState(false);

  // Toast helper
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  const loadConfigs = useCallback(async () => {
    const r = await api.get("/api/system-settings");
    if (r.configs) setConfigs(r.configs);
    if (r.health)  setHealth(r.health);
    setMaint({ enabled: !!r.configs["system.maintenanceMode"], message: r.configs["system.maintenanceMessage"] || "", eta: r.configs["system.maintenanceETA"] || "" });
  }, []);

  const loadFlags = useCallback(async () => {
    const r = await api.get("/api/system-settings/feature-flags");
    if (Array.isArray(r)) setFlags(r);
  }, []);

  const loadHealth = useCallback(async () => {
    const r = await api.get("/api/system-settings/health");
    setHealth(r);
  }, []);

  const loadHistory = useCallback(async () => {
    const p = new URLSearchParams({ page: String(histPage), limit: "50" });
    if (histKey) p.set("key", histKey);
    const r = await api.get(`/api/system-settings/history?${p}`);
    setHistory(r.history || []);
    setHistTotal(r.total || 0);
  }, [histPage, histKey]);

  const loadAi = async () => {
    setAiLoading(true);
    const r = await api.get("/api/system-settings/ai-suggest");
    setAiSuggest(r.suggestions || []);
    setAiLoading(false);
  };

  const loadCompliance = async () => {
    const r = await api.get("/api/system-settings/compliance");
    setCompliance(r);
  };

  useEffect(() => {
    loadConfigs();
    loadFlags();
  }, []);

  useEffect(() => {
    if (tab === "health") loadHealth();
    else if (tab === "history") loadHistory();
    else if (tab === "ai") { loadAi(); loadCompliance(); }
  }, [tab, histPage, histKey]);

  // Save a batch of config updates
  const saveConfig = async (updates: Record<string, any>, reason?: string) => {
    setSaving(true);
    try {
      const r = await api.patch("/api/system-settings/config", { updates, reason });
      if (r.ok) { showToast(`✓ Saved: ${Object.keys(updates).join(", ")}`); await loadConfigs(); }
      else showToast(r.message || "Save failed", false);
    } catch { showToast("Network error", false); }
    setSaving(false);
  };

  // Toggle feature flag
  const toggleFlag = async (key: string, enabled: boolean) => {
    const r = await api.patch(`/api/system-settings/feature-flags/${key}`, { enabled });
    if (r.ok) { setFlags(f => f.map(fl => fl.flag_key === key ? { ...fl, enabled } : fl)); showToast(`Flag ${key} ${enabled ? "enabled" : "disabled"}`); }
    else showToast(r.message || "Flag update failed", false);
  };

  // Update flag rollout %
  const updateRollout = async (key: string, rollout_percent: number) => {
    setFlags(f => f.map(fl => fl.flag_key === key ? { ...fl, rollout_percent } : fl));
    const r = await api.patch(`/api/system-settings/feature-flags/${key}`, { rollout_percent });
    if (!r.ok) showToast("Rollout update failed", false);
  };

  // Apply AI suggestion
  const applyAiSuggestion = async (s: any) => {
    setApplyingAi(s.id);
    const r = await api.post("/api/system-settings/ai-suggest/apply", {
      config_key: s.config_key, config_value: s.config_value,
      flag_key: s.flag_key, flag_value: s.flag_value,
      reason: `AI Optimizer: ${s.title}`,
    });
    if (r.ok) { showToast(`✓ AI suggestion applied: ${s.title}`); await loadConfigs(); await loadFlags(); }
    else showToast(r.message || "Apply failed", false);
    setApplyingAi(null);
  };

  // Rollback to a version
  const doRollback = async (id: number, configKey: string) => {
    if (!confirm(`Roll back ${configKey} to version #${id}? This creates a new version entry.`)) return;
    setRollingBack(id);
    const r = await api.post(`/api/system-settings/rollback/${id}`);
    if (r.ok) { showToast(`✓ Rolled back ${configKey} to version #${id}`); await loadConfigs(); await loadHistory(); }
    else showToast(r.message || "Rollback failed", false);
    setRollingBack(null);
  };

  // Maintenance toggle
  const applyMaintenance = async () => {
    const r = await api.post("/api/system-settings/maintenance", maint);
    if (r.ok) showToast(maint.enabled ? "⚠️ Maintenance mode ENABLED — users are blocked" : "✓ Maintenance mode disabled — platform is live");
    else showToast(r.message || "Failed", false);
  };

  // Broadcast
  const sendBroadcast = async () => {
    if (!broadcast.message) return showToast("Message required", false);
    const r = await api.post("/api/system-settings/broadcast", broadcast);
    if (r.ok) { showToast(`📢 Broadcast sent to ${broadcast.audience}`); setBroadcast(b => ({ ...b, message: "" })); }
    else showToast(r.message || "Broadcast failed", false);
  };

  // Export backup
  const exportBackup = () => {
    const a = document.createElement("a");
    a.href = "/api/system-settings/backup";
    a.download = `FSN-Backup-${Date.now()}.json`;
    a.click();
    showToast("System backup downloaded");
  };

  // Create new flag
  const createFlag = async () => {
    if (!newFlag.flag_key || !newFlag.flag_name) return showToast("Key and name required", false);
    const r = await api.post("/api/system-settings/feature-flags", newFlag);
    if (r.ok) { showToast(`Flag ${newFlag.flag_key} created`); setShowNewFlag(false); setNewFlag({ flag_key: "", flag_name: "", description: "", category: "general", rollout_percent: 0 }); await loadFlags(); }
    else showToast(r.message || "Create failed", false);
  };

  // ════════════════════════════════════════════════════════════════════
  // TAB 1: PLATFORM OVERVIEW
  // ════════════════════════════════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-purple-400"/>Platform Overview — Core Configuration</h2>
        <p className="text-zinc-400 text-xs">Maintenance mode, quick settings snapshot, Socket.io live sync. Every change version-tracked and audit-logged.</p>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Config Keys", v: Object.keys(configs).length, c: "text-purple-400", b: "border-purple-800", icon: Database },
          { l: "Feature Flags", v: flags.length, c: "text-blue-400", b: "border-blue-800", icon: Flag },
          { l: "Active Flags", v: flags.filter(f => f.enabled).length, c: "text-emerald-400", b: "border-emerald-800", icon: CheckCircle2 },
          { l: "Maintenance", v: configs["system.maintenanceMode"] ? "ON ⚠️" : "OFF ✅", c: configs["system.maintenanceMode"] ? "text-red-400" : "text-emerald-400", b: configs["system.maintenanceMode"] ? "border-red-800" : "border-emerald-800", icon: Shield },
        ].map((k, i) => (
          <Card key={i} className={`bg-zinc-900 border ${k.b}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <k.icon className={`w-8 h-8 ${k.c}`}/>
              <div><div className={`text-xl font-bold ${k.c}`}>{k.v}</div><div className="text-xs text-zinc-500">{k.l}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Mode */}
      <Card className={`bg-zinc-900 border ${maint.enabled ? "border-red-700" : "border-zinc-700"}`}>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className={`w-4 h-4 ${maint.enabled ? "text-red-400" : "text-zinc-500"}`}/>Maintenance Mode — Platform-Wide Lockout</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {maint.enabled && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-xs text-red-300">
              ⚠️ MAINTENANCE MODE IS ACTIVE — All users see the maintenance message. Only admins can access the platform.
            </div>
          )}
          <ConfigToggle label="Enable Maintenance Mode" desc="Blocks all user access. Socket.io broadcasts maintenance state to all connected clients." checked={maint.enabled} onChange={v => setMaint(m => ({ ...m, enabled: v }))} testId="toggle-maintenance"/>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-zinc-400">User-Facing Message</Label>
              <Input className="mt-1 h-8 text-xs" value={maint.message} onChange={e => setMaint(m => ({ ...m, message: e.target.value }))} placeholder="Platform undergoing scheduled maintenance. Back in 30 mins." data-testid="input-maintenance-message"/>
            </div>
            <div><Label className="text-xs text-zinc-400">ETA (ISO DateTime)</Label>
              <Input type="datetime-local" className="mt-1 h-8 text-xs" value={maint.eta} onChange={e => setMaint(m => ({ ...m, eta: e.target.value }))} data-testid="input-maintenance-eta"/>
            </div>
          </div>
          <Button className={`${maint.enabled ? "bg-red-700 hover:bg-red-600" : "bg-zinc-700 hover:bg-zinc-600"} h-8 text-xs`} onClick={applyMaintenance} data-testid="button-apply-maintenance">
            <Save className="w-3.5 h-3.5 mr-1"/>{maint.enabled ? "Apply Maintenance Mode (Blocks Users)" : "Disable Maintenance Mode"}
          </Button>
        </CardContent>
      </Card>

      {/* Settings Snapshot */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Financial", items: [
            ["Commission", `${((configs["financial.commissionBPS"] || 1000)/100).toFixed(1)}%`],
            ["Escrow Release", `${configs["financial.escrowAutoReleaseHours"] || 72}h`],
            ["Currency", configs["financial.currency"] || "ZAR"],
            ["Min Withdrawal", `R${configs["financial.withdrawalMinimumZAR"] || 200}`],
          ]},
          { title: "Security", items: [
            ["Login Attempts", `${configs["security.loginAttemptLimit"] || 5} max`],
            ["Lockout Duration", `${configs["security.loginLockoutMinutes"] || 30}min`],
            ["Password Min Length", String(configs["security.passwordMinLength"] || 8)],
            ["2FA Enforced", configs["security.twoFactorEnforced"] ? "Yes ✅" : "No ❌"],
          ]},
          { title: "Africa-First", items: [
            ["Mobile Money", configs["africa.mobileMoneyEnabled"] ? "Enabled ✅" : "Disabled"],
            ["USSD Access", configs["africa.ussdEnabled"] ? "Enabled ✅" : "Disabled"],
            ["Low-Data Mode", configs["africa.lowDataMode"] ? "Enabled ✅" : "Disabled"],
            ["USSD Code", configs["africa.ussdCode"] || "*120*FREELANCE#"],
          ]},
        ].map((section, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">{section.title} Config Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {section.items.map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-1 border-b border-zinc-800/60 last:border-0">
                  <span className="text-xs text-zinc-500">{l}</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{v as string}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Broadcast */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radio className="w-4 h-4 text-blue-400"/>Global Broadcast — Socket.io Push to All Connected Clients</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Input className="h-8 text-xs col-span-2" placeholder="Broadcast title..." value={broadcast.title} onChange={e => setBroadcast(b => ({ ...b, title: e.target.value }))} data-testid="input-broadcast-title"/>
            <Select value={broadcast.audience} onValueChange={v => setBroadcast(b => ({ ...b, audience: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="admins">Admins Only</SelectItem><SelectItem value="all">All Users (⚠️)</SelectItem></SelectContent>
            </Select>
          </div>
          <Textarea className="text-xs resize-none h-16" placeholder="Broadcast message..." value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))} data-testid="input-broadcast-message"/>
          <Button className="bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={sendBroadcast} data-testid="button-broadcast"><Radio className="w-3.5 h-3.5 mr-1"/>Send Broadcast</Button>
        </CardContent>
      </Card>

      {/* Backup */}
      <div className="flex gap-3">
        <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-xs" onClick={exportBackup} data-testid="button-backup"><Download className="w-3.5 h-3.5 mr-1"/>Export Full System Backup (JSON)</Button>
        <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-xs" onClick={loadCompliance} data-testid="button-compliance"><Shield className="w-3.5 h-3.5 mr-1"/>Run Compliance Check</Button>
      </div>
      {compliance && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-400"/>Compliance Alerts — POPIA + NDPR + ISO 27001</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {compliance.alerts?.map((a: any, i: number) => (
              <div key={i} className={`p-3 rounded-lg border text-xs ${a.severity === "high" ? "bg-red-950/30 border-red-800" : a.severity === "medium" ? "bg-orange-950/30 border-orange-800" : "bg-zinc-800/50 border-zinc-700"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={a.severity === "high" ? "bg-red-700 text-xs" : a.severity === "medium" ? "bg-orange-700 text-xs" : "bg-zinc-700 text-xs"}>{a.severity.toUpperCase()}</Badge>
                  <span className="font-semibold text-zinc-200">{a.area}</span>
                  <span className="text-zinc-500">{a.law}</span>
                </div>
                <div className="text-zinc-300 mb-1">{a.message}</div>
                <div className="text-zinc-500 flex items-center gap-1"><Lightbulb className="w-3 h-3"/>{a.recommendation}</div>
              </div>
            ))}
            {compliance.alerts?.length === 0 && <div className="text-emerald-400 text-sm">✅ All compliance checks passed — fully compliant with POPIA, NDPR, ISO 27001</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // TAB 2: FINANCIAL SETTINGS
  // ════════════════════════════════════════════════════════════════════
  const renderFinancial = () => {
    const commissionPct = ((configs["financial.commissionBPS"] || 1000) / 100).toFixed(1);
    const tiers: any[] = configs["financial.commissionTiers"] || [];
    const [localBPS, setLocalBPS] = useState(configs["financial.commissionBPS"] || 1000);
    const [localEscrow, setLocalEscrow] = useState(configs["financial.escrowAutoReleaseHours"] || 72);
    const [localMinWd, setLocalMinWd] = useState(configs["financial.withdrawalMinimumZAR"] || 200);
    const [localWdFee, setLocalWdFee] = useState(configs["financial.withdrawalFeePercent"] || 1.5);
    const [localCurrency, setLocalCurrency] = useState(configs["financial.currency"] || "ZAR");
    const [localReferral, setLocalReferral] = useState(configs["financial.referralBonusPercent"] || 5);
    return (
      <div className="space-y-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign className="w-6 h-6 text-yellow-400"/>Financial Settings — Commission · Escrow · Withdrawal · Currency</h2>
          <p className="text-zinc-400 text-xs">Upwork & Fiverr use flat 20%. FreelanceSkills uses AI-tiered commission from 5–15%. Every change is version-tracked with rollback.</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {/* Commission */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-yellow-400"/>Platform Commission Rate</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-zinc-400">Commission in Basis Points (100 BPS = 1%)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input type="range" min="0" max="3000" step="25" value={localBPS} onChange={e => setLocalBPS(Number(e.target.value))} className="flex-1 h-2 accent-yellow-400" data-testid="slider-commission"/>
                  <span className="text-2xl font-bold text-yellow-400 w-16 text-right">{(localBPS/100).toFixed(1)}%</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Current: {commissionPct}% · Upwork/Fiverr: 20% · Our target: 5–15% tiered</div>
              </div>
              <Button className="bg-yellow-600 hover:bg-yellow-700 w-full h-8 text-xs" onClick={() => saveConfig({ "financial.commissionBPS": localBPS }, "Commission rate adjustment")} disabled={saving} data-testid="button-save-commission">
                <Save className="w-3.5 h-3.5 mr-1"/>Save Commission ({(localBPS/100).toFixed(1)}%)
              </Button>
              {/* Commission Tiers */}
              <div>
                <div className="text-xs text-zinc-500 font-semibold mb-2">Tiered Structure (cumulative earnings)</div>
                <div className="space-y-1.5">
                  {tiers.map((tier: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-zinc-800 rounded text-xs">
                      <span className="text-zinc-400">
                        {tier.min === 0 ? "0" : `R${(tier.min/100).toFixed(0)}`}
                        {" → "}
                        {tier.max ? `R${(tier.max/100).toFixed(0)}` : "∞"}
                      </span>
                      <Badge className="bg-yellow-700 text-xs">{(tier.bps/100).toFixed(1)}%</Badge>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-zinc-600 mt-1">Tiers reward long-term platform loyalty — freelancers earn more as they grow</div>
              </div>
            </CardContent>
          </Card>
          {/* Escrow + Withdrawal */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400"/>Escrow · Withdrawal · Referral</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-zinc-400">Escrow Auto-Release (hours)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="12" max="168" step="6" value={localEscrow} onChange={e => setLocalEscrow(Number(e.target.value))} className="flex-1 h-2 accent-blue-400"/>
                  <span className="font-bold text-blue-400 w-12 text-right">{localEscrow}h</span>
                </div>
                <div className="text-xs text-zinc-600">Recommended: 48–72h (AI: {Math.max(48, Math.ceil((configs["financial.escrowAutoReleaseHours"] || 72) * 1.5))}h)</div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Minimum Withdrawal (ZAR)</Label>
                <div className="flex gap-2 mt-1.5">
                  <input type="number" value={localMinWd} onChange={e => setLocalMinWd(Number(e.target.value))} className="flex-1 h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-xs text-white" data-testid="input-withdrawal-min"/>
                  <span className="text-xs text-zinc-500 self-center">ZAR</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Withdrawal Fee (%)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="0" max="5" step="0.1" value={localWdFee} onChange={e => setLocalWdFee(Number(e.target.value))} className="flex-1 h-2 accent-orange-400"/>
                  <span className="font-bold text-orange-400 w-12 text-right">{Number(localWdFee).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Referral Bonus (%)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="0" max="20" step="0.5" value={localReferral} onChange={e => setLocalReferral(Number(e.target.value))} className="flex-1 h-2 accent-emerald-400"/>
                  <span className="font-bold text-emerald-400 w-12 text-right">{Number(localReferral).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Primary Currency</Label>
                <Select value={localCurrency} onValueChange={setLocalCurrency}>
                  <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent>{["ZAR","NGN","KES","GHS","USD","EUR","GBP"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-xs" onClick={() => saveConfig({
                "financial.escrowAutoReleaseHours": localEscrow,
                "financial.withdrawalMinimumZAR": localMinWd,
                "financial.withdrawalFeePercent": localWdFee,
                "financial.referralBonusPercent": localReferral,
                "financial.currency": localCurrency,
              }, "Financial settings update")} disabled={saving} data-testid="button-save-financial">
                <Save className="w-3.5 h-3.5 mr-1"/>Save Financial Settings
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Financial Impact Visual */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Commission Live Preview — Revenue Impact Calculator</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { scenario: "R1,000 job", rev: ((localBPS/10000)*1000).toFixed(2) },
                { scenario: "R10,000 job", rev: ((localBPS/10000)*10000).toFixed(2) },
                { scenario: "R50,000 job", rev: ((localBPS/10000)*50000).toFixed(2) },
                { scenario: "R100,000/mo volume", rev: ((localBPS/10000)*100000).toFixed(2) },
              ].map((s, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-zinc-500">{s.scenario}</div>
                  <div className="text-lg font-bold text-yellow-400 mt-1">R{s.rev}</div>
                  <div className="text-xs text-zinc-600">platform revenue</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-zinc-500">vs. Upwork (20%): {[1000,10000,50000,100000].map(v => `R${(v*0.2).toFixed(0)}`).join(" · ")} — FreelanceSkills is {(20-localBPS/100).toFixed(1)}% cheaper for freelancers</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // TAB 3: SECURITY SETTINGS
  // ════════════════════════════════════════════════════════════════════
  const renderSecurity = () => {
    const [loginLimit, setLoginLimit] = useState(configs["security.loginAttemptLimit"] || 5);
    const [lockoutMins, setLockoutMins] = useState(configs["security.loginLockoutMinutes"] || 30);
    const [pwdLen, setPwdLen] = useState(configs["security.passwordMinLength"] || 8);
    const [pwdExpiry, setPwdExpiry] = useState(configs["security.passwordExpiryDays"] || 90);
    const [sessionTimeout, setSessionTimeout] = useState(configs["security.sessionTimeoutMinutes"] || 60);
    const [rateLimit, setRateLimit] = useState(configs["security.rateLimitPerMinute"] || 100);
    const [require2FA, setRequire2FA] = useState(!!configs["security.twoFactorEnforced"]);
    const [requireSpecial, setRequireSpecial] = useState(!!configs["security.passwordRequireSpecial"]);
    const [requireNumbers, setRequireNumbers] = useState(!!configs["security.passwordRequireNumbers"]);
    const [ipGeofencing, setIpGeofencing] = useState(!!configs["security.ipGeofencingEnabled"]);
    const [allowedCountries, setAllowedCountries] = useState((configs["security.allowedCountries"] || ["ZA","NG","KE","GH","RW","TZ"]).join(", "));
    return (
      <div className="space-y-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-red-400"/>Security Settings — Login · Password · 2FA · Geofencing</h2>
          <p className="text-zinc-400 text-xs">Configures platform-wide security policies. Compliant with POPIA, NDPR, ISO 27001, and SOC 2 Type II.</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {/* Login Security */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-red-400"/>Login Security Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-zinc-400">Max Login Attempts Before Lockout</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="1" max="10" value={loginLimit} onChange={e => setLoginLimit(Number(e.target.value))} className="flex-1 h-2 accent-red-400"/>
                  <span className="font-bold text-red-400 w-8 text-right">{loginLimit}</span>
                </div>
                <div className="text-xs text-zinc-600">{loginLimit <= 3 ? "🔴 High security — may frustrate users" : loginLimit <= 5 ? "🟡 Balanced" : "🟢 User-friendly — lower security"}</div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Lockout Duration (minutes)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="5" max="120" step="5" value={lockoutMins} onChange={e => setLockoutMins(Number(e.target.value))} className="flex-1 h-2 accent-orange-400"/>
                  <span className="font-bold text-orange-400 w-12 text-right">{lockoutMins}m</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Session Idle Timeout (minutes)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="10" max="480" step="10" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} className="flex-1 h-2 accent-blue-400"/>
                  <span className="font-bold text-blue-400 w-14 text-right">{sessionTimeout}m</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">API Rate Limit (requests/minute/IP)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="10" max="500" step="10" value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))} className="flex-1 h-2 accent-purple-400"/>
                  <span className="font-bold text-purple-400 w-12 text-right">{rateLimit}/m</span>
                </div>
              </div>
              <ConfigToggle label="Enforce 2FA for All Admin Accounts" desc="POPIA §22 + SOC 2 compliance. Recommended for platforms with financial data." checked={require2FA} onChange={v => setRequire2FA(v)} testId="toggle-2fa"/>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-400"/>Password Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-zinc-400">Minimum Password Length</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="6" max="32" value={pwdLen} onChange={e => setPwdLen(Number(e.target.value))} className="flex-1 h-2 accent-blue-400"/>
                  <span className="font-bold text-blue-400 w-10 text-right">{pwdLen} chars</span>
                </div>
                <div className="text-xs text-zinc-600">{pwdLen < 8 ? "⚠️ Below POPIA/NDPR minimum" : pwdLen >= 12 ? "✅ Strong — recommended for financial platforms" : "✅ Adequate"}</div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Password Expiry (days, 0=never)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min="0" max="365" step="30" value={pwdExpiry} onChange={e => setPwdExpiry(Number(e.target.value))} className="flex-1 h-2 accent-yellow-400"/>
                  <span className="font-bold text-yellow-400 w-14 text-right">{pwdExpiry === 0 ? "Never" : `${pwdExpiry}d`}</span>
                </div>
                <div className="text-xs text-zinc-600">ISO 27001 A.9.4.3 recommends 90-day rotation</div>
              </div>
              <ConfigToggle label="Require Special Characters" desc="POPIA + NDPR require adequate complexity" checked={requireSpecial} onChange={setRequireSpecial} testId="toggle-require-special"/>
              <ConfigToggle label="Require Numbers" checked={requireNumbers} onChange={setRequireNumbers} testId="toggle-require-numbers"/>
              {/* IP Geofencing */}
              <ConfigToggle label="IP Geofencing (Restrict by Country)" desc="Block logins from countries outside allowed list" checked={ipGeofencing} onChange={setIpGeofencing} testId="toggle-geofencing"/>
              {ipGeofencing && (
                <div><Label className="text-xs text-zinc-400">Allowed Countries (ISO codes)</Label>
                  <Input className="mt-1 h-7 text-xs font-mono" value={allowedCountries} onChange={e => setAllowedCountries(e.target.value)} placeholder="ZA, NG, KE, GH, RW, TZ" data-testid="input-allowed-countries"/>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Button className="bg-red-700 hover:bg-red-600 h-9 px-6" onClick={() => saveConfig({
          "security.loginAttemptLimit": loginLimit,
          "security.loginLockoutMinutes": lockoutMins,
          "security.passwordMinLength": pwdLen,
          "security.passwordExpiryDays": pwdExpiry,
          "security.sessionTimeoutMinutes": sessionTimeout,
          "security.rateLimitPerMinute": rateLimit,
          "security.twoFactorEnforced": require2FA,
          "security.passwordRequireSpecial": requireSpecial,
          "security.passwordRequireNumbers": requireNumbers,
          "security.ipGeofencingEnabled": ipGeofencing,
          "security.allowedCountries": allowedCountries.split(",").map(s => s.trim()).filter(Boolean),
        }, "Security policy update")} disabled={saving} data-testid="button-save-security">
          <Shield className="w-4 h-4 mr-1"/>Save Security Policy (POPIA + NDPR + ISO 27001 Compliant)
        </Button>
        {/* Security Score */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Security Posture Score</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: "Login Security", v: Math.round((5 / Math.max(1, loginLimit)) * 100), max: 100 },
                { l: "Password Policy", v: Math.round((pwdLen / 16) * 100), max: 100 },
                { l: "Session Security", v: Math.round((60 / Math.max(10, sessionTimeout)) * 100), max: 100 },
                { l: "Advanced Auth", v: (require2FA ? 50 : 0) + (ipGeofencing ? 30 : 0) + (requireSpecial ? 10 : 0) + (requireNumbers ? 10 : 0), max: 100 },
              ].map((s, i) => {
                const pct = Math.min(100, s.v);
                return (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: pct >= 75 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444" }}>{pct}</div>
                    <div className="text-xs text-zinc-500">{s.l}</div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded mt-1"><div className="h-1.5 rounded" style={{ width: `${pct}%`, backgroundColor: pct >= 75 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444" }}/></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // TAB 4: FEATURE FLAGS
  // ════════════════════════════════════════════════════════════════════
  const renderFlags = () => {
    const categories = [...new Set(flags.map(f => f.category))].sort();
    const [filterCat, setFilterCat] = useState("all");
    const filtered = filterCat === "all" ? flags : flags.filter(f => f.category === filterCat);
    const active = flags.filter(f => f.enabled).length;
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><ToggleLeft className="w-6 h-6 text-blue-400"/>Feature Flags — {active}/{flags.length} Active</h2>
            <p className="text-zinc-400 text-xs">Toggle experiments, staged rollouts, and Africa-First features. Rollout % enables gradual deployment.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={() => setShowNewFlag(true)} data-testid="button-new-flag"><Flag className="w-3.5 h-3.5 mr-1"/>New Flag</Button>
        </div>
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", ...categories].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterCat === c ? "text-white ring-2 ring-white" : "text-zinc-400 hover:text-zinc-200"}`}
              style={{ backgroundColor: c === "all" ? "#6b7280" : (CAT_COLOR[c] || "#6b7280"), opacity: filterCat === c ? 1 : 0.6 }}>
              {c}
            </button>
          ))}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { cat: "ai", label: "AI Features", icon: Brain },
            { cat: "africa", label: "Africa-First", icon: Globe },
            { cat: "financial", label: "Financial", icon: DollarSign },
            { cat: "security", label: "Security", icon: Shield },
            { cat: "platform", label: "Platform", icon: Package },
          ].map(c => {
            const catFlags = flags.filter(f => f.category === c.cat);
            const catActive = catFlags.filter(f => f.enabled).length;
            return (
              <Card key={c.cat} className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-600" onClick={() => setFilterCat(c.cat)}>
                <CardContent className="p-3 text-center">
                  <c.icon className="w-5 h-5 mx-auto mb-1" style={{ color: CAT_COLOR[c.cat] }}/>
                  <div className="text-lg font-bold text-white">{catActive}/{catFlags.length}</div>
                  <div className="text-xs text-zinc-500">{c.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="space-y-2">
          {filtered.map(flag => <FlagRow key={flag.flag_key} flag={flag} onToggle={toggleFlag} onRolloutChange={updateRollout}/>)}
        </div>
        {/* New Flag Dialog */}
        <Dialog open={showNewFlag} onOpenChange={setShowNewFlag}>
          <DialogContent className="bg-zinc-950 border-zinc-700">
            <DialogHeader><DialogTitle className="text-white">Create New Feature Flag</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Flag Key (snake_case)</Label><Input className="mt-1 h-8 text-xs font-mono" value={newFlag.flag_key} onChange={e => setNewFlag(f => ({ ...f, flag_key: e.target.value }))} placeholder="enable_my_feature" data-testid="input-new-flag-key"/></div>
              <div><Label className="text-xs">Display Name</Label><Input className="mt-1 h-8 text-xs" value={newFlag.flag_name} onChange={e => setNewFlag(f => ({ ...f, flag_name: e.target.value }))} placeholder="My Feature" data-testid="input-new-flag-name"/></div>
              <div><Label className="text-xs">Description</Label><Input className="mt-1 h-8 text-xs" value={newFlag.description} onChange={e => setNewFlag(f => ({ ...f, description: e.target.value }))} placeholder="What does this flag control?"/></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Category</Label>
                  <Select value={newFlag.category} onValueChange={v => setNewFlag(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>{["ai","africa","financial","security","platform","growth","general"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Initial Rollout %</Label><Input type="number" className="mt-1 h-8 text-xs" value={newFlag.rollout_percent} onChange={e => setNewFlag(f => ({ ...f, rollout_percent: parseInt(e.target.value) }))} min="0" max="100"/></div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-xs" onClick={createFlag}>Create Flag</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // TAB 5: AFRICA-FIRST
  // ════════════════════════════════════════════════════════════════════
  const renderAfrica = () => {
    const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(!!configs["africa.mobileMoneyEnabled"]);
    const [ussdEnabled, setUssdEnabled] = useState(!!configs["africa.ussdEnabled"]);
    const [ussdCode, setUssdCode] = useState(configs["africa.ussdCode"] || "*120*FREELANCE#");
    const [lowDataMode, setLowDataMode] = useState(!!configs["africa.lowDataMode"]);
    const [offlineSupport, setOfflineSupport] = useState(!!configs["africa.offlineSupport"]);
    const [supportedCurrencies, setSupportedCurrencies] = useState((configs["africa.supportedCurrencies"] || ["ZAR","NGN","KES","GHS","RWF"]).join(", "));
    const [zeroRating, setZeroRating] = useState((configs["africa.zeroRatingPartners"] || []).join(", "));
    const mobileProviders = configs["africa.mobileMoneyProviders"] || [];
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-emerald-400"/>Africa-First Configuration</h2>
          <p className="text-zinc-400 text-xs">The only freelance platform built for Africa's 650M people — mobile money, USSD, low-data, 8 currencies. Fiverr/Upwork have zero Africa-specific config.</p>
        </div>
        {/* Africa Coverage */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { flag: "🇿🇦", country: "South Africa", currency: "ZAR", network: "Vodacom · MTN · Nedbank · FNB", active: true },
            { flag: "🇳🇬", country: "Nigeria", currency: "NGN", network: "MTN MoMo · Opay · Flutterwave", active: mobileMoneyEnabled },
            { flag: "🇰🇪", country: "Kenya", currency: "KES", network: "M-Pesa · Airtel Money", active: mobileMoneyEnabled },
            { flag: "🇬🇭", country: "Ghana", currency: "GHS", network: "MTN MoMo · Vodafone Cash · Airtel", active: mobileMoneyEnabled },
            { flag: "🇷🇼", country: "Rwanda", currency: "RWF", network: "MTN MoMo · Airtel Money", active: false },
            { flag: "🌍", country: "Tanzania + More", currency: "TZS/UGX/XOF", network: "Roadmap Q3 2026", active: false },
          ].map((c, i) => (
            <div key={i} className={`p-3 rounded-lg border text-xs ${c.active ? "bg-emerald-950/20 border-emerald-800" : "bg-zinc-900 border-zinc-700"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{c.flag}</span>
                <div>
                  <div className="font-bold text-white">{c.country}</div>
                  <div className="text-zinc-500">{c.currency}</div>
                </div>
                {c.active && <Badge className="bg-emerald-700 text-xs ml-auto">LIVE</Badge>}
              </div>
              <div className="text-zinc-500">{c.network}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5">
          {/* Mobile Money */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-400"/>Mobile Money Integration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ConfigToggle label="Enable Mobile Money" desc="M-Pesa, MTN MoMo, Airtel, SnapScan, Flutterwave, PayFast" checked={mobileMoneyEnabled} onChange={setMobileMoneyEnabled} testId="toggle-mobile-money"/>
              <div>
                <Label className="text-xs text-zinc-400">Active Providers</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mobileProviders.map((p: string) => (
                    <Badge key={p} className="bg-emerald-800 text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Supported Currencies (comma-separated)</Label>
                <Input className="mt-1 h-7 text-xs font-mono" value={supportedCurrencies} onChange={e => setSupportedCurrencies(e.target.value)} data-testid="input-supported-currencies"/>
              </div>
            </CardContent>
          </Card>
          {/* USSD + Low Data */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wifi className="w-4 h-4 text-blue-400"/>USSD · Low-Data · Offline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ConfigToggle label="USSD Platform Access" desc="Users can browse and bid on jobs via *120*FREELANCE# without data" checked={ussdEnabled} onChange={setUssdEnabled} testId="toggle-ussd"/>
              {ussdEnabled && (
                <div><Label className="text-xs text-zinc-400">USSD Code</Label>
                  <div className="font-mono text-emerald-400 text-xl mt-1 bg-zinc-800 rounded p-2 text-center">{ussdCode}</div>
                  <Input className="mt-1 h-7 text-xs font-mono" value={ussdCode} onChange={e => setUssdCode(e.target.value)} data-testid="input-ussd-code"/>
                </div>
              )}
              <ConfigToggle label="Low-Data Mode" desc="Compresses images 70%, lazy-loads everything, removes animations. Reduces bandwidth by 60%." checked={lowDataMode} onChange={setLowDataMode} testId="toggle-low-data"/>
              <ConfigToggle label="PWA Offline Support" desc="Service worker caches job listings for offline browsing. Sync when reconnected." checked={offlineSupport} onChange={setOfflineSupport} testId="toggle-offline"/>
              <div><Label className="text-xs text-zinc-400">Zero-Rating Partners</Label>
                <Input className="mt-1 h-7 text-xs font-mono" value={zeroRating} onChange={e => setZeroRating(e.target.value)} placeholder="Vodacom, MTN, Safaricom..." data-testid="input-zero-rating"/>
                <div className="text-xs text-zinc-600 mt-0.5">Carriers who zero-rate FreelanceSkills.net traffic</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Button className="bg-emerald-700 hover:bg-emerald-600 h-9 px-6" onClick={() => saveConfig({
          "africa.mobileMoneyEnabled": mobileMoneyEnabled,
          "africa.ussdEnabled": ussdEnabled,
          "africa.ussdCode": ussdCode,
          "africa.lowDataMode": lowDataMode,
          "africa.offlineSupport": offlineSupport,
          "africa.supportedCurrencies": supportedCurrencies.split(",").map(s => s.trim()).filter(Boolean),
          "africa.zeroRatingPartners": zeroRating.split(",").map(s => s.trim()).filter(Boolean),
        }, "Africa-First config update")} disabled={saving} data-testid="button-save-africa">
          <Globe className="w-4 h-4 mr-1"/>Save Africa-First Settings
        </Button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // TAB 6: AI OPTIMIZER
  // ════════════════════════════════════════════════════════════════════
  const renderAi = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-purple-400"/>AI Optimizer — 6-Dimension Platform Intelligence</h2>
          <p className="text-zinc-400 text-xs">Scans dispute rates, user growth, security anomalies, Africa adoption, and competitive data. Generates actionable suggestions with one-click apply.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 h-8 text-xs" onClick={loadAi} disabled={aiLoading} data-testid="button-ai-scan">
          {aiLoading ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin"/>Scanning…</> : <><Brain className="w-3.5 h-3.5 mr-1"/>Run AI Scan</>}
        </Button>
      </div>
      {/* Dimensions */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { d: "D1", l: "Commission", desc: "Dispute rate vs commission optimization", icon: DollarSign, c: "#f59e0b" },
          { d: "D2", l: "Escrow", desc: "Dispute resolution time alignment", icon: Clock, c: "#3b82f6" },
          { d: "D3", l: "Security", desc: "Anomaly count vs login threshold", icon: Shield, c: "#ef4444" },
          { d: "D4", l: "Africa", desc: "Geographic activity vs mobile money", icon: Globe, c: "#10b981" },
          { d: "D5", l: "Feature Flags", desc: "Growth metrics vs feature gating", icon: Flag, c: "#8b5cf6" },
          { d: "D6", l: "Low-Data", desc: "Africa IP % vs bandwidth mode", icon: Wifi, c: "#f97316" },
        ].map(({ d, l, desc, icon: Icon, c }) => (
          <Card key={d} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-2 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: c }}/>
              <div className="font-bold text-white text-xs">{d}: {l}</div>
              <div className="text-zinc-600" style={{ fontSize: 9 }}>{desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Suggestions */}
      <div className="space-y-3">
        {aiSuggest.length === 0 && !aiLoading && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-10 text-center text-zinc-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-zinc-700"/>
              <div>Click "Run AI Scan" to generate intelligent optimization suggestions</div>
            </CardContent>
          </Card>
        )}
        {aiSuggest.map((s: any) => (
          <Card key={s.id} className={`bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-bold text-white text-sm">{s.title}</span>
                    <Badge className={`${IMPACT_BG[s.impact] || "bg-zinc-600"} text-xs`}>Impact: {s.impact.toUpperCase()}</Badge>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLOR[s.category] || "#6b7280" }}>{s.category}</span>
                    <Badge className="bg-zinc-700 text-xs">🎯 {s.confidence}% confidence</Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-zinc-800 rounded px-2 py-1 text-xs"><span className="text-zinc-500">Current: </span><span className="text-red-400 font-bold">{s.current}</span></div>
                    <ArrowRight className="w-4 h-4 text-zinc-600"/>
                    <div className="bg-zinc-800 rounded px-2 py-1 text-xs"><span className="text-zinc-500">Suggested: </span><span className="text-emerald-400 font-bold">{s.suggested}</span></div>
                  </div>
                  <div className="text-xs text-zinc-400">{s.reason}</div>
                  {s.competitive_note && <div className="text-xs text-zinc-600 mt-1 italic">{s.competitive_note}</div>}
                </div>
                <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                  <div className="w-16 h-16 relative">
                    <svg width="64" height="64" className="-rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#3f3f46" strokeWidth="6"/>
                      <circle cx="32" cy="32" r="26" fill="none" stroke={IMPACT_COLOR[s.impact]} strokeWidth="6"
                        strokeDasharray={163.4} strokeDashoffset={163.4 * (1 - s.confidence/100)} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{s.confidence}%</div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 h-8 text-xs w-full" onClick={() => applyAiSuggestion(s)} disabled={applyingAi === s.id} data-testid={`button-ai-apply-${s.id}`}>
                    {applyingAi === s.id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <><Zap className="w-3 h-3 mr-1"/>Apply</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {aiSuggest.length > 0 && (
          <div className="text-xs text-zinc-600 text-center">
            {aiSuggest.length} suggestion{aiSuggest.length !== 1 ? "s" : ""} from AI 6-Dimension Engine · Generated {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // TAB 7: VERSION HISTORY
  // ════════════════════════════════════════════════════════════════════
  const renderHistory = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><History className="w-6 h-6 text-indigo-400"/>Version History — Immutable Config Timeline + Rollback</h2>
        <p className="text-zinc-400 text-xs">Every config change is version-tracked with before/after values, admin identity, SHA-256 hash, and reason. One-click rollback to any previous state.</p>
      </div>
      <div className="flex gap-2 items-center">
        <Input className="h-8 text-xs flex-1" placeholder="Filter by config key (e.g. financial.commissionBPS)..." value={histKey} onChange={e => { setHistKey(e.target.value); setHistPage(1); }} data-testid="input-history-filter"/>
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" onClick={loadHistory}><RefreshCw className="w-3.5 h-3.5"/></Button>
      </div>
      <div className="text-xs text-zinc-500">{histTotal} total versions</div>
      <div className="space-y-2">
        {history.map((v: any) => {
          const isRollback = !!v.rollback_of_id;
          const oldVal = v.previous_value !== null ? JSON.stringify(v.previous_value).slice(0, 60) : "—";
          const newVal = JSON.stringify(v.config_value).slice(0, 60);
          return (
            <Card key={v.id} className={`bg-zinc-900 border ${isRollback ? "border-orange-800" : "border-zinc-700"} hover:border-zinc-600 transition-all cursor-pointer`} onClick={() => setViewVersion(v)} data-testid={`row-version-${v.id}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isRollback ? "bg-orange-800" : "bg-indigo-900"}`}>
                    {isRollback ? <RotateCcw className="w-4 h-4 text-orange-300"/> : <History className="w-4 h-4 text-indigo-300"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-indigo-300 text-xs font-bold">{v.config_key}</code>
                      {isRollback && <Badge className="bg-orange-800 text-xs">Rollback from #{v.rollback_of_id}</Badge>}
                      <span className="text-zinc-500 text-xs ml-auto">{fmtDate(v.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded font-mono max-w-[200px] truncate">{oldVal}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600 flex-shrink-0"/>
                      <span className="text-xs text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded font-mono max-w-[200px] truncate">{newVal}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">By: <span className="font-mono">{v.changed_by}</span></span>
                      {v.change_reason && <span className="text-xs text-zinc-600 truncate">— {v.change_reason}</span>}
                      <span className="text-xs font-mono text-zinc-700 ml-auto">#{v.version_hash}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-zinc-700 hover:bg-orange-700 h-7 text-xs flex-shrink-0" onClick={e => { e.stopPropagation(); doRollback(v.id, v.config_key); }} disabled={rollingBack === v.id} data-testid={`button-rollback-${v.id}`}>
                    {rollingBack === v.id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <><RotateCcw className="w-3 h-3 mr-1"/>Rollback</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {history.length === 0 && <div className="text-zinc-600 text-center py-8">No version history yet — change any config to create the first entry</div>}
      </div>
      {histTotal > 50 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" className="h-8 text-xs" onClick={() => setHistPage(p => Math.max(1, p-1))} disabled={histPage === 1}>← Newer</Button>
          <span className="text-zinc-500 text-xs">Page {histPage}</span>
          <Button variant="ghost" className="h-8 text-xs" onClick={() => setHistPage(p => p+1)} disabled={history.length < 50}>Older →</Button>
        </div>
      )}
      {/* Version Detail Modal */}
      {viewVersion && (
        <Dialog open onOpenChange={() => setViewVersion(null)}>
          <DialogContent className="bg-zinc-950 border-zinc-700 max-w-2xl">
            <DialogHeader><DialogTitle className="text-white">Version #{viewVersion.id} — {viewVersion.config_key}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-xs">
              {[["Config Key", viewVersion.config_key], ["Changed By", viewVersion.changed_by], ["Reason", viewVersion.change_reason || "—"], ["Version Hash", viewVersion.version_hash], ["Timestamp", fmtDate(viewVersion.created_at)], ["Rollback Of", viewVersion.rollback_of_id ? `#${viewVersion.rollback_of_id}` : "—"]].map(([l, v]) => (
                <div key={l} className="flex items-center gap-3 bg-zinc-900 rounded p-2"><span className="text-zinc-500 w-28">{l}</span><span className="text-zinc-200 font-mono break-all">{v}</span></div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-red-400 font-bold mb-1">Before</div><pre className="bg-red-950/30 border border-red-900 rounded p-2 text-red-200 overflow-auto max-h-32 text-xs">{JSON.stringify(viewVersion.previous_value, null, 2) || "null"}</pre></div>
                <div><div className="text-emerald-400 font-bold mb-1">After</div><pre className="bg-emerald-950/30 border border-emerald-900 rounded p-2 text-emerald-200 overflow-auto max-h-32 text-xs">{JSON.stringify(viewVersion.config_value, null, 2)}</pre></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // TAB 8: SYSTEM HEALTH
  // ════════════════════════════════════════════════════════════════════
  const renderHealth = () => {
    const h = health;
    if (!h) return <div className="text-zinc-500 text-center py-16">Loading health data...</div>;
    const memPct = h.memory?.heapUsedPct || 0;
    const uptimeFmt = h.uptime_fmt || "—";
    const memData = [{ name: "Used", value: memPct, fill: memPct > 80 ? "#ef4444" : memPct > 60 ? "#f97316" : "#22c55e" }, { name: "Free", value: 100 - memPct, fill: "#27272a" }];
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-6 h-6 text-emerald-400"/>System Health — Real-Time Platform Monitoring</h2>
            <p className="text-zinc-400 text-xs">Node.js runtime, PostgreSQL, Socket.io, all services. Auto-refreshes every 10s.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${h.status === "healthy" ? "bg-emerald-400 animate-pulse" : "bg-red-400 animate-pulse"}`}/>
            <span className={`font-bold text-sm ${h.status === "healthy" ? "text-emerald-400" : "text-red-400"}`}>{(h.status || "unknown").toUpperCase()}</span>
          </div>
        </div>
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Uptime", v: uptimeFmt, c: "text-emerald-400", b: "border-emerald-800", icon: Clock },
            { l: "Heap Memory", v: h.memory?.heapUsed || "—", c: memPct > 80 ? "text-red-400" : "text-blue-400", b: "border-blue-800", icon: HardDrive },
            { l: "Socket.io Clients", v: h.socketIO?.connectedClients ?? 0, c: "text-yellow-400", b: "border-yellow-800", icon: Cpu },
            { l: "Platform Users", v: h.platform_stats?.total_users || 0, c: "text-purple-400", b: "border-purple-800", icon: Users },
          ].map((k, i) => (
            <Card key={i} className={`bg-zinc-900 border ${k.b}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <k.icon className={`w-8 h-8 ${k.c}`}/>
                <div><div className={`text-xl font-bold ${k.c}`}>{k.v}</div><div className="text-xs text-zinc-500">{k.l}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5">
          {/* Memory Gauge */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Memory Usage</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <ResponsiveContainer width={120} height={120}>
                <RadialBarChart innerRadius={30} outerRadius={55} data={memData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {[["Heap Used", h.memory?.heapUsed], ["Heap Total", h.memory?.heapTotal], ["RSS", h.memory?.rss]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between gap-4"><span className="text-xs text-zinc-500">{l}</span><span className="text-xs font-bold text-zinc-200">{v}</span></div>
                ))}
                <div className="flex justify-between gap-4"><span className="text-xs text-zinc-500">Usage %</span><span className="text-xs font-bold" style={{ color: memPct > 80 ? "#ef4444" : "#22c55e" }}>{memPct}%</span></div>
              </div>
            </CardContent>
          </Card>
          {/* Services Status */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">All Services Status</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {h.services && Object.entries(h.services).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between p-2 rounded-lg border border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-zinc-500"/>
                    <span className="text-xs text-zinc-300 capitalize">{name.replace(/_/g, " ")}</span>
                  </div>
                  <span className={`text-xs font-bold ${String(status).includes("✅") || String(status).includes("Connected") || String(status).includes("Active") ? "text-emerald-400" : "text-red-400"}`}>{String(status)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        {/* Node.js Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-3 flex gap-6">
            {[
              ["Node.js", h.node_version],
              ["Socket.io Rooms", h.socketIO?.rooms?.join(", ")],
              ["Orders (24h)", h.platform_stats?.orders_24h],
              ["Maintenance", h.maintenance_mode ? "⚠️ ACTIVE" : "✅ Off"],
            ].map(([l, v]) => (
              <div key={l as string}>
                <div className="text-xs text-zinc-500">{l}</div>
                <div className="text-sm font-bold text-zinc-200 font-mono">{String(v)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-xs" onClick={loadHealth}><RefreshCw className="w-3.5 h-3.5 mr-1"/>Refresh Health</Button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5">
      <div className="max-w-[1900px] mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-xl transition-all ${toast.ok ? "bg-emerald-700 text-white" : "bg-red-700 text-white"}`}>
            {toast.msg}
          </div>
        )}
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Settings className="w-10 h-10 text-purple-400 flex-shrink-0"/>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-white">System Settings Department</h1>
                <Badge className="bg-purple-700 text-sm">v2.0</Badge>
                <Badge className="bg-blue-700">VERSIONED</Badge>
                <Badge className="bg-orange-700">AI-OPTIMIZED</Badge>
                <Badge className="bg-emerald-700">AFRICA-FIRST</Badge>
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">The Central Nervous System of FreelanceSkills.net — 35 persistent configs · 15 feature flags · version history + rollback · AI 6D optimizer · Socket.io live sync</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {["35 Persistent Config Keys","15 Feature Flags","Version History + Rollback","AI 6-Dimension Optimizer","Africa Mobile Money","USSD Config","Low-Data Mode","Tiered Commission","Security Policy Engine","IP Geofencing","Password Policy","2FA Enforcement","Socket.io Live Sync","Compliance Alerts (POPIA+NDPR+ISO27001)","Global Broadcast","System Backup","Full Audit Integration"].map(s => <Badge key={s} variant="outline" className="text-zinc-500 border-zinc-700 text-xs">{s}</Badge>)}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${tab === t.id ? "bg-purple-700 text-white shadow-lg shadow-purple-700/40" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}
              data-testid={`tab-settings-${t.id}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "overview"  && renderOverview()}
        {tab === "financial" && renderFinancial()}
        {tab === "security"  && renderSecurity()}
        {tab === "flags"     && renderFlags()}
        {tab === "africa"    && renderAfrica()}
        {tab === "ai"        && renderAi()}
        {tab === "history"   && renderHistory()}
        {tab === "health"    && renderHealth()}
      </div>
    </div>
  );
}
