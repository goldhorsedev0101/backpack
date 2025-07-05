import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboardingCompleted?: boolean;
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
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always check for fresh auth status
  });

  // If there's an error fetching user (401 or server error), assume not authenticated
  if (error) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
