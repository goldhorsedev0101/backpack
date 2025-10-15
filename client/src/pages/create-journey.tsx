import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Heart,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Journey {
  id: number;
  title: string;
  description: string;
  destinations: Array<{
    name: string;
    country: string;
    nights: number;
  }>;
  total_nights: number;
  price_min: number;
  price_max: number;
  hero_image: string;
}

export default function CreateJourneyPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse URL params
  const urlParams = new URLSearchParams(window.location.search);
  const journeyId = urlParams.get('journeyId');
  const adults = parseInt(urlParams.get('adults') || '2');
  const children = parseInt(urlParams.get('children') || '0');
  const tripType = urlParams.get('tripType') || 'couple';
  const startDate = urlParams.get('startDate') || '';
  const budget = urlParams.get('budget') || '';

  const [customRequest, setCustomRequest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Fetch original journey for inspiration
  const { data: journey, isLoading } = useQuery<Journey>({
    queryKey: [`/api/journeys/${journeyId}`],
    enabled: !!journeyId,
  });

  const translateJourneyTitle = (title: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      'Southeast Asia Adventure': { he: 'הרפתקה בדרום מזרח אסיה', en: 'Southeast Asia Adventure' },
      'European Capital Tour': { he: 'סיור בירות אירופה', en: 'European Capital Tour' },
      'Asian Cultural Journey': { he: 'מסע תרבותי באסיה', en: 'Asian Cultural Journey' },
      'Mediterranean Escape': { he: 'בריחה לים התיכון', en: 'Mediterranean Escape' },
      'USA East Coast Explorer': { he: 'חוקר החוף המזרחי של ארה"ב', en: 'USA East Coast Explorer' },
      'Japan Extended Discovery': { he: 'גילוי יפן מורחב', en: 'Japan Extended Discovery' },
      'Grand European Journey': { he: 'המסע האירופי הגדול', en: 'Grand European Journey' },
      'Southeast Asia Multi-Country': { he: 'דרום מזרח אסיה רב-מדינתי', en: 'Southeast Asia Multi-Country' },
    };
    return translations[title]?.[isRTL ? 'he' : 'en'] || title;
  };

  const translateTripType = (type: string) => {
    const types: Record<string, { he: string; en: string }> = {
      'couple': { he: 'זוגות', en: 'Couple' },
      'family': { he: 'משפחה', en: 'Family' },
      'solo': { he: 'סולו', en: 'Solo' },
      'friends': { he: 'חברים', en: 'Friends' },
      'honeymoon': { he: 'ירח דבש', en: 'Honeymoon' },
      'adventure': { he: 'הרפתקאות', en: 'Adventure' },
    };
    return types[type]?.[isRTL ? 'he' : 'en'] || type;
  };

  const handleGenerateJourney = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-custom-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journeyId,
          adults,
          children,
          tripType,
          startDate,
          budget,
          customRequest,
          language: i18n.language,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate journey');
      }
      
      const data = await response.json();
      setIsGenerating(false);
      setGenerationComplete(true);
      
      // After generation, redirect to the new journey page
      setTimeout(() => {
        setLocation(`/my-journey/${data.tripId}`);
      }, 2000);
    } catch (error) {
      console.error('Error generating journey:', error);
      setIsGenerating(false);
      // Show error message to user
      toast({
        title: isRTL ? 'שגיאה ביצירת המסע' : 'Error Creating Journey',
        description: isRTL ? 'אירעה שגיאה ביצירת המסע. אנא נסה שוב.' : 'An error occurred while creating your journey. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isRTL ? 'מסע לא נמצא' : 'Journey Not Found'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isRTL ? 'לא הצלחנו למצוא את המסע המבוקש' : 'We could not find the requested journey'}
              </p>
              <Link href="/journeys">
                <Button>
                  {isRTL ? 'חזרה למסעות' : 'Back to Journeys'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className={`flex items-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href={`/journeys/${journeyId}`}>
            <Button variant="ghost" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חזרה למסע' : 'Back to Journey'}</span>
            </Button>
          </Link>
          <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? '✨ צור מסע מותאם אישית' : '✨ Create Custom Journey'}
            </h1>
            <p className="text-gray-600">
              {isRTL ? 'מבוסס על ההשראה שלך, מותאם בדיוק בשבילך' : 'Based on your inspiration, tailored just for you'}
            </p>
          </div>
        </div>

        {/* Inspiration Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <Sparkles className="w-5 h-5 text-orange-500" />
              {isRTL ? 'השראה מהמסע' : 'Journey Inspiration'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {journey.hero_image && (
                <img
                  src={journey.hero_image}
                  alt={journey.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-xl font-semibold mb-2">{translateJourneyTitle(journey.title)}</h3>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {journey.destinations.slice(0, 3).map((dest, idx) => (
                    <Badge key={idx} variant="secondary">
                      <MapPin className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {dest.name}
                    </Badge>
                  ))}
                  {journey.destinations.length > 3 && (
                    <Badge variant="outline">
                      +{journey.destinations.length - 3} {isRTL ? 'נוספים' : 'more'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <Users className="w-5 h-5 text-orange-500" />
              {isRTL ? 'ההעדפות שלך' : 'Your Preferences'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-sm text-gray-600">{isRTL ? 'מטיילים' : 'Travelers'}</div>
                <div className="font-semibold">
                  {adults} {isRTL ? 'מבוגרים' : 'adults'}
                  {children > 0 && `, ${children} ${isRTL ? 'ילדים' : 'children'}`}
                </div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                <Heart className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                <div className="text-sm text-gray-600">{isRTL ? 'סוג טיול' : 'Trip Type'}</div>
                <div className="font-semibold">{translateTripType(tripType)}</div>
              </div>
              {startDate && (
                <div className="text-center p-4 bg-blue-50 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm text-gray-600">{isRTL ? 'תאריך התחלה' : 'Start Date'}</div>
                  <div className="font-semibold">{new Date(startDate).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</div>
                </div>
              )}
              {budget && (
                <div className="text-center p-4 bg-green-50 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-sm text-gray-600">{isRTL ? 'תקציב' : 'Budget'}</div>
                  <div className="font-semibold">{budget}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'בקשות מיוחדות (אופציונלי)' : 'Special Requests (Optional)'}
            </CardTitle>
            <CardDescription dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL 
                ? 'ספר לנו מה חשוב לך - מקומות מיוחדים, פעילויות, העדפות אוכל, וכל דבר אחר'
                : 'Tell us what matters to you - special places, activities, food preferences, anything else'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={isRTL 
                ? 'לדוגמה: אני רוצה לבקר במקדשים עתיקים, לטעום אוכל רחוב מקומי, ולהימנע מאטרקציות תיירותיות צפופות...'
                : 'e.g., I want to visit ancient temples, try local street food, and avoid crowded tourist attractions...'
              }
              value={customRequest}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomRequest(e.target.value)}
              className="min-h-32"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        {!generationComplete ? (
          <Button
            onClick={handleGenerateJourney}
            disabled={isGenerating}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}
            data-testid="generate-custom-journey"
          >
            {isGenerating ? (
              <>
                <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'מייצר את המסע המושלם שלך...' : 'Generating your perfect journey...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? '✨ צור את המסע שלי' : '✨ Create My Journey'}
                </span>
              </>
            )}
          </Button>
        ) : (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="text-xl font-semibold text-green-800 mb-1">
                    {isRTL ? '🎉 המסע שלך מוכן!' : '🎉 Your Journey is Ready!'}
                  </h3>
                  <p className="text-green-700">
                    {isRTL ? 'מעביר אותך לטיולים שלי...' : 'Redirecting to My Trips...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
