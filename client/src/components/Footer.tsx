import { Shield, Phone, Mail, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary pt-16 pb-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">F</div>
              <span className="font-display font-bold text-xl text-primary">FreelanceSkill.</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering South Africa's workforce through digital connection. The safest way to hire local talent online.
            </p>
            <div className="flex gap-3 mt-4">
              <a 
                href="https://facebook.com/freelanceskill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/freelanceskill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@freelanceskill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-600 hover:text-white transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/freelanceskill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white transition-colors"
                data-testid="link-x"
                aria-label="X (formerly Twitter)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/freelanceskill" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-700 hover:text-white transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mt-4">
              <a href="https://wa.me/27601234567" className="flex items-center gap-1 hover:text-primary">
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a href="mailto:support@freelanceskill.co.za" className="flex items-center gap-1 hover:text-primary">
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-to-hire" className="hover:text-primary transition-colors" data-testid="link-how-to-hire">How to Hire</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Find Talent</Link></li>
              <li><Link href="/post-job" className="hover:text-primary transition-colors">Post a Job</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Talent</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-to-get-hired" className="hover:text-primary transition-colors">How to Get Hired</Link></li>
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Fees & Earnings</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">AI Profile Builder</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">Trust & Safety</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/resolution-center" className="hover:text-primary transition-colors" data-testid="link-resolution-center">Resolution Center</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Help & Support</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Escrow Protection</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <p>© 2026 FreelanceSkill Pty Ltd. All rights reserved. Payments protected by escrow.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
