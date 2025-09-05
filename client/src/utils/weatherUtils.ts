// Weather API client utilities - uses server-side weather API

export interface WeatherData {
  id: string; // Changed to string to match UUID
  temperature: number;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
  lastUpdated: string;
}

interface Destination {
  id: string; // Changed to string to match UUID
  name: string;
  lat: number;
  lon: number;
}

class WeatherClient {
  async getWeatherForDestinations(destinations: Destination[]): Promise<Map<string, WeatherData>> {
    console.log('🌤️ WeatherClient: getWeatherForDestinations called with', destinations.length, 'destinations');
    const weatherData = new Map<string, WeatherData>();
    
    // Filter destinations with valid coordinates
    const validDestinations = destinations.filter(dest => 
      dest.lat !== undefined && 
      dest.lon !== undefined && 
      !isNaN(dest.lat) && 
      !isNaN(dest.lon)
    );

    console.log('🌤️ WeatherClient: valid destinations filtered:', validDestinations.length);

    if (validDestinations.length === 0) {
      console.log('🌤️ WeatherClient: no valid destinations, returning empty map');
      return weatherData;
    }
    
    try {
      console.log('🌤️ WeatherClient: calling /api/weather/batch with:', validDestinations);
      
      // Call our server's batch weather endpoint
      const response = await fetch('/api/weather/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinations: validDestinations }),
      });
      
      console.log('🌤️ WeatherClient: response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌤️ WeatherClient: API error response:', errorText);
        throw new Error(`Weather API request failed: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🌤️ WeatherClient: received data:', data);
      
      // Convert response back to Map
      for (const [id, weather] of Object.entries(data)) {
        weatherData.set(id, weather as WeatherData); // Keep as string, no parsing needed
      }
      
      console.log('🌤️ WeatherClient: final weather map size:', weatherData.size);
      
    } catch (error) {
      console.error('🌤️ WeatherClient: Failed to get weather data:', error);
    }
    
    return weatherData;
  }
}

export const weatherClient = new WeatherClient();