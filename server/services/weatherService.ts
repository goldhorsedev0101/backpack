import { FEATURE_FLAGS } from '../config/featureFlags';

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
}

export interface WeatherForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
}

export class WeatherService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    if (!FEATURE_FLAGS.ENABLE_OPENWEATHER || !this.apiKey) {
      // Return stub data
      return this.getStubWeather();
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
      );
      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getStubWeather();
    }
  }

  async getForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    if (!FEATURE_FLAGS.ENABLE_OPENWEATHER || !this.apiKey) {
      return this.getStubForecast();
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
      );
      const data = await response.json();

      const dailyForecasts: WeatherForecast[] = [];
      const processedDates = new Set();

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!processedDates.has(date) && dailyForecasts.length < 5) {
          processedDates.add(date);
          dailyForecasts.push({
            date,
            temp_max: Math.round(item.main.temp_max),
            temp_min: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          });
        }
      }

      return dailyForecasts;
    } catch (error) {
      console.error('Forecast API error:', error);
      return this.getStubForecast();
    }
  }

  private getStubWeather(): WeatherData {
    return {
      temperature: 24,
      feels_like: 26,
      humidity: 65,
      description: 'Partly cloudy',
      icon: '02d',
      wind_speed: 12,
    };
  }

  private getStubForecast(): WeatherForecast[] {
    return [
      { date: 'Today', temp_max: 26, temp_min: 18, description: 'Sunny', icon: '01d' },
      { date: 'Tomorrow', temp_max: 25, temp_min: 17, description: 'Partly cloudy', icon: '02d' },
      { date: 'Day 3', temp_max: 23, temp_min: 16, description: 'Cloudy', icon: '03d' },
      { date: 'Day 4', temp_max: 22, temp_min: 15, description: 'Light rain', icon: '10d' },
      { date: 'Day 5', temp_max: 24, temp_min: 17, description: 'Sunny', icon: '01d' },
    ];
  }
}

export const weatherService = new WeatherService();
