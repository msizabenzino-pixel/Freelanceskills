/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SECURITY & TRUST DEPARTMENT — 200% INTELLIGENCE ZERO-TRUST FORTRESS        ║
 * ║  The unbreakable heart of FreelanceSkills.net                               ║
 * ║  Obliterates Upwork, Fiverr, Stripe Radar, LinkedIn until 2029             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 5-Tab Architecture:
 *  Tab 1 — 🛡️ Risk Dashboard   (Global risk map, AI scores, KPI overview)
 *  Tab 2 — 🪪 KYC Queue        (Deepfake analysis, liveness, face match)
 *  Tab 3 — 🔍 Fraud & Activity (15 event types, filterable, reviewable)
 *  Tab 4 — 🚫 Blacklists       (IP, account, device fingerprint management)
 *  Tab 5 — 🚨 Alerts Center    (Live Socket alerts, rule engine, audit log)
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Shield, AlertTriangle, Eye, Lock, Globe, Fingerprint, Cpu,
  UserX, Ban, Wifi, Zap, Search, CheckCircle2, XCircle, Clock,
  Camera, Mic, Video, FileText, Brain, Activity, Bell,
  ChevronDown, ChevronUp, Play, RefreshCw, Upload, Map,
  Phone, Smartphone, AlertOctagon, ShieldCheck, ShieldX,
  Users, TrendingUp, Hash,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "dashboard",  label: "🛡️ Risk Dashboard",   icon: Shield },
  { id: "kyc",        label: "🪪 KYC Queue",         icon: FileText },
  { id: "events",     label: "🔍 Fraud & Activity",  icon: Eye },
  { id: "blacklist",  label: "🚫 Blacklists",        icon: Ban },
  { id: "alerts",     label: "🚨 Alerts Center",     icon: Bell },
];

const COLORS = ["#ef4444","#f97316","#eab308","#10b981","#3b82f6","#8b5cf6"];

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-600",
  high:     "bg-orange-600",
  medium:   "bg-yellow-600",
  low:      "bg-emerald-600",
};

const SEV_COLORS: Record<string, string> = {
  critical: "bg-red-700 text-white",
  high:     "bg-orange-600 text-white",
  medium:   "bg-yellow-600 text-white",
  low:      "bg-zinc-600 text-white",
  info:     "bg-blue-700 text-white",
};

