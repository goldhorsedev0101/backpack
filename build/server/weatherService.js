import axios from 'axios';
// South American climate data for travel recommendations
const SOUTH_AMERICA_CLIMATE = {
    'lima': {
        'jan': { avgTemp: 25, rainfall: 0.5, humidity: 77, sunnyDays: 15 },
        'feb': { avgTemp: 26, rainfall: 0.3, humidity: 76, sunnyDays: 16 },
        'mar': { avgTemp: 25, rainfall: 0.5, humidity: 77, sunnyDays: 18 },
        'apr': { avgTemp: 23, rainfall: 2, humidity: 79, sunnyDays: 20 },
        'may': { avgTemp: 20, rainfall: 5, humidity: 81, sunnyDays: 15 },
        'jun': { avgTemp: 18, rainfall: 8, humidity: 82, sunnyDays: 10 },
        'jul': { avgTemp: 17, rainfall: 10, humidity: 83, sunnyDays: 8 },
        'aug': { avgTemp: 17, rainfall: 8, humidity: 83, sunnyDays: 10 },
        'sep': { avgTemp: 18, rainfall: 5, humidity: 81, sunnyDays: 12 },
        'oct': { avgTemp: 19, rainfall: 3, humidity: 80, sunnyDays: 15 },
        'nov': { avgTemp: 22, rainfall: 1, humidity: 78, sunnyDays: 18 },
        'dec': { avgTemp: 24, rainfall: 0.5, humidity: 77, sunnyDays: 16 }
    },
    'cusco': {
        'jan': { avgTemp: 13, rainfall: 160, humidity: 67, sunnyDays: 8 },
        'feb': { avgTemp: 13, rainfall: 130, humidity: 66, sunnyDays: 9 },
        'mar': { avgTemp: 13, rainfall: 100, humidity: 64, sunnyDays: 12 },
        'apr': { avgTemp: 12, rainfall: 45, humidity: 58, sunnyDays: 18 },
        'may': { avgTemp: 10, rainfall: 10, humidity: 52, sunnyDays: 22 },
        'jun': { avgTemp: 9, rainfall: 5, humidity: 49, sunnyDays: 24 },
        'jul': { avgTemp: 9, rainfall: 5, humidity: 48, sunnyDays: 25 },
        'aug': { avgTemp: 11, rainfall: 10, humidity: 50, sunnyDays: 23 },
        'sep': { avgTemp: 13, rainfall: 25, humidity: 55, sunnyDays: 20 },
        'oct': { avgTemp: 14, rainfall: 60, humidity: 59, sunnyDays: 18 },
        'nov': { avgTemp: 14, rainfall: 90, humidity: 62, sunnyDays: 15 },
        'dec': { avgTemp: 13, rainfall: 140, humidity: 65, sunnyDays: 10 }
    },
    'bogota': {
        'jan': { avgTemp: 14, rainfall: 40, humidity: 78, sunnyDays: 15 },
        'feb': { avgTemp: 15, rainfall: 50, humidity: 77, sunnyDays: 14 },
        'mar': { avgTemp: 15, rainfall: 80, humidity: 78, sunnyDays: 12 },
        'apr': { avgTemp: 15, rainfall: 120, humidity: 80, sunnyDays: 10 },
        'may': { avgTemp: 15, rainfall: 90, humidity: 82, sunnyDays: 8 },
        'jun': { avgTemp: 14, rainfall: 50, humidity: 81, sunnyDays: 7 },
        'jul': { avgTemp: 14, rainfall: 40, humidity: 80, sunnyDays: 8 },
        'aug': { avgTemp: 14, rainfall: 50, humidity: 80, sunnyDays: 10 },
        'sep': { avgTemp: 14, rainfall: 70, humidity: 81, sunnyDays: 11 },
        'oct': { avgTemp: 14, rainfall: 110, humidity: 82, sunnyDays: 9 },
        'nov': { avgTemp: 14, rainfall: 90, humidity: 81, sunnyDays: 10 },
        'dec': { avgTemp: 14, rainfall: 50, humidity: 79, sunnyDays: 12 }
    },
    'buenos_aires': {
        'jan': { avgTemp: 25, rainfall: 100, humidity: 65, sunnyDays: 16 },
        'feb': { avgTemp: 24, rainfall: 90, humidity: 67, sunnyDays: 15 },
        'mar': { avgTemp: 22, rainfall: 110, humidity: 70, sunnyDays: 14 },
        'apr': { avgTemp: 18, rainfall: 90, humidity: 73, sunnyDays: 12 },
        'may': { avgTemp: 15, rainfall: 70, humidity: 76, sunnyDays: 10 },
        'jun': { avgTemp: 12, rainfall: 50, humidity: 79, sunnyDays: 8 },
        'jul': { avgTemp: 11, rainfall: 50, humidity: 78, sunnyDays: 9 },
        'aug': { avgTemp: 13, rainfall: 60, humidity: 75, sunnyDays: 11 },
        'sep': { avgTemp: 15, rainfall: 70, humidity: 72, sunnyDays: 13 },
        'oct': { avgTemp: 18, rainfall: 110, humidity: 69, sunnyDays: 15 },
        'nov': { avgTemp: 22, rainfall: 95, humidity: 66, sunnyDays: 16 },
        'dec': { avgTemp: 24, rainfall: 90, humidity: 64, sunnyDays: 17 }
    },
    'rio_de_janeiro': {
        'jan': { avgTemp: 26, rainfall: 140, humidity: 79, sunnyDays: 12 },
        'feb': { avgTemp: 26, rainfall: 130, humidity: 78, sunnyDays: 13 },
        'mar': { avgTemp: 25, rainfall: 130, humidity: 79, sunnyDays: 14 },
        'apr': { avgTemp: 24, rainfall: 80, humidity: 78, sunnyDays: 16 },
        'may': { avgTemp: 22, rainfall: 60, humidity: 77, sunnyDays: 18 },
        'jun': { avgTemp: 21, rainfall: 40, humidity: 76, sunnyDays: 19 },
        'jul': { avgTemp: 20, rainfall: 40, humidity: 75, sunnyDays: 20 },
        'aug': { avgTemp: 21, rainfall: 50, humidity: 74, sunnyDays: 19 },
        'sep': { avgTemp: 22, rainfall: 60, humidity: 75, sunnyDays: 17 },
        'oct': { avgTemp: 23, rainfall: 90, humidity: 77, sunnyDays: 16 },
        'nov': { avgTemp: 24, rainfall: 100, humidity: 78, sunnyDays: 14 },
        'dec': { avgTemp: 25, rainfall: 130, humidity: 79, sunnyDays: 13 }
    },
    'santiago': {
        'jan': { avgTemp: 21, rainfall: 1, humidity: 51, sunnyDays: 28 },
        'feb': { avgTemp: 20, rainfall: 1, humidity: 53, sunnyDays: 25 },
        'mar': { avgTemp: 18, rainfall: 5, humidity: 58, sunnyDays: 22 },
        'apr': { avgTemp: 15, rainfall: 15, humidity: 64, sunnyDays: 18 },
        'may': { avgTemp: 12, rainfall: 60, humidity: 71, sunnyDays: 12 },
        'jun': { avgTemp: 9, rainfall: 80, humidity: 76, sunnyDays: 8 },
        'jul': { avgTemp: 8, rainfall: 75, humidity: 76, sunnyDays: 9 },
        'aug': { avgTemp: 10, rainfall: 55, humidity: 72, sunnyDays: 12 },
        'sep': { avgTemp: 12, rainfall: 30, humidity: 67, sunnyDays: 15 },
        'oct': { avgTemp: 15, rainfall: 15, humidity: 61, sunnyDays: 18 },
        'nov': { avgTemp: 18, rainfall: 5, humidity: 55, sunnyDays: 22 },
        'dec': { avgTemp: 20, rainfall: 2, humidity: 52, sunnyDays: 26 }
    }
};
export class WeatherService {
    apiKey;
    baseUrl = 'https://api.openweathermap.org/data/2.5';
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    }
    async getCurrentWeather(city, country) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenWeather API key not configured');
            }
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: `${city},${country}`,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });
            const data = response.data;
            // Get 5-day forecast
            const forecastResponse = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    q: `${city},${country}`,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });
            const forecast = this.processForecast(forecastResponse.data);
            return {
                location: data.name,
                country: country,
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                precipitation: data.rain?.['1h'] || 0,
                uvIndex: 0, // Would need additional API call
                visibility: data.visibility / 1000, // Convert to km
                pressure: data.main.pressure,
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                },
                forecast
            };
        }
        catch (error) {
            console.error('Weather API error:', error);
            return null;
        }
    }
    processForecast(forecastData) {
        const dailyData = {};
        // Group forecast by date
        forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });
        // Process each day
        return Object.entries(dailyData).slice(0, 5).map(([date, dayData]) => {
            const temps = dayData.map(d => d.main.temp);
            const conditions = dayData.map(d => d.weather[0].description);
            const precipitation = dayData.filter(d => d.rain).length / dayData.length * 100;
            const windSpeeds = dayData.map(d => d.wind.speed);
            const humidity = dayData.map(d => d.main.humidity);
            return {
                date,
                tempMin: Math.round(Math.min(...temps)),
                tempMax: Math.round(Math.max(...temps)),
                condition: conditions[0], // Use first condition
                precipitationChance: Math.round(precipitation),
                windSpeed: Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length),
                humidity: Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length)
            };
        });
    }
    generateTravelRecommendation(destination, currentWeather) {
        const destKey = destination.toLowerCase().replace(' ', '_');
        const climate = SOUTH_AMERICA_CLIMATE[destKey];
        const currentMonth = new Date().toLocaleString('en', { month: 'short' }).toLowerCase();
        if (!climate) {
            return this.getDefaultRecommendation(destination);
        }
        const monthlyData = Object.entries(climate);
        const bestMonths = this.findBestMonths(monthlyData, destination);
        const avoidMonths = this.findWorstMonths(monthlyData, destination);
        let currentCondition = 'good';
        const reasons = [];
        const activities = { recommended: [], avoid: [] };
        const packingTips = [];
        const healthWarnings = [];
        // Analyze current conditions
        if (currentWeather) {
            // Start with excellent for good conditions
            if (currentWeather.temperature >= 18 && currentWeather.temperature <= 25 && currentWeather.precipitation <= 5) {
                currentCondition = 'excellent';
                reasons.push('Perfect weather conditions for travel');
            }
            else if (currentWeather.temperature > 30) {
                currentCondition = 'fair';
                reasons.push('Very hot weather - consider heat precautions');
                packingTips.push('Light, breathable clothing', 'Sun protection', 'Extra water');
            }
            else if (currentWeather.temperature < 5) {
                currentCondition = 'fair';
                reasons.push('Cold weather - warm clothing essential');
                packingTips.push('Warm layers', 'Waterproof jacket', 'Insulated boots');
            }
            if (currentWeather.precipitation > 10) {
                if (currentCondition === 'excellent') {
                    currentCondition = 'good';
                }
                else if (currentCondition === 'good') {
                    currentCondition = 'fair';
                }
                else if (currentCondition === 'fair') {
                    currentCondition = 'poor';
                }
                reasons.push('Heavy rainfall expected');
                packingTips.push('Waterproof gear', 'Quick-dry clothing');
            }
        }
        // Add destination-specific recommendations
        this.addDestinationSpecificAdvice(destination, reasons, activities, packingTips, healthWarnings);
        return {
            destination,
            country: this.getCountryFromDestination(destination),
            bestMonths,
            avoidMonths,
            currentCondition,
            reasons,
            activities,
            packingTips,
            healthWarnings
        };
    }
    findBestMonths(monthlyData, destination) {
        const scored = monthlyData.map(([month, data]) => {
            let score = 0;
            // Temperature scoring (prefer moderate temperatures)
            if (data.avgTemp >= 18 && data.avgTemp <= 25)
                score += 3;
            else if (data.avgTemp >= 15 && data.avgTemp <= 28)
                score += 2;
            else if (data.avgTemp >= 10 && data.avgTemp <= 30)
                score += 1;
            // Rainfall scoring (prefer less rain)
            if (data.rainfall < 30)
                score += 3;
            else if (data.rainfall < 60)
                score += 2;
            else if (data.rainfall < 100)
                score += 1;
            // Sunny days scoring
            if (data.sunnyDays >= 20)
                score += 3;
            else if (data.sunnyDays >= 15)
                score += 2;
            else if (data.sunnyDays >= 10)
                score += 1;
            return { month, score };
        });
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(item => this.formatMonth(item.month));
    }
    findWorstMonths(monthlyData, destination) {
        const scored = monthlyData.map(([month, data]) => {
            let score = 0;
            // Higher score = worse conditions
            if (data.rainfall > 120)
                score += 3;
            else if (data.rainfall > 80)
                score += 2;
            else if (data.rainfall > 50)
                score += 1;
            if (data.humidity > 85)
                score += 2;
            if (data.sunnyDays < 8)
                score += 2;
            return { month, score };
        });
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map(item => this.formatMonth(item.month));
    }
    addDestinationSpecificAdvice(destination, reasons, activities, packingTips, healthWarnings) {
        const dest = destination.toLowerCase();
        if (dest.includes('cusco') || dest.includes('machu picchu')) {
            reasons.push('High altitude location - acclimatization needed');
            healthWarnings.push('Altitude sickness possible above 3,400m', 'Arrive 2-3 days early for acclimatization');
            packingTips.push('Altitude sickness medication', 'Warm layers for temperature changes');
            activities.recommended.push('Gradual altitude adjustment', 'Light activities first day', 'Plenty of water');
        }
        if (dest.includes('lima')) {
            reasons.push('Coastal desert climate - very dry');
            activities.recommended.push('Beach activities', 'City exploration', 'Culinary tours');
            packingTips.push('Moisturizer for dry air', 'Light layers for temperature variation');
        }
        if (dest.includes('amazon') || dest.includes('manaus')) {
            reasons.push('Tropical rainforest - high humidity and rainfall');
            healthWarnings.push('Mosquito-borne diseases possible', 'Yellow fever vaccination recommended');
            packingTips.push('Insect repellent', 'Long sleeves and pants', 'Waterproof gear');
            activities.recommended.push('River tours', 'Wildlife watching', 'Canopy walks');
        }
        if (dest.includes('patagonia') || dest.includes('torres del paine')) {
            reasons.push('Extreme weather conditions possible');
            packingTips.push('Wind-resistant clothing', 'Multiple layers', 'Waterproof everything');
            activities.recommended.push('Hiking', 'Photography', 'Glacier tours');
        }
    }
    getCountryFromDestination(destination) {
        const dest = destination.toLowerCase();
        if (dest.includes('lima') || dest.includes('cusco') || dest.includes('machu picchu'))
            return 'Peru';
        if (dest.includes('bogota') || dest.includes('cartagena') || dest.includes('medellin'))
            return 'Colombia';
        if (dest.includes('buenos aires') || dest.includes('mendoza') || dest.includes('bariloche'))
            return 'Argentina';
        if (dest.includes('rio') || dest.includes('salvador') || dest.includes('amazon'))
            return 'Brazil';
        if (dest.includes('santiago') || dest.includes('valparaiso') || dest.includes('atacama'))
            return 'Chile';
        if (dest.includes('la paz') || dest.includes('sucre') || dest.includes('uyuni'))
            return 'Bolivia';
        return 'South America';
    }
    formatMonth(month) {
        const months = {
            'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
            'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
            'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
        };
        return months[month] || month;
    }
    getDefaultRecommendation(destination) {
        return {
            destination,
            country: this.getCountryFromDestination(destination),
            bestMonths: ['April', 'May', 'September', 'October'],
            avoidMonths: ['January', 'February'],
            currentCondition: 'good',
            reasons: ['General South American travel season'],
            activities: {
                recommended: ['Sightseeing', 'Cultural activities', 'Photography'],
                avoid: ['Extreme outdoor activities during bad weather']
            },
            packingTips: ['Weather-appropriate clothing', 'Comfortable walking shoes'],
            healthWarnings: ['Check vaccination requirements', 'Travel insurance recommended']
        };
    }
}
export const weatherService = new WeatherService();
