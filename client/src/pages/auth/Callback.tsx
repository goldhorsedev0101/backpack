import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL fragment and search parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error parameters
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        if (errorParam) {
          setError(errorDescription || 'Authentication failed');
          setLoading(false);
          return;
        }

        // Get session from Supabase (should be automatically set by detectSessionInUrl)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to retrieve session');
          setLoading(false);
          return;
        }

        if (session) {
          setSuccess(true);
          setLoading(false);
          
          // Redirect after a short delay to show success message
          setTimeout(() => {
            const redirectTo = localStorage.getItem('auth_redirect_to') || '/';
            localStorage.removeItem('auth_redirect_to');
            setLocation(redirectTo);
          }, 2000);
        } else {
          setError('No session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  const handleRetryLogin = () => {
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Completing sign in...</h2>
          <p className="text-muted-foreground">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-destructive">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground">
            {error}
          </p>
          <Button onClick={handleRetryLogin} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold text-green-600">
            Welcome to TripWise!
          </h2>
          <p className="text-muted-foreground">
            {user?.email ? `Signed in as ${user.email}` : 'Successfully signed in'}
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the app...
          </p>
        </div>
      </div>
    );
  }

  return null;
}