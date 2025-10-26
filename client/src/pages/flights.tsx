import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Calendar, Users, Search, Clock, TrendingDown, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FlightOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Array<{
    origin: { iata_code: string; city_name?: string };
    destination: { iata_code: string; city_name?: string };
    duration: string;
    segments: Array<{
      origin: { iata_code: string };
      destination: { iata_code: string };
      departing_at: string;
      arriving_at: string;
      operating_carrier: { name: string; iata_code: string };
      aircraft: { name: string };
      duration: string;
    }>;
  }>;
  owner: { name: string };
}

export default function FlightsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const { toast } = useToast();

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [tripType, setTripType] = useState<"round_trip" | "one_way">("round_trip");

  const [offers, setOffers] = useState<FlightOffer[]>([]);

  // Search flights mutation
  const searchFlightsMutation = useMutation({
    mutationFn: async (searchParams: any) => {
      console.log('Searching flights with params:', searchParams);
      const response = await apiRequest('/api/flights/search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('Flight search response:', data);
      return data;
    },
    onSuccess: (data: any) => {
      console.log('Flight search success:', data);
      if (data.offers && data.offers.length > 0) {
        setOffers(data.offers);
        toast({
          title: t('flights.results'),
          description: t('flights.found_flights', { count: data.offers.length }),
        });
      } else {
        setOffers([]);
        toast({
          title: t('flights.no_results'),
          description: t('flights.try_different_search'),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Flight search error:', error);
      console.error('Error details:', error.stack || error.toString());
      toast({
        title: t('flights.search_error'),
        description: error.message || t('flights.try_again'),
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!origin || !destination || !departureDate) {
      toast({
        title: t('flights.search_error'),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    searchFlightsMutation.mutate({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      passengers: {
        adults,
        children
      },
      cabinClass
    });
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString(i18n.language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStopsText = (segments: any[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return t('flights.direct');
    if (stops === 1) return `1 ${t('flights.stop')}`;
    return `${stops} ${t('flights.stops_plural')}`;
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              {t('flights.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {t('flights.subtitle')}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('flights.search_flights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Trip Type */}
              <div className="flex gap-4">
                <Button
                  variant={tripType === 'round_trip' ? 'default' : 'outline'}
                  onClick={() => setTripType('round_trip')}
                  data-testid="button-round-trip"
                >
                  {t('flights.round_trip')}
                </Button>
                <Button
                  variant={tripType === 'one_way' ? 'default' : 'outline'}
                  onClick={() => setTripType('one_way')}
                  data-testid="button-one-way"
                >
                  {t('flights.one_way')}
                </Button>
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('flights.from')}
                  </Label>
                  <Input
                    id="origin"
                    placeholder={t('flights.enter_origin')}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="uppercase"
                    maxLength={3}
                    data-testid="input-origin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('flights.to')}
                  </Label>
                  <Input
                    id="destination"
                    placeholder={t('flights.enter_destination')}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="uppercase"
                    maxLength={3}
                    data-testid="input-destination"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('flights.departure_date')}
                  </Label>
                  <Input
                    id="departure"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={today}
                    data-testid="input-departure-date"
                  />
                </div>
                {tripType === 'round_trip' && (
                  <div className="space-y-2">
                    <Label htmlFor="return" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('flights.return_date')}
                    </Label>
                    <Input
                      id="return"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={departureDate || today}
                      data-testid="input-return-date"
                    />
                  </div>
                )}
              </div>

              {/* Passengers and Cabin Class */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('flights.adults')}
                  </Label>
                  <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
                    <SelectTrigger data-testid="select-adults">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">{t('flights.children')}</Label>
                  <Select value={String(children)} onValueChange={(v) => setChildren(Number(v))}>
                    <SelectTrigger data-testid="select-children">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cabin">{t('flights.cabin_class')}</Label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger data-testid="select-cabin-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">{t('flights.economy')}</SelectItem>
                      <SelectItem value="premium_economy">{t('flights.premium_economy')}</SelectItem>
                      <SelectItem value="business">{t('flights.business')}</SelectItem>
                      <SelectItem value="first">{t('flights.first')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="w-full"
                size="lg"
                disabled={searchFlightsMutation.isPending}
                data-testid="button-search-flights"
              >
                {searchFlightsMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('flights.searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    {t('flights.search')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {offers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('flights.results')} ({offers.length})
              </h2>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <TrendingDown className="w-4 h-4 mr-2" />
                {t('flights.price')}
              </Badge>
            </div>

            <div className="space-y-4">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow" data-testid={`card-flight-${offer.id}`}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      {/* Flight Info */}
                      <div className="md:col-span-3 space-y-4">
                        {offer.slices.map((slice, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{slice.origin.iata_code}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(slice.segments[0].departing_at)}
                                  </div>
                                </div>
                                <div className="flex flex-col items-center">
                                  <Clock className="w-4 h-4 text-gray-400 mb-1" />
                                  <div className="text-sm text-gray-600">{formatDuration(slice.duration)}</div>
                                  <div className="text-xs text-gray-500">{getStopsText(slice.segments)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{slice.destination.iata_code}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(slice.segments[slice.segments.length - 1].arriving_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Plane className="w-4 h-4" />
                              <span>{slice.segments[0].operating_carrier.name}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{slice.segments[0].aircraft.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Price and Action */}
                      <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="text-center md:text-right">
                          <div className="text-3xl font-bold text-blue-600">
                            {offer.total_currency === 'ILS' ? '₪' : '$'}{offer.total_amount}
                          </div>
                          <div className="text-sm text-gray-500">{t('flights.per_person')}</div>
                        </div>
                        <Button className="w-full" data-testid={`button-book-${offer.id}`}>
                          {t('flights.book_now')}
                        </Button>
                        <div className="text-xs text-gray-500 text-center">
                          {t('flights.operated_by')} {offer.owner.name}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchFlightsMutation.isPending && offers.length === 0 && !searchFlightsMutation.isSuccess && (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('flights.search_flights')}
              </h3>
              <p className="text-gray-500">
                {t('flights.subtitle')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
