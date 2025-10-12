import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Target, Users, Heart, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const values = [
    {
      icon: Globe,
      title: t("about.values.global.title"),
      description: t("about.values.global.description")
    },
    {
      icon: Users,
      title: t("about.values.community.title"),
      description: t("about.values.community.description")
    },
    {
      icon: Target,
      title: t("about.values.innovation.title"),
      description: t("about.values.innovation.description")
    },
    {
      icon: Heart,
      title: t("about.values.passion.title"),
      description: t("about.values.passion.description")
    }
  ];

  const stats = [
    { value: "70+", label: t("about.stats.countries") },
    { value: "2", label: t("about.stats.languages") },
    { value: "24/7", label: t("about.stats.support") },
    { value: "100%", label: t("about.stats.satisfaction") }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-about-title">{t("about.title")}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-testid="text-about-subtitle">{t("about.subtitle")}</p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl text-center">{t("about.mission.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-lg text-center leading-relaxed" data-testid="text-mission">
              {t("about.mission.content")}
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center" data-testid={`stat-${index}`}>
              <CardContent className="pt-6">
                <h3 className="text-4xl font-bold text-primary mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8" data-testid="text-values-title">{t("about.values.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`value-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">{t("about.story.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed" data-testid="text-story-1">
              {t("about.story.paragraph1")}
            </p>
            <p className="text-gray-600 leading-relaxed" data-testid="text-story-2">
              {t("about.story.paragraph2")}
            </p>
            <p className="text-gray-600 leading-relaxed" data-testid="text-story-3">
              {t("about.story.paragraph3")}
            </p>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4" data-testid="text-cta-title">{t("about.cta.title")}</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{t("about.cta.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:support@globemate.co.il" className="flex items-center gap-2 text-primary hover:underline" data-testid="link-about-email">
                <Mail className="w-5 h-5" />
                support@globemate.co.il
              </a>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <a href="tel:+972525530454" className="flex items-center gap-2 text-primary hover:underline" data-testid="link-about-phone">
                <Phone className="w-5 h-5" />
                0525530454
              </a>
            </div>
            <div className="mt-6">
              <Button asChild size="lg" data-testid="button-contact-about">
                <Link href="/contact">{t("about.cta.button")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
