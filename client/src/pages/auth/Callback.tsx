import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../../lib/supabase.js';

export default function Callback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        const redirectPath = (typeof window !== 'undefined' && 
          sessionStorage.getItem('redirectAfterLogin')) || '/';
        
        if (error) {
          console.error('Callback session error:', error);
          if (!cancelled) setLocation('/?error=callback');
          return;
        }
        
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        if (!cancelled) {
          setLocation(redirectPath);
        }
        
      } catch (err: any) {
        console.error('Callback error:', err);
        if (!cancelled) {
          setLocation('/?error=callback');
        }
      }
    };

    handleCallback();
    
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-900">מסיים התחברות...</p>
        <p className="text-sm text-gray-600 mt-2">רק עוד רגע</p>
      </div>
    </div>
  );
}