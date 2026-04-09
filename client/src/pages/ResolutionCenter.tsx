import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  FileText,
  Upload,
  Scale,
  Users,
  Gavel,
  Phone,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DISPUTE_TYPES = [
  { value: "work_quality", label: "Work Quality Issue", icon: FileText },
  { value: "payment", label: "Payment Dispute", icon: Scale },
  { value: "communication", label: "Communication Problem", icon: MessageSquare },
  { value: "deadline", label: "Missed Deadline", icon: Clock },
  { value: "scope", label: "Scope Disagreement", icon: AlertTriangle },
  { value: "other", label: "Other Issue", icon: HelpCircle },
];

const RESOLUTION_STEPS = [
  {
    step: 1,
    title: "Direct Communication",
    desc: "Try to resolve the issue directly with the other party through our messaging system.",
    duration: "24-48 hours"
  },
  {
    step: 2,
    title: "Submit Dispute",
    desc: "If direct communication fails, submit a formal dispute with evidence.",
    duration: "Immediate"
  },
  {
    step: 3,
    title: "Mediation",
    desc: "Our team reviews the case and facilitates a fair resolution.",
    duration: "3-5 business days"
  },
  {
    step: 4,
    title: "Resolution",
    desc: "A decision is made and funds are distributed accordingly.",
    duration: "Within 24 hours"
  },
];

export default function ResolutionCenter() {
  const { toast } = useToast();
  const [step, setStep] = useState<"info" | "form" | "submitted">("info");
  const [disputeType, setDisputeType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");

  const refIdRef = useRef(
    `DSP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeType) {
      toast({ title: "Missing field", description: "Please select a dispute type.", variant: "destructive" });
      return;
    }
    toast({
      title: "Dispute Submitted",
      description: "Our team will review your case and respond within 24-48 hours.",
    });
    setStep("submitted");
  };

  return (
    <AuthGuard message="Sign in to submit or track a dispute.">
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resolution Center</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Fair, transparent dispute resolution to protect both clients and freelancers.
            </p>
          </div>
        </section>

        {step === "info" && (
          <>
            {/* How It Works */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-12">How Dispute Resolution Works</h2>
                  
                  <div className="grid md:grid-cols-4 gap-6">
                    {RESOLUTION_STEPS.map((item) => (
                      <div key={item.step} className="text-center">
                        <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                          {item.step}
                        </div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">{item.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Protection Info */}
            <section className="py-16 bg-muted">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-card rounded-xl p-6 border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg">For Clients</h3>
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Full refund if work isn't delivered</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Partial refund for incomplete work</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Money held safely in escrow</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Revision requests supported</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-card rounded-xl p-6 border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg">For Freelancers</h3>
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Payment guaranteed for completed work</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Protection against scope creep</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Fair mediation process</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>Clear contract terms enforced</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button size="lg" onClick={() => setStep("form")} className="gap-2" data-testid="button-open-dispute">
                      Open a Dispute
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">94%</div>
                      <p className="text-muted-foreground">Disputes resolved within 5 days</p>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">89%</div>
                      <p className="text-muted-foreground">Satisfied with resolution</p>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                      <p className="text-muted-foreground">Support available</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {step === "form" && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                <Button variant="ghost" onClick={() => setStep("info")} className="mb-6">
                  ← Back to Information
                </Button>
                
                <div className="bg-card rounded-xl border p-8">
                  <h2 className="text-2xl font-bold mb-6">Submit a Dispute</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Order/Booking ID</Label>
                      <Input 
                        placeholder="e.g., ORD-2024-12345"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type of Dispute</Label>
                      <Select value={disputeType} onValueChange={setDisputeType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dispute type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISPUTE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Describe the Issue</Label>
                      <Textarea 
                        placeholder="Please provide details about what happened..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>What resolution are you seeking?</Label>
                      <Textarea 
                        placeholder="e.g., Full refund, partial refund, work completion..."
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Evidence (optional)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag files here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Screenshots, contracts, or other relevant files
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Before submitting:</p>
                          <ul className="text-amber-700 mt-1 space-y-1">
                            <li>• Have you tried resolving this directly with the other party?</li>
                            <li>• Do you have evidence to support your claim?</li>
                            <li>• False claims may result in account restrictions.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" data-testid="button-submit-dispute">
                      Submit Dispute
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === "submitted" && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-lg mx-auto text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Dispute Submitted</h2>
                <p className="text-muted-foreground mb-6">
                  Your dispute has been submitted successfully. Our team will review your case and respond within 24-48 hours.
                </p>
                
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-sm">
                    <strong>Reference:</strong> {refIdRef.current}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  You'll receive email updates about your case. For urgent matters, contact us on WhatsApp.
                </p>

                <div className="flex gap-4 justify-center">
                  <a href="https://wa.me/27601234567">
                    <Button variant="outline" className="gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp Support
                    </Button>
                  </a>
                  <Button onClick={() => { setStep("info"); setOrderId(""); setDescription(""); setResolution(""); setDisputeType(""); }}>
                    Back to Resolution Center
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
