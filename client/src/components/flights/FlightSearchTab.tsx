import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Plane, Calendar, Users, Search, Clock, TrendingDown, Loader2, MapPin, Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { airports } from "@/data/airports";
import { cn } from "@/lib/utils";

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

export default function FlightSearchTab() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'he';

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [tripType, setTripType] = useState<"round_trip" | "one_way">("round_trip");
  const [offers, setOffers] = useState<FlightOffer[]>([]);

  const searchFlightsMutation = useMutation({
    mutationFn: async (searchParams: any) => {
      const response = await apiRequest('/api/flights/search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data: any) => {
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
      passengers: { adults, children },
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

  const getStopsText = (segments: any[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return t('flights.direct');
    if (stops === 1) return `1 ${t('flights.stop')}`;
    return `${stops} ${t('flights.stops_plural')}`;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="shadow-2xl border-2 border-blue-100 bg-white/95 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Search className="w-6 h-6" />
            {t('flights.search_flights')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-6">
            <div className="flex gap-4 justify-center">
              <Button
                variant={tripType === 'round_trip' ? 'default' : 'outline'}
                onClick={() => setTripType('round_trip')}
                className={tripType === 'round_trip' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-8 py-6 text-lg font-semibold' 
                  : 'border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 px-8 py-6 text-lg font-semibold'
                }
                data-testid="button-round-trip"
              >
                {t('flights.round_trip')}
              </Button>
              <Button
                variant={tripType === 'one_way' ? 'default' : 'outline'}
                onClick={() => setTripType('one_way')}
                className={tripType === 'one_way' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-8 py-6 text-lg font-semibold' 
                  : 'border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 px-8 py-6 text-lg font-semibold'
                }
                data-testid="button-one-way"
              >
                {t('flights.one_way')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {t('flights.from')}
                </Label>
                <Popover open={originOpen} onOpenChange={setOriginOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={originOpen}
                      className={`w-full h-12 justify-between border-2 border-gray-300 hover:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      data-testid="select-origin"
                    >
                      {origin
                        ? (() => {
                            const airport = airports.find((a) => a.code === origin);
                            const displayCity = isRTL && airport?.cityHe ? airport.cityHe : airport?.city;
                            return `${displayCity} (${origin})`;
                          })()
                        : t('flights.select_origin')}
                      <ChevronsUpDown className={`h-4 w-4 shrink-0 opacity-50 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Command dir={isRTL ? 'rtl' : 'ltr'}>
                      <CommandInput placeholder={t('flights.search_airport')} className={isRTL ? 'text-right' : ''} />
                      <CommandList>
                        <CommandEmpty className={isRTL ? 'text-right' : ''}>{t('flights.no_airport_found')}</CommandEmpty>
                        <CommandGroup>
                          {airports.map((airport) => {
                            const displayCity = isRTL && airport.cityHe ? airport.cityHe : airport.city;
                            const displayName = isRTL && airport.nameHe ? airport.nameHe : airport.name;
                            const displayCountry = isRTL && airport.countryHe ? airport.countryHe : airport.country;
                            return (
                              <CommandItem
                                key={airport.code}
                                value={`${airport.city} ${airport.cityHe || ''} ${airport.name} ${airport.nameHe || ''} ${airport.code}`}
                                onSelect={() => {
                                  setOrigin(airport.code);
                                  setOriginOpen(false);
                                }}
                                className={`${isRTL ? 'flex-row-reverse' : ''}`}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    isRTL ? "ml-2" : "mr-2",
                                    origin === airport.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className={`flex flex-col w-full ${isRTL ? 'items-end' : 'items-start'}`}>
                                  <span className="font-semibold">{displayCity} ({airport.code})</span>
                                  <span className="text-xs text-gray-500">{displayName}, {displayCountry}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {t('flights.to')}
                </Label>
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={destinationOpen}
                      className={`w-full h-12 justify-between border-2 border-gray-300 hover:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      data-testid="select-destination"
                    >
                      {destination
                        ? (() => {
                            const airport = airports.find((a) => a.code === destination);
                            const displayCity = isRTL && airport?.cityHe ? airport.cityHe : airport?.city;
                            return `${displayCity} (${destination})`;
                          })()
                        : t('flights.select_destination')}
                      <ChevronsUpDown className={`h-4 w-4 shrink-0 opacity-50 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Command dir={isRTL ? 'rtl' : 'ltr'}>
                      <CommandInput placeholder={t('flights.search_airport')} className={isRTL ? 'text-right' : ''} />
                      <CommandList>
                        <CommandEmpty className={isRTL ? 'text-right' : ''}>{t('flights.no_airport_found')}</CommandEmpty>
                        <CommandGroup>
                          {airports.map((airport) => {
                            const displayCity = isRTL && airport.cityHe ? airport.cityHe : airport.city;
                            const displayName = isRTL && airport.nameHe ? airport.nameHe : airport.name;
                            const displayCountry = isRTL && airport.countryHe ? airport.countryHe : airport.country;
                            return (
                              <CommandItem
                                key={airport.code}
                                value={`${airport.city} ${airport.cityHe || ''} ${airport.name} ${airport.nameHe || ''} ${airport.code}`}
                                onSelect={() => {
                                  setDestination(airport.code);
                                  setDestinationOpen(false);
                                }}
                                className={`${isRTL ? 'flex-row-reverse' : ''}`}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    isRTL ? "ml-2" : "mr-2",
                                    destination === airport.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className={`flex flex-col w-full ${isRTL ? 'items-end' : 'items-start'}`}>
                                  <span className="font-semibold">{displayCity} ({airport.code})</span>
                                  <span className="text-xs text-gray-500">{displayName}, {displayCountry}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departure" className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  {t('flights.departure_date')}
                </Label>
                <Input
                  id="departure"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={today}
                  className="h-12 border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  data-testid="input-departure-date"
                />
              </div>
              {tripType === 'round_trip' && (
                <div className="space-y-2">
                  <Label htmlFor="return" className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    {t('flights.return_date')}
                  </Label>
                  <Input
                    id="return"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || today}
                    className="h-12 border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                    data-testid="input-return-date"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adults" className="flex items-center gap-2 h-6 text-base font-semibold text-gray-700">
                  <Users className="w-5 h-5 text-indigo-600" />
                  {t('flights.adults')}
                </Label>
                <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
                  <SelectTrigger data-testid="select-adults" className="h-12 border-2 border-gray-300">
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
                <Label htmlFor="children" className="h-6 flex items-center text-base font-semibold text-gray-700">{t('flights.children')}</Label>
                <Select value={String(children)} onValueChange={(v) => setChildren(Number(v))}>
                  <SelectTrigger data-testid="select-children" className="h-12 border-2 border-gray-300">
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
                <Label htmlFor="cabin" className="h-6 flex items-center text-base font-semibold text-gray-700">{t('flights.cabin_class')}</Label>
                <Select value={cabinClass} onValueChange={setCabinClass}>
                  <SelectTrigger data-testid="select-cabin-class" className="h-12 border-2 border-gray-300">
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

            <div className="pt-4">
              <Button
                onClick={handleSearch}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={searchFlightsMutation.isPending}
                data-testid="button-search-flights"
              >
                {searchFlightsMutation.isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    {t('flights.searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 mr-3" />
                    {t('flights.search')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {offers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('flights.found_flights', { count: offers.length })}
            </h2>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <TrendingDown className="w-4 h-4 mr-2" />
              {t('flights.price')}
            </Badge>
          </div>

          <div className="space-y-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                    <div className="lg:col-span-3 p-6 space-y-6">
                      {offer.slices.map((slice, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={idx === 0 ? "default" : "secondary"} className="text-xs">
                              {idx === 0 ? t('flights.outbound') : t('flights.return')}
                            </Badge>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-center flex-1">
                                <div className="text-3xl font-bold text-gray-900">{slice.origin.iata_code}</div>
                                <div className="text-sm font-medium text-gray-600 mt-1">
                                  {new Date(slice.segments[0].departing_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="flex flex-col items-center flex-1 px-4">
                                <div className="flex items-center gap-2 w-full">
                                  <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                  <Plane className="w-5 h-5 text-blue-600 transform rotate-90" />
                                  <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">{formatDuration(slice.duration)}</span>
                                </div>
                                <Badge variant="outline" className="mt-1 text-xs">{getStopsText(slice.segments)}</Badge>
                              </div>
                              <div className="text-center flex-1">
                                <div className="text-3xl font-bold text-gray-900">{slice.destination.iata_code}</div>
                                <div className="text-sm font-medium text-gray-600 mt-1">
                                  {new Date(slice.segments[slice.segments.length - 1].arriving_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-4 h-4" />
                              <span className="font-medium">{slice.segments[0]?.operating_carrier?.name || 'Airline'}</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{slice.segments[0]?.aircraft?.name || 'Aircraft'}</span>
                          </div>
                          {idx < offer.slices.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                    </div>
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center gap-4 border-t lg:border-t-0">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">{t('flights.total')}</div>
                        <div className="text-4xl font-bold text-blue-600">
                          {offer.total_currency === 'ILS' ? '₪' : '$'}{offer.total_amount}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{t('flights.per_person')}</div>
                      </div>
                      <Button 
                        onClick={() => navigate(`/flights/booking/${offer.id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all" 
                        size="lg"
                      >
                        {t('flights.book_now')}
                      </Button>
                      <div className="text-xs text-gray-500 text-center">
                        <div>{t('flights.operated_by')}</div>
                        <div className="font-medium text-gray-700">{offer.owner.name}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!searchFlightsMutation.isPending && offers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('flights.search_flights')}</h3>
            <p className="text-gray-500">{t('flights.subtitle')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
