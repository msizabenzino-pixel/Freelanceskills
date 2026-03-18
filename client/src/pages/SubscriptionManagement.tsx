/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUBSCRIPTION MANAGEMENT v4.0 — ELON MUSK 200% INTELLIGENCE FULL UPGRADE    ║
 * ║  Revenue & loyalty backbone obliterating Upwork Plus, Fiverr Pro/Business,  ║
 * ║  Patreon, Substack, LinkedIn Premium until 2029                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 10-tab architecture covering all upgrade requirements:
 *  Tab 1  — 💎 Plans           (CRUD, dynamic pricing, grace period config)
 *  Tab 2  — 👥 Subscriptions   (Sortable by LTV/churn/cohort, metered usage)
 *  Tab 3  — 🤖 Agentic AI      (15-signal recommender, auto-upgrade, ROI calc)
 *  Tab 4  — ⚠️ Churn AI        (9-signal predictor, dynamic pricing, intervention)
 *  Tab 5  — 🔀 Hybrid Billing  (Metered overages, invoice builder, usage tracker)
 *  Tab 6  — 🏢 Agency Suite    (Sub-accounts, roles, invoice splitting, white-label)
 *  Tab 7  — 🎁 Skill Tokens    (8 earn actions, 12 redemption perks, leaderboard)
 *  Tab 8  — 📊 Cohort Analytics(MRR/ARR, LTV heatmap, 36-month forecast, plan perf)
 *  Tab 9  — 🌍 Africa Hub      (USSD, mobile money, grace periods, airtime)
 *  Tab 10 — 🔗 Integrations    (10 system hooks, real-time event log)
 */

import { useState, useEffect } from "react";
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
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Crown, TrendingUp, AlertTriangle, DollarSign, Users, Target, Zap,
  Globe, Gift, Brain, ArrowUp, CheckCircle2, XCircle, CreditCard,
  Smartphone, Star, Trophy, Shield, Percent, Calendar, Settings,
  ChevronUp, ChevronDown, Sparkles, Rocket, Heart, Building2,
  Link, Coins, BarChart3, Layers, Activity, RefreshCw, Play,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "plans",         label: "💎 Plans",          icon: Crown },
  { id: "subscriptions", label: "👥 Subscriptions",  icon: Users },
  { id: "ai",            label: "🤖 Agentic AI",     icon: Brain },
  { id: "churn",         label: "⚠️ Churn AI",       icon: AlertTriangle },
  { id: "billing",       label: "🔀 Hybrid Billing", icon: CreditCard },
  { id: "agency",        label: "🏢 Agency Suite",   icon: Building2 },
  { id: "loyalty",       label: "🎁 Skill Tokens",   icon: Coins },
  { id: "analytics",     label: "📊 Cohort Analytics", icon: BarChart3 },
  { id: "africa",        label: "🌍 Africa Hub",     icon: Globe },
  { id: "integrations",  label: "🔗 Integrations",   icon: Link },
];

const COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316"];

const RISK_CLASS = (score: number) =>
  score > 70 ? "bg-red-600" : score > 50 ? "bg-orange-500" : score > 30 ? "bg-yellow-600" : "bg-emerald-600";

