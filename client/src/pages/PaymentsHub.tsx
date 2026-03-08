import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Booking } from "@shared/models/services";
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
  TrendingDown,
  CreditCard,
  Banknote,
  CircleDollarSign,
  Coins,
  ArrowRightLeft,
  Building2,
  Star,
  Copy,
  CheckCheck,
  Minus,
  AlertCircle,
  Receipt,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fiatCurrencies = [
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 1.0 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 0.055 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.051 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.044 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 90.5 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 7.1 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", rate: 0.82 },
  { code: "EGP", name: "Egyptian Pound", symbol: "£E", flag: "🇪🇬", rate: 2.65 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", rate: 141.0 },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼", rate: 0.74 },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", flag: "🇳🇦", rate: 1.0 },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", rate: 3.52 },
];

const cryptoCurrencies = [
  {
    code: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    price: "$67,432.50",
    priceZar: "R1,226,046",
    change: "+2.4%",
    walletPrefix: "bc1q",
    network: "Bitcoin",
  },
  {
    code: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    price: "$3,521.80",
    priceZar: "R64,033",
    change: "+1.8%",
    walletPrefix: "0x",
    network: "Ethereum (ERC-20)",
  },
  {
    code: "USDC",
    name: "USD Coin",
    icon: "$",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    price: "$1.00",
    priceZar: "R18.18",
    change: "0.0%",
    walletPrefix: "0x",
    network: "Ethereum / Polygon",
  },
  {
    code: "cUSD",
    name: "Celo Dollar",
    icon: "c$",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    price: "$1.00",
    priceZar: "R18.18",
    change: "0.0%",
    walletPrefix: "0x",
    network: "Celo",
  },
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

function CryptoChangeBadge({ change }: { change: string }) {
  const value = parseFloat(change);
  if (value > 0) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-200" data-testid="badge-change-positive">
        <TrendingUp className="w-3 h-3 mr-1" />
        {change}
      </Badge>
    );
  }
  if (value < 0) {
    return (
      <Badge variant="outline" className="text-red-500 border-red-200" data-testid="badge-change-negative">
        <TrendingDown className="w-3 h-3 mr-1" />
        {change}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-200" data-testid="badge-change-stable">
      <Minus className="w-3 h-3 mr-1" />
      Stable
    </Badge>
  );
}

