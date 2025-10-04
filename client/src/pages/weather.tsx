import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Search, MapPin, Calendar, Thermometer, Info } from 'lucide-react';
import { CONTINENTS, getCountriesByContinent, getContinentByCountry, type Continent } from "@/lib/constants";
import { useLocalizedPlaceNames } from "@/hooks/useLocalization";

const getWorldDestinations = () => ({
  // Europe
  'France': ['Paris', 'Lyon', 'Nice', 'Marseille', 'Bordeaux'],
  'Italy': ['Rome', 'Venice', 'Florence', 'Milan', 'Naples'],
  'Spain': ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Granada'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Liverpool', 'Oxford'],
  'Greece': ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Madeira', 'Azores'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Switzerland': ['Zurich', 'Geneva', 'Bern', 'Lucerne', 'Interlaken'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Hallstatt'],
  
  // Asia
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
  'China': ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou', 'Chengdu'],
  'South Korea': ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Gyeongju'],
  'India': ['Delhi', 'Mumbai', 'Jaipur', 'Agra', 'Goa'],
  'Indonesia': ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Sumatra'],
  'Vietnam': ['Hanoi', 'Ho Chi Minh City', 'Ha Long Bay', 'Hoi An', 'Da Nang'],
  'Singapore': ['Singapore City', 'Sentosa', 'Marina Bay', 'Orchard Road', 'Clarke Quay'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Kota Kinabalu'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  
  // North America
  'United States': ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'San Francisco'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary'],
  'Mexico': ['Cancun', 'Mexico City', 'Playa del Carmen', 'Puerto Vallarta', 'Cabo San Lucas'],
  
  // South America
  'Peru': ['Lima', 'Cusco', 'Machu Picchu', 'Arequipa', 'Iquitos'],
  'Colombia': ['Bogota', 'Cartagena', 'Medellin', 'Cali', 'Santa Marta'],
  'Argentina': ['Buenos Aires', 'Mendoza', 'Bariloche', 'Salta', 'Cordoba'],
  'Brazil': ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia', 'Florianopolis'],
  'Chile': ['Santiago', 'Valparaiso', 'Valdivia', 'Puerto Varas', 'Punta Arenas'],
  'Bolivia': ['La Paz', 'Uyuni', 'Sucre', 'Potosi', 'Copacabana'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Galapagos', 'Montanita'],
  'Uruguay': ['Montevideo', 'Punta del Este', 'Colonia', 'Salto', 'Piriapolis'],
  'Paraguay': ['Asuncion', 'Ciudad del Este', 'Encarnacion', 'San Bernardino', 'Villarrica'],
  
  // Oceania
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'],
  'New Zealand': ['Auckland', 'Wellington', 'Queenstown', 'Christchurch', 'Rotorua'],
  
  // Africa
  'Egypt': ['Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Hurghada'],
  'Morocco': ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'],
  'Kenya': ['Nairobi', 'Mombasa', 'Masai Mara', 'Nakuru', 'Kisumu'],
  'Tanzania': ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Serengeti', 'Kilimanjaro'],
  
  // Caribbean
  'Jamaica': ['Kingston', 'Montego Bay', 'Ocho Rios', 'Negril', 'Port Antonio'],
  'Cuba': ['Havana', 'Varadero', 'Santiago de Cuba', 'Trinidad', 'Vinales'],
  'Dominican Republic': ['Santo Domingo', 'Punta Cana', 'Puerto Plata', 'La Romana', 'Samana'],
  'Bahamas': ['Nassau', 'Paradise Island', 'Freeport', 'Exuma', 'Grand Bahama']
});

export default function WeatherPage() {
  const { t } = useTranslation();
  const { getPlaceName } = useLocalizedPlaceNames();
  const [selectedContinent, setSelectedContinent] = useState<Continent | ''>('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const WORLD_DESTINATIONS = getWorldDestinations();
  
  // Get available countries for selected continent
  const availableCountries = selectedContinent 
    ? getCountriesByContinent(selectedContinent).filter(country => WORLD_DESTINATIONS[country as keyof typeof WORLD_DESTINATIONS])
    : [];
  
  // Get available cities for selected country
  const availableCities = selectedCountry 
    ? (WORLD_DESTINATIONS[selectedCountry as keyof typeof WORLD_DESTINATIONS] || [])
    : [];

  // Get popular cities from selected continent (for quick select)
  const popularCities = selectedContinent
    ? availableCountries.slice(0, 3).flatMap(country => 
        (WORLD_DESTINATIONS[country as keyof typeof WORLD_DESTINATIONS] || []).slice(0, 2).map(city => ({
          name: city,
          country
        }))
      )
    : [];

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent as Continent);
    setSelectedCountry('');
    setSelectedCity('');
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
  };

  const handleCitySelect = (city: string, country: string) => {
    setSelectedCity(city);
    setSelectedCountry(country);
    const detectedContinent = getContinentByCountry(country);
    if (detectedContinent && !selectedContinent) {
      setSelectedContinent(detectedContinent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{t('weather.page_title')}</h1>
          <p className="text-xl text-gray-600">
            {t('weather.page_subtitle')}
          </p>
        </div>

        {/* Destination Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('weather.choose_destination')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Continent, Country, City Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Continent Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('trips.select_continent')}
                  </label>
                  <Select value={selectedContinent} onValueChange={handleContinentChange}>
                    <SelectTrigger data-testid="select-continent">
                      <SelectValue placeholder={t('trips.select_continent')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {t(`trips.continents.${continent.toLowerCase().replace(/ /g, '_')}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('trips.select_country')}
                  </label>
                  <Select 
                    value={selectedCountry} 
                    onValueChange={handleCountryChange}
                    disabled={!selectedContinent}
                  >
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder={t('trips.select_country')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {getPlaceName(country, country, 'destinations')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('weather.select_city')}
                  </label>
                  <Select 
                    value={selectedCity} 
                    onValueChange={(city) => handleCitySelect(city, selectedCountry)}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger data-testid="select-city">
                      <SelectValue placeholder={t('weather.select_city')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Select Popular Cities (if continent selected) */}
            {popularCities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">{t('weather.popular_cities')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {popularCities.map((dest) => (
                    <Button
                      key={`${dest.name}-${dest.country}`}
                      variant={selectedCity === dest.name ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                      onClick={() => handleCitySelect(dest.name, dest.country)}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{dest.name}</span>
                      <span className="text-xs text-gray-500">{dest.country}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Widget */}
        {selectedCity && selectedCountry && (
          <WeatherWidget
            destination={selectedCity}
            country={selectedCountry}
            showRecommendations={true}
          />
        )}
      </div>
    </div>
  );
}