import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthCallback() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Supabase handles the OAuth callback automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('אירעה שגיאה במהלך ההתחברות: ' + error.message);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          setSuccess(true);
          setLoading(false);
          
          // Redirect after a short delay to show success message
          setTimeout(() => {
            setLocation('/');
          }, 2000);
        } else {
          // No session found - try to get it again after a brief delay
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError || !retryData.session) {
              setError('ההתחברות לא הושלמה בהצלחה. אנא נסה שוב.');
              setLoading(false);
            } else {
              setSuccess(true);
              setLoading(false);
              setTimeout(() => setLocation('/'), 2000);
            }
          }, 1000);
        }
        
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        setError('אירעה שגיאה במהלך ההתחברות. אנא נסה שוב.');
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
            התחברת בהצלחה! מעביר אותך לאפליקציה...
          </p>
        </div>
      </div>
    );
  }

  return null;
}