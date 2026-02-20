import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building2, Users, Shield, BarChart3, Briefcase, Award, Phone, CheckCircle2, ArrowRight } from "lucide-react";

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
              <Link href="/support">
                <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold gap-2" data-testid="button-contact-sales-hero">
                  <Phone className="h-4 w-4" /> Contact Sales
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" data-testid="button-learn-more">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
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

                <Link href="/support">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold gap-2 px-8" data-testid="button-contact-sales-pricing">
                    <Phone className="h-4 w-4" /> Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
