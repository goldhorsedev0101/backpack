import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook for managing language switching with query invalidation and RTL support
 */
export function useLanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Set RTL direction on document when language changes
  useEffect(() => {
    const isRTL = i18n.language === 'he';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Update document title if page has specific title
    if (document.title && !document.title.includes('GlobeMate')) {
      // Let individual pages handle title updates
    }
  }, [i18n.language]);

  const switchLanguage = async (newLanguage: 'en' | 'he') => {
    if (newLanguage === i18n.language) return;

    // Change language
    await i18n.changeLanguage(newLanguage);

    // Invalidate all queries that depend on locale/language
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

    console.log(`Language switched to ${newLanguage}, queries invalidated`);
  };

  return {
    currentLanguage: i18n.language as 'en' | 'he',
    switchLanguage,
    isRTL: i18n.language === 'he'
  };
}

/**
 * Hook for getting localized formatting utilities
 */
export function useLocalizedFormatting() {
  const { i18n } = useTranslation();
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    locale: i18n.language
  };
}