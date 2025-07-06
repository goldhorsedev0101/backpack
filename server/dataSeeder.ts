import { storage } from './storage';
import type { InsertDestination, InsertAccommodation, InsertAttraction, InsertRestaurant, InsertLocationReview } from '@shared/schema';

// Enhanced South American destinations with comprehensive data
export const southAmericanDestinations: InsertDestination[] = [
  {
    locationId: 'dest_lima_peru',
    name: 'Lima',
    country: 'Peru',
    region: 'Lima Region',
    description: 'Peru\'s vibrant capital blending colonial architecture with modern gastronomy, historic districts, and Pacific coastline.',
    latitude: -12.0464,
    longitude: -77.0428,
    timezone: 'America/Lima',
    currency: 'PEN',
    language: 'Spanish',
    bestTimeToVisit: 'April to October (dry season)',
    averageTemperature: 19,
    population: 10750000,
    attractions: ['Historic Center', 'Miraflores', 'Barranco', 'Larco Museum', 'Magic Water Circuit'],
    activities: ['Food tours', 'Surfing', 'Museum visits', 'Colonial architecture walks', 'Night markets'],
    tags: ['gastronomy', 'colonial', 'coastal', 'museums', 'nightlife']
  },
  {
    locationId: 'dest_cusco_peru',
    name: 'Cusco',
    country: 'Peru',
    region: 'Cusco Region',
    description: 'Ancient Inca capital and gateway to Machu Picchu, featuring cobblestone streets, Inca ruins, and vibrant indigenous culture.',
    latitude: -13.5319,
    longitude: -71.9675,
    timezone: 'America/Lima',
    currency: 'PEN',
    language: 'Spanish, Quechua',
    bestTimeToVisit: 'May to September (dry season)',
    averageTemperature: 13,
    population: 428450,
    attractions: ['Machu Picchu', 'Sacsayhuamán', 'Qorikancha', 'San Pedro Market', 'Pisac ruins'],
    activities: ['Inca Trail hiking', 'Sacred Valley tours', 'Traditional weaving workshops', 'Coca tea ceremonies', 'Alpaca farm visits'],
    tags: ['inca', 'hiking', 'cultural', 'mountains', 'spiritual']
  },
  {
    locationId: 'dest_bogota_colombia',
    name: 'Bogotá',
    country: 'Colombia',
    region: 'Cundinamarca',
    description: 'Colombia\'s dynamic capital nestled in the Andes, famous for emeralds, street art, coffee culture, and vibrant nightlife.',
    latitude: 4.7110,
    longitude: -74.0721,
    timezone: 'America/Bogota',
    currency: 'COP',
    language: 'Spanish',
    bestTimeToVisit: 'December to March, July to August',
    averageTemperature: 14,
    population: 7412566,
    attractions: ['La Candelaria', 'Monserrate', 'Gold Museum', 'Botero Museum', 'Zona Rosa'],
    activities: ['Street art tours', 'Coffee plantation visits', 'Emerald shopping', 'Salsa dancing', 'Cable car to Monserrate'],
    tags: ['street-art', 'coffee', 'emeralds', 'nightlife', 'mountains']
  },
  {
    locationId: 'dest_cartagena_colombia',
    name: 'Cartagena',
    country: 'Colombia',
    region: 'Bolívar',
    description: 'UNESCO World Heritage colonial port city with colorful architecture, Caribbean beaches, and romantic atmosphere.',
    latitude: 10.3910,
    longitude: -75.4794,
    timezone: 'America/Bogota',
    currency: 'COP',
    language: 'Spanish',
    bestTimeToVisit: 'December to April (dry season)',
    averageTemperature: 28,
    population: 1028736,
    attractions: ['Old Town', 'Castillo San Felipe', 'Rosario Islands', 'Las Bóvedas', 'Clock Tower'],
    activities: ['Colonial walking tours', 'Island hopping', 'Sunset from city walls', 'Rum tasting', 'Caribbean beach time'],
    tags: ['colonial', 'caribbean', 'romantic', 'beaches', 'unesco']
  },
  {
    locationId: 'dest_lapaz_bolivia',
    name: 'La Paz',
    country: 'Bolivia',
    region: 'La Paz Department',
    description: 'World\'s highest capital city with indigenous culture, dramatic mountain scenery, and unique urban landscapes.',
    latitude: -16.5000,
    longitude: -68.1193,
    timezone: 'America/La_Paz',
    currency: 'BOB',
    language: 'Spanish, Aymara, Quechua',
    bestTimeToVisit: 'May to October (dry season)',
    averageTemperature: 10,
    population: 835361,
    attractions: ['Witch Market', 'Teleferico cable cars', 'Moon Valley', 'San Francisco Church', 'Rosario neighborhood'],
    activities: ['Cable car rides', 'Indigenous market visits', 'Mountain biking', 'Traditional festivals', 'Altitude acclimatization'],
    tags: ['altitude', 'indigenous', 'mountains', 'unique', 'cultural']
  },
  {
    locationId: 'dest_uyuni_bolivia',
    name: 'Uyuni',
    country: 'Bolivia',
    region: 'Potosí Department',
    description: 'Gateway to the world\'s largest salt flat, offering surreal landscapes, flamingo spotting, and stargazing.',
    latitude: -20.4598,
    longitude: -66.8251,
    timezone: 'America/La_Paz',
    currency: 'BOB',
    language: 'Spanish, Quechua',
    bestTimeToVisit: 'May to October (dry season), December to March (mirror effect)',
    averageTemperature: 8,
    population: 21815,
    attractions: ['Salar de Uyuni', 'Train Cemetery', 'Incahuasi Island', 'Flamingo Reserve', 'Salt hotels'],
    activities: ['Salt flat tours', 'Flamingo watching', 'Photography workshops', 'Stargazing', 'Quinoa farm visits'],
    tags: ['salt-flats', 'photography', 'nature', 'unique', 'desert']
  },
  {
    locationId: 'dest_santiago_chile',
    name: 'Santiago',
    country: 'Chile',
    region: 'Santiago Metropolitan',
    description: 'Modern capital surrounded by snow-capped Andes, known for wine, parks, and proximity to coast and mountains.',
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: 'America/Santiago',
    currency: 'CLP',
    language: 'Spanish',
    bestTimeToVisit: 'October to April (spring/summer)',
    averageTemperature: 15,
    population: 6257516,
    attractions: ['Cerro San Cristóbal', 'La Moneda Palace', 'Bellavista', 'Central Market', 'Museum of Memory'],
    activities: ['Wine tasting tours', 'Skiing in nearby resorts', 'City bike tours', 'Andes day trips', 'Street food markets'],
    tags: ['wine', 'modern', 'mountains', 'skiing', 'urban']
  },
  {
    locationId: 'dest_valparaiso_chile',
    name: 'Valparaíso',
    country: 'Chile',
    region: 'Valparaíso',
    description: 'UNESCO World Heritage port city famous for colorful hillside houses, street art, and bohemian culture.',
    latitude: -33.0472,
    longitude: -71.6127,
    timezone: 'America/Santiago',
    currency: 'CLP',
    language: 'Spanish',
    bestTimeToVisit: 'October to April',
    averageTemperature: 15,
    population: 296655,
    attractions: ['Historic funiculars', 'Cerro Alegre', 'Cerro Concepción', 'Port area', 'Pablo Neruda House'],
    activities: ['Street art tours', 'Funicular rides', 'Poetry walks', 'Port visits', 'Bohemian café culture'],
    tags: ['unesco', 'street-art', 'bohemian', 'historic', 'coastal']
  },
  {
    locationId: 'dest_buenosaires_argentina',
    name: 'Buenos Aires',
    country: 'Argentina',
    region: 'Buenos Aires',
    description: 'Passionate capital of tango, European architecture, world-class steakhouses, and vibrant neighborhoods.',
    latitude: -34.6118,
    longitude: -58.3960,
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
    language: 'Spanish',
    bestTimeToVisit: 'March to May, September to November',
    averageTemperature: 17,
    population: 3075646,
    attractions: ['San Telmo', 'La Boca', 'Recoleta Cemetery', 'Puerto Madero', 'Palermo'],
    activities: ['Tango shows', 'Steak dinners', 'Neighborhood walks', 'Football matches', 'Wine bars'],
    tags: ['tango', 'european', 'steakhouses', 'football', 'nightlife']
  },
  {
    locationId: 'dest_riodejaneiro_brazil',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'Rio de Janeiro',
    description: 'Marvelous city with iconic beaches, Christ the Redeemer, carnival spirit, and stunning natural beauty.',
    latitude: -22.9068,
    longitude: -43.1729,
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'Portuguese',
    bestTimeToVisit: 'April to June, August to October',
    averageTemperature: 25,
    population: 6775561,
    attractions: ['Christ the Redeemer', 'Copacabana Beach', 'Sugarloaf Mountain', 'Santa Teresa', 'Tijuca Forest'],
    activities: ['Beach volleyball', 'Samba dancing', 'Cable car rides', 'Favela tours', 'Capoeira classes'],
    tags: ['beaches', 'carnival', 'christ-redeemer', 'samba', 'natural-beauty']
  }
];

