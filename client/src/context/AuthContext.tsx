import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user data from localStorage for immediate UI display
        const cachedUser = localStorage.getItem('tripwise_user');
        if (cachedUser && !session) {
          try {
            const userData = JSON.parse(cachedUser);
            // Only use cached data if it's recent (within 24 hours)
            const cacheAge = Date.now() - (userData.cached_at || 0);
            if (cacheAge < 24 * 60 * 60 * 1000) {
              console.log('Using cached user data for immediate display');
            } else {
              localStorage.removeItem('tripwise_user');
            }
          } catch (error) {
            localStorage.removeItem('tripwise_user');
          }
        }
        
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Cache user data for quick loading
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            cached_at: Date.now()
          };
          localStorage.setItem('tripwise_user', JSON.stringify(userData));
          
          // If this is a sign-in event and we're on the callback page, 
          // the callback handler will manage the redirect
          if (event === 'SIGNED_IN' && !window.location.pathname.includes('/auth/callback')) {
            console.log('User signed in successfully');
          }
        } else {
          localStorage.removeItem('tripwise_user');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      
      const message = error.message === 'Request timeout' 
        ? 'The request is taking longer than expected. Please try again.'
        : 'An unexpected error occurred during sign in';
        
      return { 
        user: null, 
        error: { 
          message,
          name: 'UnexpectedError',
          status: 500
        } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData ? {
            full_name: userData.name,
            ...userData
          } : undefined
        }
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Sign up error:', error);
        return { user: null, error };
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      
      const message = error.message === 'Request timeout' 
        ? 'The request is taking longer than expected. Please try again.'
        : 'An unexpected error occurred during sign up';
        
      return { 
        user: null, 
        error: { 
          message,
          name: 'UnexpectedError',
          status: 500
        } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Store current location for redirect after auth
      localStorage.setItem('auth_redirect_to', window.location.pathname);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        localStorage.removeItem('auth_redirect_to');
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      localStorage.removeItem('auth_redirect_to');
      return { 
        error: { 
          message: 'An unexpected error occurred during Google sign in',
          name: 'UnexpectedError',
          status: 500
        } as AuthError 
      };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem('tripwise_user');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        console.error('Profile update error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected profile update error:', error);
      return { 
        error: { 
          message: 'An unexpected error occurred during profile update',
          name: 'UnexpectedError',
          status: 500
        } as AuthError 
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}