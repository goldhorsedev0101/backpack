import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Search, MapPin, Calendar, Thermometer, Info } from 'lucide-react';

const SOUTH_AMERICAN_DESTINATIONS = [
  { name: 'Lima', country: 'Peru', description: 'Coastal capital with year-round mild weather' },
  { name: 'Cusco', country: 'Peru', description: 'High altitude city, gateway to Machu Picchu' },
  { name: 'Bogota', country: 'Colombia', description: 'High-altitude capital with cool temperatures' },
  { name: 'Cartagena', country: 'Colombia', description: 'Tropical Caribbean coast' },
  { name: 'Buenos Aires', country: 'Argentina', description: 'Temperate climate, opposite seasons' },
  { name: 'Mendoza', country: 'Argentina', description: 'Wine region with continental climate' },
  { name: 'Rio de Janeiro', country: 'Brazil', description: 'Tropical climate with beach weather' },
  { name: 'Sao Paulo', country: 'Brazil', description: 'Subtropical climate, urban environment' },
  { name: 'Santiago', country: 'Chile', description: 'Mediterranean climate, mountain views' },
  { name: 'Valparaiso', country: 'Chile', description: 'Coastal city with mild temperatures' },
  { name: 'La Paz', country: 'Bolivia', description: 'Highest capital city in the world' },
  { name: 'Uyuni', country: 'Bolivia', description: 'Desert climate, famous salt flats' },
  { name: 'Quito', country: 'Ecuador', description: 'Equatorial highland climate' },
  { name: 'Montevideo', country: 'Uruguay', description: 'Temperate oceanic climate' },
  { name: 'Asuncion', country: 'Paraguay', description: 'Subtropical climate with wet summers' }
];

const TRAVEL_SEASONS = [
  {
    season: 'Dry Season (May-September)',
    description: 'Best for hiking, outdoor activities, and clear mountain views',
    destinations: ['Cusco', 'Quito', 'La Paz', 'Uyuni'],
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    season: 'Summer (December-March)',
    description: 'Perfect for beaches, coastal activities, and warm weather',
    destinations: ['Rio de Janeiro', 'Buenos Aires', 'Santiago', 'Montevideo'],
    color: 'bg-orange-100 text-orange-800'
  },
  {
    season: 'Year-Round',
    description: 'Stable climate suitable for travel any time of year',
    destinations: ['Lima', 'Bogota', 'Cartagena', 'Quito'],
    color: 'bg-green-100 text-green-800'
  }
];

export default function WeatherPage() {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleDestinationSelect = (destination: string) => {
    const dest = SOUTH_AMERICAN_DESTINATIONS.find(d => d.name === destination);
    if (dest) {
      setSelectedDestination(destination);
      setSelectedCountry(dest.country);
      setShowCustom(false);
    }
  };

  const handleCustomSearch = () => {
    if (customDestination.trim()) {
      setSelectedDestination(customDestination.trim());
      setSelectedCountry('Peru'); // Default country
      setShowCustom(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">South America Weather Guide</h1>
          <p className="text-xl text-gray-600">
            Get real-time weather data and travel recommendations for your South American adventure
          </p>
        </div>

        {/* Destination Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Choose Your Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Select Popular Destinations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Popular Destinations</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {SOUTH_AMERICAN_DESTINATIONS.slice(0, 10).map((dest) => (
                  <Button
                    key={dest.name}
                    variant={selectedDestination === dest.name ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-1"
                    onClick={() => handleDestinationSelect(dest.name)}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{dest.name}</span>
                    <span className="text-xs text-gray-500">{dest.country}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Search */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Search Custom Destination</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city name (e.g., Machu Picchu, Amazon)"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                />
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peru">Peru</SelectItem>
                    <SelectItem value="Colombia">Colombia</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="Chile">Chile</SelectItem>
                    <SelectItem value="Bolivia">Bolivia</SelectItem>
                    <SelectItem value="Ecuador">Ecuador</SelectItem>
                    <SelectItem value="Uruguay">Uruguay</SelectItem>
                    <SelectItem value="Paraguay">Paraguay</SelectItem>
                    <SelectItem value="Venezuela">Venezuela</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCustomSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        {selectedDestination && (
          <WeatherWidget
            destination={selectedDestination}
            country={selectedCountry}
            showRecommendations={true}
          />
        )}

        {/* Travel Seasons Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              South America Travel Seasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRAVEL_SEASONS.map((season, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={season.color}>{season.season}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{season.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Best Destinations:</h4>
                    <div className="flex flex-wrap gap-1">
                      {season.destinations.map((dest, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Climate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Climate Zones in South America
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Coastal Desert</h4>
                <p className="text-sm text-blue-700">Lima, Ica</p>
                <p className="text-xs text-blue-600">Dry, mild temperatures year-round</p>
              </div>
              <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Tropical</h4>
                <p className="text-sm text-green-700">Amazon, Cartagena</p>
                <p className="text-xs text-green-600">Hot, humid, rainy seasons</p>
              </div>
              <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">Highland</h4>
                <p className="text-sm text-purple-700">Cusco, Quito, La Paz</p>
                <p className="text-xs text-purple-600">Cool, dry winters, wet summers</p>
              </div>
              <div className="space-y-2 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800">Temperate</h4>
                <p className="text-sm text-orange-700">Buenos Aires, Santiago</p>
                <p className="text-xs text-orange-600">Four distinct seasons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Weather-Based Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Altitude Considerations</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Cusco (3,399m): Arrive 2-3 days early for acclimatization</li>
                  <li>• La Paz (3,500m): World's highest capital city</li>
                  <li>• Quito (2,850m): Mild temperatures due to altitude</li>
                  <li>• Uyuni (3,656m): Extreme temperature variations</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Seasonal Variations</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Southern Hemisphere: Seasons opposite to Northern</li>
                  <li>• Equatorial regions: Minimal seasonal variation</li>
                  <li>• Patagonia: Extreme weather, layered clothing essential</li>
                  <li>• Amazon: Wet season (Dec-May), dry season (Jun-Nov)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}