// Premium accommodations with detailed data
export const premiumAccommodations: InsertAccommodation[] = [
  {
    locationId: 'hotel_lima_luxury_001',
    name: 'Belmond Hotel Monasterio Lima',
    description: 'Luxury hotel in a restored 16th-century monastery featuring elegant colonial architecture and world-class amenities.',
    address: 'Jr. Ancash 314, Lima Centro, Lima, Peru',
    phone: '+51 1 241-6116',
    website: 'https://www.belmond.com',
    email: 'reservations.hml@belmond.com',
    latitude: -12.0432,
    longitude: -77.0323,
    rating: 4.8,
    numReviews: 2847,
    priceLevel: '$$$$',
    ranking: 1,
    awards: ['Travelers Choice 2024', 'Certificate of Excellence'],
    amenities: ['Free WiFi', 'Spa', 'Fine dining restaurant', 'Business center', 'Concierge', 'Room service', 'Air conditioning', 'Fitness center'],
    roomTypes: ['Junior Suite', 'Master Suite', 'Presidential Suite', 'Deluxe Room'],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    destinationId: 1
  },
  {
    locationId: 'hotel_cusco_historic_001',
    name: 'Inkaterra La Casona Cusco',
    description: 'Luxury boutique hotel in a beautifully restored 16th-century manor house with authentic Inca and colonial design.',
    address: 'Plazoleta Las Nazarenas 113, Cusco, Peru',
    phone: '+51 84 234-610',
    website: 'https://www.inkaterra.com',
    email: 'central@inkaterra.com',
    latitude: -13.5170,
    longitude: -71.9785,
    rating: 4.9,
    numReviews: 1923,
    priceLevel: '$$$$',
    ranking: 1,
    awards: ['World Travel Awards Winner', 'Conde Nast Gold List'],
    amenities: ['Oxygen-enriched rooms', 'Butler service', 'Spa treatments', 'Private collection museum', 'Gourmet restaurant', 'Coca tea service'],
    roomTypes: ['Master Suite', 'Junior Suite', 'Casona Suite'],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    destinationId: 2
  }
];

