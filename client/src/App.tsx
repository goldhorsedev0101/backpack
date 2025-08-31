import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Navigation from "./components/navigation";

// Simple placeholder components
const Landing = () => <div className="p-8"><h1 className="text-2xl font-bold">Welcome to TripWise</h1><p>Your AI-powered South American travel companion</p></div>;
const Home = () => <div className="p-8"><h1 className="text-2xl font-bold">Home</h1><p>Plan your next adventure</p></div>;
const Community = () => <div className="p-8"><h1 className="text-2xl font-bold">Community</h1><p>Connect with fellow travelers</p></div>;
const BudgetTracker = () => <div className="p-8"><h1 className="text-2xl font-bold">Budget Tracker</h1><p>Track your travel expenses</p></div>;
const Achievements = () => <div className="p-8"><h1 className="text-2xl font-bold">Achievements</h1><p>Your travel milestones</p></div>;
const Explore = () => <div className="p-8"><h1 className="text-2xl font-bold">Explore</h1><p>Discover amazing destinations</p></div>;
const Weather = () => <div className="p-8"><h1 className="text-2xl font-bold">Weather</h1><p>Check weather conditions</p></div>;
const MyTripsNew = () => <div className="p-8"><h1 className="text-2xl font-bold">Plan Trip</h1><p>Create your perfect itinerary</p></div>;
const CollectorData = () => <div className="p-8"><h1 className="text-2xl font-bold">Collector Data</h1><p>Travel data collection</p></div>;
const IngestionDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Ingestion Dashboard</h1><p>Data ingestion management</p></div>;
const NotFound = () => <div className="p-8"><h1 className="text-2xl font-bold">Page Not Found</h1><p>This page doesn't exist</p></div>;

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
          <Route path="/explore" component={Explore} />
          <Route path="/weather" component={Weather} />
          <Route path="/collector-data" component={CollectorData} />
          <Route path="/ingestion-dashboard" component={IngestionDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;