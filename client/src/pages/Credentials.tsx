import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle2,
  Link2,
  Award,
  Users,
  Star,
  ArrowRight,
  ExternalLink,
  Copy,
  Share2,
  Fingerprint,
  Lock,
  Globe,
  Sparkles,
  BadgeCheck,
  Layers,
  Hash,
  Clock,
  Zap,
} from "lucide-react";

const verificationTiers = [
  {
    level: 1,
    title: "Self-Declared",
    description: "Skills added by the freelancer to their profile. No external verification.",
    icon: Users,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    features: ["Add any skill to profile", "No verification required", "Visible to clients with tier label"],
  },
  {
    level: 2,
    title: "Peer-Endorsed",
    description: "Skills endorsed by other verified professionals on the platform.",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: ["3+ peer endorsements required", "Endorsers must be verified", "Weighted by endorser reputation"],
  },
  {
    level: 3,
    title: "Platform-Tested",
    description: "Skills validated through FreelanceSkills' AI-proctored assessments.",
    icon: BadgeCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: ["AI-proctored skill test", "Practical + theory assessment", "Score-based grading system"],
  },
  {
    level: 4,
    title: "Blockchain-Certified",
    description: "Immutable, tamper-proof credential minted on-chain. The gold standard.",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    features: ["On-chain NFT credential", "Permanently verifiable", "Globally portable & shareable"],
  },
];

const walletCredentials = [
  {
    id: "cred-001",
    title: "Full-Stack Web Development",
    issuer: "FreelanceSkills Academy",
    date: "2031-03-15",
    tier: "Blockchain-Certified",
    tierColor: "bg-green-500/10 text-green-600",
    hash: "0x7f4a...3b2c",
    chain: "Polygon",
    verified: true,
  },
  {
    id: "cred-002",
    title: "Advanced Plumbing Systems",
    issuer: "SAQA / FreelanceSkills",
    date: "2031-01-22",
    tier: "Blockchain-Certified",
    tierColor: "bg-green-500/10 text-green-600",
    hash: "0x9e2d...8f1a",
    chain: "Polygon",
    verified: true,
  },
  {
    id: "cred-003",
    title: "AI-Powered Project Management",
    issuer: "Google AI x FreelanceSkills",
    date: "2030-11-08",
    tier: "Platform-Tested",
    tierColor: "bg-purple-500/10 text-purple-600",
    hash: "0x3c8b...6d4e",
    chain: "Ethereum",
    verified: true,
  },
  {
    id: "cred-004",
    title: "Electrical Installation & Safety",
    issuer: "TVET College Partnership",
    date: "2030-09-14",
    tier: "Blockchain-Certified",
    tierColor: "bg-green-500/10 text-green-600",
    hash: "0x1a5f...9c7b",
    chain: "Polygon",
    verified: true,
  },
  {
    id: "cred-005",
    title: "Client Communication",
    issuer: "FreelanceSkills",
    date: "2030-07-20",
    tier: "Peer-Endorsed",
    tierColor: "bg-blue-500/10 text-blue-600",
    hash: null,
    chain: null,
    verified: false,
  },
];

const partners = [
  { name: "Ethereum", icon: Link2 },
  { name: "Polygon", icon: Layers },
  { name: "SAQA", icon: Award },
  { name: "Google AI", icon: Sparkles },
  { name: "Microsoft", icon: Globe },
];

const verificationChain = [
  { step: "Skill Assessment Completed", hash: "0x7f4a8c...3b2c9d", time: "2031-03-15 09:23 UTC", status: "confirmed" },
  { step: "AI Proctoring Verified", hash: "0x2e9b1f...7a4d6e", time: "2031-03-15 09:24 UTC", status: "confirmed" },
  { step: "Score Validated (94/100)", hash: "0x5d3c8a...1f9e2b", time: "2031-03-15 09:25 UTC", status: "confirmed" },
  { step: "Credential Minted on Polygon", hash: "0x8b6f2d...4c7a3e", time: "2031-03-15 09:26 UTC", status: "confirmed" },
  { step: "SAQA Registry Updated", hash: "0x4a1e9c...6b8d5f", time: "2031-03-15 09:27 UTC", status: "confirmed" },
];

