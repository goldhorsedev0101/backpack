import { FEATURE_FLAGS } from '../config/featureFlags';

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  price_per_night: number;
  currency: string;
  amenities: string[];
  photo_url?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  duration: string;
}

export class TboService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TBO_API_KEY;
  }

  async searchHotels(
    destination: string,
    checkIn: string,
    checkOut: string
  ): Promise<HotelResult[]> {
    if (!FEATURE_FLAGS.ENABLE_TBO || !this.apiKey) {
      return this.getStubHotels(destination);
    }

    // Real TBO API implementation would go here
    return this.getStubHotels(destination);
  }

  async searchFlights(
    origin: string,
    destination: string,
    date: string
  ): Promise<FlightResult[]> {
    if (!FEATURE_FLAGS.ENABLE_TBO || !this.apiKey) {
      return this.getStubFlights(origin, destination);
    }

    // Real TBO API implementation would go here
    return this.getStubFlights(origin, destination);
  }

  async getPackages(destination: string): Promise<any[]> {
    if (!FEATURE_FLAGS.ENABLE_TBO || !this.apiKey) {
      return this.getStubPackages(destination);
    }

    return this.getStubPackages(destination);
  }

  private getStubHotels(destination: string): HotelResult[] {
    return [
      {
        id: 'hotel-1',
        name: 'Grand Plaza Hotel',
        address: `123 Main St, ${destination}`,
        rating: 4.5,
        price_per_night: 150,
        currency: 'USD',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      },
      {
        id: 'hotel-2',
        name: 'Boutique Inn',
        address: `456 Central Ave, ${destination}`,
        rating: 4.3,
        price_per_night: 120,
        currency: 'USD',
        amenities: ['WiFi', 'Breakfast', 'Bar'],
      },
      {
        id: 'hotel-3',
        name: 'Budget Stay',
        address: `789 Park Rd, ${destination}`,
        rating: 3.8,
        price_per_night: 75,
        currency: 'USD',
        amenities: ['WiFi', 'Parking'],
      },
    ];
  }

  private getStubFlights(origin: string, destination: string): FlightResult[] {
    return [
      {
        id: 'flight-1',
        airline: 'SkyWings Airlines',
        departure: `${origin} 10:00 AM`,
        arrival: `${destination} 2:30 PM`,
        price: 350,
        currency: 'USD',
        duration: '4h 30m',
      },
      {
        id: 'flight-2',
        airline: 'Global Air',
        departure: `${origin} 2:00 PM`,
        arrival: `${destination} 6:30 PM`,
        price: 280,
        currency: 'USD',
        duration: '4h 30m',
      },
    ];
  }

  private getStubPackages(destination: string): any[] {
    return [
      {
        id: 'pkg-1',
        name: `${destination} Explorer - 5 Days`,
        price: 899,
        currency: 'USD',
        includes: ['Hotel', 'Guided Tours', 'Some Meals'],
      },
      {
        id: 'pkg-2',
        name: `${destination} Luxury Escape - 7 Days`,
        price: 1599,
        currency: 'USD',
        includes: ['5-Star Hotel', 'All Meals', 'Private Tours', 'Transfers'],
      },
    ];
  }
}

export const tboService = new TboService();
