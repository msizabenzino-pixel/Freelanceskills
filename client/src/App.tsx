import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CountryProvider, CountrySelectorDialog } from "@/components/CountrySelector";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { SupportChat } from "@/components/SupportChat";
import { CookieConsent } from "@/components/CookieConsent";
import { OnboardingCarousel } from "@/components/OnboardingCarousel";
import { CommandPalette } from "@/components/CommandPalette";
import { OfflineScreen } from "@/components/OfflineScreen";
import { AuthGuard } from "@/components/AuthGuard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { TrustBar } from "@/components/TrustBar";
import { BottomNav } from "@/components/BottomNav";
import NotFound from "@/pages/not-found";
import GlobalAiAssistant from "@/components/GlobalAiAssistant";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/layout/AdminShell";

// ── Public Pages ──────────────────────────────────────────────────────────────
const Home = lazy(() => import("@/pages/Home"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const MyApplications = lazy(() => import("@/pages/MyApplications"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const FindTalent = lazy(() => import("@/pages/FindTalent"));
const Messages = lazy(() => import("@/pages/Messages"));
const FreelancerProfile = lazy(() => import("@/pages/FreelancerProfile"));
const PostJob = lazy(() => import("@/pages/PostJob"));
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
const Services = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
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
const AcademyCatalog = lazy(() => import("@/pages/AcademyCatalog"));
const AcademyCourseDetail = lazy(() => import("@/pages/AcademyCourseDetail"));
const AcademyAIHub = lazy(() => import("@/pages/AcademyAIHub"));
const CertVerify = lazy(() => import("@/pages/CertVerify"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const BlogCategory = lazy(() => import("@/pages/BlogCategory"));
const BlogSearch = lazy(() => import("@/pages/BlogSearch"));
const Enterprise = lazy(() => import("@/pages/Enterprise"));
const Referral = lazy(() => import("@/pages/Referral"));
const RewardsHub = lazy(() => import("@/pages/RewardsHub"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CVUpload = lazy(() => import("@/pages/CVUpload"));
const Credentials = lazy(() => import("@/pages/Credentials"));
const PaymentsHub = lazy(() => import("@/pages/PaymentsHub"));
const Sustainability = lazy(() => import("@/pages/Sustainability"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Vuma = lazy(() => import("@/pages/Vuma"));
const VumaLive = lazy(() => import("@/pages/VumaLive"));
const AISmartMatch = lazy(() => import("@/pages/AISmartMatch"));
const About = lazy(() => import("@/pages/About"));
const Login = lazy(() => import("@/pages/Login"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Careers = lazy(() => import("@/pages/Careers"));
const AdminOverview = lazy(() => import("@/pages/admin/Overview"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminFreelancers = lazy(() => import("@/pages/admin/Freelancers"));
const AdminClients = lazy(() => import("@/pages/admin/Clients"));
const AdminJobs = lazy(() => import("@/pages/admin/Jobs"));
const AdminJobApplications = lazy(() => import("@/pages/admin/JobApplications"));
const AdminServices = lazy(() => import("@/pages/admin/Services"));
const AdminTaskers = lazy(() => import("@/pages/admin/Taskers"));
const AdminBookings = lazy(() => import("@/pages/admin/Bookings"));
const AdminServiceRequests = lazy(() => import("@/pages/admin/ServiceRequests"));
const AdminPayments = lazy(() => import("@/pages/admin/Payments"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/Subscriptions"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminSupport = lazy(() => import("@/pages/admin/Support"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminModeration = lazy(() => import("@/pages/admin/Moderation"));
const AdminDisputes = lazy(() => import("@/pages/admin/Disputes"));
const AdminFraud = lazy(() => import("@/pages/admin/Fraud"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminPromotions = lazy(() => import("@/pages/admin/Promotions"));
const AdminCms = lazy(() => import("@/pages/admin/Cms"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminFeatureFlags = lazy(() => import("@/pages/admin/FeatureFlags"));
const AdminRoles = lazy(() => import("@/pages/admin/Roles"));
const AdminAdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const AdminSecurity = lazy(() => import("@/pages/admin/Security"));
const PaymentProtection = lazy(() => import("@/pages/PaymentProtection"));
const WhyUs = lazy(() => import("@/pages/WhyUs"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const GigDetail = lazy(() => import("@/pages/GigDetail"));
const Search = lazy(() => import("@/pages/Search"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const ClientOnboarding = lazy(() => import("@/pages/ClientOnboarding"));
const SellerLevel = lazy(() => import("@/pages/SellerLevel"));
const SEOLandingPage = lazy(() => import("@/pages/SEOLandingPage"));
const PromotedGigs = lazy(() => import("@/pages/PromotedGigs"));
const WhatsAppNotifications = lazy(() => import("@/pages/WhatsAppNotifications"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const AdminSystemSettings = lazy(() => import("@/pages/admin/SystemSettings"));
const AdminMonitoring = lazy(() => import("@/pages/admin/Monitoring"));
const AdminAiTools = lazy(() => import("@/pages/admin/AiTools"));
const AdminMissionControl = lazy(() => import("@/pages/admin/MissionControl"));
const ProfileCompletion = lazy(() => import("@/pages/ProfileCompletion"));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      {/* Animated logo-style ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-[6px] rounded-full bg-emerald-500/10 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
    </div>
  );
}

function AdminRouter() {
  return (
    <RequireAdmin>
      <AdminShell>
        <GlobalAiAssistant />
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {/* Admin Core (Firebase-first + hybrid adapters) */}
            <Route path="/admin" component={AdminOverview} />
            <Route path="/admin/overview" component={AdminOverview} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/freelancers" component={AdminFreelancers} />
            <Route path="/admin/clients" component={AdminClients} />
            <Route path="/admin/jobs" component={AdminJobs} />
            <Route path="/admin/job-applications" component={AdminJobApplications} />
            <Route path="/admin/services" component={AdminServices} />
            <Route path="/admin/taskers" component={AdminTaskers} />
            <Route path="/admin/bookings" component={AdminBookings} />
            <Route path="/admin/service-requests" component={AdminServiceRequests} />
            <Route path="/admin/payments" component={AdminPayments} />
            <Route path="/admin/subscriptions" component={AdminSubscriptions} />
            <Route path="/admin/messages" component={AdminMessages} />
            <Route path="/admin/support" component={AdminSupport} />
            <Route path="/admin/reports" component={AdminReports} />
            <Route path="/admin/moderation" component={AdminModeration} />
            <Route path="/admin/disputes" component={AdminDisputes} />
            <Route path="/admin/fraud" component={AdminFraud} />
            <Route path="/admin/notifications" component={AdminNotifications} />
            <Route path="/admin/categories" component={AdminCategories} />
            <Route path="/admin/promotions" component={AdminPromotions} />
            <Route path="/admin/cms" component={AdminCms} />
            <Route path="/admin/analytics" component={AdminAnalytics} />
            <Route path="/admin/feature-flags" component={AdminFeatureFlags} />
            <Route path="/admin/roles" component={AdminRoles} />
            <Route path="/admin/admin-users" component={AdminAdminUsers} />
            <Route path="/admin/audit-logs" component={AdminAuditLogs} />
            <Route path="/admin/security" component={AdminSecurity} />
            <Route path="/admin/system-settings" component={AdminSystemSettings} />
            <Route path="/admin/monitoring" component={AdminMonitoring} />
            <Route path="/admin/ai-tools" component={AdminAiTools} />
            <Route path="/admin/mission-control" component={AdminMissionControl} />

          <Route component={AdminOverview} />
          </Switch>
        </Suspense>
      </AdminShell>
    </RequireAdmin>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <div
      key={location}
      className="app-shell animate-in fade-in duration-200"
      style={{ willChange: "opacity" }}
    >
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/signup" component={Auth} />
        <Route path="/register" component={Auth} />
        <Route path="/login" component={Auth} />
        <Route path="/forgot-password" component={Auth} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetails} />
        <Route path="/my-applications">
          <AuthGuard>
            <MyApplications />
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/pricing" component={Pricing} />
        <Route path="/freelancers" component={FindTalent} />
        <Route path="/profile/:id" component={FreelancerProfile} />
        <Route path="/profile-completion">
          <AuthGuard>
            <ProfileCompletion />
          </AuthGuard>
        </Route>
        <Route path="/messages">
          <AuthGuard>
            <Messages />
          </AuthGuard>
        </Route>
        <Route path="/post-job" component={PostJob} />
        <Route path="/client-dashboard" component={ClientDashboard} />
        <Route path="/services" component={Services} />
        <Route path="/services/:id" component={ServiceDetail} />
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
        <Route path="/about" component={About} />
        <Route path="/careers" component={Careers} />
        <Route path="/academy" component={Academy} />
        <Route path="/academy/catalog" component={AcademyCatalog} />
        <Route path="/academy/ai-hub" component={AcademyAIHub} />
        <Route path="/academy/:id" component={AcademyCourseDetail} />
        <Route path="/cert/verify/:code" component={CertVerify} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/search" component={BlogSearch} />
        <Route path="/blog/category/:slug" component={BlogCategory} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/enterprise" component={Enterprise} />
        <Route path="/referral" component={Referral} />
        <Route path="/rewards" component={RewardsHub} />
        <Route path="/checkout">
          <AuthGuard>
            <Checkout />
          </AuthGuard>
        </Route>
        <Route path="/onboarding" component={CVUpload} />
        <Route path="/profile-builder" component={CVUpload} />
        <Route path="/edit-profile">
          <AuthGuard>
            <EditProfile />
          </AuthGuard>
        </Route>
        <Route path="/cv-upload" component={CVUpload} />
        <Route path="/payments-hub" component={PaymentsHub} />
        <Route path="/credentials" component={Credentials} />
        <Route path="/sustainability" component={Sustainability} />
        <Route path="/vuma" component={Vuma} />
        <Route path="/vuma-live" component={VumaLive} />
        <Route path="/ai-smart-match" component={AISmartMatch} />
        <Route path="/payment-protection" component={PaymentProtection} />
        <Route path="/why-us" component={WhyUs} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/:cat/:subcat" component={SearchResults} />
        <Route path="/categories/:rest*" component={CategoryDetail} />
        <Route path="/gig/:id" component={GigDetail} />
        <Route path="/search" component={Search} />
        <Route path="/orders">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/client-onboarding" component={ClientOnboarding} />
        <Route path="/seller-level">
          <AuthGuard>
            <SellerLevel />
          </AuthGuard>
        </Route>
        <Route path="/hire/:gigId/configure">
          <AuthGuard>
            <Checkout />
          </AuthGuard>
        </Route>
        <Route path="/hire/:skill/:city?" component={SEOLandingPage} />
        <Route path="/promote-gigs">
          <AuthGuard>
            <PromotedGigs />
          </AuthGuard>
        </Route>
        <Route path="/whatsapp-notifications">
          <AuthGuard>
            <WhatsAppNotifications />
          </AuthGuard>
        </Route>
        <Route path="/referral">
          <AuthGuard>
            <ReferralProgram />
          </AuthGuard>
        </Route>
        {/* Alias routes for SEO / nav */}
        <Route path="/help" component={Support} />
        <Route path="/contact" component={Support} />
        <Route path="/find-talent" component={FindTalent} />
        <Route path="/freelancer/:id">
          <Redirect to={"/profile/" + window.location.pathname.split("/").pop()} />
        </Route>
        <Route path="/freelancer-profile/:id">
          <Redirect to={"/profile/" + window.location.pathname.split("/").pop()} />
        </Route>
        <Route path="/gig-marketplace" component={Explore} />
        <Route path="/admin" component={AdminRouter} />
        <Route path="/admin/:rest*" component={AdminRouter} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
    </div>
  );
}

function App() {
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CountryProvider>
          <TooltipProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
            >
              Skip to main content
            </a>
            <TrustBar />
            <Toaster />
            <CountrySelectorDialog />
            <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
            <Router />
            <BottomNav />
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
