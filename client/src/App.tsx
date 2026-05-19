import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Eagerly load the home page (critical path — must render fast)
import Home from "./pages/Home";

// Lazy-load all other pages to reduce initial JS bundle size
const NotFound = lazy(() => import("@/pages/NotFound"));
const Questionnaire = lazy(() => import("@/pages/Questionnaire"));
const Results = lazy(() => import("@/pages/Results"));
const TeaserResults = lazy(() => import("@/pages/TeaserResults"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Report = lazy(() => import("@/pages/Report"));
const Media = lazy(() => import("@/pages/Media"));
const Store = lazy(() => import("@/pages/Store"));
const Contact = lazy(() => import("@/pages/Contact"));
const FactorDetail = lazy(() => import("@/pages/FactorDetail"));
const Book = lazy(() => import("@/pages/Book"));
const BookReader = lazy(() => import("@/pages/BookReader"));
const Consult = lazy(() => import("@/pages/Consult"));
const ConsultSession = lazy(() => import("@/pages/ConsultSession"));
const ConsultReport = lazy(() => import("@/pages/ConsultReport"));
const ConsultHistory = lazy(() => import("@/pages/ConsultHistory"));
const Shop = lazy(() => import("@/pages/Shop"));
const ReviewSuccess = lazy(() => import("@/pages/ReviewSuccess"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const PEMF = lazy(() => import("@/pages/PEMF"));
const PEMFJoin = lazy(() => import("@/pages/PEMFJoin"));
const PEMFAffiliate = lazy(() => import("@/pages/PEMFAffiliate"));
const PEMFAffiliateHU = lazy(() => import("@/pages/PEMFAffiliateHU"));
const PEMFPortal = lazy(() => import("@/pages/PEMFPortal"));
const PEMFAdmin = lazy(() => import("@/pages/PEMFAdmin"));
const PEMFAdminResources = lazy(() => import("@/pages/PEMFAdminResources"));
const PEMFAdminCampaigns = lazy(() => import("@/pages/PEMFAdminCampaigns"));
const PEMFResources = lazy(() => import("@/pages/PEMFResources"));
const HomeAffiliate = lazy(() => import("@/pages/HomeAffiliate"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const GoRedirect = lazy(() => import("@/pages/GoRedirect"));
const RedoxAffiliate = lazy(() => import("@/pages/RedoxAffiliate"));
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));

// Minimal spinner shown while a lazy page chunk loads
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/questionnaire"} component={Questionnaire} />
        <Route path={"/self-evaluation"}>{() => <Redirect to="/questionnaire" />}</Route>
        <Route path={"/evaluation"}>{() => <Redirect to="/questionnaire" />}</Route>
        <Route path={"/teaser-results"} component={TeaserResults} />
        <Route path={"/results/:id"} component={Results} />
        <Route path={"/report/:id"} component={Report} />
        <Route path={"/media"} component={Media} />
        <Route path={"/store"} component={Store} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/factor/:id"} component={FactorDetail} />
        <Route path={"/book"} component={Book} />
        <Route path={"/book/read"} component={BookReader} />
        <Route path={"/consult"} component={Consult} />
        <Route path={"/consult/session/:id"} component={ConsultSession} />
        <Route path={"/consult/report/:id"} component={ConsultReport} />
        <Route path={"/consult/history"} component={ConsultHistory} />
        <Route path={"/consult/review-success"} component={ReviewSuccess} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/knowledge-base"} component={KnowledgeBase} />
        <Route path={"/pemf"} component={PEMF} />
        <Route path={"/pemf/join"} component={PEMFJoin} />
        <Route path={"/pemf/portal"} component={PEMFPortal} />
        <Route path={"/pemf/admin"} component={PEMFAdmin} />
        <Route path={"/pemf/admin/resources"} component={PEMFAdminResources} />
        <Route path={"/pemf/admin/campaigns"} component={PEMFAdminCampaigns} />
        <Route path={"/pemf/portal/resources"} component={PEMFResources} />
        <Route path={"/blog"} component={BlogIndex} />
        <Route path={"/blog/:slug"} component={BlogPost} />
        <Route path={"/unsubscribe"} component={Unsubscribe} />
        <Route path={"/go/:affiliateSlug/olylife/:deviceKey"} component={GoRedirect} />
        <Route path={"/go/:affiliateSlug/:productId"} component={GoRedirect} />
        <Route path={"/ref/:slug"} component={HomeAffiliate} />
        <Route path={"/pemf/:slug/hu"} component={PEMFAffiliateHU} />
        <Route path={"/pemf/:slug"} component={PEMFAffiliate} />
        <Route path={"/redox"} component={RedoxAffiliate} />
        <Route path={"/redox/:slug"} component={RedoxAffiliate} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
