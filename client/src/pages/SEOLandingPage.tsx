import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Check, ArrowRight } from "lucide-react";

const FREELANCERS = [
  { name: "Thabo M.", title: "Senior Web Developer", rating: 4.9, jobs: 47, verified: true, price: 450, location: "Johannesburg" },
  { name: "Sarah K.", title: "Full Stack Engineer", rating: 4.8, jobs: 32, verified: true, price: 380, location: "Cape Town" },
  { name: "David P.", title: "React Specialist", rating: 4.7, jobs: 28, verified: false, price: 320, location: "Durban" },
  { name: "Lisa N.", title: "Frontend Expert", rating: 5.0, jobs: 15, verified: true, price: 500, location: "Pretoria" },
];

export default function SEOLandingPage() {
  const [location] = useLocation();
  const parts = location.split("/");
  const skill = parts[2] || "web-developer";
  const city = parts[3];
  const skillTitle = skill.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const cityTitle = city?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "South Africa";
  const title = `Hire ${skillTitle} Freelancers in ${cityTitle}`;
  const description = `Find verified ${skillTitle} freelancers in ${cityTitle}. Browse portfolios, reviews, and hire instantly with escrow protection.`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <div className="bg-slate-900 border-b border-slate-800 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{title}</h1>
            <p className="text-lg text-slate-400 mb-6">{description}</p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/find-talent">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                  <ArrowRight className="w-4 h-4 mr-2" /> Browse All Freelancers
                </Button>
              </Link>
              <Link href="/post-job">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-slate-950 border-b border-slate-800 py-4 px-4">
          <div className="container mx-auto max-w-4xl flex flex-wrap gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> 500+ Verified Freelancers</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> Escrow Protected</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> 48h Dispute Resolution</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> ZAR Payments</span>
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <h2 className="text-xl font-bold text-white mb-6">Top {skillTitle} Freelancers in {cityTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FREELANCERS.map((f, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">
                    {f.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      {f.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{f.title}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-current" />{f.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">R{f.price}/hr</div>
                    <div className="text-[10px] text-slate-500">{f.jobs} jobs</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                  <Link href={`/profile/freelancer-${i}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">View Profile</Button>
                  </Link>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">Hire</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <h2 className="text-xl font-bold text-white mb-6">FAQ</h2>
          <div className="space-y-3">
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-bold text-white mb-1">How do I hire a {skillTitle} freelancer?</h3>
              <p className="text-sm text-slate-400">Browse profiles, check reviews, and click "Hire" to start an escrow-protected project.</p>
            </Card>
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-bold text-white mb-1">Is payment safe?</h3>
              <p className="text-sm text-slate-400">Yes. All payments are held in escrow until you approve the work.</p>
            </Card>
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-bold text-white mb-1">Can I hire locally in {cityTitle}?</h3>
              <p className="text-sm text-slate-400">Absolutely. Use location filters to find freelancers in {cityTitle} or nearby.</p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
