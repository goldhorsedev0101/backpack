import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: t("contact.success.title"),
      description: t("contact.success.description"),
    });
    
    reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t("contact.info.email"),
      value: "support@globemate.co.il",
      link: "mailto:support@globemate.co.il"
    },
    {
      icon: Phone,
      title: t("contact.info.phone"),
      value: "0525530454",
      link: "tel:+972525530454"
    },
    {
      icon: MapPin,
      title: t("contact.info.location"),
      value: t("contact.info.israel"),
      link: null
    },
    {
      icon: Clock,
      title: t("contact.info.hours"),
      value: t("contact.info.hours_value"),
      link: null
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-contact-title">{t("contact.title")}</h1>
          <p className="text-lg text-gray-600" data-testid="text-contact-subtitle">{t("contact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Send className="w-6 h-6 text-primary" />
                {t("contact.form.title")}
              </CardTitle>
              <CardDescription>{t("contact.form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("contact.form.name")}</Label>
                  <Input
                    id="name"
                    {...register("name", { required: true })}
                    placeholder={t("contact.form.name_placeholder")}
                    data-testid="input-contact-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{t("contact.form.required")}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">{t("contact.form.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    placeholder={t("contact.form.email_placeholder")}
                    data-testid="input-contact-email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{t("contact.form.email_invalid")}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                  <Input
                    id="subject"
                    {...register("subject", { required: true })}
                    placeholder={t("contact.form.subject_placeholder")}
                    data-testid="input-contact-subject"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500 mt-1">{t("contact.form.required")}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">{t("contact.form.message")}</Label>
                  <Textarea
                    id="message"
                    {...register("message", { required: true })}
                    placeholder={t("contact.form.message_placeholder")}
                    rows={6}
                    data-testid="input-contact-message"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1">{t("contact.form.required")}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  {isSubmitting ? t("contact.form.sending") : t("contact.form.send")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.info.title")}</CardTitle>
                <CardDescription>{t("contact.info.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4" data-testid={`contact-info-${index}`}>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">{info.title}</h3>
                      {info.link ? (
                        <a href={info.link} className="text-primary hover:underline">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">{t("contact.quick_response.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{t("contact.quick_response.description")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
