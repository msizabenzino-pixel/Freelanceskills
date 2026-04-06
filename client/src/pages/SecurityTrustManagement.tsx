/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SECURITY & TRUST DEPARTMENT v2.0 — 200% ELON MUSK INTELLIGENCE             ║
 * ║  The Unbreakable Heart of FreelanceSkills.net                               ║
 * ║  10 Tabs | 50+ Superpowers | Obliterates all competitors until 2029        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 10-Tab Architecture:
 *  1. 🛡️  Risk Dashboard   — KPIs, 30-day trend chart, risk tier distribution
 *  2. 🧠  AI Intelligence  — Behavioral biometrics, deepfake vault, score engine
 *  3. 🪪  KYC Queue        — 5-level verification, deepfake analysis, approve/reject
 *  4. 🔍  Fraud & Activity — 15 event types, filterable, reviewable table
 *  5. 🚫  Blacklist Intel  — IP geofencing, account bans, velocity rules engine
 *  6. 🌍  Africa Hub       — USSD KYC, mobile money, airtime 2FA, country analytics
 *  7. 📊  Analytics        — Risk trends, geography heatmap, threat forecasting
 *  8. 🔗  Integrations     — 10 department hooks, fire actions, hook log
 *  9. 🚨  Alerts Center    — Live Socket feed, alert queue, rule engine
 * 10. 🔐  Zero-Trust       — 2FA enforcement, re-verification, immutable audit
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Shield, AlertTriangle, Eye, Lock, Globe, Fingerprint, Cpu, Brain,
  UserX, Ban, Wifi, Zap, Search, CheckCircle2, XCircle, Clock, Camera,
  Mic, Video, FileText, Activity, Bell, Play, RefreshCw, Upload, Map,
  Phone, Smartphone, AlertOctagon, ShieldCheck, ShieldX, Users, TrendingUp,
  Hash, Link, BarChart3, Database, Server, Layers, Key, Radio, Target,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════
// THEME CONSTANTS
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  {id:"dashboard",  label:"🛡️ Risk Dashboard"},
  {id:"ai",         label:"🧠 AI Intelligence"},
  {id:"kyc",        label:"🪪 KYC Queue"},
  {id:"events",     label:"🔍 Fraud & Activity"},
  {id:"blacklist",  label:"🚫 Blacklist Intel"},
  {id:"africa",     label:"🌍 Africa Hub"},
  {id:"analytics",  label:"📊 Analytics"},
  {id:"integrations",label:"🔗 Integrations"},
  {id:"alerts",     label:"🚨 Alerts Center"},
  {id:"zerotrust",  label:"🔐 Zero-Trust"},
];
const R = {critical:"#ef4444",high:"#f97316",medium:"#eab308",low:"#10b981",info:"#3b82f6"};
const RISK_BG: Record<string,string> = {critical:"bg-red-600",high:"bg-orange-600",medium:"bg-yellow-600",low:"bg-emerald-600"};
const SEV_BG: Record<string,string> = {critical:"bg-red-700 text-white",high:"bg-orange-600 text-white",medium:"bg-yellow-600 text-white",low:"bg-zinc-600 text-white",info:"bg-blue-700 text-white"};
const KYC_BG: Record<string,string> = {approved:"bg-emerald-700",pending:"bg-yellow-700",review:"bg-orange-700",rejected:"bg-red-700"};

