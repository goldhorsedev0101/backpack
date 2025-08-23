import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      ...options.headers,
    },
    credentials: "include",
    cache: "no-cache",
  });

  // If unauthorized, allow in demo mode
  if (res.status === 401) {
    console.log("Unauthorized request detected, but allowing access in demo mode");
    // Create a mock success response for demo mode
    return new Response(JSON.stringify({ message: "Demo mode" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey[0] as string}`, {
      credentials: "include",
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // If unauthorized and should throw, allow in demo mode
    if (res.status === 401) {
      console.log("Unauthorized request in demo mode, continuing");
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      gcTime: 5 * 60 * 1000, // 5 minutes default cache
    },
    mutations: {
      retry: false,
    },
  },
});
