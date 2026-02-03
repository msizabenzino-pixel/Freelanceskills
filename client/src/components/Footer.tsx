import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary pt-16 pb-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">F</div>
              <span className="font-display font-bold text-xl text-primary">FreelanceSkill.</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering South Africa's workforce through digital connection. The safest way to hire local talent online.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Mockup */}
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">How to Hire</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Talent Marketplace</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Payroll Services</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">For Talent</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">How to Find Work</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Direct Contracts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Find Opportunity</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 FreelanceSkill Pty Ltd. All rights reserved.</p>
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