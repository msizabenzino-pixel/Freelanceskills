import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/lib/currency";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Repeat,
  CheckCircle2,
  MessageSquare,
  Eye,
  ThumbsUp,
  Flame,
  Brain,
  Lightbulb,
  ChevronRight,
  FileText,
} from "lucide-react";

const earningsData = {
  weekly: [
    { label: "Mon", value: 1200 },
    { label: "Tue", value: 800 },
    { label: "Wed", value: 2100 },
    { label: "Thu", value: 1500 },
    { label: "Fri", value: 3200 },
    { label: "Sat", value: 900 },
    { label: "Sun", value: 400 },
  ],
  monthly: [
    { label: "Jan", value: 18500 },
    { label: "Feb", value: 22000 },
    { label: "Mar", value: 19800 },
    { label: "Apr", value: 28500 },
    { label: "May", value: 32000 },
    { label: "Jun", value: 27500 },
    { label: "Jul", value: 35000 },
    { label: "Aug", value: 31200 },
    { label: "Sep", value: 38500 },
    { label: "Oct", value: 42000 },
    { label: "Nov", value: 39800 },
    { label: "Dec", value: 45200 },
  ],
  yearly: [
    { label: "2028", value: 185000 },
    { label: "2029", value: 268000 },
    { label: "2030", value: 342000 },
    { label: "2031", value: 380000 },
  ],
};

const funnelSteps = [
  { label: "Profile Views", value: 1842, percentage: 100, color: "bg-blue-500" },
  { label: "Proposal Requests", value: 423, percentage: 23, color: "bg-indigo-500" },
  { label: "Proposals Sent", value: 312, percentage: 17, color: "bg-purple-500" },
  { label: "Interviews", value: 87, percentage: 5, color: "bg-violet-500" },
  { label: "Hired", value: 42, percentage: 2.3, color: "bg-green-500" },
];

const skillDemandData = [
  { skill: "React / Next.js", demand: 95, trend: "up", change: "+12%" },
  { skill: "Python / Django", demand: 88, trend: "up", change: "+8%" },
  { skill: "Mobile App Dev", demand: 82, trend: "up", change: "+15%" },
  { skill: "Plumbing", demand: 78, trend: "up", change: "+22%" },
  { skill: "Electrical Work", demand: 75, trend: "up", change: "+18%" },
  { skill: "UI/UX Design", demand: 72, trend: "stable", change: "+3%" },
  { skill: "Data Analysis", demand: 68, trend: "up", change: "+25%" },
  { skill: "Digital Marketing", demand: 65, trend: "down", change: "-5%" },
  { skill: "Welding & Fabrication", demand: 62, trend: "up", change: "+10%" },
  { skill: "Graphic Design", demand: 58, trend: "down", change: "-8%" },
  { skill: "Carpentry", demand: 55, trend: "stable", change: "+2%" },
  { skill: "Photography", demand: 48, trend: "down", change: "-12%" },
];

const competitiveMetrics = {
  rank: 12,
  totalInCategory: 847,
  percentile: 98.6,
  avgRating: 4.9,
  categoryAvgRating: 4.2,
  avgResponseTime: "1.2 hrs",
  categoryAvgResponseTime: "4.8 hrs",
  completionRate: 98,
  categoryAvgCompletionRate: 89,
};

const aiPredictions = [
  {
    title: "Income Forecast",
    description: "At your current +18% YoY growth rate, monthly income is projected to reach R52,000 (+24%) within 6 months. Maintaining your 98% completion rate is the key driver.",
    icon: TrendingUp,
    color: "text-green-500",
    bg: "bg-green-500/10",
    predictedValueZar: 52000,
    badge: "+24% in 6 mo",
  },
  {
    title: "High-Demand Skill Gap",
    description: "React Native developers in Gauteng command R750–R900/hr — R300 above your current rate. Adding this skill could increase your monthly income by R12,000–R18,000.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    badge: "+R15k/mo potential",
  },
  {
    title: "Pricing Opportunity",
    description: "Freelancers with your rating (4.9★) and experience level average R650/hr in your category. Raising your rate from your current level could add R3,200/mo without losing clients.",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    badge: "R650/hr market rate",
  },
  {
    title: "Client Re-Engagement",
    description: "3 past clients haven't returned in 60+ days — historically worth R8,500 in reactivated revenue. A personalized follow-up message has a 40% success rate on this platform.",
    icon: Repeat,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    badge: "~R8,500 recoverable",
  },
];

