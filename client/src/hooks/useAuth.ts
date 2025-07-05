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
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null; // Not authenticated
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (err) {
        console.error("Auth error:", err);
        return null; // Return null instead of throwing to prevent unhandled rejections
      }
    },
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