const ZAR = (cents: number) => `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans,          setPlans]          = useState<any[]>([]);
  const [subscriptions,  setSubscriptions]  = useState<any>({ items: [], total: 0 });
  const [churnPreds,     setChurnPreds]     = useState<any[]>([]);
  const [billingEvents,  setBillingEvents]  = useState<any>({ items: [], total: 0 });
  const [analytics,      setAnalytics]      = useState<any>(null);
  const [ussdMenu,       setUssdMenu]       = useState<any>(null);
  const [agencyTeams,    setAgencyTeams]    = useState<any[]>([]);
  const [aiResult,       setAiResult]       = useState<any>(null);
  const [hookLog,        setHookLog]        = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [sortField,      setSortField]      = useState("display_order");
  const [sortDir,        setSortDir]        = useState<"asc"|"desc">("asc");
  const [subSortField,   setSubSortField]   = useState("created_at");
  const [subSortDir,     setSubSortDir]     = useState<"asc"|"desc">("desc");
  const [subStatusFilter,setSubStatusFilter]= useState("all");
  const [churnFilter,    setChurnFilter]    = useState("0");
  const [meterForm,      setMeterForm]      = useState({ proposals_sent:"", proposal_limit:"", overage_proposal_cents:"" });
  const [meterResult,    setMeterResult]    = useState<any>(null);
  const [agencyForm,     setAgencyForm]     = useState({ owner_user_id:"", member_user_id:"", role:"member", plan_id:"" });
  const [hookForm,       setHookForm]       = useState({ event_type:"upgrade", user_id:"", from_plan:"", to_plan:"" });

  // Plan create form
  const [cpOpen, setCpOpen] = useState(false);
  const [pf, setPf] = useState({
    name:"", slug:"", description:"", price_monthly_cents:"", price_annual_cents:"",
    price_weekly_cents:"", price_daily_cents:"", trial_days:"0",
    proposal_limit_monthly:"", gig_slots:"5", team_size:"1",
    withdrawal_speed:"standard", support_level:"standard",
    white_label_enabled:false, sub_accounts_enabled:false,
    featured_gig_priority:false, search_boost_multiplier:"1.0",
    profile_badge:"", overage_proposal_cents:"", recommended:false,
  });

  // Subscription create form
  const [csOpen, setCsOpen] = useState(false);
  const [sf, setSf] = useState({ user_id:"", plan_id:"", billing_cycle:"monthly", trial_days:"0" });

  // ──────────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => { loadTab(); }, [activeTab, sortField, sortDir, subStatusFilter, subSortField, subSortDir, churnFilter]);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (activeTab === "plans") {
        const r = await fetch(`/api/subscriptions/plans?sort=${sortField}&dir=${sortDir}`);
        setPlans(await r.json());
      } else if (activeTab === "subscriptions") {
        const r = await fetch(`/api/subscriptions/users?status=${subStatusFilter}&sort=${subSortField}&dir=${subSortDir}&min_churn=${churnFilter}&limit=50`);
        setSubscriptions(await r.json());
      } else if (activeTab === "churn") {
        const r = await fetch(`/api/subscriptions/churn?risk_threshold=${churnFilter}&sort=churn_risk_score&dir=desc`);
        setChurnPreds(await r.json());
      } else if (activeTab === "billing") {
        const r = await fetch("/api/subscriptions/billing/events?page=1&limit=100");
        setBillingEvents(await r.json());
      } else if (activeTab === "analytics") {
        const r = await fetch("/api/subscriptions/analytics/dashboard");
        setAnalytics(await r.json());
      } else if (activeTab === "africa") {
        const r = await fetch("/api/subscriptions/africa/ussd-menu");
        setUssdMenu(await r.json());
      } else if (activeTab === "agency") {
        const r = await fetch("/api/subscriptions/agency/teams");
        setAgencyTeams(await r.json());
      }
    } catch (e: any) { console.error(e); }
    setLoading(false);
  };

  const togglePlanSort = (f: string) => { if (sortField===f) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortField(f); setSortDir("asc"); }};
  const toggleSubSort  = (f: string) => { if (subSortField===f) setSubSortDir(d=>d==="asc"?"desc":"asc"); else { setSubSortField(f); setSubSortDir("desc"); }};
  const SortArrow = ({ field, active }: { field:string; active:string }) => {
    if (active !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="inline w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="inline w-3.5 h-3.5 ml-0.5" />;
  };
  const SubSortArrow = ({ field }: { field:string }) => {
    if (subSortField !== field) return null;
    return subSortDir === "asc" ? <ChevronUp className="inline w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="inline w-3.5 h-3.5 ml-0.5" />;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────────
  const createPlan = async () => {
    if (!pf.name||!pf.slug||!pf.price_monthly_cents) return alert("name, slug, monthly price required");
    const res = await fetch("/api/subscriptions/plans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...pf,price_monthly_cents:parseInt(pf.price_monthly_cents),price_annual_cents:pf.price_annual_cents?parseInt(pf.price_annual_cents):null,price_weekly_cents:pf.price_weekly_cents?parseInt(pf.price_weekly_cents):null,price_daily_cents:pf.price_daily_cents?parseInt(pf.price_daily_cents):null,trial_days:parseInt(pf.trial_days),proposal_limit_monthly:pf.proposal_limit_monthly?parseInt(pf.proposal_limit_monthly):null,gig_slots:parseInt(pf.gig_slots),team_size:parseInt(pf.team_size),search_boost_multiplier:parseFloat(pf.search_boost_multiplier),overage_proposal_cents:pf.overage_proposal_cents?parseInt(pf.overage_proposal_cents):null})});
    if (res.ok) { setCpOpen(false); loadTab(); } else { const e=await res.json(); alert(e.message); }
  };

  const createSub = async () => {
    if (!sf.user_id||!sf.plan_id) return alert("user_id and plan_id required");
    const res = await fetch("/api/subscriptions/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...sf,plan_id:parseInt(sf.plan_id),trial_days:parseInt(sf.trial_days)})});
    if (res.ok) { setCsOpen(false); loadTab(); } else { const e=await res.json(); alert(e.message); }
  };

  const cancelSub = async (id: number) => {
    if (!confirm("Cancel this subscription?")) return;
    const res = await fetch(`/api/subscriptions/users/${id}/cancel`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:"Admin cancelled"})});
    if (res.ok) { const d=await res.json(); alert(`Cancelled. Grace period: ${d.grace_period?.grace_period_days} days\n${d.grace_period?.offer_shown}`); loadTab(); }
  };

  const applyIntervention = async (predId: number, type: string, discount_pct?: number) => {
    const res = await fetch(`/api/subscriptions/churn/${predId}/intervene`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({intervention_type:type,discount_pct})});
    if (res.ok) { alert(`✅ Intervention '${type}' applied`); loadTab(); }
  };

  const getAiRecommend = async (userId: string) => {
    const res = await fetch("/api/subscriptions/ai/recommend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:userId})});
    if (res.ok) setAiResult(await res.json());
  };

  const calcOverage = async () => {
    const res = await fetch("/api/subscriptions/billing/calculate-overage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({proposals_sent:parseInt(meterForm.proposals_sent)||0,proposal_limit:parseInt(meterForm.proposal_limit)||10,overage_proposal_cents:parseInt(meterForm.overage_proposal_cents)||200})});
    if (res.ok) setMeterResult(await res.json());
  };

  const addAgencyMember = async () => {
    if (!agencyForm.owner_user_id||!agencyForm.member_user_id||!agencyForm.plan_id) return alert("All fields required");
    const res = await fetch("/api/subscriptions/agency/add-member",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...agencyForm,plan_id:parseInt(agencyForm.plan_id)})});
    if (res.ok) { alert("Team member added"); loadTab(); } else { const e=await res.json(); alert(e.message); }
  };

  const fireHook = async () => {
    if (!hookForm.event_type||!hookForm.user_id) return alert("event_type and user_id required");
    const res = await fetch("/api/subscriptions/integrations/fire-hook",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(hookForm)});
    if (res.ok) {
      const d=await res.json();
      setHookLog(prev=>[{...d,fired_at:new Date().toLocaleTimeString(),user_id:hookForm.user_id},...prev.slice(0,19)]);
      alert(`✅ ${d.hooks_count} integration hooks fired to: ${d.hooks?.map((h:any)=>h.system).join(", ")}`);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1: PLANS
  // ══════════════════════════════════════════════════════════════════════════
  const renderPlans = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Crown className="w-6 h-6 text-emerald-400"/>Subscription Plans</h2>
          <p className="text-zinc-400 text-xs">Dynamic pricing, hybrid billing, grace periods. Sortable by any column.</p>
        </div>
        <Dialog open={cpOpen} onOpenChange={setCpOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 h-8 text-sm" data-testid="button-create-plan"><Sparkles className="w-4 h-4 mr-1"/>Create Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Subscription Plan</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Plan Name *</Label><Input value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})} placeholder="Pro" data-testid="input-plan-name"/></div>
                <div><Label>Slug *</Label><Input value={pf.slug} onChange={e=>setPf({...pf,slug:e.target.value})} placeholder="pro" data-testid="input-plan-slug"/></div>
              </div>
              <div><Label>Description</Label><Textarea value={pf.description} onChange={e=>setPf({...pf,description:e.target.value})} placeholder="Best for active freelancers..." rows={2}/></div>
              <div className="grid grid-cols-4 gap-3">
                <div><Label>Monthly (cents) *</Label><Input type="number" value={pf.price_monthly_cents} onChange={e=>setPf({...pf,price_monthly_cents:e.target.value})} placeholder="29900" data-testid="input-plan-monthly"/></div>
                <div><Label>Annual (cents)</Label><Input type="number" value={pf.price_annual_cents} onChange={e=>setPf({...pf,price_annual_cents:e.target.value})} placeholder="299000"/></div>
                <div><Label>Weekly (cents)</Label><Input type="number" value={pf.price_weekly_cents} onChange={e=>setPf({...pf,price_weekly_cents:e.target.value})} placeholder="7500"/></div>
                <div><Label>Daily (cents)</Label><Input type="number" value={pf.price_daily_cents} onChange={e=>setPf({...pf,price_daily_cents:e.target.value})} placeholder="1100"/></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Trial Days</Label><Input type="number" value={pf.trial_days} onChange={e=>setPf({...pf,trial_days:e.target.value})}/></div>
                <div><Label>Proposal Limit/mo</Label><Input type="number" value={pf.proposal_limit_monthly} onChange={e=>setPf({...pf,proposal_limit_monthly:e.target.value})} placeholder="Leave blank = unlimited"/></div>
                <div><Label>Overage/proposal (cents)</Label><Input type="number" value={pf.overage_proposal_cents} onChange={e=>setPf({...pf,overage_proposal_cents:e.target.value})} placeholder="200"/></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Gig Slots</Label><Input type="number" value={pf.gig_slots} onChange={e=>setPf({...pf,gig_slots:e.target.value})}/></div>
                <div><Label>Team Size</Label><Input type="number" value={pf.team_size} onChange={e=>setPf({...pf,team_size:e.target.value})}/></div>
                <div><Label>Search Boost ×</Label><Input type="number" step="0.1" value={pf.search_boost_multiplier} onChange={e=>setPf({...pf,search_boost_multiplier:e.target.value})}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Withdrawal Speed</Label>
                  <Select value={pf.withdrawal_speed} onValueChange={v=>setPf({...pf,withdrawal_speed:v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="fast">Fast (1-2 days)</SelectItem>
                      <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Support Level</Label>
                  <Select value={pf.support_level} onValueChange={v=>setPf({...pf,support_level:v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Profile Badge</Label><Input value={pf.profile_badge} onChange={e=>setPf({...pf,profile_badge:e.target.value})} placeholder='e.g. "Pro", "Agency Partner"'/></div>
              <div className="grid grid-cols-2 gap-3">
                {[["featured_gig_priority","Featured Gig Priority"],["white_label_enabled","White-label Enabled"],["sub_accounts_enabled","Sub-accounts"],["recommended","Mark as Recommended"]].map(([k,l])=>(
                  <div key={k} className="flex items-center gap-2">
                    <Switch checked={(pf as any)[k]} onCheckedChange={v=>setPf({...pf,[k]:v})}/>
                    <Label>{l}</Label>
                  </div>
                ))}
              </div>
              <Button onClick={createPlan} className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-submit-plan">Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  {[["name","Plan"],["price_monthly_cents","Monthly"],["trial_days","Trial"],["gig_slots","Gig Slots"],["team_size","Team"],].map(([f,l])=>(
                    <th key={f} className="text-left py-3 px-3 text-zinc-300 cursor-pointer hover:text-emerald-400" onClick={()=>togglePlanSort(f)}>
                      {l}<SortArrow field={f} active={sortField}/>
                    </th>
                  ))}
                  <th className="text-left py-3 px-3 text-zinc-300">Billing Options</th>
                  <th className="text-left py-3 px-3 text-zinc-300">Extras</th>
                  <th className="text-center py-3 px-3 text-zinc-300">Active</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                ) : plans.map((plan:any)=>(
                  <tr key={plan.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40" data-testid={`row-plan-${plan.id}`}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {plan.name}
                        {plan.recommended && <Star className="w-3.5 h-3.5 text-yellow-400"/>}
                      </div>
                      <div className="text-xs text-zinc-500">{plan.slug}</div>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{ZAR(plan.price_monthly_cents)}</td>
                    <td className="py-3 px-3 text-zinc-400">{plan.trial_days ? `${plan.trial_days}d` : "–"}</td>
                    <td className="py-3 px-3 text-zinc-400">{plan.gig_slots}</td>
                    <td className="py-3 px-3 text-zinc-400">{plan.team_size}</td>
                    <td className="py-3 px-3 text-xs text-zinc-400 space-y-0.5">
                      {plan.price_annual_cents && <div>Annual: {ZAR(plan.price_annual_cents)}</div>}
                      {plan.price_weekly_cents && <div>Weekly: {ZAR(plan.price_weekly_cents)}</div>}
                      {plan.price_daily_cents  && <div>Daily: {ZAR(plan.price_daily_cents)}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {plan.featured_gig_priority && <Badge className="bg-purple-600 text-xs">Featured</Badge>}
                        {plan.white_label_enabled    && <Badge className="bg-blue-600 text-xs">WL</Badge>}
                        {plan.sub_accounts_enabled   && <Badge className="bg-indigo-600 text-xs">Sub-accts</Badge>}
                        {plan.overage_proposal_cents && <Badge className="bg-orange-600 text-xs">Metered</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {plan.is_active
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto"/>
                        : <XCircle className="w-5 h-5 text-zinc-600 mx-auto"/>}
                    </td>
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
  // TAB 2: SUBSCRIPTIONS — Sortable by LTV, churn, cohort, revenue
  // ══════════════════════════════════════════════════════════════════════════
  const renderSubscriptions = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-blue-400"/>Active Subscriptions</h2>
          <p className="text-zinc-400 text-xs">Sortable by churn risk, LTV, plan, revenue. Full metered usage tracking.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
            </SelectContent>
          </Select>
          <Select value={churnFilter} onValueChange={setChurnFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Min churn risk"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Risk Levels</SelectItem>
              <SelectItem value="30">Risk &gt; 30</SelectItem>
              <SelectItem value="50">Risk &gt; 50</SelectItem>
              <SelectItem value="70">Risk &gt; 70 (Critical)</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={csOpen} onOpenChange={setCsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 h-8 text-sm" data-testid="button-create-subscription"><Rocket className="w-3.5 h-3.5 mr-1"/>Create Sub</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Subscription</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div><Label>User ID *</Label><Input value={sf.user_id} onChange={e=>setSf({...sf,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-sub-user-id"/></div>
                <div><Label>Plan *</Label>
                  <Select value={sf.plan_id} onValueChange={v=>setSf({...sf,plan_id:v})}>
                    <SelectTrigger data-testid="select-sub-plan"><SelectValue placeholder="Select plan..."/></SelectTrigger>
                    <SelectContent>{plans.map(p=><SelectItem key={p.id} value={String(p.id)}>{p.name} – {ZAR(p.price_monthly_cents)}/mo</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Billing Cycle</Label>
                  <Select value={sf.billing_cycle} onValueChange={v=>setSf({...sf,billing_cycle:v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Trial Days</Label><Input type="number" value={sf.trial_days} onChange={e=>setSf({...sf,trial_days:e.target.value})}/></div>
                <Button onClick={createSub} className="bg-blue-600 hover:bg-blue-700" data-testid="button-submit-subscription">Create Subscription</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">
            {subscriptions.total} subscriptions • Click column headers to sort
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="text-left py-2.5 px-3 text-zinc-300">User</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Plan</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300 cursor-pointer hover:text-emerald-400" onClick={()=>toggleSubSort("status")}>Status<SubSortArrow field="status"/></th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Cycle</th>
                  <th className="text-right py-2.5 px-3 text-zinc-300 cursor-pointer hover:text-emerald-400" onClick={()=>toggleSubSort("price_paid_cents")}>Revenue<SubSortArrow field="price_paid_cents"/></th>
                  <th className="text-center py-2.5 px-3 text-zinc-300 cursor-pointer hover:text-orange-400" onClick={()=>toggleSubSort("churn_risk_score")}>Churn Risk<SubSortArrow field="churn_risk_score"/></th>
                  <th className="text-left py-2.5 px-3 text-zinc-300">Metered Usage</th>
                  <th className="text-left py-2.5 px-3 text-zinc-300 cursor-pointer hover:text-emerald-400" onClick={()=>toggleSubSort("current_period_end")}>Period End<SubSortArrow field="current_period_end"/></th>
                  <th className="text-center py-2.5 px-3 text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                ) : subscriptions.items.map((sub:any)=>(
                  <tr key={sub.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40" data-testid={`row-subscription-${sub.id}`}>
                    <td className="py-2.5 px-3 text-zinc-400 text-xs max-w-[120px] truncate">{sub.user_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white text-xs">{sub.plan_name}</div>
                      <div className="text-zinc-600 text-xs">{sub.plan_slug}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge className={sub.status==="active"?"bg-emerald-600":sub.status==="trial"?"bg-blue-600":sub.status==="cancelled"?"bg-red-700":"bg-zinc-600"}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-xs">{sub.billing_cycle}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{ZAR(sub.price_paid_cents)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {sub.churn_risk_score
                        ? <Badge className={`${RISK_CLASS(Number(sub.churn_risk_score))} text-xs`}>{Number(sub.churn_risk_score).toFixed(0)}</Badge>
                        : <span className="text-zinc-700 text-xs">–</span>}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-zinc-500">
                      {sub.proposal_limit_monthly
                        ? <div>{sub.proposals_used_this_period||0}/{sub.proposal_limit_monthly} proposals</div>
                        : <div className="text-zinc-600">Unlimited</div>}
                      {(sub.overage_charges_cents||0) > 0 && <div className="text-orange-400">+{ZAR(sub.overage_charges_cents)} overage</div>}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-xs">
                      {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("en-ZA") : "–"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {(sub.status==="active"||sub.status==="trial") && (
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs h-7" onClick={()=>cancelSub(sub.id)} data-testid={`button-cancel-${sub.id}`}>Cancel</Button>
                      )}
                    </td>
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
  // TAB 3: AGENTIC AI ENGINE
  // ══════════════════════════════════════════════════════════════════════════
  const renderAI = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-cyan-400"/>Agentic AI Personalization Engine</h2>
        <p className="text-zinc-400 text-xs">15-signal analysis. ROI calculation. 1-click auto-upgrade paths. Triggers integration hooks automatically.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Get AI Recommendation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-zinc-300 text-xs">User ID</Label>
              <Input id="ai-uid" placeholder="user_ABC123..." className="mt-1 h-8 text-sm" data-testid="input-ai-user-id"/>
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-700 w-full" onClick={()=>{const el=document.getElementById("ai-uid") as HTMLInputElement; if(el?.value) getAiRecommend(el.value);}} data-testid="button-ai-recommend">
              <Brain className="w-4 h-4 mr-2"/>Analyze & Recommend
            </Button>
            {aiResult && (
              <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-cyan-800 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className={aiResult.recommendation.action==="upgrade"?"bg-emerald-600":aiResult.recommendation.action==="downgrade"?"bg-orange-600":"bg-blue-600"}>
                    {aiResult.recommendation.action.toUpperCase()}
                  </Badge>
                  <div className="font-bold text-white">→ {aiResult.recommendation.recommended_plan.toUpperCase()} plan</div>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-600">{aiResult.recommendation.confidence}% confidence</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-zinc-800 rounded p-2">
                    <div className="text-emerald-400 font-bold text-lg">+{aiResult.recommendation.roi_boost_pct}%</div>
                    <div className="text-xs text-zinc-400">Revenue Boost</div>
                  </div>
                  <div className="bg-zinc-800 rounded p-2">
                    <div className="text-blue-400 font-bold text-lg">{aiResult.recommendation.payback_days}d</div>
                    <div className="text-xs text-zinc-400">Payback Period</div>
                  </div>
                  <div className="bg-zinc-800 rounded p-2">
                    <div className={`font-bold text-lg ${aiResult.recommendation.urgency==="critical"?"text-red-400":aiResult.recommendation.urgency==="high"?"text-orange-400":"text-zinc-400"}`}>
                      {aiResult.recommendation.urgency.toUpperCase()}
                    </div>
                    <div className="text-xs text-zinc-400">Urgency</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-300">{aiResult.recommendation.reason}</p>
                {aiResult.recommendation.auto_upgrade_eligible && (
                  <div className="p-2 bg-emerald-900/30 border border-emerald-700 rounded text-sm text-emerald-300">
                    ✅ Auto-upgrade eligible — integration hooks triggered
                  </div>
                )}
                {aiResult.recommendation.trigger_marketing_campaign && (
                  <div className="p-2 bg-purple-900/30 border border-purple-700 rounded text-sm text-purple-300">
                    📣 Marketing campaign triggered (Marketing System hook fired)
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">AI Signal Analysis — How We Out-Engineer Upwork</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-emerald-400 font-semibold mb-2">15 Analyzed Signals</div>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Earnings last 30 days</li>
                  <li>• Earnings last 90 days (trend)</li>
                  <li>• Proposals sent & win rate</li>
                  <li>• Active gigs & avg price</li>
                  <li>• Team size & composition</li>
                  <li>• Months active on platform</li>
                  <li>• Repeat client rate</li>
                  <li>• Profile completion %</li>
                </ul>
              </div>
              <div>
                <div className="text-xs text-blue-400 font-semibold mb-2">Decision Intelligence</div>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Monthly growth rate detection</li>
                  <li>• ROI calculation per plan</li>
                  <li>• Payback period estimation</li>
                  <li>• Auto-upgrade threshold logic</li>
                  <li>• Downgrade intercept flow</li>
                  <li>• Marketing campaign triggers</li>
                  <li>• Integration hook auto-firing</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-cyan-900/20 border border-cyan-800 rounded text-xs text-zinc-300">
              <strong className="text-cyan-300">vs Upwork ($49.99/mo "Boosted Profile"):</strong> Static feature page. Zero personalization. We calculate EXACT ROI per user and show payback period in days.
            </div>
            <div className="p-3 bg-purple-900/20 border border-purple-800 rounded text-xs text-zinc-300">
              <strong className="text-purple-300">vs LinkedIn Premium ($39.99/mo):</strong> "See who viewed your profile." We show: "Upgrade pays back in 11 days based on your R12,000/mo earnings."
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Auto-Upgrade Decision Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-300">Trigger Condition</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Current Plan</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Recommended</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Revenue Boost</th>
                  <th className="text-left py-2 px-3 text-zinc-300">Auto-Upgrade Eligible</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Earnings &gt; R5,000/mo OR &gt;8 proposals/mo", "Basic/Free", "Pro", "+27%", "After 14d cooling period"],
                  ["Earnings &gt; R10,000/mo OR growing &gt;20%/mo", "Basic", "Pro", "+27%", "Immediate (urgent)"],
                  ["Team size ≥ 2 OR avg gig &gt; R8,000", "Any", "Agency", "+15%", "After 7d cooling period"],
                  ["Avg gig &gt; R5,000 AND &gt;150 proposals/mo", "Pro", "Agency", "+15%", "Immediate"],
                  ["Usage &lt; 3 proposals/mo AND &lt; R2,000 earnings", "Pro/Agency", "Basic", "-60% cost", "Downgrade offer shown"],
                ].map(([trigger,from,to,boost,eligible],i)=>(
                  <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-300" dangerouslySetInnerHTML={{__html:trigger}}/>
                    <td className="py-2 px-3"><Badge className="bg-zinc-700 text-xs">{from}</Badge></td>
                    <td className="py-2 px-3"><Badge className="bg-emerald-700 text-xs">{to}</Badge></td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">{boost}</td>
                    <td className="py-2 px-3 text-zinc-400">{eligible}</td>
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
  // TAB 4: CHURN AI — 9-signal predictor + dynamic pricing
  // ══════════════════════════════════════════════════════════════════════════
  const renderChurn = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-orange-400"/>Predictive Churn Prevention + Dynamic Pricing</h2>
          <p className="text-zinc-400 text-xs">9-signal churn model. Auto-adjust price/perks. Loyalty token injections. vs Fiverr: they send 1 email. We offer personalized AI interventions.</p>
        </div>
        <div className="flex gap-2">
          <Select value={churnFilter} onValueChange={setChurnFilter}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Risk threshold"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Predictions</SelectItem>
              <SelectItem value="30">Risk &gt; 30</SelectItem>
              <SelectItem value="50">Risk &gt; 50</SelectItem>
              <SelectItem value="70">Critical (&gt; 70)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Critical Risk (>70)", count:churnPreds.filter(p=>p.churn_risk_score>70).length, color:"bg-red-900/20 border-red-800", tc:"text-red-400"},
          {label:"High Risk (50-70)", count:churnPreds.filter(p=>p.churn_risk_score>50&&p.churn_risk_score<=70).length, color:"bg-orange-900/20 border-orange-800", tc:"text-orange-400"},
          {label:"Medium Risk (30-50)", count:churnPreds.filter(p=>p.churn_risk_score>30&&p.churn_risk_score<=50).length, color:"bg-yellow-900/20 border-yellow-800", tc:"text-yellow-400"},
        ].map(k=>(
          <Card key={k.label} className={`${k.color} border`}>
            <CardContent className="p-4">
              <div className={`${k.tc} text-sm font-semibold`}>{k.label}</div>
              <div className="text-3xl font-bold text-white mt-1">{k.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-3 text-zinc-300">User</th>
                  <th className="text-center py-3 px-3 text-zinc-300">Risk Score</th>
                  <th className="text-center py-3 px-3 text-zinc-300">Risk Level</th>
                  <th className="text-left py-3 px-3 text-zinc-300">Predicted Churn</th>
                  <th className="text-left py-3 px-3 text-zinc-300">Top Risk Factors</th>
                  <th className="text-left py-3 px-3 text-zinc-300">AI Intervention</th>
                  <th className="text-center py-3 px-3 text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-zinc-500">Loading...</td></tr>
                ) : churnPreds.map((pred:any)=>(
                  <tr key={pred.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30" data-testid={`row-churn-${pred.id}`}>
                    <td className="py-3 px-3 text-zinc-400 text-xs max-w-[120px] truncate">{pred.user_id}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge className={RISK_CLASS(Number(pred.churn_risk_score))}>{Number(pred.churn_risk_score).toFixed(0)}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge className={Number(pred.churn_risk_score)>70?"bg-red-700":Number(pred.churn_risk_score)>50?"bg-orange-600":Number(pred.churn_risk_score)>30?"bg-yellow-600":"bg-emerald-600"}>
                        {Number(pred.churn_risk_score)>70?"Critical":Number(pred.churn_risk_score)>50?"High":Number(pred.churn_risk_score)>30?"Medium":"Low"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-xs text-zinc-400">
                      {pred.days_until_predicted_churn ? `${pred.days_until_predicted_churn}d` : "–"}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {pred.risk_factors && Array.isArray(pred.risk_factors) && pred.risk_factors.slice(0,2).map((f:any,i:number)=>(
                        <div key={i} className="text-zinc-400">• {f.description}</div>
                      ))}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {pred.suggested_interventions && Array.isArray(pred.suggested_interventions) && pred.suggested_interventions.slice(0,2).map((int:any,i:number)=>(
                        <div key={i} className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-xs border-zinc-600">{int.type||int.feature||"intervention"}</Badge>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!pred.intervention_taken ? (
                        <div className="flex gap-1 justify-center flex-wrap">
                          {Number(pred.churn_risk_score) > 50 && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs h-6 px-2" onClick={()=>applyIntervention(pred.id,"retention_discount",Number(pred.churn_risk_score)>70?35:25)} data-testid={`button-intervene-${pred.id}`}>
                              -{Number(pred.churn_risk_score)>70?35:25}% Disc
                            </Button>
                          )}
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs h-6 px-2" onClick={()=>applyIntervention(pred.id,"feature_unlock")}>
                            Unlock
                          </Button>
                        </div>
                      ) : (
                        <Badge className="bg-emerald-700 text-xs">✅ {pred.intervention_taken}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && churnPreds.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-zinc-500">No predictions yet. Use "Score User" to generate churn predictions.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Dynamic Pricing Engine — Intervention Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-zinc-800"><th className="text-left py-2 px-2 text-zinc-300">Risk Level</th><th className="text-left py-2 px-2 text-zinc-300">Discount</th><th className="text-left py-2 px-2 text-zinc-300">Feature Unlock</th><th className="text-left py-2 px-2 text-zinc-300">Token Injection</th></tr></thead>
                <tbody>
                  {[["Critical >70","35%","7-day featured gig + 50 proposals","500 tokens"],["High >50","25%","7-day featured gig","250 tokens"],["Medium >30","15%","Usage tips email","100 tokens"],["Low <30","0%","Proactive health check","0 tokens"]].map(([r,d,f,t],i)=>(
                    <tr key={i} className="border-b border-zinc-800/60">
                      <td className="py-2 px-2 text-zinc-300">{r}</td>
                      <td className="py-2 px-2 text-emerald-400 font-semibold">{d}</td>
                      <td className="py-2 px-2 text-blue-400">{f}</td>
                      <td className="py-2 px-2 text-yellow-400">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-orange-900/20 border border-orange-800 rounded text-xs text-zinc-300">
              <strong className="text-orange-300 block mb-2">How we obliterate Fiverr Pro ($29.99/mo):</strong>
              Fiverr sends one generic "we miss you" email. We:
              <ul className="mt-2 space-y-1 text-zinc-400">
                <li>• Score user on 9 behavioral signals in real-time</li>
                <li>• Calculate personalized discount based on risk</li>
                <li>• Inject Skill Tokens immediately (instant value delivery)</li>
                <li>• Unlock features from the next tier for 7 days</li>
                <li>• Fire Marketing System campaign hook automatically</li>
                <li>• Track intervention result (retained/churned/pending)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 5: HYBRID BILLING
  // ══════════════════════════════════════════════════════════════════════════
  const renderBilling = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard className="w-6 h-6 text-purple-400"/>Hybrid Subscription + Metered Billing</h2>
        <p className="text-zinc-400 text-xs">Fixed base + pay-per-use overages. How AWS/Stripe/Twilio built $100B empires. First freelance platform to implement this.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Overage Calculator</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Proposals Sent</Label><Input type="number" className="h-8 text-sm" value={meterForm.proposals_sent} onChange={e=>setMeterForm({...meterForm,proposals_sent:e.target.value})}/></div>
              <div><Label className="text-xs">Proposal Limit</Label><Input type="number" className="h-8 text-sm" value={meterForm.proposal_limit} onChange={e=>setMeterForm({...meterForm,proposal_limit:e.target.value})}/></div>
              <div><Label className="text-xs">Overage Rate (c)</Label><Input type="number" className="h-8 text-sm" value={meterForm.overage_proposal_cents} onChange={e=>setMeterForm({...meterForm,overage_proposal_cents:e.target.value})}/></div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 w-full h-8 text-sm" onClick={calcOverage} data-testid="button-calc-overage">
              <DollarSign className="w-4 h-4 mr-1"/>Calculate Overage Bill
            </Button>
            {meterResult && (
              <div className="mt-2 p-3 bg-zinc-900 rounded border border-purple-700 space-y-2">
                <div className="text-emerald-400 font-semibold">Total Overage: {ZAR(meterResult.total_overage_cents)}</div>
                {meterResult.overage_breakdown.map((o:any,i:number)=>(
                  <div key={i} className="text-xs text-zinc-300">
                    {o.item}: {o.quantity} × {ZAR(o.rate_cents)} = <span className="text-emerald-400">{ZAR(o.total_cents)}</span>
                  </div>
                ))}
                {meterResult.invoice_line_items.length === 0 && <div className="text-emerald-400 text-xs">✅ No overages — within limits</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Billing Event Log</CardTitle></CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-500 mb-3">Total: {billingEvents.total} events</div>
            <div className="overflow-y-auto max-h-64 space-y-1">
              {loading ? <div className="text-zinc-500 text-xs">Loading...</div> : billingEvents.items.slice(0,20).map((ev:any)=>(
                <div key={ev.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60 text-xs" data-testid={`row-billing-${ev.id}`}>
                  <Badge className={ev.event_status==="succeeded"?"bg-emerald-700":ev.event_status==="failed"?"bg-red-700":"bg-zinc-600"}>
                    {ev.event_status}
                  </Badge>
                  <Badge variant="outline" className="border-zinc-600">{ev.event_type}</Badge>
                  <span className="text-emerald-400 font-semibold">{ZAR(ev.amount_cents)}</span>
                  <span className="text-zinc-500 truncate flex-1">{ev.description}</span>
                  <span className="text-zinc-600">{new Date(ev.created_at).toLocaleDateString("en-ZA")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Hybrid Billing Architecture — Why This Is Genius</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              {title:"Fixed Base (Subscription)", desc:"Predictable recurring revenue. Users commit monthly/annually. Upwork/Fiverr only have this.", color:"bg-emerald-900/20 border-emerald-800", tc:"text-emerald-400"},
              {title:"Metered Overages (Per-Use)", desc:"Charge per proposal beyond limit, per featured gig day, per API call. Captures upside from power users.", color:"bg-purple-900/20 border-purple-800", tc:"text-purple-400"},
              {title:"Hybrid = Maximum Revenue", desc:"AWS Model: fixed base + pay-as-you-go. Captures 100% of user value. No competitor freelance platform has this.", color:"bg-blue-900/20 border-blue-800", tc:"text-blue-400"},
            ].map((item,i)=>(
              <div key={i} className={`${item.color} border rounded p-4`}>
                <div className={`${item.tc} font-semibold text-sm mb-2`}>{item.title}</div>
                <p className="text-xs text-zinc-300">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-zinc-800 rounded text-xs text-zinc-300">
            <strong className="text-white block mb-1">Overage Billing Rules (per plan):</strong>
            <div className="grid grid-cols-3 gap-4">
              <div><strong className="text-emerald-400">Basic:</strong> R2.00/proposal over 10 limit, R50/featured gig day</div>
              <div><strong className="text-blue-400">Pro:</strong> Unlimited proposals, R50/featured gig day beyond included days</div>
              <div><strong className="text-purple-400">Agency:</strong> Unlimited proposals + gigs. API overages: R0.05/call above 10,000</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 6: AGENCY SUITE
  // ══════════════════════════════════════════════════════════════════════════
  const renderAgency = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-6 h-6 text-indigo-400"/>Advanced Agency / Team Suite</h2>
        <p className="text-zinc-400 text-xs">Sub-accounts, granular roles, shared analytics, invoice splitting, white-label portals. vs Fiverr Business: basic team management only.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Add Team Member</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Owner User ID *</Label><Input className="h-8 text-sm mt-1" value={agencyForm.owner_user_id} onChange={e=>setAgencyForm({...agencyForm,owner_user_id:e.target.value})} placeholder="user_OWNER..."/></div>
            <div><Label className="text-xs">Member User ID *</Label><Input className="h-8 text-sm mt-1" value={agencyForm.member_user_id} onChange={e=>setAgencyForm({...agencyForm,member_user_id:e.target.value})} placeholder="user_MEMBER..." data-testid="input-member-user-id"/></div>
            <div><Label className="text-xs">Role</Label>
              <Select value={agencyForm.role} onValueChange={v=>setAgencyForm({...agencyForm,role:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                  <SelectItem value="member">Member (limited access)</SelectItem>
                  <SelectItem value="billing">Billing only</SelectItem>
                  <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Plan *</Label>
              <Select value={agencyForm.plan_id} onValueChange={v=>setAgencyForm({...agencyForm,plan_id:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue placeholder="Select plan..."/></SelectTrigger>
                <SelectContent>{plans.filter(p=>p.sub_accounts_enabled||p.team_size>1).map(p=><SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full h-8 text-sm" onClick={addAgencyMember} data-testid="button-add-member">Add Team Member</Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Active Agency Teams</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-zinc-500 text-xs">Loading...</div> : agencyTeams.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-8">No agency teams yet</div>
            ) : agencyTeams.map((team:any,i:number)=>(
              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800 rounded mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{team.team_owner_user_id}</div>
                  <div className="text-xs text-zinc-400">{team.member_count} members • {team.plan_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold text-sm">{ZAR(team.total_billing_cents||0)}</div>
                  <div className="text-xs text-zinc-500">Total billing</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Agency Features vs Competitors</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-zinc-300">Feature</th>
                <th className="text-center py-2 px-3 text-emerald-400">FreelanceSkills</th>
                <th className="text-center py-2 px-3 text-zinc-400">Upwork Enterprise</th>
                <th className="text-center py-2 px-3 text-zinc-400">Fiverr Business</th>
                <th className="text-center py-2 px-3 text-zinc-400">Toptal</th>
              </tr></thead>
              <tbody>
                {[
                  ["Sub-account creation","✅","✅","✅","❌"],
                  ["Granular role permissions (4 roles)","✅","✅","❌","❌"],
                  ["Shared billing wallet","✅","✅","❌","❌"],
                  ["Invoice splitting","✅","❌","❌","❌"],
                  ["White-label client portals","✅","❌","❌","❌"],
                  ["Shared analytics dashboard","✅","✅","❌","❌"],
                  ["Per-member usage tracking","✅","❌","❌","❌"],
                  ["Mobile money team billing","✅","❌","❌","❌"],
                ].map(([f,...vals],i)=>(
                  <tr key={i} className="border-b border-zinc-800/60">
                    <td className="py-2 px-3 text-zinc-300">{f}</td>
                    {vals.map((v,j)=>(
                      <td key={j} className="py-2 px-3 text-center">
                        <span className={v==="✅"?"text-emerald-400":"text-zinc-600"}>{v}</span>
                      </td>
                    ))}
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
  // TAB 7: SKILL TOKENS
  // ══════════════════════════════════════════════════════════════════════════
  const renderLoyalty = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Coins className="w-6 h-6 text-yellow-400"/>Loyalty &amp; Tokenized Perks System</h2>
        <p className="text-zinc-400 text-xs">Earn Skill Tokens on 8 actions. Redeem for 12 perks. Full economy that keeps users engaged every day. vs LinkedIn: they give points for posts. We give tokens redeemable for real platform power.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Token Earning Rules (8 Actions)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                {action:"Subscription Payment",tokens:"+100 tokens","multiplier":"×1 Base"},
                {action:"Job Completed",tokens:"+50 tokens","multiplier":"×1 Base"},
                {action:"Referral Conversion",tokens:"+200 tokens","multiplier":"×1.5 Pro"},
                {action:"5-Star Review Received",tokens:"+25 tokens","multiplier":"×2 Agency"},
                {action:"Profile Completed",tokens:"+75 tokens","multiplier":"One-time"},
                {action:"Annual Plan Upgrade",tokens:"+500 tokens","multiplier":"Bonus"},
                {action:"Churn Win-back (returned)",tokens:"+300 tokens","multiplier":"Loyalty"},
                {action:"30-day Streak Active",tokens:"+150 tokens","multiplier":"Monthly"},
              ].map((item,i)=>(
                <div key={i} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                  <Coins className="w-4 h-4 text-yellow-400 flex-shrink-0"/>
                  <div className="flex-1 text-xs text-zinc-300">{item.action}</div>
                  <Badge className="bg-yellow-700 text-xs">{item.tokens}</Badge>
                  <span className="text-xs text-zinc-500">{item.multiplier}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Redemption Catalog (12 Perks)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                {perk:"10% Next Renewal",cost:"500",cat:"discount"},
                {perk:"Featured Gig 7 Days",cost:"800",cat:"boost"},
                {perk:"50 Bonus Proposals",cost:"600",cat:"usage"},
                {perk:"Priority Support 30d",cost:"1,000",cat:"support"},
                {perk:"Academy Premium 14d",cost:"750",cat:"academy"},
                {perk:"Plan Tier Upgrade 1 Month",cost:"2,000",cat:"upgrade"},
                {perk:"Profile Badge 'Top Earner'",cost:"1,200",cat:"badge"},
                {perk:"WhatsApp Alert Priority",cost:"400",cat:"notify"},
                {perk:"Analytics Deep Dive",cost:"500",cat:"analytics"},
                {perk:"Invoice Template Premium",cost:"300",cat:"tools"},
                {perk:"Custom USSD Shortcode",cost:"3,000",cat:"africa"},
                {perk:"White-label 30 Days",cost:"5,000",cat:"agency"},
              ].map((item,i)=>(
                <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded text-xs">
                  <span className="text-zinc-300">{item.perk}</span>
                  <Badge className="bg-yellow-700 ml-2">{item.cost} 🪙</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Token Tier Multipliers</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              {tier:"Free",mult:"×1.0","min":0,"max":499,color:"bg-zinc-700"},
              {tier:"Basic",mult:"×1.2","min":500,"max":1999,color:"bg-emerald-800"},
              {tier:"Pro",mult:"×1.5","min":2000,"max":4999,color:"bg-blue-800"},
              {tier:"Agency",mult:"×2.0","min":5000,"max":null,color:"bg-purple-800"},
            ].map((t,i)=>(
              <div key={i} className={`${t.color} rounded-lg p-4 text-center`}>
                <div className="text-white font-bold text-base">{t.tier}</div>
                <div className="text-3xl font-black text-white mt-1">{t.mult}</div>
                <div className="text-xs text-zinc-300 mt-1">{t.min}+ tokens</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 8: COHORT ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════
  const renderAnalytics = () => {
    if (!analytics && !loading) return <div className="text-zinc-500 text-sm py-8 text-center">Click tab to load analytics</div>;
    if (loading) return <div className="text-zinc-500 text-sm py-8 text-center">Loading analytics...</div>;
    if (!analytics) return null;

    const trendData = analytics.trend_30d || [];
    const planData = (analytics.plan_distribution || []).map((p:any)=>({name:p.name,subscribers:Number(p.subscriber_count)||0,revenue:Number(p.total_revenue_cents||0)/100}));
    const cohortData = (analytics.cohort_projections || []).flatMap((c:any)=>c.months.filter((_:any,i:number)=>i<12).map((m:any)=>({...m,cohort:c.cohort})));

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-emerald-400"/>Cohort Revenue Analytics</h2>
          <p className="text-zinc-400 text-xs">MRR/ARR real-time, LTV per cohort, 36-month forecast, plan performance heatmaps. vs All competitors: none expose this to operators.</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            {label:"MRR",value:ZAR(analytics.mrr_cents||0),sub:"Monthly Recurring Revenue",icon:DollarSign,color:"from-emerald-900/40 to-green-900/30 border-emerald-800",tc:"text-emerald-400"},
            {label:"ARR",value:ZAR(analytics.arr_cents||0),sub:"Annual Recurring Revenue",icon:TrendingUp,color:"from-blue-900/40 to-cyan-900/30 border-blue-800",tc:"text-blue-400"},
            {label:"Active Subs",value:String(analytics.active_subscriptions||0),sub:`+${analytics.trial_subscriptions||0} on trial`,icon:Users,color:"from-purple-900/40 to-pink-900/30 border-purple-800",tc:"text-purple-400"},
            {label:"Avg Churn Risk",value:String(Number(analytics.churn_summary?.avg_risk||0).toFixed(1)),sub:`${analytics.churn_summary?.critical_risk_count||0} critical`,icon:AlertTriangle,color:"from-orange-900/40 to-red-900/30 border-orange-800",tc:"text-orange-400"},
          ].map((k,i)=>(
            <Card key={i} className={`bg-gradient-to-br ${k.color} border`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <k.icon className={`w-5 h-5 ${k.tc}`}/>
                  <div className={`${k.tc} text-xs font-semibold`}>{k.label}</div>
                </div>
                <div className="text-2xl font-bold text-white">{k.value}</div>
                <div className="text-xs text-zinc-400">{k.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">30-Day MRR Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                  <XAxis dataKey="metric_date" stroke="#a1a1aa" tick={{fontSize:10}} tickFormatter={v=>new Date(v).toLocaleDateString("en-ZA",{month:"short",day:"numeric"})}/>
                  <YAxis stroke="#a1a1aa" tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46",borderRadius:"6px"}} labelStyle={{color:"#a1a1aa"}}/>
                  <Area type="monotone" dataKey="mrr_cents" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="MRR (cents)"/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Revenue Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={planData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                  <XAxis dataKey="name" stroke="#a1a1aa" tick={{fontSize:10}}/>
                  <YAxis yAxisId="left" stroke="#a1a1aa" tick={{fontSize:10}}/>
                  <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46",borderRadius:"6px"}}/>
                  <Bar yAxisId="left" dataKey="subscribers" fill="#3b82f6" name="Subscribers" radius={[4,4,0,0]}/>
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{fill:"#10b981"}} name="Revenue (R)"/>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm">LTV Cohort Projection — 12-Month Cumulative</CardTitle></CardHeader>
          <CardContent>
            {analytics.cohort_projections?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analytics.cohort_projections[0]?.months.slice(0,12)||[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/>
                  <XAxis dataKey="month" stroke="#a1a1aa" tick={{fontSize:10}} tickFormatter={v=>`Mo ${v}`}/>
                  <YAxis stroke="#a1a1aa" tick={{fontSize:10}} tickFormatter={v=>`R${(v/100).toFixed(0)}`}/>
                  <Tooltip contentStyle={{backgroundColor:"#27272a",border:"1px solid #3f3f46",borderRadius:"6px"}} formatter={(v:any)=>[`R${(Number(v)/100).toFixed(2)}`,"Cumulative LTV"]}/>
                  {analytics.cohort_projections.map((c:any,i:number)=>(
                    <Line key={c.cohort} type="monotone" dataKey="cumulative_ltv_cents" data={c.months.slice(0,12)} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={false} name={c.cohort}/>
                  ))}
                  <Legend/>
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="text-zinc-500 text-sm text-center py-8">No cohort data yet</div>}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 9: AFRICA HUB
  // ══════════════════════════════════════════════════════════════════════════
  const renderAfrica = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-yellow-400"/>Africa-Optimized Micro &amp; Flexible Billing</h2>
        <p className="text-zinc-400 text-xs">USSD signup, mobile money, daily/weekly tiers, grace periods, airtime billing. Reaching 800M+ users that Upwork/Fiverr/Substack completely ignore.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">USSD Signup Flow — Zero Data Required</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-2">{ussdMenu?.main_code||"*120*PREMIUM#"}</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(ussdMenu?.network_codes||{}).map(([net,code])=>(
                <div key={net} className="bg-zinc-800 rounded p-2 text-center text-xs">
                  <div className="text-zinc-400 uppercase font-semibold">{net}</div>
                  <div className="text-white font-mono mt-1">{String(code)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {(ussdMenu?.options||[]).map((opt:any)=>(
                <div key={opt.option} className="flex items-center gap-2 text-sm">
                  <Badge className="bg-zinc-700 text-xs w-6 text-center">{opt.option}</Badge>
                  <span className="text-zinc-300">{opt.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded text-xs text-zinc-300">
              Low-data web flow: <span className="text-yellow-300 font-mono">{ussdMenu?.low_data_url||"m.freelanceskills.net/sub"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Mobile Money Billing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                {provider:"M-PESA",country:"Kenya",color:"bg-emerald-900/30 border-emerald-800"},
                {provider:"MTN MoMo",country:"14 African countries",color:"bg-yellow-900/30 border-yellow-800"},
                {provider:"Airtel Money",country:"17 African countries",color:"bg-red-900/30 border-red-800"},
              ].map((p,i)=>(
                <div key={i} className={`${p.color} border rounded p-3 text-center`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-1 text-zinc-300"/>
                  <div className="font-semibold text-white text-sm">{p.provider}</div>
                  <div className="text-xs text-zinc-400">{p.country}</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-800 rounded">
              <div className="text-sm font-semibold text-white mb-2">Africa-First Plan Pricing</div>
              <div className="space-y-1 text-xs text-zinc-300">
                <div className="flex justify-between"><span>Basic Daily</span><span className="text-emerald-400">R3.50/day</span></div>
                <div className="flex justify-between"><span>Basic Weekly</span><span className="text-emerald-400">R22/week</span></div>
                <div className="flex justify-between"><span>Pro Daily</span><span className="text-emerald-400">R11/day</span></div>
                <div className="flex justify-between"><span>Pro Weekly</span><span className="text-emerald-400">R75/week</span></div>
              </div>
            </div>

            <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded text-xs text-zinc-300">
              <strong className="text-yellow-300 block mb-1">Market Opportunity:</strong>
              Upwork/Fiverr require credit cards. We accept M-PESA, airtime, and bank transfer. Tapping 800M Africans with limited banking access.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3"><CardTitle className="text-base">Grace Period &amp; Downgrade Flow — Soft Landing Intelligence</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              {plan:"Basic",grace:"3 days",retain:["Profile visibility","Existing gig listings","Message inbox"],remove:["New proposals","Featured priority"],offer:"R7.50/week (daily billing)"},
              {plan:"Pro",grace:"7 days",retain:["Profile","Gig listings","Messages","Basic analytics"],remove:["New proposals","Featured priority","Priority support"],offer:"35% off monthly renewal"},
              {plan:"Agency",grace:"14 days",retain:["Profile","Gig listings","Messages","Sub-accounts (read)","Team data"],remove:["New proposals","White-label","Invoice splitting"],offer:"25% off + lock current team structure"},
            ].map((item,i)=>(
              <div key={i} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-700">{item.plan}</Badge>
                  <Badge className="bg-orange-700">{item.grace} grace</Badge>
                </div>
                <div className="text-xs mb-2">
                  <div className="text-emerald-400 font-semibold mb-1">Retained:</div>
                  {item.retain.map((f,j)=><div key={j} className="text-zinc-300">✓ {f}</div>)}
                </div>
                <div className="text-xs mb-2">
                  <div className="text-red-400 font-semibold mb-1">Removed:</div>
                  {item.remove.map((f,j)=><div key={j} className="text-zinc-500">✗ {f}</div>)}
                </div>
                <div className="text-xs p-2 bg-emerald-900/20 border border-emerald-800 rounded text-emerald-300">
                  Offer: {item.offer}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 10: INTEGRATIONS
  // ══════════════════════════════════════════════════════════════════════════
  const renderIntegrations = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Link className="w-6 h-6 text-blue-400"/>Full Integration Hooks (10 Connected Systems)</h2>
        <p className="text-zinc-400 text-xs">On every plan change, 10 systems are notified automatically. FreelanceSkills is a revenue operating system, not just a subscription layer.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">Fire Integration Hook</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Event Type</Label>
              <Select value={hookForm.event_type} onValueChange={v=>setHookForm({...hookForm,event_type:v})}>
                <SelectTrigger className="h-8 mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="downgrade">Downgrade</SelectItem>
                  <SelectItem value="trial_start">Trial Start</SelectItem>
                  <SelectItem value="churn_risk">Churn Risk Alert</SelectItem>
                  <SelectItem value="cancel">Cancel</SelectItem>
                  <SelectItem value="renew">Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">User ID *</Label><Input className="h-8 text-sm mt-1" value={hookForm.user_id} onChange={e=>setHookForm({...hookForm,user_id:e.target.value})} placeholder="user_ABC..." data-testid="input-hook-user-id"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">From Plan</Label><Input className="h-8 text-sm mt-1" value={hookForm.from_plan} onChange={e=>setHookForm({...hookForm,from_plan:e.target.value})} placeholder="basic"/></div>
              <div><Label className="text-xs">To Plan</Label><Input className="h-8 text-sm mt-1" value={hookForm.to_plan} onChange={e=>setHookForm({...hookForm,to_plan:e.target.value})} placeholder="pro"/></div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full h-8 text-sm" onClick={fireHook} data-testid="button-fire-hook">
              <Play className="w-4 h-4 mr-1"/>Fire Integration Hooks
            </Button>

            {hookLog.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-zinc-400 mb-2">Recent Hook Firings:</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {hookLog.map((h,i)=>(
                    <div key={i} className="p-2 bg-zinc-800 rounded text-xs flex items-center gap-2">
                      <Badge className="bg-blue-700">{h.event_type||hookForm.event_type}</Badge>
                      <span className="text-zinc-400">{h.user_id}</span>
                      <span className="text-emerald-400 ml-auto">{h.hooks_count} hooks</span>
                      <span className="text-zinc-600">{h.fired_at}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3"><CardTitle className="text-base">10 Connected Systems — What Fires When</CardTitle></CardHeader>
          <CardContent className="overflow-y-auto max-h-96">
            <div className="space-y-3">
              {[
                {system:"🎯 Promotion System",on_upgrade:"30-day free gig boost unlocked",on_cancel:"Boost removed immediately",on_churn_risk:"–"},
                {system:"🔔 Notification System",on_upgrade:"+500 notification quota",on_cancel:"Farewell + win-back offer sent",on_churn_risk:"Urgent retention notification"},
                {system:"🎓 Academy",on_upgrade:"Full Academy access unlocked",on_cancel:"–",on_churn_risk:"Free onboarding module sent"},
                {system:"📊 Category/Skill",on_upgrade:"Search priority boost enabled",on_cancel:"Priority removed",on_churn_risk:"–"},
                {system:"💰 Finance",on_upgrade:"Revenue recognized (upgrade delta)",on_cancel:"–",on_churn_risk:"–"},
                {system:"💰 Marketing System",on_upgrade:"–",on_cancel:"Churn win-back campaign",on_churn_risk:"Win-back campaign triggered"},
                {system:"🏳️ Content Moderation",on_upgrade:"Higher leniency tier applied",on_cancel:"Standard limits restored",on_churn_risk:"–"},
                {system:"⚠️ Abuse Reports",on_upgrade:"Premium abuse tolerance",on_cancel:"Standard limits restored",on_churn_risk:"–"},
                {system:"🎁 Loyalty Tokens",on_upgrade:"–",on_cancel:"–",on_churn_risk:"Token injection (100-500)"},
                {system:"📣 Referrals",on_upgrade:"Affiliate commission increased",on_cancel:"–",on_churn_risk:"–"},
              ].map((item,i)=>(
                <div key={i} className="p-3 bg-zinc-800/60 rounded border border-zinc-700">
                  <div className="font-semibold text-white text-xs mb-2">{item.system}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-emerald-400">Upgrade:</span> <span className="text-zinc-300">{item.on_upgrade}</span></div>
                    <div><span className="text-red-400">Cancel:</span> <span className="text-zinc-300">{item.on_cancel}</span></div>
                    <div><span className="text-orange-400">Churn Risk:</span> <span className="text-zinc-300">{item.on_churn_risk}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
            <Crown className="w-9 h-9 text-emerald-400"/>
            <h1 className="text-3xl font-bold text-white">Subscription Management v4.0</h1>
            <Badge className="bg-emerald-600">200% INTELLIGENCE</Badge>
            <Badge className="bg-purple-700">v4.0 FULL UPGRADE</Badge>
          </div>
          <p className="text-zinc-400 text-sm">Revenue &amp; loyalty backbone obliterating Upwork Plus + Fiverr Pro/Business + Patreon + Substack + LinkedIn Premium until 2029</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Agentic AI Engine","Predictive Churn Prevention","Dynamic Pricing","Hybrid Billing","Agency Suite","Skill Tokens","Cohort Analytics","Grace Periods","Africa Hub","10 Integration Hooks"].map(s=>(
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
              className={`px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition-all ${
                activeTab===tab.id
                  ?"bg-emerald-600 text-white shadow-lg shadow-emerald-600/40"
                  :"bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab==="plans"         && renderPlans()}
          {activeTab==="subscriptions" && renderSubscriptions()}
          {activeTab==="ai"            && renderAI()}
          {activeTab==="churn"         && renderChurn()}
          {activeTab==="billing"       && renderBilling()}
          {activeTab==="agency"        && renderAgency()}
          {activeTab==="loyalty"       && renderLoyalty()}
          {activeTab==="analytics"     && renderAnalytics()}
          {activeTab==="africa"        && renderAfrica()}
          {activeTab==="integrations"  && renderIntegrations()}
        </div>
      </div>
    </div>
  );
}
