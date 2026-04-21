import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  CreditCard,
  Building2,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Step = "review" | "payment" | "processing" | "success" | "error";
type PaymentMethod = "payfast" | "paypal";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { formatAmount } = useCurrency();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<Step>("review");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payfast");
  const [paypalConfigured, setPaypalConfigured] = useState<boolean | null>(null);
  const urlParams = new URLSearchParams(window.location.search);

  const pfReturn = urlParams.get("pf_return");
  const pfPaymentId = urlParams.get("pf_payment_id");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth?tab=login&redirect=/checkout");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check PayPal availability
  useEffect(() => {
    fetch("/api/paypal/status")
      .then(r => r.json())
      .then(d => setPaypalConfigured(d.configured))
      .catch(() => setPaypalConfigured(false));
  }, []);

  // Handle PayPal return — capture the payment
  useEffect(() => {
    const ppReturn = urlParams.get("paypal_return");
    const ppToken = urlParams.get("token");
    if (ppReturn === "success" && ppToken) {
      setPaymentMethod("paypal");
      setStep("processing");
      fetch(`/api/paypal/capture/${ppToken}`, { method: "POST", headers: { "Content-Type": "application/json" } })
        .then(r => r.json())
        .then(d => {
          if (d.success) { setTransactionId(d.captureId || ppToken); setStep("success"); }
          else { setErrorMessage(d.error || "PayPal capture failed"); setStep("error"); }
        })
        .catch(() => { setErrorMessage("PayPal capture failed. Please contact support."); setStep("error"); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (pfReturn === "success" && pfPaymentId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="p-8 text-center" data-testid="step-success">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400 mb-6">
                Your payment has been securely deposited into escrow.
              </p>
              <div className="bg-slate-800 rounded-xl p-4 text-left mb-6 max-w-sm mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment ID</span>
                    <span className="font-mono font-bold text-white text-xs" data-testid="text-transaction-id">{pfPaymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method</span>
                    <span className="font-medium text-white">PayFast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const service = {
    title: params.get("title") || "Service Booking",
    freelancer: params.get("freelancer") || "Freelancer",
    rating: parseFloat(params.get("rating") || "4.9"),
    reviews: parseInt(params.get("reviews") || "0"),
    price: parseInt(params.get("price") || "0") / 100,
    duration: params.get("duration") || "",
    location: params.get("location") || "",
    image: params.get("image") || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop",
  };
  const isSubscription = service.title.toLowerCase().includes("subscription");
  const serviceFee = isSubscription ? 0 : Math.round(service.price * 0.1);
  const total = service.price + serviceFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStep("processing");

    try {
      const response = await fetch("/api/payfast/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          itemName: `FreelanceSkills: ${service.title} by ${service.freelancer}`,
          itemDescription: service.title,
          metadata: {
            serviceTitle: service.title,
            freelancer: service.freelancer,
            type: "service_booking",
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Payment creation failed");
      }

      const data = await response.json();

      if (data.paymentUrl && data.paymentData) {
        const storeRes = await fetch("/api/payfast/store-redirect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentUrl: data.paymentUrl, paymentData: data.paymentData }),
        });
        if (!storeRes.ok) throw new Error("Failed to prepare payment redirect");
        const { token } = await storeRes.json();
        window.location.href = `/api/payfast/go/${token}`;
        return;
      }

      if (data.sandbox && data.paymentId) {
        setTransactionId(data.paymentId);
        setStep("success");
        return;
      }

      throw new Error("No payment URL received from PayFast");
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStep("processing");
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(total * 100),
          currency: "USD",
          description: `FreelanceSkills: ${service.title} by ${service.freelancer}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "PayPal order creation failed");
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
        return;
      }
      throw new Error("No PayPal approval URL received");
    } catch (err: any) {
      console.error("PayPal error:", err);
      setErrorMessage(err.message || "PayPal payment failed");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === "paypal") handlePayPalPayment();
    else handlePayment();
  };

  if (service.price === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center py-20">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No service selected</h2>
            <p className="text-slate-400 mb-6">Please select a service to proceed with checkout.</p>
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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {step !== "success" && step !== "processing" && (
            <button
              onClick={() => {
                if (step === "review") navigate("/services");
                else if (step === "payment") setStep("review");
                else if (step === "error") setStep("payment");
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="flex items-center justify-center gap-2 mb-8">
            {["Review", "Payment", "Confirm"].map((label, i) => {
              const stepIndex = { review: 0, payment: 1, processing: 2, success: 3, error: 1 }[step];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    i <= (stepIndex ?? 0) ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {i < (stepIndex ?? 0) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-sm font-medium hidden sm:inline",
                    i <= (stepIndex ?? 0) ? "text-emerald-400" : "text-slate-400"
                  )}>{label}</span>
                  {i < 2 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">

              {step === "review" && (
                <Card className="p-6" data-testid="step-review">
                  <h2 className="text-xl font-bold text-white mb-4">Review Your Order</h2>

                  <div className="flex gap-4 mb-6">
                    <img src={service.image} alt={service.title} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg" data-testid="text-service-title">{service.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {service.freelancer.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-400">{service.freelancer}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-xs text-slate-400">({service.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        {service.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</span>}
                        {service.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.location}</span>}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{isSubscription ? "Subscription fee" : "Service fee"}</span>
                      <span className="font-medium text-white">{formatAmount(service.price)}</span>
                    </div>
                    {!isSubscription && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Platform fee (10%)</span>
                        <span className="font-medium text-white">{formatAmount(serviceFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-emerald-400" data-testid="text-total">{formatAmount(total)}</span>
                    </div>
                    {isSubscription && service.duration && (
                      <p className="text-xs text-slate-400 text-center">Billed {service.duration.toLowerCase()} · Cancel anytime</p>
                    )}
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

              {step === "payment" && (
                <Card className="p-6" data-testid="step-payment">
                  <h2 className="text-xl font-bold text-white mb-4">Choose Payment Method</h2>

                  {/* Method selector */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod("payfast")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "payfast" ? "border-emerald-500 bg-emerald-500/8" : "border-slate-700 hover:border-slate-600"}`}
                      data-testid="method-payfast"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1A7A4A] to-[#0E5533] rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">PayFast</p>
                        <p className="text-[11px] text-slate-400">Card · EFT · SnapScan</p>
                      </div>
                      {paymentMethod === "payfast" && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                    </button>

                    <button
                      onClick={() => paypalConfigured && setPaymentMethod("paypal")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left relative ${paymentMethod === "paypal" ? "border-blue-500 bg-blue-500/8" : paypalConfigured ? "border-slate-700 hover:border-slate-600" : "border-slate-800 opacity-60 cursor-not-allowed"}`}
                      data-testid="method-paypal"
                      title={paypalConfigured === false ? "PayPal not configured — add PAYPAL_CLIENT_ID & PAYPAL_CLIENT_SECRET" : undefined}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00457C] to-[#0066B2] rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-sm">PP</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">PayPal</p>
                        <p className="text-[11px] text-slate-400">{paypalConfigured ? "International · USD" : "Not configured"}</p>
                      </div>
                      {paymentMethod === "paypal" && <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto" />}
                    </button>
                  </div>

                  {/* Payment info */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300 mb-4">
                    <p className="font-bold mb-1">How it works</p>
                    {paymentMethod === "payfast"
                      ? <p>You'll be redirected to PayFast to pay by card, EFT, SnapScan, or Mobicred. Funds go straight into escrow — released only when you approve the work.</p>
                      : <p>You'll be redirected to PayPal to complete payment securely. Funds are held in escrow and released when you confirm the work is done.</p>
                    }
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service</span>
                      <span className="font-medium text-white">{service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Freelancer</span>
                      <span className="font-medium text-white">{service.freelancer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="font-bold text-emerald-400" data-testid="text-payment-amount">{formatAmount(total)}</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full h-12 ${paymentMethod === "paypal" ? "bg-[#0066B2] hover:bg-[#005299]" : ""}`}
                    size="lg"
                    onClick={handlePay}
                    disabled={isProcessing}
                    data-testid="button-pay-now"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Pay {formatAmount(total)} via {paymentMethod === "paypal" ? "PayPal" : "PayFast"}</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span>Escrow Protected</span>
                    </div>
                  </div>
                </Card>
              )}

              {step === "processing" && (
                <Card className="p-12 text-center" data-testid="step-processing">
                  <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-white mb-2">
                    Redirecting to {paymentMethod === "paypal" ? "PayPal" : "PayFast"}
                  </h2>
                  <p className="text-slate-400">
                    You'll be redirected to {paymentMethod === "paypal" ? "PayPal" : "PayFast"} to complete your secure payment…
                  </p>
                  <p className="text-xs text-slate-400 mt-4">Please don't close this page.</p>
                </Card>
              )}

              {step === "error" && (
                <Card className="p-8 text-center" data-testid="step-error">
                  <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                  <p className="text-slate-400 mb-6">{errorMessage || "Something went wrong with your payment."}</p>
                  <Button onClick={() => { setStep("payment"); setErrorMessage(null); }} data-testid="button-try-again">
                    Try Again
                  </Button>
                </Card>
              )}

              {step === "success" && (
                <Card className="p-8 text-center" data-testid="step-success">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                  <p className="text-slate-400 mb-6">
                    {isSubscription
                      ? `Your Premium Talent plan is now active. Welcome to the Pro community!`
                      : `${formatAmount(total)} has been securely deposited into escrow.`}
                  </p>

                  <div className="bg-slate-800 rounded-xl p-4 text-left mb-6 max-w-sm mx-auto">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment ID</span>
                        <span className="font-mono font-bold text-white text-xs" data-testid="text-transaction-id">{transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-bold text-emerald-400">{formatAmount(total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Method</span>
                        <span className="font-medium text-white">{paymentMethod === "paypal" ? "PayPal" : "PayFast"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          {isSubscription ? "Active" : "In Escrow"}
                        </Badge>
                      </div>
                      {isSubscription && service.duration && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Billing</span>
                          <span className="font-medium text-white">{service.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300 mb-6 max-w-sm mx-auto">
                    <p className="font-bold mb-1">What happens next?</p>
                    {isSubscription
                      ? <p>Your Premium Talent badge is live on your profile. Early access to global jobs and priority placement are now active.</p>
                      : <p>Your freelancer has been notified and will begin work. Funds remain safely in escrow until you confirm the job is complete.</p>
                    }
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                      Go to Dashboard
                    </Button>
                    {!isSubscription && (
                      <Button variant="outline" onClick={() => navigate("/messages")} data-testid="button-message-freelancer">
                        Message Freelancer
                      </Button>
                    )}
                    {isSubscription && (
                      <Button variant="outline" onClick={() => navigate("/jobs")} data-testid="button-browse-global-jobs">
                        Browse Global Jobs
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {step !== "success" && step !== "processing" && step !== "error" && (
              <div className="md:col-span-1">
                <Card className="p-5 sticky top-28" data-testid="order-summary">
                  <h3 className="font-bold text-white mb-4">Order Summary</h3>

                  <div className="flex gap-3 mb-4">
                    <img src={service.image} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-white text-sm leading-tight">{service.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{service.freelancer}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isSubscription ? "Subscription" : "Service"}</span>
                      <span className="text-white">{formatAmount(service.price)}</span>
                    </div>
                    {!isSubscription && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Platform fee</span>
                        <span className="text-white">{formatAmount(serviceFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-white">Total</span>
                      <span className="text-emerald-400">{formatAmount(total)}</span>
                    </div>
                    {isSubscription && service.duration && (
                      <p className="text-xs text-slate-400 text-center pt-1">Billed {service.duration.toLowerCase()} · Cancel anytime</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Escrow protected</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span>PayFast secure payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
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
