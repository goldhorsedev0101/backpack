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
        console.log('Starting auth callback handling...');
        console.log('Current URL:', window.location.href);
        
        // Let Supabase automatically detect and handle the session from URL
        // This is handled by detectSessionInUrl: true in our Supabase config
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setError('Failed to retrieve session');
            setLoading(false);
            return;
          }

          if (session && session.user) {
            console.log('Authentication successful for:', session.user.email);
            setSuccess(true);
            setLoading(false);
            
            // Redirect after showing success message
            setTimeout(() => {
              const redirectTo = localStorage.getItem('auth_redirect_to') || '/';
              localStorage.removeItem('auth_redirect_to');
              
              // Clear the URL from OAuth params and redirect
              window.history.replaceState({}, document.title, redirectTo);
              setLocation(redirectTo);
            }, 1000);
            return;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }
        
        // If we get here, no session was found after all attempts
        console.warn('No session found after multiple attempts');
        setError('ההתחברות לא הסתיימה בהצלחה. אנא נסה שוב.');
        setLoading(false);
        
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        setError('אירעה שגיאה במהלך ההתחברות. אנא נסה שוב.');
        setLoading(false);
      }
    };

    // Always try to handle the callback
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
          <h2 className="text-xl font-semibold">מתחבר...</h2>
          <p className="text-muted-foreground">
            אנא המתן בזמן שאנחנו מסיימים להגדיר את החשבון שלך
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
            שגיאה בהתחברות
          </h2>
          <p className="text-muted-foreground">
            {error}
          </p>
          <Button onClick={handleRetryLogin} className="mt-4">
            נסה שוב
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
            ברוך הבא ל-TripWise!
          </h2>
          <p className="text-muted-foreground">
            {user?.email ? `התחברת בהצלחה כ-${user.email}` : 'התחברת בהצלחה'}
          </p>
          <p className="text-sm text-muted-foreground">
            מעביר אותך לאפליקציה...
          </p>
        </div>
      </div>
    );
  }

  return null;
}