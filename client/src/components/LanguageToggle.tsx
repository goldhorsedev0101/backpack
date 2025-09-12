import { useTranslation } from 'react-i18next';
import { Button } from './ui/button.js';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Set HTML dir attribute based on language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      data-testid="language-toggle"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm">
        {i18n.language === 'en' ? 'HE' : 'EN'}
      </span>
    </Button>
  );
}