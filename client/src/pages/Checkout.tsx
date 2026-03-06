import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { loadStripe, type Stripe, type StripeElements, type StripeCardElement } from "@stripe/stripe-js";
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

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = fetch("/api/stripe/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.publishableKey) {
          return loadStripe(data.publishableKey);
        }
        return null;
      })
      .catch(() => null);
  }
  return stripePromise;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { formatAmount } = useCurrency();
  const [step, setStep] = useState<Step>("review");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

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

  useEffect(() => {
    getStripe().then((s) => {
      if (s) {
        setStripe(s);
      }
    });
  }, []);

  const mountCardElement = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && stripe && !cardElement) {
        const elms = stripe.elements();
        const card = elms.create("card", {
          style: {
            base: {
              fontSize: "16px",
              color: "#1a1a2e",
              fontFamily: '"Inter", system-ui, sans-serif',
              "::placeholder": { color: "#94a3b8" },
              iconColor: "#6366f1",
            },
            invalid: { color: "#ef4444", iconColor: "#ef4444" },
          },
          hidePostalCode: false,
        });
        card.mount(node);
        card.on("ready", () => setCardReady(true));
        card.on("change", (event) => {
          setCardError(event.error ? event.error.message : null);
          setCardReady(event.complete);
        });
        setElements(elms);
        setCardElement(card);
      }
    },
    [stripe, cardElement]
  );

  const handlePayment = async () => {
    if (!stripe || !cardElement) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStep("processing");

    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "zar",
          description: `FreelanceSkills: ${service.title} by ${service.freelancer}`,
          metadata: {
            serviceTitle: service.title,
            freelancer: service.freelancer,
            type: "service_booking",
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Payment failed");
      }

      const { clientSecret, paymentIntentId } = await response.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        throw new Error(error.message || "Payment was declined");
      }

      if (paymentIntent?.status === "succeeded") {
        setTransactionId(paymentIntentId);
        setStep("success");
      } else {
        throw new Error("Payment was not completed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

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
                else if (step === "error") setStep("payment");
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
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
                    i <= (stepIndex ?? 0) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {i < (stepIndex ?? 0) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-sm font-medium hidden sm:inline",
                    i <= (stepIndex ?? 0) ? "text-primary" : "text-muted-foreground"
                  )}>{label}</span>
                  {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">

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
                        {service.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</span>}
                        {service.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.location}</span>}
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

              {step === "payment" && (
                <Card className="p-6" data-testid="step-payment">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Pay by Card</h2>
                      <p className="text-muted-foreground text-sm">Secure payment powered by Stripe</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 mb-6">
                    <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" className="h-6" />
                    <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" className="h-6" />
                    <img src="https://img.icons8.com/color/32/amex.png" alt="Amex" className="h-6" />
                    <span className="text-xs text-muted-foreground ml-1">& more</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Card Details</label>
                      <div
                        ref={mountCardElement}
                        className="border-2 border-border rounded-lg p-4 bg-white dark:bg-card focus-within:border-primary transition-colors"
                        data-testid="stripe-card-element"
                      />
                      {cardError && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1" data-testid="text-card-error">
                          <AlertCircle className="w-3 h-3" /> {cardError}
                        </p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium text-foreground">{service.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary" data-testid="text-payment-amount">{formatAmount(total)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 h-12"
                    size="lg"
                    onClick={handlePayment}
                    disabled={!cardReady || isProcessing || !stripe}
                    data-testid="button-pay-now"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Pay {formatAmount(total)} Securely</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3 h-3" />
                      <span>PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span>Escrow Protected</span>
                    </div>
                  </div>
                </Card>
              )}

              {step === "processing" && (
                <Card className="p-12 text-center" data-testid="step-processing">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Processing Your Payment</h2>
                  <p className="text-muted-foreground">Securely processing your card payment via Stripe...</p>
                  <p className="text-xs text-muted-foreground mt-4">This usually takes a few seconds. Please don't close this page.</p>
                </Card>
              )}

              {step === "error" && (
                <Card className="p-8 text-center" data-testid="step-error">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
                  <p className="text-muted-foreground mb-6">{errorMessage || "Something went wrong with your payment."}</p>
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-6">
                    {formatAmount(total)} has been securely deposited into escrow.
                  </p>

                  <div className="bg-muted rounded-xl p-4 text-left mb-6 max-w-sm mx-auto">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono font-bold text-foreground text-xs" data-testid="text-transaction-id">{transactionId.substring(0, 20)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary">{formatAmount(total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium text-foreground">Card via Stripe</span>
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

            {step !== "success" && step !== "processing" && step !== "error" && (
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
                      <span>Stripe secure payments</span>
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
