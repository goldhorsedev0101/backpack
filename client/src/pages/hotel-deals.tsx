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
import { useTranslation } from "react-i18next";
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
  MessageCircle,
} from "lucide-react";

export default function HotelDeals() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
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
    whatsappConsent: false,
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Submitting data:", data);
      return await apiRequest("/api/hotel-inquiries", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: t("hotel_deals.success_title"),
        description: t("hotel_deals.success_description"),
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
        whatsappConsent: false,
      });
    },
    onError: (error: any) => {
      console.error("Submission error:", error);
      toast({
        title: t("hotel_deals.error_title"),
        description: error?.message || t("hotel_deals.error_description"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.destination ||
      !formData.checkIn ||
      !formData.checkOut ||
      !formData.phone ||
      !formData.email ||
      !formData.budget
    ) {
      toast({
        title: t("hotel_deals.validation_missing_title"),
        description: t("hotel_deals.validation_missing_description"),
        variant: "destructive",
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
        title: t("hotel_deals.validation_date_title"),
        description: t("hotel_deals.validation_checkin_future"),
        variant: "destructive",
      });
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast({
        title: t("hotel_deals.validation_date_title"),
        description: t("hotel_deals.validation_checkout_after"),
        variant: "destructive",
      });
      return;
    }

    submitInquiry.mutate(formData);
  };

  const scrollToForm = () => {
    document
      .getElementById("quote-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop)",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-4xl flex flex-col items-center justify-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-center">
              {t("hotel_deals.hero_title")} ✈️
            </h1>
            <p className="text-xl md:text-2xl text-center text-white/90 mb-8 leading-relaxed">
              {t("hotel_deals.hero_description")}
            </p>
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 py-6 h-auto"
              data-testid="button-scroll-to-form"
            >
              <Search className="mr-2 h-6 w-6" />
              {t("hotel_deals.quick_check_button")}
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div
              className="text-center flex flex-col items-center justify-center"
              data-testid="trust-wholesale"
            >
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {t("hotel_deals.trust_wholesale_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("hotel_deals.trust_wholesale_desc")}
              </p>
            </div>

            <div
              className="text-center flex flex-col items-center justify-center"
              data-testid="trust-boutique"
            >
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {t("hotel_deals.trust_boutique_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("hotel_deals.trust_boutique_desc")}
              </p>
            </div>

            <div
              className="text-center flex flex-col items-center justify-center"
              data-testid="trust-secure"
            >
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {t("hotel_deals.trust_secure_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("hotel_deals.trust_secure_desc")}
              </p>
            </div>

            <div
              className="text-center flex flex-col items-center justify-center"
              data-testid="trust-cancellation"
            >
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {t("hotel_deals.trust_cancellation_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("hotel_deals.trust_cancellation_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-600">
            {t("hotel_deals.how_it_works_title")}
          </h2>

          <div className="space-y-8">
            {[
              {
                icon: <Send className="h-8 w-8" />,
                title: t("hotel_deals.step1_title"),
                desc: t("hotel_deals.step1_desc"),
                testId: "step-submit",
              },
              {
                icon: <Search className="h-8 w-8" />,
                title: t("hotel_deals.step2_title"),
                desc: t("hotel_deals.step2_desc"),
                testId: "step-search",
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: t("hotel_deals.step3_title"),
                desc: t("hotel_deals.step3_desc"),
                testId: "step-receive",
              },
              {
                icon: <CreditCard className="h-8 w-8" />,
                title: t("hotel_deals.step4_title"),
                desc: t("hotel_deals.step4_desc"),
                testId: "step-payment",
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: t("hotel_deals.step5_title"),
                desc: t("hotel_deals.step5_desc"),
                testId: "step-confirmed",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-6"
                data-testid={step.testId}
              >
                <div className="flex-shrink-0">
                  <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-shrink-0 bg-orange-100 p-4 rounded-lg">
                  <div className="text-orange-600">{step.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
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
            <CardContent className="p-8" dir={isRTL ? "rtl" : "ltr"}>
              <h2 className="text-3xl font-bold mb-2 text-orange-600 text-center">
                {t("hotel_deals.form_title")}
              </h2>
              <p className="text-gray-600 text-center mb-8">
                {t("hotel_deals.form_subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Destination */}
                <div>
                  <Label
                    htmlFor="destination"
                    className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                  >
                    {t("hotel_deals.form_destination_label")}
                  </Label>
                  <Input
                    id="destination"
                    placeholder={t("hotel_deals.form_destination_placeholder")}
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    required
                    className={isRTL ? "text-right" : "text-left"}
                    data-testid="input-destination"
                  />
                </div>

                {/* Check-in and Check-out */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div>
                    <Label
                      htmlFor="checkIn"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_checkin_label")}
                    </Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) =>
                        setFormData({ ...formData, checkIn: e.target.value })
                      }
                      required
                      className={isRTL ? "text-right" : "text-left"}
                      data-testid="input-check-in"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="checkOut"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_checkout_label")}
                    </Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) =>
                        setFormData({ ...formData, checkOut: e.target.value })
                      }
                      required
                      className={isRTL ? "text-right" : "text-left"}
                      data-testid="input-check-out"
                    />
                  </div>
                </div>

                {/* Adults and Children */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div>
                    <Label
                      htmlFor="adults"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_adults_label")}
                    </Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.adults}
                      onChange={(e) =>
                        setFormData({ ...formData, adults: e.target.value })
                      }
                      className={isRTL ? "text-right" : "text-left"}
                      data-testid="input-adults"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="children"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_children_label")}
                    </Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.children}
                      onChange={(e) =>
                        setFormData({ ...formData, children: e.target.value })
                      }
                      className={isRTL ? "text-right" : "text-left"}
                      data-testid="input-children"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label
                    htmlFor="budget"
                    className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                  >
                    {t("hotel_deals.form_budget_label")}
                  </Label>
                  <Input
                    id="budget"
                    placeholder={t("hotel_deals.form_budget_placeholder")}
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    required
                    className={isRTL ? "text-right" : "text-left"}
                    data-testid="input-budget"
                  />
                </div>

                {/* Contact Details */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div>
                    <Label
                      htmlFor="phone"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_phone_label")}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("hotel_deals.form_phone_placeholder")}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className={isRTL ? "text-right" : "text-left"}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                    >
                      {t("hotel_deals.form_email_label")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("hotel_deals.form_email_placeholder")}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="text-left"
                      dir="ltr"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label
                    htmlFor="notes"
                    className={`block mb-2 ${isRTL ? "" : "text-left"}`}
                  >
                    {t("hotel_deals.form_notes_label")}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t("hotel_deals.form_notes_placeholder")}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className={isRTL ? "text-right" : "text-left"}
                    data-testid="textarea-notes"
                  />
                </div>

                {/* WhatsApp Consent */}
                <div className={`flex items-start gap-3 ${isRTL ? "" : ""}`}>
                  <Checkbox
                    id="whatsapp"
                    checked={formData.whatsappConsent}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        whatsappConsent: checked as boolean,
                      })
                    }
                    data-testid="checkbox-whatsapp"
                  />
                  <label
                    htmlFor="whatsapp"
                    className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    {t("hotel_deals.form_whatsapp_consent")}
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
                      <Clock className="mr-2 h-5 w-5 animate-spin" />
                      {t("hotel_deals.form_submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      {t("hotel_deals.form_submit_button")}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  {t("hotel_deals.form_privacy_text")}{" "}
                  <a href="/privacy" className="text-orange-600 underline">
                    {t("hotel_deals.form_privacy_link")}
                  </a>{" "}
                  {t("hotel_deals.form_and")}{" "}
                  <a href="/terms" className="text-orange-600 underline">
                    {t("hotel_deals.form_terms_link")}
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
          <h2 className="text-4xl font-bold text-center mb-12 text-teal-600">
            {t("hotel_deals.testimonials_title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card data-testid="testimonial-1">
              <CardContent className="p-6">
                <div className={`flex gap-1 mb-4 ${isRTL ? "" : ""}`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "{t("hotel_deals.testimonial1_text")}"
                </p>
                <p className="font-bold text-sm">
                  {t("hotel_deals.testimonial1_name")}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="testimonial-2">
              <CardContent className="p-6">
                <div className={`flex gap-1 mb-4 ${isRTL ? "" : ""}`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "{t("hotel_deals.testimonial2_text")}"
                </p>
                <p className="font-bold text-sm">
                  {t("hotel_deals.testimonial2_name")}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="testimonial-3">
              <CardContent className="p-6">
                <div className={`flex gap-1 mb-4 ${isRTL ? "" : ""}`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "{t("hotel_deals.testimonial3_text")}"
                </p>
                <p className="font-bold text-sm">
                  {t("hotel_deals.testimonial3_name")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
