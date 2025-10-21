import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Shield, 
  CheckCircle,
  Star,
  TrendingDown,
  Building2,
  CreditCard,
  FileCheck,
  Clock,
  Search,
  Send,
  MessageCircle
} from "lucide-react";

export default function HotelDeals() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
    budget: "",
    phone: "",
    email: "",
    notes: "",
    whatsappConsent: false
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Submitting data:", data);
      return await apiRequest("/api/hotel-inquiries", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "תודה רבה! ✅",
        description: "קיבלנו את הבקשה שלך. נחזור אליך בהקדם עם הצעות מחיר מעולות!",
      });
      setFormData({
        destination: "",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        budget: "",
        phone: "",
        email: "",
        notes: "",
        whatsappConsent: false
      });
    },
    onError: (error: any) => {
      console.error("Submission error:", error);
      toast({
        title: "אופס...",
        description: error?.message || "משהו השתבש. אנא נסה שוב או צור קשר ישירות.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.destination || !formData.checkIn || !formData.checkOut || !formData.phone || !formData.email || !formData.budget) {
      toast({
        title: "שדות חסרים ⚠️",
        description: "אנא מלא את כל השדות הנדרשים (יעד, תאריכים, תקציב, טלפון, אימייל)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate dates
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      toast({
        title: "תאריך שגוי ⚠️",
        description: "תאריך כניסה חייב להיות בעתיד",
        variant: "destructive"
      });
      return;
    }
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "תאריך שגוי ⚠️",
        description: "תאריך יציאה חייב להיות אחרי תאריך הכניסה",
        variant: "destructive"
      });
      return;
    }
    
    submitInquiry.mutate(formData);
  };

  const scrollToForm = () => {
    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div 
        className="relative h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop)',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" dir="rtl">
              חופשה חכמה מתחילה כאן ✈️
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed" dir="rtl">
              גלו מחירים סיטונאיים למלונות בארץ ובעולם – תוך שעה נחזור עם 2–3 הצעות שמתאימות לתקציב שלכם.
            </p>
            <Button 
              onClick={scrollToForm}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 py-6 h-auto"
              data-testid="button-scroll-to-form"
            >
              <Search className="ml-2 h-6 w-6" />
              בדיקת זמינות מהירה
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="trust-wholesale">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2" dir="rtl">מחירים סיטונאיים</h3>
              <p className="text-gray-600 text-sm" dir="rtl">מחירים שלא תמצאו באונליין</p>
            </div>

            <div className="text-center" data-testid="trust-boutique">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg mb-2" dir="rtl">בוטיק ישראלי</h3>
              <p className="text-gray-600 text-sm" dir="rtl">שירות אישי ומקצועי</p>
            </div>

            <div className="text-center" data-testid="trust-secure">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2" dir="rtl">תשלום מאובטח</h3>
              <p className="text-gray-600 text-sm" dir="rtl">רק דרך קישור מוצפן</p>
            </div>

            <div className="text-center" data-testid="trust-cancellation">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2" dir="rtl">ביטול גמיש</h3>
              <p className="text-gray-600 text-sm" dir="rtl">לפי תנאי הספק</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-600" dir="rtl">
            איך זה עובד?
          </h2>
          
          <div className="space-y-8">
            {[
              { 
                icon: <Send className="h-8 w-8" />, 
                title: "משאירים פרטים", 
                desc: "מלאו את הטופס למטה עם היעד והתאריכים שלכם",
                testId: "step-submit"
              },
              { 
                icon: <Search className="h-8 w-8" />, 
                title: "אנחנו בודקים זמינות", 
                desc: "הצוות שלנו מחפש את המלונות הטובים ביותר במחירים הסיטונאיים",
                testId: "step-search"
              },
              { 
                icon: <Star className="h-8 w-8" />, 
                title: "מקבלים 2-3 הצעות", 
                desc: "תוך שעה אתם מקבלים הצעות מפורטות למייל או לוואטסאפ",
                testId: "step-receive"
              },
              { 
                icon: <CreditCard className="h-8 w-8" />, 
                title: "משלמים בקישור מאובטח", 
                desc: "אם ההצעה מתאימה - תשלום דרך קישור מוצפן ובטוח",
                testId: "step-payment"
              },
              { 
                icon: <CheckCircle className="h-8 w-8" />, 
                title: "מקבלים שוברים ונהנים", 
                desc: "מקבלים אישור הזמנה ושוברים למלון - וסגורים לחופשה!",
                testId: "step-confirmed"
              }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-6" data-testid={step.testId}>
                <div className="flex-shrink-0">
                  <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-shrink-0 bg-orange-100 p-4 rounded-lg">
                  <div className="text-orange-600">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" dir="rtl">{step.title}</h3>
                  <p className="text-gray-600" dir="rtl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Form Section */}
      <div id="quote-form" className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-2 border-orange-200">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-2 text-orange-600 text-center" dir="rtl">
                קבלו הצעת מחיר חכמה
              </h2>
              <p className="text-gray-600 text-center mb-8" dir="rtl">
                מלאו את הפרטים ונחזור אליכם תוך שעה עם הצעות מותאמות אישית
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Destination */}
                <div>
                  <Label htmlFor="destination" className="text-right block mb-2" dir="rtl">
                    לאן אתם רוצים לטוס? *
                  </Label>
                  <Input
                    id="destination"
                    placeholder="לדוגמה: אילת, דובאי, פריז, ניו יורק..."
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    className="text-right"
                    dir="rtl"
                    data-testid="input-destination"
                  />
                </div>

                {/* Check-in and Check-out */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn" className="text-right block mb-2" dir="rtl">
                      תאריך כניסה *
                    </Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      required
                      className="text-right"
                      dir="rtl"
                      data-testid="input-check-in"
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut" className="text-right block mb-2" dir="rtl">
                      תאריך יציאה *
                    </Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      required
                      className="text-right"
                      dir="rtl"
                      data-testid="input-check-out"
                    />
                  </div>
                </div>

                {/* Adults and Children */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults" className="text-right block mb-2" dir="rtl">
                      מספר מבוגרים
                    </Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                      className="text-right"
                      dir="rtl"
                      data-testid="input-adults"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-right block mb-2" dir="rtl">
                      מספר ילדים
                    </Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.children}
                      onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                      className="text-right"
                      dir="rtl"
                      data-testid="input-children"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label htmlFor="budget" className="text-right block mb-2" dir="rtl">
                    תקציב משוער ללילה (₪) *
                  </Label>
                  <Input
                    id="budget"
                    placeholder="לדוגמה: 500-800 ₪"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    className="text-right"
                    dir="rtl"
                    data-testid="input-budget"
                  />
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-right block mb-2" dir="rtl">
                      טלפון *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="050-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="text-right"
                      dir="rtl"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-right block mb-2" dir="rtl">
                      אימייל *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="text-left"
                      dir="ltr"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-right block mb-2" dir="rtl">
                    מה חשוב לכם? (אופציונלי)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="למשל: חדר עם נוף לים, קרוב לחוף, בריכה מחוממת..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="text-right"
                    dir="rtl"
                    data-testid="textarea-notes"
                  />
                </div>

                {/* WhatsApp Consent */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="whatsapp"
                    checked={formData.whatsappConsent}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, whatsappConsent: checked as boolean })
                    }
                    data-testid="checkbox-whatsapp"
                  />
                  <label 
                    htmlFor="whatsapp" 
                    className="text-sm text-gray-700 cursor-pointer flex items-center gap-2" 
                    dir="rtl"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    אפשר לפנות אליי גם בוואטסאפ
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 h-auto"
                  disabled={submitInquiry.isPending}
                  data-testid="button-submit-inquiry"
                >
                  {submitInquiry.isPending ? (
                    <>
                      <Clock className="ml-2 h-5 w-5 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-5 w-5" />
                      שלחו לי הצעות מחיר
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center" dir="rtl">
                  בשליחת הטופס אני מאשר/ת את{" "}
                  <a href="/privacy" className="text-orange-600 underline">
                    מדיניות הפרטיות
                  </a>
                  {" "}ואת{" "}
                  <a href="/terms" className="text-orange-600 underline">
                    תנאי השימוש
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-b from-teal-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-teal-600" dir="rtl">
            מה הלקוחות שלנו אומרים
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card data-testid="testimonial-1">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4" dir="rtl">
                  "חזרו אליי תוך 40 דקות עם 3 הצעות מעולות. בחרתי מלון 5 כוכבים בדובאי במחיר של 4 כוכבים!"
                </p>
                <p className="font-bold text-sm" dir="rtl">דנה כהן, תל אביב</p>
              </CardContent>
            </Card>

            <Card data-testid="testimonial-2">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4" dir="rtl">
                  "שירות אישי ומקצועי. חסכתי מאות שקלים על חופשה משפחתית באילת. ממליצה בחום!"
                </p>
                <p className="font-bold text-sm" dir="rtl">רונית לוי, חיפה</p>
              </CardContent>
            </Card>

            <Card data-testid="testimonial-3">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4" dir="rtl">
                  "לא מאמינה שקיבלתי מלון כזה במחיר כזה. תודה GlobeMate על החוויה המעולה!"
                </p>
                <p className="font-bold text-sm" dir="rtl">מיכל אברהם, ירושלים</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-right" dir="rtl">
              <h3 className="font-bold text-xl mb-4">GlobeMate</h3>
              <p className="text-gray-300 text-sm">
                תכנון חכם לחופשות מושלמות
              </p>
            </div>

            <div className="text-center" dir="rtl">
              <h4 className="font-bold mb-4">קישורים שימושיים</h4>
              <div className="space-y-2 text-sm">
                <a href="/privacy" className="block text-gray-300 hover:text-white">
                  מדיניות פרטיות
                </a>
                <a href="/terms" className="block text-gray-300 hover:text-white">
                  תנאי שימוש
                </a>
                <a href="/contact" className="block text-gray-300 hover:text-white">
                  צור קשר
                </a>
              </div>
            </div>

            <div className="text-center md:text-left" dir="rtl">
              <h4 className="font-bold mb-4">יצירת קשר</h4>
              <p className="text-gray-300 text-sm mb-2">
                📧 support@globemate.co.il
              </p>
              <p className="text-gray-300 text-sm">
                📞 0525530454
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm" dir="rtl">
              © 2024 GlobeMate – תכנון חכם לחופשות. כל התשלומים מתבצעים בקישור מאובטח בלבד.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
