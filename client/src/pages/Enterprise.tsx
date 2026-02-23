import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Building2, Users, Shield, BarChart3, Briefcase, Award, Phone, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Bulk Hiring Dashboard",
    description: "Post 100+ positions at once with our streamlined bulk upload tools. Manage all your vacancies from a single, powerful dashboard.",
  },
  {
    icon: Building2,
    title: "Tender Integration",
    description: "Connect directly with government procurement systems. Seamlessly align your hiring needs with active tenders and contracts.",
  },
  {
    icon: Shield,
    title: "Verified Talent Pool",
    description: "Access pre-screened, skills-tested professionals. Every candidate is identity-verified and background-checked for your peace of mind.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "Enjoy white-glove service with a dedicated account manager who understands your business and hiring requirements.",
  },
  {
    icon: BarChart3,
    title: "Custom Reporting & Analytics",
    description: "Track hiring metrics, time-to-fill, cost-per-hire, and workforce performance with real-time analytics dashboards.",
  },
  {
    icon: Award,
    title: "Youth Employment Programs",
    description: "Partner with us for social impact. Access government-subsidised youth employment initiatives and skills development programs.",
  },
];

const PARTNERS = [
  "Dept. of Public Works",
  "Standard Bank",
  "MTN",
  "Builders Warehouse",
  "Municipal Governments",
];

const METRICS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "10,000+", label: "Positions Filled" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function Enterprise() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    companySize: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/enterprise/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setSubmitError(null);
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }
    setSubmitError(null);
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" /> For Corporates & Government
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6" data-testid="text-enterprise-heading">
              Enterprise & Government Solutions
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Bulk hiring, tender integration, and youth employment programs — all on one platform built for South Africa's largest employers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold gap-2" data-testid="button-contact-sales-hero" onClick={scrollToForm}>
                  <Phone className="h-4 w-4" /> Contact Sales
                </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" data-testid="button-learn-more" onClick={() => navigate("/how-it-works")}>
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Everything You Need at Scale</h2>
              <p className="text-muted-foreground text-lg">Purpose-built tools for enterprise recruitment and government workforce programs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                  data-testid={`card-feature-${i}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary mb-4">Trusted Partners</h2>
              <p className="text-muted-foreground">Leading organisations rely on FreelanceSkills for their workforce needs.</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {PARTNERS.map((partner, i) => (
                <span
                  key={i}
                  className="text-xl font-bold font-display text-muted-foreground/70 hover:text-primary transition-colors"
                  data-testid={`text-partner-${i}`}
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              {METRICS.map((metric, i) => (
                <div key={i} data-testid={`text-metric-${i}`}>
                  <div className="text-5xl font-display font-bold text-accent mb-2">{metric.value}</div>
                  <p className="text-white/80 text-lg">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Custom Enterprise Plans</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Every enterprise is unique. We offer tailored pricing, dedicated onboarding, and custom integrations to fit your organisation's needs.
              </p>

              <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                  {[
                    "Consolidated monthly invoicing",
                    "Custom legal contracts & SLAs",
                    "API access for ATS integration",
                    "Dedicated success manager",
                    "Priority candidate matching",
                    "Volume-based pricing discounts",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold gap-2 px-8" data-testid="button-contact-sales-pricing" onClick={scrollToForm}>
                    <Phone className="h-4 w-4" /> Contact Sales
                  </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="py-20 bg-card border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Contact Our Sales Team</h2>
                <p className="text-muted-foreground text-lg">Fill in the form below and our enterprise team will get back to you within 24 hours.</p>
              </div>

              {submitted ? (
                <Card className="p-8 md:p-12 text-center" data-testid="contact-form-success">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">Thank you!</h3>
                  <p className="text-muted-foreground text-lg">Our enterprise team will contact you within 24 hours.</p>
                </Card>
              ) : (
                <Card className="p-8 md:p-12" data-testid="contact-form-card">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          data-testid="input-company-name"
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Your company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input
                          id="contactPerson"
                          data-testid="input-contact-person"
                          required
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          data-testid="input-email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          data-testid="input-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+27 XX XXX XXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                      >
                        <SelectTrigger data-testid="select-company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10" data-testid="select-option-1-10">1-10</SelectItem>
                          <SelectItem value="11-50" data-testid="select-option-11-50">11-50</SelectItem>
                          <SelectItem value="51-200" data-testid="select-option-51-200">51-200</SelectItem>
                          <SelectItem value="201-500" data-testid="select-option-201-500">201-500</SelectItem>
                          <SelectItem value="500+" data-testid="select-option-500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message / Requirements *</Label>
                      <Textarea
                        id="message"
                        data-testid="textarea-message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your hiring needs, team size, and any specific requirements..."
                        rows={5}
                      />
                    </div>

                    {submitError && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {submitError}
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-white hover:bg-primary/90 font-bold gap-2"
                      data-testid="button-submit-enquiry"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><Phone className="h-4 w-4" /> Submit Enquiry</>
                      )}
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
