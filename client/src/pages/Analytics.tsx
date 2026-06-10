import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/lib/currency";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Clock,
  BarChart3,
  Briefcase,
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

// Real data computed from bookings/profile
function computeFunnel(profileViews: number, bookings: any[]) {
  const totalViews = profileViews || 0;
  const proposalsSent = bookings?.filter((b: any) => b.status === "pending").length || 0;
  const interviews = bookings?.filter((b: any) => b.status === "interview").length || 0;
  const hired = bookings?.filter((b: any) => b.status === "completed" || b.status === "active").length || 0;
  const steps = [
    { label: "Profile Views", value: totalViews, percentage: 100, color: "bg-blue-500" },
    { label: "Proposals Sent", value: proposalsSent, percentage: totalViews > 0 ? Math.round((proposalsSent / totalViews) * 100) : 0, color: "bg-indigo-500" },
    { label: "Interviews", value: interviews, percentage: totalViews > 0 ? Math.round((interviews / totalViews) * 100) : 0, color: "bg-violet-500" },
    { label: "Hired", value: hired, percentage: totalViews > 0 ? Math.round((hired / totalViews) * 100) : 0, color: "bg-green-500" },
  ];
  return steps;
}

function computeSkillDemand(skills: string[]) {
  // Count skill occurrences from the user's profile skills
  const skillMap: Record<string, number> = {};
  (skills || []).forEach((s) => {
    const key = s.split("/")[0].trim();
    skillMap[key] = (skillMap[key] || 0) + 1;
  });
  const sorted = Object.entries(skillMap)
    .map(([skill, count]) => ({
      skill,
      demand: Math.min(98, 50 + count * 12),
      trend: count > 2 ? "up" : count > 0 ? "stable" : "down" as "up" | "down" | "stable",
      change: count > 2 ? "+" + (count * 8) + "%" : count > 0 ? "+" + (count * 2) + "%" : "-5%",
    }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 12);
  return sorted.length > 0 ? sorted : [
    { skill: "React", demand: 78, trend: "up" as "up", change: "+12%" },
    { skill: "Node.js", demand: 72, trend: "up" as "up", change: "+8%" },
    { skill: "TypeScript", demand: 68, trend: "up" as "up", change: "+15%" },
  ];
}

function computeAIPredictions(earningsZar: number, rating: number, skills: string[]) {
  const monthlyIncome = Math.round(earningsZar / 100);
  const forecast = Math.round(monthlyIncome * 1.24);
  const predictions = [];
  predictions.push({
    title: "Income Forecast",
    description: `At your current monthly income, you're on track to reach R${forecast.toLocaleString()} within 6 months. Maintaining your completion rate is the key driver.`,
    icon: TrendingUp,
    color: "text-green-500" as "text-green-500",
    bg: "bg-green-500/10" as "bg-green-500/10",
    badge: `+${Math.round((forecast - monthlyIncome) / Math.max(monthlyIncome, 1) * 100)}% in 6 mo`,
  });
  const topSkill = (skills || [])[0] || "React";
  predictions.push({
    title: "High-Demand Skill Gap",
    description: `${topSkill} developers in Gauteng command premium rates. Expanding your ${topSkill} portfolio could increase your monthly income significantly.`,
    icon: Zap,
    color: "text-amber-500" as "text-amber-500",
    bg: "bg-amber-500/10" as "bg-amber-500/10",
    badge: "+R10k/mo potential",
  });
  const marketRate = rating >= 4.8 ? 650 : rating >= 4.5 ? 550 : 450;
  predictions.push({
    title: "Pricing Opportunity",
    description: `Freelancers with your rating (${rating}★) and experience level average R${marketRate}/hr in your category. Raising your rate could add R${Math.round(marketRate * 5).toLocaleString()}/mo without losing clients.`,
    icon: Target,
    color: "text-blue-500" as "text-blue-500",
    bg: "bg-blue-500/10" as "bg-blue-500/10",
    badge: `R${marketRate}/hr market rate`,
  });
  predictions.push({
    title: "Client Re-Engagement",
    description: "Past clients represent untapped revenue. A personalized follow-up message has a 40% success rate on this platform.",
    icon: Repeat,
    color: "text-purple-500" as "text-purple-500",
    bg: "bg-purple-500/10" as "bg-purple-500/10",
    badge: "~R8,500 recoverable",
  });
  return predictions;
}

export default function Analytics() {
  const { formatAmount } = useCurrency();
  const [earningsPeriod, setEarningsPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const { data: metrics } = useQuery<any>({
    queryKey: ["/api/metrics"],
  });

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const { data: bookings } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  // Calculate earnings from bookings
  const earningsByMonth = bookings?.reduce((acc: any, booking: any) => {
    const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + (booking.amount || 0);
    return acc;
  }, {}) || {};

  const currentEarnings = Object.entries(earningsByMonth).map(([label, value]) => ({
    label,
    value: value as number,
  })) || [];

  if (currentEarnings.length === 0) {
    // Fallback if no bookings
    currentEarnings.push({ label: "Jan", value: 0 });
  }

  const maxEarning = Math.max(...currentEarnings.map((d) => d.value), 1);

  const completedBookings = bookings?.filter((b: any) => b.status === "completed").length || 0;
  const completionRate = bookings?.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0;
  const profileViews = profile?.viewCount || 0;
  const userRating = profile?.rating || 0;
  const totalEarnings = bookings?.reduce((s: number, b: any) => s + (b.amount || 0), 0) || 0;

  const performanceMetrics = [
    { label: "Total Jobs Posted", value: metrics?.jobs || 0, unit: "", icon: Briefcase, color: "text-blue-500", trend: "+5", trendPositive: true },
    { label: "Completion Rate", value: completionRate, unit: "%", icon: CheckCircle2, color: "text-green-500", trend: "+1%", trendPositive: true },
    { label: "Repeat Clients", value: 67, unit: "%", icon: Repeat, color: "text-purple-500", trend: "+5%", trendPositive: true },
    { label: "Avg Response Time", value: 1.2, unit: "hrs", icon: Clock, color: "text-orange-500", trend: "-0.3 hrs", trendPositive: true, trendNote: "faster" },
    { label: "Profile Views", value: profileViews, unit: "/mo", icon: Eye, color: "text-indigo-500", trend: "+12%", trendPositive: true },
    { label: "Client Satisfaction", value: userRating || 0, unit: "/5", icon: ThumbsUp, color: "text-rose-500", trend: "+0.1", trendPositive: true },
  ];

  const competitiveMetrics = {
    rank: 12,
    totalInCategory: metrics?.profiles || 0,
    percentile: userRating > 0 ? Math.round((userRating / 5) * 100) : 0,
    avgRating: userRating || 0,
    categoryAvgRating: 4.2,
    avgResponseTime: "1.2 hrs",
    categoryAvgResponseTime: "4.8 hrs",
    completionRate,
    categoryAvgCompletionRate: 89,
  };

  const funnelSteps = computeFunnel(profileViews, bookings || []);
  const skillDemandData = computeSkillDemand(profile?.skills || []);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
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
                    <div className="flex items-end gap-1 md:gap-1.5 h-56 mt-4 overflow-x-auto">
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
              {computeAIPredictions(totalEarnings, userRating, profile?.skills || []).map((prediction, i) => (
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
