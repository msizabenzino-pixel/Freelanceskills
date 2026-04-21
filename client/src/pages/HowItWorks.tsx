import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { VideoPlayer, VideoLanguageInfo } from "@/components/VideoPlayer";
import {
  Search,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  Briefcase,
  ArrowRight,
  FileCheck,
  Wallet,
  ThumbsUp,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

export default function HowItWorks() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="h-4 w-4" />
              How it works
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-slate-100 via-white to-slate-300 bg-clip-text text-transparent">
              How FreelanceSkills Works
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Whether you're hiring skilled professionals or offering your services — we make it simple, safe, and rewarding across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-13 px-8 font-semibold shadow-lg shadow-emerald-900/30"
                onClick={() => navigate("/how-to-hire")}
              >
                <Users className="h-5 w-5" />
                I Want to Hire
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 gap-2 h-13 px-8 font-semibold"
                onClick={() => navigate("/how-to-get-hired")}
              >
                <Briefcase className="h-5 w-5" />
                I Want to Work
              </Button>
            </div>
          </div>
        </section>

        {/* Video Introduction */}
        <section className="py-16 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-3 text-white">Watch How It Works</h2>
              <p className="text-center text-slate-400 mb-6">
                Choose your language and learn at your own pace
              </p>
              <div className="mb-6">
                <VideoLanguageInfo />
              </div>
              <VideoPlayer
                title="Getting Started with FreelanceSkills"
                duration="2:30 min"
                thumbnail="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format"
                description="A complete introduction to using our platform - available in your language"
                youtubeSearchQuery="how to use a freelance marketplace south africa"
              />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-3 text-white">Simple Steps to Success</h2>
            <p className="text-center text-slate-400 mb-14 max-w-2xl mx-auto">
              From finding the right match to completing your project, we've streamlined every step.
            </p>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* For Clients */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Clients</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Search, step: "1", title: "Find Talent", desc: "Search by skill, location, or browse service packages" },
                    { icon: MessageSquare, step: "2", title: "Connect", desc: "Message professionals and discuss your needs" },
                    { icon: CreditCard, step: "3", title: "Book & Pay", desc: "Secure escrow payment protects both parties" },
                    { icon: CheckCircle, step: "4", title: "Get Results", desc: "Approve work and release payment when satisfied" },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-emerald-500/25 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-emerald-400" />
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-12"
                  onClick={() => navigate("/how-to-hire")}
                >
                  Learn More About Hiring <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* For Freelancers */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Freelancers</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: FileCheck, step: "1", title: "Create Profile", desc: "Showcase your skills, experience, and certifications" },
                    { icon: Shield, step: "2", title: "Get Verified", desc: "Build trust with ID, qualification, and background checks" },
                    { icon: Wallet, step: "3", title: "Win Work", desc: "Apply to jobs or get booked through your service packages" },
                    { icon: ThumbsUp, step: "4", title: "Get Paid", desc: "Receive secure payment when clients approve your work" },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 hover:bg-slate-900 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-violet-500/25 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-violet-400" />
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2 border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/60 font-semibold h-12"
                  onClick={() => navigate("/how-to-get-hired")}
                >
                  Learn More About Getting Hired <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why FreelanceSkills */}
        <section className="py-20 bg-gradient-to-b from-slate-900/60 to-slate-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white mb-3">Why Choose FreelanceSkills?</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Built specifically for the African market — trusted, fast, and fair.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Shield, title: "Escrow Protection", desc: "Your payment is held safely until you approve the work", color: "emerald" },
                { icon: Star, title: "Verified Professionals", desc: "ID, qualifications, and background checks available", color: "amber" },
                { icon: Clock, title: "Same-Day Service", desc: "Find available professionals for urgent tasks", color: "blue" },
                { icon: Globe, title: "Pan-African Network", desc: "Hire or work from anywhere across the continent", color: "violet" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                    <item.icon className={`h-7 w-7 text-${item.color}-400`} />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="py-14 border-t border-slate-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-10 text-center">
              {[
                { label: "Verified Freelancers", value: "50,000+" },
                { label: "Jobs Completed", value: "120,000+" },
                { label: "Countries Supported", value: "28" },
                { label: "Avg. Response Time", value: "< 2 hrs" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-emerald-400">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Links */}
        <section className="py-16 bg-slate-900/40">
          <div className="container mx-auto px-4 text-center">
            <Lock className="h-10 w-10 text-slate-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3 text-white">Still Have Questions?</h2>
            <p className="text-slate-400 mb-8">
              Check out our detailed guides or contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                onClick={() => navigate("/how-to-hire")}
              >
                How to Hire Guide
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                onClick={() => navigate("/how-to-get-hired")}
              >
                How to Get Hired Guide
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
