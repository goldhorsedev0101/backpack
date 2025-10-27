import { db } from '../server/db.js';
import { destinations } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Map of city names to their coordinates
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  // Europe
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Rome': { lat: 41.9028, lon: 12.4964 },
  'Barcelona': { lat: 41.3874, lon: 2.1686 },
  'Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'Prague': { lat: 50.0755, lon: 14.4378 },
  'Vienna': { lat: 48.2082, lon: 16.3738 },
  'Athens': { lat: 37.9838, lon: 23.7275 },
  'Lisbon': { lat: 38.7223, lon: -9.1393 },
  'Berlin': { lat: 52.5200, lon: 13.4050 },
  'Moscow': { lat: 55.7558, lon: 37.6173 },
  'Reykjavik': { lat: 64.1466, lon: -21.9426 },
  'Santorini': { lat: 36.3932, lon: 25.4615 },
  'Venice': { lat: 45.4408, lon: 12.3155 },
  'Florence': { lat: 43.7696, lon: 11.2558 },
  'Milan': { lat: 45.4642, lon: 9.1900 },
  'Madrid': { lat: 40.4168, lon: -3.7038 },
  'Seville': { lat: 37.3891, lon: -5.9845 },
  'Munich': { lat: 48.1351, lon: 11.5820 },
  'Edinburgh': { lat: 55.9533, lon: -3.1883 },
  'Dublin': { lat: 53.3498, lon: -6.2603 },
  'Copenhagen': { lat: 55.6761, lon: 12.5683 },
  'Stockholm': { lat: 59.3293, lon: 18.0686 },
  'Oslo': { lat: 59.9139, lon: 10.7522 },
  'Budapest': { lat: 47.4979, lon: 19.0402 },
  'Krakow': { lat: 50.0647, lon: 19.9450 },
  'Zurich': { lat: 47.3769, lon: 8.5417 },
  'Brussels': { lat: 50.8503, lon: 4.3517 },
  
  // Asia
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Dubai': { lat: 25.2048, lon: 55.2708 },
  'Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Istanbul': { lat: 41.0082, lon: 28.9784 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Bali': { lat: -8.4095, lon: 115.1889 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Seoul': { lat: 37.5665, lon: 126.9780 },
  'Hong Kong': { lat: 22.3193, lon: 114.1694 },
  'Kyoto': { lat: 35.0116, lon: 135.7681 },
  'Shanghai': { lat: 31.2304, lon: 121.4737 },
  'Beijing': { lat: 39.9042, lon: 116.4074 },
  'Hanoi': { lat: 21.0285, lon: 105.8542 },
  'Ho Chi Minh City': { lat: 10.8231, lon: 106.6297 },
  'Kuala Lumpur': { lat: 3.1390, lon: 101.6869 },
  'Manila': { lat: 14.5995, lon: 120.9842 },
  'Jakarta': { lat: -6.2088, lon: 106.8456 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Agra': { lat: 27.1767, lon: 78.0081 },
  'Tel Aviv': { lat: 32.0853, lon: 34.7818 },
  'Jerusalem': { lat: 31.7683, lon: 35.2137 },
  'Colombo': { lat: 6.9271, lon: 79.8612 },
  'Kathmandu': { lat: 27.7172, lon: 85.3240 },
  'Phuket': { lat: 7.8804, lon: 98.3923 },
  
  // North America
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Los Angeles': { lat: 34.0522, lon: -118.2437 },
  'Miami': { lat: 25.7617, lon: -80.1918 },
  'Mexico City': { lat: 19.4326, lon: -99.1332 },
  'Las Vegas': { lat: 36.1699, lon: -115.1398 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  'Chicago': { lat: 41.8781, lon: -87.6298 },
  'Toronto': { lat: 43.6532, lon: -79.3832 },
  'Vancouver': { lat: 49.2827, lon: -123.1207 },
  'Cancun': { lat: 21.1619, lon: -86.8515 },
  'Playa del Carmen': { lat: 20.6296, lon: -87.0739 },
  'Montreal': { lat: 45.5017, lon: -73.5673 },
  
  // South America
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'Buenos Aires': { lat: -34.6037, lon: -58.3816 },
  'Lima': { lat: -12.0464, lon: -77.0428 },
  'Cusco': { lat: -13.5319, lon: -71.9675 },
  'Santiago': { lat: -33.4489, lon: -70.6693 },
  'Bogota': { lat: 4.7110, lon: -74.0721 },
  'Cartagena': { lat: 10.3910, lon: -75.4794 },
  'Medellin': { lat: 6.2442, lon: -75.5812 },
  'Quito': { lat: -0.1807, lon: -78.4678 },
  'La Paz': { lat: -16.5000, lon: -68.1500 },
  'Montevideo': { lat: -34.9011, lon: -56.1645 },
  'Sao Paulo': { lat: -23.5505, lon: -46.6333 },
  
  // Oceania
  'Sydney': { lat: -33.8688, lon: 151.2093 },
  'Melbourne': { lat: -37.8136, lon: 144.9631 },
  'Auckland': { lat: -36.8485, lon: 174.7633 },
  'Brisbane': { lat: -27.4698, lon: 153.0251 },
  'Perth': { lat: -31.9505, lon: 115.8605 },
  'Wellington': { lat: -41.2865, lon: 174.7762 },
  'Queenstown': { lat: -45.0312, lon: 168.6626 },
  'Fiji': { lat: -17.7134, lon: 178.0650 },
  
  // Africa
  'Cape Town': { lat: -33.9249, lon: 18.4241 },
  'Cairo': { lat: 30.0444, lon: 31.2357 },
  'Marrakech': { lat: 31.6295, lon: -7.9811 },
  'Nairobi': { lat: -1.2864, lon: 36.8172 },
  'Johannesburg': { lat: -26.2041, lon: 28.0473 },
  'Casablanca': { lat: 33.5731, lon: -7.5898 },
  'Luxor': { lat: 25.6872, lon: 32.6396 },
  'Zanzibar': { lat: -6.1659, lon: 39.2026 },
  'Tunis': { lat: 36.8065, lon: 10.1815 },
  'Mauritius': { lat: -20.1609, lon: 57.5012 },
  
  // Caribbean
  'Punta Cana': { lat: 18.5601, lon: -68.3725 },
  'Havana': { lat: 23.1136, lon: -82.3666 },
  'Nassau': { lat: 25.0443, lon: -77.3504 },
  'Montego Bay': { lat: 18.4762, lon: -77.8937 },
  'San Juan': { lat: 18.4655, lon: -66.1057 },
  'Santo Domingo': { lat: 18.4861, lon: -69.9312 },
};

async function updateCoordinates() {
  console.log('Starting to update destination coordinates...');
  
  // Get all destinations with zero coordinates
  const destinationsToUpdate = await db
    .select()
    .from(destinations)
    .where(eq(destinations.lat, 0));
  
  console.log(`Found ${destinationsToUpdate.length} destinations with zero coordinates`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const destination of destinationsToUpdate) {
    const coords = cityCoordinates[destination.name];
    
    if (coords) {
      await db
        .update(destinations)
        .set({
          lat: coords.lat,
          lon: coords.lon,
        })
        .where(eq(destinations.id, destination.id));
      
      console.log(`✓ Updated ${destination.name}: ${coords.lat}, ${coords.lon}`);
      updated++;
    } else {
      console.log(`✗ Skipped ${destination.name}: coordinates not found`);
      skipped++;
    }
  }
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${destinationsToUpdate.length}`);
}

updateCoordinates()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error updating coordinates:', error);
    process.exit(1);
  });
