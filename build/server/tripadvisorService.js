// TripAdvisor API Service - Ready for Future Integration
// Application URL: https://www.tripadvisor.com/APIAccessSupport
export class TripAdvisorService {
    config;
    constructor() {
        this.config = {
            apiKey: process.env.TRIPADVISOR_API_KEY,
            apiSecret: process.env.TRIPADVISOR_API_SECRET,
            baseUrl: 'https://api.tripadvisor.com/api/partner/2.0',
            version: '2.0'
        };
    }
    async makeRequest(endpoint, params = {}) {
        if (!this.config.apiKey) {
            throw new Error('TripAdvisor API key not configured. Apply at https://www.tripadvisor.com/APIAccessSupport');
        }
        const url = new URL(`${this.config.baseUrl}${endpoint}`);
        url.searchParams.append('key', this.config.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        try {
            const response = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'TripWise/1.0'
                }
            });
            if (!response.ok) {
                throw new Error(`TripAdvisor API error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('TripAdvisor API request failed:', error);
            throw error;
        }
    }
    // Search for locations
    async searchLocations(query, category, limit = 10) {
        const response = await this.makeRequest('/search', {
            q: query,
            category: category || 'geos',
            limit
        });
        return response.data || [];
    }
    // Get location details
    async getLocationDetails(locationId) {
        try {
            const response = await this.makeRequest(`/location/${locationId}`);
            return response;
        }
        catch (error) {
            console.error(`Failed to get location details for ${locationId}:`, error);
            return null;
        }
    }
    // Get location photos
    async getLocationPhotos(locationId, limit = 10) {
        try {
            const response = await this.makeRequest(`/location/${locationId}/photos`, { limit });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to get photos for location ${locationId}:`, error);
            return [];
        }
    }
    // Get location reviews
    async getLocationReviews(locationId, limit = 10, offset = 0) {
        try {
            const response = await this.makeRequest(`/location/${locationId}/reviews`, {
                limit,
                offset,
                lang: 'en'
            });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to get reviews for location ${locationId}:`, error);
            return [];
        }
    }
    // Get nearby attractions
    async getNearbyAttractions(locationId, limit = 10) {
        try {
            const response = await this.makeRequest(`/location/${locationId}/attractions`, { limit });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to get attractions near ${locationId}:`, error);
            return [];
        }
    }
    // Get nearby restaurants
    async getNearbyRestaurants(locationId, limit = 10) {
        try {
            const response = await this.makeRequest(`/location/${locationId}/restaurants`, { limit });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to get restaurants near ${locationId}:`, error);
            return [];
        }
    }
    // Get nearby hotels
    async getNearbyHotels(locationId, limit = 10) {
        try {
            const response = await this.makeRequest(`/location/${locationId}/hotels`, { limit });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to get hotels near ${locationId}:`, error);
            return [];
        }
    }
    // Convert TripAdvisor data to our database format
    convertToDestination(location) {
        return {
            locationId: location.location_id,
            name: location.name,
            country: location.ancestors?.find(a => a.level === 'country')?.name || '',
            region: location.ancestors?.find(a => a.level === 'state')?.name || '',
            description: `${location.name} - Discover this amazing destination through TripAdvisor`,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            timezone: location.timezone,
            currency: this.getCurrencyByCountry(location.ancestors?.find(a => a.level === 'country')?.name || ''),
            language: 'en',
            bestTimeToVisit: 'Year-round',
            averageTemperature: 20,
            population: null,
            attractions: [],
            activities: [],
            tags: []
        };
    }
    convertToAccommodation(location, destinationId) {
        return {
            locationId: location.location_id,
            name: location.name,
            description: `${location.name} - ${location.address_obj.address_string}`,
            address: location.address_obj.address_string,
            phone: location.phone,
            website: location.website,
            email: location.email,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            rating: location.rating ? parseFloat(location.rating) : 0,
            numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
            priceLevel: this.convertPriceLevel(location.rating),
            ranking: null,
            awards: location.awards?.map(award => award.display_name) || [],
            amenities: location.amenities || [],
            roomTypes: [],
            checkInTime: null,
            checkOutTime: null,
            destinationId
        };
    }
    convertToRestaurant(location, destinationId) {
        return {
            locationId: location.location_id,
            name: location.name,
            description: `${location.name} - ${location.address_obj.address_string}`,
            address: location.address_obj.address_string,
            phone: location.phone,
            website: location.website,
            email: location.email,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            rating: location.rating ? parseFloat(location.rating) : 0,
            numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
            priceLevel: this.convertPriceLevel(location.rating),
            ranking: null,
            awards: location.awards?.map(award => award.display_name) || [],
            cuisine: this.extractCuisineFromGroups(location.groups),
            dietaryRestrictions: [],
            menuUrl: null,
            reservationUrl: null,
            openingHours: [],
            destinationId
        };
    }
    convertToAttraction(location, destinationId) {
        return {
            locationId: location.location_id,
            name: location.name,
            description: `${location.name} - ${location.address_obj.address_string}`,
            address: location.address_obj.address_string,
            phone: location.phone,
            website: location.website,
            email: location.email,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            rating: location.rating ? parseFloat(location.rating) : 0,
            numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
            ranking: null,
            awards: location.awards?.map(award => award.display_name) || [],
            category: this.extractCategoryFromGroups(location.groups),
            subcategory: null,
            openingHours: [],
            admissionPrice: null,
            duration: null,
            destinationId
        };
    }
    convertPriceLevel(rating) {
        if (!rating)
            return '$$';
        const ratingNum = parseFloat(rating);
        if (ratingNum >= 4.5)
            return '$$$$';
        if (ratingNum >= 4.0)
            return '$$$';
        if (ratingNum >= 3.5)
            return '$$';
        return '$';
    }
    getCurrencyByCountry(country) {
        const currencyMap = {
            'Peru': 'PEN',
            'Colombia': 'COP',
            'Bolivia': 'BOB',
            'Chile': 'CLP',
            'Argentina': 'ARS',
            'Brazil': 'BRL',
            'Ecuador': 'USD',
            'Uruguay': 'UYU',
            'Paraguay': 'PYG',
            'Venezuela': 'VES'
        };
        return currencyMap[country] || 'USD';
    }
    extractCuisineFromGroups(groups) {
        if (!groups)
            return ['International'];
        const cuisines = groups
            .flatMap(group => group.categories || [])
            .map(cat => cat.name)
            .filter(name => name && !['Restaurant', 'Food'].includes(name));
        return cuisines.length > 0 ? cuisines : ['International'];
    }
    extractCategoryFromGroups(groups) {
        if (!groups)
            return 'Attractions';
        const categories = groups
            .flatMap(group => group.categories || [])
            .map(cat => cat.name);
        return categories[0] || 'Attractions';
    }
    // Test API connection
    async testConnection() {
        try {
            await this.searchLocations('Lima Peru', 'geos', 1);
            return true;
        }
        catch (error) {
            console.error('TripAdvisor API connection test failed:', error);
            return false;
        }
    }
}
export const tripAdvisorService = new TripAdvisorService();
