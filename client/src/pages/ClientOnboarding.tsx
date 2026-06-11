import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Briefcase, Target, Users, Zap, ArrowRight } from "lucide-react";

const STEPS = [
  { id: "role", title: "How do you want to hire?", icon: Briefcase },
  { id: "budget", title: "What's your budget range?", icon: Target },
  { id: "skills", title: "What skills do you need?", icon: Users },
  { id: "go", title: "You're ready to hire!", icon: Zap },
];

const HIRE_TYPES = [
  { id: "freelance", label: "One-time project", desc: "Hire a freelancer for a specific task" },
  { id: "part-time", label: "Part-time role", desc: "Ongoing work, 20-30 hours/week" },
  { id: "full-time", label: "Full-time role", desc: "Dedicated team member, 40+ hours/week" },
  { id: "retainer", label: "Monthly retainer", desc: "Fixed monthly fee for ongoing support" },
];

const BUDGETS = [
  { id: "under5k", label: "Under R5,000", desc: "Small tasks, quick fixes" },
  { id: "5k-15k", label: "R5,000 - R15,000", desc: "Standard projects" },
  { id: "15k-50k", label: "R15,000 - R50,000", desc: "Complex projects" },
  { id: "50k+", label: "R50,000+", desc: "Enterprise-grade work" },
];

const SKILL_OPTIONS = [
  "Web Development", "Mobile Apps", "UI/UX Design", "Logo Design",
  "SEO", "Social Media", "Content Writing", "Data Analysis",
  "Video Editing", "Photography", "Accounting", "Legal",
  "Plumbing", "Electrical", "Cleaning", "Landscaping",
];

export default function ClientOnboarding() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [, navigate] = useLocation();

  const progress = ((step) / (STEPS.length - 1)) * 100;

  const toggleSkill = (s: string) => {
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 5 ? [...prev, s] : prev);
  };

  const addCustom = () => {
    if (customSkill.trim() && skills.length < 5) {
      setSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleComplete = () => {
    const data = { role, budget, skills, completed: true };
    localStorage.setItem("client_onboarding", JSON.stringify(data));
    navigate("/post-job");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-lg">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Step {step + 1} of {STEPS.length}</span>
                <span className="text-xs font-bold text-emerald-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-slate-800" />
            </div>

            {/* Step content */}
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  {(() => {
                    const Icon = STEPS[step].icon;
                    return <Icon className="w-5 h-5 text-emerald-400" />;
                  })()}
                </div>
                <h1 className="text-xl font-bold text-white">{STEPS[step].title}</h1>
              </div>

              {step === 0 && (
                <div className="space-y-3">
                  {HIRE_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setRole(t.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        role === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-semibold text-white">{t.label}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  {BUDGETS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBudget(b.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        budget === b.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-semibold text-white">{b.label}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{b.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-sm text-slate-500 mb-3">Select up to 5 skills</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SKILL_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          skills.includes(s) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {skills.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addCustom()}
                      placeholder="Add custom skill..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <Button onClick={addCustom} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950">Add</Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Ready to Hire!</h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Based on your preferences, we'll show you the best freelancers.
                  </p>
                  <Button onClick={handleComplete} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                    <ArrowRight className="w-4 h-4 mr-2" /> Post Your First Job
                  </Button>
                </div>
              )}

              {/* Nav buttons */}
              {step < 3 && (
                <div className="flex gap-3 mt-6">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={() => setStep(s => s + 1)}
                    disabled={step === 0 ? !role : step === 1 ? !budget : step === 2 ? skills.length === 0 : false}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
