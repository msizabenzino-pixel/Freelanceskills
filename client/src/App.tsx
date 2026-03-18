import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CountryProvider, CountrySelectorDialog } from "@/components/CountrySelector";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { SupportChat } from "@/components/SupportChat";
import { CookieConsent } from "@/components/CookieConsent";
import { OnboardingCarousel } from "@/components/OnboardingCarousel";
import { OfflineScreen } from "@/components/OfflineScreen";
import { AuthGuard } from "@/components/AuthGuard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/Home"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const FindTalent = lazy(() => import("@/pages/FindTalent"));
const Messages = lazy(() => import("@/pages/Messages"));
const FreelancerProfile = lazy(() => import("@/pages/FreelancerProfile"));
const PostJob = lazy(() => import("@/pages/PostJob"));
const Services = lazy(() => import("@/pages/Services"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const HowToHire = lazy(() => import("@/pages/HowToHire"));
const HowToGetHired = lazy(() => import("@/pages/HowToGetHired"));
const Support = lazy(() => import("@/pages/Support"));
const ResolutionCenter = lazy(() => import("@/pages/ResolutionCenter"));
const Explore = lazy(() => import("@/pages/Explore"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const TaskAssistant = lazy(() => import("@/pages/TaskAssistant"));
const Impact = lazy(() => import("@/pages/Impact"));
const Academy = lazy(() => import("@/pages/Academy"));
const Enterprise = lazy(() => import("@/pages/Enterprise"));
const Referral = lazy(() => import("@/pages/Referral"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const FreelancerOnboarding = lazy(() => import("@/pages/FreelancerOnboarding"));
const CVUpload = lazy(() => import("@/pages/CVUpload"));
const Credentials = lazy(() => import("@/pages/Credentials"));
const PaymentsHub = lazy(() => import("@/pages/PaymentsHub"));
const Sustainability = lazy(() => import("@/pages/Sustainability"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const EnterpriseDashboard = lazy(() => import("@/pages/EnterpriseDashboard"));
const AISmartMatch = lazy(() => import("@/pages/AISmartMatch"));
const Roadmap2031 = lazy(() => import("@/pages/roadmap-2031"));
const JobBoard = lazy(() => import("@/pages/JobBoard"));
const OpportunityFinder = lazy(() => import("@/pages/OpportunityFinder"));
const ClaimBusiness = lazy(() => import("@/pages/ClaimBusiness"));
const InviteBusinesses = lazy(() => import("@/pages/InviteBusinesses"));
const FraudDashboard = lazy(() => import("@/pages/FraudDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AnalyticsDeepDive = lazy(() => import("@/pages/AnalyticsDeepDive"));
const MobileAdmin = lazy(() => import("@/pages/MobileAdmin"));
const FreelancerManagement = lazy(() => import("@/pages/FreelancerManagement"));
const ClientManagement = lazy(() => import("@/pages/ClientManagement"));
const PaymentsControl = lazy(() => import("@/pages/PaymentsControl"));
const AcademyAdmin = lazy(() => import("@/pages/AcademyAdmin"));
const SystemSettings = lazy(() => import("@/pages/SystemSettings"));
const GigMarketplace = lazy(() => import("@/pages/GigMarketplace"));
const ProposalManagement = lazy(() => import("@/pages/ProposalManagement"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/dashboard">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/pricing" component={Pricing} />
        <Route path="/freelancers" component={FindTalent} />
        <Route path="/profile/:id" component={FreelancerProfile} />
        <Route path="/messages">
          <AuthGuard>
            <Messages />
          </AuthGuard>
        </Route>
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
        <Route path="/cv-upload" component={CVUpload} />
        <Route path="/payments-hub" component={PaymentsHub} />
        <Route path="/credentials" component={Credentials} />
        <Route path="/sustainability" component={Sustainability} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/enterprise-dashboard">
          <AuthGuard>
            <EnterpriseDashboard />
          </AuthGuard>
        </Route>
        <Route path="/accessibility" component={Accessibility} />
        <Route path="/ai-match" component={AISmartMatch} />
        <Route path="/roadmap" component={Roadmap2031} />
        <Route path="/job-board" component={JobBoard} />
        <Route path="/opportunity-finder" component={OpportunityFinder} />
        <Route path="/claim-business" component={ClaimBusiness} />
        <Route path="/invite-businesses" component={InviteBusinesses} />
        <Route path="/admin/fraud">
          <AuthGuard>
            <FraudDashboard />
          </AuthGuard>
        </Route>
        <Route path="/admin/freelancers">
          <AuthGuard>
            <FreelancerManagement />
          </AuthGuard>
        </Route>
        <Route path="/admin/clients">
          <AuthGuard>
            <ClientManagement />
          </AuthGuard>
        </Route>
        <Route path="/admin/payments">
          <AuthGuard>
            <PaymentsControl />
          </AuthGuard>
        </Route>
        <Route path="/admin/academy">
          <AuthGuard>
            <AcademyAdmin />
          </AuthGuard>
        </Route>
        <Route path="/admin/settings">
          <AuthGuard>
            <SystemSettings />
          </AuthGuard>
        </Route>
        <Route path="/admin/gigs">
          <AuthGuard>
            <GigMarketplace />
          </AuthGuard>
        </Route>
        <Route path="/admin/proposals">
          <AuthGuard>
            <ProposalManagement />
          </AuthGuard>
        </Route>
        <Route path="/admin/mobile">
          <AuthGuard>
            <MobileAdmin />
          </AuthGuard>
        </Route>
        <Route path="/admin/analytics">
          <AuthGuard>
            <AnalyticsDeepDive />
          </AuthGuard>
        </Route>
        <Route path="/admin">
          <AuthGuard>
            <AdminDashboard />
          </AuthGuard>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CountryProvider>
          <TooltipProvider>
            <Toaster />
            <CountrySelectorDialog />
            <Router />
            <div id="floating-fab"><FloatingActionButton /></div>
            <div id="floating-support"><SupportChat /></div>
            <CookieConsent />
            <OnboardingCarousel />
            <OfflineScreen />
          </TooltipProvider>
        </CountryProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
