import { FEATURE_FLAGS } from '../config/featureFlags';

export interface CountryInfo {
  name: string;
  capital: string;
  currency: string;
  languages: string[];
  timezone: string;
  region: string;
  flag: string;
}

export class GeoService {
  async getCountryInfo(countryCode: string): Promise<CountryInfo | null> {
    if (!FEATURE_FLAGS.ENABLE_REST_COUNTRIES) {
      return this.getStubCountryInfo(countryCode);
    }

    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const data = await response.json();
      const country = data[0];

      return {
        name: country.name.common,
        capital: country.capital?.[0] || 'N/A',
        currency: Object.values(country.currencies || {})[0]?.name || 'N/A',
        languages: Object.values(country.languages || {}),
        timezone: country.timezones?.[0] || 'N/A',
        region: country.region,
        flag: country.flag,
      };
    } catch (error) {
      console.error('Country info error:', error);
      return this.getStubCountryInfo(countryCode);
    }
  }

  async getPlaceCoordinates(placeName: string): Promise<{ lat: number; lon: number } | null> {
    if (!FEATURE_FLAGS.ENABLE_GEONAMES) {
      return this.getStubCoordinates(placeName);
    }

    // GeoNames implementation would go here
    return this.getStubCoordinates(placeName);
  }

  private getStubCountryInfo(countryCode: string): CountryInfo {
    const stubs: Record<string, CountryInfo> = {
      US: {
        name: 'United States',
        capital: 'Washington, D.C.',
        currency: 'US Dollar',
        languages: ['English'],
        timezone: 'UTC-5 to UTC-10',
        region: 'Americas',
        flag: '🇺🇸',
      },
      FR: {
        name: 'France',
        capital: 'Paris',
        currency: 'Euro',
        languages: ['French'],
        timezone: 'UTC+1',
        region: 'Europe',
        flag: '🇫🇷',
      },
      JP: {
        name: 'Japan',
        capital: 'Tokyo',
        currency: 'Japanese Yen',
        languages: ['Japanese'],
        timezone: 'UTC+9',
        region: 'Asia',
        flag: '🇯🇵',
      },
    };

    return stubs[countryCode] || {
      name: 'Unknown',
      capital: 'Unknown',
      currency: 'Unknown',
      languages: ['Unknown'],
      timezone: 'UTC',
      region: 'Unknown',
      flag: '🏳️',
    };
  }

  private getStubCoordinates(placeName: string): { lat: number; lon: number } {
    const coords: Record<string, { lat: number; lon: number }> = {
      Paris: { lat: 48.8566, lon: 2.3522 },
      Tokyo: { lat: 35.6762, lon: 139.6503 },
      'New York': { lat: 40.7128, lon: -74.0060 },
      Barcelona: { lat: 41.3874, lon: 2.1686 },
    };

    return coords[placeName] || { lat: 0, lon: 0 };
  }
}

export const geoService = new GeoService();
