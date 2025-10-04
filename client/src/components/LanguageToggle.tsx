import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button.js';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';
import { invalidateLocalizedQueries } from '../lib/localizedData.js';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set HTML dir attribute based on language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Update page titles to be localized
    if (document.title.includes('GlobeMate')) {
      const baseName = 'GlobeMate';
      document.title = i18n.language === 'he' ? `${baseName} - מתכנן הטיולים` : `${baseName} - Travel Planner`;
    }
  }, [i18n.language]);

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    
    await i18n.changeLanguage(newLang);
    
    // Enhanced query invalidation to cover all locale-dependent queries
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key)) return false;
        
        // Invalidate queries with locale-dependent data
        return key.some((segment) => 
          typeof segment === 'string' && (
            segment.includes('locale') ||
            segment.includes('localized') ||
            segment.includes('destinations') ||
            segment.includes('attractions') ||
            segment.includes('restaurants') ||
            segment.includes('accommodations') ||
            segment.includes('places') ||
            segment.includes('community')
          )
        );
      }
    });
    
    // Also use the existing function for backwards compatibility
    invalidateLocalizedQueries(queryClient);
    
    console.log(`Language switched to ${newLang}, queries invalidated`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 min-w-[70px]"
      data-testid="language-toggle"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'עב' : 'EN'}
      </span>
    </Button>
  );
}