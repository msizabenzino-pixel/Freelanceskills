import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Camera, Globe, Sparkles, ShieldCheck, ThumbsUp, Plus, Upload,
  Briefcase, GraduationCap, Clock, MapPin, Eye, Save, CheckCircle2, WandSparkles,
  BadgeCheck, Zap, Edit3, CalendarDays, Link2, Users, Bell, Shield, Loader2
} from "lucide-react";

const SKILLS = ["React", "TypeScript", "UI Design", "Node.js", "SEO", "Copywriting"];

export default function ProfileBuilder() {
  const [openToWork, setOpenToWork] = useState(true);
  const [strength] = useState(74);
  const [headline, setHeadline] = useState("Full-Stack Developer | AI Specialist | Open to Freelance Gigs");
  const [bio, setBio] = useState("I build fast, reliable digital products for startups and SMEs across Africa.");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          userType: "freelancer",
          bio,
          title: headline,
          skills: SKILLS,
          hourlyRate: 0,
          location: "",
          isPro: false,
        }),
      });
      if (res.status === 401) {
        throw new Error("401:Session expired — please sign in again.");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        throw new Error(body?.message || "Could not publish profile. Please try again.");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile published!",
        description: "Your profile is now live and visible to employers.",
      });
      navigate("/dashboard");
    },
    onError: (err: Error) => {
      const is401 = err.message.startsWith("401:");
      toast({
        variant: "destructive",
        title: is401 ? "Session expired" : "Publish failed",
        description: is401 ? "Please sign in again and click Save & Publish." : err.message,
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Profile Builder
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Build Your Digital CV</h1>
              <p className="text-slate-400 mt-2">Skills-first. Verified. Designed to help clients trust you fast.</p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all" data-testid="button-preview-public-profile">
                <Eye className="w-4 h-4" /> Preview Public Profile
              </button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                data-testid="button-save-publish"
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…</>
                  : <><Save className="w-4 h-4 mr-2" /> Save & Publish</>}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6">
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <Avatar className="w-28 h-28 border-4 border-slate-900 ring-2 ring-emerald-500/30">
                      <AvatarImage src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200" />
                      <AvatarFallback className="bg-emerald-900 text-emerald-300 font-black text-xl">TM</AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg" data-testid="button-upload-photo">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open to Freelance Work</Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">ID Verified</Badge>
                      <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20">Top Rated</Badge>
                    </div>
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-lg font-semibold" data-testid="input-headline" />
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Cape Town, South Africa</span>
                      <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Remote + Hybrid</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Available in 24h</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div>
                        <div className="font-bold text-sm">Open to Freelance Gigs</div>
                        <div className="text-xs text-slate-500">Visible to clients searching right now</div>
                      </div>
                      <button onClick={() => setOpenToWork(!openToWork)} className={`w-14 h-8 rounded-full p-1 transition-all ${openToWork ? "bg-emerald-500" : "bg-slate-700"}`} data-testid="toggle-open-to-work">
                        <div className={`w-6 h-6 rounded-full bg-white transition-transform ${openToWork ? "translate-x-6" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">About / Bio</h2>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-ai-optimize-bio">
                    <WandSparkles className="w-4 h-4 mr-2" /> AI Suggestion
                  </Button>
                </div>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-32 bg-slate-950 border-slate-800 text-white" data-testid="textarea-bio" />
                <p className="text-xs text-slate-500">AI can help optimize your headline, summary, and keyword strength for discovery.</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Skills & Verification</h2>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-get-verified">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Get Verified
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill, i) => (
                    <div key={skill} className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-950 border border-slate-800 text-sm" data-testid={`chip-skill-${i}`}>
                      <span>{skill}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">{12 + i} endorsements</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="rounded-full border-dashed border-slate-700 text-slate-400" data-testid="button-add-skill">
                    <Plus className="w-4 h-4 mr-2" /> Add Skill
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2"><span>Profile strength</span><span className="text-emerald-400 font-bold">74%</span></div>
                    <Progress value={strength} className="h-2" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    {["Skills verified", "Portfolio ready", "Recommendations pending"].map((item, i) => (
                      <div key={item} className="p-3 rounded-xl bg-slate-950 border border-slate-800" data-testid={`status-${i}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-2" />
                        <div>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Portfolio / Work Samples</h2>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-upload-sample">
                    <Upload className="w-4 h-4 mr-2" /> Drag & Drop Upload
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "E-commerce redesign", feedback: "Client loved the speed + conversion lift", earnings: "R18,000 earned" },
                    { title: "SaaS landing page", feedback: "Clear communication and fast delivery", earnings: "R9,500 earned" },
                  ].map((item, i) => (
                    <div key={item.title} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2" data-testid={`portfolio-card-${i}`}>
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.feedback}</div>
                      <div className="text-emerald-400 text-xs font-bold">{item.earnings}</div>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <Link2 className="w-3 h-3" /> Live link
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">PWA Install</h2>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-400">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Bell className="w-4 h-4 text-emerald-400 mb-2" />
                    Real-time alerts for profile views and invitations
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Shield className="w-4 h-4 text-emerald-400 mb-2" />
                    Works offline with instant home-screen access
                  </div>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-install-app">
                  <Zap className="w-4 h-4 mr-2" /> Install the App
                </Button>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-black">Hourly Rate & Availability</h2>
                <div className="grid gap-3">
                  <Input defaultValue="R650/hr" className="bg-slate-950 border-slate-800 text-white text-lg font-bold" data-testid="input-hourly-rate" />
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-testid="button-set-rate">
                    Set My Rate
                  </Button>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-400">
                    <CalendarDays className="w-4 h-4 text-emerald-400 inline-block mr-2" /> Availability calendar teaser — next open slot tomorrow 09:00
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-black">Experience & Education</h2>
                <div className="space-y-3">
                  {["Freelance Developer · 2021–Now", "Google UX Certificate", "AWS Cloud Practitioner"].map((item, i) => (
                    <div key={item} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between" data-testid={`experience-item-${i}`}>
                      <div className="text-sm">{item}</div>
                      <Edit3 className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-slate-700 text-slate-400" data-testid="button-add-experience">
                    <Plus className="w-4 h-4 mr-2" /> Add Experience
                  </Button>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-black">Endorsements & Recommendations</h2>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-bold">48 endorsements</div>
                    <div className="text-xs text-slate-500">From clients and peers</div>
                  </div>
                  <ThumbsUp className="w-5 h-5 text-blue-400" />
                </div>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-request-endorsements">
                  <Users className="w-4 h-4 mr-2" /> Request Recommendations
                </Button>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-black">Preview & Publish</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><BadgeCheck className="w-4 h-4 text-emerald-400 mb-2" /> Public profile ready</div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><Zap className="w-4 h-4 text-emerald-400 mb-2" /> Discovery boost active</div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40" data-testid="button-preview-link">
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </button>
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    data-testid="button-publish-profile"
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending}
                  >
                    {publishMutation.isPending
                      ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Publishing…</>
                      : "Save & Publish"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
