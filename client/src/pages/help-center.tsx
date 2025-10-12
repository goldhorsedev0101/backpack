import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, HelpCircle, Book, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HelpCenter() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const faqs = [
    {
      id: "1",
      question: t("help.faq.trip_planning.question"),
      answer: t("help.faq.trip_planning.answer")
    },
    {
      id: "2",
      question: t("help.faq.budget_tracking.question"),
      answer: t("help.faq.budget_tracking.answer")
    },
    {
      id: "3",
      question: t("help.faq.community.question"),
      answer: t("help.faq.community.answer")
    },
    {
      id: "4",
      question: t("help.faq.destinations.question"),
      answer: t("help.faq.destinations.answer")
    },
    {
      id: "5",
      question: t("help.faq.account.question"),
      answer: t("help.faq.account.answer")
    },
    {
      id: "6",
      question: t("help.faq.languages.question"),
      answer: t("help.faq.languages.answer")
    }
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: t("help.contact.email.title"),
      value: "support@globemate.co.il",
      link: "mailto:support@globemate.co.il"
    },
    {
      icon: Phone,
      title: t("help.contact.phone.title"),
      value: "0525530454",
      link: "tel:+972525530454"
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-help-title">{t("help.title")}</h1>
          <p className="text-lg text-gray-600" data-testid="text-help-subtitle">{t("help.subtitle")}</p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <option.icon className="w-6 h-6 text-primary" />
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={option.link} 
                  className="text-lg font-semibold text-primary hover:underline"
                  data-testid={`link-${option.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {option.value}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Book className="w-7 h-7 text-primary" />
              {t("help.faq.title")}
            </CardTitle>
            <CardDescription>{t("help.faq.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-trigger-faq-${faq.id}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600" data-testid={`accordion-content-faq-${faq.id}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              {t("help.need_more_help")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{t("help.contact_description")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild data-testid="button-contact-us">
                <Link href="/contact">{t("help.contact_us_button")}</Link>
              </Button>
              <Button variant="outline" asChild data-testid="button-community">
                <Link href="/community">{t("help.community_button")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
