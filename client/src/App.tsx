import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CountryProvider, CountrySelectorDialog } from "@/components/CountrySelector";
import Home from "@/pages/Home";
import Jobs from "@/pages/Jobs";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import FindTalent from "@/pages/FindTalent";
import Messages from "@/pages/Messages";
import FreelancerProfile from "@/pages/FreelancerProfile";
import PostJob from "@/pages/PostJob";
import Services from "@/pages/Services";
import HowItWorks from "@/pages/HowItWorks";
import HowToHire from "@/pages/HowToHire";
import HowToGetHired from "@/pages/HowToGetHired";
import Support from "@/pages/Support";
import ResolutionCenter from "@/pages/ResolutionCenter";
import Explore from "@/pages/Explore";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import TaskAssistant from "@/pages/TaskAssistant";
import Impact from "@/pages/Impact";
import Academy from "@/pages/Academy";
import Enterprise from "@/pages/Enterprise";
import Referral from "@/pages/Referral";
import Checkout from "@/pages/Checkout";
import FreelancerOnboarding from "@/pages/FreelancerOnboarding";
import { SupportChat } from "@/components/SupportChat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/freelancers" component={FindTalent} /> 
      <Route path="/profile/:id" component={FreelancerProfile} />
      <Route path="/messages" component={Messages} />
      <Route path="/post-job" component={PostJob} />
      <Route path="/services" component={Services} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/how-to-hire" component={HowToHire} />
      <Route path="/how-to-get-hired" component={HowToGetHired} />
      <Route path="/support" component={Support} />
      <Route path="/resolution-center" component={ResolutionCenter} />
      <Route path="/explore" component={Explore} />
      <Route path="/task-assistant" component={TaskAssistant} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/impact" component={Impact} />
      <Route path="/academy" component={Academy} />
      <Route path="/enterprise" component={Enterprise} />
      <Route path="/referral" component={Referral} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/onboarding" component={FreelancerOnboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CountryProvider>
        <TooltipProvider>
          <Toaster />
          <CountrySelectorDialog />
          <Router />
          <SupportChat />
        </TooltipProvider>
      </CountryProvider>
    </QueryClientProvider>
  );
}

export default App;