const performanceMetrics = [
  { label: "Response Rate", value: 96, unit: "%", icon: MessageSquare, color: "text-blue-500", trend: "+2%", trendPositive: true },
  { label: "Completion Rate", value: 98, unit: "%", icon: CheckCircle2, color: "text-green-500", trend: "+1%", trendPositive: true },
  { label: "Repeat Clients", value: 67, unit: "%", icon: Repeat, color: "text-purple-500", trend: "+5%", trendPositive: true },
  { label: "Avg Response Time", value: 1.2, unit: "hrs", icon: Clock, color: "text-orange-500", trend: "-0.3 hrs", trendPositive: true, trendNote: "faster" },
  { label: "Profile Views", value: 1842, unit: "/mo", icon: Eye, color: "text-indigo-500", trend: "+12%", trendPositive: true },
  { label: "Client Satisfaction", value: 4.9, unit: "/5", icon: ThumbsUp, color: "text-rose-500", trend: "+0.1", trendPositive: true },
];

export default function Analytics() {
  const { formatAmount } = useCurrency();
  const [earningsPeriod, setEarningsPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const currentEarnings = earningsData[earningsPeriod];
  const maxEarning = Math.max(...currentEarnings.map((d) => d.value));

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="animated-gradient-bg text-white pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/8 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-4" data-testid="badge-analytics-hero">
                  <BarChart3 className="w-4 h-4" />
                  Freelancer Analytics
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3" data-testid="text-analytics-title">
                  Your Performance Hub
                </h1>
                <p className="text-lg text-white/80 max-w-xl" data-testid="text-analytics-subtitle">
                  AI-powered insights to grow your freelancing career. Track earnings, analyze trends, and get smart recommendations.
                </p>
              </div>
              <Button
                variant="secondary"
                className="gap-2 font-bold shrink-0"
                data-testid="button-export-reports"
              >
                <Download className="w-4 h-4" /> Export Reports
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {performanceMetrics.map((metric, i) => (
                <Card key={i} className="p-4 hover:shadow-lg transition-shadow" data-testid={`card-metric-${i}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-display font-bold text-foreground" data-testid={`text-metric-value-${i}`}>
                      {metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground mb-0.5">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {"trendPositive" in metric && metric.trendPositive ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                    ) : metric.trend.startsWith("+") ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                    ) : metric.trend.startsWith("-") ? (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    ) : null}
                    <span className={`text-xs font-medium ${"trendPositive" in metric && metric.trendPositive ? "text-green-500" : metric.trend.startsWith("+") ? "text-green-500" : metric.trend.startsWith("-") ? "text-red-500" : "text-muted-foreground"}`}>
                      {"trendNote" in metric && metric.trendNote ? `${metric.trend} (${metric.trendNote})` : metric.trend}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card data-testid="card-earnings-chart">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Earnings Overview
                      </CardTitle>
                      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                        {(["weekly", "monthly", "yearly"] as const).map((period) => (
                          <button
                            key={period}
                            data-testid={`button-period-${period}`}
                            onClick={() => setEarningsPeriod(period)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              earningsPeriod === period
                                ? "bg-primary text-white"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1.5 h-56 mt-4">
                      {currentEarnings.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                          <span className="text-[10px] text-muted-foreground font-medium opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            {formatAmount(d.value)}
                          </span>
                          <div className="w-full relative">
                            <div
                              className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-md transition-all duration-300 group-hover/bar:from-accent group-hover/bar:to-accent/60 cursor-pointer"
                              style={{ height: `${(d.value / maxEarning) * 180}px` }}
                              data-testid={`bar-earning-${i}`}
                              title={`${d.label}: ${formatAmount(d.value)}`}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Total ({earningsPeriod})</p>
                        <p className="text-2xl font-bold text-primary" data-testid="text-total-earnings">
                          {formatAmount(currentEarnings.reduce((sum, d) => sum + d.value, 0))}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+23% vs previous</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card data-testid="card-competitive-position">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Competitive Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="text-center py-4">
                      <div className="relative inline-flex items-center justify-center w-28 h-28 mb-3">
                        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                          <circle
                            cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                            className="text-primary"
                            strokeDasharray={`${(competitiveMetrics.percentile / 100) * 327} 327`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-primary" data-testid="text-rank">#{competitiveMetrics.rank}</span>
                          <span className="text-[10px] text-muted-foreground">of {competitiveMetrics.totalInCategory}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground" data-testid="text-percentile">
                        Top {(100 - competitiveMetrics.percentile).toFixed(1)}% in your category
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Your Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium" data-testid="text-your-rating">{competitiveMetrics.avgRating}</span>
                          <span className="text-muted-foreground text-xs">(avg: {competitiveMetrics.categoryAvgRating})</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-green-500" />
                          <span className="font-medium">{competitiveMetrics.avgResponseTime}</span>
                          <span className="text-muted-foreground text-xs">(avg: {competitiveMetrics.categoryAvgResponseTime})</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{competitiveMetrics.completionRate}%</span>
                          <span className="text-muted-foreground text-xs">(avg: {competitiveMetrics.categoryAvgCompletionRate}%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card data-testid="card-client-funnel">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Client Acquisition Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {funnelSteps.map((step, i) => (
                    <div key={i} data-testid={`funnel-step-${i}`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-foreground">{step.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{step.value.toLocaleString()}</span>
                          <Badge variant="secondary" className="text-[10px]">{step.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${step.color} rounded-full transition-all duration-700`}
                          style={{ width: `${step.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Conversion Rate (View → Hire)</span>
                      <span className="font-bold text-green-600" data-testid="text-conversion-rate">2.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-skill-demand">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Skill Demand Heatmap — South Africa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {skillDemandData.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg border border-border hover:shadow-sm transition-shadow"
                        data-testid={`skill-demand-${i}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                skill.demand > 80
                                  ? "#7c3aed"
                                  : skill.demand > 60
                                  ? "#f59e0b"
                                  : "#22c55e",
                            }}
                          />
                          <span className="text-xs font-medium text-foreground truncate">{skill.skill}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {skill.trend === "up" ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                          ) : skill.trend === "down" ? (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          ) : (
                            <Activity className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span
                            className={`text-[10px] font-medium ${
                              skill.trend === "up"
                                ? "text-green-500"
                                : skill.trend === "down"
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {skill.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-600" /> High demand
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" /> Medium demand
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> Moderate demand
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary" data-testid="text-ai-predictions-heading">AI-Powered Insights</h2>
                <p className="text-sm text-muted-foreground">Smart recommendations to accelerate your growth</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPredictions.map((prediction, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  data-testid={`card-prediction-${i}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${prediction.bg} flex items-center justify-center shrink-0`}>
                        <prediction.icon className={`w-5 h-5 ${prediction.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-foreground">{prediction.title}</h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {"badge" in prediction && prediction.badge && (
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${prediction.bg} ${prediction.color}`}>
                            {prediction.badge}
                          </span>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {prediction.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <Card data-testid="card-income-projection">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Income Projection & Growth Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 pt-2">
                  <div className="text-center p-6 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Monthly</p>
                    <p className="text-3xl font-bold text-green-600" data-testid="text-current-income">{formatAmount(42000)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+18% YoY</span>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Projected (6 months)</p>
                    <p className="text-3xl font-bold text-blue-600" data-testid="text-projected-6mo">{formatAmount(52000)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-blue-500">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">+24% growth</span>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Annual Potential</p>
                    <p className="text-3xl font-bold text-purple-600" data-testid="text-annual-potential">{formatAmount(624000)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-purple-500">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Top 2% earner</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-xl">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Growth Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Add React Native to your skills (+35% earning potential)",
                      "Complete the Advanced Python certification on Academy",
                      "Increase your profile response rate from 96% to 99%",
                      "Apply to 5 more enterprise-tier projects this month",
                    ].map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 bg-primary text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <FileText className="w-10 h-10 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3" data-testid="text-export-heading">
              Export Your Analytics
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Download detailed PDF or CSV reports of your earnings, performance metrics, and AI recommendations for tax filing or business planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" className="gap-2 font-bold" data-testid="button-download-pdf">
                <Download className="w-4 h-4" /> Download PDF Report
              </Button>
              <Button variant="outline" className="gap-2 font-bold border-white/30 text-white hover:bg-white/10" data-testid="button-download-csv">
                <Download className="w-4 h-4" /> Export CSV Data
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
