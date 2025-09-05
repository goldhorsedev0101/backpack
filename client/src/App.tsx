import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
// import { useQuery } from "@tanstack/react-query"; // Not needed in demo mode
import { Toaster } from "./components/ui/toaster.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
// import { useAuth } from "@/hooks/useAuth"; // Demo mode
import NotFound from "./pages/not-found.js";
import Landing from "./pages/landing.js";
import Home from "./pages/home.js";

import Community from "./pages/Community.js";
import BudgetTracker from "./pages/budget-tracker.js";
import Achievements from "./pages/achievements.js";
import TripAdvisorData from "./pages/tripadvisor-data.js";
import Explore from "./pages/explore";
import Weather from "./pages/weather.js";
import MyTripsNew from "./pages/my-trips-new.js";
import Onboarding from "./pages/onboarding.js";
import Registry from "./pages/registry.js";
import DemoRealPlaces from "./pages/demo-real-places.js";
import CollectorData from "./pages/CollectorData.js";
import Dashboard from "./pages/dashboard.js";
import Navigation from "./components/navigation.js";
import { ErrorBoundary } from "./components/error-boundary.js";

// Simplified demo app - no authentication needed

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Main content area adjusted for right sidebar */}
      <main className="md:pr-64">
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
          <Route path="/dashboard" component={Dashboard} />
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
