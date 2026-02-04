import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Zap, Globe, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="bg-primary text-white pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Simple, Affordable Pricing</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join South Africa's fastest-growing work marketplace. No hidden fees, just value.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-16 pb-20 flex-1">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">Basic</h3>
              <div className="text-4xl font-display font-bold mb-4">Free</div>
              <p className="text-muted-foreground mb-6">Perfect for getting started and browsing jobs.</p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Create a professional profile</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Browse local & remote jobs</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>Basic skills verification</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span>10% Commission on earnings</span>
                </li>
              </ul>
            </div>
            <div className="p-8 bg-muted/30 border-t border-border">
              <div className="flex items-center justify-center gap-2 mb-4 grayscale opacity-70">
                 <span className="text-[10px] font-bold">Secured by</span>
                 <div className="w-12 h-4 bg-gray-400 rounded"></div> {/* PayFast mockup */}
                 <div className="w-8 h-4 bg-gray-400 rounded"></div> {/* Ozow mockup */}
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full font-bold">Get Started</Button>
              </Link>
            </div>
          </div>

          {/* Pro Tier (The R79/mo) */}
          <div className="bg-primary text-white rounded-2xl shadow-2xl border-2 border-accent relative overflow-hidden flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Most Popular
            </div>
            
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Pro Talent</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-display font-bold">R79</span>
                <span className="text-white/60">/ month</span>
              </div>
              <p className="text-white/80 mb-6">For serious professionals looking for consistent work.</p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <Zap className="w-5 h-5 text-accent shrink-0" />
                  <span className="font-bold">Priority placement in "Near Me" search</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Shield className="w-5 h-5 text-accent shrink-0" />
                  <span>Verified Pro Badge</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Globe className="w-5 h-5 text-accent shrink-0" />
                  <span>Access to International Enterprise jobs</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span>Reduced Commission (5%)</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span>Unlimited Location bids</span>
                </li>
              </ul>
            </div>
            <div className="p-8 bg-white/10 border-t border-white/10">
              <Link href="/signup">
                <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-bold h-12 shadow-lg">Subscribe Now</Button>
              </Link>
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">Enterprise</h3>
              <div className="text-4xl font-display font-bold mb-4">Custom</div>
              <p className="text-muted-foreground mb-6">For companies hiring at scale.</p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Consolidated Invoicing</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Custom Legal Contracts</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Bulk Recruitment Tools</span>
                </li>
              </ul>
            </div>
            <div className="p-8 bg-muted/30 border-t border-border">
              <Link href="/contact">
                <Button variant="outline" className="w-full font-bold">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Table / FAQ could go here */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Why Subscribe?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our mission is to curb unemployment. The R79/month fee helps us verify every profile, market your services to top companies, and maintain a safe, secure platform for everyone.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}