// Simple fallback data for collector endpoints
const FALLBACK_STATS = {
    places: 392,
    reviews: 1943,
    countries: [
        { country: 'Peru', count: 89 },
        { country: 'Colombia', count: 76 },
        { country: 'Ecuador', count: 45 },
        { country: 'Chile', count: 38 },
        { country: 'Argentina', count: 32 },
        { country: 'Bolivia', count: 28 }
    ],
    averageRating: 4.2
};
const FALLBACK_PLACES = [
    {
        place_id: 'fallback_1',
        name: 'Casa del Mochilero',
        address: 'Lima, Peru',
        lat: -12.0464,
        lng: -77.0428,
        rating: 4.2,
        reviews_count: 89,
        types: ['lodging', 'hostel'],
        summary: 'Budget hostel in Lima center',
        created_at: new Date().toISOString()
    },
    {
        place_id: 'fallback_2',
        name: 'Backpackers Hostel Bogotá',
        address: 'Bogotá, Colombia',
        lat: 4.7110,
        lng: -74.0721,
        rating: 4.5,
        reviews_count: 156,
        types: ['lodging', 'hostel'],
        summary: 'Popular hostel in Zona Rosa',
        created_at: new Date().toISOString()
    },
    {
        place_id: 'fallback_3',
        name: 'Hostal Quito Colonial',
        address: 'Quito, Ecuador',
        lat: -0.1807,
        lng: -78.4678,
        rating: 4.3,
        reviews_count: 127,
        types: ['lodging', 'hostel'],
        summary: 'Historic hostel in Old Town',
        created_at: new Date().toISOString()
    }
];
export function registerCollectorRoutes(app) {
    // Get collector statistics
    app.get('/api/collector/stats', async (req, res) => {
        try {
            console.log('Fetching collector stats...');
            res.json(FALLBACK_STATS);
        }
        catch (error) {
            console.error('Collector stats error:', error);
            res.status(500).json({
                error: 'Failed to fetch stats',
                message: error.message
            });
        }
    });
    // Search places from collected data
    app.get('/api/collector/places', async (req, res) => {
        try {
            console.log('Fetching collector places...');
            const { search, country, limit = 50, offset = 0 } = req.query;
            let filteredPlaces = FALLBACK_PLACES;
            if (search) {
                const searchTerm = search.toLowerCase();
                filteredPlaces = filteredPlaces.filter(place => place.name.toLowerCase().includes(searchTerm) ||
                    place.address.toLowerCase().includes(searchTerm));
            }
            if (country) {
                const countryTerm = country.toLowerCase();
                filteredPlaces = filteredPlaces.filter(place => place.address.toLowerCase().includes(countryTerm));
            }
            const startIndex = parseInt(offset) || 0;
            const endIndex = startIndex + (parseInt(limit) || 50);
            const paginatedPlaces = filteredPlaces.slice(startIndex, endIndex);
            res.json({ places: paginatedPlaces, total: paginatedPlaces.length });
        }
        catch (error) {
            console.error('Collector places error:', error);
            res.status(500).json({
                error: 'Failed to fetch places',
                message: error.message
            });
        }
    });
    // Get reviews for a specific place
    app.get('/api/collector/places/:placeId/reviews', async (req, res) => {
        try {
            const { placeId } = req.params;
            console.log(`Fetching reviews for place: ${placeId}`);
            // Return sample reviews for demonstration
            const sampleReviews = [
                {
                    id: 1,
                    place_id: placeId,
                    author: 'Sarah M.',
                    rating: 5,
                    text: 'Amazing hostel! Great location and friendly staff.',
                    date: '2024-01-15'
                },
                {
                    id: 2,
                    place_id: placeId,
                    author: 'John D.',
                    rating: 4,
                    text: 'Good value for money. Clean rooms and nice common area.',
                    date: '2024-01-10'
                }
            ];
            res.json({ reviews: sampleReviews });
        }
        catch (error) {
            console.error('Collector reviews error:', error);
            res.status(500).json({
                error: 'Failed to fetch reviews',
                message: error.message
            });
        }
    });
    // Get places by specific country
    app.get('/api/collector/countries/:country/places', async (req, res) => {
        try {
            const { country } = req.params;
            const { limit = 20, offset = 0 } = req.query;
            console.log(`Fetching places for country: ${country}`);
            const countryPlaces = FALLBACK_PLACES.filter(place => place.address.toLowerCase().includes(country.toLowerCase()));
            const startIndex = parseInt(offset) || 0;
            const endIndex = startIndex + (parseInt(limit) || 20);
            const paginatedPlaces = countryPlaces.slice(startIndex, endIndex);
            res.json({ places: paginatedPlaces, country, total: paginatedPlaces.length });
        }
        catch (error) {
            console.error('Country places error:', error);
            res.status(500).json({
                error: 'Failed to fetch country places',
                message: error.message
            });
        }
    });
    // Get detailed info for a specific place
    app.get('/api/collector/places/:placeId', async (req, res) => {
        try {
            const { placeId } = req.params;
            console.log(`Fetching place details: ${placeId}`);
            const place = FALLBACK_PLACES.find(p => p.place_id === placeId);
            if (!place) {
                return res.status(404).json({ error: 'Place not found' });
            }
            res.json({ place });
        }
        catch (error) {
            console.error('Place details error:', error);
            res.status(500).json({
                error: 'Failed to fetch place details',
                message: error.message
            });
        }
    });
}
