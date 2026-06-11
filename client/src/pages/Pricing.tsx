import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  CheckCircle2, ShieldCheck, Wallet, CreditCard, Landmark, Zap,
  ArrowRight, CircleDollarSign, Percent, Ban, Lock, Truck, HeartHandshake
} from "lucide-react";

const CLIENT_FEE_ROWS = [
  { value: "R500", fee: "R40", total: "R540" },
  { value: "R2,000", fee: "R160", total: "R2,160" },
  { value: "R5,000", fee: "R400", total: "R5,400" },
  { value: "R15,000", fee: "R1,200", total: "R16,200" },
  { value: "R50,000", fee: "R4,000", total: "R54,000" },
];

const FREELANCER_FEE_ROWS = [
  { value: "R500", fee: "R50", takeHome: "R450" },
  { value: "R2,000", fee: "R200", takeHome: "R1,800" },
  { value: "R5,000", fee: "R500", takeHome: "R4,500" },
  { value: "R15,000", fee: "R1,500", takeHome: "R13,500" },
  { value: "R50,000", fee: "R5,000", takeHome: "R45,000" },
];

const NEVER_CHARGES = [
  "A fee to create a profile or browse jobs",
  "A subscription to stay active on the platform",
  "A penalty for withdrawing a proposal",
  "A fee to receive payment once a project is approved",
  "A conversion fee if a client later hires you directly (after 12 months)",
];

const PAYMENT_METHODS = [
  { icon: Zap, label: "Instant EFT (via Ozow)" },
  { icon: CreditCard, label: "Debit & Credit Card (Visa, Mastercard)" },
  { icon: Wallet, label: "PayShap" },
  { icon: Landmark, label: "Manual EFT (same-day for R10,000+)" },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative bg-slate-900 border-b border-slate-800 py-20 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950" />
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                <CircleDollarSign className="w-3.5 h-3.5 mr-1.5" /> Transparent Fees
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight" data-testid="text-pricing-headline">
                Simple, Honest Pricing. No Surprises.
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto" data-testid="text-pricing-subheadline">
                The person doing the work knows exactly what they earn. The person hiring knows exactly what they pay. Everything is here.
              </p>
            </div>
          </div>
        </section>

        {/* For Clients */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">What You Pay as a Client</h2>
              </div>

              <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Posting a Job</h3>
                <p className="text-slate-400 leading-relaxed">
                  Posting a job is free. No subscription required. No listing fee. You pay nothing until you hire.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Hiring a Freelancer</h3>
                <p className="text-emerald-400 font-semibold mb-4" data-testid="text-client-service-fee">Platform Service Fee: 8% of project value</p>
                <p className="text-slate-400 leading-relaxed mb-6">
                  When you confirm a hire and fund the project, FreelanceSkills.net charges a single platform service fee of <strong className="text-white">8%</strong> on the total project value. This fee covers:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Secure escrow holding of your funds",
                    "Fraud screening and identity verification of all freelancers",
                    "Access to our dispute resolution team",
                    "Payment processing and transaction security",
                    "Platform support throughout the project",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">What Does That Look Like in Practice?</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Project Value</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Platform Fee (8%)</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Total You Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLIENT_FEE_ROWS.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/50">
                          <td className="py-3 px-4 text-white font-medium">{row.value}</td>
                          <td className="py-3 px-4 text-slate-400">{row.fee}</td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  No hidden fees. No currency conversion charges for ZAR transactions. No cancellation penalties if you close a job before hiring.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* For Freelancers */}
        <section className="py-16 sm:py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-400">
                  <Percent className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">What You Earn as a Freelancer</h2>
              </div>

              <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Joining & Bidding</h3>
                <p className="text-slate-400 leading-relaxed">
                  Creating a FreelanceSkills.net profile is free. Submitting proposals is free. You never pay to be discovered.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">When You Win Work</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  FreelanceSkills.net charges a freelancer service fee of <strong className="text-white">10%</strong> on every project paid through the platform. This fee is deducted at payout — you never pay it upfront.
                </p>

                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your Take-Home on Every Job</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Project Value</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Our Fee (10%)</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">You Receive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FREELANCER_FEE_ROWS.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/50">
                          <td className="py-3 px-4 text-white font-medium">{row.value}</td>
                          <td className="py-3 px-4 text-slate-400">{row.fee}</td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">{row.takeHome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <HeartHandshake className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Loyalty Reward — Lower Fees as You Grow</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  We reward freelancers who build long-term relationships on the platform. Once you have earned <strong className="text-white">R50,000</strong> with a single client, your service fee with that client drops to <strong className="text-white">5%</strong>. We want you to grow here, not leave.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Payment Methods Accepted</h2>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8">
                We support the following payment methods for South African transactions:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method, i) => (
                  <Card key={i} className="bg-slate-900 border-slate-800 p-5 flex items-center gap-4">
                    <div className="bg-slate-800 p-2.5 rounded-lg">
                      <method.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{method.label}</span>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-6">
                All transactions are processed in South African Rand (ZAR). No currency conversion fees apply to local projects.
              </p>
            </div>
          </div>
        </section>

        {/* What We Never Charge */}
        <section className="py-16 sm:py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-red-500/10 p-2.5 rounded-lg text-red-400">
                  <Ban className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">What We Will Never Charge You</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {NEVER_CHARGES.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust & CTA */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid sm:grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="bg-emerald-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Escrow Protected</h3>
                  <p className="text-sm text-slate-400">Every rand is held in secure escrow until work is approved.</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">PCI-DSS Compliant</h3>
                  <p className="text-sm text-slate-400">We never store card numbers. All payments are fully encrypted.</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Fast Payouts</h3>
                  <p className="text-sm text-slate-400">Freelancers receive funds within 24 hours via EFT or PayShap.</p>
                </div>
              </div>

              <div className="text-center">
                <Link href="/payment-protection">
                  <Button variant="outline" className="mb-4 mr-3">
                    <ShieldCheck className="w-4 h-4 mr-2" /> How Escrow Works
                  </Button>
                </Link>
                <Link href="/post-job">
                  <Button className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">
                    Post a Job Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
