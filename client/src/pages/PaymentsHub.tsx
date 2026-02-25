import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency";
import {
  Wallet,
  ArrowRight,
  ArrowDown,
  Shield,
  Zap,
  Globe,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Lock,
  Clock,
  TrendingUp,
  CreditCard,
  Banknote,
  CircleDollarSign,
  Coins,
  ArrowRightLeft,
  Building2,
  Users,
  Star,
} from "lucide-react";

const fiatCurrencies = [
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 1.0 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 0.055 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.051 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.044 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 85.2 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 7.15 },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼", rate: 0.74 },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", flag: "🇳🇦", rate: 1.0 },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", rate: 3.5 },
];

const cryptoCurrencies = [
  { code: "BTC", name: "Bitcoin", icon: "₿", color: "text-orange-500", bgColor: "bg-orange-500/10", price: "$67,432.50", change: "+2.4%" },
  { code: "ETH", name: "Ethereum", icon: "Ξ", color: "text-blue-500", bgColor: "bg-blue-500/10", price: "$3,521.80", change: "+1.8%" },
  { code: "USDC", name: "USD Coin", icon: "$", color: "text-green-500", bgColor: "bg-green-500/10", price: "$1.00", change: "0.0%" },
  { code: "cUSD", name: "Celo Dollar", icon: "c$", color: "text-emerald-500", bgColor: "bg-emerald-500/10", price: "$1.00", change: "0.0%" },
];

const mobilePayments = [
  { name: "M-Pesa", description: "East Africa's leading mobile money", region: "Kenya, Tanzania", icon: Smartphone, color: "text-green-600", instant: true },
  { name: "SnapScan", description: "South Africa's QR payment app", region: "South Africa", icon: Smartphone, color: "text-blue-600", instant: true },
  { name: "Capitec Pay", description: "Instant bank-to-wallet transfers", region: "South Africa", icon: Building2, color: "text-red-600", instant: true },
  { name: "Airtel Money", description: "Pan-African mobile payments", region: "14 African countries", icon: Smartphone, color: "text-rose-600", instant: false },
];

const escrowSteps = [
  { step: 1, title: "Client Funds Escrow", description: "Client deposits payment into secure escrow wallet", icon: Lock, status: "complete" },
  { step: 2, title: "Work in Progress", description: "Freelancer completes milestones, tracked on platform", icon: Clock, status: "active" },
  { step: 3, title: "Milestone Approval", description: "Client reviews and approves completed work", icon: CheckCircle2, status: "pending" },
  { step: 4, title: "Instant Release", description: "Funds released to freelancer in their chosen currency", icon: Zap, status: "pending" },
];

const paymentMethods = [
  { name: "Bank Transfer", icon: Building2, speed: "1-2 days", fee: "0.5%", popular: false },
  { name: "Crypto Wallet", icon: Wallet, speed: "Instant", fee: "0.1%", popular: true },
  { name: "Mobile Money", icon: Smartphone, speed: "Instant", fee: "1.0%", popular: true },
  { name: "Credit Card", icon: CreditCard, speed: "Instant", fee: "2.5%", popular: false },
  { name: "Stablecoin (USDC)", icon: CircleDollarSign, speed: "Instant", fee: "0.05%", popular: true },
  { name: "Cash Pickup", icon: Banknote, speed: "Same day", fee: "1.5%", popular: false },
];

