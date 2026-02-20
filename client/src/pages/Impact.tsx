import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useCurrency } from "@/lib/currency";
import {
  Briefcase,
  TrendingUp,
  Users,
  MapPin,
  ThumbsUp,
  BadgeCheck,
  Monitor,
  Hammer,
  Palette,
  Wrench,
  Zap,
  Truck,
  BookOpen,
  Megaphone,
  ArrowRight,
  Target,
  Heart,
  Star,
  Quote,
} from "lucide-react";

const impactCounters = [
  { icon: Briefcase, value: "12,847", label: "Jobs Created", color: "text-blue-500" },
  { icon: TrendingUp, value: "R47.2M", label: "Income Generated", color: "text-green-500", isCurrency: true },
  { icon: Users, value: "8,432", label: "Freelancers Empowered", color: "text-purple-500" },
  { icon: MapPin, value: "156", label: "Communities Reached", color: "text-orange-500" },
  { icon: ThumbsUp, value: "94%", label: "Client Satisfaction", color: "text-rose-500" },
  { icon: BadgeCheck, value: "2,100+", label: "Skills Verified", color: "text-teal-500" },
];

const categories = [
  { name: "Technology", icon: Monitor, jobs: 3420, progress: 85 },
  { name: "Construction", icon: Hammer, jobs: 2870, progress: 72 },
  { name: "Design & Creative", icon: Palette, jobs: 1890, progress: 58 },
  { name: "Plumbing & HVAC", icon: Wrench, jobs: 1540, progress: 48 },
  { name: "Electrical", icon: Zap, jobs: 1320, progress: 42 },
  { name: "Transport & Logistics", icon: Truck, jobs: 980, progress: 32 },
  { name: "Education & Training", icon: BookOpen, jobs: 560, progress: 20 },
  { name: "Marketing & Sales", icon: Megaphone, jobs: 267, progress: 12 },
];

const successStories = [
  {
    name: "Thabo M.",
    location: "Johannesburg, Gauteng",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200",
    before: "Unemployed IT graduate for 2 years",
    after: "Full-stack developer earning R45k/month",
    quote: "FreelanceSkills gave me my first real opportunity. Within 3 months I had enough portfolio work to land consistent contracts. Now I lead a team of 4 developers.",
    monthlyEarningZar: 45000,
    skill: "Software Development",
  },
  {
    name: "Nomsa K.",
    location: "Durban, KwaZulu-Natal",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200",
    before: "Single mother working part-time retail",
    after: "Owner of a plumbing business with 6 employees",
    quote: "As a woman in plumbing, nobody took me seriously. FreelanceSkills' verified reviews changed everything. Clients trust me before we even meet.",
    monthlyEarningZar: 38000,
    skill: "Plumbing",
  },
  {
    name: "David N.",
    location: "Limpopo Province",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200",
    before: "Rural electrician with limited local clients",
    after: "Expanded services to 3 provinces",
    quote: "Living in a rural area, I thought my reach was limited. Through FreelanceSkills, I now serve clients in Limpopo, Mpumalanga, and Gauteng.",
    monthlyEarningZar: 52000,
    skill: "Electrical",
  },
  {
    name: "Lindiwe S.",
    location: "Cape Town, Western Cape",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    before: "Freelance designer struggling to find clients",
    after: "International clients across 8 countries",
    quote: "The platform's currency support and escrow protection gave international clients confidence to hire me. I now work with brands in Europe and the US.",
    monthlyEarningZar: 62000,
    skill: "Graphic Design",
  },
];

export default function Impact() {
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-primary text-white pt-32 pb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6" data-testid="badge-impact-hero">
              <Heart className="w-4 h-4" />
              Social Impact Dashboard
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6" data-testid="text-impact-title">
              Our Impact on Africa
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed" data-testid="text-impact-subtitle">
              Reducing unemployment across the continent by digitally connecting skilled professionals
              with opportunities — one job at a time.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-counters-heading">Live Impact Numbers</h2>
              <p className="text-muted-foreground text-lg">Real results from real people across Africa</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {impactCounters.map((counter, i) => (
                <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow" data-testid={`card-counter-${i}`}>
                  <counter.icon className={`w-8 h-8 mx-auto mb-3 ${counter.color}`} />
                  <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1" data-testid={`text-counter-value-${i}`}>
                    {counter.isCurrency ? formatAmount(47200000) : counter.value}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium" data-testid={`text-counter-label-${i}`}>{counter.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-categories-heading">Impact by Category</h2>
              <p className="text-muted-foreground text-lg">Where we're making the biggest difference</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {categories.map((cat, i) => (
                <Card key={i} className="p-5 hover:shadow-md transition-shadow" data-testid={`card-category-${i}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <cat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-semibold text-foreground truncate" data-testid={`text-category-name-${i}`}>{cat.name}</h3>
                        <span className="text-sm text-muted-foreground font-medium ml-2">{cat.jobs.toLocaleString()} jobs</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                          style={{ width: `${cat.progress}%` }}
                          data-testid={`progress-category-${i}`}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-stories-heading">Success Stories</h2>
              <p className="text-muted-foreground text-lg">Real transformations powered by FreelanceSkills</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {successStories.map((story, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-story-${i}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={story.image}
                        alt={story.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                        data-testid={`img-story-${i}`}
                      />
                      <div>
                        <h3 className="font-bold text-foreground" data-testid={`text-story-name-${i}`}>{story.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {story.skill}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-600 mb-1">BEFORE</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-story-before-${i}`}>{story.before}</p>
                      </div>
                      <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-600 mb-1">AFTER</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-story-after-${i}`}>{story.after}</p>
                      </div>
                    </div>

                    <div className="relative bg-muted rounded-lg p-4">
                      <Quote className="w-5 h-5 text-primary/30 absolute top-2 left-2" />
                      <p className="text-sm text-muted-foreground italic pl-4" data-testid={`text-story-quote-${i}`}>
                        "{story.quote}"
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-green-600" data-testid={`text-story-earning-${i}`}>
                        Now earning {formatAmount(story.monthlyEarningZar)}/month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <Target className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-mission-heading">
              Empowering 1 Million Africans by 2031
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
              We're on a mission to create sustainable employment opportunities for one million people
              across the African continent through digital skills and connections.
            </p>
            <div className="max-w-xl mx-auto">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Progress</span>
                <span className="text-accent">12,847 / 1,000,000</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden" data-testid="progress-mission">
                <div
                  className="h-full bg-gradient-to-r from-accent to-green-400 rounded-full transition-all duration-1000"
                  style={{ width: "1.28%" }}
                />
              </div>
              <p className="text-white/60 text-sm mt-3">1.28% of our goal — and growing every day</p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-cta-heading">
              Join the Movement
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Whether you're a skilled professional looking for work or a business seeking talent,
              you can be part of Africa's largest freelance skills revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 font-bold px-8" data-testid="button-become-freelancer" onClick={() => navigate("/explore")}>
                  Become a Freelancer <ArrowRight className="w-4 h-4" />
                </Button>
              <Button size="lg" variant="outline" className="gap-2 font-bold px-8" data-testid="button-hire-talent" onClick={() => navigate("/post-job")}>
                  Hire Talent <Users className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}