// Top attractions with comprehensive details
export const topAttractions: InsertAttraction[] = [
  {
    locationId: 'attraction_machupicchu_001',
    name: 'Machu Picchu',
    description: 'UNESCO World Heritage ancient Inca citadel perched high in the Andes, one of the New Seven Wonders of the World.',
    address: 'Aguas Calientes, Cusco Region, Peru',
    phone: '+51 84 211-196',
    website: 'https://www.machupicchu.gob.pe',
    email: null,
    latitude: -13.1631,
    longitude: -72.5450,
    rating: 4.9,
    numReviews: 89247,
    ranking: 1,
    awards: ['UNESCO World Heritage Site', 'New Seven Wonders of the World'],
    category: 'Historical Sites',
    subcategory: 'Ancient Ruins',
    openingHours: ['Monday: 6:00 AM - 5:30 PM', 'Tuesday: 6:00 AM - 5:30 PM', 'Wednesday: 6:00 AM - 5:30 PM', 'Thursday: 6:00 AM - 5:30 PM', 'Friday: 6:00 AM - 5:30 PM', 'Saturday: 6:00 AM - 5:30 PM', 'Sunday: 6:00 AM - 5:30 PM'],
    admissionPrice: 'From $45 USD',
    duration: 'Full day',
    destinationId: 2
  },
  {
    locationId: 'attraction_goldmuseum_bogota_001',
    name: 'Museo del Oro (Gold Museum)',
    description: 'World\'s most important collection of pre-Hispanic gold artifacts, showcasing Colombia\'s rich indigenous heritage.',
    address: 'Carrera 6 # 15-88, La Candelaria, Bogotá, Colombia',
    phone: '+57 1 343-2222',
    website: 'https://www.banrepcultural.org/museo-del-oro',
    email: 'museoro@banrep.gov.co',
    latitude: 4.6097,
    longitude: -74.0817,
    rating: 4.7,
    numReviews: 34521,
    ranking: 1,
    awards: ['TripAdvisor Certificate of Excellence', 'Colombian National Heritage'],
    category: 'Museums',
    subcategory: 'History Museums',
    openingHours: ['Monday: Closed', 'Tuesday: 9:00 AM - 6:00 PM', 'Wednesday: 9:00 AM - 6:00 PM', 'Thursday: 9:00 AM - 6:00 PM', 'Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 6:00 PM', 'Sunday: 10:00 AM - 5:00 PM'],
    admissionPrice: 'From $1.50 USD',
    duration: '2-3 hours',
    destinationId: 3
  }
];

