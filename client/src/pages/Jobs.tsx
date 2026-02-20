import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, Briefcase, Sparkles } from "lucide-react";
import { AIProposalHelper } from "@/components/AIProposalHelper";
import { useCurrency } from "@/lib/currency";

interface Job {
  title: string;
  company: string;
  type: string;
  budget: string;
  location: string;
  postedAt: string;
  tags: string[];
  description: string;
}

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showProposalHelper, setShowProposalHelper] = useState(false);
  const { formatAmount, formatRateRange, formatRate } = useCurrency();

  const jobs = [
    {
      title: "Senior React Developer",
      company: "Capitec Bank",
      type: "Remote",
      budget: formatRateRange(650, 850, "hr"),
      location: "Cape Town",
      postedAt: "2h ago",
      tags: ["React", "TypeScript"],
      description: "Building secure, high-performance banking interfaces."
    },
    {
      title: "Graphic Designer for Rebranding",
      company: "Woolworths",
      type: "Project",
      budget: formatAmount(45000),
      location: "Remote",
      postedAt: "5h ago",
      tags: ["Design", "Branding"],
      description: "Complete visual overhaul for our new summer campaign."
    },
    {
      title: "SEO Copywriter",
      company: "Discovery",
      type: "Part-time",
      budget: formatRate(350, "hr"),
      location: "Sandton",
      postedAt: "1d ago",
      tags: ["Copywriting", "SEO"],
      description: "Weekly blog content on investment trends."
    },
    {
      title: "Mobile App Developer (Flutter)",
      company: "Startup Inc",
      type: "Contract",
      budget: formatAmount(60000),
      location: "Remote",
      postedAt: "2d ago",
      tags: ["Flutter", "Dart"],
      description: "MVP development for a new logistics app."
    },
    {
      title: "Data Analyst",
      company: "MTN",
      type: "Full-time",
      budget: formatRate(45000, "mo"),
      location: "Johannesburg",
      postedAt: "3d ago",
      tags: ["Python", "SQL", "Tableau"],
      description: "Analyze customer usage patterns and generate insights."
    },
    {
      title: "Virtual Assistant",
      company: "Private Client",
      type: "Hourly",
      budget: formatRate(150, "hr"),
      location: "Remote",
      postedAt: "4d ago",
      tags: ["Admin", "Scheduling"],
      description: "Managing calendar and emails for an executive."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content">
      <div className="bg-primary pb-16 pt-32">
        <div className="container mx-auto px-4 md:px-6 text-center text-white">
          <h1 className="text-4xl font-display font-bold mb-4">Find Your Next Opportunity</h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Browse thousands of jobs from top South African companies and international clients.</p>
          
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input className="pl-10 h-12 bg-white text-foreground border-0" placeholder="Search by skill, keyword, or company..." />
            </div>
            <Button size="lg" className="h-12 px-8 bg-accent text-primary hover:bg-accent/90 font-bold">Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-16 pb-20 flex-1">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 font-bold text-primary mb-6">
                <Filter className="w-5 h-5" /> Filters
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {["Fixed Price", "Hourly", "Full-time", "Contract"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={type} />
                        <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Experience Level</h4>
                  <div className="space-y-2">
                    {["Entry Level", "Intermediate", "Expert"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} />
                        <label htmlFor={level} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                 <div>
                  <h4 className="text-sm font-semibold mb-3">Budget Range</h4>
                  <Slider defaultValue={[50]} max={100} step={1} className="my-4" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatAmount(100)}</span>
                    <span>{formatAmount(5000)}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl p-2 flex items-center justify-between border border-border shadow-sm">
               <span className="text-sm font-medium px-4 text-muted-foreground">Showing <span className="text-foreground font-bold">2,451</span> jobs</span>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">Sort by:</span>
                 <select className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer">
                   <option>Newest First</option>
                   <option>Highest Budget</option>
                   <option>Relevance</option>
                 </select>
               </div>
            </div>

            <div className="grid gap-4">
              {jobs.map((job, i) => (
                <div key={i} onClick={() => { setSelectedJob(job); setShowProposalHelper(true); }} className="cursor-pointer">
                  <JobCard {...job} />
                </div>
              ))}
            </div>

             <div className="flex justify-center pt-8">
               <Button variant="outline" className="w-full max-w-xs">Load More Jobs</Button>
             </div>
          </div>
        </div>
      </div>

      </main>
      <Footer />

      <Dialog open={showProposalHelper} onOpenChange={setShowProposalHelper}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Apply for: {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              Use our AI assistant to craft a compelling proposal for this job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <AIProposalHelper
              jobTitle={selectedJob.title}
              jobDescription={selectedJob.description}
              onApply={(proposal) => {
                console.log("Proposal submitted:", proposal);
                setShowProposalHelper(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}