export default function Credentials() {
  const [selectedCredential, setSelectedCredential] = useState(walletCredentials[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main id="main-content" role="main">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20" data-testid="badge-credentials-hero">
              <Shield className="w-3 h-3 mr-1" /> Blockchain-Verified Credentials
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight" data-testid="text-credentials-title">
              Your Digital Credential Wallet
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed" data-testid="text-credentials-subtitle">
              Tamper-proof, blockchain-verified skills and certifications. Own your credentials, share them anywhere, and prove your expertise instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-bold text-lg px-8 shadow-lg gap-2" data-testid="button-mint-credential">
                <Fingerprint className="w-5 h-5" />
                Mint a Credential
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2" data-testid="button-verify-credential">
                <CheckCircle2 className="w-5 h-5" />
                Verify a Credential
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/70 text-sm">
              <div className="flex items-center gap-2" data-testid="stat-credentials-minted">
                <Shield className="w-4 h-4" /> 24,500+ Credentials Minted
              </div>
              <div className="flex items-center gap-2" data-testid="stat-verifications">
                <CheckCircle2 className="w-4 h-4" /> 180,000+ Verifications
              </div>
              <div className="flex items-center gap-2" data-testid="stat-partners">
                <Globe className="w-4 h-4" /> 12 Partner Institutions
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-verification-tiers">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-tiers-heading">Verification Tiers</h2>
              <p className="text-muted-foreground text-lg">
                From self-declared skills to immutable blockchain certification — build trust at every level.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {verificationTiers.map((tier) => (
                <Card
                  key={tier.level}
                  className={`border-2 ${tier.borderColor} hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  data-testid={`card-tier-${tier.level}`}
                >
                  <div className={`h-1.5 ${tier.bgColor}`} />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${tier.bgColor} flex items-center justify-center`}>
                        <tier.icon className={`w-6 h-6 ${tier.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">Level {tier.level}</div>
                        <h3 className="font-bold text-foreground">{tier.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{tier.description}</p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 ${tier.color} shrink-0 mt-0.5`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center mt-10 gap-2">
              {verificationTiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                    <tier.icon className={`w-4 h-4 ${tier.color}`} />
                  </div>
                  {i < verificationTiers.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-credential-wallet">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-wallet-heading">Credential Wallet</h2>
              <p className="text-muted-foreground text-lg">
                Your verified certificates, badges, and skill validations — all in one place.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
              <div className="lg:col-span-2 space-y-3">
                {walletCredentials.map((cred) => (
                  <Card
                    key={cred.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCredential.id === cred.id ? "ring-2 ring-primary shadow-md" : ""
                    }`}
                    onClick={() => setSelectedCredential(cred)}
                    data-testid={`card-credential-${cred.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${cred.verified ? "bg-green-500/10" : "bg-blue-500/10"} flex items-center justify-center shrink-0`}>
                          {cred.verified ? (
                            <Shield className="w-5 h-5 text-green-500" />
                          ) : (
                            <Star className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm truncate" data-testid={`text-credential-title-${cred.id}`}>
                            {cred.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{cred.issuer}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${cred.tierColor}`} data-testid={`badge-credential-tier-${cred.id}`}>
                              {cred.tier}
                            </Badge>
                            {cred.chain && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Link2 className="w-3 h-3" /> {cred.chain}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-3">
                <Card className="border-2 border-primary/20 shadow-lg" data-testid="card-credential-detail">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl ${selectedCredential.verified ? "bg-green-500/10" : "bg-blue-500/10"} flex items-center justify-center`}>
                          {selectedCredential.verified ? (
                            <Shield className="w-7 h-7 text-green-500" />
                          ) : (
                            <Star className="w-7 h-7 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground" data-testid="text-detail-title">{selectedCredential.title}</h3>
                          <p className="text-sm text-muted-foreground">{selectedCredential.issuer}</p>
                        </div>
                      </div>
                      {selectedCredential.verified && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm font-semibold" data-testid="badge-verified-status">
                          <CheckCircle2 className="w-4 h-4" /> Verified
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">ISSUED</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {selectedCredential.date}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">VERIFICATION TIER</p>
                        <Badge className={`text-xs ${selectedCredential.tierColor}`}>{selectedCredential.tier}</Badge>
                      </div>
                      {selectedCredential.hash && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">TX HASH</p>
                          <p className="text-sm font-mono text-foreground flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5" /> {selectedCredential.hash}
                            <button
                              onClick={() => handleCopy(selectedCredential.hash || "")}
                              className="ml-1 text-muted-foreground hover:text-primary transition-colors"
                              data-testid="button-copy-hash"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </p>
                        </div>
                      )}
                      {selectedCredential.chain && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">BLOCKCHAIN</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5" /> {selectedCredential.chain}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" data-testid="button-share-credential">
                        <Share2 className="w-4 h-4" /> Share Credential
                      </Button>
                      <Button variant="outline" className="gap-2" data-testid="button-view-on-chain">
                        <ExternalLink className="w-4 h-4" /> View On-Chain
                      </Button>
                    </div>

                    {copied && (
                      <p className="text-xs text-green-600 text-center mt-3" data-testid="text-copied-confirmation">Hash copied to clipboard!</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-primary text-white relative overflow-hidden" data-testid="section-verification-chain">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Lock className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-chain-heading">Blockchain Verification Chain</h2>
              <p className="text-white/70 text-lg">
                Every credential follows an immutable verification path — from assessment to on-chain minting.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-0">
              {verificationChain.map((block, i) => (
                <div key={i} className="flex gap-4 items-start" data-testid={`block-chain-step-${i}`}>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    {i < verificationChain.length - 1 && (
                      <div className="w-0.5 h-16 bg-accent/30" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h4 className="font-bold text-white text-sm mb-1">{block.step}</h4>
                    <p className="text-xs text-white/50 font-mono flex items-center gap-1.5 mb-1">
                      <Hash className="w-3 h-3" /> {block.hash}
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {block.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted/30" data-testid="section-mint-credential">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Fingerprint className="w-4 h-4" /> Mint Your Credential
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight" data-testid="text-mint-heading">
                  Turn your skills into <span className="text-accent">permanent, verifiable</span> assets
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Complete a skill assessment, pass AI-proctored verification, and mint your credential as an NFT on the blockchain. It's yours forever — no institution can revoke it.
                </p>
                <ul className="space-y-3">
                  {[
                    "Complete skill assessment (online or in-person)",
                    "AI-proctored identity & skill verification",
                    "Credential minted on Polygon (low gas fees)",
                    "Share via link, QR code, or embed on LinkedIn",
                    "SAQA-aligned for South African qualifications",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="gap-2 font-bold" data-testid="button-start-minting">
                  <Zap className="w-5 h-5" /> Start Minting Process
                </Button>
              </div>

              <Card className="border-2 border-primary/10 shadow-xl" data-testid="card-mint-preview">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20">
                      <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Full-Stack Web Development</h3>
                      <p className="text-sm text-muted-foreground">FreelanceSkills Academy</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-bold text-foreground">94/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network</span>
                        <span className="font-bold text-foreground">Polygon</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gas Fee</span>
                        <span className="font-bold text-green-600">~R2.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-bold text-accent">Ready to Mint</span>
                      </div>
                    </div>
                    <Button className="w-full gap-2 font-bold" data-testid="button-confirm-mint">
                      <Fingerprint className="w-4 h-4" /> Confirm & Mint NFT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30 border-y border-border" data-testid="section-partners">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2" data-testid="text-partners-heading">Integration Partners</h2>
              <p className="text-muted-foreground">Trusted blockchain and institutional partners</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {partners.map((partner, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`partner-${i}`}>
                  <partner.icon className="w-6 h-6" />
                  <span className="text-xl font-bold font-display">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" data-testid="section-cta">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6" data-testid="text-cta-title">
                Own Your Professional Identity
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Your skills are yours. Mint them on-chain, share them globally, and let the blockchain speak for your expertise. No middlemen, no gatekeepers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="font-bold text-lg px-10 shadow-lg gap-2" data-testid="button-cta-mint">
                  <Fingerprint className="w-5 h-5" />
                  Mint Your First Credential
                </Button>
                <Button size="lg" variant="outline" className="font-semibold gap-2" data-testid="button-cta-explore">
                  <ArrowRight className="w-4 h-4" />
                  Explore Verified Talent
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
