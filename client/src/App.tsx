import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { useQuery } from "@tanstack/react-query"; // Not needed in demo mode
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { useAuth } from "@/hooks/useAuth"; // Demo mode
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

import Community from "@/pages/Community";
import BudgetTracker from "@/pages/budget-tracker";
import Achievements from "@/pages/achievements";
import TripAdvisorData from "@/pages/tripadvisor-data";
import Explore from "@/pages/explore";
import Weather from "@/pages/weather";
import MyTripsNew from "@/pages/my-trips-new";
import Onboarding from "@/pages/onboarding";
import Registry from "@/pages/registry";
import DemoRealPlaces from "@/pages/demo-real-places";
import CollectorData from "@/pages/CollectorData";
import Navigation from "@/components/navigation";
import { ErrorBoundary } from "@/components/error-boundary";

// Simplified demo app - no authentication needed

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/home" component={Home} />
          <Route path="/my-trips" component={MyTripsNew} />
          <Route path="/community" component={Community} />
          <Route path="/budget-tracker" component={BudgetTracker} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/tripadvisor-data" component={TripAdvisorData} />
          <Route path="/explore" component={Explore} />
          <Route path="/weather" component={Weather} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/registry" component={Registry} />
          <Route path="/demo-real-places" component={DemoRealPlaces} />
          <Route path="/collector-data" component={CollectorData} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
