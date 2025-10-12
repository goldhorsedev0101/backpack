import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const sections = [
    {
      id: "1",
      title: t("privacy.sections.intro.title"),
      content: t("privacy.sections.intro.content")
    },
    {
      id: "2",
      title: t("privacy.sections.collection.title"),
      content: t("privacy.sections.collection.content")
    },
    {
      id: "3",
      title: t("privacy.sections.usage.title"),
      content: t("privacy.sections.usage.content")
    },
    {
      id: "4",
      title: t("privacy.sections.sharing.title"),
      content: t("privacy.sections.sharing.content")
    },
    {
      id: "5",
      title: t("privacy.sections.security.title"),
      content: t("privacy.sections.security.content")
    },
    {
      id: "6",
      title: t("privacy.sections.cookies.title"),
      content: t("privacy.sections.cookies.content")
    },
    {
      id: "7",
      title: t("privacy.sections.rights.title"),
      content: t("privacy.sections.rights.content")
    },
    {
      id: "8",
      title: t("privacy.sections.children.title"),
      content: t("privacy.sections.children.content")
    },
    {
      id: "9",
      title: t("privacy.sections.changes.title"),
      content: t("privacy.sections.changes.content")
    },
    {
      id: "10",
      title: t("privacy.sections.contact.title"),
      content: t("privacy.sections.contact.content")
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-privacy-title">{t("privacy.title")}</h1>
          <p className="text-lg text-gray-600" data-testid="text-privacy-updated">{t("privacy.last_updated", { date: "11/10/2025" })}</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-8">
            {sections.map((section) => (
              <div key={section.id} data-testid={`privacy-section-${section.id}`}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("privacy.contact_email")}: <a href="mailto:support@globemate.co.il" className="text-primary hover:underline" data-testid="link-privacy-email">support@globemate.co.il</a>
          </p>
        </div>
      </div>
    </div>
  );
}
