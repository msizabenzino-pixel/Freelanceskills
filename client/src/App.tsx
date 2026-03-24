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
import AdminLayout from "@/components/AdminLayout";
import GlobalAiAssistant from "@/components/GlobalAiAssistant";

// ── Public Pages ──────────────────────────────────────────────────────────────
const Home = lazy(() => import("@/pages/Home"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const FindTalent = lazy(() => import("@/pages/FindTalent"));
const Messages = lazy(() => import("@/pages/Messages"));
const FreelancerProfile = lazy(() => import("@/pages/FreelancerProfile"));
const PostJob = lazy(() => import("@/pages/PostJob"));
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
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
const AcademyCatalog = lazy(() => import("@/pages/AcademyCatalog"));
const AcademyCourseDetail = lazy(() => import("@/pages/AcademyCourseDetail"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const BlogCategory = lazy(() => import("@/pages/BlogCategory"));
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
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Vuma = lazy(() => import("@/pages/Vuma"));
const VumaLive = lazy(() => import("@/pages/VumaLive"));
const About = lazy(() => import("@/pages/About"));

// ── Admin S1–S50 ──────────────────────────────────────────────────────────────
const FraudDashboard = lazy(() => import("@/pages/FraudDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AnalyticsDeepDive = lazy(() => import("@/pages/AnalyticsDeepDive"));
const AnalyticsReporting = lazy(() => import("@/pages/AnalyticsReporting"));
const MobileAdmin = lazy(() => import("@/pages/MobileAdmin"));
const MarketplaceHealth = lazy(() => import("@/pages/MarketplaceHealth"));
const ReferralAffiliate = lazy(() => import("@/pages/ReferralAffiliate"));
const TalentAcquisition = lazy(() => import("@/pages/TalentAcquisition"));
const InvoiceTax = lazy(() => import("@/pages/InvoiceTax"));
const Territories = lazy(() => import("@/pages/Territories"));
const AgencyPortal = lazy(() => import("@/pages/AgencyPortal"));
const Automation = lazy(() => import("@/pages/Automation"));
const CustomerSuccess = lazy(() => import("@/pages/CustomerSuccess"));
const ContractSLA = lazy(() => import("@/pages/ContractSLA"));
const ResourcePlanner = lazy(() => import("@/pages/ResourcePlanner"));
const EscrowIntel = lazy(() => import("@/pages/EscrowIntel"));
const Monetization = lazy(() => import("@/pages/Monetization"));
const VendorManagement = lazy(() => import("@/pages/VendorManagement"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const DeveloperPortal = lazy(() => import("@/pages/DeveloperPortal"));
const GlobalExpansion = lazy(() => import("@/pages/GlobalExpansion"));
const FreelancerManagement = lazy(() => import("@/pages/FreelancerManagement"));
const ClientManagement = lazy(() => import("@/pages/ClientManagement"));
const PaymentsControl = lazy(() => import("@/pages/PaymentsControl"));
const AcademyAdmin = lazy(() => import("@/pages/AcademyAdmin"));
const SystemSettings = lazy(() => import("@/pages/SystemSettings"));
const GigMarketplace = lazy(() => import("@/pages/GigMarketplace"));
const ProposalManagement = lazy(() => import("@/pages/ProposalManagement"));
const OrderManagement = lazy(() => import("@/pages/OrderManagement"));
const FinanceDepartment = lazy(() => import("@/pages/FinanceDepartment"));
const DisputeManagement = lazy(() => import("@/pages/DisputeManagement"));
const SupportTicketSystem = lazy(() => import("@/pages/SupportTicketSystem"));
const ReportAbuseManagement = lazy(() => import("@/pages/ReportAbuseManagement"));
const NotificationsManagement = lazy(() => import("@/pages/NotificationsManagement"));
const CategorySkillManagement = lazy(() => import("@/pages/CategorySkillManagement"));
const ContentModeration = lazy(() => import("@/pages/ContentModeration"));
const PromotionManagement = lazy(() => import("@/pages/PromotionManagement"));
const MarketingSystem = lazy(() => import("@/pages/MarketingSystem"));
const SubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));
const SecurityTrustManagement = lazy(() => import("@/pages/SecurityTrustManagement"));
const AuditLogs = lazy(() => import("@/pages/AuditLogs"));
const CmsManagement = lazy(() => import("@/pages/CmsManagement"));
const FeatureFlagsManagement = lazy(() => import("@/pages/FeatureFlagsManagement"));
const RolePermissionSystem = lazy(() => import("@/pages/RolePermissionSystem"));
const SupportTeamDashboard = lazy(() => import("@/pages/SupportTeamDashboard"));
const RealTimeMonitoring = lazy(() => import("@/pages/RealTimeMonitoring"));
const AiBrainDepartment = lazy(() => import("@/pages/AiBrainDepartment"));
const SystemPerformance = lazy(() => import("@/pages/SystemPerformance"));
const DataCompliance = lazy(() => import("@/pages/DataCompliance"));
const MissionControl = lazy(() => import("@/pages/MissionControl"));

// ── Admin S51–S100 ────────────────────────────────────────────────────────────
const SearchDiscovery = lazy(() => import("@/pages/SearchDiscovery"));
const PaymentIntelligence = lazy(() => import("@/pages/PaymentIntelligence"));
const EmailCampaigns = lazy(() => import("@/pages/EmailCampaigns"));
const ReviewsSocialProof = lazy(() => import("@/pages/ReviewsSocialProof"));
const BackgroundChecks = lazy(() => import("@/pages/BackgroundChecks"));
const SkillAssessments = lazy(() => import("@/pages/SkillAssessments"));
const ProjectHub = lazy(() => import("@/pages/ProjectHub"));
const TimeTracking = lazy(() => import("@/pages/TimeTracking"));
const MarketInsights = lazy(() => import("@/pages/MarketInsights"));
const PartnerHub = lazy(() => import("@/pages/PartnerHub"));
const DataExport = lazy(() => import("@/pages/DataExport"));
const TrustSafety = lazy(() => import("@/pages/TrustSafety"));
const FreelancerWellness = lazy(() => import("@/pages/FreelancerWellness"));
const DEIDashboard = lazy(() => import("@/pages/DEIDashboard"));
const LearningPathways = lazy(() => import("@/pages/LearningPathways"));
const EnterprisePortal = lazy(() => import("@/pages/EnterprisePortal"));
const B2BProcurement = lazy(() => import("@/pages/B2BProcurement"));
const RiskInsurance = lazy(() => import("@/pages/RiskInsurance"));
const PayrollBenefits = lazy(() => import("@/pages/PayrollBenefits"));
const CarbonESG = lazy(() => import("@/pages/CarbonESG"));
const PredictiveAnalytics = lazy(() => import("@/pages/PredictiveAnalytics"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const CommunityForums = lazy(() => import("@/pages/CommunityForums"));
const EventManagement = lazy(() => import("@/pages/EventManagement"));
const PressMedia = lazy(() => import("@/pages/PressMedia"));
const InvestorRelations = lazy(() => import("@/pages/InvestorRelations"));
const LegalCompliance = lazy(() => import("@/pages/LegalCompliance"));
const CrisisManagement = lazy(() => import("@/pages/CrisisManagement"));
const PlatformHealthScore = lazy(() => import("@/pages/PlatformHealthScore"));
const RevenueShare = lazy(() => import("@/pages/RevenueShare"));
const BlockchainVerification = lazy(() => import("@/pages/BlockchainVerification"));
const ExecCommandCenter = lazy(() => import("@/pages/ExecCommandCenter"));
const AdvancedReporting = lazy(() => import("@/pages/AdvancedReporting"));
const MarketSimulation = lazy(() => import("@/pages/MarketSimulation"));
const PlatformRoadmap = lazy(() => import("@/pages/PlatformRoadmap"));
const CompetitiveIntel = lazy(() => import("@/pages/CompetitiveIntel"));
const MicroJobExchange = lazy(() => import("@/pages/MicroJobExchange"));
const WhiteGloveConcierge = lazy(() => import("@/pages/WhiteGloveConcierge"));
const MultiCurrency = lazy(() => import("@/pages/MultiCurrency"));
const FraudPrediction = lazy(() => import("@/pages/FraudPrediction"));
const PerformanceBenchmarking = lazy(() => import("@/pages/PerformanceBenchmarking"));
const AccessibilityWCAG = lazy(() => import("@/pages/AccessibilityWCAG"));
const TalentAlerts = lazy(() => import("@/pages/TalentAlerts"));
const SmartNotifications = lazy(() => import("@/pages/SmartNotifications"));
const PlatformMigration = lazy(() => import("@/pages/PlatformMigration"));
const RevenueOptimisationAI = lazy(() => import("@/pages/RevenueOptimisationAI"));
const OpsIntelligence = lazy(() => import("@/pages/OpsIntelligence"));
const GeoHotSpots = lazy(() => import("@/pages/GeoHotSpots"));
const AmbassadorProgram = lazy(() => import("@/pages/AmbassadorProgram"));
const EliteClub = lazy(() => import("@/pages/EliteClub"));
const VumaAdmin = lazy(() => import("@/pages/VumaAdmin"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function AdminRouter() {
  return (
    <AdminLayout>
      <GlobalAiAssistant />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* S1–S50 */}
          <Route path="/admin/mission-control" component={MissionControl} />
          <Route path="/admin/fraud"><AuthGuard><FraudDashboard /></AuthGuard></Route>
          <Route path="/admin/freelancers"><AuthGuard><FreelancerManagement /></AuthGuard></Route>
          <Route path="/admin/clients"><AuthGuard><ClientManagement /></AuthGuard></Route>
          <Route path="/admin/payments"><AuthGuard><PaymentsControl /></AuthGuard></Route>
          <Route path="/admin/academy"><AuthGuard><AcademyAdmin /></AuthGuard></Route>
          <Route path="/admin/settings"><AuthGuard><SystemSettings /></AuthGuard></Route>
          <Route path="/admin/gigs"><AuthGuard><GigMarketplace /></AuthGuard></Route>
          <Route path="/admin/proposals"><AuthGuard><ProposalManagement /></AuthGuard></Route>
          <Route path="/admin/orders"><AuthGuard><OrderManagement /></AuthGuard></Route>
          <Route path="/admin/finance"><AuthGuard><FinanceDepartment /></AuthGuard></Route>
          <Route path="/admin/disputes"><AuthGuard><DisputeManagement /></AuthGuard></Route>
          <Route path="/admin/support"><AuthGuard><SupportTicketSystem /></AuthGuard></Route>
          <Route path="/admin/reports"><AuthGuard><ReportAbuseManagement /></AuthGuard></Route>
          <Route path="/admin/notifications"><AuthGuard><NotificationsManagement /></AuthGuard></Route>
          <Route path="/admin/categories"><AuthGuard><CategorySkillManagement /></AuthGuard></Route>
          <Route path="/admin/moderation"><AuthGuard><ContentModeration /></AuthGuard></Route>
          <Route path="/admin/promotions"><AuthGuard><PromotionManagement /></AuthGuard></Route>
          <Route path="/admin/marketing"><AuthGuard><MarketingSystem /></AuthGuard></Route>
          <Route path="/admin/subscriptions"><AuthGuard><SubscriptionManagement /></AuthGuard></Route>
          <Route path="/admin/security"><AuthGuard><SecurityTrustManagement /></AuthGuard></Route>
          <Route path="/admin/audit-logs"><AuthGuard><AuditLogs /></AuthGuard></Route>
          <Route path="/admin/cms"><AuthGuard><CmsManagement /></AuthGuard></Route>
          <Route path="/admin/roles"><RolePermissionSystem /></Route>
          <Route path="/admin/support-team"><SupportTeamDashboard /></Route>
          <Route path="/admin/monitoring"><RealTimeMonitoring /></Route>
          <Route path="/admin/ai-brain"><AiBrainDepartment /></Route>
          <Route path="/admin/performance"><SystemPerformance /></Route>
          <Route path="/admin/compliance"><DataCompliance /></Route>
          <Route path="/admin/feature-flags"><AuthGuard><FeatureFlagsManagement /></AuthGuard></Route>
          <Route path="/admin/mobile"><AuthGuard><MobileAdmin /></AuthGuard></Route>
          <Route path="/admin/marketplace-health"><AuthGuard><MarketplaceHealth /></AuthGuard></Route>
          <Route path="/admin/referrals"><AuthGuard><ReferralAffiliate /></AuthGuard></Route>
          <Route path="/admin/talent"><AuthGuard><TalentAcquisition /></AuthGuard></Route>
          <Route path="/admin/invoices"><AuthGuard><InvoiceTax /></AuthGuard></Route>
          <Route path="/admin/territories"><AuthGuard><Territories /></AuthGuard></Route>
          <Route path="/admin/agency"><AuthGuard><AgencyPortal /></AuthGuard></Route>
          <Route path="/admin/automation"><AuthGuard><Automation /></AuthGuard></Route>
          <Route path="/admin/customer-success"><AuthGuard><CustomerSuccess /></AuthGuard></Route>
          <Route path="/admin/contracts"><AuthGuard><ContractSLA /></AuthGuard></Route>
          <Route path="/admin/resources"><AuthGuard><ResourcePlanner /></AuthGuard></Route>
          <Route path="/admin/escrow-intel"><AuthGuard><EscrowIntel /></AuthGuard></Route>
          <Route path="/admin/monetization"><AuthGuard><Monetization /></AuthGuard></Route>
          <Route path="/admin/vendors"><AuthGuard><VendorManagement /></AuthGuard></Route>
          <Route path="/admin/gamification"><AuthGuard><Gamification /></AuthGuard></Route>
          <Route path="/admin/developer"><AuthGuard><DeveloperPortal /></AuthGuard></Route>
          <Route path="/admin/expansion"><AuthGuard><GlobalExpansion /></AuthGuard></Route>
          <Route path="/admin/analytics/deep-dive"><AuthGuard><AnalyticsDeepDive /></AuthGuard></Route>
          <Route path="/admin/analytics"><AuthGuard><AnalyticsReporting /></AuthGuard></Route>

          {/* S51–S62: AI & Discovery */}
          <Route path="/admin/search-ai"><AuthGuard><SearchDiscovery /></AuthGuard></Route>
          <Route path="/admin/payment-intel"><AuthGuard><PaymentIntelligence /></AuthGuard></Route>
          <Route path="/admin/email-campaigns"><AuthGuard><EmailCampaigns /></AuthGuard></Route>
          <Route path="/admin/reviews"><AuthGuard><ReviewsSocialProof /></AuthGuard></Route>
          <Route path="/admin/background-checks"><AuthGuard><BackgroundChecks /></AuthGuard></Route>
          <Route path="/admin/assessments"><AuthGuard><SkillAssessments /></AuthGuard></Route>
          <Route path="/admin/project-hub"><AuthGuard><ProjectHub /></AuthGuard></Route>
          <Route path="/admin/timesheets"><AuthGuard><TimeTracking /></AuthGuard></Route>
          <Route path="/admin/market-insights"><AuthGuard><MarketInsights /></AuthGuard></Route>
          <Route path="/admin/partner-hub"><AuthGuard><PartnerHub /></AuthGuard></Route>
          <Route path="/admin/data-export"><AuthGuard><DataExport /></AuthGuard></Route>
          <Route path="/admin/trust-safety"><AuthGuard><TrustSafety /></AuthGuard></Route>

          {/* S63–S80: People & Strategy */}
          <Route path="/admin/wellness"><AuthGuard><FreelancerWellness /></AuthGuard></Route>
          <Route path="/admin/dei"><AuthGuard><DEIDashboard /></AuthGuard></Route>
          <Route path="/admin/learning"><AuthGuard><LearningPathways /></AuthGuard></Route>
          <Route path="/admin/enterprise-portal"><AuthGuard><EnterprisePortal /></AuthGuard></Route>
          <Route path="/admin/procurement"><AuthGuard><B2BProcurement /></AuthGuard></Route>
          <Route path="/admin/risk-insurance"><AuthGuard><RiskInsurance /></AuthGuard></Route>
          <Route path="/admin/payroll"><AuthGuard><PayrollBenefits /></AuthGuard></Route>
          <Route path="/admin/esg"><AuthGuard><CarbonESG /></AuthGuard></Route>
          <Route path="/admin/predictive"><AuthGuard><PredictiveAnalytics /></AuthGuard></Route>
          <Route path="/admin/knowledge-base"><AuthGuard><KnowledgeBase /></AuthGuard></Route>
          <Route path="/admin/community"><AuthGuard><CommunityForums /></AuthGuard></Route>
          <Route path="/admin/events"><AuthGuard><EventManagement /></AuthGuard></Route>
          <Route path="/admin/press"><AuthGuard><PressMedia /></AuthGuard></Route>
          <Route path="/admin/investor-relations"><AuthGuard><InvestorRelations /></AuthGuard></Route>
          <Route path="/admin/legal-compliance"><AuthGuard><LegalCompliance /></AuthGuard></Route>
          <Route path="/admin/crisis"><AuthGuard><CrisisManagement /></AuthGuard></Route>
          <Route path="/admin/platform-health"><AuthGuard><PlatformHealthScore /></AuthGuard></Route>
          <Route path="/admin/revenue-share"><AuthGuard><RevenueShare /></AuthGuard></Route>

          {/* S81–S100: Elite & Innovation */}
          <Route path="/admin/blockchain"><AuthGuard><BlockchainVerification /></AuthGuard></Route>
          <Route path="/admin/exec-command"><AuthGuard><ExecCommandCenter /></AuthGuard></Route>
          <Route path="/admin/reporting"><AuthGuard><AdvancedReporting /></AuthGuard></Route>
          <Route path="/admin/simulation"><AuthGuard><MarketSimulation /></AuthGuard></Route>
          <Route path="/admin/roadmap"><AuthGuard><PlatformRoadmap /></AuthGuard></Route>
          <Route path="/admin/competitive-intel"><AuthGuard><CompetitiveIntel /></AuthGuard></Route>
          <Route path="/admin/micro-jobs"><AuthGuard><MicroJobExchange /></AuthGuard></Route>
          <Route path="/admin/concierge"><AuthGuard><WhiteGloveConcierge /></AuthGuard></Route>
          <Route path="/admin/currency"><AuthGuard><MultiCurrency /></AuthGuard></Route>
          <Route path="/admin/fraud-prediction"><AuthGuard><FraudPrediction /></AuthGuard></Route>
          <Route path="/admin/benchmarking"><AuthGuard><PerformanceBenchmarking /></AuthGuard></Route>
          <Route path="/admin/accessibility-wcag"><AuthGuard><AccessibilityWCAG /></AuthGuard></Route>
          <Route path="/admin/talent-alerts"><AuthGuard><TalentAlerts /></AuthGuard></Route>
          <Route path="/admin/smart-notifications"><AuthGuard><SmartNotifications /></AuthGuard></Route>
          <Route path="/admin/migration"><AuthGuard><PlatformMigration /></AuthGuard></Route>
          <Route path="/admin/revenue-ai"><AuthGuard><RevenueOptimisationAI /></AuthGuard></Route>
          <Route path="/admin/ops-intel"><AuthGuard><OpsIntelligence /></AuthGuard></Route>
          <Route path="/admin/hotspots"><AuthGuard><GeoHotSpots /></AuthGuard></Route>
          <Route path="/admin/ambassadors"><AuthGuard><AmbassadorProgram /></AuthGuard></Route>
          <Route path="/admin/elite-club"><AuthGuard><EliteClub /></AuthGuard></Route>

          {/* Default admin dashboard */}
          <Route path="/admin"><AuthGuard><AdminDashboard /></AuthGuard></Route>
        </Switch>
      </Suspense>
    </AdminLayout>
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
        <Route path="/client-dashboard" component={ClientDashboard} />
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
        <Route path="/about" component={About} />
        <Route path="/academy" component={Academy} />
        <Route path="/academy/catalog" component={AcademyCatalog} />
        <Route path="/academy/:id" component={AcademyCourseDetail} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/category/:slug" component={BlogCategory} />
        <Route path="/blog/:slug" component={BlogPost} />
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
        <Route path="/vuma" component={Vuma} />
        <Route path="/vuma-admin" component={VumaAdmin} />
        <Route path="/vuma-live" component={VumaLive} />
        <Route path="/admin/:rest*" component={AdminRouter} />
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
