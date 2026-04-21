import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AIProfileBuilder } from "@/components/AIProfileBuilder";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  FileText, 
  AlertCircle,
  ChevronRight,
  Sparkles,
  Users,
  Shield,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

const FAQ_ITEMS = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I create a profile?", a: "You can sign up and create a profile manually, or use our AI Profile Builder to automatically create one from your CV." },
      { q: "How do I get verified?", a: "Go to your dashboard and upload your ID, qualifications, and professional registrations. Our team will verify within 2-3 days." },
      { q: "Is FreelanceSkills free to use?", a: "Yes! Creating an account is free. We only charge a 10% commission when you complete a job (5% for Pro members)." },
    ]
  },
  {
    category: "Payments & Fees",
    questions: [
      { q: "How do I get paid?", a: "Payments are held in escrow when clients book. Once they approve your work, funds are released to your account within 24-48 hours." },
      { q: "What payment methods are accepted?", a: "We accept credit/debit cards, EFT, and SnapScan. All payments are processed securely." },
      { q: "What are the fees?", a: "Free accounts pay 10% commission. Pro members pay only 5% commission with a small monthly subscription." },
    ]
  },
  {
    category: "Safety & Trust",
    questions: [
      { q: "How am I protected?", a: "All payments go through our secure escrow system. Money is only released when work is approved. We also have dispute resolution." },
      { q: "What if someone asks for off-platform payment?", a: "Never pay outside FreelanceSkills! Report them immediately. Off-platform deals are not protected and violate our terms." },
      { q: "How do I report a problem?", a: "Use our support chat, WhatsApp, or email. We take all reports seriously and respond within 24 hours." },
    ]
  },
];

export default function Support() {
  const [showProfileBuilder, setShowProfileBuilder] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-900/60 via-slate-950 to-slate-950 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Our friendly team is here to assist you. Get help via chat, WhatsApp, or phone.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a 
                href="https://wa.me/27722324636"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                <p className="text-green-400 font-medium">+27 72 232 4636</p>
                <p className="text-sm text-slate-400 mt-2">Fastest response - usually &lt; 5 mins</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-sm text-emerald-400">
                  <span>Chat Now</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>

              <a 
                href="mailto:support@freelanceskills.co.za"
                className="bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Email Support</h3>
                <p className="text-blue-400 font-medium">support@freelanceskills.co.za</p>
                <p className="text-sm text-slate-400 mt-2">We respond within 4 business hours</p>
              </a>

              <a 
                href="mailto:support@freelanceskills.co.za"
                className="bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-purple-400 font-medium">support@freelanceskills.co.za</p>
                <p className="text-sm text-slate-400 mt-2">We reply within 24 hours</p>
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                <strong>Support Hours:</strong> Mon-Fri 8am-8pm | Sat-Sun 9am-5pm
              </span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What do you need help with?</h2>
            <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <button 
                onClick={() => setShowProfileBuilder(true)}
                className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow text-left"
              >
                <Sparkles className="h-8 w-8 mb-3" />
                <h3 className="font-semibold mb-1">AI Profile Builder</h3>
                <p className="text-sm text-white/80">Create your profile from a CV</p>
              </button>

              <Link href="/how-to-hire">
                <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:shadow-md transition-shadow text-left h-full">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-1">Hiring Guide</h3>
                  <p className="text-sm text-slate-400">Learn how to hire someone</p>
                </div>
              </Link>

              <Link href="/how-to-get-hired">
                <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:shadow-md transition-shadow text-left h-full">
                  <FileText className="h-8 w-8 text-amber-500 mb-3" />
                  <h3 className="font-semibold mb-1">Getting Hired</h3>
                  <p className="text-sm text-slate-400">Start earning on the platform</p>
                </div>
              </Link>

              <Link href="/how-it-works">
                <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:shadow-md transition-shadow text-left h-full">
                  <Shield className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-1">Safety & Trust</h3>
                  <p className="text-sm text-slate-400">How we protect you</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ_ITEMS.map((section, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-emerald-400" />
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.questions.map((faq, j) => (
                      <div 
                        key={j}
                        className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === `${i}-${j}` ? null : `${i}-${j}`)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-700/50"
                        >
                          <span className="font-medium">{faq.q}</span>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${
                            expandedFaq === `${i}-${j}` ? "rotate-90" : ""
                          }`} />
                        </button>
                        {expandedFaq === `${i}-${j}` && (
                          <div className="px-4 pb-4 text-slate-400">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-slate-400 mb-6">
              Our friendly team is just a message away. We're here to help you succeed!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/27722324636" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 bg-green-500 hover:bg-green-600">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us Now
                </Button>
              </a>
              <a href="mailto:support@freelanceskills.co.za">
                <Button size="lg" variant="outline" className="gap-2">
                  <Mail className="h-5 w-5" />
                  Email Support
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <AIProfileBuilder 
        open={showProfileBuilder}
        onClose={() => setShowProfileBuilder(false)}
        onComplete={() => setShowProfileBuilder(false)}
      />
    </div>
  );
}
