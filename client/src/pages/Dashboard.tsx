import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { JobLifecycleCard } from "@/components/JobLifecycleCard";
import { PaymentModal } from "@/components/PaymentModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LayoutDashboard, 
  Wallet, 
  MessageSquare, 
  Settings, 
  AlertCircle, 
  PlusCircle, 
  Package, 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X, 
  Edit, 
  Loader2,
  TrendingUp,
  Briefcase,
  Users,
  Award
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/lib/currency";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface ServicePackageForm {
  title: string;
  description: string;
  category: string;
  price: string;
  deliveryDays: string;
  revisions: string;
  features: string[];
  featureInput: string;
}

const emptyPackageForm: ServicePackageForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  deliveryDays: "",
  revisions: "1",
  features: [],
  featureInput: "",
};

export default function Dashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [packageForm, setPackageForm] = useState<ServicePackageForm>(emptyPackageForm);
  const [packageSaved, setPackageSaved] = useState(false);
  const [dashboardRole, setDashboardRole] = useState<"client" | "freelancer">("client");
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();

  const { data: userRes, isLoading: userLoading, isError: userError } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
    enabled: !!userRes?.id,
  });

  const { data: myPackages = [], isLoading: packagesLoading, isError: packagesError } = useQuery<any[]>({
    queryKey: ["/api/packages", "my"],
    queryFn: async () => {
      if (!userRes?.id) return [];
      const res = await fetch(`/api/freelancers/${userRes.id}/packages`);
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
    enabled: !!userRes?.id,
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; price: number; duration?: string }) => {
      const res = await apiRequest("POST", "/api/packages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packages", "my"] });
      setPackageForm(emptyPackageForm);
      setPackageSaved(true);
      setTimeout(() => {
        setPackageSaved(false);
        setShowCreatePackage(false);
      }, 2000);
    },
  });

  const handleAddFeature = () => {
    const feature = packageForm.featureInput.trim();
    if (feature && !packageForm.features.includes(feature)) {
      setPackageForm(prev => ({
        ...prev,
        features: [...prev.features, feature],
        featureInput: "",
      }));
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setPackageForm(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const handleSavePackage = () => {
    if (!packageForm.title || !packageForm.description || !packageForm.category || !packageForm.price) return;
    const features = packageForm.features.length > 0 ? ` | Includes: ${packageForm.features.join(", ")}` : "";
    const deliveryInfo = packageForm.deliveryDays ? ` | ${packageForm.deliveryDays} day delivery` : "";
    const revisionsInfo = packageForm.revisions !== "1" ? ` | ${packageForm.revisions} revisions` : "";
    createPackageMutation.mutate({
      title: packageForm.title,
      description: packageForm.description + features + deliveryInfo + revisionsInfo,
      category: packageForm.category,
      price: Number(packageForm.price),
      duration: packageForm.deliveryDays ? `${packageForm.deliveryDays} days` : undefined,
    });
  };

  const clientStats = stats?.client || {
    activeJobs: [],
    escrowBalance: 0,
    totalSpent: 0,
    activeProjectsCount: 0,
    avgRatingGiven: 0,
  };

  const freelancerStats = stats?.freelancer || {
    totalEarned: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
    referralStats: { totalReferred: 0, tier: "Bronze", pendingRewards: 0 },
    activeGigs: [],
    earningsHistory: [],
  };

  const isBoth = stats?.role === "both";

  return (
    <AuthGuard message="Sign in to access your dashboard, manage jobs, and track payments.">
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content">
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        amount="5000" 
      />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">
              {dashboardRole === "client" ? "Client Dashboard" : "Freelancer Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {dashboardRole === "client" 
                ? "Manage your active jobs and intellectual service contracts." 
                : "Track your earnings, active gigs, and referral rewards."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                 <Wallet className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-[10px] text-muted-foreground font-bold uppercase leading-none">
                   {dashboardRole === "client" ? "Escrow Balance" : "Pending Payout"}
                 </div>
                 <div className="text-lg font-bold text-primary">
                   {formatAmount(dashboardRole === "client" ? clientStats.escrowBalance : freelancerStats.pendingPayouts)}
                 </div>
               </div>
               {dashboardRole === "client" && (
                 <Button size="sm" className="ml-2 h-8" onClick={() => setShowPaymentModal(true)}>
                   <PlusCircle className="w-4 h-4 mr-1" /> Deposit
                 </Button>
               )}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              10% platform commission applied on completion
            </div>
          </div>
        </div>

        {isBoth && (
          <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-fit">
            <button
              onClick={() => setDashboardRole("client")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${dashboardRole === "client" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"}`}
            >
              I'm a Client
            </button>
            <button
              onClick={() => setDashboardRole("freelancer")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${dashboardRole === "freelancer" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"}`}
            >
              I'm a Freelancer
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-none shadow-none bg-transparent">
              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Overview" },
                  { icon: dashboardRole === "client" ? Briefcase : Package, label: dashboardRole === "client" ? "My Jobs" : "My Services" },
                  { icon: MessageSquare, label: "Messages", count: 3 },
                  { icon: Wallet, label: "Payments" },
                  { icon: Settings, label: "Settings" }
                ].map((item) => (
                  <button
                    key={item.label}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => setActiveNav(item.label)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${activeNav === item.label ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {item.count && <span data-testid={`nav-count-${item.label.toLowerCase()}`} className="bg-accent text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">{item.count}</span>}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {(userLoading || statsLoading) ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : userError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-bold text-destructive mb-1">Error Loading Dashboard</h3>
                <p className="text-sm text-destructive">Could not load user information. Please refresh the page.</p>
              </div>
            ) : activeNav === "Overview" ? (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardRole === "client" ? (
                    <>
                      <Card className="border-none bg-primary/5 p-6" data-testid="dashboard-total-spent">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
                            <h3 className="text-2xl font-bold text-primary">{formatAmount(clientStats.totalSpent)}</h3>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-none bg-accent/5 p-6" data-testid="dashboard-active-projects">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Active Projects</p>
                            <h3 className="text-2xl font-bold text-primary">{clientStats.activeProjectsCount}</h3>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-none bg-secondary/5 p-6" data-testid="dashboard-avg-rating">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <Star className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Avg Rating Given</p>
                            <h3 className="text-2xl font-bold text-primary">{clientStats.avgRatingGiven.toFixed(1)}</h3>
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card className="border-none bg-primary/5 p-6" data-testid="dashboard-earnings">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Earned</p>
                            <h3 className="text-2xl font-bold text-primary">{formatAmount(freelancerStats.totalEarned)}</h3>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-none bg-accent/5 p-6" data-testid="dashboard-month-earnings">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">This Month</p>
                            <h3 className="text-2xl font-bold text-primary">{formatAmount(freelancerStats.thisMonthEarnings)}</h3>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-none bg-secondary/5 p-6" data-testid="dashboard-referrals">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Referrals</p>
                            <h3 className="text-2xl font-bold text-primary">{freelancerStats.referralStats.totalReferred}</h3>
                          </div>
                        </div>
                      </Card>
                    </>
                  )}
                </div>

                {dashboardRole === "client" ? (
                  <div className="space-y-6">
                    <section data-testid="dashboard-active-jobs">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                          <Briefcase className="w-5 h-5" /> Active Jobs
                        </h2>
                        <Link href="/post-job">
                          <Button variant="outline" size="sm" data-testid="button-post-job">Post New Job</Button>
                        </Link>
                      </div>
                      <div className="grid gap-4">
                        {clientStats.activeJobs.length > 0 ? (
                          clientStats.activeJobs.map((job: any) => (
                            <Card key={job.id} className="p-4 border border-border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-primary">{job.title}</h3>
                                  <div className="flex gap-4 mt-2">
                                    <Badge variant="secondary">{job.status}</Badge>
                                    <span className="text-sm text-muted-foreground">{job.applicantCount} applicants</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" data-testid={`view-applicants-${job.id}`}>View Applicants</Button>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                            <p className="text-muted-foreground">No active jobs found.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section data-testid="dashboard-escrow-status">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5" /> Escrow Status
                      </h2>
                      <Card className="p-6 border border-border">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-muted-foreground">Total Funds in Escrow</span>
                            <span className="text-xl font-bold text-primary">{formatAmount(clientStats.escrowBalance)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Funds are held securely by FreelanceSkills and only released when you approve the work.</p>
                        </div>
                      </Card>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section data-testid="dashboard-earnings-chart">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Earnings Overview
                      </h2>
                      <Card className="p-6 border border-border">
                        <div className="h-48 flex items-end gap-2 px-2">
                          {freelancerStats.earningsHistory.map((h: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <div 
                                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40" 
                                style={{ height: `${Math.max(10, (h.amount / 1000) * 100)}%` }}
                              />
                              <span className="text-[10px] text-muted-foreground font-medium">{h.month}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </section>

                    <section data-testid="dashboard-active-gigs">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" /> Active Gigs
                      </h2>
                      <div className="grid gap-4">
                        {freelancerStats.activeGigs.length > 0 ? (
                          freelancerStats.activeGigs.map((gig: any) => (
                            <Card key={gig.id} className="p-4 border border-border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-primary">{gig.title || "Project Work"}</h3>
                                  <p className="text-sm text-muted-foreground">Client ID: {gig.clientId}</p>
                                  <div className="flex gap-4 mt-2">
                                    <Badge variant="secondary">{gig.status}</Badge>
                                    <span className="text-sm text-muted-foreground">Due: {new Date(gig.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary">{formatAmount(gig.totalAmount)}</div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                            <p className="text-muted-foreground">No active gigs found.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section data-testid="dashboard-referrals-section">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" /> Referral Program
                      </h2>
                      <Card className="p-6 border border-border bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Tier</p>
                            <Badge className="bg-primary text-white">{freelancerStats.referralStats.tier}</Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Referred</p>
                            <p className="text-xl font-bold text-primary">{freelancerStats.referralStats.totalReferred}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Pending Rewards</p>
                            <p className="text-xl font-bold text-primary">{formatAmount(freelancerStats.referralStats.pendingRewards)}</p>
                          </div>
                        </div>
                      </Card>
                    </section>
                  </div>
                )}
              </div>
            ) : activeNav === "My Services" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary">My Service Packages</h2>
                    <p className="text-sm text-muted-foreground">Create and manage your service offerings</p>
                  </div>
                  {!showCreatePackage && (
                    <Button
                      data-testid="button-create-package"
                      onClick={() => setShowCreatePackage(true)}
                      className="gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Create Package
                    </Button>
                  )}
                </div>

                {showCreatePackage && (
                  <Card className="border border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {packageSaved ? "Package Saved!" : "Create Service Package"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {packageSaved ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-lg font-medium">Your service package is now live!</p>
                          <p className="text-sm text-muted-foreground">Clients can find and book it on the Services page.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="pkg-title">Package Title *</Label>
                              <Input
                                id="pkg-title"
                                data-testid="input-package-title"
                                placeholder="e.g., Professional Plumbing Service"
                                value={packageForm.title}
                                onChange={(e) => setPackageForm(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pkg-category">Category *</Label>
                              <Select
                                value={packageForm.category}
                                onValueChange={(val) => setPackageForm(prev => ({ ...prev, category: val }))}
                              >
                                <SelectTrigger data-testid="select-package-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SERVICE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.icon} {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pkg-description">Description *</Label>
                            <Textarea
                              id="pkg-description"
                              data-testid="input-package-description"
                              placeholder="Describe what's included in this service package..."
                              value={packageForm.description}
                              onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                              className="min-h-[100px]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="pkg-price">Price (ZAR) *</Label>
                              <Input
                                id="pkg-price"
                                data-testid="input-package-price"
                                type="number"
                                placeholder="e.g., 500"
                                value={packageForm.price}
                                onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pkg-delivery">Delivery (days)</Label>
                              <Input
                                id="pkg-delivery"
                                data-testid="input-package-delivery"
                                type="number"
                                placeholder="e.g., 3"
                                value={packageForm.deliveryDays}
                                onChange={(e) => setPackageForm(prev => ({ ...prev, deliveryDays: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pkg-revisions">Revisions</Label>
                              <Select
                                value={packageForm.revisions}
                                onValueChange={(val) => setPackageForm(prev => ({ ...prev, revisions: val }))}
                              >
                                <SelectTrigger data-testid="select-package-revisions">
                                  <SelectValue placeholder="Revisions" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["1", "2", "3", "5", "Unlimited"].map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>What's Included</Label>
                            <div className="flex gap-2">
                              <Input
                                data-testid="input-package-feature"
                                placeholder="e.g., Site inspection included"
                                value={packageForm.featureInput}
                                onChange={(e) => setPackageForm(prev => ({ ...prev, featureInput: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                              />
                              <Button type="button" variant="outline" onClick={handleAddFeature} data-testid="button-add-feature">
                                Add
                              </Button>
                            </div>
                            {packageForm.features.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {packageForm.features.map((f) => (
                                  <Badge key={f} variant="secondary" className="gap-1 pr-1">
                                    {f}
                                    <button onClick={() => handleRemoveFeature(f)} className="ml-1 hover:text-destructive">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {createPackageMutation.isError && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
                              <p className="text-sm text-destructive">
                                {createPackageMutation.error?.message || "Failed to save package. Please try again."}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3 pt-2">
                            <Button
                              data-testid="button-save-package"
                              onClick={handleSavePackage}
                              disabled={!packageForm.title || !packageForm.description || !packageForm.category || !packageForm.price || createPackageMutation.isPending}
                            >
                              {createPackageMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                              ) : (
                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Package</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              data-testid="button-cancel-package"
                              onClick={() => { setShowCreatePackage(false); setPackageForm(emptyPackageForm); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {packagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : packagesError ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-destructive mb-1">Error Loading Packages</h3>
                    <p className="text-sm text-destructive">Could not load your service packages. Please try again later.</p>
                  </div>
                ) : myPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPackages.map((pkg: any) => {
                      const cat = SERVICE_CATEGORIES.find(c => c.id === pkg.category);
                      return (
                        <Card key={pkg.id} className="border border-border" data-testid={`card-package-${pkg.id}`}>
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-primary">{pkg.title}</h3>
                                <p className="text-xs text-muted-foreground">{cat?.icon} {cat?.name}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">{formatAmount(pkg.price)}</div>
                                {pkg.duration && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3" /> {pkg.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pkg.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : !showCreatePackage ? (
                  <Card className="border border-dashed border-border">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold text-lg text-primary mb-1">No service packages yet</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                        Create your first service package to start getting bookings from clients.
                      </p>
                      <Button data-testid="button-create-first-package" onClick={() => setShowCreatePackage(true)} className="gap-2">
                        <PlusCircle className="w-4 h-4" /> Create Your First Package
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-primary">{activeNav}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">This section is coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
    </AuthGuard>
  );
}