function CryptoWalletCard({ crypto }: { crypto: typeof cryptoCurrencies[0] }) {
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const mockAddress = `${crypto.walletPrefix}7f4a8c2b9d3e1f6a5b0c8d4e7f2a3b9c1d5e8f0a`;

  const handleConnect = () => setConnected(true);
  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover:shadow-xl transition-shadow border-border" data-testid={`card-crypto-${crypto.code}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${crypto.bgColor} flex items-center justify-center`}>
            <span className={`text-xl font-bold ${crypto.color}`}>{crypto.icon}</span>
          </div>
          <CryptoChangeBadge change={crypto.change} />
        </div>
        <h3 className="font-bold text-foreground text-lg">{crypto.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">{crypto.code} · {crypto.network}</p>
        <div className="text-xl font-bold text-foreground" data-testid={`text-crypto-price-${crypto.code}`}>{crypto.price}</div>
        <div className="text-xs text-muted-foreground mb-4">{crypto.priceZar}</div>
        {connected ? (
          <div className="space-y-2" data-testid={`wallet-connected-${crypto.code}`}>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Wallet Connected
            </div>
            <div className="bg-muted rounded-lg p-2.5 flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground truncate flex-1" data-testid={`text-wallet-address-${crypto.code}`}>
                {mockAddress.slice(0, 8)}...{mockAddress.slice(-6)}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                data-testid={`button-copy-address-${crypto.code}`}
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleConnect}
            data-testid={`button-connect-${crypto.code}`}
          >
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentsHub() {
  const { user } = useAuth();
  const [selectedFrom, setSelectedFrom] = useState("ZAR");
  const [selectedTo, setSelectedTo] = useState("USD");
  const [amount, setAmount] = useState("10000");

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const totals = useMemo(() => {
    if (!bookings || !user) return { totalEarned: 0, pending: 0, inEscrow: 0 };

    return bookings.reduce((acc, booking) => {
      const isFreelancer = booking.freelancerId === user.id;
      const amount = booking.totalAmount;

      if (isFreelancer) {
        if (booking.status === "completed") {
          acc.totalEarned += amount;
        } else if (booking.status === "pending" || booking.status === "confirmed") {
          acc.pending += amount;
        }
      }

      if (booking.status === "confirmed" || booking.status === "pending") {
        acc.inEscrow += amount;
      }

      return acc;
    }, { totalEarned: 0, pending: 0, inEscrow: 0 });
  }, [bookings, user]);

  const fromCurrency = fiatCurrencies.find((c) => c.code === selectedFrom)!;
  const toCurrency = fiatCurrencies.find((c) => c.code === selectedTo)!;
  const convertedAmount = (parseFloat(amount || "0") * (toCurrency.rate / fromCurrency.rate)).toFixed(2);

  const handleSwap = () => {
    const prev = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(prev);
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <main id="main-content" role="main">
        <section className="animated-gradient-bg text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20" data-testid="badge-payments-hero">
              <Wallet className="w-3 h-3 mr-1" /> Multi-Currency Payment Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-payments-title">
              Pay & Get Paid <span className="text-accent">Anywhere</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed" data-testid="text-payments-subtitle">
              12+ currencies across Africa, crypto wallets, mobile money, and instant settlement.
              The most flexible payment system built for Africa's gig economy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 mb-12">
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-total-earned">
                    {isLoading ? <Skeleton className="h-9 w-24 bg-white/20" /> : `R${totals.totalEarned}`}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">Pending Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-pending-payouts">
                    {isLoading ? <Skeleton className="h-9 w-24 bg-white/20" /> : `R${totals.pending}`}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">Held in Escrow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-in-escrow">
                    {isLoading ? <Skeleton className="h-9 w-24 bg-white/20" /> : `R${totals.inEscrow}`}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 text-white/70 text-sm">
              {[
                { icon: Globe, label: "12+ Currencies", testId: "stat-currencies" },
                { icon: Coins, label: "4 Cryptocurrencies", testId: "stat-crypto" },
                { icon: Zap, label: "Instant Settlement", testId: "stat-settlement" },
                { icon: Shield, label: "Escrow Protected", testId: "stat-escrow" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 glass-dark px-4 py-2 rounded-full border border-white/10" data-testid={stat.testId}>
                  <stat.icon className="w-4 h-4 text-accent" /> {stat.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-transaction-history">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Transaction History</h2>
                <p className="text-muted-foreground">Monitor your payments, payouts, and escrow status.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-download-csv">
                <Download className="w-4 h-4" /> Download CSV
              </Button>
            </div>

            <Card className="border-border">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : error ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p>Failed to load transactions. Please try again later.</p>
                  </div>
                ) : !bookings || bookings.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground" data-testid="empty-transactions">
                    <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium">No transactions yet.</p>
                    <p className="text-sm">Complete your first job to see payment activity here.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => {
                        const isFreelancer = booking.freelancerId === user?.id;
                        return (
                          <TableRow key={booking.id} data-testid={`row-transaction-${booking.id}`}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {booking.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="text-sm">
                              {booking.createdAt ? format(new Date(booking.createdAt), "MMM d, yyyy") : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isFreelancer ? (
                                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Payment In
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                                    <TrendingDown className="w-3 h-3 mr-1" /> Payment Out
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">
                              R{booking.totalAmount}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  booking.status === "completed" ? "bg-green-500/10 text-green-600" :
                                  booking.status === "confirmed" ? "bg-blue-500/10 text-blue-600" :
                                  "bg-yellow-500/10 text-yellow-600"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-exchange-rates">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Real-Time Exchange Rates</h2>
              <p className="text-muted-foreground text-lg">
                Live rates updated every 30 seconds. Convert between any supported currency pair.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              <Card className="border-primary/20 shadow-xl" data-testid="card-converter">
                <CardContent className="p-4 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="flex-1 w-full min-w-0">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">From</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedFrom}
                          onChange={(e) => setSelectedFrom(e.target.value)}
                          className="bg-muted rounded-lg px-3 py-3 text-sm font-medium outline-none border border-border shrink-0"
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
                      <button
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        title="Swap currencies"
                        data-testid="button-swap-currencies"
                      >
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                      </button>
                    </div>

                    <div className="flex-1 w-full min-w-0">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
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
                <CryptoWalletCard key={crypto.code} crypto={crypto} />
              ))}
            </div>

            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10" data-testid="card-crypto-benefits">
                <CardContent className="p-4 md:p-8">
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

        <section className="py-20 animated-gradient-bg text-white relative overflow-hidden" data-testid="section-escrow">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
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
              <div className="relative">
                <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-white/15 z-0" />
                <div className="hidden md:block absolute top-8 left-[12.5%] h-0.5 bg-green-400/60 z-0" style={{ width: "37.5%" }} />
                <div className="grid md:grid-cols-4 gap-6 relative z-10">
                  {escrowSteps.map((step, i) => (
                    <div key={i} className="relative" data-testid={`escrow-step-${step.step}`}>
                      <div className={`text-center ${step.status === "active" ? "scale-105" : ""} transition-transform`}>
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                          step.status === "complete"
                            ? "bg-green-500/20 ring-2 ring-green-400/50"
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
                        <div className={`text-xs font-semibold mb-1 ${
                          step.status === "complete" ? "text-green-400" :
                          step.status === "active" ? "text-accent" : "text-white/40"
                        }`}>
                          {step.status === "complete" ? "✓ Complete" : step.status === "active" ? "● In Progress" : `Step ${step.step}`}
                        </div>
                        <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                        <p className="text-xs text-white/60">{step.description}</p>
                      </div>
                      {i < escrowSteps.length - 1 && (
                        <div className="md:hidden flex justify-center my-3">
                          <ArrowDown className="w-5 h-5 text-white/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-6 text-xs text-white/50" data-testid="escrow-legend">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <span>Pending</span>
                </div>
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
