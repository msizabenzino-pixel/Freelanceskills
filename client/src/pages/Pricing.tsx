import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCountry } from "@/components/CountrySelector";
import { 
  Check, 
  Shield, 
  CreditCard, 
  Wallet,
  Building2,
  Clock,
  Globe,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lock,
  Zap,
  Crown,
  HelpCircle,
  CheckCircle2,
  MapPin
} from "lucide-react";

const WITHDRAWAL_METHODS_BASE = [
  { 
    name: "Bank Transfer (EFT)", 
    fee: "Free", 
    time: "1-3 business days",
    minAmountZar: 100,
    icon: Building2
  },
  { 
    name: "PayFast Instant", 
    fee: "1.5%", 
    time: "Instant",
    minAmountZar: 50,
    icon: Zap
  },
  { 
    name: "PayPal", 
    fee: "2.5%", 
    time: "1-2 business days",
    minAmountZar: 188, // ~$10 equivalent
    icon: Wallet
  },
  { 
    name: "Wise (TransferWise)", 
    fee: "0.5%", 
    time: "1-2 business days",
    minAmountZar: 377, // ~$20 equivalent
    icon: Globe
  },
];

const CURRENCIES = [
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", flag: "🇳🇦" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "E", flag: "🇸🇿" },
];

const FAQ_ITEMS = [
  {
    q: "When do I pay the commission?",
    a: "Commission is only charged when you successfully complete a job and receive payment. There are no upfront fees or monthly charges on the Free plan."
  },
  {
    q: "How does escrow protection work?",
    a: "When a client books your service, they pay upfront. The money is held securely by FreelanceSkills until you deliver the work and the client approves it. This protects both parties."
  },
  {
    q: "Can I set my own prices in any currency?",
    a: "Yes! You can set your prices in ZAR or any supported currency. Clients will see prices converted to their local currency at current exchange rates."
  },
  {
    q: "How long does withdrawal take?",
    a: "Bank transfers take 1-3 business days. PayFast Instant withdrawals are available immediately for a small fee. International transfers via PayPal or Wise take 1-2 business days."
  },
  {
    q: "Is there a minimum withdrawal amount?",
    a: "Yes, the minimum depends on your withdrawal method. Minimums vary by method and are displayed in your local currency."
  },
];