// ══════════════════════════════════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════════════════════════════════
const api = {
  get: (url:string) => fetch(url).then(r=>r.json()),
  post: (url:string, body:any) => fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
  del: (url:string) => fetch(url,{method:"DELETE"}).then(r=>r.json()),
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function SecurityTrustManagement() {
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Data state
  const [dashboard, setDashboard]   = useState<any>(null);
  const [riskList,  setRiskList]    = useState<any>({items:[],total:0});
  const [kycList,   setKycList]     = useState<any>({items:[],total:0});
  const [events,    setEvents]      = useState<any>({items:[],total:0});
  const [ipList,    setIpList]      = useState<any>({items:[],total:0});
  const [acctList,  setAcctList]    = useState<any>({items:[],total:0});
  const [devList,   setDevList]     = useState<any[]>([]);
  const [alertList, setAlertList]   = useState<any>({items:[],total:0});
  const [audit,     setAudit]       = useState<any>({items:[],total:0});
  const [trendData, setTrendData]   = useState<any[]>([]);
  const [geoData,   setGeoData]     = useState<any[]>([]);
  const [fraudMetrics,setFraudMetrics]=useState<any>(null);
  const [forecast,  setForecast]    = useState<any>(null);
  const [integrations,setIntegrations]=useState<any>(null);
  const [africaStats,setAfricaStats]=useState<any>(null);
  const [velocityRules,setVelocityRules]=useState<any[]>([]);
  const [tfa2fa,    setTfa2fa]      = useState<any[]>([]);
  const [liveAlerts,setLiveAlerts]  = useState<any[]>([]);
  const [biometricSessions,setBiometricSessions]=useState<any[]>([]);

  // Filters
  const [kycStatus,   setKycStatus]   = useState("all");
  const [evtSev,      setEvtSev]      = useState("all");
  const [evtReviewed, setEvtReviewed] = useState("all");
  const [riskTier,    setRiskTier]    = useState("all");
  const [alertStatus, setAlertStatus] = useState("open");

  // Forms
  const [scoreForm,  setScoreForm]  = useState({user_id:"",kyc_verified:false,deepfake_probability:0,face_match_score:0,failed_logins_24h:0,vpn_detected:false,tor_detected:false,chargebacks:0,login_country_changes_7d:0,unique_devices_30d:1,proposals_per_hour:0,messages_per_hour:0,account_age_days:30,keystroke_anomaly_score:0,mouse_anomaly_score:0,known_fraud_network:false});
  const [scoreResult,setScoreResult]=useState<any>(null);
  const [ipForm,    setIpForm]    = useState({ip_address:"",reason:"",severity:"medium",expires_in_days:""});
  const [acctForm,  setAcctForm]  = useState({user_id:"",reason:"",severity:"high",blacklist_type:"soft",expires_in_days:""});
  const [devForm,   setDevForm]   = useState({fingerprint_hash:"",reason:""});
  const [kycForm,   setKycForm]   = useState({user_id:"",id_document_type:"passport",id_document_url:"",selfie_url:"",video_url:"",voice_sample_url:"",phone_number:"",id_document_country:"ZA"});
  const [kycSubmitResult,setKycSubmitResult]=useState<any>(null);
  const [quarantineForm,setQuarantineForm]=useState({user_id:"",reason:"",duration_hours:"72"});
  const [evtForm,   setEvtForm]   = useState({user_id:"",event_type:"suspicious_login",severity:"medium",description:"",ip_address:"",ip_is_vpn:false,ip_is_tor:false});
  const [deepfakeForm,setDeepfakeForm]=useState({user_id:"",kyc_record_id:"",id_document_url:"",selfie_url:"",video_url:"",voice_sample_url:""});
  const [deepfakeResult,setDeepfakeResult]=useState<any>(null);
  const [biometricsForm,setBiometricsForm]=useState({user_id:"",keystroke_intervals:"[80,120,90,110,85,130,75,95,88,102]",mouse_velocities:"[12,15,8,20,11,14,9]",session_duration_ms:"45000",copy_paste_count:0,tab_switch_count:0});
  const [biometricsResult,setBiometricsResult]=useState<any>(null);
  const [hookForm,  setHookForm]  = useState({department:"promotions",event_type:"high_risk_detected",user_id:"",severity:"high"});
  const [hookLog,   setHookLog]   = useState<any[]>([]);
  const [velocityForm,setVelocityForm]=useState({user_id:"",failed_logins_24h:0,proposals_per_hour:0,chargebacks:0,tor_detected:false,vpn_detected:false,risk_score:0,unique_devices_30d:1,login_country_changes_7d:0,messages_per_hour:0});
  const [velocityResult,setVelocityResult]=useState<any>(null);
  const [tfa2faForm,setTfa2faForm]=useState({user_id:"",method:"sms",reason:"Admin enforcement"});
  const [airtimeForm,setAirtimeForm]=useState({user_id:"",phone:"",provider:"MTN MoMo",amount_local:"R1"});
  const [reverifyForm,setReverifyForm]=useState({user_id:"",reason:"Periodic re-verification",required_level:"standard"});

  useEffect(()=>{loadTab();},[tab,kycStatus,evtSev,evtReviewed,riskTier,alertStatus]);

  // Simulated live alerts (Socket.io demo)
  useEffect(()=>{
    const SAMPLE=[
      {type:"brute_force",severity:"critical",message:"🔥 BRUTE FORCE: user_XYZ123 — 17 failed logins in 24h"},
      {type:"deepfake_alert",severity:"critical",message:"🤖 DEEPFAKE: 91% probability in KYC submission from user_ABC456"},
      {type:"ip_blocked",severity:"high",message:"🚫 IP BLOCKED: 185.220.101.45 (Tor exit node, CN)"},
      {type:"impossible_travel",severity:"high",message:"✈️ IMPOSSIBLE TRAVEL: ZA → RU → US in 3h (user_DEF789)"},
      {type:"bot_detected",severity:"high",message:"🤖 BOT DETECTED: keystroke variance 0.02 (threshold 0.15) — user_GHI012"},
      {type:"kyc_approved",severity:"info",message:"✅ KYC APPROVED: user_JKL345 — face match 97%, liveness 99%"},
      {type:"quarantine",severity:"critical",message:"🔒 AUTO-QUARANTINE: user_MNO678 scored 88/100 risk"},
    ];
    const t=setInterval(()=>{
      if (Math.random()>0.55) setLiveAlerts(prev=>[{...SAMPLE[Math.floor(Math.random()*SAMPLE.length)],id:Date.now(),timestamp:new Date().toISOString()},...prev.slice(0,49)]);
    },7000);
    return ()=>clearInterval(t);
  },[]);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (tab==="dashboard") {
        const [d,r]=await Promise.all([api.get("/api/security/dashboard"),api.get("/api/security/risk?sort=overall_score&dir=desc&limit=10")]);
        setDashboard(d); setRiskList(r);
      } else if (tab==="ai") {
        const bs=await api.get("/api/security/biometrics/sessions");
        setBiometricSessions(Array.isArray(bs)?bs:[]);
      } else if (tab==="kyc") {
        setKycList(await api.get(`/api/security/kyc?status=${kycStatus}&limit=100`));
      } else if (tab==="events") {
        const p=new URLSearchParams({limit:"200"});
        if (evtSev!=="all") p.set("severity",evtSev);
        if (evtReviewed!=="all") p.set("reviewed",evtReviewed);
        setEvents(await api.get(`/api/security/events?${p}`));
      } else if (tab==="blacklist") {
        const [ip,ac,dv,vr]=await Promise.all([
          api.get("/api/security/block/ips?limit=200"),
          api.get("/api/security/block/accounts?limit=200"),
          api.get("/api/security/block/devices"),
          api.get("/api/security/velocity/rules"),
        ]);
        setIpList(ip); setAcctList(ac); setDevList(Array.isArray(dv)?dv:[]); setVelocityRules(Array.isArray(vr)?vr:[]);
      } else if (tab==="africa") {
        setAfricaStats(await api.get("/api/security/africa/stats"));
      } else if (tab==="analytics") {
        const [tr,geo,fm,fc]=await Promise.all([
          api.get("/api/security/analytics/risk-trend"),
          api.get("/api/security/analytics/geography"),
          api.get("/api/security/analytics/fraud-metrics"),
          api.get("/api/security/analytics/threat-forecast"),
        ]);
        setTrendData(Array.isArray(tr)?tr:[]); setGeoData(Array.isArray(geo)?geo:[]); setFraudMetrics(fm); setForecast(fc);
      } else if (tab==="integrations") {
        setIntegrations(await api.get("/api/security/integrations/status"));
      } else if (tab==="alerts") {
        const [al,au]=await Promise.all([
          api.get(`/api/security/alerts?status=${alertStatus}&limit=100`),
          api.get("/api/security/audit?limit=50"),
        ]);
        setAlertList(al); setAudit(au);
      } else if (tab==="zerotrust") {
        const [au,tfl]=await Promise.all([
          api.get("/api/security/audit?limit=100"),
          api.get("/api/security/2fa/list"),
        ]);
        setAudit(au); setTfa2fa(Array.isArray(tfl)?tfl:[]);
      }
    } catch {}
    setLoading(false);
  };

  // ── ACTION HANDLERS ──────────────────────────────────────────────────
  const computeScore = async () => {
    if (!scoreForm.user_id) return alert("User ID required");
    const r=await api.post("/api/security/risk/score",{...scoreForm});
    if (r.overall_score!==undefined) setScoreResult(r); else alert(r.message||"Error");
  };
  const analyzeDeepfake = async () => {
    if (!deepfakeForm.user_id) return alert("User ID required");
    const r=await api.post("/api/security/deepfake/analyze",deepfakeForm);
    if (r.verification_recommendation) setDeepfakeResult(r); else alert(r.message||"Error");
  };
  const analyzeBiometrics = async () => {
    const r=await api.post("/api/security/biometrics/analyze",{
      ...biometricsForm,
      keystroke_intervals:JSON.parse(biometricsForm.keystroke_intervals||"[]"),
      mouse_velocities:JSON.parse(biometricsForm.mouse_velocities||"[]"),
      session_duration_ms:parseInt(biometricsForm.session_duration_ms)||0,
    });
    if (r.overall_biometric_risk!==undefined) setBiometricsResult(r); else alert(r.message||"Error");
  };
  const quarantineUser = async () => {
    if (!quarantineForm.user_id||!quarantineForm.reason) return alert("User ID and reason required");
    const r=await api.post(`/api/security/risk/${quarantineForm.user_id}/quarantine`,{reason:quarantineForm.reason,duration_hours:parseInt(quarantineForm.duration_hours)});
    if (r.message) alert(`✅ ${r.message}`); loadTab();
  };
  const submitKYC = async () => {
    if (!kycForm.user_id) return alert("User ID required");
    const r=await api.post("/api/security/kyc/submit",kycForm);
    if (r.id) { setKycSubmitResult(r); loadTab(); } else alert(r.message||"Error");
  };
  const reviewKYC = async (id:number, action:"approve"|"reject") => {
    const r=await api.post(`/api/security/kyc/${id}/review`,{action,reviewer_notes:`Admin ${action}d via dashboard`});
    if (r.message) { alert(`✅ KYC ${action}d`); loadTab(); }
  };
  const blockIP = async () => {
    if (!ipForm.ip_address||!ipForm.reason) return alert("IP address and reason required");
    const r=await api.post("/api/security/block/ip",{...ipForm,expires_in_days:ipForm.expires_in_days?parseInt(ipForm.expires_in_days):undefined});
    if (r.id) { setIpForm({ip_address:"",reason:"",severity:"medium",expires_in_days:""}); loadTab(); } else alert(r.message||"Error");
  };
  const unblockIP = async (ip:string) => { if(confirm(`Unblock ${ip}?`)){await api.del(`/api/security/block/ip/${encodeURIComponent(ip)}`);loadTab();} };
  const blacklistAcct = async () => {
    if (!acctForm.user_id||!acctForm.reason) return alert("User ID and reason required");
    const r=await api.post("/api/security/block/account",{...acctForm,expires_in_days:acctForm.expires_in_days?parseInt(acctForm.expires_in_days):undefined});
    if (r.id) { setAcctForm({user_id:"",reason:"",severity:"high",blacklist_type:"soft",expires_in_days:""}); loadTab(); } else alert(r.message||"Error");
  };
  const unblacklistAcct = async (uid:string) => { if(confirm(`Remove ${uid}?`)){await api.del(`/api/security/block/account/${uid}`);loadTab();} };
  const blockDevice = async () => {
    if (!devForm.fingerprint_hash) return alert("Fingerprint hash required");
    await api.post("/api/security/block/device",devForm); setDevForm({fingerprint_hash:"",reason:""}); loadTab();
  };
  const logEvent = async () => {
    if (!evtForm.event_type||!evtForm.description) return alert("Event type and description required");
    await api.post("/api/security/events",evtForm); loadTab();
  };
  const reviewEvent = async (id:number) => { await api.post(`/api/security/events/${id}/review`,{action_taken:"reviewed_by_admin"}); loadTab(); };
  const resolveAlert = async (id:number) => { await api.post(`/api/security/alerts/${id}/resolve`,{resolution_notes:"Resolved by admin"}); loadTab(); };
  const testBroadcast = async () => { await api.post("/api/security/alerts/test-broadcast",{type:"test_alert",severity:"medium",message:"🧪 Test alert from Security dashboard"}); };
  const fireHook = async () => {
    const r=await api.post("/api/security/integrations/fire",{...hookForm,metadata:{severity:hookForm.severity}});
    if (r.success) setHookLog(prev=>[{...r,timestamp:new Date().toISOString()},...prev.slice(0,19)]);
    else alert(r.message||"Error");
  };
  const checkVelocity = async () => {
    const r=await api.post("/api/security/velocity/check",velocityForm);
    setVelocityResult(r);
  };
  const enforce2FA = async () => {
    if (!tfa2faForm.user_id) return alert("User ID required");
    const r=await api.post("/api/security/2fa/enforce",tfa2faForm);
    if (r.success) { alert(`✅ 2FA enforced`); loadTab(); } else alert(r.message||"Error");
  };
  const triggerReverify = async () => {
    if (!reverifyForm.user_id) return alert("User ID required");
    const r=await api.post("/api/security/zerotrust/reverify",reverifyForm);
    if (r.success) { alert(`✅ Re-verification triggered`); loadTab(); } else alert(r.message||"Error");
  };
  const airtimeVerify = async () => {
    if (!airtimeForm.user_id||!airtimeForm.phone) return alert("User ID and phone required");
    const r=await api.post("/api/security/africa/airtime-verify",airtimeForm);
    if (r.success) alert(`✅ ${r.message}`); else alert(r.message||"Error");
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 1: RISK DASHBOARD
  // ══════════════════════════════════════════════════════════════════════
  const renderDashboard = () => {
    const d=dashboard;
    const tierData=d?[
      {name:"Critical",value:Number(d.risk_overview?.critical||0),fill:R.critical},
      {name:"High",    value:Number(d.risk_overview?.high||0),    fill:R.high},
      {name:"Medium",  value:Number(d.risk_overview?.medium||0),  fill:R.medium},
      {name:"Low",     value:Number(d.risk_overview?.low||0),     fill:R.low},
    ]:[];
    const radarData=scoreResult?[
      {dim:"Identity",   score:scoreResult.identity_risk,   fullMark:100},
      {dim:"Behavioral", score:scoreResult.behavioral_risk, fullMark:100},
      {dim:"Financial",  score:scoreResult.financial_risk,  fullMark:100},
      {dim:"Network",    score:scoreResult.network_risk,    fullMark:100},
      {dim:"Device",     score:scoreResult.device_risk,     fullMark:100},
      {dim:"Geo",        score:scoreResult.geolocation_risk,fullMark:100},
      {dim:"Velocity",   score:scoreResult.velocity_risk,   fullMark:100},
    ]:[];
    return (
      <div className="space-y-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-red-400"/>Risk Dashboard — Perpetual AI Risk Engine</h2>
          <p className="text-zinc-400 text-xs">7-dimension real-time scoring + predictive quarantine. Real-time, proactive, and Africa-optimised.</p>
        </div>
        {d&&<div className="grid grid-cols-6 gap-3">
          {[
            {l:"Scored Users",v:Number(d.risk_overview?.total_scored||0),c:"text-zinc-200",b:"from-zinc-900 border-zinc-700"},
            {l:"Critical Risk",v:Number(d.risk_overview?.critical||0),c:"text-red-400",b:"from-red-900/40 border-red-800"},
            {l:"Quarantined",v:Number(d.risk_overview?.quarantined||0),c:"text-orange-400",b:"from-orange-900/40 border-orange-800"},
            {l:"Open Alerts",v:Number(d.alerts_overview?.open_count||0),c:"text-yellow-400",b:"from-yellow-900/40 border-yellow-800"},
            {l:"KYC Pending",v:Number(d.kyc_overview?.pending||0),c:"text-blue-400",b:"from-blue-900/40 border-blue-800"},
            {l:"Avg Risk Score",v:Number(d.risk_overview?.avg_score||0).toFixed(1),c:"text-purple-400",b:"from-purple-900/40 border-purple-800"},
          ].map((k,i)=>(
            <Card key={i} className={`bg-gradient-to-br ${k.b} border`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                <div className="text-xs text-zinc-400 mt-1">{k.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>}
        <div className="grid grid-cols-2 gap-5">
          {/* Risk Score Engine */}
          <Card className="bg-gradient-to-br from-red-900/20 to-zinc-900 border-red-900/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-red-300">AI Risk Engine — Score Any User</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><Label className="text-xs">User ID *</Label><Input className="h-8 text-sm mt-1" placeholder="user_ABC..." value={scoreForm.user_id} onChange={e=>setScoreForm({...scoreForm,user_id:e.target.value})} data-testid="input-risk-user-id"/></div>
                <div><Label className="text-xs">Failed Logins (24h)</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.failed_logins_24h} onChange={e=>setScoreForm({...scoreForm,failed_logins_24h:+e.target.value||0})}/></div>
                <div><Label className="text-xs">Chargebacks</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.chargebacks} onChange={e=>setScoreForm({...scoreForm,chargebacks:+e.target.value||0})}/></div>
                <div><Label className="text-xs">Country Changes (7d)</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.login_country_changes_7d} onChange={e=>setScoreForm({...scoreForm,login_country_changes_7d:+e.target.value||0})}/></div>
                <div><Label className="text-xs">Proposals/Hour</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.proposals_per_hour} onChange={e=>setScoreForm({...scoreForm,proposals_per_hour:+e.target.value||0})}/></div>
                <div><Label className="text-xs">Keystroke Anomaly</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.keystroke_anomaly_score} onChange={e=>setScoreForm({...scoreForm,keystroke_anomaly_score:+e.target.value||0})}/></div>
                <div><Label className="text-xs">Deepfake %</Label><Input type="number" className="h-7 text-sm mt-1" value={scoreForm.deepfake_probability} onChange={e=>setScoreForm({...scoreForm,deepfake_probability:+e.target.value||0})}/></div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs pt-1">
                {[["kyc_verified","KYC Verified"],["vpn_detected","VPN"],["tor_detected","Tor"],["known_fraud_network","Fraud Network"]].map(([k,l])=>(
                  <label key={k} className="flex items-center gap-1.5 cursor-pointer"><Switch checked={(scoreForm as any)[k]} onCheckedChange={v=>setScoreForm({...scoreForm,[k]:v})} className="scale-75"/><span className="text-zinc-300">{l}</span></label>
                ))}
              </div>
              <Button className="bg-red-600 hover:bg-red-700 w-full h-8 text-sm" onClick={computeScore} data-testid="button-compute-risk"><Brain className="w-4 h-4 mr-1"/>Compute 7-Dimension AI Risk Score</Button>
              {scoreResult&&(
                <div className="p-3 bg-zinc-900 rounded border border-red-800 space-y-1">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl font-black ${scoreResult.overall_score>75?"text-red-400":scoreResult.overall_score>55?"text-orange-400":scoreResult.overall_score>30?"text-yellow-400":"text-emerald-400"}`}>{scoreResult.overall_score}</div>
                    <div><Badge className={RISK_BG[scoreResult.risk_tier]}>{scoreResult.risk_tier.toUpperCase()}</Badge>{scoreResult.auto_quarantine&&<Badge className="bg-red-900 ml-1 text-xs">🚨 AUTO-QUARANTINE</Badge>}</div>
                  </div>
                  <div className="text-xs text-zinc-300">{scoreResult.recommended_action}</div>
                  {scoreResult.risk_factors?.slice(0,4).map((f:any,i:number)=><div key={i} className="text-xs text-zinc-500">• [{f.dimension}] {f.description}</div>)}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Radar + Pie */}
          <div className="grid grid-rows-2 gap-3">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1"><CardTitle className="text-xs">7-Dimension Risk Radar</CardTitle></CardHeader>
              <CardContent>
                {scoreResult?(
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}><PolarGrid stroke="#3f3f46"/><PolarAngleAxis dataKey="dim" tick={{fill:"#a1a1aa",fontSize:10}}/><PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:"#a1a1aa",fontSize:8}}/><Radar name="Risk" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35}/><Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/></RadarChart>
                  </ResponsiveContainer>
                ):<div className="h-44 flex items-center justify-center text-zinc-500 text-xs">Score a user to see radar</div>}
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1"><CardTitle className="text-xs">Risk Tier Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">{tierData.map((_,i)=><Cell key={i} fill={tierData[i].fill}/>)}</Pie><Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/><Legend iconSize={8} wrapperStyle={{fontSize:10}}/></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Top Risk Users + Quarantine Tool + Block Stats */}
        <div className="grid grid-cols-3 gap-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm">Top Risk Users</CardTitle><Button size="sm" variant="ghost" className="h-6 text-xs text-zinc-400" onClick={loadTab}><RefreshCw className="w-3 h-3 mr-1"/>Refresh</Button></CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {riskList.items?.map((r:any)=>(
                  <div key={r.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60" data-testid={`row-risk-${r.id}`}>
                    <Badge className={`${RISK_BG[r.risk_tier]} w-14 justify-center text-xs`}>{r.risk_tier}</Badge>
                    <span className="text-zinc-300 text-xs font-mono flex-1 truncate">{r.user_id}</span>
                    <span className={`font-bold text-sm ${Number(r.overall_score)>75?"text-red-400":Number(r.overall_score)>55?"text-orange-400":Number(r.overall_score)>30?"text-yellow-400":"text-emerald-400"}`}>{Number(r.overall_score).toFixed(0)}</span>
                    {r.quarantine_status==="quarantined"&&<Badge className="bg-red-900 text-xs">🔒</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Predictive Quarantine</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div><Label className="text-xs">User ID</Label><Input className="h-7 text-sm mt-1" value={quarantineForm.user_id} onChange={e=>setQuarantineForm({...quarantineForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-quarantine-user-id"/></div>
              <div><Label className="text-xs">Reason</Label><Input className="h-7 text-sm mt-1" value={quarantineForm.reason} onChange={e=>setQuarantineForm({...quarantineForm,reason:e.target.value})} placeholder="Deepfake detected..."/></div>
              <div><Label className="text-xs">Duration</Label>
                <Select value={quarantineForm.duration_hours} onValueChange={v=>setQuarantineForm({...quarantineForm,duration_hours:v})}>
                  <SelectTrigger className="h-7 mt-1 text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="24">24h</SelectItem><SelectItem value="72">72h</SelectItem><SelectItem value="168">7 days</SelectItem><SelectItem value="720">30 days</SelectItem></SelectContent>
                </Select>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full h-7 text-xs" onClick={quarantineUser} data-testid="button-quarantine"><Lock className="w-3.5 h-3.5 mr-1"/>Apply Quarantine</Button>
              <div className="text-xs text-zinc-500 p-2 bg-orange-900/20 border border-orange-900 rounded">Traditional: suspend after report filed (3-5 days). We: quarantine BEFORE harm using AI scores.</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Platform Security Stats</CardTitle></CardHeader>
            <CardContent>
              {d&&<div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[{l:"Blocked IPs",v:Number(d.block_counts?.blocked_ips||0),c:"text-red-400"},{l:"Banned Accounts",v:Number(d.block_counts?.blocked_accounts||0),c:"text-orange-400"},{l:"Blocked Devices",v:Number(d.block_counts?.blocked_devices||0),c:"text-yellow-400"}].map((b,i)=>(
                    <div key={i} className="bg-zinc-800 rounded p-2 text-center"><div className={`text-xl font-bold ${b.c}`}>{b.v}</div><div className="text-xs text-zinc-400 mt-0.5">{b.l}</div></div>
                  ))}
                </div>
                <div className="text-xs text-zinc-400 font-semibold">Top Events (24h):</div>
                {(d.top_events_24h||[]).slice(0,5).map((e:any,i:number)=>(
                  <div key={i} className="flex items-center gap-2 border-b border-zinc-800/60 pb-1">
                    <span className="text-zinc-300 text-xs flex-1">{e.event_type}</span>
                    <Badge className="bg-zinc-700 text-xs">{e.count}×</Badge>
                  </div>
                ))}
              </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 2: AI INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════
  const renderAI = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-purple-400"/>AI Intelligence — Behavioral Biometrics + Deepfake Vault</h2>
        <p className="text-zinc-400 text-xs">Keystroke cadence analysis, mouse dynamics, session anomaly detection, 5-signal deepfake vault. Unique to FreelanceSkills.</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {/* Behavioral Biometrics */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border-purple-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-purple-300 flex items-center gap-2"><Fingerprint className="w-4 h-4"/>Behavioral Biometrics Engine</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">User ID</Label><Input className="h-7 text-sm mt-1" value={biometricsForm.user_id} onChange={e=>setBiometricsForm({...biometricsForm,user_id:e.target.value})} placeholder="user_ABC..."/></div>
            <div><Label className="text-xs">Keystroke Intervals (ms array) — human: variance 0.3-0.6, bot: &lt;0.05</Label><Input className="h-7 text-xs mt-1 font-mono" value={biometricsForm.keystroke_intervals} onChange={e=>setBiometricsForm({...biometricsForm,keystroke_intervals:e.target.value})} placeholder="[80,120,90,110...]"/></div>
            <div><Label className="text-xs">Mouse Velocities (px/ms array)</Label><Input className="h-7 text-xs mt-1 font-mono" value={biometricsForm.mouse_velocities} onChange={e=>setBiometricsForm({...biometricsForm,mouse_velocities:e.target.value})}/></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Session (ms)</Label><Input type="number" className="h-7 text-xs mt-1" value={biometricsForm.session_duration_ms} onChange={e=>setBiometricsForm({...biometricsForm,session_duration_ms:e.target.value})}/></div>
              <div><Label className="text-xs">Copy-Paste Events</Label><Input type="number" className="h-7 text-xs mt-1" value={biometricsForm.copy_paste_count} onChange={e=>setBiometricsForm({...biometricsForm,copy_paste_count:+e.target.value})}/></div>
              <div><Label className="text-xs">Tab Switches</Label><Input type="number" className="h-7 text-xs mt-1" value={biometricsForm.tab_switch_count} onChange={e=>setBiometricsForm({...biometricsForm,tab_switch_count:+e.target.value})}/></div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 w-full h-8 text-sm" onClick={analyzeBiometrics}><Activity className="w-4 h-4 mr-1"/>Analyze Behavioral Biometrics</Button>
            {biometricsResult&&(
              <div className={`p-3 rounded border ${biometricsResult.is_likely_bot?"border-red-700 bg-red-900/20":"border-emerald-700 bg-emerald-900/20"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`text-3xl font-black ${biometricsResult.overall_biometric_risk>65?"text-red-400":"text-emerald-400"}`}>{biometricsResult.overall_biometric_risk}</div>
                  <div><Badge className={biometricsResult.is_likely_bot?"bg-red-700":"bg-emerald-700"}>{biometricsResult.is_likely_bot?"🤖 LIKELY BOT":"✅ LIKELY HUMAN"}</Badge><div className="text-xs text-zinc-400 mt-0.5">Confidence: {biometricsResult.confidence}%</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  {[["Keystroke",biometricsResult.keystroke_anomaly_score],["Mouse",biometricsResult.mouse_anomaly_score],["Session",biometricsResult.session_anomaly_score]].map(([l,v])=>(
                    <div key={l} className="bg-zinc-800 rounded p-2 text-center"><div className={`font-bold text-lg ${Number(v)>50?"text-red-400":"text-emerald-400"}`}>{v}</div><div className="text-zinc-400">{l}</div></div>
                  ))}
                </div>
                {biometricsResult.anomalies?.map((a:string,i:number)=><div key={i} className="text-xs text-zinc-300">• {a}</div>)}
              </div>
            )}
            <div className="text-xs p-2 bg-zinc-800 rounded">
              <div className="text-purple-300 font-semibold mb-1">How it works:</div>
              <div className="text-zinc-400 space-y-0.5">
                <div>• Human typing: coefficient of variation 0.3–0.6 in keypress intervals</div>
                <div>• Bot automation: CV &lt;0.05 (too regular) or &gt;2.0 (random jitter)</div>
                <div>• Mouse: humans curve, bots move linearly or not at all</div>
                <div>• Session &lt;2s: likely automated API call</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Deepfake Vault */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border-blue-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-blue-300 flex items-center gap-2"><Camera className="w-4 h-4"/>Deepfake &amp; Multimodal Verification Vault</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">User ID *</Label><Input className="h-7 text-sm mt-1" value={deepfakeForm.user_id} onChange={e=>setDeepfakeForm({...deepfakeForm,user_id:e.target.value})} placeholder="user_ABC..."/></div>
              <div><Label className="text-xs">KYC Record ID</Label><Input type="number" className="h-7 text-sm mt-1" value={deepfakeForm.kyc_record_id} onChange={e=>setDeepfakeForm({...deepfakeForm,kyc_record_id:e.target.value})}/></div>
              <div><Label className="text-xs">ID Document URL</Label><Input className="h-7 text-xs mt-1" value={deepfakeForm.id_document_url} onChange={e=>setDeepfakeForm({...deepfakeForm,id_document_url:e.target.value})} placeholder="https://..."/></div>
              <div><Label className="text-xs">Selfie URL</Label><Input className="h-7 text-xs mt-1" value={deepfakeForm.selfie_url} onChange={e=>setDeepfakeForm({...deepfakeForm,selfie_url:e.target.value})} placeholder="https://..."/></div>
              <div><Label className="text-xs">Video URL (liveness)</Label><Input className="h-7 text-xs mt-1" value={deepfakeForm.video_url} onChange={e=>setDeepfakeForm({...deepfakeForm,video_url:e.target.value})} placeholder="https://..."/></div>
              <div><Label className="text-xs">Voice Sample URL</Label><Input className="h-7 text-xs mt-1" value={deepfakeForm.voice_sample_url} onChange={e=>setDeepfakeForm({...deepfakeForm,voice_sample_url:e.target.value})} placeholder="https://..."/></div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-sm" onClick={analyzeDeepfake}><Video className="w-4 h-4 mr-1"/>Run 5-Signal Deepfake Vault Analysis</Button>
            {deepfakeResult&&(
              <div className={`p-3 rounded border ${deepfakeResult.verification_recommendation==="fail"?"border-red-700 bg-red-900/20":deepfakeResult.verification_recommendation==="review"?"border-yellow-700 bg-yellow-900/20":"border-emerald-700 bg-emerald-900/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={deepfakeResult.verification_recommendation==="fail"?"bg-red-700":deepfakeResult.verification_recommendation==="review"?"bg-yellow-700":"bg-emerald-700"}>
                    {deepfakeResult.verification_recommendation==="fail"?"✗ FAIL":deepfakeResult.verification_recommendation==="review"?"⚠ REVIEW":"✓ PASS"}
                  </Badge>
                  {deepfakeResult.risk_flags?.map((f:string,i:number)=><Badge key={i} className="bg-red-900 text-xs">{f}</Badge>)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  {[["Deepfake Risk",`${deepfakeResult.deepfake_probability?.toFixed(0)}%`,deepfakeResult.deepfake_probability>30],["Face Match",`${deepfakeResult.face_match_score?.toFixed(0)}%`,deepfakeResult.face_match_score<80&&deepfakeResult.face_match_score>0],["Liveness",`${deepfakeResult.liveness_score?.toFixed(0)}%`,deepfakeResult.liveness_score<80&&deepfakeResult.liveness_score>0],["Doc Auth",`${deepfakeResult.document_authenticity_score?.toFixed(0)}%`,deepfakeResult.document_authenticity_score<80&&deepfakeResult.document_authenticity_score>0],["Voice",`${deepfakeResult.voice_match_score?.toFixed(0)}%`,deepfakeResult.voice_match_score<75&&deepfakeResult.voice_match_score>0],["Temporal",`${deepfakeResult.temporal_consistency_score?.toFixed(0)}%`,deepfakeResult.temporal_consistency_score<80&&deepfakeResult.temporal_consistency_score>0]].map(([l,v,bad])=>(
                    <div key={String(l)} className="bg-zinc-800 rounded p-1.5 text-center"><div className={`font-bold ${bad?"text-red-400":"text-emerald-400"}`}>{v}</div><div className="text-zinc-400 text-xs">{l}</div></div>
                  ))}
                </div>
                {deepfakeResult.analysis_notes?.map((n:string,i:number)=><div key={i} className="text-xs text-zinc-300">{n}</div>)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-red-900/20 border border-red-900 rounded"><div className="text-red-300 font-semibold mb-1">Industry standard:</div><div className="text-zinc-400">Email ID upload, basic selfie. No liveness. No voice. No temporal consistency check.</div></div>
              <div className="p-2 bg-blue-900/20 border border-blue-900 rounded"><div className="text-blue-300 font-semibold mb-1">FreelanceSkills v2.0:</div><div className="text-zinc-400">5-signal: ID authenticity + face match + liveness + voice biometric + temporal consistency.</div></div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Biometric Sessions Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Biometric Sessions — Behavioral Risk Monitor</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["User ID","Behavioral Risk","Keystroke Hash","Mouse Hash","Last Scored"].map(h=><th key={h} className="text-left py-2 px-3 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{biometricSessions.map((s:any,i)=>(
                <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-2 px-3 font-mono text-zinc-300 max-w-[160px] truncate">{s.user_id}</td>
                  <td className="py-2 px-3"><span className={`font-bold ${Number(s.behavioral_risk)>60?"text-red-400":Number(s.behavioral_risk)>30?"text-yellow-400":"text-emerald-400"}`}>{Number(s.behavioral_risk).toFixed(0)}</span></td>
                  <td className="py-2 px-3 font-mono text-zinc-500 max-w-[120px] truncate">{s.keystroke_pattern_hash||"–"}</td>
                  <td className="py-2 px-3 font-mono text-zinc-500 max-w-[120px] truncate">{s.mouse_pattern_hash||"–"}</td>
                  <td className="py-2 px-3 text-zinc-500">{s.last_scored_at?new Date(s.last_scored_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"–"}</td>
                </tr>
              ))}
              {biometricSessions.length===0&&<tr><td colSpan={5} className="py-6 text-center text-zinc-600">No biometric sessions yet. Analyze a user above to populate.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 3: KYC QUEUE
  // ══════════════════════════════════════════════════════════════════════
  const renderKYC = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-blue-400"/>KYC Verification Queue</h2>
          <p className="text-zinc-400 text-xs">5-level pipeline: none→basic→standard→enhanced→premium. Deepfake vault on every submission. Africa USSD + mobile money anchored.</p>
        </div>
        <div className="flex gap-2">
          <Select value={kycStatus} onValueChange={setKycStatus}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="review">Under Review</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
          <Dialog>
            <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700 h-8 text-sm" data-testid="button-submit-kyc"><Upload className="w-3.5 h-3.5 mr-1"/>Submit KYC</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Submit KYC for User</DialogTitle></DialogHeader>
              <div className="grid gap-2 py-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">User ID *</Label><Input className="h-8 text-sm mt-1" value={kycForm.user_id} onChange={e=>setKycForm({...kycForm,user_id:e.target.value})} data-testid="input-kyc-user-id"/></div>
                  <div><Label className="text-xs">Document Type</Label><Select value={kycForm.id_document_type} onValueChange={v=>setKycForm({...kycForm,id_document_type:v})}><SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="passport">Passport</SelectItem><SelectItem value="national_id">National ID</SelectItem><SelectItem value="drivers_license">Driver's License</SelectItem><SelectItem value="voter_id">Voter ID</SelectItem></SelectContent></Select></div>
                </div>
                {[["ID Document URL","id_document_url"],["Selfie URL","selfie_url"],["Video URL (liveness)","video_url"],["Voice Sample URL","voice_sample_url"],["Phone Number","phone_number"]].map(([l,k])=>(
                  <div key={k}><Label className="text-xs">{l}</Label><Input className="h-7 text-xs mt-1" value={(kycForm as any)[k]} onChange={e=>setKycForm({...kycForm,[k]:e.target.value})} placeholder="https://..."/></div>
                ))}
                <Button className="bg-blue-600 hover:bg-blue-700 mt-1" onClick={submitKYC} data-testid="button-kyc-submit-confirm">Submit + Run Deepfake Vault</Button>
                {kycSubmitResult&&(
                  <div className="p-3 bg-zinc-800 rounded border border-blue-700 text-xs space-y-1">
                    <div className="font-semibold text-blue-300">AI Vault Results:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {[["Deepfake",kycSubmitResult.deepfake_analysis?.deepfake_probability,true],["Face Match",kycSubmitResult.deepfake_analysis?.face_match_score,false],["Liveness",kycSubmitResult.deepfake_analysis?.liveness_score,false],["Doc Auth",kycSubmitResult.deepfake_analysis?.document_authenticity_score,false]].map(([l,v,invert])=>(
                        <div key={String(l)} className="flex justify-between"><span className="text-zinc-400">{l}:</span><span className={`font-bold ${invert?Number(v)>30?"text-red-400":"text-emerald-400":Number(v)>80?"text-emerald-400":"text-red-400"}`}>{Number(v||0).toFixed(0)}%</span></div>
                      ))}
                    </div>
                    {kycSubmitResult.deepfake_analysis?.analysis_notes?.slice(0,3).map((n:string,i:number)=><div key={i} className="text-zinc-300">• {n}</div>)}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">{kycList.total} records</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800 bg-zinc-900/60">{["User","Status","Level","Type","Deepfake %","Face Match","Liveness","Voice","Media","Date","Actions"].map(h=><th key={h} className="text-left py-2.5 px-3 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{loading?<tr><td colSpan={11} className="py-8 text-center text-zinc-500">Loading...</td></tr>:
                kycList.items?.map((k:any)=>(
                  <tr key={k.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30" data-testid={`row-kyc-${k.id}`}>
                    <td className="py-2 px-3 font-mono text-zinc-300 max-w-[120px] truncate">{k.user_id}</td>
                    <td className="py-2 px-3"><Badge className={`${KYC_BG[k.status]||"bg-zinc-700"} text-xs`}>{k.status}</Badge></td>
                    <td className="py-2 px-3 text-zinc-500">{k.verification_level}</td>
                    <td className="py-2 px-3 text-zinc-400">{k.id_document_type||"–"}</td>
                    <td className="py-2 px-3 text-center"><span className={`font-bold ${Number(k.deepfake_probability)>50?"text-red-400":Number(k.deepfake_probability)>20?"text-yellow-400":"text-emerald-400"}`}>{k.deepfake_probability!=null?`${Number(k.deepfake_probability).toFixed(0)}%`:"–"}</span></td>
                    <td className="py-2 px-3 text-center"><span className={`font-bold ${Number(k.face_match_score)>85?"text-emerald-400":"text-orange-400"}`}>{k.face_match_score?`${Number(k.face_match_score).toFixed(0)}%`:"–"}</span></td>
                    <td className="py-2 px-3 text-center"><span className={`font-bold ${Number(k.liveness_score)>80?"text-emerald-400":"text-red-400"}`}>{k.liveness_score?`${Number(k.liveness_score).toFixed(0)}%`:"–"}</span></td>
                    <td className="py-2 px-3 text-center"><span className={`font-bold ${Number(k.voice_match_score)>75?"text-emerald-400":"text-orange-400"}`}>{k.voice_match_score?`${Number(k.voice_match_score).toFixed(0)}%`:"–"}</span></td>
                    <td className="py-2 px-3"><div className="flex gap-1">{k.selfie_url&&<Camera className="w-3.5 h-3.5 text-zinc-400"/>}{k.video_url&&<Video className="w-3.5 h-3.5 text-zinc-400"/>}{k.voice_sample_url&&<Mic className="w-3.5 h-3.5 text-zinc-400"/>}{k.id_document_url&&<FileText className="w-3.5 h-3.5 text-zinc-400"/>}</div></td>
                    <td className="py-2 px-3 text-zinc-500">{new Date(k.created_at).toLocaleDateString("en-ZA")}</td>
                    <td className="py-2 px-3">{k.status==="pending"&&<div className="flex gap-1"><Button size="sm" className="bg-emerald-600 h-6 px-2 text-xs" onClick={()=>reviewKYC(k.id,"approve")} data-testid={`button-kyc-approve-${k.id}`}>✓</Button><Button size="sm" className="bg-red-700 h-6 px-2 text-xs" onClick={()=>reviewKYC(k.id,"reject")} data-testid={`button-kyc-reject-${k.id}`}>✗</Button></div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 4: FRAUD & ACTIVITY
  // ══════════════════════════════════════════════════════════════════════
  const renderEvents = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Eye className="w-6 h-6 text-yellow-400"/>Fraud &amp; Activity Log</h2>
          <p className="text-zinc-400 text-xs">15 event types. Sortable, filterable, reviewable. Real-time anomaly detection across all user actions.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={evtSev} onValueChange={setEvtSev}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Severities</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
          <Select value={evtReviewed} onValueChange={setEvtReviewed}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Events</SelectItem><SelectItem value="false">Unreviewed</SelectItem><SelectItem value="true">Reviewed</SelectItem></SelectContent></Select>
          <Dialog>
            <DialogTrigger asChild><Button className="bg-yellow-700 hover:bg-yellow-600 h-8 text-sm"><Zap className="w-3.5 h-3.5 mr-1"/>Log Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Security Event</DialogTitle></DialogHeader>
              <div className="grid gap-2 py-2">
                <div><Label className="text-xs">User ID (optional)</Label><Input className="h-7 text-sm mt-1" value={evtForm.user_id} onChange={e=>setEvtForm({...evtForm,user_id:e.target.value})}/></div>
                <div><Label className="text-xs">Event Type</Label><Select value={evtForm.event_type} onValueChange={v=>setEvtForm({...evtForm,event_type:v})}><SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger><SelectContent>{["suspicious_login","brute_force","velocity_spike","impossible_travel","account_takeover","deepfake_detected","ip_blocked","account_blacklisted","payment_fraud","chargeback","proposal_spam","message_spam","identity_mismatch","device_change","mobile_money_fraud"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Severity</Label><Select value={evtForm.severity} onValueChange={v=>setEvtForm({...evtForm,severity:v})}><SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div>
                <div><Label className="text-xs">Description *</Label><Textarea className="text-sm mt-1" rows={2} value={evtForm.description} onChange={e=>setEvtForm({...evtForm,description:e.target.value})}/></div>
                <div><Label className="text-xs">IP Address</Label><Input className="h-7 text-sm mt-1" value={evtForm.ip_address} onChange={e=>setEvtForm({...evtForm,ip_address:e.target.value})} placeholder="1.2.3.4"/></div>
                <div className="flex gap-4 text-xs">{[["ip_is_vpn","VPN"],["ip_is_tor","Tor"]].map(([k,l])=><label key={k} className="flex items-center gap-1.5 cursor-pointer"><Switch checked={(evtForm as any)[k]} onCheckedChange={v=>setEvtForm({...evtForm,[k]:v})} className="scale-75"/><span className="text-zinc-300">{l}</span></label>)}</div>
                <Button className="bg-yellow-700 hover:bg-yellow-600 mt-1" onClick={logEvent} data-testid="button-log-event">Log Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">{events.total} events</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["Time","Severity","Event Type","User","IP","Network","Description","Status","Action"].map(h=><th key={h} className="text-left py-2 px-3 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{loading?<tr><td colSpan={9} className="py-8 text-center text-zinc-500">Loading...</td></tr>:
                events.items?.slice(0,100).map((ev:any)=>(
                  <tr key={ev.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30" data-testid={`row-event-${ev.id}`}>
                    <td className="py-2 px-3 text-zinc-500">{new Date(ev.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    <td className="py-2 px-3"><Badge className={`${SEV_BG[ev.severity]||"bg-zinc-600"} text-xs`}>{ev.severity}</Badge></td>
                    <td className="py-2 px-3 font-mono text-zinc-300 max-w-[150px] truncate">{ev.event_type}</td>
                    <td className="py-2 px-3 text-zinc-400 max-w-[100px] truncate">{ev.user_id||"–"}</td>
                    <td className="py-2 px-3 font-mono text-zinc-400">{ev.ip_address||"–"}</td>
                    <td className="py-2 px-3"><div className="flex gap-1">{ev.ip_is_vpn&&<Badge className="bg-orange-800 text-xs">VPN</Badge>}{ev.ip_is_tor&&<Badge className="bg-red-800 text-xs">Tor</Badge>}</div></td>
                    <td className="py-2 px-3 text-zinc-400 max-w-[200px] truncate">{ev.description}</td>
                    <td className="py-2 px-3 text-center">{ev.reviewed?<CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto"/>:<Clock className="w-4 h-4 text-yellow-500 mx-auto"/>}</td>
                    <td className="py-2 px-3 text-center">{!ev.reviewed&&<Button size="sm" variant="ghost" className="h-6 text-xs text-zinc-400" onClick={()=>reviewEvent(ev.id)} data-testid={`button-review-event-${ev.id}`}>✓</Button>}</td>
                  </tr>
                ))}
                {!loading&&events.items?.length===0&&<tr><td colSpan={9} className="py-6 text-center text-zinc-600">No events. Use "Log Event" to record activity.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 5: BLACKLIST INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════
  const renderBlacklist = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Ban className="w-6 h-6 text-red-400"/>Blacklist &amp; Block Intelligence</h2>
        <p className="text-zinc-400 text-xs">IP geofencing (CIDR support), 3-tier account bans, device fingerprint graph, velocity rules engine with 8 built-in rules.</p>
      </div>
      {/* Velocity Rules */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/>Velocity Rules Engine — Auto-Detection &amp; Action</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-zinc-800">{["Rule","Trigger","Auto Action","Sev","Active"].map(h=><th key={h} className="text-left py-2 px-2 text-zinc-300">{h}</th>)}</tr></thead>
                <tbody>{velocityRules.map((r:any)=>(
                  <tr key={r.id} className="border-b border-zinc-800/60">
                    <td className="py-1.5 px-2 text-zinc-300 font-semibold">{r.name}</td>
                    <td className="py-1.5 px-2 text-zinc-400 font-mono max-w-[140px] truncate">{r.trigger}</td>
                    <td className="py-1.5 px-2 text-blue-400">{r.action}</td>
                    <td className="py-1.5 px-2"><Badge className={`${SEV_BG[r.severity]} text-xs`}>{r.severity}</Badge></td>
                    <td className="py-1.5 px-2 text-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto"/></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader className="pb-2"><CardTitle className="text-xs">Velocity Rule Checker</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">User ID</Label><Input className="h-7 text-xs mt-1" value={velocityForm.user_id} onChange={e=>setVelocityForm({...velocityForm,user_id:e.target.value})} placeholder="user_ABC..."/></div>
                  <div><Label className="text-xs">Failed Logins (24h)</Label><Input type="number" className="h-7 text-xs mt-1" value={velocityForm.failed_logins_24h} onChange={e=>setVelocityForm({...velocityForm,failed_logins_24h:+e.target.value||0})}/></div>
                  <div><Label className="text-xs">Proposals/Hour</Label><Input type="number" className="h-7 text-xs mt-1" value={velocityForm.proposals_per_hour} onChange={e=>setVelocityForm({...velocityForm,proposals_per_hour:+e.target.value||0})}/></div>
                  <div><Label className="text-xs">Chargebacks</Label><Input type="number" className="h-7 text-xs mt-1" value={velocityForm.chargebacks} onChange={e=>setVelocityForm({...velocityForm,chargebacks:+e.target.value||0})}/></div>
                  <div><Label className="text-xs">Risk Score</Label><Input type="number" className="h-7 text-xs mt-1" value={velocityForm.risk_score} onChange={e=>setVelocityForm({...velocityForm,risk_score:+e.target.value||0})}/></div>
                  <div><Label className="text-xs">Unique Devices (30d)</Label><Input type="number" className="h-7 text-xs mt-1" value={velocityForm.unique_devices_30d} onChange={e=>setVelocityForm({...velocityForm,unique_devices_30d:+e.target.value||1})}/></div>
                </div>
                <div className="flex gap-3 text-xs">{[["vpn_detected","VPN"],["tor_detected","Tor"]].map(([k,l])=><label key={k} className="flex items-center gap-1.5 cursor-pointer"><Switch checked={(velocityForm as any)[k]} onCheckedChange={v=>setVelocityForm({...velocityForm,[k]:v})} className="scale-75"/><span className="text-zinc-300">{l}</span></label>)}</div>
                <Button className="bg-yellow-600 hover:bg-yellow-700 w-full h-7 text-xs" onClick={checkVelocity}><Zap className="w-3 h-3 mr-1"/>Check Rules</Button>
                {velocityResult&&(
                  <div className={`p-2 rounded border ${velocityResult.action_required?"border-red-700 bg-red-900/20":"border-emerald-700 bg-emerald-900/20"} text-xs`}>
                    <div className={`font-bold mb-1 ${velocityResult.action_required?"text-red-300":"text-emerald-300"}`}>
                      {velocityResult.action_required?"🚨 ACTION REQUIRED":"✅ No Rules Triggered"}
                    </div>
                    {velocityResult.rules_triggered?.map((r:any,i:number)=><div key={i} className="text-zinc-300">• <Badge className={SEV_BG[r.severity]}>{r.severity}</Badge> {r.rule} → {r.action}</div>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {/* IP + Account + Device */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-400 flex items-center gap-2"><Wifi className="w-4 h-4"/>IP Blacklist ({ipList.total||0})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><Label className="text-xs">IP / CIDR Range *</Label><Input className="h-7 text-xs mt-1 font-mono" value={ipForm.ip_address} onChange={e=>setIpForm({...ipForm,ip_address:e.target.value})} placeholder="1.2.3.4 or 1.2.0.0/16" data-testid="input-ip-address"/></div>
            <div><Label className="text-xs">Reason *</Label><Input className="h-7 text-xs mt-1" value={ipForm.reason} onChange={e=>setIpForm({...ipForm,reason:e.target.value})} placeholder="Brute force, Tor..."/></div>
            <div className="grid grid-cols-2 gap-1">
              <Select value={ipForm.severity} onValueChange={v=>setIpForm({...ipForm,severity:v})}><SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select>
              <Input type="number" className="h-7 text-xs" value={ipForm.expires_in_days} onChange={e=>setIpForm({...ipForm,expires_in_days:e.target.value})} placeholder="Days (blank=∞)"/>
            </div>
            <Button className="bg-red-700 hover:bg-red-600 w-full h-7 text-xs" onClick={blockIP} data-testid="button-block-ip"><Ban className="w-3.5 h-3.5 mr-1"/>Block IP/Range</Button>
            <div className="max-h-48 overflow-y-auto space-y-1">{ipList.items?.map((ip:any)=>(
              <div key={ip.id} className="flex items-center gap-2 py-1 border-b border-zinc-800/60" data-testid={`row-ip-${ip.id}`}>
                <span className="font-mono text-xs text-white flex-1">{ip.ip_address}</span>
                <Badge className={`${SEV_BG[ip.severity]} text-xs`}>{ip.severity}</Badge>
                <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs text-zinc-400 hover:text-emerald-400" onClick={()=>unblockIP(ip.ip_address)}>✓</Button>
              </div>
            ))}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-400 flex items-center gap-2"><UserX className="w-4 h-4"/>Account Bans ({acctList.total||0})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><Label className="text-xs">User ID *</Label><Input className="h-7 text-xs mt-1" value={acctForm.user_id} onChange={e=>setAcctForm({...acctForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-blacklist-user-id"/></div>
            <div><Label className="text-xs">Reason *</Label><Input className="h-7 text-xs mt-1" value={acctForm.reason} onChange={e=>setAcctForm({...acctForm,reason:e.target.value})}/></div>
            <Select value={acctForm.blacklist_type} onValueChange={v=>setAcctForm({...acctForm,blacklist_type:v})}><SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="soft">Soft Ban</SelectItem><SelectItem value="hard">Hard Ban</SelectItem><SelectItem value="shadow">Shadow Ban</SelectItem></SelectContent></Select>
            <Button className="bg-orange-700 hover:bg-orange-600 w-full h-7 text-xs" onClick={blacklistAcct} data-testid="button-blacklist-account"><UserX className="w-3.5 h-3.5 mr-1"/>Blacklist Account</Button>
            <div className="max-h-48 overflow-y-auto space-y-1">{acctList.items?.map((a:any)=>(
              <div key={a.id} className="flex items-center gap-2 py-1 border-b border-zinc-800/60" data-testid={`row-account-${a.id}`}>
                <span className="text-xs text-white font-mono flex-1 truncate">{a.user_id}</span>
                <Badge className={`${a.blacklist_type==="hard"?"bg-red-800":a.blacklist_type==="shadow"?"bg-purple-800":"bg-orange-800"} text-xs`}>{a.blacklist_type}</Badge>
                <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs text-zinc-400 hover:text-emerald-400" onClick={()=>unblacklistAcct(a.user_id)}>✓</Button>
              </div>
            ))}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-400 flex items-center gap-2"><Fingerprint className="w-4 h-4"/>Device Fingerprints ({devList.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><Label className="text-xs">Fingerprint Hash *</Label><Input className="h-7 text-xs mt-1 font-mono" value={devForm.fingerprint_hash} onChange={e=>setDevForm({...devForm,fingerprint_hash:e.target.value})} placeholder="a1b2c3d4..." data-testid="input-device-fingerprint"/></div>
            <div><Label className="text-xs">Reason</Label><Input className="h-7 text-xs mt-1" value={devForm.reason} onChange={e=>setDevForm({...devForm,reason:e.target.value})}/></div>
            <Button className="bg-purple-700 hover:bg-purple-600 w-full h-7 text-xs" onClick={blockDevice} data-testid="button-block-device"><Fingerprint className="w-3.5 h-3.5 mr-1"/>Block Device</Button>
            <div className="max-h-48 overflow-y-auto space-y-1">{devList.map((d:any)=>(
              <div key={d.id} className="py-1 border-b border-zinc-800/60" data-testid={`row-device-${d.id}`}><div className="font-mono text-xs text-zinc-300 truncate">{d.fingerprint_hash}</div>{d.reason&&<div className="text-xs text-zinc-600">{d.reason}</div>}</div>
            ))}{devList.length===0&&<div className="text-zinc-600 text-xs text-center py-3">No blocks yet</div>}</div>
          </CardContent>
        </Card>
      </div>
      {/* Ban Type Explainer */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">3-Tier Ban System — Only FreelanceSkills Has Shadow Banning</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {[{t:"Soft Ban",c:"border-orange-700 bg-orange-900/20",tc:"text-orange-300",desc:"Limited access: browse only. Cannot apply, propose, or receive payments. User aware. Best for first violations — encourages appeal."},
              {t:"Hard Ban",c:"border-red-700 bg-red-900/20",tc:"text-red-300",desc:"Full block + all gigs hidden + payouts frozen. Confirmed fraud, deepfake KYC, chargebacks > 3. Triggers Finance freeze + Marketing suppression + Abuse escalation."},
              {t:"Shadow Ban",c:"border-purple-700 bg-purple-900/20",tc:"text-purple-300",desc:"User appears active but proposals invisible to clients, gigs removed from search, messages not delivered. Prevents ban evasion — bad actors who re-register instantly find themselves invisible."}
            ].map((b,i)=>(
              <div key={i} className={`${b.c} border rounded p-3`}><div className={`${b.tc} font-bold mb-1`}>{b.t}</div><div className="text-zinc-300">{b.desc}</div><div className="mt-2 text-zinc-500 italic">{i===2?"Shadow banning: a FreelanceSkills innovation for the African market.":"Standard industry practice — we do it smarter."}</div></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 6: AFRICA HUB
  // ══════════════════════════════════════════════════════════════════════
  const renderAfrica = () => {
    const stats = africaStats;
    return (
      <div className="space-y-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-yellow-400"/>Africa-First Security Hub</h2>
          <p className="text-zinc-400 text-xs">USSD KYC (*120*KYC#), airtime micro-payment 2FA, mobile-money identity anchor, 6-country analytics, Africa fraud pattern detection. Reaching 800M Africans with feature phones.</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {/* USSD KYC Flow */}
          <Card className="bg-gradient-to-br from-yellow-900/20 to-zinc-900 border-yellow-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-yellow-300">USSD KYC Flow — *120*KYC#</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-4xl font-black text-yellow-300">*120*KYC#</div>
              <div className="space-y-1 text-xs">
                {[{s:1,p:"Enter your FreelanceSkills ID number"},{s:2,p:"Enter National ID / Passport number"},{s:3,p:"Enter last 4 digits of mobile money number"},{s:4,p:"Press 1 (R1 airtime deduction) or 2 (voice KYC)"},{s:5,p:"KYC submitted — SMS confirmation in 2 minutes"}].map(step=>(
                  <div key={step.s} className="flex items-start gap-2 p-2 bg-zinc-800/60 rounded">
                    <div className="w-5 h-5 rounded-full bg-yellow-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{step.s}</div>
                    <span className="text-zinc-300">{step.p}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-yellow-900/30 border border-yellow-800 rounded text-xs">
                <div className="text-yellow-300 font-semibold">Voice alternative: *120*KYC*VOICE#</div>
                <div className="text-zinc-400 mt-1">For non-literate users — say name aloud, system does voice biometric match</div>
              </div>
              <div className="text-xs text-zinc-400"><strong className="text-white">Networks:</strong> MTN · Vodacom · Cell C · Airtel · Telkom · Safaricom · Glo · 9mobile</div>
            </CardContent>
          </Card>
          {/* Airtime 2FA */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-zinc-900 border-orange-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-orange-300 flex items-center gap-2"><Phone className="w-4 h-4"/>Airtime Micro-Payment 2FA</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-zinc-300 p-2 bg-orange-900/20 border border-orange-800 rounded">
                <strong>How it works:</strong> User deducts R1 / ₦20 / KES10 from their mobile airtime. Since only the registered owner can initiate airtime deduction, this proves device possession — a unique Africa-first identity anchor unavailable anywhere else.
              </div>
              <div className="space-y-2">
                <div><Label className="text-xs">User ID *</Label><Input className="h-7 text-xs mt-1" value={airtimeForm.user_id} onChange={e=>setAirtimeForm({...airtimeForm,user_id:e.target.value})} placeholder="user_ABC..."/></div>
                <div><Label className="text-xs">Phone Number</Label><Input className="h-7 text-xs mt-1" value={airtimeForm.phone} onChange={e=>setAirtimeForm({...airtimeForm,phone:e.target.value})} placeholder="+27821234567"/></div>
                <Select value={airtimeForm.provider} onValueChange={v=>setAirtimeForm({...airtimeForm,provider:v})}><SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger><SelectContent>{["M-PESA","MTN MoMo","Airtel Money","Ozow","Vodapay","Chipper Cash"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                <Button className="bg-orange-600 hover:bg-orange-700 w-full h-7 text-xs" onClick={airtimeVerify} data-testid="button-airtime-verify"><Smartphone className="w-3.5 h-3.5 mr-1"/>Initiate Airtime 2FA</Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[["ZA","R1"],["NG","₦20"],["KE","KES10"]].map(([c,a])=>(
                  <div key={c} className="bg-zinc-800 rounded p-2 text-center"><div className="text-white font-bold">{a}</div><div className="text-zinc-500">{c}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Fraud Patterns */}
          <Card className="bg-gradient-to-br from-red-900/20 to-zinc-900 border-red-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-red-300">Africa Fraud Pattern Detection</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {(africaStats?.fraud_patterns||[{pattern:"SIM swap fraud",countries:["ZA","NG"],frequency:"high",detection:"carrier verification + velocity check"},{pattern:"Mobile money mule",countries:["NG","GH"],frequency:"medium",detection:"account age + transaction velocity"},{pattern:"USSD session hijack",countries:["KE","UG"],frequency:"low",detection:"session token + device fingerprint"},{pattern:"Airtime reseller abuse",countries:["ZA","NG","KE"],frequency:"medium",detection:"bulk purchase velocity + account linking"}]).map((fp:any,i:number)=>(
                <div key={i} className="p-2 bg-zinc-800 rounded border border-zinc-700">
                  <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-white">{fp.pattern}</span><Badge className={`${fp.frequency==="high"?"bg-red-800":fp.frequency==="medium"?"bg-orange-800":"bg-yellow-800"} text-xs`}>{fp.frequency}</Badge></div>
                  <div className="text-zinc-400">Countries: {fp.countries?.join(", ")}</div>
                  <div className="text-blue-400 mt-0.5">Detection: {fp.detection}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        {/* Country Stats */}
        {stats&&<Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">6-Country KYC Analytics — Africa Cohort</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-zinc-800">{["Country","KYC Submitted","KYC Approved","USSD Sessions","Mobile Money Verified","Airtime 2FA Used","Approval Rate"].map(h=><th key={h} className="text-left py-2 px-3 text-zinc-300">{h}</th>)}</tr></thead>
                <tbody>{stats.countries?.map((c:any)=>(
                  <tr key={c.code} className="border-b border-zinc-800/60">
                    <td className="py-2 px-3 font-semibold text-white">{c.flag||""} {c.name} ({c.code})</td>
                    <td className="py-2 px-3 text-zinc-300">{c.kyc_submitted}</td>
                    <td className="py-2 px-3 text-emerald-400">{c.kyc_approved}</td>
                    <td className="py-2 px-3 text-yellow-400">{c.ussd_sessions}</td>
                    <td className="py-2 px-3 text-blue-400">{c.mobile_money_verified}</td>
                    <td className="py-2 px-3 text-orange-400">{c.airtime_2fa_used}</td>
                    <td className="py-2 px-3"><span className="font-bold text-emerald-400">{c.kyc_submitted?Math.round(c.kyc_approved/c.kyc_submitted*100):0}%</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.countries||[]} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                <XAxis dataKey="code" tick={{fill:"#a1a1aa",fontSize:11}}/>
                <YAxis tick={{fill:"#a1a1aa",fontSize:11}}/>
                <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="kyc_submitted" name="KYC Submitted" fill="#3b82f6" radius={[3,3,0,0]}/>
                <Bar dataKey="kyc_approved" name="Approved" fill="#10b981" radius={[3,3,0,0]}/>
                <Bar dataKey="ussd_sessions" name="USSD Sessions" fill="#eab308" radius={[3,3,0,0]}/>
                <Bar dataKey="airtime_2fa_used" name="Airtime 2FA" fill="#f97316" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TAB 7: ANALYTICS
  // ══════════════════════════════════════════════════════════════════════
  const renderAnalytics = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-400"/>Analytics &amp; Threat Forecasting</h2>
        <p className="text-zinc-400 text-xs">30-day risk trends, geography attack map, fraud prevention metrics, 14-day AI threat forecasting with confidence intervals.</p>
      </div>
      {/* KPI Cards */}
      {fraudMetrics&&<div className="grid grid-cols-5 gap-3">
        {[
          {l:"Events (30d)",v:Number(fraudMetrics.events_30d?.total||0),c:"text-zinc-200",b:"border-zinc-700"},
          {l:"Critical Events",v:Number(fraudMetrics.events_30d?.critical||0),c:"text-red-400",b:"border-red-800"},
          {l:"Blocked IPs",v:Number(fraudMetrics.blocked?.ips||0),c:"text-orange-400",b:"border-orange-800"},
          {l:"Quarantined",v:Number(fraudMetrics.quarantined||0),c:"text-yellow-400",b:"border-yellow-800"},
          {l:"ZAR Fraud Prevented",v:`R${Number(fraudMetrics.estimated_fraud_prevented_zar||0).toLocaleString()}`,c:"text-emerald-400",b:"border-emerald-800"},
        ].map((k,i)=>(
          <Card key={i} className={`bg-zinc-900 border ${k.b}`}><CardContent className="p-4 text-center"><div className={`text-xl font-bold ${k.c}`}>{k.v}</div><div className="text-xs text-zinc-400 mt-1">{k.l}</div></CardContent></Card>
        ))}
      </div>}
      {/* 30-Day Trend */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">30-Day Risk Trend — Events + Critical + Fraud Prevented</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={trendData} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
              <XAxis dataKey="date" tick={{fill:"#a1a1aa",fontSize:10}} tickFormatter={v=>v.slice(5)}/>
              <YAxis yAxisId="left" tick={{fill:"#a1a1aa",fontSize:10}}/>
              <YAxis yAxisId="right" orientation="right" tick={{fill:"#a1a1aa",fontSize:10}}/>
              <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}} labelFormatter={v=>v}/>
              <Legend wrapperStyle={{fontSize:10}}/>
              <Area yAxisId="left" type="monotone" dataKey="events" name="Events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2}/>
              <Line yAxisId="left" type="monotone" dataKey="critical_users" name="Critical Users" stroke="#ef4444" strokeWidth={2} dot={false}/>
              <Line yAxisId="left" type="monotone" dataKey="fraud_prevented" name="Fraud Prevented" stroke="#10b981" strokeWidth={2} dot={false}/>
              <Bar yAxisId="right" dataKey="avg_risk_score" name="Avg Risk Score" fill="#8b5cf6" opacity={0.6} radius={[2,2,0,0]}/>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Geography + Forecast */}
      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Geography Attack Map — Events by Country</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {geoData.slice(0,15).map((g:any,i)=>{
                const maxEvents=geoData[0]?.events||1;
                const pct=Math.round(g.events/maxEvents*100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-4">{g.country}</span>
                    <span className="text-xs text-zinc-300 w-28 truncate">{g.country_name}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-4 relative overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${pct}%`,backgroundColor:g.risk_level==="critical"?R.critical:g.risk_level==="high"?R.high:g.risk_level==="medium"?R.medium:R.low}}/>
                    </div>
                    <span className="text-xs text-zinc-300 w-8 text-right">{g.events}</span>
                    <Badge className={`${g.risk_level==="critical"?"bg-red-800":g.risk_level==="high"?"bg-orange-800":g.risk_level==="medium"?"bg-yellow-800":"bg-emerald-800"} text-xs w-16 justify-center`}>{g.risk_level}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">14-Day AI Threat Forecast (ARIMA+Trend+Seasonality)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={forecast?.forecast||[]} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                <XAxis dataKey="date" tick={{fill:"#a1a1aa",fontSize:9}} tickFormatter={v=>v.slice(5)}/>
                <YAxis tick={{fill:"#a1a1aa",fontSize:10}}/>
                <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46"}}/>
                <Legend wrapperStyle={{fontSize:10}}/>
                <Area type="monotone" dataKey="confidence_upper" name="Upper CI" stroke="transparent" fill="#ef4444" fillOpacity={0.1}/>
                <Area type="monotone" dataKey="confidence_lower" name="Lower CI" stroke="transparent" fill="#27272a" fillOpacity={1}/>
                <Line type="monotone" dataKey="predicted_events" name="Predicted Events" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5"/>
                <Line type="monotone" dataKey="predicted_critical" name="Predicted Critical" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3"/>
                <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label={{value:"Alert threshold",fill:"#ef4444",fontSize:9}}/>
              </ComposedChart>
            </ResponsiveContainer>
            {forecast&&<div className="flex items-center gap-3 mt-2 text-xs text-zinc-500"><span>Model: {forecast.model}</span><span>Confidence: {forecast.confidence}%</span></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 8: INTEGRATIONS
  // ══════════════════════════════════════════════════════════════════════
  const renderIntegrations = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Link className="w-6 h-6 text-blue-400"/>Integration Hooks — 10 Departments Wired</h2>
        <p className="text-zinc-400 text-xs">Security events automatically cascade to every department. Pause promotions on high risk. Freeze payouts on fraud. Exclude from marketing. Trigger Academy re-certification. No competitor has this cross-department security mesh.</p>
      </div>
      {/* Department Status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["Department","Events Handled","Hook Endpoint","Last Fired","Status"].map(h=><th key={h} className="text-left py-2.5 px-4 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{(integrations?.departments||[]).map((d:any)=>(
                <tr key={d.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-3 px-4 font-semibold text-white">{d.name}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">{d.events?.map((e:string,i:number)=><div key={i} className="text-zinc-400">{e}</div>)}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-400">{d.hook}</td>
                  <td className="py-3 px-4 text-zinc-500">{d.last_fired?new Date(d.last_fired).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"Never"}</td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-800 text-xs">✓ {d.status}</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Fire Hook + Hook Log */}
      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border-blue-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-blue-300">Fire Integration Hook — Manual Trigger</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Department</Label>
              <Select value={hookForm.department} onValueChange={v=>setHookForm({...hookForm,department:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{["promotions","subscriptions","notifications","abuse","moderation","categories","academy","finance","marketing","support"].map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Event Type</Label>
              <Select value={hookForm.event_type} onValueChange={v=>setHookForm({...hookForm,event_type:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{["high_risk_detected","fraud_confirmed","deepfake_detected","quarantine_applied","kyc_approved","kyc_rejected","account_blacklisted","ip_blocked","risk_drop_resolved","reverification_required"].map(e=><SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">User ID (optional)</Label><Input className="h-8 text-sm mt-1" value={hookForm.user_id} onChange={e=>setHookForm({...hookForm,user_id:e.target.value})} placeholder="user_ABC..."/></div>
            <div><Label className="text-xs">Severity</Label>
              <Select value={hookForm.severity} onValueChange={v=>setHookForm({...hookForm,severity:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-sm" onClick={fireHook} data-testid="button-fire-hook"><Zap className="w-4 h-4 mr-1"/>Fire Integration Hook</Button>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Hook Fire Log (This Session)</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {hookLog.length===0?<div className="text-zinc-600 text-xs text-center py-6">No hooks fired yet this session</div>:hookLog.map((h,i)=>(
                <div key={i} className="p-2 bg-zinc-800 rounded border border-zinc-700 text-xs">
                  <div className="flex items-center gap-2 mb-1"><Badge className="bg-blue-800 text-xs">{h.department}</Badge><span className="text-zinc-400">{h.event_type}</span><span className="text-zinc-600 ml-auto">{h.timestamp?new Date(h.timestamp).toLocaleTimeString():""}</span></div>
                  {h.user_id&&<div className="text-zinc-400">User: {h.user_id}</div>}
                  <div className="text-emerald-400 text-xs mt-0.5">{h.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Integration Map */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Security Event → Department Action Map</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["Security Event","Promotions","Subscriptions","Finance","Notifications","Abuse","Moderation","Marketing","Academy"].map(h=><th key={h} className="text-left py-2 px-2 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{[
                {event:"High Risk (>70)",p:"⏸ Pause promos",s:"⬇ Limit features",f:"⚠ Flag payouts",n:"📱 SMS alert",ab:"–",m:"👁 Flag content",mk:"🚫 Exclude",ac:"📚 Suggest course"},
                {event:"Fraud Confirmed",p:"🚫 Kill all promos",s:"❄ Freeze account",f:"🔒 Freeze payouts",n:"📱 + Email alert",ab:"📋 Auto-file",m:"🚫 Hide all content",mk:"🚫 Suppress all",ac:"📚 Rehab path"},
                {event:"Deepfake KYC",p:"⏸ Pause promos",s:"⬇ Downgrade plan",f:"⚠ Flag payouts",n:"📱 Notify user",ab:"📋 Escalate",m:"👁 Flag gigs",mk:"🚫 Exclude",ac:"📚 Re-verify path"},
                {event:"Auto-Quarantine",p:"⏸ Pause all",s:"❄ Billing pause",f:"🔒 Hold withdrawals",n:"📱 + Push",ab:"📋 Open case",m:"🚫 Quarantine gigs",mk:"🚫 Remove cohort",ac:"📚 Mandatory course"},
                {event:"KYC Approved",p:"✅ Re-enable",s:"⬆ Unlock features",f:"✅ Resume payouts",n:"✅ Welcome msg",ab:"–",m:"✅ Re-activate",mk:"✅ Add trusted cohort",ac:"✅ Unlock premium"},
              ].map((row,i)=>(
                <tr key={i} className="border-b border-zinc-800/60 text-xs">
                  <td className="py-2 px-2 font-semibold text-white">{row.event}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.p}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.s}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.f}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.n}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.ab}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.m}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.mk}</td>
                  <td className="py-2 px-2 text-zinc-400">{row.ac}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 9: ALERTS CENTER
  // ══════════════════════════════════════════════════════════════════════
  const renderAlerts = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="w-6 h-6 text-yellow-400"/>Alerts Center — Real-Time Security Feed</h2>
          <p className="text-zinc-400 text-xs">Live Socket.io alert feed, 8-rule auto-detection engine, alert queue, immutable audit trail.</p>
        </div>
        <div className="flex gap-2">
          <Select value={alertStatus} onValueChange={setAlertStatus}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select>
          <Button className="bg-zinc-700 hover:bg-zinc-600 h-8 text-sm" onClick={testBroadcast} data-testid="button-test-alert"><Play className="w-3.5 h-3.5 mr-1"/>Test Broadcast</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {/* Live Socket Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"/><CardTitle className="text-sm">Live Socket.io Feed</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-1.5">
              {liveAlerts.length===0?<div className="text-zinc-500 text-sm text-center py-8">Awaiting live alerts... (demo: alerts appear ~7s intervals)</div>:liveAlerts.map((a,i)=>(
                <div key={a.id||i} className={`p-2.5 rounded border ${a.severity==="critical"?"bg-red-900/20 border-red-800":a.severity==="high"?"bg-orange-900/20 border-orange-800":a.severity==="info"?"bg-blue-900/20 border-blue-800":"bg-zinc-800 border-zinc-700"}`}>
                  <div className="flex items-center gap-2"><Badge className={`${SEV_BG[a.severity]||"bg-zinc-600"} text-xs`}>{a.severity||"info"}</Badge><span className="text-xs font-mono text-zinc-400">{a.type}</span><span className="text-xs text-zinc-600 ml-auto">{a.timestamp?new Date(a.timestamp).toLocaleTimeString():""}</span></div>
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
              {loading?<div className="text-zinc-500 text-xs">Loading...</div>:alertList.items?.slice(0,15).map((a:any)=>(
                <div key={a.id} className={`p-3 rounded border ${a.severity==="critical"?"bg-red-900/20 border-red-800":a.severity==="high"?"bg-orange-900/20 border-orange-800":"bg-zinc-800 border-zinc-700"}`} data-testid={`row-alert-${a.id}`}>
                  <div className="flex items-center gap-2 mb-1"><Badge className={`${SEV_BG[a.severity]||"bg-zinc-600"} text-xs`}>{a.severity}</Badge><span className="text-xs font-semibold text-white flex-1 truncate">{a.title}</span><span className="text-xs text-zinc-600">{new Date(a.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span></div>
                  <div className="text-xs text-zinc-400 mb-1">{a.description}</div>
                  {a.auto_action_taken&&<Badge className="bg-zinc-700 text-xs">Auto: {a.auto_action_taken}</Badge>}
                  {a.status==="open"&&<Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 h-6 text-xs mt-2 ml-2" onClick={()=>resolveAlert(a.id)} data-testid={`button-resolve-alert-${a.id}`}>Resolve</Button>}
                </div>
              ))}
              {!loading&&(alertList.items||[]).length===0&&<div className="text-zinc-600 text-sm text-center py-6">No {alertStatus} alerts</div>}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Rule Engine */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Rule Engine — 8 Active Auto-Detection Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["Rule","Trigger Condition","Automatic Action","Severity","Department Hooks","Active"].map(h=><th key={h} className="text-left py-2 px-3 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{[
                {rule:"Brute Force",trigger:"Failed logins > 10 in 24h",action:"Auto-quarantine 72h + alert",sev:"critical",hooks:"Notifications + Finance"},
                {rule:"Deepfake KYC",trigger:"Deepfake probability > 50%",action:"Flag KYC + abuse escalation",sev:"critical",hooks:"Abuse + Moderation"},
                {rule:"Impossible Travel",trigger:"Country changes > 3 in 7d",action:"Flag for review + user notify",sev:"high",hooks:"Notifications"},
                {rule:"Tor Node Login",trigger:"Tor exit node detected",action:"Log event + alert team",sev:"high",hooks:"Notifications"},
                {rule:"Proposal Spam",trigger:"Proposals > 20/hour",action:"Soft quarantine + event log",sev:"high",hooks:"Moderation"},
                {rule:"Chargeback Storm",trigger:"Chargebacks > 2",action:"Payment suspension + review",sev:"critical",hooks:"Finance + Abuse"},
                {rule:"VPN + High Risk",trigger:"VPN detected + score > 70",action:"Enhanced monitoring + KYC",sev:"medium",hooks:"Notifications"},
                {rule:"AI Auto-Quarantine",trigger:"AI risk score > 80",action:"Full quarantine + critical alert",sev:"critical",hooks:"Finance + Subscriptions + Promotions"},
              ].map((r,i)=>(
                <tr key={i} className="border-b border-zinc-800/60">
                  <td className="py-2 px-3 text-zinc-300 font-semibold">{r.rule}</td>
                  <td className="py-2 px-3 text-zinc-400 font-mono">{r.trigger}</td>
                  <td className="py-2 px-3 text-blue-400">{r.action}</td>
                  <td className="py-2 px-3"><Badge className={`${SEV_BG[r.sev]} text-xs`}>{r.sev}</Badge></td>
                  <td className="py-2 px-3 text-zinc-500">{r.hooks}</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto"/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // TAB 10: ZERO-TRUST
  // ══════════════════════════════════════════════════════════════════════
  const renderZeroTrust = () => (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock className="w-6 h-6 text-emerald-400"/>Zero-Trust Architecture — Every Action Re-Verified</h2>
        <p className="text-zinc-400 text-xs">2FA enforcement (5 methods: TOTP/SMS/USSD/Voice/Airtime), mandatory re-verification, immutable admin audit trail. No action is trusted by default — including admin actions.</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {/* 2FA Enforcement */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border-emerald-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-emerald-300 flex items-center gap-2"><Key className="w-4 h-4"/>2FA Enforcement</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">User ID *</Label><Input className="h-7 text-sm mt-1" value={tfa2faForm.user_id} onChange={e=>setTfa2faForm({...tfa2faForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-2fa-user-id"/></div>
            <div><Label className="text-xs">Method</Label>
              <Select value={tfa2faForm.method} onValueChange={v=>setTfa2faForm({...tfa2faForm,method:v})}>
                <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="totp">TOTP (Google Authenticator)</SelectItem><SelectItem value="sms">SMS Code</SelectItem><SelectItem value="ussd">USSD (*120*2FA#)</SelectItem><SelectItem value="voice">Voice Challenge</SelectItem><SelectItem value="airtime">Airtime Micro-Payment</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Reason</Label><Input className="h-7 text-xs mt-1" value={tfa2faForm.reason} onChange={e=>setTfa2faForm({...tfa2faForm,reason:e.target.value})}/></div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full h-7 text-xs" onClick={enforce2FA} data-testid="button-enforce-2fa"><Key className="w-3.5 h-3.5 mr-1"/>Enforce 2FA</Button>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {tfa2fa.slice(0,10).map((t:any,i)=>(
                <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-800/60 text-xs">
                  <span className="font-mono text-zinc-300 flex-1 truncate">{t.user_id}</span>
                  <Badge className="bg-zinc-700 text-xs">{t.method}</Badge>
                </div>
              ))}
              {tfa2fa.length===0&&<div className="text-zinc-600 text-xs text-center py-2">No 2FA enrollments</div>}
            </div>
          </CardContent>
        </Card>
        {/* Re-Verification */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border-blue-900/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-blue-300 flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Zero-Trust Re-Verification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-zinc-300 p-2 bg-blue-900/20 border border-blue-800 rounded">
              <strong>Zero-Trust Principle:</strong> Trust is never permanent. Any user can be required to re-verify at any time — on account takeover suspicion, periodic audit, or risk score elevation.
            </div>
            <div><Label className="text-xs">User ID *</Label><Input className="h-7 text-sm mt-1" value={reverifyForm.user_id} onChange={e=>setReverifyForm({...reverifyForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-reverify-user-id"/></div>
            <div><Label className="text-xs">Reason</Label><Input className="h-7 text-xs mt-1" value={reverifyForm.reason} onChange={e=>setReverifyForm({...reverifyForm,reason:e.target.value})}/></div>
            <div><Label className="text-xs">Required Level</Label>
              <Select value={reverifyForm.required_level} onValueChange={v=>setReverifyForm({...reverifyForm,required_level:v})}>
                <SelectTrigger className="h-7 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="basic">Basic (selfie)</SelectItem><SelectItem value="standard">Standard (ID + selfie)</SelectItem><SelectItem value="enhanced">Enhanced (video liveness)</SelectItem><SelectItem value="premium">Premium (all + voice)</SelectItem></SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-7 text-xs" onClick={triggerReverify} data-testid="button-reverify"><RefreshCw className="w-3.5 h-3.5 mr-1"/>Trigger Re-Verification</Button>
            <div className="text-xs p-2 bg-zinc-800 rounded space-y-1">
              <div className="text-zinc-300 font-semibold">What happens:</div>
              <div className="text-zinc-500">1. KYC record reset to &quot;pending&quot; status</div>
              <div className="text-zinc-500">2. Security event logged + admin audit</div>
              <div className="text-zinc-500">3. User notified via Notification Department</div>
              <div className="text-zinc-500">4. Academy re-certification path offered</div>
              <div className="text-zinc-500">5. Access restricted until re-verified</div>
            </div>
          </CardContent>
        </Card>
        {/* Zero-Trust Architecture */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Zero-Trust Principles</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            {[
              {p:"Never Trust",d:"No user, device, or IP is trusted by default — not even verified ones. Trust is re-earned on every session.",c:"text-red-300"},
              {p:"Always Verify",d:"Every admin action requires authentication. Every API call is logged. Every sensitive action triggers a re-verify check.",c:"text-orange-300"},
              {p:"Least Privilege",d:"Users can only access what their verification level permits. High-trust features require enhanced KYC.",c:"text-yellow-300"},
              {p:"Assume Breach",d:"System assumes every account may be compromised. Behavioral biometrics detect session drift in real-time.",c:"text-blue-300"},
              {p:"Immutable Audit",d:"Every admin action is written to a tamper-proof audit log. Deletions are soft (is_active=FALSE). Nothing is purged.",c:"text-emerald-300"},
            ].map((zp,i)=>(
              <div key={i} className="p-2 bg-zinc-800 rounded"><div className={`font-bold ${zp.c}`}>{zp.p}</div><div className="text-zinc-400 mt-0.5">{zp.d}</div></div>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Full Audit Log */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Immutable Admin Audit Log — Every Action Tracked</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">{["Time","Admin","Action","Target Type","Target ID","Details"].map(h=><th key={h} className="text-left py-2 px-3 text-zinc-300">{h}</th>)}</tr></thead>
              <tbody>{loading?<tr><td colSpan={6} className="py-4 text-center text-zinc-500">Loading...</td></tr>:
                (audit.items||[]).slice(0,30).map((a:any)=>(
                  <tr key={a.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-500">{new Date(a.created_at).toLocaleString("en-ZA",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    <td className="py-2 px-3 font-mono text-zinc-400 max-w-[120px] truncate">{a.admin_user_id}</td>
                    <td className="py-2 px-3"><Badge className="bg-zinc-700 text-xs">{a.action}</Badge></td>
                    <td className="py-2 px-3 text-zinc-400">{a.target_type||"–"}</td>
                    <td className="py-2 px-3 font-mono text-zinc-400 max-w-[120px] truncate">{a.target_id||"–"}</td>
                    <td className="py-2 px-3 text-zinc-500 max-w-[200px] truncate">{a.details||"–"}</td>
                  </tr>
                ))}
                {!loading&&(audit.items||[]).length===0&&<tr><td colSpan={6} className="py-4 text-center text-zinc-600">No audit entries yet. Use any admin action to populate.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5">
      <div className="max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <ShieldCheck className="w-10 h-10 text-red-400 flex-shrink-0"/>
            <h1 className="text-3xl font-bold text-white">Security &amp; Trust Department v2.0</h1>
            <Badge className="bg-red-700 text-sm">200% INTELLIGENCE</Badge>
            <Badge className="bg-purple-700">ZERO-TRUST</Badge>
            <Badge className="bg-blue-700">AFRICA-FIRST</Badge>
            <Badge className="bg-zinc-700">OBLITERATES ALL COMPETITORS</Badge>
          </div>
          <p className="text-zinc-400 text-sm">10 tabs · 50+ superpowers · The unbreakable heart of FreelanceSkills.net — Africa-first security until 2029</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Perpetual AI Risk Engine","7-Dimension Scoring","Behavioral Biometrics","Keystroke/Mouse Analysis","Deepfake Vault (5-Signal)","Liveness Detection","Predictive Quarantine","USSD KYC *120*KYC#","Airtime 2FA","Mobile Money Anchor","Geofencing (CIDR)","Shadow Banning","Velocity Rules (8)","15 Event Types","Socket.io Live Alerts","10-Dept Integration Hooks","14-Day Threat Forecast","30-Day Risk Trends","Geography Heatmap","Immutable Audit Log","2FA (TOTP/SMS/USSD/Voice/Airtime)","Zero-Trust Re-Verify","6-Country Africa Analytics"].map(s=>(
              <Badge key={s} variant="outline" className="text-zinc-400 border-zinc-600 text-xs">{s}</Badge>
            ))}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1 flex-wrap">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${tab===t.id?"bg-red-700 text-white shadow-lg shadow-red-700/40":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}
              data-testid={`tab-security-${t.id}`}
            >{t.label}</button>
          ))}
        </div>
        {/* Content */}
        <div>
          {tab==="dashboard"    && renderDashboard()}
          {tab==="ai"           && renderAI()}
          {tab==="kyc"          && renderKYC()}
          {tab==="events"       && renderEvents()}
          {tab==="blacklist"    && renderBlacklist()}
          {tab==="africa"       && renderAfrica()}
          {tab==="analytics"    && renderAnalytics()}
          {tab==="integrations" && renderIntegrations()}
          {tab==="alerts"       && renderAlerts()}
          {tab==="zerotrust"    && renderZeroTrust()}
        </div>
      </div>
    </div>
  );
}
