import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboardingCompleted?: boolean;
  registrationCompleted?: boolean;
  interests?: string[];
  travelStyles?: string[];
  budgetRange?: string;
  experienceLevel?: string;
  groupSize?: string;
  preferredDuration?: string;
  accommodationType?: string[];
  activities?: string[];
  personalityTraits?: string[];
}

export function useAuth() {
  // DEMO MODE - return static demo user data without any API calls
  return {
    user: null, // No user in demo mode
    isLoading: false, // Never loading in demo mode
    isAuthenticated: false, // Not authenticated in demo mode
  };
}
