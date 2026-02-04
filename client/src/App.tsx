import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Jobs from "@/pages/Jobs";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import FindTalent from "@/pages/FindTalent";
import Messages from "@/pages/Messages";
import FreelancerProfile from "@/pages/FreelancerProfile";
import PostJob from "@/pages/PostJob";
import Services from "@/pages/Services";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;