const KYC_COLORS: Record<string, string> = {
  approved: "bg-emerald-700",
  pending:  "bg-yellow-700",
  review:   "bg-orange-700",
  rejected: "bg-red-700",
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function SecurityTrustManagement() {
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [dashboard,  setDashboard]    = useState<any>(null);
  const [riskList,   setRiskList]     = useState<any>({ items: [], total: 0 });
  const [kycList,    setKycList]      = useState<any>({ items: [], total: 0 });
  const [events,     setEvents]       = useState<any>({ items: [], total: 0 });
  const [ipList,     setIpList]       = useState<any>({ items: [], total: 0 });
  const [acctList,   setAcctList]     = useState<any>({ items: [], total: 0 });
  const [deviceList, setDeviceList]   = useState<any[]>([]);
  const [alertList,  setAlertList]    = useState<any>({ items: [], total: 0 });
  const [auditLog,   setAuditLog]     = useState<any>({ items: [], total: 0 });
  const [liveAlerts, setLiveAlerts]   = useState<any[]>([]);
  const [loading,    setLoading]      = useState(false);

  // Filters
  const [kycStatus,    setKycStatus]    = useState("all");
  const [eventSev,     setEventSev]     = useState("all");
  const [eventReviewed,setEventReviewed]= useState("all");
  const [riskTier,     setRiskTier]     = useState("all");
  const [alertStatus,  setAlertStatus]  = useState("open");

  // Score form
  const [scoreForm, setScoreForm] = useState({
    user_id:"", kyc_verified:false, deepfake_probability:0, failed_logins_24h:0,
    vpn_detected:false, tor_detected:false, chargebacks:0, login_country_changes_7d:0,
    unique_devices_30d:1, proposals_per_hour:0, messages_per_hour:0, account_age_days:30,
  });
  const [scoreResult,  setScoreResult]  = useState<any>(null);

  // IP block form
  const [ipForm,   setIpForm]   = useState({ ip_address:"", reason:"", severity:"medium", expires_in_days:"" });
  const [acctForm, setAcctForm] = useState({ user_id:"", reason:"", severity:"high", blacklist_type:"soft", expires_in_days:"" });
  const [devForm,  setDevForm]  = useState({ fingerprint_hash:"", reason:"" });

  // KYC submit form
  const [kycForm, setKycForm]   = useState({ user_id:"", id_document_type:"passport", id_document_url:"", selfie_url:"", video_url:"", voice_sample_url:"", phone_number:"", id_document_country:"ZA" });
  const [kycSubmitResult, setKycSubmitResult] = useState<any>(null);

  // Quarantine form
  const [quarantineForm, setQuarantineForm] = useState({ user_id:"", reason:"", duration_hours:"72" });

  // Event create form
  const [evtForm, setEvtForm] = useState({ user_id:"", event_type:"suspicious_login", severity:"medium", description:"", ip_address:"", ip_is_vpn:false, ip_is_tor:false });

  // ──────────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => { loadTab(); }, [activeTab, kycStatus, eventSev, eventReviewed, riskTier, alertStatus]);

  // Simulate live Socket.io alerts (demo without actual socket connection)
  useEffect(() => {
    const interval = setInterval(() => {
      const alertTypes = [
        { type:"security_event", severity:"high", message:"Suspicious login from new country: user_XYZ123" },
        { type:"deepfake_alert", severity:"critical", message:"Deepfake probability 87% detected in KYC submission" },
        { type:"brute_force", severity:"critical", message:"18 failed logins in 24h — brute-force attack on user_ABC456" },
        { type:"ip_blocked", severity:"medium", message:"IP 192.168.100.55 auto-blocked (VPN + high velocity)" },
        { type:"kyc_approved", severity:"info", message:"KYC approved: user_DEF789 (face match 96%)" },
      ];
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      if (Math.random() > 0.7) {
        setLiveAlerts(prev => [{...alert, timestamp: new Date().toISOString(), id: Date.now()}, ...prev.slice(0, 49)]);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const r = await fetch("/api/security/dashboard");
        if (r.ok) setDashboard(await r.json());
        // Also load risk list for dashboard
        const r2 = await fetch("/api/security/risk?sort=overall_score&dir=desc&limit=10");
        if (r2.ok) setRiskList(await r2.json());
      } else if (activeTab === "kyc") {
        const r = await fetch(`/api/security/kyc?status=${kycStatus}&limit=100`);
        if (r.ok) setKycList(await r.json());
      } else if (activeTab === "events") {
        const params = new URLSearchParams({ limit:"200" });
        if (eventSev !== "all") params.set("severity", eventSev);
        if (eventReviewed !== "all") params.set("reviewed", eventReviewed);
        const r = await fetch(`/api/security/events?${params}`);
        if (r.ok) setEvents(await r.json());
      } else if (activeTab === "blacklist") {
        const [ip, acct, dev] = await Promise.all([
          fetch("/api/security/block/ips?limit=200"),
          fetch("/api/security/block/accounts?limit=200"),
          fetch("/api/security/block/devices"),
        ]);
        if (ip.ok) setIpList(await ip.json());
        if (acct.ok) setAcctList(await acct.json());
        if (dev.ok) setDeviceList(await dev.json());
      } else if (activeTab === "alerts") {
        const [al, aud] = await Promise.all([
          fetch(`/api/security/alerts?status=${alertStatus}&limit=100`),
          fetch("/api/security/audit?limit=100"),
        ]);
        if (al.ok) setAlertList(await al.json());
        if (aud.ok) setAuditLog(await aud.json());
      }
    } catch {}
    setLoading(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────────
  const computeRiskScore = async () => {
    if (!scoreForm.user_id) return alert("User ID required");
    const res = await fetch("/api/security/risk/score", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(scoreForm) });
    if (res.ok) { setScoreResult(await res.json()); }
    else { const e = await res.json(); alert(e.message); }
  };

  const quarantineUser = async () => {
    if (!quarantineForm.user_id || !quarantineForm.reason) return alert("User ID and reason required");
    const res = await fetch(`/api/security/risk/${quarantineForm.user_id}/quarantine`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ reason: quarantineForm.reason, duration_hours: parseInt(quarantineForm.duration_hours) }),
    });
    if (res.ok) { const d = await res.json(); alert(`✅ ${d.message}\nUntil: ${new Date(d.until).toLocaleString()}`); loadTab(); }
  };

  const submitKYC = async () => {
    if (!kycForm.user_id) return alert("User ID required");
    const res = await fetch("/api/security/kyc/submit", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(kycForm) });
    if (res.ok) { setKycSubmitResult(await res.json()); loadTab(); }
    else { const e = await res.json(); alert(e.message); }
  };

  const reviewKYC = async (id: number, action: "approve"|"reject", notes: string) => {
    const res = await fetch(`/api/security/kyc/${id}/review`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action, reviewer_notes: notes }),
    });
    if (res.ok) { alert(`✅ KYC ${action}d`); loadTab(); }
  };

  const blockIP = async () => {
    if (!ipForm.ip_address || !ipForm.reason) return alert("IP address and reason required");
    const res = await fetch("/api/security/block/ip", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...ipForm, expires_in_days: ipForm.expires_in_days ? parseInt(ipForm.expires_in_days) : undefined}) });
    if (res.ok) { alert("✅ IP blocked"); setIpForm({ ip_address:"", reason:"", severity:"medium", expires_in_days:"" }); loadTab(); }
    else { const e = await res.json(); alert(e.message); }
  };

  const unblockIP = async (ip: string) => {
    if (!confirm(`Unblock IP: ${ip}?`)) return;
    const res = await fetch(`/api/security/block/ip/${encodeURIComponent(ip)}`, { method:"DELETE" });
    if (res.ok) { alert("✅ IP unblocked"); loadTab(); }
  };

  const blacklistAccount = async () => {
    if (!acctForm.user_id || !acctForm.reason) return alert("User ID and reason required");
    const res = await fetch("/api/security/block/account", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...acctForm, expires_in_days: acctForm.expires_in_days ? parseInt(acctForm.expires_in_days) : undefined}) });
    if (res.ok) { alert("✅ Account blacklisted"); setAcctForm({ user_id:"", reason:"", severity:"high", blacklist_type:"soft", expires_in_days:"" }); loadTab(); }
    else { const e = await res.json(); alert(e.message); }
  };

  const unblacklistAccount = async (userId: string) => {
    if (!confirm(`Remove ${userId} from blacklist?`)) return;
    const res = await fetch(`/api/security/block/account/${userId}`, { method:"DELETE" });
    if (res.ok) { alert("✅ Account removed from blacklist"); loadTab(); }
  };

  const blockDevice = async () => {
    if (!devForm.fingerprint_hash) return alert("Device fingerprint hash required");
    const res = await fetch("/api/security/block/device", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(devForm) });
    if (res.ok) { alert("✅ Device blocked"); setDevForm({ fingerprint_hash:"", reason:"" }); loadTab(); }
  };

  const logEvent = async () => {
    if (!evtForm.event_type || !evtForm.description) return alert("Event type and description required");
    const res = await fetch("/api/security/events", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(evtForm) });
    if (res.ok) { alert("✅ Event logged"); loadTab(); }
  };

  const resolveAlert = async (id: number, notes: string) => {
    const res = await fetch(`/api/security/alerts/${id}/resolve`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resolution_notes: notes }) });
    if (res.ok) { alert("✅ Alert resolved"); loadTab(); }
  };

  const testBroadcast = async () => {
    const res = await fetch("/api/security/alerts/test-broadcast", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"test_alert", severity:"medium", message:"🧪 Test security alert from admin dashboard" }) });
    if (res.ok) alert("✅ Test alert broadcast sent");
  };

  const reviewEvent = async (id: number) => {
    const res = await fetch(`/api/security/events/${id}/review`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action_taken:"reviewed_by_admin" }) });
    if (res.ok) { loadTab(); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1: RISK DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  const renderDashboard = () => {
    const d = dashboard;
    const radarData = scoreResult ? [
      { dim: "Identity",    score: scoreResult.identity_risk,    fullMark: 100 },
      { dim: "Behavioral",  score: scoreResult.behavioral_risk,  fullMark: 100 },
      { dim: "Financial",   score: scoreResult.financial_risk,   fullMark: 100 },
      { dim: "Network",     score: scoreResult.network_risk,     fullMark: 100 },
      { dim: "Device",      score: scoreResult.device_risk,      fullMark: 100 },
      { dim: "Geolocation", score: scoreResult.geolocation_risk, fullMark: 100 },
      { dim: "Velocity",    score: scoreResult.velocity_risk,    fullMark: 100 },
    ] : [];

    const tierData = d ? [
      { name: "Critical", value: d.risk_overview?.critical||0, fill: "#ef4444" },
      { name: "High",     value: d.risk_overview?.high||0,     fill: "#f97316" },
      { name: "Medium",   value: d.risk_overview?.medium||0,   fill: "#eab308" },
      { name: "Low",      value: d.risk_overview?.low||0,      fill: "#10b981" },
    ] : [];

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-red-400"/>Risk Dashboard — Perpetual AI Risk Engine</h2>
          <p className="text-zinc-400 text-xs">7-dimension scoring. Real-time quarantine. Zero-trust architecture. vs Upwork: no AI scoring. vs Stripe: transactions only. We score identity+behavior+network+device+geo+velocity+financial simultaneously.</p>
        </div>

        {/* KPI Row */}
        {d && (
          <div className="grid grid-cols-5 gap-3">
            {[
              { label:"Total Scored", value:d.risk_overview?.total_scored||0, icon:Users, color:"from-zinc-900 border-zinc-700", tc:"text-zinc-200" },
              { label:"Critical Risk", value:d.risk_overview?.critical||0, icon:AlertOctagon, color:"from-red-900/40 border-red-800", tc:"text-red-400" },
              { label:"Quarantined", value:d.risk_overview?.quarantined||0, icon:Lock, color:"from-orange-900/40 border-orange-800", tc:"text-orange-400" },
              { label:"Open Alerts", value:d.alerts_overview?.open_count||0, icon:Bell, color:"from-yellow-900/40 border-yellow-800", tc:"text-yellow-400" },
              { label:"Avg Risk Score", value:Number(d.risk_overview?.avg_score||0).toFixed(1), icon:Brain, color:"from-blue-900/40 border-blue-800", tc:"text-blue-400" },
            ].map((k,i)=>(
              <Card key={i} className={`bg-gradient-to-br ${k.color} border`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <k.icon className={`w-4 h-4 ${k.tc}`}/>
                    <div className="text-xs text-zinc-400">{k.label}</div>
                  </div>
                  <div className={`text-2xl font-bold ${k.tc}`}>{k.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {/* AI Risk Score Engine */}
          <Card className="bg-gradient-to-br from-red-900/20 to-zinc-900 border-red-900/60">
            <CardHeader className="pb-3"><CardTitle className="text-base text-red-300">AI Risk Engine — Score Any User</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs text-zinc-300">User ID *</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="user_ABC123..." value={scoreForm.user_id} onChange={e=>setScoreForm({...scoreForm,user_id:e.target.value})} data-testid="input-risk-user-id"/>
                </div>
                <div>
                  <Label className="text-xs">Failed Logins (24h)</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={scoreForm.failed_logins_24h} onChange={e=>setScoreForm({...scoreForm,failed_logins_24h:parseInt(e.target.value)||0})}/>
                </div>
                <div>
                  <Label className="text-xs">Chargebacks</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={scoreForm.chargebacks} onChange={e=>setScoreForm({...scoreForm,chargebacks:parseInt(e.target.value)||0})}/>
                </div>
                <div>
                  <Label className="text-xs">Country Changes (7d)</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={scoreForm.login_country_changes_7d} onChange={e=>setScoreForm({...scoreForm,login_country_changes_7d:parseInt(e.target.value)||0})}/>
                </div>
                <div>
                  <Label className="text-xs">Proposals/Hour</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={scoreForm.proposals_per_hour} onChange={e=>setScoreForm({...scoreForm,proposals_per_hour:parseInt(e.target.value)||0})}/>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                {[["kyc_verified","KYC Verified"],["vpn_detected","VPN Detected"],["tor_detected","Tor Detected"]].map(([k,l])=>(
                  <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                    <Switch checked={(scoreForm as any)[k]} onCheckedChange={v=>setScoreForm({...scoreForm,[k]:v})} className="scale-75"/>
                    <span className="text-zinc-300">{l}</span>
                  </label>
                ))}
              </div>
              <Button className="bg-red-600 hover:bg-red-700 w-full h-8 text-sm" onClick={computeRiskScore} data-testid="button-compute-risk">
                <Brain className="w-4 h-4 mr-1"/>Compute 7-Dimension AI Risk Score
              </Button>
              {scoreResult && (
                <div className="mt-2 p-3 bg-zinc-900 rounded border border-red-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-3xl font-black ${scoreResult.overall_score>75?"text-red-400":scoreResult.overall_score>55?"text-orange-400":scoreResult.overall_score>30?"text-yellow-400":"text-emerald-400"}`}>
                      {scoreResult.overall_score}
                    </div>
                    <div>
                      <Badge className={RISK_COLORS[scoreResult.risk_tier]}>{scoreResult.risk_tier.toUpperCase()}</Badge>
                      {scoreResult.auto_quarantine && <Badge className="bg-red-800 ml-1">🚨 AUTO-QUARANTINE</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300 mb-2">{scoreResult.recommended_action}</div>
                  {scoreResult.risk_factors?.slice(0,4).map((f:any,i:number)=>(
                    <div key={i} className="text-xs text-zinc-400 flex items-center gap-1">
                      <span className="text-red-400">•</span> [{f.dimension}] {f.description}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">7-Dimension Risk Radar</CardTitle></CardHeader>
            <CardContent>
              {scoreResult ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#3f3f46"/>
                    <PolarAngleAxis dataKey="dim" tick={{fill:"#a1a1aa",fontSize:11}}/>
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:"#a1a1aa",fontSize:9}}/>
                    <Radar name="Risk" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35}/>
                    <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/>
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-zinc-500 text-sm">Score a user to see radar</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Tier Distribution + Recent High-Risk Users */}
        <div className="grid grid-cols-2 gap-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Tier Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {tierData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Top Risk Users (AI-Ranked)</CardTitle>
              <Button size="sm" variant="ghost" className="h-6 text-xs text-zinc-400" onClick={loadTab}><RefreshCw className="w-3.5 h-3.5 mr-1"/>Refresh</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {loading ? <div className="text-zinc-500 text-xs">Loading...</div> :
                riskList.items?.slice(0,10).map((r:any)=>(
                  <div key={r.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60" data-testid={`row-risk-${r.id}`}>
                    <Badge className={`${RISK_COLORS[r.risk_tier]} w-16 justify-center text-xs`}>{r.risk_tier}</Badge>
                    <span className="text-zinc-300 text-xs font-mono flex-1 truncate">{r.user_id}</span>
                    <span className={`font-bold text-sm ${Number(r.overall_score)>75?"text-red-400":Number(r.overall_score)>55?"text-orange-400":Number(r.overall_score)>30?"text-yellow-400":"text-emerald-400"}`}>
                      {Number(r.overall_score).toFixed(0)}
                    </span>
                    {r.quarantine_status==="quarantined" && <Badge className="bg-red-900 text-xs">🔒 Q</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quarantine Tool + KYC/Block Summary */}
        <div className="grid grid-cols-2 gap-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3"><CardTitle className="text-base">Predictive Quarantine — Auto-Pause Before Harm</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-xs">User ID</Label><Input className="h-8 text-sm mt-1" value={quarantineForm.user_id} onChange={e=>setQuarantineForm({...quarantineForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-quarantine-user-id"/></div>
              <div><Label className="text-xs">Reason</Label><Input className="h-8 text-sm mt-1" value={quarantineForm.reason} onChange={e=>setQuarantineForm({...quarantineForm,reason:e.target.value})} placeholder="e.g. Deepfake detected, high churn risk"/></div>
              <div><Label className="text-xs">Duration (hours)</Label>
                <Select value={quarantineForm.duration_hours} onValueChange={v=>setQuarantineForm({...quarantineForm,duration_hours:v})}>
                  <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours (default)</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                    <SelectItem value="720">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full h-8 text-sm" onClick={quarantineUser} data-testid="button-quarantine">
                <Lock className="w-4 h-4 mr-1"/>Apply Quarantine
              </Button>
              <div className="p-2 bg-orange-900/20 border border-orange-800 rounded text-xs text-zinc-300">
                <strong className="text-orange-300 block">vs Upwork:</strong> They suspend after a fraud report is filed (3-5 days). We quarantine BEFORE harm using AI risk scores — protecting the entire marketplace proactively.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3"><CardTitle className="text-base">Platform Security Stats</CardTitle></CardHeader>
            <CardContent>
              {d && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {label:"Blocked IPs", val:d.block_counts?.blocked_ips||0, color:"text-red-400"},
                      {label:"Blacklisted Accts", val:d.block_counts?.blocked_accounts||0, color:"text-orange-400"},
                      {label:"Blocked Devices", val:d.block_counts?.blocked_devices||0, color:"text-yellow-400"},
                    ].map((b,i)=>(
                      <div key={i} className="bg-zinc-800 rounded p-3 text-center">
                        <div className={`text-2xl font-bold ${b.color}`}>{b.val}</div>
                        <div className="text-xs text-zinc-400 mt-1">{b.label}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 mb-2">Top Event Types (Last 24h):</div>
                    {(d.top_event_types_24h||[]).slice(0,5).map((e:any,i:number)=>(
                      <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-300 text-xs flex-1">{e.event_type}</span>
                        <Badge className="bg-zinc-700 text-xs">{e.count}×</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2: KYC QUEUE
  // ══════════════════════════════════════════════════════════════════════════
  const renderKYC = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-blue-400"/>KYC Verification Queue</h2>
          <p className="text-zinc-400 text-xs">5-level verification: none → basic → standard → enhanced → premium. Deepfake analysis, liveness detection, face matching, voice biometrics. Africa USSD/mobile money KYC.</p>
        </div>
        <div className="flex gap-2">
          <Select value={kycStatus} onValueChange={setKycStatus}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 h-8 text-sm" data-testid="button-submit-kyc"><Upload className="w-3.5 h-3.5 mr-1"/>Submit KYC</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Submit KYC for User</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">User ID *</Label><Input className="h-8 text-sm mt-1" value={kycForm.user_id} onChange={e=>setKycForm({...kycForm,user_id:e.target.value})} data-testid="input-kyc-user-id"/></div>
                  <div><Label className="text-xs">Document Type</Label>
                    <Select value={kycForm.id_document_type} onValueChange={v=>setKycForm({...kycForm,id_document_type:v})}>
                      <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="voter_id">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Document URL</Label><Input className="h-8 text-sm mt-1" value={kycForm.id_document_url} onChange={e=>setKycForm({...kycForm,id_document_url:e.target.value})} placeholder="https://..."/></div>
                  <div><Label className="text-xs">Selfie URL</Label><Input className="h-8 text-sm mt-1" value={kycForm.selfie_url} onChange={e=>setKycForm({...kycForm,selfie_url:e.target.value})} placeholder="https://..."/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Video URL (liveness)</Label><Input className="h-8 text-sm mt-1" value={kycForm.video_url} onChange={e=>setKycForm({...kycForm,video_url:e.target.value})} placeholder="https://..."/></div>
                  <div><Label className="text-xs">Voice Sample URL</Label><Input className="h-8 text-sm mt-1" value={kycForm.voice_sample_url} onChange={e=>setKycForm({...kycForm,voice_sample_url:e.target.value})} placeholder="https://..."/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Phone Number</Label><Input className="h-8 text-sm mt-1" value={kycForm.phone_number} onChange={e=>setKycForm({...kycForm,phone_number:e.target.value})} placeholder="+27821234567"/></div>
                  <div><Label className="text-xs">Country (ISO)</Label><Input className="h-8 text-sm mt-1" value={kycForm.id_document_country} onChange={e=>setKycForm({...kycForm,id_document_country:e.target.value})} placeholder="ZA"/></div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitKYC} data-testid="button-kyc-submit-confirm">Submit KYC + Run Deepfake Analysis</Button>
                {kycSubmitResult && (
                  <div className="p-3 bg-zinc-800 rounded border border-blue-700 space-y-1 text-xs">
                    <div className="font-semibold text-white">AI Analysis Results:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {l:"Deepfake Probability", v:`${Number(kycSubmitResult.deepfake_analysis?.deepfake_probability||0).toFixed(1)}%`, c:Number(kycSubmitResult.deepfake_analysis?.deepfake_probability||0)>30?"text-red-400":"text-emerald-400"},
                        {l:"Face Match", v:`${Number(kycSubmitResult.deepfake_analysis?.face_match_score||0).toFixed(1)}%`, c:Number(kycSubmitResult.deepfake_analysis?.face_match_score||0)>80?"text-emerald-400":"text-red-400"},
                        {l:"Liveness Score", v:`${Number(kycSubmitResult.deepfake_analysis?.liveness_score||0).toFixed(1)}%`, c:Number(kycSubmitResult.deepfake_analysis?.liveness_score||0)>70?"text-emerald-400":"text-red-400"},
                        {l:"Document Authenticity", v:`${Number(kycSubmitResult.deepfake_analysis?.document_authenticity_score||0).toFixed(1)}%`, c:Number(kycSubmitResult.deepfake_analysis?.document_authenticity_score||0)>80?"text-emerald-400":"text-red-400"},
                      ].map((item,i)=>(
                        <div key={i}><span className="text-zinc-400">{item.l}:</span> <span className={`font-bold ${item.c}`}>{item.v}</span></div>
                      ))}
                    </div>
                    {(kycSubmitResult.deepfake_analysis?.analysis_notes||[]).map((n:string,i:number)=>(
                      <div key={i} className="text-zinc-300">✓ {n}</div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">
            {kycList.total} KYC records
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="text-left py-2.5 px-3 text-zinc-300">User ID</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Status</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Level</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Doc Type</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Deepfake Risk</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Face Match</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Liveness</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Voice</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Media</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Date</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={11} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                : kycList.items.map((k:any)=>(
                  <tr key={k.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30" data-testid={`row-kyc-${k.id}`}>
                    <td className="py-2.5 px-3 text-zinc-300 text-xs font-mono max-w-[130px] truncate">{k.user_id}</td>
                    <td className="py-2.5 px-3"><Badge className={`${KYC_COLORS[k.status]||"bg-zinc-700"} text-xs`}>{k.status}</Badge></td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">{k.verification_level}</Badge></td>
                    <td className="py-2.5 px-3 text-zinc-400 text-xs">{k.id_document_type||"–"}</td>
                    <td className="py-2.5 px-3 text-center">
                      {k.deepfake_probability != null ? (
                        <span className={`font-bold text-sm ${Number(k.deepfake_probability)>50?"text-red-400":Number(k.deepfake_probability)>20?"text-yellow-400":"text-emerald-400"}`}>
                          {Number(k.deepfake_probability).toFixed(0)}%
                        </span>
                      ) : <span className="text-zinc-600">–</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {k.face_match_score ? <span className={`font-bold text-sm ${Number(k.face_match_score)>85?"text-emerald-400":"text-red-400"}`}>{Number(k.face_match_score).toFixed(0)}%</span> : <span className="text-zinc-600">–</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {k.liveness_score ? <span className={`font-bold text-sm ${Number(k.liveness_score)>80?"text-emerald-400":"text-orange-400"}`}>{Number(k.liveness_score).toFixed(0)}%</span> : <span className="text-zinc-600">–</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {k.voice_match_score ? <span className={`font-bold text-sm ${Number(k.voice_match_score)>75?"text-emerald-400":"text-orange-400"}`}>{Number(k.voice_match_score).toFixed(0)}%</span> : <span className="text-zinc-600">–</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1">
                        {k.selfie_url && <Camera className="w-3.5 h-3.5 text-zinc-400" title="Selfie"/>}
                        {k.video_url  && <Video className="w-3.5 h-3.5 text-zinc-400" title="Video"/>}
                        {k.voice_sample_url && <Mic className="w-3.5 h-3.5 text-zinc-400" title="Voice"/>}
                        {k.id_document_url && <FileText className="w-3.5 h-3.5 text-zinc-400" title="Document"/>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 text-xs">{new Date(k.created_at).toLocaleDateString("en-ZA")}</td>
                    <td className="py-2.5 px-3 text-center">
                      {k.status === "pending" && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-6 px-2 text-xs" onClick={()=>reviewKYC(k.id,"approve","AI analysis passed")} data-testid={`button-kyc-approve-${k.id}`}>✓ Approve</Button>
                          <Button size="sm" className="bg-red-700 hover:bg-red-800 h-6 px-2 text-xs" onClick={()=>reviewKYC(k.id,"reject","Failed verification")} data-testid={`button-kyc-reject-${k.id}`}>✗ Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Africa KYC Box */}
      <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-800">
        <CardHeader className="pb-3"><CardTitle className="text-base text-yellow-300">Africa-First KYC — USSD + Mobile Money Verification</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="font-semibold text-white mb-2">USSD KYC Flow</div>
              <div className="font-mono text-3xl font-black text-yellow-300 mb-2">*120*KYC#</div>
              <div className="space-y-1 text-zinc-300">
                <div>Step 1: Enter FreelanceSkills ID</div>
                <div>Step 2: Enter National ID number</div>
                <div>Step 3: Last 4 digits of M-PESA/MTN</div>
                <div>Step 4: Voice sample (*120*KYC*VOICE#)</div>
                <div>Step 5: SMS confirmation</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">Mobile Money Verification</div>
              <div className="space-y-2">
                {[{p:"M-PESA",c:"Kenya"},{ p:"MTN MoMo",c:"14 countries"},{p:"Airtel Money",c:"17 countries"},{p:"Ozow",c:"South Africa"}].map((m,i)=>(
                  <div key={i} className="flex items-center gap-2 p-1.5 bg-zinc-800/50 rounded">
                    <Smartphone className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0"/>
                    <span className="text-zinc-300">{m.p}</span>
                    <span className="text-zinc-500 ml-auto">{m.c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">vs Competitors</div>
              <div className="p-3 bg-zinc-800/50 rounded text-zinc-300">
                <div className="text-red-400 font-semibold mb-1">Upwork/Fiverr:</div>
                <div>Require photo ID + selfie upload via smartphone. Excludes 800M Africans with feature phones.</div>
                <div className="text-emerald-400 font-semibold mt-2 mb-1">FreelanceSkills:</div>
                <div>USSD KYC without smartphone. Mobile money as identity anchor. Voice biometrics for feature phones.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: FRAUD & ACTIVITY LOG
  // ══════════════════════════════════════════════════════════════════════════
  const renderEvents = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Eye className="w-6 h-6 text-yellow-400"/>Fraud &amp; Activity Log</h2>
          <p className="text-zinc-400 text-xs">15 event types tracked: suspicious_login, brute_force, velocity_spike, impossible_travel, account_takeover, deepfake_detected, ip_blocked, account_blacklisted, payment_fraud, chargeback, proposal_spam, message_spam, identity_mismatch, device_change, mobile_money_fraud.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={eventSev} onValueChange={setEventSev}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventReviewed} onValueChange={setEventReviewed}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="false">Unreviewed</SelectItem>
              <SelectItem value="true">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-yellow-700 hover:bg-yellow-600 h-8 text-sm"><Zap className="w-3.5 h-3.5 mr-1"/>Log Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Security Event</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div><Label className="text-xs">User ID</Label><Input className="h-8 text-sm mt-1" value={evtForm.user_id} onChange={e=>setEvtForm({...evtForm,user_id:e.target.value})} placeholder="user_ABC... (optional)"/></div>
                <div><Label className="text-xs">Event Type</Label>
                  <Select value={evtForm.event_type} onValueChange={v=>setEvtForm({...evtForm,event_type:v})}>
                    <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {["suspicious_login","brute_force","velocity_spike","impossible_travel","account_takeover","deepfake_detected","ip_blocked","account_blacklisted","payment_fraud","chargeback","proposal_spam","message_spam","identity_mismatch","device_change","mobile_money_fraud"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Severity</Label>
                  <Select value={evtForm.severity} onValueChange={v=>setEvtForm({...evtForm,severity:v})}>
                    <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Description *</Label><Textarea className="text-sm mt-1" rows={2} value={evtForm.description} onChange={e=>setEvtForm({...evtForm,description:e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">IP Address</Label><Input className="h-8 text-sm mt-1" value={evtForm.ip_address} onChange={e=>setEvtForm({...evtForm,ip_address:e.target.value})} placeholder="192.168.1.1"/></div>
                </div>
                <div className="flex gap-4 text-xs">
                  {[["ip_is_vpn","VPN"],["ip_is_tor","Tor"]].map(([k,l])=>(
                    <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                      <Switch checked={(evtForm as any)[k]} onCheckedChange={v=>setEvtForm({...evtForm,[k]:v})} className="scale-75"/>
                      <span className="text-zinc-300">{l}</span>
                    </label>
                  ))}
                </div>
                <Button className="bg-yellow-700 hover:bg-yellow-600" onClick={logEvent} data-testid="button-log-event">Log Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">{events.total} events</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2.5 px-3 text-zinc-300">Time</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Severity</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Event Type</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">User</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">IP</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Network Flags</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Description</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Status</th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={9} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                : events.items.slice(0,100).map((ev:any)=>(
                  <tr key={ev.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30" data-testid={`row-event-${ev.id}`}>
                    <td className="py-2.5 px-3 text-zinc-500 text-xs">{new Date(ev.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    <td className="py-2.5 px-3"><Badge className={`${SEV_COLORS[ev.severity]||"bg-zinc-600"} text-xs`}>{ev.severity}</Badge></td>
                    <td className="py-2.5 px-3 text-xs font-mono text-zinc-300">{ev.event_type}</td>
                    <td className="py-2.5 px-3 text-xs text-zinc-400 max-w-[120px] truncate">{ev.user_id||"–"}</td>
                    <td className="py-2.5 px-3 text-xs text-zinc-400 font-mono">{ev.ip_address||"–"}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1">
                        {ev.ip_is_vpn && <Badge className="bg-orange-800 text-xs">VPN</Badge>}
                        {ev.ip_is_proxy && <Badge className="bg-yellow-800 text-xs">Proxy</Badge>}
                        {ev.ip_is_tor && <Badge className="bg-red-800 text-xs">Tor</Badge>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-zinc-400 max-w-[250px] truncate">{ev.description}</td>
                    <td className="py-2.5 px-3 text-center">
                      {ev.reviewed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto"/> : <Clock className="w-4 h-4 text-yellow-500 mx-auto"/>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!ev.reviewed && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-zinc-400 hover:text-white" onClick={()=>reviewEvent(ev.id)} data-testid={`button-review-event-${ev.id}`}>Mark Read</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && events.items.length===0 && <tr><td colSpan={9} className="py-8 text-center text-zinc-500">No events logged. Use "Log Event" to manually record suspicious activity.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 4: BLACKLISTS
  // ══════════════════════════════════════════════════════════════════════════
  const renderBlacklists = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Ban className="w-6 h-6 text-red-400"/>Blacklists &amp; Blocks</h2>
        <p className="text-zinc-400 text-xs">IP blacklist (with CIDR range support), account blacklist (soft/hard/shadow ban), device fingerprint blocks. Every action logged to immutable audit trail.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* IP Blacklist */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-red-400 flex items-center gap-2"><Wifi className="w-4 h-4"/>IP Blacklist ({ipList.total||0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">IP Address *</Label><Input className="h-8 text-sm mt-1" value={ipForm.ip_address} onChange={e=>setIpForm({...ipForm,ip_address:e.target.value})} placeholder="1.2.3.4 or 1.2.3.0/24" data-testid="input-ip-address"/></div>
            <div><Label className="text-xs">Reason *</Label><Input className="h-8 text-sm mt-1" value={ipForm.reason} onChange={e=>setIpForm({...ipForm,reason:e.target.value})} placeholder="Brute force, VPN fraud..."/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Severity</Label>
                <Select value={ipForm.severity} onValueChange={v=>setIpForm({...ipForm,severity:v})}>
                  <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Expires (days)</Label><Input type="number" className="h-8 text-sm mt-1" value={ipForm.expires_in_days} onChange={e=>setIpForm({...ipForm,expires_in_days:e.target.value})} placeholder="Leave blank = permanent"/></div>
            </div>
            <Button className="bg-red-700 hover:bg-red-600 w-full h-8 text-sm" onClick={blockIP} data-testid="button-block-ip"><Ban className="w-3.5 h-3.5 mr-1"/>Block IP</Button>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {ipList.items?.map((ip:any)=>(
                <div key={ip.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60" data-testid={`row-ip-${ip.id}`}>
                  <span className="font-mono text-xs text-white flex-1">{ip.ip_address}</span>
                  <Badge className={`${SEV_COLORS[ip.severity]} text-xs`}>{ip.severity}</Badge>
                  <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs text-zinc-400 hover:text-emerald-400" onClick={()=>unblockIP(ip.ip_address)}>✓ Unblock</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Blacklist */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-orange-400 flex items-center gap-2"><UserX className="w-4 h-4"/>Account Blacklist ({acctList.total||0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">User ID *</Label><Input className="h-8 text-sm mt-1" value={acctForm.user_id} onChange={e=>setAcctForm({...acctForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-blacklist-user-id"/></div>
            <div><Label className="text-xs">Reason *</Label><Input className="h-8 text-sm mt-1" value={acctForm.reason} onChange={e=>setAcctForm({...acctForm,reason:e.target.value})} placeholder="Fraud, deepfake KYC..."/></div>
            <div><Label className="text-xs">Ban Type</Label>
              <Select value={acctForm.blacklist_type} onValueChange={v=>setAcctForm({...acctForm,blacklist_type:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft Ban (limited access)</SelectItem>
                  <SelectItem value="hard">Hard Ban (full block)</SelectItem>
                  <SelectItem value="shadow">Shadow Ban (invisible to others)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-orange-700 hover:bg-orange-600 w-full h-8 text-sm" onClick={blacklistAccount} data-testid="button-blacklist-account"><UserX className="w-3.5 h-3.5 mr-1"/>Blacklist Account</Button>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {acctList.items?.map((a:any)=>(
                <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60" data-testid={`row-account-${a.id}`}>
                  <span className="text-xs text-white font-mono flex-1 truncate">{a.user_id}</span>
                  <Badge className={`${a.blacklist_type==="hard"?"bg-red-800":a.blacklist_type==="shadow"?"bg-purple-800":"bg-orange-800"} text-xs`}>{a.blacklist_type}</Badge>
                  <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs text-zinc-400 hover:text-emerald-400" onClick={()=>unblacklistAccount(a.user_id)}>✓ Remove</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Blocks */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-purple-400 flex items-center gap-2"><Fingerprint className="w-4 h-4"/>Device Fingerprints ({deviceList.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Fingerprint Hash *</Label><Input className="h-8 text-sm mt-1 font-mono" value={devForm.fingerprint_hash} onChange={e=>setDevForm({...devForm,fingerprint_hash:e.target.value})} placeholder="a1b2c3d4e5..." data-testid="input-device-fingerprint"/></div>
            <div><Label className="text-xs">Reason</Label><Input className="h-8 text-sm mt-1" value={devForm.reason} onChange={e=>setDevForm({...devForm,reason:e.target.value})} placeholder="Linked to fraud ring..."/></div>
            <Button className="bg-purple-700 hover:bg-purple-600 w-full h-8 text-sm" onClick={blockDevice} data-testid="button-block-device"><Fingerprint className="w-3.5 h-3.5 mr-1"/>Block Device</Button>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {deviceList.map((d:any)=>(
                <div key={d.id} className="py-1.5 border-b border-zinc-800/60" data-testid={`row-device-${d.id}`}>
                  <div className="font-mono text-xs text-zinc-300 truncate">{d.fingerprint_hash}</div>
                  {d.reason && <div className="text-xs text-zinc-500">{d.reason}</div>}
                </div>
              ))}
              {deviceList.length===0 && <div className="text-zinc-600 text-xs text-center py-4">No device blocks yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Ban Type Intelligence — 3-Tier System</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {[
              {type:"Soft Ban",color:"border-orange-700 bg-orange-900/20",tc:"text-orange-300",vs:"Upwork 'suspended' = same as hard ban",desc:"Limited access: can browse but cannot apply, submit proposals, or receive payments. User aware. Encourages appeal process. Best for first-time or ambiguous violations."},
              {type:"Hard Ban",color:"border-red-700 bg-red-900/20",tc:"text-red-300",vs:"Fiverr 'permanently banned' = hard ban only",desc:"Full account block + all gigs/proposals hidden + payouts frozen. Used for confirmed fraud, deepfake KYC, chargebacks > 3, or known fraud network. Triggers marketing system win-back suppression."},
              {type:"Shadow Ban",color:"border-purple-700 bg-purple-900/20",tc:"text-purple-300",vs:"No competitor has shadow banning",desc:"User appears to operate normally but proposals are invisible to clients, gigs don't appear in search, messages are not delivered. Prevents ban evasion by bad actors who instantly re-register when hard-banned."},
            ].map((b,i)=>(
              <div key={i} className={`${b.color} border rounded p-4`}>
                <div className={`${b.tc} font-bold text-sm mb-1`}>{b.type}</div>
                <div className="text-zinc-400 mb-2 italic">{b.vs}</div>
                <div className="text-zinc-300">{b.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 5: ALERTS CENTER
  // ══════════════════════════════════════════════════════════════════════════
  const renderAlerts = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="w-6 h-6 text-yellow-400"/>Alerts Center</h2>
          <p className="text-zinc-400 text-xs">Live Socket.io alerts, rule engine, full audit trail. Real-time alerts for: quarantine, deepfake, brute-force, IP blocks, KYC decisions, account blacklisting.</p>
        </div>
        <div className="flex gap-2">
          <Select value={alertStatus} onValueChange={setAlertStatus}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-sm" onClick={testBroadcast} data-testid="button-test-alert"><Play className="w-3.5 h-3.5 mr-1"/>Test Broadcast</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Live Socket Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"/>
            <CardTitle className="text-sm">Live Alert Feed (Socket.io)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-1.5">
              {liveAlerts.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center py-8">Waiting for live alerts... (demo mode: alerts appear every ~8s)</div>
              ) : liveAlerts.map((a,i)=>(
                <div key={a.id||i} className={`p-2.5 rounded border ${a.severity==="critical"?"bg-red-900/20 border-red-800":a.severity==="high"?"bg-orange-900/20 border-orange-800":a.severity==="info"?"bg-blue-900/20 border-blue-800":"bg-zinc-800 border-zinc-700"}`}>
                  <div className="flex items-center gap-2">
                    <Badge className={`${SEV_COLORS[a.severity]||"bg-zinc-600"} text-xs`}>{a.severity||"info"}</Badge>
                    <span className="text-xs font-mono text-zinc-400">{a.type}</span>
                    <span className="text-xs text-zinc-600 ml-auto">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ""}</span>
                  </div>
                  <div className="text-xs text-zinc-300 mt-1">{a.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Queue */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Queue ({alertList.total||0})</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? <div className="text-zinc-500 text-xs">Loading...</div>
              : alertList.items?.slice(0,20).map((a:any)=>(
                <div key={a.id} className={`p-3 rounded border ${a.severity==="critical"?"bg-red-900/20 border-red-800":a.severity==="high"?"bg-orange-900/20 border-orange-800":"bg-zinc-800 border-zinc-700"}`} data-testid={`row-alert-${a.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${SEV_COLORS[a.severity]||"bg-zinc-600"} text-xs`}>{a.severity}</Badge>
                    <span className="text-xs font-semibold text-white">{a.title}</span>
                    <span className="text-xs text-zinc-600 ml-auto">{new Date(a.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mb-2">{a.description}</div>
                  {a.auto_action_taken && <Badge className="bg-zinc-700 text-xs">Auto: {a.auto_action_taken}</Badge>}
                  {a.status === "open" && (
                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 h-6 text-xs mt-2" onClick={()=>resolveAlert(a.id,"Reviewed and resolved by admin")} data-testid={`button-resolve-alert-${a.id}`}>Resolve</Button>
                  )}
                </div>
              ))}
              {!loading && (alertList.items||[]).length===0 && <div className="text-zinc-600 text-sm text-center py-8">No {alertStatus} alerts</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Immutable Admin Audit Log</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-300">Time</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Admin</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Action</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Target Type</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Target ID</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="py-4 text-center text-zinc-500">Loading...</td></tr>
                : auditLog.items?.slice(0,20).map((a:any)=>(
                  <tr key={a.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-500">{new Date(a.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    <td className="py-2 px-3 text-zinc-400 font-mono max-w-[120px] truncate">{a.admin_user_id}</td>
                    <td className="py-2 px-3"><Badge className="bg-zinc-700 text-xs">{a.action}</Badge></td>
                    <td className="py-2 px-3 text-zinc-400">{a.target_type||"–"}</td>
                    <td className="py-2 px-3 text-zinc-400 font-mono max-w-[120px] truncate">{a.target_id||"–"}</td>
                    <td className="py-2 px-3 text-zinc-500 max-w-[200px] truncate">{a.details||"–"}</td>
                  </tr>
                ))}
                {!loading && (auditLog.items||[]).length===0 && <tr><td colSpan={6} className="py-4 text-center text-zinc-600">No audit log entries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rule Engine */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Alert Rule Engine — Auto-Detection Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800"><th className="text-left py-2 px-3 text-zinc-300">Rule</th><th className="text-left py-2 px-3 text-zinc-300">Trigger</th><th className="text-left py-2 px-3 text-zinc-300">Auto Action</th><th className="text-left py-2 px-3 text-zinc-300">Severity</th><th className="text-center py-2 px-3 text-zinc-300">Active</th></tr></thead>
              <tbody>
                {[
                  {rule:"Brute Force Detection", trigger:"Failed logins > 10 in 24h", action:"Auto-quarantine 72h + alert", sev:"critical"},
                  {rule:"Deepfake KYC Alert", trigger:"Deepfake probability > 50%", action:"Flag KYC + alert trust team", sev:"critical"},
                  {rule:"Impossible Travel", trigger:"Country changes > 3 in 7d", action:"Flag for review + notify user", sev:"high"},
                  {rule:"Tor Exit Node", trigger:"Tor detected in login", action:"Log event + alert", sev:"high"},
                  {rule:"Velocity Spike", trigger:"Proposals > 20/hour", action:"Soft quarantine + alert", sev:"high"},
                  {rule:"Chargeback Threshold", trigger:"Chargebacks > 2", action:"Payment suspension + review", sev:"critical"},
                  {rule:"VPN + High Risk", trigger:"VPN + risk score > 70", action:"Enhanced monitoring + KYC request", sev:"medium"},
                  {rule:"AI Auto-Quarantine", trigger:"Risk score > 80", action:"Full quarantine + critical alert", sev:"critical"},
                ].map((r,i)=>(
                  <tr key={i} className="border-b border-zinc-800/60">
                    <td className="py-2 px-3 text-zinc-300 font-semibold">{r.rule}</td>
                    <td className="py-2 px-3 text-zinc-400">{r.trigger}</td>
                    <td className="py-2 px-3 text-blue-400">{r.action}</td>
                    <td className="py-2 px-3"><Badge className={`${SEV_COLORS[r.sev]} text-xs`}>{r.sev}</Badge></td>
                    <td className="py-2 px-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-9 h-9 text-red-400"/>
            <h1 className="text-3xl font-bold text-white">Security &amp; Trust Department</h1>
            <Badge className="bg-red-700">200% INTELLIGENCE</Badge>
            <Badge className="bg-purple-700">ZERO-TRUST</Badge>
          </div>
          <p className="text-zinc-400 text-sm">The unbreakable heart of FreelanceSkills.net — obliterating Upwork, Fiverr, Stripe Radar &amp; LinkedIn until 2029</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Perpetual AI Risk Engine","7-Dimension Scoring","Behavioral Biometrics","Deepfake Detection","Predictive Quarantine","USSD/Offline KYC","Mobile Money Fraud","Voice Biometrics","Login Alerts","2FA TOTP/SMS/USSD","IP Blacklist","Account Blacklist","Device Fingerprints","15 Event Types","Socket.io Live Alerts"].map(s=>(
              <Badge key={s} variant="outline" className="text-zinc-300 border-zinc-600 text-xs">{s}</Badge>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map(tab=>(
            <button
              key={tab.id}
              onClick={()=>setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${activeTab===tab.id?"bg-red-700 text-white shadow-lg shadow-red-700/40":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}
              data-testid={`tab-security-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab==="dashboard"  && renderDashboard()}
          {activeTab==="kyc"        && renderKYC()}
          {activeTab==="events"     && renderEvents()}
          {activeTab==="blacklist"  && renderBlacklists()}
          {activeTab==="alerts"     && renderAlerts()}
        </div>
      </div>
    </div>
  );
}
