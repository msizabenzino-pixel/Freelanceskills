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
import { LayoutDashboard, Wallet, MessageSquare, Settings, AlertCircle, PlusCircle, Package, Star, Clock, MapPin, CheckCircle2, X, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/lib/currency";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { apiRequest } from "@/lib/queryClient";

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

  const activeContracts = [
    {
      title: "Mobile App UI Design",
      freelancer: "Sarah L.",
      budget: formatAmount(12500),
      initialStatus: "in_progress" as const,
      description: "Finalizing the high-fidelity mockups for the checkout screen and profile settings."
    },
    {
      title: "Python Scraper Development",
      freelancer: "Thabo M.",
      budget: formatAmount(5000),
      initialStatus: "delivered" as const,
      description: "Work has been submitted. Please review the codebase and documentation before releasing payment."
    }
  ];

  const recentlyCompleted = [
    {
      title: "SEO Strategy Whitepaper",
      freelancer: "Nandi Z.",
      budget: formatAmount(8000),
      initialStatus: "completed" as const,
      description: "Complete 50-page SEO strategy delivered and approved."
    }
  ];

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
            <h1 className="text-3xl font-display font-bold text-primary">Client Dashboard</h1>
            <p className="text-muted-foreground">Manage your active jobs and intellectual service contracts.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                 <Wallet className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Escrow Balance</div>
                 <div className="text-lg font-bold text-primary">{formatAmount(17500)}</div>
               </div>
               <Button size="sm" className="ml-2 h-8" onClick={() => setShowPaymentModal(true)}>
                 <PlusCircle className="w-4 h-4 mr-1" /> Deposit
               </Button>
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              10% platform commission applied on completion
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-none shadow-none bg-transparent">
              <nav className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Overview" },
                  { icon: Package, label: "My Services" },
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
            {userLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : userError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-bold text-destructive mb-1">Error Loading Dashboard</h3>
                <p className="text-sm text-destructive">Could not load user information. Please refresh the page.</p>
              </div>
            ) : activeNav === "Overview" && (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                  <TabsTrigger value="active" className="rounded-lg font-bold px-6" data-testid="tab-active-jobs">Active Jobs</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg font-bold px-6" data-testid="tab-history">History</TabsTrigger>
                  <TabsTrigger value="disputed" className="rounded-lg font-bold px-6 text-red-500" data-testid="tab-disputes">Disputes</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6">
                  <div className="grid gap-6">
                    {activeContracts.map((job, i) => (
                      <JobLifecycleCard key={i} {...job} data-testid={`job-card-active-${i}`} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  <div className="grid gap-6">
                    {recentlyCompleted.map((job, i) => (
                      <JobLifecycleCard key={i} {...job} data-testid={`job-card-completed-${i}`} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="disputed" className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                     <AlertCircle className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <h3 className="font-bold text-lg text-primary" data-testid="text-no-disputes">No active disputes</h3>
                   <p className="text-muted-foreground text-sm max-w-xs mx-auto">Disputes are rare and handled by our admin team within 48 hours.</p>
                </TabsContent>
              </Tabs>
            )}

            {activeNav === "My Services" && (
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
                ) : !showCreatePackage && (
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
                )}
              </div>
            )}

            {activeNav !== "Overview" && activeNav !== "My Services" && (
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