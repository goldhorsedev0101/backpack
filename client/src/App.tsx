import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TripBuilder from "@/pages/trip-builder";
import Community from "@/pages/community";
import BudgetTracker from "@/pages/budget-tracker";
import Achievements from "@/pages/achievements";
import TripAdvisorData from "@/pages/tripadvisor-data";
import Onboarding from "@/pages/onboarding";
import Navigation from "@/components/navigation";
import { ErrorBoundary } from "@/components/error-boundary";

function AuthenticatedApp() {
  // Always show onboarding immediately after authentication
  const [currentLocation] = useLocation();
  
  // Show onboarding for root path, letting users complete personalization
  if (currentLocation === '/' || currentLocation === '/onboarding') {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/trip-builder" component={TripBuilder} />
          <Route path="/community" component={Community} />
          <Route path="/budget-tracker" component={BudgetTracker} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/tripadvisor-data" component={TripAdvisorData} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      {isAuthenticated && (
        <Route path="*" component={AuthenticatedApp} />
      )}
      <Route component={NotFound} />
    </Switch>
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
