import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf,
  TreePine,
  Zap,
  Droplets,
  Wind,
  Globe,
  Award,
  TrendingDown,
  Car,
  Home,
  Monitor,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
  Target,
  Recycle,
  Sun,
  CloudRain,
} from "lucide-react";

const carbonMetrics = [
  { icon: TrendingDown, value: "4,280", unit: "kg CO₂", label: "Total Carbon Saved", color: "text-green-600", bg: "bg-green-500/10" },
  { icon: TreePine, value: "214", unit: "trees", label: "Equivalent Trees Planted", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { icon: Car, value: "17,120", unit: "km", label: "Commute Distance Avoided", color: "text-blue-600", bg: "bg-blue-500/10" },
  { icon: Zap, value: "1,850", unit: "kWh", label: "Energy Saved", color: "text-amber-600", bg: "bg-amber-500/10" },
];

const greenBadges = [
  { name: "Eco Starter", description: "Complete 5 remote projects", icon: Leaf, earned: true, level: 1, color: "text-green-500" },
  { name: "Carbon Saver", description: "Save 100kg CO₂ through remote work", icon: TrendingDown, earned: true, level: 2, color: "text-emerald-500" },
  { name: "Green Champion", description: "Maintain 90%+ remote work rate for 6 months", icon: Award, earned: true, level: 3, color: "text-teal-500" },
  { name: "Tree Planter", description: "Equivalent of 50 trees through remote savings", icon: TreePine, earned: false, level: 4, color: "text-green-700" },
  { name: "Sustainability Leader", description: "Top 10% greenest freelancers", icon: Trophy, earned: false, level: 5, color: "text-amber-500" },
  { name: "Net Zero Hero", description: "Achieve carbon-neutral freelancing status", icon: Globe, earned: false, level: 6, color: "text-blue-600" },
];

const leaderboard = [
  { rank: 1, name: "Ayanda M.", location: "Cape Town", score: 98, co2Saved: "892 kg", badge: "Net Zero Hero", avatar: "AM" },
  { rank: 2, name: "Pieter V.", location: "Stellenbosch", score: 95, co2Saved: "845 kg", badge: "Sustainability Leader", avatar: "PV" },
  { rank: 3, name: "Fatima N.", location: "Johannesburg", score: 93, co2Saved: "780 kg", badge: "Sustainability Leader", avatar: "FN" },
  { rank: 4, name: "Sipho D.", location: "Durban", score: 91, co2Saved: "720 kg", badge: "Green Champion", avatar: "SD" },
  { rank: 5, name: "Lerato K.", location: "Pretoria", score: 89, co2Saved: "695 kg", badge: "Green Champion", avatar: "LK" },
  { rank: 6, name: "James O.", location: "Nairobi", score: 87, co2Saved: "650 kg", badge: "Green Champion", avatar: "JO" },
  { rank: 7, name: "Thandi M.", location: "Bloemfontein", score: 85, co2Saved: "610 kg", badge: "Carbon Saver", avatar: "TM" },
  { rank: 8, name: "Blessing C.", location: "Lagos", score: 82, co2Saved: "580 kg", badge: "Carbon Saver", avatar: "BC" },
];

const sdgGoals = [
  { number: 7, title: "Affordable & Clean Energy", description: "Promoting energy-efficient remote workspaces", icon: Sun, progress: 68, color: "bg-yellow-500" },
  { number: 8, title: "Decent Work & Economic Growth", description: "Creating sustainable freelance opportunities across Africa", icon: TrendingDown, progress: 82, color: "bg-red-500" },
  { number: 9, title: "Industry, Innovation & Infrastructure", description: "Building digital infrastructure for remote collaboration", icon: Monitor, progress: 75, color: "bg-orange-500" },
  { number: 11, title: "Sustainable Cities & Communities", description: "Reducing urban congestion through remote work", icon: Home, progress: 60, color: "bg-amber-600" },
  { number: 12, title: "Responsible Consumption", description: "Minimizing resource waste in project delivery", icon: Recycle, progress: 55, color: "bg-yellow-700" },
  { number: 13, title: "Climate Action", description: "Tracking and reducing carbon emissions from work", icon: CloudRain, progress: 72, color: "bg-green-600" },
];

const greenProjectTags = [
  "Remote Only", "Paperless", "Renewable Energy", "Eco-Friendly", "Carbon Neutral",
  "Sustainable Materials", "Green Tech", "Circular Economy", "Water Conservation",
  "Waste Reduction", "Clean Energy", "Social Impact",
];

export default function Sustainability() {
  const [workMode, setWorkMode] = useState<"remote" | "hybrid" | "onsite">("remote");
  const [commuteKm, setCommuteKm] = useState(25);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const emissionsPerKm = 0.21;
  const weeksPerYear = 48;
  const onsiteCO2 = commuteKm * 2 * daysPerWeek * weeksPerYear * emissionsPerKm;
  const hybridCO2 = onsiteCO2 * 0.4;
  const remoteCO2 = onsiteCO2 * 0.05;

  const selectedCO2 = workMode === "remote" ? remoteCO2 : workMode === "hybrid" ? hybridCO2 : onsiteCO2;
  const savedCO2 = onsiteCO2 - selectedCO2;
  const treesEquivalent = Math.round(savedCO2 / 20);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white pt-32 pb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-green-300 text-sm font-medium mb-6" data-testid="badge-sustainability-hero">
              <Leaf className="w-4 h-4" />
              Green Freelancing Initiative
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6" data-testid="text-sustainability-title">
              Sustainability Score &<br />Carbon Tracker
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed" data-testid="text-sustainability-subtitle">
              Track your environmental impact, earn green badges, and join Africa's movement
              toward sustainable freelancing.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-metrics-heading">Your Environmental Impact</h2>
              <p className="text-muted-foreground text-lg">See how remote freelancing helps the planet</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {carbonMetrics.map((metric, i) => (
                <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow" data-testid={`card-metric-${i}`}>
                  <div className={`w-12 h-12 rounded-xl ${metric.bg} flex items-center justify-center mx-auto mb-3`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-0.5" data-testid={`text-metric-value-${i}`}>
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{metric.unit}</p>
                  <p className="text-sm text-muted-foreground font-medium" data-testid={`text-metric-label-${i}`}>{metric.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-calculator-heading">Carbon Footprint Calculator</h2>
              <p className="text-muted-foreground text-lg">Compare your carbon savings: remote vs onsite work</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 md:p-8" data-testid="card-calculator">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Work Mode</h3>
                    <div className="flex gap-3 mb-6">
                      {(["remote", "hybrid", "onsite"] as const).map((mode) => (
                        <Button
                          key={mode}
                          variant={workMode === mode ? "default" : "outline"}
                          onClick={() => setWorkMode(mode)}
                          className="flex-1 capitalize"
                          data-testid={`button-mode-${mode}`}
                        >
                          {mode === "remote" && <Monitor className="w-4 h-4 mr-1.5" />}
                          {mode === "hybrid" && <Home className="w-4 h-4 mr-1.5" />}
                          {mode === "onsite" && <Car className="w-4 h-4 mr-1.5" />}
                          {mode}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          One-way commute distance: <span className="text-primary font-bold">{commuteKm} km</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={commuteKm}
                          onChange={(e) => setCommuteKm(Number(e.target.value))}
                          className="w-full accent-green-600"
                          data-testid="input-commute-km"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Work days per week: <span className="text-primary font-bold">{daysPerWeek}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="7"
                          value={daysPerWeek}
                          onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                          className="w-full accent-green-600"
                          data-testid="input-days-per-week"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 day</span>
                          <span>7 days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-600">Onsite Emissions</span>
                          <span className="text-lg font-bold text-red-600" data-testid="text-onsite-co2">{Math.round(onsiteCO2).toLocaleString()} kg CO₂/yr</span>
                        </div>
                        <Progress value={100} className="h-2 [&>div]:bg-red-500" />
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-amber-600">Hybrid Emissions</span>
                          <span className="text-lg font-bold text-amber-600" data-testid="text-hybrid-co2">{Math.round(hybridCO2).toLocaleString()} kg CO₂/yr</span>
                        </div>
                        <Progress value={40} className="h-2 [&>div]:bg-amber-500" />
                      </div>
                      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-600">Remote Emissions</span>
                          <span className="text-lg font-bold text-green-600" data-testid="text-remote-co2">{Math.round(remoteCO2).toLocaleString()} kg CO₂/yr</span>
                        </div>
                        <Progress value={5} className="h-2 [&>div]:bg-green-500" />
                      </div>
                    </div>

                    {workMode !== "onsite" && (
                      <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-700 mb-1">You save approximately</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="text-co2-saved">{Math.round(savedCO2).toLocaleString()} kg CO₂/year</p>
                        <p className="text-sm text-green-600 mt-1" data-testid="text-trees-equivalent">
                          That's like planting <strong>{treesEquivalent} trees</strong>!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-badges-heading">Green Badge System</h2>
              <p className="text-muted-foreground text-lg">Earn badges for your eco-conscious freelancing journey</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {greenBadges.map((badge, i) => (
                <Card
                  key={i}
                  className={`p-5 transition-all ${badge.earned ? "hover:shadow-lg border-green-200 dark:border-green-800" : "opacity-60"}`}
                  data-testid={`card-badge-${i}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badge.earned ? "bg-green-500/10" : "bg-muted"}`}>
                      <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground" data-testid={`text-badge-name-${i}`}>{badge.name}</h3>
                        {badge.earned && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(6)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${j < badge.level ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-leaderboard-heading">Sustainability Leaderboard</h2>
              <p className="text-muted-foreground text-lg">Top eco-conscious freelancers making a difference</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Card data-testid="card-leaderboard">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${i < 3 ? "bg-green-500/5" : ""}`}
                        data-testid={`row-leaderboard-${i}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          i === 0 ? "bg-amber-400 text-white" :
                          i === 1 ? "bg-gray-300 text-gray-700" :
                          i === 2 ? "bg-amber-700 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {entry.rank}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate" data-testid={`text-leader-name-${i}`}>{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.location}</p>
                        </div>
                        <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                          {entry.badge}
                        </Badge>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-green-600" data-testid={`text-leader-co2-${i}`}>{entry.co2Saved}</p>
                          <p className="text-xs text-muted-foreground">Score: {entry.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-green-projects-heading">Green Project Tags</h2>
              <p className="text-muted-foreground text-lg">Filter and find eco-friendly projects</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto mb-8">
              {greenProjectTags.map((tag, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="gap-2 border-green-200 hover:bg-green-50 hover:border-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                  data-testid={`button-tag-${i}`}
                >
                  <Leaf className="w-3.5 h-3.5 text-green-500" />
                  {tag}
                </Button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Tag your projects with green labels to attract eco-conscious clients and freelancers
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-sdg-heading">SDG Alignment</h2>
              <p className="text-muted-foreground text-lg">How FreelanceSkills contributes to the UN Sustainable Development Goals</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {sdgGoals.map((goal, i) => (
                <Card key={i} className="p-5 hover:shadow-md transition-shadow" data-testid={`card-sdg-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${goal.color} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-sm">{goal.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1" data-testid={`text-sdg-title-${i}`}>{goal.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{goal.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={goal.progress} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-muted-foreground shrink-0">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <Leaf className="w-12 h-12 mx-auto mb-6 text-green-300" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-cta-heading">
              Join the Green Freelancing Movement
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
              Every remote project reduces carbon emissions. Start tracking your impact today
              and earn recognition as an eco-conscious professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 font-bold px-8 bg-green-500 hover:bg-green-600" data-testid="button-track-impact">
                Start Tracking Your Impact <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 font-bold px-8 border-white/30 text-white hover:bg-white/10" data-testid="button-browse-green">
                Browse Green Projects <Leaf className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}