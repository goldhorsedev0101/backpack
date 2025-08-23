import sqlite3 from 'sqlite3';
/**
 * Enriches AI-generated suggestions with real places from collector database
 */
export async function enrichWithCollectorData(destination, type = 'accommodation') {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('collected_places.db');
        // Search query based on destination and type
        let typeFilter = '';
        switch (type) {
            case 'accommodation':
                typeFilter = "AND types LIKE '%lodging%' OR types LIKE '%hostel%'";
                break;
            case 'attraction':
                typeFilter = "AND types LIKE '%tourist_attraction%' OR types LIKE '%museum%'";
                break;
            case 'restaurant':
                typeFilter = "AND types LIKE '%restaurant%' OR types LIKE '%food%'";
                break;
        }
        const query = `
      SELECT * FROM places 
      WHERE address LIKE ? ${typeFilter}
      ORDER BY rating DESC, reviews_count DESC 
      LIMIT 5
    `;
        db.all(query, [`%${destination}%`], (err, rows) => {
            if (err) {
                console.error('Error querying collector data:', err);
                resolve([]);
            }
            else {
                const places = rows.map(row => ({
                    ...row,
                    types: JSON.parse(row.types || '[]')
                }));
                resolve(places);
            }
            db.close();
        });
    });
}
/**
 * Get accommodation suggestions for AI trip planning
 */
export async function getAccommodationSuggestions(destination) {
    const places = await enrichWithCollectorData(destination, 'accommodation');
    return places.map(place => ({
        name: place.name,
        type: 'hostel',
        location: place.address,
        priceRange: '$',
        rating: place.rating,
        description: place.summary || `${place.name} offers great accommodation in ${destination}`,
        amenities: [],
        contactInfo: place.phone || '',
        website: place.website || '',
        coordinates: {
            lat: place.lat,
            lng: place.lng
        },
        googlePlaceId: place.place_id,
        reviewsCount: place.reviews_count
    }));
}
/**
 * Get attraction suggestions for AI trip planning
 */
export async function getAttractionSuggestions(destination) {
    const places = await enrichWithCollectorData(destination, 'attraction');
    return places.map(place => ({
        name: place.name,
        type: 'sightseeing',
        location: place.address,
        description: place.summary || `${place.name} is a popular attraction in ${destination}`,
        rating: place.rating,
        priceRange: '$',
        website: place.website || '',
        coordinates: {
            lat: place.lat,
            lng: place.lng
        },
        googlePlaceId: place.place_id,
        reviewsCount: place.reviews_count
    }));
}
