import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import TeaserResults from "./pages/TeaserResults";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Media from "./pages/Media";
import Store from "./pages/Store";
import Contact from "./pages/Contact";
import FactorDetail from "@/pages/FactorDetail";
import Book from "@/pages/Book";
import BookReader from "@/pages/BookReader";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
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
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
