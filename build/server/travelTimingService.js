// Comprehensive travel timing data for South American destinations
const TRAVEL_TIMING_DATABASE = {
    'lima': {
        destination: 'Lima',
        country: 'Peru',
        bestMonths: ['April', 'May', 'September', 'October', 'November'],
        peakSeason: ['June', 'July', 'August'],
        shoulderSeason: ['April', 'May', 'September', 'October'],
        lowSeason: ['November', 'December', 'January', 'February', 'March'],
        avoidMonths: [],
        reasons: {
            weather: 'Lima has a mild desert climate year-round. Avoid June-August for gray skies and cool temperatures.',
            crowds: 'Peak season brings crowds but also cultural events. Shoulder seasons offer perfect balance.',
            prices: 'Prices are highest June-August. Best deals found November-March.',
            activities: 'Food tours and city exploration are excellent year-round. Beach activities best December-April.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'very-good',
                temperature: '23-26°C, warm summer weather',
                rainfall: 'Very little, occasional drizzle',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Beach weather', 'Summer festivals', 'Fresh ceviche season'],
                considerations: ['Some fog in mornings']
            },
            'February': {
                rating: 'very-good',
                temperature: '24-27°C, warmest month',
                rainfall: 'Almost none',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect beach conditions', 'Carnival celebrations', 'Excellent for coastal trips'],
                considerations: ['Busiest beach season']
            },
            'March': {
                rating: 'very-good',
                temperature: '23-26°C, still warm',
                rainfall: 'Very little',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Great weather continues', 'Harvest season in nearby valleys', 'Ideal for food tours'],
                considerations: ['Gradually getting cooler']
            },
            'April': {
                rating: 'excellent',
                temperature: '21-24°C, ideal temperatures',
                rainfall: 'Minimal',
                crowds: 'low',
                prices: 'low',
                highlights: ['Perfect weather', 'Fewer crowds', 'Great photography light', 'Ideal for walking tours'],
                considerations: ['Pack light layers']
            },
            'May': {
                rating: 'excellent',
                temperature: '18-21°C, comfortable and crisp',
                rainfall: 'Very low',
                crowds: 'low',
                prices: 'low',
                highlights: ['Crisp, clear days', 'Excellent visibility', 'Perfect for outdoor activities', 'Great restaurant patios'],
                considerations: ['Cooler evenings, bring jacket']
            },
            'June': {
                rating: 'good',
                temperature: '16-19°C, cool winter',
                rainfall: 'Light mist common',
                crowds: 'high',
                prices: 'high',
                highlights: ['Cultural festivals', 'Inti Raymi season', 'Cozy café weather'],
                considerations: ['Gray skies common', 'Fewer beach days']
            },
            'July': {
                rating: 'good',
                temperature: '15-18°C, coolest month',
                rainfall: 'Frequent mist and drizzle',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Independence Day celebrations', 'Winter food specialties', 'Museum season'],
                considerations: ['Limited sunshine', 'Book accommodations early']
            },
            'August': {
                rating: 'good',
                temperature: '15-18°C, still cool',
                rainfall: 'Misty conditions',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Cultural events', 'Wine harvest nearby', 'Indoor attractions peak'],
                considerations: ['Pack warm clothes', 'Advance bookings essential']
            },
            'September': {
                rating: 'excellent',
                temperature: '16-19°C, warming up',
                rainfall: 'Decreasing mist',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Weather improving', 'Spring flowers', 'Great for neighborhood walks', 'Festival season'],
                considerations: ['Still pack layers']
            },
            'October': {
                rating: 'excellent',
                temperature: '17-20°C, pleasant spring',
                rainfall: 'Very little',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Beautiful spring weather', 'Clear skies return', 'Perfect city exploration', 'Outdoor dining season'],
                considerations: ['UV protection needed']
            },
            'November': {
                rating: 'very-good',
                temperature: '19-22°C, warming nicely',
                rainfall: 'Rare',
                crowds: 'low',
                prices: 'low',
                highlights: ['Excellent weather', 'Great deals', 'Fewer tourists', 'Beach season begins'],
                considerations: ['Book summer activities early']
            },
            'December': {
                rating: 'very-good',
                temperature: '21-25°C, summer begins',
                rainfall: 'Very rare',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Summer weather returns', 'Holiday celebrations', 'Beach activities resume', 'New Year festivities'],
                considerations: ['Holiday bookings fill up']
            }
        }
    },
    'cusco': {
        destination: 'Cusco',
        country: 'Peru',
        bestMonths: ['May', 'June', 'July', 'August', 'September'],
        peakSeason: ['June', 'July', 'August'],
        shoulderSeason: ['May', 'September', 'October'],
        lowSeason: ['November', 'December', 'January', 'February', 'March', 'April'],
        avoidMonths: ['January', 'February'],
        reasons: {
            weather: 'Dry season (May-September) offers clear skies and minimal rain. Wet season can disrupt Machu Picchu visits.',
            crowds: 'Peak season brings crowds but guaranteed clear weather. Book Machu Picchu permits well in advance.',
            prices: 'Highest prices June-August. Significant savings in wet season, but weather risks.',
            activities: 'Hiking season is May-September. Many mountain trails closed during wet season.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'poor',
                temperature: '11-16°C, cool and wet',
                rainfall: 'Heavy daily rains (160mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Lowest prices', 'Green landscapes', 'Fewer crowds'],
                considerations: ['Frequent rain delays', 'Machu Picchu often cloudy', 'Muddy hiking trails', 'Pack serious rain gear']
            },
            'February': {
                rating: 'poor',
                temperature: '11-16°C, wettest month',
                rainfall: 'Very heavy rains (130mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Rock-bottom prices', 'Lush vegetation', 'Cultural indoor activities'],
                considerations: ['Inca Trail closed for maintenance', 'Frequent weather delays', 'Limited outdoor activities']
            },
            'March': {
                rating: 'fair',
                temperature: '11-16°C, rains decreasing',
                rainfall: 'Moderate to heavy (100mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Inca Trail reopens', 'Improving weather', 'Good deals still available'],
                considerations: ['Still quite rainy', 'Muddy conditions', 'Limited clear mountain views']
            },
            'April': {
                rating: 'good',
                temperature: '10-15°C, transitional',
                rainfall: 'Decreasing (45mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Inca Trail season begins', 'Weather improving', 'Good photography opportunities'],
                considerations: ['Still some rainy days', 'Pack rain protection', 'Book treks in advance']
            },
            'May': {
                rating: 'excellent',
                temperature: '8-13°C, crisp and clear',
                rainfall: 'Very low (10mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Dry season begins', 'Crystal clear mountain views', 'Perfect hiking weather', 'Machu Picchu at its best'],
                considerations: ['Cool mornings and evenings', 'Altitude acclimatization needed', 'Book permits early']
            },
            'June': {
                rating: 'excellent',
                temperature: '6-12°C, cold but clear',
                rainfall: 'Almost none (5mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Inti Raymi festival', 'Guaranteed clear skies', 'Peak hiking season', 'Best Machu Picchu conditions'],
                considerations: ['Very cold nights', 'Book everything months ahead', 'Pack warm clothes', 'Altitude sickness common']
            },
            'July': {
                rating: 'excellent',
                temperature: '6-12°C, coldest but clearest',
                rainfall: 'Virtually none (5mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Perfect weather', 'Clearest mountain views', 'All trails accessible', 'Peak festival season'],
                considerations: ['Extremely cold nights', 'Highest prices', 'Advance bookings essential', 'Expect crowds everywhere']
            },
            'August': {
                rating: 'excellent',
                temperature: '8-14°C, warming slightly',
                rainfall: 'Minimal (10mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Still excellent weather', 'Great for all activities', 'Clear photography', 'Festival season continues'],
                considerations: ['Still very busy', 'Premium pricing', 'Book 6+ months ahead', 'Cold nights continue']
            },
            'September': {
                rating: 'excellent',
                temperature: '10-16°C, warming up',
                rainfall: 'Low (25mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Weather still excellent', 'Crowds thinning', 'Better availability', 'Spring flowers blooming'],
                considerations: ['Occasional afternoon showers', 'Still need warm clothes', 'Good compromise month']
            },
            'October': {
                rating: 'good',
                temperature: '12-17°C, pleasant',
                rainfall: 'Increasing (60mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Still good hiking weather', 'Fewer crowds', 'Spring colors', 'Good deals returning'],
                considerations: ['Rain season approaching', 'Afternoon showers possible', 'Pack rain gear']
            },
            'November': {
                rating: 'fair',
                temperature: '12-17°C, getting wetter',
                rainfall: 'Moderate (90mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Good deals available', 'Green landscapes', 'Fewer tourists'],
                considerations: ['Increasing rain', 'Some trail limitations', 'Weather can be unpredictable']
            },
            'December': {
                rating: 'fair',
                temperature: '11-16°C, wet season begins',
                rainfall: 'Heavy (140mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Holiday celebrations', 'Lowest prices', 'Cultural experiences'],
                considerations: ['Rain season fully underway', 'Limited outdoor activities', 'Plan indoor alternatives']
            }
        }
    },
    'bogota': {
        destination: 'Bogotá',
        country: 'Colombia',
        bestMonths: ['December', 'January', 'February', 'July', 'August'],
        peakSeason: ['December', 'January', 'July', 'August'],
        shoulderSeason: ['February', 'March', 'June', 'September'],
        lowSeason: ['April', 'May', 'October', 'November'],
        avoidMonths: ['April', 'May', 'October', 'November'],
        reasons: {
            weather: 'Bogotá has two dry seasons (Dec-Feb, Jul-Aug) and two wet seasons. Eternal spring climate but elevation means cool temperatures.',
            crowds: 'Peak seasons align with local holidays and international tourism. Shoulder seasons offer good weather with fewer crowds.',
            prices: 'Highest during holiday periods. Best deals during rainy seasons.',
            activities: 'Outdoor activities best during dry seasons. Museums and cultural sites excellent year-round.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'excellent',
                temperature: '12-17°C, dry season peak',
                rainfall: 'Low (40mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Clear skies', 'Perfect for city walks', 'Excellent mountain views', 'Festival season'],
                considerations: ['Tourist season', 'Book ahead', 'Cool evenings']
            },
            'February': {
                rating: 'very-good',
                temperature: '13-18°C, still dry',
                rainfall: 'Low (50mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Good weather continues', 'Fewer crowds than January', 'Great for outdoor dining'],
                considerations: ['Gradually getting wetter', 'Pack light jacket']
            },
            'March': {
                rating: 'good',
                temperature: '13-18°C, transitional',
                rainfall: 'Increasing (80mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Spring-like weather', 'Good deals emerging', 'Cultural events'],
                considerations: ['Rain increasing', 'Pack umbrella', 'Indoor backup plans']
            },
            'April': {
                rating: 'fair',
                temperature: '13-18°C, wet season begins',
                rainfall: 'Heavy (120mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Lowest prices', 'Green landscapes', 'Museum season'],
                considerations: ['First rainy season', 'Daily afternoon showers', 'Indoor activities recommended']
            },
            'May': {
                rating: 'fair',
                temperature: '13-18°C, rainy',
                rainfall: 'Moderate to heavy (90mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Great museum weather', 'Excellent coffee shop season', 'Low tourist numbers'],
                considerations: ['Frequent rain', 'Plan indoor activities', 'Waterproof clothing essential']
            },
            'June': {
                rating: 'good',
                temperature: '12-17°C, improving',
                rainfall: 'Moderate (50mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Weather improving', 'Pre-dry season deals', 'Good mix of indoor/outdoor'],
                considerations: ['Still some rainy days', 'Cool temperatures', 'Layer clothing']
            },
            'July': {
                rating: 'excellent',
                temperature: '12-17°C, second dry season',
                rainfall: 'Low (40mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Dry season returns', 'Perfect hiking weather', 'Clear mountain views', 'Independence celebrations'],
                considerations: ['Peak season returns', 'Book accommodations early', 'Cool nights']
            },
            'August': {
                rating: 'excellent',
                temperature: '12-17°C, continued dry weather',
                rainfall: 'Low (50mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Excellent outdoor weather', 'Great for day trips', 'Festival season', 'Perfect city exploration'],
                considerations: ['Tourist season', 'Higher prices', 'Advance bookings needed']
            },
            'September': {
                rating: 'good',
                temperature: '12-17°C, transitional',
                rainfall: 'Increasing (70mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Weather still good', 'Crowds decreasing', 'Spring festivals'],
                considerations: ['Rain gradually returning', 'Pack rain protection', 'Good compromise month']
            },
            'October': {
                rating: 'fair',
                temperature: '12-17°C, second wet season',
                rainfall: 'Heavy (110mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Low season prices', 'Indoor cultural season', 'Cozy café weather'],
                considerations: ['Heavy rains return', 'Limited outdoor activities', 'Plan museum visits']
            },
            'November': {
                rating: 'fair',
                temperature: '12-17°C, continued rain',
                rainfall: 'Moderate to heavy (90mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Great deals available', 'Less crowded attractions', 'Cultural experiences'],
                considerations: ['Rainy season continues', 'Waterproof gear essential', 'Indoor focus recommended']
            },
            'December': {
                rating: 'very-good',
                temperature: '12-17°C, dry season returns',
                rainfall: 'Decreasing (50mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Dry season begins', 'Holiday celebrations', 'Great weather returns', 'New Year festivities'],
                considerations: ['Holiday crowds', 'Premium pricing', 'Book early', 'Cool temperatures persist']
            }
        }
    },
    'buenos aires': {
        destination: 'Buenos Aires',
        country: 'Argentina',
        bestMonths: ['March', 'April', 'May', 'September', 'October', 'November'],
        peakSeason: ['December', 'January', 'February'],
        shoulderSeason: ['March', 'April', 'May', 'September', 'October', 'November'],
        lowSeason: ['June', 'July', 'August'],
        avoidMonths: ['July', 'August'],
        reasons: {
            weather: 'Opposite seasons to Northern Hemisphere. Summer can be hot and humid. Winter is mild but can be damp.',
            crowds: 'Peak summer season brings heat and crowds. Shoulder seasons offer perfect weather and reasonable crowds.',
            prices: 'Highest during summer holidays. Winter offers good deals but cooler weather.',
            activities: 'Excellent tango season in fall/spring. Summer great for outdoor dining. Winter perfect for museums.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'good',
                temperature: '23-30°C, hot summer',
                rainfall: 'Moderate (90mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Peak summer energy', 'Outdoor tango', 'Beach nearby', 'Festival season'],
                considerations: ['Very hot and humid', 'Crowds everywhere', 'Book well ahead', 'AC essential']
            },
            'February': {
                rating: 'good',
                temperature: '22-29°C, still hot',
                rainfall: 'Moderate (80mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Carnival season', 'Outdoor dining peak', 'Beach weather continues'],
                considerations: ['Heat and humidity continue', 'Tourist season peak', 'Afternoon thunderstorms']
            },
            'March': {
                rating: 'excellent',
                temperature: '20-26°C, perfect autumn',
                rainfall: 'Moderate (110mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect weather begins', 'Tango season peak', 'Outdoor café culture', 'Harvest festivals'],
                considerations: ['Occasional rain', 'Book tango shows ahead']
            },
            'April': {
                rating: 'excellent',
                temperature: '16-23°C, ideal temperatures',
                rainfall: 'Moderate (100mm)',
                crowds: 'low',
                prices: 'moderate',
                highlights: ['Best weather of year', 'Perfect walking weather', 'Great for neighborhoods', 'Wine harvest'],
                considerations: ['Light jacket for evenings', 'Rain possible']
            },
            'May': {
                rating: 'excellent',
                temperature: '13-19°C, crisp autumn',
                rainfall: 'Low (80mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Beautiful autumn colors', 'Perfect for city walks', 'Museum season begins', 'Cozy café weather'],
                considerations: ['Cooler evenings', 'Pack layers', 'Shorter daylight hours']
            },
            'June': {
                rating: 'good',
                temperature: '10-16°C, mild winter',
                rainfall: 'Low (60mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Mild winter weather', 'Great museum season', 'Indoor tango venues', 'Low season deals'],
                considerations: ['Cooler temperatures', 'Shorter days', 'Pack warm clothes']
            },
            'July': {
                rating: 'fair',
                temperature: '9-15°C, coldest month',
                rainfall: 'Low (60mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Winter tango season', 'Excellent museums', 'Great for indoor culture', 'Lowest prices'],
                considerations: ['Cold temperatures', 'Limited outdoor dining', 'Damp conditions', 'Pack winter clothes']
            },
            'August': {
                rating: 'fair',
                temperature: '10-16°C, still cold',
                rainfall: 'Low (60mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Cultural season peak', 'Great theater season', 'Indoor activities', 'Winter sales'],
                considerations: ['Cold weather continues', 'Limited daylight', 'Indoor focus needed']
            },
            'September': {
                rating: 'very-good',
                temperature: '12-18°C, spring begins',
                rainfall: 'Moderate (80mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Spring weather returns', 'Jacaranda blooms', 'Outdoor dining resumes', 'Perfect city weather'],
                considerations: ['Variable weather', 'Pack layers', 'Rain possible']
            },
            'October': {
                rating: 'excellent',
                temperature: '15-22°C, beautiful spring',
                rainfall: 'Moderate (90mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Peak spring beauty', 'Perfect outdoor weather', 'Excellent for walking', 'Great photography'],
                considerations: ['UV protection needed', 'Occasional spring showers']
            },
            'November': {
                rating: 'excellent',
                temperature: '18-25°C, late spring',
                rainfall: 'Moderate (90mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Excellent weather', 'Pre-summer deals', 'Perfect for all activities', 'Great for day trips'],
                considerations: ['Getting warmer', 'Book summer activities']
            },
            'December': {
                rating: 'good',
                temperature: '21-28°C, summer begins',
                rainfall: 'Moderate (90mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Summer season begins', 'Holiday celebrations', 'Outdoor events return', 'Beach season starts'],
                considerations: ['Getting hot', 'Holiday crowds', 'Book ahead', 'Afternoon storms']
            }
        }
    },
    'rio de janeiro': {
        destination: 'Rio de Janeiro',
        country: 'Brazil',
        bestMonths: ['April', 'May', 'June', 'August', 'September', 'October'],
        peakSeason: ['December', 'January', 'February', 'March'],
        shoulderSeason: ['April', 'May', 'September', 'October', 'November'],
        lowSeason: ['June', 'July', 'August'],
        avoidMonths: [],
        reasons: {
            weather: 'Summer brings intense heat, humidity, and crowds. Winter offers mild temperatures perfect for sightseeing.',
            crowds: 'Carnival and summer holidays create massive crowds. Winter months offer respite with perfect weather.',
            prices: 'Premium pricing during Carnival and summer. Winter offers excellent value with ideal weather.',
            activities: 'Beach activities peak in summer. Hiking and city exploration best in winter. Year-round outdoor culture.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'good',
                temperature: '26-32°C, hot and humid',
                rainfall: 'High (140mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Peak beach season', 'New Year celebrations', 'Outdoor party culture', 'Carnival preparation'],
                considerations: ['Intense heat and humidity', 'Afternoon thunderstorms', 'Crowds everywhere', 'Book months ahead']
            },
            'February': {
                rating: 'very-good',
                temperature: '26-32°C, Carnival month',
                rainfall: 'High (130mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Carnival season!', 'Ultimate beach weather', 'Street party culture', 'Music festivals'],
                considerations: ['Carnival premium pricing', 'Extreme crowds', 'Book 1 year ahead', 'Very hot conditions']
            },
            'March': {
                rating: 'very-good',
                temperature: '25-30°C, still hot',
                rainfall: 'Moderate (110mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Post-Carnival energy', 'Great beach weather', 'Festival season continues', 'Perfect swimming'],
                considerations: ['Still very hot', 'Tourist season continues', 'Afternoon rains', 'UV protection essential']
            },
            'April': {
                rating: 'excellent',
                temperature: '23-28°C, perfect weather begins',
                rainfall: 'Moderate (80mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect temperatures', 'Ideal beach weather', 'Fewer crowds', 'Great for all activities'],
                considerations: ['Occasional rain showers', 'Popular month for locals']
            },
            'May': {
                rating: 'excellent',
                temperature: '21-26°C, ideal conditions',
                rainfall: 'Low (60mm)',
                crowds: 'low',
                prices: 'moderate',
                highlights: ['Best weather of year', 'Perfect for hiking', 'Excellent beach conditions', 'Great photography light'],
                considerations: ['Book outdoor activities', 'Cooler evenings', 'Peak hiking season']
            },
            'June': {
                rating: 'excellent',
                temperature: '19-24°C, mild winter',
                rainfall: 'Low (40mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Perfect hiking weather', 'Clear mountain views', 'Ideal city exploration', 'Winter festivals'],
                considerations: ['Cool for beach swimming', 'Pack light jacket', 'Shorter days']
            },
            'July': {
                rating: 'very-good',
                temperature: '18-23°C, coolest month',
                rainfall: 'Low (40mm)',
                crowds: 'moderate',
                prices: 'low',
                highlights: ['Perfect hiking conditions', 'Clear skies', 'Great for sightseeing', 'Winter break crowds'],
                considerations: ['Too cool for swimming', 'Pack warm clothes', 'Local holiday period']
            },
            'August': {
                rating: 'excellent',
                temperature: '19-24°C, warming up',
                rainfall: 'Low (50mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Excellent weather returns', 'Perfect outdoor activities', 'Great deals', 'Clear skies'],
                considerations: ['Still cool for beach', 'Pack layers', 'Excellent value month']
            },
            'September': {
                rating: 'excellent',
                temperature: '20-25°C, spring begins',
                rainfall: 'Moderate (60mm)',
                crowds: 'low',
                prices: 'moderate',
                highlights: ['Perfect spring weather', 'Beach weather returns', 'Fewer tourists', 'Excellent for everything'],
                considerations: ['Variable weather', 'Pack for all conditions']
            },
            'October': {
                rating: 'excellent',
                temperature: '22-27°C, beautiful spring',
                rainfall: 'Moderate (80mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect temperatures', 'Great beach weather', 'Spring blooms', 'Ideal for all activities'],
                considerations: ['Increasing UV levels', 'Occasional spring rains']
            },
            'November': {
                rating: 'very-good',
                temperature: '23-29°C, pre-summer',
                rainfall: 'Moderate (100mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Warm beach weather', 'Good value still', 'Pre-peak season', 'Great for outdoor dining'],
                considerations: ['Getting hotter', 'Rain increasing', 'Book summer activities']
            },
            'December': {
                rating: 'good',
                temperature: '25-31°C, summer returns',
                rainfall: 'High (130mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Summer season begins', 'New Year preparations', 'Beach culture peaks', 'Holiday energy'],
                considerations: ['Heat and humidity return', 'Crowds building', 'Premium pricing starts', 'Book ahead']
            }
        }
    },
    'santiago': {
        destination: 'Santiago',
        country: 'Chile',
        bestMonths: ['March', 'April', 'May', 'September', 'October', 'November'],
        peakSeason: ['December', 'January', 'February'],
        shoulderSeason: ['March', 'April', 'May', 'September', 'October', 'November'],
        lowSeason: ['June', 'July', 'August'],
        avoidMonths: ['June', 'July'],
        reasons: {
            weather: 'Mediterranean climate with opposite seasons. Summer can be hot with smog. Winter brings rain and snow in mountains.',
            crowds: 'Summer holidays bring crowds and heat. Shoulder seasons offer perfect weather and fewer tourists.',
            prices: 'Peak pricing in summer. Winter offers deals but cooler weather and mountain ski crowds.',
            activities: 'Wine harvest in fall. Summer great for Andes access. Winter perfect for city culture and nearby skiing.'
        },
        monthlyBreakdown: {
            'January': {
                rating: 'good',
                temperature: '20-30°C, hot summer',
                rainfall: 'Very low (3mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Peak summer weather', 'Excellent for Andes trips', 'Outdoor festival season', 'Beach access'],
                considerations: ['Very hot temperatures', 'Smog can be heavy', 'Tourist season peak', 'Book everything ahead']
            },
            'February': {
                rating: 'good',
                temperature: '19-29°C, still hot',
                rainfall: 'Very low (4mm)',
                crowds: 'very-high',
                prices: 'very-high',
                highlights: ['Continued great weather', 'Mountain hiking peak', 'Summer festivals', 'Perfect for day trips'],
                considerations: ['Heat continues', 'Air quality issues', 'Peak tourist period', 'Premium pricing']
            },
            'March': {
                rating: 'excellent',
                temperature: '17-27°C, perfect autumn',
                rainfall: 'Low (8mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect temperatures', 'Wine harvest season', 'Clear mountain views', 'Ideal hiking weather'],
                considerations: ['UV protection needed', 'Book wine tours ahead']
            },
            'April': {
                rating: 'excellent',
                temperature: '13-23°C, ideal conditions',
                rainfall: 'Low (15mm)',
                crowds: 'low',
                prices: 'moderate',
                highlights: ['Best weather of year', 'Wine harvest continues', 'Perfect city exploration', 'Clear skies'],
                considerations: ['Cooler evenings', 'Pack layers', 'Excellent photography weather']
            },
            'May': {
                rating: 'excellent',
                temperature: '10-18°C, crisp autumn',
                rainfall: 'Moderate (60mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Beautiful autumn colors', 'Perfect walking weather', 'Great museum season', 'Wine country ideal'],
                considerations: ['Rain begins', 'Pack warm clothes', 'Shorter daylight']
            },
            'June': {
                rating: 'fair',
                temperature: '8-15°C, wet winter begins',
                rainfall: 'High (80mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Ski season begins nearby', 'Great for indoor culture', 'Low season deals', 'Cozy wine bars'],
                considerations: ['Cold and wet', 'Limited mountain access', 'Pack winter gear', 'Some attractions close']
            },
            'July': {
                rating: 'fair',
                temperature: '7-15°C, coldest month',
                rainfall: 'High (70mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Peak ski season', 'Winter festival season', 'Great museums', 'Indoor cultural activities'],
                considerations: ['Very cold', 'Wet conditions', 'Ski area crowds', 'Limited hiking options']
            },
            'August': {
                rating: 'good',
                temperature: '8-16°C, late winter',
                rainfall: 'Moderate (50mm)',
                crowds: 'low',
                prices: 'low',
                highlights: ['Ski season continues', 'Weather improving', 'Good deals return', 'Spring preparations'],
                considerations: ['Still cold and wet', 'Pack warm clothes', 'Variable conditions']
            },
            'September': {
                rating: 'excellent',
                temperature: '10-19°C, spring begins',
                rainfall: 'Low (20mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Spring weather returns', 'Independence Day celebrations', 'Perfect city weather', 'Mountain access reopens'],
                considerations: ['Variable spring weather', 'Pack layers', 'National holiday crowds']
            },
            'October': {
                rating: 'excellent',
                temperature: '12-22°C, beautiful spring',
                rainfall: 'Low (15mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Perfect temperatures', 'Spring blooms', 'Excellent hiking returns', 'Great for all activities'],
                considerations: ['UV levels increasing', 'Book outdoor activities']
            },
            'November': {
                rating: 'excellent',
                temperature: '15-26°C, late spring',
                rainfall: 'Low (8mm)',
                crowds: 'moderate',
                prices: 'moderate',
                highlights: ['Ideal weather', 'Perfect for wine country', 'Great hiking conditions', 'Pre-summer deals'],
                considerations: ['Getting warmer', 'Book summer activities early']
            },
            'December': {
                rating: 'very-good',
                temperature: '18-28°C, summer begins',
                rainfall: 'Very low (5mm)',
                crowds: 'high',
                prices: 'high',
                highlights: ['Summer weather returns', 'Holiday celebrations', 'Great for outdoor activities', 'Beach season starts'],
                considerations: ['Getting hot', 'Holiday crowds building', 'Book accommodations early']
            }
        }
    }
};
export class TravelTimingService {
    getBestTimeInfo(destination, country) {
        const key = destination.toLowerCase().replace(/[^a-z]/g, '');
        return TRAVEL_TIMING_DATABASE[key] || null;
    }
    getCurrentMonthRating(destination) {
        const info = this.getBestTimeInfo(destination);
        if (!info)
            return 'good';
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const monthData = info.monthlyBreakdown[currentMonth];
        return monthData?.rating || 'good';
    }
    getSeasonalSummary(destination) {
        const info = this.getBestTimeInfo(destination);
        if (!info)
            return 'Year-round destination with mild climate';
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const isBestTime = info.bestMonths.includes(currentMonth);
        const isPeakSeason = info.peakSeason.includes(currentMonth);
        const isAvoidTime = info.avoidMonths.includes(currentMonth);
        if (isAvoidTime) {
            return `Currently not recommended - ${info.reasons.weather}`;
        }
        else if (isBestTime) {
            return `Perfect time to visit! ${info.bestMonths.join(', ')} are ideal months.`;
        }
        else if (isPeakSeason) {
            return `Peak season - expect crowds but great weather. Best months: ${info.bestMonths.join(', ')}`;
        }
        else {
            return `Good time to visit. Best months: ${info.bestMonths.join(', ')}`;
        }
    }
}
export const travelTimingService = new TravelTimingService();
