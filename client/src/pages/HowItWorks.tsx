import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
  ThumbsUp
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How FreelanceSkills Works
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Whether you're looking to hire skilled professionals or offer your services, 
              we make it simple, safe, and rewarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/how-to-hire">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                  <Users className="h-5 w-5" />
                  I Want to Hire
                </Button>
              </Link>
              <Link href="/how-to-get-hired">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                  <Briefcase className="h-5 w-5" />
                  I Want to Work
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Video Introduction */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">Watch How It Works</h2>
              <p className="text-center text-muted-foreground mb-6">
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
              />
            </div>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Simple Steps to Success</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              From finding the right match to completing your project, we've streamlined every step.
            </p>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* For Clients */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">For Clients</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Search, step: "1", title: "Find Talent", desc: "Search by skill, location, or browse service packages" },
                    { icon: MessageSquare, step: "2", title: "Connect", desc: "Message professionals and discuss your needs" },
                    { icon: CreditCard, step: "3", title: "Book & Pay", desc: "Secure escrow payment protects both parties" },
                    { icon: CheckCircle, step: "4", title: "Get Results", desc: "Approve work and release payment when satisfied" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-primary" />
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/how-to-hire">
                  <Button className="w-full gap-2">
                    Learn More About Hiring <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* For Freelancers */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold">For Freelancers</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: FileCheck, step: "1", title: "Create Profile", desc: "Showcase your skills, experience, and certifications" },
                    { icon: Shield, step: "2", title: "Get Verified", desc: "Build trust with ID, qualification, and background checks" },
                    { icon: Wallet, step: "3", title: "Win Work", desc: "Apply to jobs or get booked through your service packages" },
                    { icon: ThumbsUp, step: "4", title: "Get Paid", desc: "Receive secure payment when clients approve your work" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-amber-50 hover:bg-amber-100/80 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-amber-600" />
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/how-to-get-hired">
                  <Button variant="outline" className="w-full gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                    Learn More About Getting Hired <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why FreelanceSkills */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose FreelanceSkills?</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Shield, title: "Escrow Protection", desc: "Your payment is held safely until you approve the work" },
                { icon: Star, title: "Verified Professionals", desc: "ID, qualifications, and background checks available" },
                { icon: Clock, title: "Same-Day Service", desc: "Find available professionals for urgent tasks" },
                { icon: MessageSquare, title: "In-App Messaging", desc: "Secure communication keeps everyone protected" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Check out our detailed guides or contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/how-to-hire">
                <Button variant="outline" size="lg">How to Hire Guide</Button>
              </Link>
              <Link href="/how-to-get-hired">
                <Button variant="outline" size="lg">How to Get Hired Guide</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
