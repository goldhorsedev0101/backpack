import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const sections = [
    {
      id: "1",
      title: t("terms.sections.acceptance.title"),
      content: t("terms.sections.acceptance.content")
    },
    {
      id: "2",
      title: t("terms.sections.services.title"),
      content: t("terms.sections.services.content")
    },
    {
      id: "3",
      title: t("terms.sections.account.title"),
      content: t("terms.sections.account.content")
    },
    {
      id: "4",
      title: t("terms.sections.user_content.title"),
      content: t("terms.sections.user_content.content")
    },
    {
      id: "5",
      title: t("terms.sections.prohibited.title"),
      content: t("terms.sections.prohibited.content")
    },
    {
      id: "6",
      title: t("terms.sections.intellectual.title"),
      content: t("terms.sections.intellectual.content")
    },
    {
      id: "7",
      title: t("terms.sections.third_party.title"),
      content: t("terms.sections.third_party.content")
    },
    {
      id: "8",
      title: t("terms.sections.disclaimer.title"),
      content: t("terms.sections.disclaimer.content")
    },
    {
      id: "9",
      title: t("terms.sections.limitation.title"),
      content: t("terms.sections.limitation.content")
    },
    {
      id: "10",
      title: t("terms.sections.termination.title"),
      content: t("terms.sections.termination.content")
    },
    {
      id: "11",
      title: t("terms.sections.changes.title"),
      content: t("terms.sections.changes.content")
    },
    {
      id: "12",
      title: t("terms.sections.governing.title"),
      content: t("terms.sections.governing.content")
    },
    {
      id: "13",
      title: t("terms.sections.contact.title"),
      content: t("terms.sections.contact.content")
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-terms-title">{t("terms.title")}</h1>
          <p className="text-lg text-gray-600" data-testid="text-terms-updated">{t("terms.last_updated", { date: "11/10/2025" })}</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-8">
            {sections.map((section) => (
              <div key={section.id} data-testid={`terms-section-${section.id}`}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("terms.contact_email")}: <a href="mailto:support@globemate.co.il" className="text-primary hover:underline" data-testid="link-terms-email">support@globemate.co.il</a>
          </p>
        </div>
      </div>
    </div>
  );
}
