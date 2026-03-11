import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Rocket, 
  TrendingUp, 
  Brain, 
  Link as LinkIcon, 
  Globe, 
  Layout, 
  Leaf, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Calendar
} from "lucide-react";

interface Milestone {
  year: string;
  phase: string;
  description: string;
  status: "live" | "building" | "planned";
  progress: number;
  features: string[];
  icon: any;
}

const milestones: Milestone[] = [
  {
    year: "2024",
    phase: "Foundation",
    description: "Establishing the core marketplace for South African freelancers.",
    status: "live",
    progress: 100,
    features: ["Escrow Payments", "ID Verification", "Job Board", "Mobile App (PWA)"],
    icon: Rocket
  },
  {
    year: "2025",
    phase: "Growth",
    description: "Expanding ecosystem and community features.",
    status: "building",
    progress: 65,
    features: ["Academy & Upskilling", "Community Forum", "Referral System", "Advanced Analytics"],
    icon: TrendingUp
  },
  {
    year: "2026",
    phase: "AI Integration",
    description: "AI-powered matching and assistance for better productivity.",
    status: "building",
    progress: 30,
    features: ["AI Smart Match", "AI Job Post Helper", "AI Proposal Assistant", "Voice Search"],
    icon: Brain
  },
  {
    year: "2027",
    phase: "Blockchain & Trust",
    description: "Decentralized trust and secure, instant global payments.",
    status: "planned",
    progress: 10,
    features: ["NFT Skill Badges", "Blockchain Credentials", "Crypto Payouts (USDC)", "ZKP Proofs"],
    icon: LinkIcon
  },
  {
    year: "2028",
    phase: "Global Expansion",
    description: "Connecting SA talent to the global digital economy.",
    status: "planned",
    progress: 0,
    features: ["Multi-currency Support", "Real-time Translation", "Global Tax Compliance", "Work Visas Support"],
    icon: Globe
  },
  {
    year: "2029",
    phase: "Metaverse & VR",
    description: "Virtual workspaces and immersive job fairs.",
    status: "planned",
    progress: 0,
    features: ["3D Portfolio Previews", "VR Coworking Spaces", "Virtual Job Fairs", "Avatar Interviews"],
    icon: Layout
  },
  {
    year: "2030",
    phase: "Sustainability",
    description: "Regenerative economy and green impact tracking.",
    status: "planned",
    progress: 0,
    features: ["Carbon Footprint Tracking", "Green Impact Scores", "Eco-friendly Job Boost", "Reforestation Offsets"],
    icon: Leaf
  },
  {
    year: "2031",
    phase: "Vision Complete",
    description: "A fully decentralized, AI-driven, sustainable talent ecosystem.",
    status: "planned",
    progress: 0,
    features: ["DAO Governance", "Quantum-Safe Security", "Autonomous Contracts", "Predictive Economy"],
    icon: Eye
  }
];

export default function Roadmap2031() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-primary mb-6"
            data-testid="text-roadmap-title"
          >
            Vision 2031 Roadmap
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
            data-testid="text-roadmap-description"
          >
            Our long-term commitment to revolutionizing the future of work in South Africa and beyond.
          </motion.p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-primary/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12 relative">
            {milestones.map((m, i) => (
              <motion.div 
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                data-testid={`roadmap-phase-${m.year}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary -translate-x-1/2 z-10 hidden md:flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${m.status === 'live' ? 'bg-emerald-500' : m.status === 'building' ? 'bg-amber-500' : 'bg-primary/20'}`} />
                </div>

                {/* Content Card */}
                <div className="w-full md:w-1/2">
                  <Card className={`relative overflow-hidden border-2 ${m.status === 'live' ? 'border-emerald-500/20' : m.status === 'building' ? 'border-amber-500/20' : 'border-border'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${m.status === 'live' ? 'bg-emerald-500/10 text-emerald-600' : m.status === 'building' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                            <m.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl" data-testid={`text-phase-year-${m.year}`}>{m.year}: {m.phase}</CardTitle>
                            <CardDescription>{m.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={m.status === 'live' ? 'default' : m.status === 'building' ? 'secondary' : 'outline'} className="capitalize" data-testid={`badge-status-${m.year}`}>
                          {m.status === 'live' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : m.status === 'building' ? <Clock className="w-3 h-3 mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
                          {m.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span>{m.progress}%</span>
                        </div>
                        <Progress value={m.progress} className="h-2" data-testid={`progress-phase-${m.year}`} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <span data-testid={`text-feature-${m.year}-${index}`}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Spacer for MD and up */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        <section className="mt-24 p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Be Part of the Journey</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              We're building more than just a platform; we're building the future of economic opportunity in South Africa. Join us today and help shape Vision 2031.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-colors"
                data-testid="button-join-community"
              >
                Join the Community
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-bold rounded-full hover:bg-primary-foreground/20 transition-colors"
                data-testid="button-investor-info"
              >
                Investor Relations
              </motion.button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
