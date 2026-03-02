import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AITaskAssistant } from "@/components/AITaskAssistant";
import { Sparkles, Zap, Target, Shield } from "lucide-react";

export default function TaskAssistant() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main id="main-content">
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6" data-testid="badge-ai-task-assistant">
              <Sparkles className="h-4 w-4" />
              AI-Powered Recommendations
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-task-assistant-title">
              Find the Perfect Professional
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-task-assistant-description">
              Describe your task and our AI will recommend the best service categories, 
              budget estimates, and tips for hiring the right freelancer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border" data-testid="card-feature-instant">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-feature-instant-title">Instant Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get recommendations in seconds, not hours of searching
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border" data-testid="card-feature-accurate">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-feature-accurate-title">Accurate Matching</h3>
                <p className="text-sm text-muted-foreground">
                  AI matches your needs to the right service categories
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border" data-testid="card-feature-budget">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-feature-budget-title">Fair Budget Estimates</h3>
                <p className="text-sm text-muted-foreground">
                  Based on real South African market rates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <AITaskAssistant />
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
