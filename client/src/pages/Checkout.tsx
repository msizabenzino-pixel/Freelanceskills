import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import PayPalButton from "@/components/PayPalButton";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  CreditCard,
  Banknote,
  Building2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Smartphone,
  Mail,
  Wallet,
} from "lucide-react";

const OZOW_BANKS = [
  { id: "fnb", name: "FNB (First National Bank)", color: "bg-[#009639]", textColor: "text-white", logo: "FNB" },
  { id: "capitec", name: "Capitec Bank", color: "bg-[#ED1C24]", textColor: "text-white", logo: "Capitec" },
  { id: "standard", name: "Standard Bank", color: "bg-[#0033A0]", textColor: "text-white", logo: "SB" },
  { id: "absa", name: "ABSA", color: "bg-[#AF0C2C]", textColor: "text-white", logo: "ABSA" },
  { id: "nedbank", name: "Nedbank", color: "bg-[#009639]", textColor: "text-white", logo: "NB" },
  { id: "investec", name: "Investec", color: "bg-[#003865]", textColor: "text-white", logo: "INV" },
  { id: "tymebank", name: "TymeBank", color: "bg-[#FFD100]", textColor: "text-black", logo: "Tyme" },
  { id: "discovery", name: "Discovery Bank", color: "bg-[#0B3D2E]", textColor: "text-white", logo: "DB" },
  { id: "african", name: "African Bank", color: "bg-[#E85D04]", textColor: "text-white", logo: "AB" },
  { id: "rmb", name: "RMB (Rand Merchant Bank)", color: "bg-[#003865]", textColor: "text-white", logo: "RMB" },
  { id: "bidvest", name: "Bidvest Bank", color: "bg-[#1B3A5C]", textColor: "text-white", logo: "BV" },
];