export default function Pricing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { country, formatPrice } = useCountry();
  const currencySymbol = country.currency.symbol;

  const exampleJob = 500000; // 5000 ZAR in cents
  const freeEarnings = exampleJob * 0.9;
  const proEarnings = exampleJob * 0.95;
  const proSavings = proEarnings - freeEarnings;
  const proMonthlyPrice = 7900; // 79 ZAR in cents

  const WITHDRAWAL_METHODS = WITHDRAWAL_METHODS_BASE.map(method => ({
    ...method,
    minAmount: formatPrice(method.minAmountZar * 100)
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content">
      <div className="bg-primary text-white pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            No hidden fees. No monthly charges on the Free plan. Only pay when you earn.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-16 pb-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">Basic</h3>
              <div className="text-4xl font-display font-bold mb-4">Free</div>
              <p className="text-muted-foreground mb-6">Perfect for getting started.</p>
              
              <div className="bg-amber-50 rounded-lg p-3 mb-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-amber-600">10%</span>
                  <p className="text-xs text-amber-700">commission on completed jobs</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {[
                  "Unlimited job applications",
                  "Create service packages",
                  "In-app messaging",
                  "Escrow payment protection",
                  "Basic profile",
                  "Standard support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" data-testid={`item-feature-free-${i}`}>
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-muted/30 border-t border-border">
              <Button variant="outline" className="w-full font-bold" data-testid="button-get-started-free" onClick={() => navigate("/auth")}>Get Started Free</Button>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-primary text-white rounded-2xl shadow-2xl border-2 border-accent relative overflow-hidden flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1" data-testid="badge-most-popular">
              <Crown className="h-3 w-3" />
              Most Popular
            </div>
            
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Pro Talent</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-display font-bold" data-testid="text-pro-price">{formatPrice(proMonthlyPrice)}</span>
                <span className="text-white/60">/ month</span>
              </div>
              <p className="text-white/80 mb-6">For serious professionals.</p>
              
              <div className="bg-green-500/20 rounded-lg p-3 mb-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-300" data-testid="text-pro-commission">5%</span>
                  <p className="text-xs text-green-200">commission - save 50%!</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {[
                  "Everything in Free, plus:",
                  "Pro badge on profile",
                  "Priority in search results",
                  "Featured on homepage",
                  "Video calls with clients",
                  "Advanced analytics",
                  "Priority support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" data-testid={`item-feature-pro-${i}`}>
                    <Zap className="w-5 h-5 text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-white/10 border-t border-white/10">
              <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-bold h-12 shadow-lg" data-testid="button-upgrade-pro" onClick={() => navigate("/auth")}>
                  Upgrade to Pro
                </Button>
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">Enterprise</h3>
              <div className="text-4xl font-display font-bold mb-4" data-testid="text-enterprise-price">Custom</div>
              <p className="text-muted-foreground mb-6">For companies hiring at scale.</p>
              
              <ul className="space-y-3">
                {[
                  "Dedicated Account Manager",
                  "Consolidated Invoicing",
                  "Custom Legal Contracts",
                  "Bulk Recruitment Tools",
                  "API Access",
                  "Custom integrations"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" data-testid={`item-feature-enterprise-${i}`}>
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-muted/30 border-t border-border">
              <Button variant="outline" className="w-full font-bold" data-testid="button-contact-sales" onClick={() => navigate("/support")}>Contact Sales</Button>
            </div>
          </div>
        </div>

        {/* Savings Calculator */}
        <div className="max-w-2xl mx-auto mt-12 bg-muted rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">See Your Savings</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">On a {formatPrice(exampleJob)} job:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Free Plan (10%)</p>
              <p className="text-2xl font-bold">{formatPrice(freeEarnings)}</p>
              <p className="text-xs text-muted-foreground">You earn</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">Pro Plan (5%)</p>
              <p className="text-2xl font-bold text-green-700">{formatPrice(proEarnings)}</p>
              <p className="text-xs text-green-600">You earn {formatPrice(proSavings)} more!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Escrow Payment Protection</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your money is always safe. We hold payments securely until work is delivered and approved.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Client Pays", desc: "Funds secured before work starts" },
                { step: 2, title: "Work Begins", desc: "You complete the task or milestone" },
                { step: 3, title: "Client Approves", desc: "They review and approve delivery" },
                { step: 4, title: "You Get Paid", desc: "Funds released within 24 hours" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-card rounded-xl p-6 border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Milestone Payments
              </h4>
              <p className="text-muted-foreground mb-4">
                For larger projects, split payments into milestones. Funds are released as each milestone is completed and approved.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 h-3 bg-green-500 rounded-l-full"></div>
                <div className="flex-1 h-3 bg-green-500"></div>
                <div className="flex-1 h-3 bg-amber-400"></div>
                <div className="flex-1 h-3 bg-muted rounded-r-full"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Milestone 1 ✓</span>
                <span>Milestone 2 ✓</span>
                <span>Milestone 3 (current)</span>
                <span>Milestone 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Withdrawal Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Withdrawal Options</h2>
              <p className="text-muted-foreground">Get your money quickly with multiple payout options</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {WITHDRAWAL_METHODS.map((method, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{method.name}</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fee</p>
                          <p className="font-medium text-green-600">{method.fee}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Speed</p>
                          <p className="font-medium">{method.time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min</p>
                          <p className="font-medium">{method.minAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Currencies */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Multi-Currency Support</h2>
              <p className="text-muted-foreground">Work with clients worldwide in their preferred currency</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CURRENCIES.map((currency) => (
                <div key={currency.code} className="bg-card rounded-lg p-4 text-center border">
                  <span className="text-2xl mb-2 block">{currency.flag}</span>
                  <p className="font-semibold">{currency.code}</p>
                  <p className="text-sm text-muted-foreground">{currency.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="bg-card rounded-lg border overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-muted"
                    data-testid={`button-faq-toggle-${i}`}
                  >
                    <span className="font-medium" data-testid={`text-faq-question-${i}`}>{faq.q}</span>
                    {expandedFaq === i ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4 text-muted-foreground" data-testid={`text-faq-answer-${i}`}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
