import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Backpack,
  Heart
} from 'lucide-react';

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  forecast: DailyForecast[];
}

interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  precipitationChance: number;
  windSpeed: number;
  humidity: number;
}

interface TravelRecommendation {
  destination: string;
  country: string;
  bestMonths: string[];
  avoidMonths: string[];
  currentCondition: 'excellent' | 'good' | 'fair' | 'poor';
  reasons: string[];
  activities: {
    recommended: string[];
    avoid: string[];
  };
  packingTips: string[];
  healthWarnings: string[];
}

interface WeatherWidgetProps {
  destination: string;
  country?: string;
  showRecommendations?: boolean;
}

export function WeatherWidget({ destination, country = 'Peru', showRecommendations = true }: WeatherWidgetProps) {
  const [activeTab, setActiveTab] = useState('current');

  const { data: weatherData, isLoading: weatherLoading, error: weatherError } = useQuery<WeatherData>({
    queryKey: ['/api/weather', destination, country],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${destination}?country=${country}`);
      if (!response.ok) {
        throw new Error('Weather data not available');
      }
      return response.json();
    },
    enabled: !!destination,
    retry: 1
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<TravelRecommendation>({
    queryKey: ['/api/weather', destination, 'recommendations', country],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${destination}/recommendations?country=${country}`);
      if (!response.ok) {
        throw new Error('Recommendations not available');
      }
      return response.json();
    },
    enabled: !!destination && showRecommendations,
    retry: 1
  });

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return <Sun className="w-8 h-8 text-yellow-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Perfect Travel Weather';
      case 'good': return 'Great Travel Conditions';
      case 'fair': return 'Decent Travel Weather';
      case 'poor': return 'Challenging Conditions';
      default: return 'Weather Conditions';
    }
  };

  if (weatherLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (weatherError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Weather data is currently unavailable. Please check back later or verify the destination name.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {destination} Weather & Travel Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
            {showRecommendations && <TabsTrigger value="recommendations">Travel Tips</TabsTrigger>}
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {weatherData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg">
                  {getWeatherIcon(weatherData.condition)}
                  <div>
                    <h3 className="text-2xl font-bold">{weatherData.temperature}°C</h3>
                    <p className="text-gray-600 capitalize">{weatherData.condition}</p>
                    <p className="text-sm text-gray-500">{weatherData.location}, {weatherData.country}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="font-semibold">{weatherData.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="font-semibold">{weatherData.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            {weatherData?.forecast && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                    {getWeatherIcon(day.condition)}
                    <div className="text-center mt-2">
                      <p className="font-semibold">{day.tempMax}°/{day.tempMin}°</p>
                      <p className="text-xs text-gray-500 capitalize">{day.condition}</p>
                      <p className="text-xs text-blue-600">{day.precipitationChance}% rain</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {showRecommendations && (
            <TabsContent value="recommendations" className="space-y-4">
              {recommendationsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : recommendations ? (
                <div className="space-y-6">
                  {/* Current Travel Condition */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${getConditionColor(recommendations.currentCondition)}`}></div>
                    <div>
                      <h3 className="font-semibold">{getConditionText(recommendations.currentCondition)}</h3>
                      <p className="text-sm text-gray-600">{recommendations.reasons.join(', ')}</p>
                    </div>
                  </div>

                  {/* Best Travel Months */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Best Travel Months
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.bestMonths.map((month, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Months to Avoid
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.avoidMonths.map((month, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-500" />
                        Recommended Activities
                      </h4>
                      <ul className="text-sm space-y-1">
                        {recommendations.activities.recommended.map((activity, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Backpack className="w-4 h-4 text-purple-500" />
                        Packing Tips
                      </h4>
                      <ul className="text-sm space-y-1">
                        {recommendations.packingTips.map((tip, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Info className="w-3 h-3 text-blue-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Health Warnings */}
                  {recommendations.healthWarnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Health & Safety:</strong> {recommendations.healthWarnings.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Travel recommendations are currently unavailable for this destination.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}