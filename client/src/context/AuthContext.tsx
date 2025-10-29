import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase.js';
import { getRedirectBase } from '../utils/redirectBase.js';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '../hooks/use-toast.js';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsTestUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setUser(session?.user || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      
      if (isMounted) {
        setUser(session?.user || null);
        setIsLoading(false);
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast({
          title: t('auth.signed_in_successfully'),
          description: t('auth.welcome_back', { email: session.user.email }),
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: t('auth.signed_out_successfully'),
          description: t('auth.goodbye'),
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // שמירת יעד החזרה לפני הניסיון לroutingההתחברות
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      
      const appUrl = (import.meta as any).env.VITE_PUBLIC_APP_URL;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: appUrl  // לא localhost
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
      
    } catch (error: any) {
      setIsLoading(false);
      console.error('Sign in error:', error);
      toast({
        title: t('auth.login_error'),
        description: error.message || t('auth.try_again_later'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInAsTestUser = async () => {
    try {
      setIsLoading(true);
      
      const testEmail = 'support@globemate.co.il';
      const testPassword = 'GlobeMate2024Test!';
      
      // First, try to create the test user via backend endpoint
      try {
        const response = await fetch('/api/dev/create-test-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log('Test user creation response:', errorData);
        }
      } catch (createError) {
        console.log('Could not create test user via backend, will try to sign in anyway:', createError);
      }
      
      // Now try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('auth.signed_in_successfully') || 'Signed in successfully',
        description: 'התחברת כמשתמש בדיקה / Signed in as test user',
      });
      
    } catch (error: any) {
      console.error('Test sign in error:', error);
      toast({
        title: t('auth.login_error') || 'Login Error',
        description: error.message || t('auth.try_again_later'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: t('auth.login_error'),
        description: error.message || t('auth.try_again_later'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInAsTestUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}