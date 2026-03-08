import { Shield, Phone, Mail, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { useCurrency } from "@/lib/currency";

export function Footer() {
  return (
    <footer role="contentinfo" aria-label="Site footer" className="bg-secondary pt-16 pb-8 border-t border-border mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-12">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">F</div>
              <span className="font-display font-bold text-xl text-primary">FreelanceSkills</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering South Africa's workforce through digital connection. The safest way to hire local talent online.
            </p>
            <p className="text-muted-foreground text-xs">
              CIPC Reg: 2026/070509/09 | Tableview, Cape Town
            </p>
            <div className="flex gap-3 mt-4">
              <a 
                href="https://facebook.com/freelanceskills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/freelanceskills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@freelanceskills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-600 hover:text-white transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/freelanceskills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-black hover:text-white transition-colors"
                data-testid="link-x"
                aria-label="X (formerly Twitter)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/freelanceskills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-blue-700 hover:text-white transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mt-4">
              <a href="https://wa.me/27601234567" className="flex items-center gap-1 hover:text-primary" data-testid="link-whatsapp">
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a href="mailto:support@freelanceskills.co.za" className="flex items-center gap-1 hover:text-primary" data-testid="link-email">
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-to-hire" className="hover:text-primary transition-colors" data-testid="link-how-to-hire">How to Hire</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors" data-testid="link-find-talent">Find Talent</Link></li>
              <li><Link href="/post-job" className="hover:text-primary transition-colors" data-testid="link-post-job">Post a Job</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors" data-testid="link-pricing">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Talent</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-to-get-hired" className="hover:text-primary transition-colors" data-testid="link-how-to-get-hired">How to Get Hired</Link></li>
              <li><Link href="/job-board" className="hover:text-primary transition-colors" data-testid="link-job-board">Global Job Board</Link></li>
              <li><Link href="/cv-upload" className="hover:text-primary transition-colors" data-testid="link-cv-upload">Upload CV & Create Profile</Link></li>
              <li><Link href="/opportunity-finder" className="hover:text-primary transition-colors" data-testid="link-opportunity-finder">AI Opportunity Finder</Link></li>
              <li><Link href="/jobs" className="hover:text-primary transition-colors" data-testid="link-browse-jobs">Browse Jobs</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors" data-testid="link-fees-earnings">Fees & Earnings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/impact" className="hover:text-primary transition-colors" data-testid="link-about-us">About Us</Link></li>
              <li><Link href="/impact" className="hover:text-primary transition-colors" data-testid="link-impact">Social Impact</Link></li>
              <li><Link href="/academy" className="hover:text-primary transition-colors" data-testid="link-academy">AI Academy</Link></li>
              <li><Link href="/enterprise" className="hover:text-primary transition-colors" data-testid="link-enterprise">Enterprise</Link></li>
              <li><Link href="/referral" className="hover:text-primary transition-colors" data-testid="link-referral">Referral Program</Link></li>
              <li><Link href="/resolution-center" className="hover:text-primary transition-colors" data-testid="link-resolution-center">Resolution Center</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors" data-testid="link-faq">FAQ</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors" data-testid="link-contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">Innovation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ai-match" className="hover:text-primary transition-colors" data-testid="link-ai-match">AI Smart Matching</Link></li>
              <li><Link href="/credentials" className="hover:text-primary transition-colors" data-testid="link-credentials">Blockchain Credentials</Link></li>
              <li><Link href="/payments-hub" className="hover:text-primary transition-colors" data-testid="link-payments-hub">Payments Hub</Link></li>
              <li><Link href="/analytics" className="hover:text-primary transition-colors" data-testid="link-analytics">Freelancer Analytics</Link></li>
              <li><Link href="/sustainability" className="hover:text-primary transition-colors" data-testid="link-sustainability">Green Impact</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary transition-colors" data-testid="link-accessibility">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <p>© 2026 FreelanceSkills (Pty) Ltd. All rights reserved. Payments protected by escrow.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Link href="/terms" className="hover:text-primary" data-testid="link-terms">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary" data-testid="link-privacy">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-primary" data-testid="link-footer-accessibility">Accessibility</Link>
            <a href="mailto:feedback@freelanceskills.co.za" className="hover:text-primary" data-testid="link-feedback">Suggest a Feature / Report Issue</a>
            <div className="flex items-center gap-1">
              <span>🇿🇦</span>
              <span>Made in Cape Town</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