export default function PaymentsHub() {
  const { formatAmount } = useCurrency();
  const [selectedFrom, setSelectedFrom] = useState("ZAR");
  const [selectedTo, setSelectedTo] = useState("USD");
  const [amount, setAmount] = useState("10000");

  const fromCurrency = fiatCurrencies.find((c) => c.code === selectedFrom)!;
  const toCurrency = fiatCurrencies.find((c) => c.code === selectedTo)!;
  const convertedAmount = (parseFloat(amount || "0") * (toCurrency.rate / fromCurrency.rate)).toFixed(2);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20" data-testid="badge-payments-hero">
              <Wallet className="w-3 h-3 mr-1" /> Multi-Currency Payment Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-payments-title">
              Pay & Get Paid <span className="text-accent">Anywhere</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed" data-testid="text-payments-subtitle">
              9+ currencies, crypto wallets, mobile money, and instant settlement.
              The most flexible payment system built for Africa's gig economy.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-white/70 text-sm">
              <div className="flex items-center gap-2" data-testid="stat-currencies">
                <Globe className="w-4 h-4" /> 9+ Currencies
              </div>
              <div className="flex items-center gap-2" data-testid="stat-crypto">
                <Coins className="w-4 h-4" /> 4 Cryptocurrencies
              </div>
              <div className="flex items-center gap-2" data-testid="stat-settlement">
                <Zap className="w-4 h-4" /> Instant Settlement
              </div>
              <div className="flex items-center gap-2" data-testid="stat-escrow">
                <Shield className="w-4 h-4" /> Escrow Protected
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-exchange-rates">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Real-Time Exchange Rates</h2>
              <p className="text-muted-foreground text-lg">
                Live rates updated every 30 seconds. Convert between any supported currency pair.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              <Card className="border-primary/20 shadow-xl" data-testid="card-converter">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">From</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedFrom}
                          onChange={(e) => setSelectedFrom(e.target.value)}
                          className="bg-muted rounded-lg px-3 py-3 text-sm font-medium outline-none border border-border"
                          data-testid="select-currency-from"
                        >
                          {fiatCurrencies.map((c) => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 bg-muted rounded-lg px-4 py-3 text-lg font-bold outline-none border border-border"
                          data-testid="input-amount"
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 w-full">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">To</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedTo}
                          onChange={(e) => setSelectedTo(e.target.value)}
                          className="bg-muted rounded-lg px-3 py-3 text-sm font-medium outline-none border border-border"
                          data-testid="select-currency-to"
                        >
                          {fiatCurrencies.map((c) => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                          ))}
                        </select>
                        <div className="flex-1 bg-muted/50 rounded-lg px-4 py-3 text-lg font-bold border border-border text-foreground" data-testid="text-converted-amount">
                          {convertedAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-3 h-3" />
                    <span>Rate: 1 {selectedFrom} = {(toCurrency.rate / fromCurrency.rate).toFixed(4)} {selectedTo}</span>
                    <span className="text-xs text-muted-foreground/60">Updated 12s ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 max-w-5xl mx-auto">
              {fiatCurrencies.map((currency) => (
                <Card
                  key={currency.code}
                  className="text-center p-4 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
                  data-testid={`card-currency-${currency.code}`}
                >
                  <div className="text-2xl mb-1">{currency.flag}</div>
                  <div className="text-sm font-bold text-foreground">{currency.code}</div>
                  <div className="text-xs text-muted-foreground mt-1">{currency.symbol}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-crypto">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Crypto Wallet Integration</h2>
              <p className="text-muted-foreground text-lg">
                Pay and receive in Bitcoin, Ethereum, USDC, or Celo Dollar. Near-zero fees, instant settlement.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {cryptoCurrencies.map((crypto) => (
                <Card key={crypto.code} className="hover:shadow-xl transition-shadow border-border" data-testid={`card-crypto-${crypto.code}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${crypto.bgColor} flex items-center justify-center`}>
                        <span className={`text-xl font-bold ${crypto.color}`}>{crypto.icon}</span>
                      </div>
                      <Badge variant="outline" className={parseFloat(crypto.change) > 0 ? "text-green-600 border-green-200" : "text-muted-foreground"}>
                        {parseFloat(crypto.change) > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                        {crypto.change}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-foreground text-lg">{crypto.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{crypto.code}</p>
                    <div className="text-xl font-bold text-foreground" data-testid={`text-crypto-price-${crypto.code}`}>{crypto.price}</div>
                    <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid={`button-connect-${crypto.code}`}>
                      <Wallet className="w-4 h-4" /> Connect Wallet
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10" data-testid="card-crypto-benefits">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-primary mb-6 text-center">Why Pay with Crypto?</h3>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {[
                      { icon: Zap, title: "Instant Settlement", desc: "Funds arrive in seconds, not days" },
                      { icon: CircleDollarSign, title: "0.05% Fees", desc: "Up to 50x cheaper than bank transfers" },
                      { icon: Globe, title: "No Borders", desc: "Send to any country without restrictions" },
                    ].map((benefit, i) => (
                      <div key={i} className="text-center">
                        <benefit.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-mobile-money">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Mobile Money Integration</h2>
              <p className="text-muted-foreground text-lg">
                Pay and get paid through the mobile money services millions already use daily.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {mobilePayments.map((payment, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow" data-testid={`card-mobile-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <payment.icon className={`w-6 h-6 ${payment.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground text-lg">{payment.name}</h3>
                          {payment.instant && (
                            <Badge className="bg-green-500/10 text-green-600 text-xs">
                              <Zap className="w-3 h-3 mr-0.5" /> Instant
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{payment.description}</p>
                        <p className="text-xs text-muted-foreground/70">{payment.region}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-payment-methods">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Choose Your Payment Method</h2>
              <p className="text-muted-foreground text-lg">
                Multiple options with transparent fees and settlement times.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {paymentMethods.map((method, i) => (
                <Card
                  key={i}
                  className={`hover:shadow-lg transition-all cursor-pointer ${method.popular ? "border-primary/30 shadow-md" : ""}`}
                  data-testid={`card-method-${i}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      {method.popular && (
                        <Badge className="bg-accent/10 text-accent text-xs">
                          <Star className="w-3 h-3 mr-0.5" /> Popular
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground mb-3">{method.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          {method.speed === "Instant" && <Zap className="w-3 h-3 text-green-500" />}
                          {method.speed}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-medium text-foreground">{method.fee}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4" data-testid={`button-select-method-${i}`}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white relative overflow-hidden" data-testid="section-escrow">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-escrow-title">
                Secure Escrow Protection
              </h2>
              <p className="text-white/70 text-lg">
                Every transaction is protected. Funds are held securely until work is approved.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-6">
                {escrowSteps.map((step, i) => (
                  <div key={i} className="relative" data-testid={`escrow-step-${step.step}`}>
                    <div className={`text-center ${step.status === "active" ? "scale-105" : ""} transition-transform`}>
                      <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        step.status === "complete"
                          ? "bg-green-500/20"
                          : step.status === "active"
                          ? "bg-accent/20 ring-2 ring-accent"
                          : "bg-white/10"
                      }`}>
                        <step.icon className={`w-8 h-8 ${
                          step.status === "complete"
                            ? "text-green-400"
                            : step.status === "active"
                            ? "text-accent"
                            : "text-white/50"
                        }`} />
                      </div>
                      <div className="text-xs font-semibold text-accent mb-1">Step {step.step}</div>
                      <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                      <p className="text-xs text-white/60">{step.description}</p>
                    </div>
                    {i < escrowSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-3 w-6">
                        <ArrowRight className="w-6 h-6 text-white/30" />
                      </div>
                    )}
                    {i < escrowSteps.length - 1 && (
                      <div className="md:hidden flex justify-center my-3">
                        <ArrowDown className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { value: "R0", label: "Lost to fraud", sub: "100% escrow protection" },
                { value: "< 2hrs", label: "Average release time", sub: "After approval" },
                { value: "99.8%", label: "Dispute resolution", sub: "Fair outcomes guaranteed" },
              ].map((stat, i) => (
                <div key={i} className="text-center" data-testid={`stat-escrow-${i}`}>
                  <div className="text-3xl font-bold text-accent mb-1">{stat.value}</div>
                  <div className="font-medium text-sm mb-1">{stat.label}</div>
                  <div className="text-xs text-white/50">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-cta">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <Wallet className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6" data-testid="text-cta-title">
                Start Transacting Today
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Set up your payment wallet in minutes. Accept payments in any currency, withdraw instantly to your local bank or crypto wallet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="font-bold text-lg px-10 shadow-lg gap-2" data-testid="button-cta-setup-wallet">
                  <Wallet className="w-5 h-5" />
                  Set Up Your Wallet
                </Button>
                <Button size="lg" variant="outline" className="font-semibold gap-2" data-testid="button-cta-explore">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}