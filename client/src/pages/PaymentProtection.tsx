import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Shield, Lock, CheckCircle2, Wallet, FileText, Clock, AlertTriangle,
  ArrowRight, MessageSquare, UserCheck, Banknote, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";

function StepCard({ number, title, children, icon: Icon }: { number: number; title: string; children: React.ReactNode; icon: any }) {
  return (
    <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8" data-testid={`step-card-${number}`}>
      <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

function GuaranteeCard({ title, forWho, icon: Icon, items, accent = "emerald" }: { title: string; forWho: string; icon: any; items: string[]; accent?: "emerald" | "blue" }) {
  const tone = accent === "blue"
    ? { bg: "bg-blue-500/5", border: "border-blue-500/30", iconBg: "bg-blue-500/10", icon: "text-blue-500", check: "text-blue-500" }
    : { bg: "bg-emerald-500/5", border: "border-emerald-500/30", iconBg: "bg-emerald-500/10", icon: "text-emerald-500", check: "text-emerald-500" };
  return (
    <div className={`${tone.bg} border ${tone.border} rounded-2xl p-6 md:p-8`} data-testid={`guarantee-${forWho}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${tone.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${tone.icon}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">For {forWho}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className={`w-4 h-4 ${tone.check} mt-0.5 shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PaymentProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can a client cancel after funding escrow?",
      a: "A client can request a cancellation before the freelancer begins work. Once the freelancer has started and communicated progress, cancellation requires the mutual agreement of both parties or a dispute resolution outcome."
    },
    {
      q: "What if a freelancer disappears after being paid a milestone?",
      a: "Milestone payments are structured so that each milestone is funded and approved independently. If a freelancer becomes unresponsive after a milestone is released, you can close the contract and open a dispute for any future unfunded milestones. Freelancers who abandon contracts receive permanent account flags."
    },
    {
      q: "Is my payment data secure?",
      a: "All payment processing on FreelanceSkills.net is handled through PCI-DSS compliant payment infrastructure. We do not store card numbers. All escrow funds are held in a segregated trust account and are not used for any platform operating expenses."
    },
    {
      q: "What currency does FreelanceSkills.net use?",
      a: "All local South African transactions are processed in ZAR. There are no currency conversion fees for domestic projects."
    },
    {
      q: "How long does a dispute take to resolve?",
      a: "Our dispute resolution process has a 94% resolution rate without escalation. Most disputes are resolved within 5 business days from the time a Resolution Specialist is assigned."
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <div className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Shield className="w-4 h-4" />
              Escrow Protected
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Your Money is Protected. Every Single Rand.
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Whether you are hiring a developer in Cape Town or a plumber in Soweto, your money does not move until you say so. This is how FreelanceSkills.net keeps every transaction safe — for clients and freelancers alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/pricing">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold" data-testid="button-view-pricing">
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/post-job">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold" data-testid="button-post-job">
                  Post a Job Free
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works — Step by Step */}
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">How It Works — Step by Step</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every project follows the same secure path. Both parties know exactly where they stand at every stage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <StepCard number={1} title="Client Funds the Project" icon={Wallet}>
              <p>When a client accepts a proposal and confirms a hire, they deposit the full project value (or the first milestone amount) into the FreelanceSkills.net escrow account.</p>
              <p>This money is held securely and is not accessible to the freelancer yet. The client sees a confirmation and a receipt. The freelancer receives a notification that funds are secured and work can begin.</p>
              <p className="font-semibold text-foreground">Nothing moves until both parties are confirmed and the escrow is funded. A freelancer will never begin work on an unfunded project on this platform.</p>
            </StepCard>

            <StepCard number={2} title="Freelancer Delivers the Work" icon={FileText}>
              <p>The freelancer completes the agreed scope and submits the deliverable through the platform.</p>
              <p>All communication, file transfers, and delivery confirmations happen inside the FreelanceSkills.net workspace so there is always a clear, timestamped record.</p>
            </StepCard>

            <StepCard number={3} title="Client Reviews and Approves" icon={UserCheck}>
              <p>The client has <strong className="text-foreground">5 business days</strong> to review the delivery and either approve it or raise a revision request.</p>
              <p>If the client approves, payment is released from escrow to the freelancer immediately.</p>
              <p>If the client requests a revision, the freelancer is notified with the specific feedback. A revision counter tracks all change requests. If the delivered work meets the agreed scope and the client does not respond within 5 business days, payment is released automatically.</p>
            </StepCard>

            <StepCard number={4} title="Freelancer is Paid" icon={Banknote}>
              <p>Once payment is released from escrow, the freelancer receives their earnings (minus the platform service fee) within <strong className="text-foreground">24 hours</strong> for EFT and PayShap transactions.</p>
              <p>Card-funded payouts process within 2 business days.</p>
            </StepCard>
          </div>
        </div>

        {/* What Happens If Something Goes Wrong */}
        <div id="disputes" className="bg-secondary/50 py-20 scroll-mt-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 rounded-full px-4 py-2 mb-4 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Dispute Resolution
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">What Happens If Something Goes Wrong</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                If a client and freelancer cannot agree on whether the work meets scope, either party can open a formal dispute within the FreelanceSkills.net platform.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Open a Dispute</h4>
                    <p className="text-sm text-muted-foreground">Disputes must be opened within 5 business days of delivery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Resolution Specialist Assigned</h4>
                    <p className="text-sm text-muted-foreground">A FreelanceSkills.net Resolution Specialist is assigned within <strong>24 hours</strong>.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Evidence Review</h4>
                    <p className="text-sm text-muted-foreground">Both parties submit their evidence — the original brief, all communications, and the delivered files. The Resolution Specialist reviews all evidence.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Binding Decision</h4>
                    <p className="text-sm text-muted-foreground">The Resolution Specialist issues a binding decision within <strong>5 business days</strong>. Funds are released, split, or refunded based on the decision.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-700">
                    Our dispute resolution process has a <strong>94% resolution rate</strong> without escalation. We do not take sides — we follow the evidence.
                  </p>
                </div>
              </div>
            </div>

            {/* When Refunds / When Payment Released */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-10">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-500" />
                  When a Refund is Issued
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    The freelancer fails to deliver within the agreed deadline and does not communicate a delay
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    The delivered work is materially different from the agreed brief with no attempt to remedy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    The freelancer cancels the project after funding
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                  A <strong>partial refund</strong> may be issued when work has been partially completed and meets part of the agreed scope.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  When Payment is Released to the Freelancer
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    The client approves the delivery
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    The client does not respond within 5 business days of delivery
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Our Resolution Specialist determines the delivery meets the agreed brief
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Your Guarantees */}
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Your Guarantees</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These are not marketing promises. These are the rules every transaction on this platform follows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <GuaranteeCard
              title="You Are Always in Control"
              forWho="Clients"
              icon={Shield}
              items={[
                "Your money never reaches a freelancer until you approve the work or choose not to respond.",
                "You are always in control of release.",
                "No freelancer can access your funds without your explicit approval."
              ]}
            />
            <GuaranteeCard
              title="You Are Guaranteed Payment"
              forWho="Freelancers"
              icon={Lock}
              accent="blue"
              items={[
                "Once funds are in escrow, you are guaranteed payment for work that meets the agreed brief.",
                "No client can withhold payment without cause.",
                "Payment is released within 24 hours of approval."
              ]}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4 text-sm font-medium text-primary">
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Common Questions About Payment Protection</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden" data-testid={`faq-${i}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                    data-testid={`faq-button-${i}`}
                  >
                    <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed" data-testid={`faq-answer-${i}`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-4 md:px-6 py-20 text-center">
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-white max-w-4xl mx-auto">
            <Shield className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to hire with confidence?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Every project on FreelanceSkills.net is protected by escrow. Your money is safe, and freelancers are guaranteed fair payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/post-job">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold" data-testid="button-cta-post-job">
                  Post a Job Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/cv-upload">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold" data-testid="button-cta-join">
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
