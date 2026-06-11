import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, Banknote, ShieldCheck, Wrench, Clock, Zap, CheckCircle2,
  Globe, Users, Award, TrendingUp
} from "lucide-react";

function ReasonCard({ icon: Icon, title, description, highlight }: { icon: any; title: string; description: string; highlight?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors" data-testid={`reason-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
      {highlight && (
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 rounded-full px-3 py-1 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {highlight}
        </div>
      )}
    </div>
  );
}

export default function WhyUs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <div className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Why South African Freelancers and Clients Choose FreelanceSkills.net
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              You have options. Upwork is global. Fiverr is popular. We are not competing with them on size. We are competing on fit. And for anyone hiring or working in South Africa, fit wins every time.
            </p>
          </div>
        </div>

        {/* The Five Reasons */}
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <ReasonCard
              icon={Banknote}
              title="We operate in Rands. They operate in Dollars."
              description="Every transaction on FreelanceSkills.net happens in ZAR. No currency conversion. No exchange rate risk. No surprise rand-to-dollar calculation when you check your payout. If you earn R5,000 on a project, you receive R4,500 in your South African bank account. That is it."
              highlight="No currency conversion fees"
            />
            <ReasonCard
              icon={ShieldCheck}
              title="We verify South African identity. They cannot."
              description="Our identity verification is built for South African IDs and passports. Every freelancer on this platform has had their identity confirmed by an automated check that Upwork and Fiverr do not run for local documents. You know who you are hiring."
              highlight="SA ID + selfie liveness check"
            />
            <ReasonCard
              icon={Wrench}
              title="We include skilled trades. They do not."
              description="You cannot find a CIDB-registered contractor or a COC-certified electrician on Upwork. You can here. We built category infrastructure for South Africa's skilled trades sector because 18 million South African workers are in the trades and construction economy, and they deserve a professional marketplace too."
              highlight="CIDB · COC · Trade licences"
            />
            <ReasonCard
              icon={Clock}
              title="Your dispute goes to a person, in your timezone."
              description="Upwork's dispute process runs through a US-based team. Fiverr's resolution can take weeks. When something goes wrong on FreelanceSkills.net, a Resolution Specialist responds within 24 hours, operates in SAST, understands South African business norms, and closes disputes within 5 business days."
              highlight="24h response · 5-day close"
            />
          </div>

          {/* The Fee Difference — Full Width Highlight */}
          <div className="mt-12 max-w-5xl mx-auto bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/20 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  We do not take 20%. We take 10%.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fiverr charges freelancers 20% on every project. Upwork charges up to 20% on new clients. We charge 10%, full stop. A freelancer earning R200,000 a year on our platform keeps R20,000 more than they would on Fiverr. That is real money.
                </p>
              </div>
              <div className="shrink-0 text-center">
                <div className="text-4xl font-bold text-emerald-500">10%</div>
                <div className="text-sm text-muted-foreground">freelancer fee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">At a Glance</h2>
              <p className="text-muted-foreground">How FreelanceSkills.net compares on the features that matter most.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-0 text-sm">
                <div className="p-4 font-bold text-foreground bg-muted/50 border-b border-border">Feature</div>
                <div className="p-4 font-bold text-foreground bg-muted/50 border-b border-border text-center">FreelanceSkills.net</div>
                <div className="p-4 font-bold text-muted-foreground bg-muted/50 border-b border-border text-center">Upwork / Fiverr</div>

                {[
                  { feature: "Currency", us: "ZAR (South African Rand)", them: "USD (US Dollar)", usWin: true },
                  { feature: "Freelancer Fee", us: "10% flat", them: "Up to 20%", usWin: true },
                  { feature: "Identity Verification", us: "SA ID + Passport + Selfie", them: "Generic global check", usWin: true },
                  { feature: "Skilled Trades", us: "CIDB, COC, licence fields", them: "Not supported", usWin: true },
                  { feature: "Dispute Resolution", us: "SA-based, 24h response", them: "US-based, 1-2 weeks", usWin: true },
                  { feature: "Escrow Protection", us: "Yes", them: "Yes", usWin: false },
                  { feature: "Mobile-First", us: "PWA + Android priority", them: "Native iOS + Android", usWin: false },
                  { feature: "AI Matching", us: "Smart Brief Builder", them: "Uma AI / Fiverr Neo", usWin: false },
                ].map((row, i) => (
                  <>
                    <div key={`f-${i}`} className="p-4 border-b border-border font-medium text-foreground">{row.feature}</div>
                    <div key={`us-${i}`} className={`p-4 border-b border-border text-center ${row.usWin ? "text-emerald-600 font-semibold" : "text-muted-foreground"}`}>
                      {row.usWin && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                      {row.us}
                    </div>
                    <div key={`them-${i}`} className="p-4 border-b border-border text-center text-muted-foreground">{row.them}</div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="container mx-auto px-4 md:px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-foreground leading-relaxed mb-8">
              FreelanceSkills.net is not a smaller version of Upwork. It is the <strong>right platform</strong> for the South African market, built from the ground up to serve South African talent and the clients who need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/post-job">
                <Button size="lg" className="font-bold" data-testid="button-why-post-job">
                  Post a Job Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/cv-upload">
                <Button size="lg" variant="outline" className="font-bold" data-testid="button-why-join">
                  Join as a Freelancer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