type Step = "review" | "payment" | "bank" | "authenticate" | "processing" | "success" | "paypal";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { formatAmount } = useCurrency();
  const [step, setStep] = useState<Step>("review");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isProcessing, setIsProcessing] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const service = {
    title: params.get("title") || "Service Booking",
    freelancer: params.get("freelancer") || "Freelancer",
    rating: parseFloat(params.get("rating") || "4.9"),
    reviews: parseInt(params.get("reviews") || "0"),
    price: parseInt(params.get("price") || "0"),
    duration: params.get("duration") || "",
    location: params.get("location") || "",
    image: params.get("image") || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop",
  };
  const serviceFee = Math.round(service.price * 0.1);
  const total = service.price + serviceFee;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        const nextInput = document.querySelector<HTMLInputElement>(`[data-testid="input-otp-${index + 1}"]`);
        nextInput?.focus();
      }
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === "ozow") {
      setStep("bank");
    } else if (method === "paypal") {
      setStep("paypal");
    }
  };

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep("authenticate");
  };

  const handleAuthenticate = () => {
    if (otp.join("").length === 4) {
      setIsProcessing(true);
      setStep("processing");
      setTimeout(() => {
        setIsProcessing(false);
        setStep("success");
      }, 3000);
    }
  };

  const selectedBankInfo = OZOW_BANKS.find(b => b.id === selectedBank);

  if (service.price === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center py-20">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No service selected</h2>
            <p className="text-muted-foreground mb-6">Please select a service to proceed with checkout.</p>
            <Button onClick={() => navigate("/services")} data-testid="button-browse-services">
              Browse Services
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">

          {step !== "success" && step !== "processing" && (
            <button
              onClick={() => {
                if (step === "review") navigate("/services");
                else if (step === "payment") setStep("review");
                else if (step === "bank") { setStep("payment"); setSelectedMethod(null); }
                else if (step === "paypal") { setStep("payment"); setSelectedMethod(null); }
                else if (step === "authenticate") { setStep("bank"); setSelectedBank(null); }
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Review", "Payment", "Bank", "Confirm"].map((label, i) => {
              const stepIndex = { review: 0, payment: 1, bank: 2, authenticate: 3, processing: 3, success: 4 }[step];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    i <= (stepIndex ?? 0) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {i < (stepIndex ?? 0) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-sm font-medium hidden sm:inline",
                    i <= (stepIndex ?? 0) ? "text-primary" : "text-muted-foreground"
                  )}>{label}</span>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2">

              {/* Step 1: Review Order */}
              {step === "review" && (
                <Card className="p-6" data-testid="step-review">
                  <h2 className="text-xl font-bold text-foreground mb-4">Review Your Order</h2>

                  <div className="flex gap-4 mb-6">
                    <img src={service.image} alt={service.title} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg" data-testid="text-service-title">{service.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {service.freelancer.charAt(0)}
                        </div>
                        <span className="text-sm text-muted-foreground">{service.freelancer}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.location}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service fee</span>
                      <span className="font-medium text-foreground">{formatAmount(service.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform fee (10%)</span>
                      <span className="font-medium text-foreground">{formatAmount(serviceFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary" data-testid="text-total">{formatAmount(total)}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mt-4 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">Escrow Protection</p>
                      <p className="text-emerald-700 dark:text-emerald-400">Your payment is held securely until you confirm the work is complete. You're always protected.</p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={() => setStep("payment")}
                    data-testid="button-proceed-payment"
                  >
                    Proceed to Payment <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Card>
              )}

              {/* Step 2: Select Payment Method */}
              {step === "payment" && (
                <Card className="p-6" data-testid="step-payment">
                  <h2 className="text-xl font-bold text-foreground mb-2">Select Payment Method</h2>
                  <p className="text-muted-foreground text-sm mb-6">Choose how you'd like to pay {formatAmount(total)}</p>

                  <div className="space-y-3">
                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                        selectedMethod === "paypal" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                      )}
                      onClick={() => handlePaymentMethodSelect("paypal")}
                      data-testid="payment-method-paypal"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          PayPal
                        </div>
                        <div>
                          <div className="font-bold text-foreground">PayPal</div>
                          <div className="text-xs text-muted-foreground">Pay securely with PayPal — cards, bank, or PayPal balance</div>
                          <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 text-blue-700 border-blue-200">Recommended</Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                        selectedMethod === "ozow" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                      )}
                      onClick={() => handlePaymentMethodSelect("ozow")}
                      data-testid="payment-method-ozow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          Ozow
                        </div>
                        <div>
                          <div className="font-bold text-foreground">Ozow Instant EFT</div>
                          <div className="text-xs text-muted-foreground">Pay directly from your bank — FNB, Capitec, ABSA, Standard Bank, Nedbank & more</div>
                          <Badge variant="secondary" className="mt-1 text-xs">Popular in SA</Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                        selectedMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                      )}
                      onClick={() => handlePaymentMethodSelect("card")}
                      data-testid="payment-method-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">Credit / Debit Card</div>
                          <div className="text-xs text-muted-foreground">Visa, Mastercard, American Express</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                        selectedMethod === "payfast" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                      )}
                      onClick={() => handlePaymentMethodSelect("payfast")}
                      data-testid="payment-method-payfast"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          PayFast
                        </div>
                        <div>
                          <div className="font-bold text-foreground">PayFast</div>
                          <div className="text-xs text-muted-foreground">Credit Card, Instant EFT, QR Code, SnapScan</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                        selectedMethod === "eft" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                      )}
                      onClick={() => handlePaymentMethodSelect("eft")}
                      data-testid="payment-method-eft"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <Banknote className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">Manual EFT / Bank Transfer</div>
                          <div className="text-xs text-muted-foreground">Transfer directly to our escrow account (1-3 business days)</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3 mt-4 flex gap-2 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>All payments are encrypted with 256-bit SSL. Funds are held in escrow until you confirm the work is done.</span>
                  </div>
                </Card>
              )}

              {/* Step 3: Ozow Bank Selection */}
              {step === "bank" && (
                <Card className="p-6" data-testid="step-bank-selection">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-7 bg-black rounded flex items-center justify-center text-white font-bold text-xs">Ozow</div>
                    <h2 className="text-xl font-bold text-foreground">Select Your Bank</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">Choose your bank to make an instant payment of {formatAmount(total)}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OZOW_BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        className={cn(
                          "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md flex items-center gap-3",
                          selectedBank === bank.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                        )}
                        onClick={() => handleBankSelect(bank.id)}
                        data-testid={`bank-${bank.id}`}
                      >
                        <div className={cn("w-12 h-8 rounded-lg flex items-center justify-center font-bold text-xs", bank.color, bank.textColor)}>
                          {bank.logo}
                        </div>
                        <span className="font-medium text-foreground text-sm">{bank.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-bold mb-1">How Ozow works</p>
                      <p>After selecting your bank, you'll be redirected to your bank's secure login page to authorize the payment. No card details needed — it's a direct bank transfer.</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 4: Bank Authentication */}
              {step === "authenticate" && selectedBankInfo && (
                <Card className="p-6" data-testid="step-authenticate">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-12 h-8 rounded-lg flex items-center justify-center font-bold text-xs", selectedBankInfo.color, selectedBankInfo.textColor)}>
                      {selectedBankInfo.logo}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{selectedBankInfo.name}</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">Authorize your payment of {formatAmount(total)}</p>

                  <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6">
                    <div className="text-center mb-6">
                      <div className={cn("w-16 h-12 rounded-xl flex items-center justify-center font-bold text-sm mx-auto mb-3", selectedBankInfo.color, selectedBankInfo.textColor)}>
                        {selectedBankInfo.logo}
                      </div>
                      <p className="text-sm text-muted-foreground">Secure banking authentication</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Paying to</span>
                          <span className="font-bold text-foreground">FreelanceSkills Escrow</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold text-primary" data-testid="text-auth-amount">{formatAmount(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reference</span>
                          <span className="font-mono text-foreground text-xs">FS-2026-{Math.floor(Math.random() * 90000 + 10000)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Enter your banking app approval code</Label>
                        <p className="text-xs text-muted-foreground">
                          A notification has been sent to your {selectedBankInfo.name} app. Enter the 4-digit code to confirm.
                        </p>
                        <div className="flex justify-center gap-3 py-2">
                          {otp.map((digit, i) => (
                            <Input
                              key={i}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              className="w-14 h-14 text-center text-2xl font-bold border-2"
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              data-testid={`input-otp-${i}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAuthenticate}
                    disabled={otp.join("").length < 4}
                    data-testid="button-confirm-payment"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Confirm Payment
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    By confirming, you agree to FreelanceSkills' <a href="/terms" className="text-primary underline">Terms of Service</a>
                  </p>
                </Card>
              )}

              {step === "paypal" && (
                <Card className="p-6" data-testid="step-paypal">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-14 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      PayPal
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Pay with PayPal</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Complete your payment of {formatAmount(total)} securely through PayPal
                  </p>

                  <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium text-foreground">{service.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary" data-testid="text-paypal-amount">{formatAmount(total)}</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <PayPalButton
                        amount={(total / 100).toFixed(2)}
                        currency="ZAR"
                        intent="CAPTURE"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-bold mb-1">PayPal Buyer Protection</p>
                      <p>Your payment is protected by both PayPal's buyer protection and FreelanceSkills' escrow system.</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Processing */}
              {step === "processing" && (
                <Card className="p-12 text-center" data-testid="step-processing">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Processing Your Payment</h2>
                  <p className="text-muted-foreground">Securely transferring funds to escrow via {selectedBankInfo?.name}...</p>
                  <p className="text-xs text-muted-foreground mt-4">This usually takes a few seconds. Please don't close this page.</p>
                </Card>
              )}

              {/* Success */}
              {step === "success" && (
                <Card className="p-8 text-center" data-testid="step-success">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-6">
                    {formatAmount(total)} has been securely deposited into escrow via {selectedBankInfo?.name}.
                  </p>

                  <div className="bg-muted rounded-xl p-4 text-left mb-6 max-w-sm mx-auto">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono font-bold text-foreground">FS-{Math.floor(Math.random() * 900000 + 100000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary">{formatAmount(total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium text-foreground">Ozow — {selectedBankInfo?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">In Escrow</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300 mb-6 max-w-sm mx-auto">
                    <p className="font-bold mb-1">What happens next?</p>
                    <p>Your freelancer has been notified and will begin work. Funds remain safely in escrow until you confirm the job is complete.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                      Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/messages")} data-testid="button-message-freelancer">
                      Message Freelancer
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {step !== "success" && step !== "processing" && (
              <div className="md:col-span-1">
                <Card className="p-5 sticky top-28" data-testid="order-summary">
                  <h3 className="font-bold text-foreground mb-4">Order Summary</h3>

                  <div className="flex gap-3 mb-4">
                    <img src={service.image} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-foreground text-sm leading-tight">{service.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.freelancer}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="text-foreground">{formatAmount(service.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform fee</span>
                      <span className="text-foreground">{formatAmount(serviceFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{formatAmount(total)}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Escrow protected</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      <span>FreelanceSkills (Pty) Ltd</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}