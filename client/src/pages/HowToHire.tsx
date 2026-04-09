import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { VideoPlayer, VideoLanguageInfo } from "@/components/VideoPlayer";
import guideThumb from "@assets/image_1775734099920.png";
import { 
  Search, 
  MessageSquare, 
  CreditCard, 
  CheckCircle, 
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  FileText,
  Eye,
  ThumbsUp,
  AlertTriangle,
  Lock,
  HelpCircle
} from "lucide-react";

export default function HowToHire() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
                <span>/</span>
                <span>Hiring Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How to Hire on FreelanceSkills
              </h1>
              <p className="text-xl text-white/90">
                Find verified professionals for any job - from urgent plumbing repairs 
                to long-term software projects. Your payment is protected every step of the way.
              </p>
            </div>
          </div>
        </section>

        {/* Video Tutorial */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Video Guide: Hiring Your First Freelancer</h2>
              <div className="mb-6">
                <VideoLanguageInfo />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <VideoPlayer 
                  title="How to Post a Job"
                  duration="3:15 min"
                  thumbnail={guideThumb}
                />
                <VideoPlayer 
                  title="Instant Booking a Tasker"
                  duration="2:45 min"
                  thumbnail={guideThumb}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Step-by-Step Guide</h2>

              {/* Step 1 */}
              <div className="mb-12 pb-12 border-b">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Search className="h-6 w-6 text-primary" />
                      Find the Right Professional
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You have two ways to find talent:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2">Post a Job</h4>
                        <p className="text-sm text-blue-700">
                          Describe what you need and let freelancers come to you with proposals.
                          Best for complex projects.
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="font-semibold text-amber-800 mb-2">Book a Tasker</h4>
                        <p className="text-sm text-amber-700">
                          Browse service packages and book instantly.
                          Perfect for urgent or straightforward tasks.
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Pro Tip:</strong> Filter by location to find professionals near you for on-site work.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-12 pb-12 border-b">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Eye className="h-6 w-6 text-primary" />
                      Review Profiles & Verification
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Check their credentials before hiring:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Trust Score:</strong> Higher scores mean more verified credentials
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Verification Badges:</strong> ID verified, qualifications checked, background cleared
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Reviews:</strong> Read what other clients say about their work
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Professional Registration:</strong> PIRB, ECSA, SACPCMP for regulated trades
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-12 pb-12 border-b">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      Discuss & Agree on Scope
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Use our secure in-app messaging to discuss:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Exact requirements and deliverables
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Timeline and availability
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Pricing and payment terms
                      </li>
                    </ul>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">Important Safety Note</p>
                          <p className="text-sm text-red-700">
                            Never share your phone number, email, or bank details before booking.
                            Keep all communication on the platform for your protection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="mb-12 pb-12 border-b">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-primary" />
                      Book & Pay Securely
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your payment is protected by our escrow system:
                    </p>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <div className="flex items-start gap-2">
                        <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-800">How Escrow Works</p>
                          <ol className="text-sm text-green-700 mt-2 space-y-1">
                            <li>1. You pay when booking - funds are held securely</li>
                            <li>2. Freelancer completes the work</li>
                            <li>3. You review and approve the work</li>
                            <li>4. Only then is payment released to the freelancer</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We accept all major payment methods including card payments and EFT.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="mb-12">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <ThumbsUp className="h-6 w-6 text-primary" />
                      Approve & Review
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      When the work is complete:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Review the deliverables carefully
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Request revisions if needed (within scope)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Approve to release payment
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Leave a public review to help others
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        Provide private feedback to help us maintain quality
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-8 border-t">
                <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2" onClick={() => navigate("/post-job")}>
                      <FileText className="h-5 w-5" />
                      Post a Job
                    </Button>
                  <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/services")}>
                      <Clock className="h-5 w-5" />
                      Book a Tasker Now
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
