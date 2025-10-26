import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { AuthProvider } from "./context/AuthContext.js";
import "./i18n";
import NotFound from "./pages/not-found.js";
import Home from "./pages/home.js";
import Callback from "./pages/auth/Callback.js";

import Community from "./pages/Community.js";
import BudgetTracker from "./pages/budget-tracker.js";
import Achievements from "./pages/achievements.js";
import TripAdvisorData from "./pages/tripadvisor-data.js";
import Weather from "./pages/weather.js";
import MyTripsNew from "./pages/my-trips-new.js";
import ItineraryDetail from "./pages/itinerary-detail.js";
import Onboarding from "./pages/onboarding.js";
import Registry from "./pages/registry.js";
import DemoRealPlaces from "./pages/demo-real-places.js";
import CollectorData from "./pages/CollectorData.js";
import Dashboard from "./pages/dashboard.js";
import AdminTranslations from "./pages/admin/translations.js";
import DestinationsHub from "./pages/destinations-hub.js";
import DestinationDetail from "./pages/destination-detail.js";
import IntegrationsDemoDestinations from "./pages/integrations-demo-destinations.js";
import Journeys from "./pages/journeys.js";
import JourneyDetail from "./pages/journey-detail.js";
import CreateJourney from "./pages/create-journey.js";
import MyJourney from "./pages/my-journey.js";
import MyJourneys from "./pages/my-journeys.js";
import MediaDemo from "./pages/media-demo.js";
import IntegrationsDemoUnsplash from "./pages/integrations-demo-unsplash.js";
import HelpCenter from "./pages/help-center.js";
import Contact from "./pages/contact.js";
import PrivacyPolicy from "./pages/privacy-policy.js";
import TermsOfService from "./pages/terms-of-service.js";
import Accessibility from "./pages/accessibility.js";
import About from "./pages/about.js";
import HotelDeals from "./pages/hotel-deals.js";
import AiAssistant from "./pages/ai-assistant.js";
import Flights from "./pages/flights.js";
import FlightBooking from "./pages/flight-booking.js";
import Navigation from "./components/navigation.js";
import Footer from "./components/footer.js";
import { ErrorBoundary } from "./components/error-boundary.js";

// Simplified demo app - no authentication needed

// Force enable page scrolling - override Radix Select scroll lock
function EnableScrolling() {
  React.useEffect(() => {
    // Patch addEventListener to prevent Radix from blocking scroll events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    const blockedListeners = new Map<EventTarget, Array<{ type: string; listener: any; options: any }>>();

    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      // Block non-passive wheel/touchmove listeners from being added
      if ((type === 'wheel' || type === 'touchmove') && 
          (!options || options.passive !== true)) {
        // Store reference but don't actually add it
        if (!blockedListeners.has(this)) {
          blockedListeners.set(this, []);
        }
        blockedListeners.get(this)!.push({ type, listener, options });
        console.log(`[EnableScrolling] Blocked non-passive ${type} listener`);
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function(type: string, listener: any, options?: any) {
      // Check if this was a blocked listener
      const blocked = blockedListeners.get(this);
      if (blocked) {
        const index = blocked.findIndex(item => 
          item.type === type && item.listener === listener
        );
        if (index !== -1) {
          blocked.splice(index, 1);
          return;
        }
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };

    const forceScroll = () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
      document.documentElement.style.overflow = 'auto';
    };

    forceScroll();

    const observer = new MutationObserver(forceScroll);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    });

    const interval = setInterval(forceScroll, 50);

    return () => {
      // Restore original methods
      EventTarget.prototype.addEventListener = originalAddEventListener;
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  
  React.useEffect(() => {
    // Immediate scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Also scroll after a tiny delay to catch any late renders
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <EnableScrolling />
      <ScrollToTop />
      <Navigation />
      {/* Main content area adjusted for right sidebar on desktop, bottom padding for mobile nav */}
      <main className="flex-1 pb-20 md:pb-0 md:pr-64">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/my-trips" component={MyTripsNew} />
          <Route path="/itineraries/:id" component={ItineraryDetail} />
          <Route path="/community" component={Community} />
          <Route path="/budget-tracker" component={BudgetTracker} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/tripadvisor-data" component={TripAdvisorData} />
          <Route path="/weather" component={Weather} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/registry" component={Registry} />
          <Route path="/demo-real-places" component={DemoRealPlaces} />
          <Route path="/collector-data" component={CollectorData} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin/translations" component={AdminTranslations} />
          <Route path="/destinations" component={DestinationsHub} />
          <Route path="/destinations/:slug" component={DestinationDetail} />
          <Route path="/journeys" component={Journeys} />
          <Route path="/journeys/:id" component={JourneyDetail} />
          <Route path="/create-journey" component={CreateJourney} />
          <Route path="/my-journey/:id" component={MyJourney} />
          <Route path="/my-journeys" component={MyJourneys} />
          <Route path="/integrations-demo/destinations" component={IntegrationsDemoDestinations} />
          <Route path="/integrations-demo/media" component={MediaDemo} />
          <Route path="/integrations-demo/unsplash" component={IntegrationsDemoUnsplash} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/accessibility" component={Accessibility} />
          <Route path="/about" component={About} />
          <Route path="/hotel-deals" component={HotelDeals} />
          <Route path="/ai-assistant" component={AiAssistant} />
          <Route path="/flights" component={Flights} />
          <Route path="/flights/booking/:offerId" component={FlightBooking} />
          <Route path="/auth/callback" component={Callback} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
