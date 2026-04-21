import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { VideoPlayer, VideoLanguageInfo } from "@/components/VideoPlayer";
import { useCurrency } from "@/lib/currency";
import guideThumb from "@assets/image_1775734099920.png";
import { 
  User, 
  Shield, 
  FileCheck, 
  Briefcase,
  Star,
  MessageSquare,
  Wallet,
  ArrowRight,
  CheckCircle,
  Award,
  Clock,
  TrendingUp,
  Camera,
  Target,
  Zap
} from "lucide-react";

export default function HowToGetHired() {
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-950 text-white pt-32 pb-16 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
                <span>/</span>
                <span>Getting Hired Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How to Get Hired on FreelanceSkills
              </h1>
              <p className="text-xl text-white/90">
                Build your reputation, get verified, and start earning.
                Whether you're a plumber, developer, or safety officer - we connect you with clients who need your skills.
              </p>
            </div>
          </div>
        </section>

        {/* Video Tutorial */}
        <section className="py-12 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Video Guide: Setting Up for Success</h2>
              <div className="mb-6">
                <VideoLanguageInfo />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <VideoPlayer
                  title="Creating a Winning Profile"
                  duration="4:20 min"
                  thumbnail={guideThumb}
                  youtubeSearchQuery="how to create a winning freelancer profile south africa"
                />
                <VideoPlayer
                  title="Getting Verified"
                  duration="3:10 min"
                  thumbnail={guideThumb}
                  youtubeSearchQuery="freelancer identity verification FICA south africa"
                />
                <VideoPlayer
                  title="Your First Client"
                  duration="5:30 min"
                  thumbnail={guideThumb}
                  youtubeSearchQuery="how to get your first freelance client south africa"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Your Path to Success</h2>

              {/* Step 1 */}
              <div className="mb-12 pb-12 border-b border-slate-800">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <User className="h-6 w-6 text-amber-400" />
                      Create Your Profile
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Your profile is your first impression. Make it count:
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <Camera className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Professional Photo:</strong> Clear, friendly headshot builds trust
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Clear Title:</strong> "Certified Plumber | Geyser Specialist | Johannesburg"
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileCheck className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Detailed Bio:</strong> Experience, specializations, why clients should choose you
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <strong>Skills & Services:</strong> List everything you offer with accurate pricing
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                      <p className="text-sm text-amber-300">
                        <strong>Pro Tip:</strong> Profiles with photos get 5x more inquiries. Add a portfolio of past work if possible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-12 pb-12 border-b border-slate-800">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Shield className="h-6 w-6 text-amber-400" />
                      Get Verified (Stand Out!)
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Verified freelancers get 3x more bookings. Build your trust score:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {[
                        { level: "Basic", points: "+20", items: ["Email verified", "Phone verified"] },
                        { level: "Verified", points: "+30", items: ["ID verified", "Address confirmed"] },
                        { level: "Pro", points: "+25", items: ["Qualifications checked", "References verified"] },
                        { level: "Elite", points: "+25", items: ["Professional registration", "Background check"] },
                      ].map((tier, i) => (
                        <div key={i} className="p-3 bg-slate-800/60 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{tier.level}</span>
                            <span className="text-sm text-green-600 font-medium">{tier.points} points</span>
                          </div>
                          <ul className="text-sm text-slate-400 space-y-1">
                            {tier.items.map((item, j) => (
                              <li key={j} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400">
                      For regulated trades (plumbing, electrical, safety), add your professional body registration (PIRB, ECSA, SACPCMP).
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-12 pb-12 border-b border-slate-800">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Briefcase className="h-6 w-6 text-amber-400" />
                      Create Service Packages
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Make it easy for clients to book you instantly:
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Example: Geyser Installation</h4>
                            <p className="text-sm text-slate-400">Complete geyser replacement including COC</p>
                          </div>
                          <span className="font-bold text-emerald-400">{formatAmount(4500)}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">Same-day available</span>
                          <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded">4-hour job</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-400" />
                        Set clear, competitive prices
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-400" />
                        Specify what's included and excluded
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-400" />
                        Mark availability for same-day/urgent work
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="mb-12 pb-12 border-b border-slate-800">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-amber-400" />
                      Win Work & Deliver Excellence
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Two ways to get clients:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                        <h4 className="font-semibold text-blue-200 mb-2">Apply to Jobs</h4>
                        <p className="text-sm text-blue-300">
                          Browse posted jobs and submit proposals. Write personalized applications that address the client's specific needs.
                        </p>
                      </div>
                      <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                        <h4 className="font-semibold text-green-200 mb-2">Get Instant Bookings</h4>
                        <p className="text-sm text-green-300">
                          Clients book your service packages directly. Respond quickly to booking requests - speed matters!
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/60 rounded-lg">
                      <h4 className="font-semibold mb-2">Keys to 5-Star Reviews:</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Respond within 1 hour
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-slate-400" />
                          Arrive on time (or early!)
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-slate-400" />
                          Exceed expectations
                        </li>
                        <li className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                          Communicate clearly throughout
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="mb-12">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Wallet className="h-6 w-6 text-amber-400" />
                      Get Paid Securely
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Your earnings are protected:
                    </p>
                    <ul className="space-y-3 mb-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Guaranteed Payment:</strong> Client funds are held in escrow before you start
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Fast Payouts:</strong> Funds released to your account within 24-48 hours of approval
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Dispute Protection:</strong> Our team mediates if issues arise
                        </div>
                      </li>
                    </ul>
                    <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-200">Grow Your Business</p>
                          <p className="text-sm text-green-300">
                            Consider upgrading to Pro for lower commission (5% vs 10%) 
                            and priority placement in search results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-8 border-t border-slate-800">
                <h3 className="text-xl font-bold mb-4">Ready to Start Earning?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/auth">
                    <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-500">
                      <User className="h-5 w-5" />
                      Create Your Profile
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400" onClick={() => navigate("/jobs")}>
                      <Briefcase className="h-5 w-5" />
                      Browse Available Jobs
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
