import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Search, Navigation, Calendar, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightSearchTab from "@/components/flights/FlightSearchTab";
import FlightTrackTab from "@/components/flights/FlightTrackTab";
import CurrentBookingsTab from "@/components/flights/CurrentBookingsTab";
import PastBookingsTab from "@/components/flights/PastBookingsTab";

export default function FlightsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className={`min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t('flights.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-700 font-medium">
            {t('flights.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gradient-to-r from-white via-blue-50 to-white p-3 rounded-2xl shadow-2xl border-2 border-blue-100 gap-2">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:scale-105 transition-all duration-300 font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              data-testid="tab-search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">{t('flights.tab_search')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="track" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:scale-105 transition-all duration-300 font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              data-testid="tab-track"
            >
              <Navigation className="w-5 h-5" />
              <span className="hidden sm:inline">{t('flights.tab_track')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="current" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:scale-105 transition-all duration-300 font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              data-testid="tab-current"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">{t('flights.tab_current_bookings')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:hover:scale-105 transition-all duration-300 font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2"
              data-testid="tab-past"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">{t('flights.tab_past_bookings')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-0">
            <FlightSearchTab />
          </TabsContent>

          <TabsContent value="track" className="mt-0">
            <FlightTrackTab />
          </TabsContent>

          <TabsContent value="current" className="mt-0">
            <CurrentBookingsTab />
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <PastBookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
