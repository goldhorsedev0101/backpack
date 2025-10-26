import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Search, Loader2, Navigation, Gauge, TrendingUp, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FlightData {
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  on_ground: boolean;
  velocity: number;
  heading: number;
  vertical_rate: number;
  last_contact: string;
}

export default function FlightTrackTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [callsign, setCallsign] = useState("");
  const [flightData, setFlightData] = useState<FlightData | null>(null);

  const trackFlightMutation = useMutation({
    mutationFn: async (flightCallsign: string) => {
      const response = await apiRequest(`/api/flights/track/${flightCallsign}`);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success && data.flight) {
        setFlightData(data.flight);
        toast({
          title: t('flights.track_success'),
          description: t('flights.flight_found'),
        });
      } else {
        setFlightData(null);
        toast({
          title: t('flights.track_not_found'),
          description: data.message || t('flights.flight_not_airborne'),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('flights.track_error'),
        description: error.message || t('flights.try_again'),
        variant: "destructive",
      });
    }
  });

  const handleTrack = () => {
    if (!callsign) {
      toast({
        title: t('flights.track_error'),
        description: t('flights.enter_callsign'),
        variant: "destructive",
      });
      return;
    }
    trackFlightMutation.mutate(callsign.trim());
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-2xl border-2 border-blue-100 bg-white/95 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Navigation className="w-6 h-6" />
            {t('flights.track_flight')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="callsign" className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                <Plane className="w-5 h-5 text-blue-600" />
                {t('flights.flight_callsign')}
              </Label>
              <Input
                id="callsign"
                placeholder={t('flights.enter_callsign_placeholder')}
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="uppercase h-12 text-lg font-semibold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                data-testid="input-callsign"
              />
              <p className="text-sm text-gray-500">{t('flights.callsign_example')}</p>
            </div>

            <Button
              onClick={handleTrack}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-blue-500/50 transition-all"
              disabled={trackFlightMutation.isPending}
              data-testid="button-track-flight"
            >
              {trackFlightMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('flights.tracking')}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {t('flights.track_flight')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {flightData && (
        <Card className="shadow-xl border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Plane className="w-6 h-6" />
              {flightData.callsign}
              <Badge variant="secondary" className="ml-auto">
                {flightData.on_ground ? t('flights.on_ground') : t('flights.in_flight')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{t('flights.location')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {flightData.latitude.toFixed(4)}°, {flightData.longitude.toFixed(4)}°
                </div>
                <div className="text-sm text-gray-500">{flightData.origin_country}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">{t('flights.altitude')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(flightData.altitude)} {t('flights.meters')}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(flightData.altitude * 3.28084)} {t('flights.feet')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">{t('flights.speed')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(flightData.velocity * 3.6)} {t('flights.kmh')}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(flightData.velocity * 2.237)} {t('flights.mph')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Navigation className="w-5 h-5 text-cyan-600" />
                  <span className="font-semibold">{t('flights.heading')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(flightData.heading)}°
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">{t('flights.vertical_rate')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {flightData.vertical_rate > 0 ? '+' : ''}{flightData.vertical_rate.toFixed(1)} {t('flights.ms')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-semibold">{t('flights.last_update')}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(flightData.last_contact).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!flightData && !trackFlightMutation.isPending && (
        <Card className="text-center py-12 border-2 border-dashed border-gray-300">
          <CardContent>
            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('flights.track_flight')}</h3>
            <p className="text-gray-500">{t('flights.enter_callsign_to_track')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