// Acclaimed restaurants with authentic cuisine
export const topRestaurants: InsertRestaurant[] = [
  {
    locationId: 'restaurant_central_lima_001',
    name: 'Central',
    description: 'World-renowned restaurant showcasing Peru\'s biodiversity through innovative cuisine using indigenous ingredients from different altitudes.',
    address: 'Av. Pedro de Osma 301, Barranco, Lima, Peru',
    phone: '+51 1 242-8515',
    website: 'https://centralrestaurante.com.pe',
    email: 'reservas@centralrestaurante.com.pe',
    latitude: -12.1464,
    longitude: -77.0201,
    rating: 4.8,
    numReviews: 8934,
    priceLevel: '$$$$',
    ranking: 1,
    awards: ['Worlds 50 Best Restaurants #5', 'Latin Americas 50 Best #1'],
    cuisine: ['Peruvian', 'Contemporary', 'Tasting Menu'],
    dietaryRestrictions: ['Vegetarian options', 'Gluten-free options'],
    menuUrl: 'https://centralrestaurante.com.pe/menu',
    reservationUrl: 'https://centralrestaurante.com.pe/reservas',
    openingHours: ['Monday: Closed', 'Tuesday: 12:30 PM - 1:30 PM, 7:45 PM - 9:45 PM', 'Wednesday: 12:30 PM - 1:30 PM, 7:45 PM - 9:45 PM', 'Thursday: 12:30 PM - 1:30 PM, 7:45 PM - 9:45 PM', 'Friday: 12:30 PM - 1:30 PM, 7:45 PM - 9:45 PM', 'Saturday: 12:30 PM - 1:30 PM, 7:45 PM - 9:45 PM', 'Sunday: Closed'],
    destinationId: 1
  },
  {
    locationId: 'restaurant_harry_sasson_001',
    name: 'Harry Sasson',
    description: 'Upscale restaurant offering innovative Colombian cuisine with international influences in an elegant setting.',
    address: 'Carrera 14 # 88-36, Zona Rosa, Bogotá, Colombia',
    phone: '+57 1 644-4004',
    website: 'https://www.harrysasson.com',
    email: 'info@harrysasson.com',
    latitude: 4.6755,
    longitude: -74.0565,
    rating: 4.6,
    numReviews: 3247,
    priceLevel: '$$$',
    ranking: 2,
    awards: ['Best Restaurant Bogotá 2023', 'Wine Spectator Award'],
    cuisine: ['Colombian', 'International', 'Contemporary'],
    dietaryRestrictions: ['Vegetarian options', 'Vegan options'],
    menuUrl: 'https://www.harrysasson.com/menu',
    reservationUrl: 'https://www.harrysasson.com/reservations',
    openingHours: ['Monday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Tuesday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Wednesday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Thursday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Friday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Saturday: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM', 'Sunday: 12:00 PM - 4:00 PM'],
    destinationId: 3
  }
];

