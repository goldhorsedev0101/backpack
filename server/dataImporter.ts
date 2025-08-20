import { Database } from 'sqlite3';
import { drizzle } from 'drizzle-orm/postgres-js';
import { accommodations, attractions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

// Types for collector data
interface CollectorPlace {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  website: string;
  phone: string;
  types: string; // JSON string
  summary: string;
  created_at: string;
  updated_at: string;
}

interface CollectorReview {
  id: string;
  place_id: string;
  source: string;
  rating: number;
  text: string;
  lang: string;
  published_at: string;
  author: string;
  url: string;
}

/**
 * Import data from TripWise Collector SQLite database to main PostgreSQL database
 */
export async function importCollectorData() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }

  // Connect to PostgreSQL
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  // Connect to collector SQLite database
  const collectorDb = new Database('tripwise/tripwise.db');
  
  try {
    // Get all places from collector
    const places = await new Promise<CollectorPlace[]>((resolve, reject) => {
      collectorDb.all(`
        SELECT place_id, name, address, lat, lng, rating, reviews_count, 
               website, phone, types, summary, created_at, updated_at 
        FROM places
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as CollectorPlace[]);
      });
    });

    console.log(`Found ${places.length} places to import`);

    let imported = 0;
    let accommodationsCount = 0;
    let attractionsCount = 0;
    let restaurantsCount = 0;

    for (const place of places) {
      try {
        const types = JSON.parse(place.types || '[]');
        const placeTypes = Array.isArray(types) ? types : [types];
        
        // Determine category based on types
        const isAccommodation = placeTypes.some(type => 
          type.includes('hostel') || 
          type.includes('lodging') || 
          type.includes('hotel') ||
          type.includes('accommodation')
        );
        
        const isAttraction = placeTypes.some(type =>
          type.includes('tourist_attraction') ||
          type.includes('museum') ||
          type.includes('park') ||
          type.includes('landmark')
        );
        
        const isRestaurant = placeTypes.some(type =>
          type.includes('restaurant') ||
          type.includes('food') ||
          type.includes('cafe') ||
          type.includes('bar')
        );

        // Add to destinations first
        const country = extractCountryFromAddress(place.address);
        const city = extractCityFromAddress(place.address);
        
        if (city && country) {
          try {
            await db.insert(destinations).values({
              name: city,
              country: country,
              description: place.summary || `Discover ${city} in ${country}`,
              latitude: place.lat,
              longitude: place.lng,
              bestTimeToVisit: 'Year-round',
              averageTemperature: 20,
              costLevel: 'budget'
            }).onConflictDoNothing();
          } catch (e) {
            // Destination might already exist
          }
        }

        // Insert into appropriate table
        if (isAccommodation) {
          await db.insert(accommodations).values({
            name: place.name,
            type: determineAccommodationType(placeTypes),
            location: city || extractLocationFromAddress(place.address),
            country: country || 'Unknown',
            priceRange: '$',
            rating: place.rating,
            description: place.summary || `${place.name} accommodation`,
            amenities: [],
            contactInfo: place.phone || '',
            website: place.website || '',
            latitude: place.lat,
            longitude: place.lng,
            googlePlaceId: place.place_id
          });
          accommodationsCount++;
          
        } else if (isAttraction) {
          await db.insert(attractions).values({
            name: place.name,
            type: 'sightseeing',
            location: city || extractLocationFromAddress(place.address),
            country: country || 'Unknown',
            description: place.summary || `${place.name} attraction`,
            rating: place.rating,
            priceRange: '$',
            openingHours: '',
            website: place.website || '',
            latitude: place.lat,
            longitude: place.lng,
            googlePlaceId: place.place_id
          });
          attractionsCount++;
          
        } else if (isRestaurant) {
          await db.insert(restaurants).values({
            name: place.name,
            cuisine: 'local',
            location: city || extractLocationFromAddress(place.address),
            country: country || 'Unknown',
            priceRange: '$',
            rating: place.rating,
            description: place.summary || `${place.name} restaurant`,
            specialties: [],
            website: place.website || '',
            latitude: place.lat,
            longitude: place.lng,
            googlePlaceId: place.place_id
          });
          restaurantsCount++;
        }

        imported++;
        
      } catch (error) {
        console.error(`Error importing place ${place.place_id}:`, error);
      }
    }

    console.log(`Import completed:
      - Total places processed: ${places.length}
      - Successfully imported: ${imported}
      - Accommodations: ${accommodationsCount}
      - Attractions: ${attractionsCount}  
      - Restaurants: ${restaurantsCount}`);

    return { imported, accommodationsCount, attractionsCount, restaurantsCount };
    
  } finally {
    collectorDb.close();
    await client.end();
  }
}

function extractCountryFromAddress(address: string): string {
  if (!address) return 'Unknown';
  
  const countries: { [key: string]: string } = {
    'Peru': 'Peru',
    'Colombia': 'Colombia', 
    'Ecuador': 'Ecuador',
    'Bolivia': 'Bolivia',
    'Chile': 'Chile',
    'Argentina': 'Argentina',
    'Brazil': 'Brazil',
    'Uruguay': 'Uruguay',
    'Paraguay': 'Paraguay'
  };
  
  for (const [key, value] of Object.entries(countries)) {
    if (address.includes(key)) {
      return value;
    }
  }
  
  return 'South America';
}

function extractCityFromAddress(address: string): string {
  if (!address) return 'Unknown';
  
  // Extract city from address - usually the first part before comma
  const parts = address.split(',');
  if (parts.length > 1) {
    const city = parts[parts.length - 2].trim();
    return city;
  }
  
  return parts[0].trim();
}

function extractLocationFromAddress(address: string): string {
  if (!address) return 'Unknown';
  return address.split(',')[0].trim();
}

function determineAccommodationType(types: string[]): string {
  const typeStr = types.join(' ').toLowerCase();
  
  if (typeStr.includes('hostel')) return 'hostel';
  if (typeStr.includes('hotel')) return 'hotel';
  if (typeStr.includes('lodge')) return 'lodge';
  if (typeStr.includes('guesthouse')) return 'guesthouse';
  
  return 'hostel'; // Default for backpacker-focused data
}

// Run import if called directly
if (require.main === module) {
  importCollectorData()
    .then((result) => {
      console.log('Import successful:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}