import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobLifecycleCard } from "@/components/JobLifecycleCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Wallet, MessageSquare, Settings, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const activeContracts = [
    {
      title: "Mobile App UI Design",
      freelancer: "Sarah L.",
      budget: "R12,500",
      initialStatus: "in_progress" as const,
      description: "Finalizing the high-fidelity mockups for the checkout screen and profile settings."
    },
    {
      title: "Python Scraper Development",
      freelancer: "Thabo M.",
      budget: "R5,000",
      initialStatus: "delivered" as const,
      description: "Work has been submitted. Please review the codebase and documentation before releasing payment."
    }
  ];

  const recentlyCompleted = [
    {
      title: "SEO Strategy Whitepaper",
      freelancer: "Nandi Z.",
      budget: "R8,000",
      initialStatus: "completed" as const,
      description: "Complete 50-page SEO strategy delivered and approved."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Client Dashboard</h1>
            <p className="text-muted-foreground">Manage your active jobs and intellectual service contracts.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-sm">
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                 <Wallet className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Escrow Balance</div>
                 <div className="text-lg font-bold text-primary">R17,500.00</div>
               </div>
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
                  { icon: LayoutDashboard, label: "Overview", active: true },
                  { icon: MessageSquare, label: "Messages", count: 3 },
                  { icon: Wallet, label: "Payments" },
                  { icon: Settings, label: "Settings" }
                ].map((item) => (
                  <button key={item.label} className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {item.count && <span className="bg-accent text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">{item.count}</span>}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                <TabsTrigger value="active" className="rounded-lg font-bold px-6">Active Jobs</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg font-bold px-6">History</TabsTrigger>
                <TabsTrigger value="disputed" className="rounded-lg font-bold px-6 text-red-500">Disputes</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-6">
                <div className="grid gap-6">
                  {activeContracts.map((job, i) => (
                    <JobLifecycleCard key={i} {...job} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                <div className="grid gap-6">
                  {recentlyCompleted.map((job, i) => (
                    <JobLifecycleCard key={i} {...job} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="disputed" className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <AlertCircle className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <h3 className="font-bold text-lg text-primary">No active disputes</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">Disputes are rare and handled by our admin team within 48 hours.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}