// Authentic reviews with detailed feedback
export const sampleReviews: InsertLocationReview[] = [
  {
    locationId: 'hotel_lima_luxury_001',
    category: 'accommodation',
    reviewId: 'review_lima_hotel_001',
    title: 'Exceptional luxury in historic setting',
    text: 'This hotel exceeded all expectations. The colonial architecture is breathtaking, and every detail has been carefully preserved. Our suite was spacious with modern amenities while maintaining the historic charm. The staff was incredibly attentive, and the restaurant serves some of the best Peruvian cuisine I\'ve experienced. The location is perfect for exploring Lima\'s historic center.',
    rating: 5,
    author: 'Maria Rodriguez',
    date: '2024-06-15T00:00:00.000Z',
    tripType: 'couples',
    helpful: 47,
    language: 'en'
  },
  {
    locationId: 'attraction_machupicchu_001',
    category: 'attraction',
    reviewId: 'review_machupicchu_001',
    title: 'Life-changing experience at Machu Picchu',
    text: 'Words cannot describe the feeling of standing among these ancient ruins. The engineering marvels of the Inca civilization are incredible to witness firsthand. I recommend taking the early morning train to avoid crowds and catch the sunrise over the mountains. The guided tour was informative and helped us understand the historical significance. Definitely worth the journey!',
    rating: 5,
    author: 'James Thompson',
    date: '2024-05-22T00:00:00.000Z',
    tripType: 'solo',
    helpful: 89,
    language: 'en'
  },
  {
    locationId: 'restaurant_central_lima_001',
    category: 'restaurant',
    reviewId: 'review_central_001',
    title: 'Culinary journey through Peru\'s ecosystems',
    text: 'Central offers an extraordinary dining experience that goes beyond just food. Each dish tells a story of Peru\'s diverse ecosystems, from the coast to the Amazon. The presentation is artistic, and the flavors are complex and unique. The service was impeccable, with servers explaining each course in detail. This is definitely a once-in-a-lifetime culinary adventure.',
    rating: 5,
    author: 'Sofia Chen',
    date: '2024-06-01T00:00:00.000Z',
    tripType: 'couples',
    helpful: 156,
    language: 'en'
  }
];

export async function seedSouthAmericanData() {
  try {
    console.log('🌎 Starting South American data seeding...');

    // Create destinations
    console.log('📍 Creating destinations...');
    for (const destination of southAmericanDestinations) {
      const existing = await storage.getDestinationByLocationId(destination.locationId);
      if (!existing) {
        await storage.createDestination(destination);
        console.log(`✅ Created destination: ${destination.name}, ${destination.country}`);
      }
    }

    // Create accommodations
    console.log('🏨 Creating accommodations...');
    for (const accommodation of premiumAccommodations) {
      const existing = await storage.getAccommodationByLocationId(accommodation.locationId);
      if (!existing) {
        await storage.createAccommodation(accommodation);
        console.log(`✅ Created accommodation: ${accommodation.name}`);
      }
    }

    // Create attractions
    console.log('🏛️ Creating attractions...');
    for (const attraction of topAttractions) {
      const existing = await storage.getAttractionByLocationId(attraction.locationId);
      if (!existing) {
        await storage.createAttraction(attraction);
        console.log(`✅ Created attraction: ${attraction.name}`);
      }
    }

    // Create restaurants
    console.log('🍽️ Creating restaurants...');
    for (const restaurant of topRestaurants) {
      const existing = await storage.getRestaurantByLocationId(restaurant.locationId);
      if (!existing) {
        await storage.createRestaurant(restaurant);
        console.log(`✅ Created restaurant: ${restaurant.name}`);
      }
    }

    // Create reviews
    console.log('⭐ Creating reviews...');
    for (const review of sampleReviews) {
      await storage.createLocationReview(review);
      console.log(`✅ Created review for: ${review.locationId}`);
    }

    console.log('🎉 South American data seeding completed successfully!');
    return { success: true, message: 'Data seeded successfully' };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    return { success: false, error: error.message };
  }
}