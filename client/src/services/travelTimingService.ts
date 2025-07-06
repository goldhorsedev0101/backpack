// Client-side travel timing service with South American destination data

interface TravelTimingInfo {
  destination: string;
  country: string;
  bestMonths: string[];
  peakSeason: string[];
  shoulderSeason: string[];
  lowSeason: string[];
  avoidMonths: string[];
  reasons: {
    weather: string;
    crowds: string;
    prices: string;
    activities: string;
  };
  monthlyBreakdown: {
    [month: string]: {
      rating: 'excellent' | 'very-good' | 'good' | 'fair' | 'poor';
      temperature: string;
      rainfall: string;
      crowds: 'low' | 'moderate' | 'high' | 'very-high';
      prices: 'low' | 'moderate' | 'high' | 'very-high';
      highlights: string[];
      considerations: string[];
    };
  };
}

const TRAVEL_TIMING_DATABASE: { [key: string]: TravelTimingInfo } = {
  'lima': {
    destination: 'Lima',
    country: 'Peru',
    bestMonths: ['April', 'May', 'September', 'October', 'November'],
    peakSeason: ['June', 'July', 'August'],
    shoulderSeason: ['April', 'May', 'September', 'October', 'November'],
    lowSeason: ['December', 'January', 'February', 'March'],
    avoidMonths: ['June', 'July', 'August'],
    reasons: {
      weather: 'Coastal desert climate with gray, humid winters (June-October) and sunny, warm summers. Winter months have persistent fog and drizzle.',
      crowds: 'Peak season coincides with Northern Hemisphere summer holidays. Low season during gray winter months.',
      prices: 'Highest during sunny months and international holidays. Winter offers better accommodation deals.',
      activities: 'City sightseeing excellent year-round. Beach activities best December-April. Cultural sites accessible always.'
    },
    monthlyBreakdown: {
      'January': {
        rating: 'very-good',
        temperature: '22-28°C, warm and sunny',
        rainfall: 'Very low (1mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Sunny weather', 'Perfect for beaches', 'Outdoor dining', 'Clear skies'],
        considerations: ['Can be humid', 'New Year crowds early month']
      },
      'February': {
        rating: 'excellent',
        temperature: '23-29°C, warmest month',
        rainfall: 'Very low (1mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Best weather of year', 'Warmest temperatures', 'Ideal for all activities', 'Low tourist numbers'],
        considerations: ['Hottest month', 'UV levels high']
      },
      'March': {
        rating: 'excellent',
        temperature: '22-28°C, still warm',
        rainfall: 'Very low (1mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Excellent weather continues', 'Fewer crowds', 'Great for exploration', 'Perfect temperatures'],
        considerations: ['End of summer season', 'Weather starting to cool']
      },
      'April': {
        rating: 'excellent',
        temperature: '20-25°C, pleasant',
        rainfall: 'Very low (1mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Perfect temperatures', 'Clear skies', 'Comfortable for walking', 'Excellent value'],
        considerations: ['Autumn begins', 'Evenings cooler']
      },
      'May': {
        rating: 'very-good',
        temperature: '18-22°C, mild',
        rainfall: 'Low (5mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Mild pleasant weather', 'Good for city exploration', 'Few tourists', 'Comfortable temperatures'],
        considerations: ['Getting cooler', 'Gray skies beginning']
      },
      'June': {
        rating: 'poor',
        temperature: '16-19°C, cool and gray',
        rainfall: 'Low but misty (8mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Cultural activities', 'Museum weather', 'Fewer mosquitos'],
        considerations: ['Gray garúa season begins', 'Persistent fog', 'Tourist high season', 'Cool and damp']
      },
      'July': {
        rating: 'poor',
        temperature: '15-18°C, coolest',
        rainfall: 'Low but misty (8mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Independence Day celebrations', 'Cultural events', 'Indoor attractions'],
        considerations: ['Peak gray season', 'Coldest month', 'Highest crowds', 'Persistent mist and fog']
      },
      'August': {
        rating: 'poor',
        temperature: '15-18°C, gray',
        rainfall: 'Low but misty (8mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Cultural season peak', 'Good for museums', 'Gastronomy tours'],
        considerations: ['Continued gray weather', 'High tourist season', 'Cool temperatures', 'Limited sunshine']
      },
      'September': {
        rating: 'good',
        temperature: '16-19°C, transitional',
        rainfall: 'Low (8mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Gray season ending', 'Spring beginning', 'Fewer crowds', 'Cultural events'],
        considerations: ['Still some gray days', 'Weather improving', 'Transitional period']
      },
      'October': {
        rating: 'very-good',
        temperature: '17-21°C, improving',
        rainfall: 'Very low (3mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Weather clearing', 'More sunshine', 'Pleasant temperatures', 'Good for all activities'],
        considerations: ['Variable weather', 'Some gray days possible']
      },
      'November': {
        rating: 'very-good',
        temperature: '19-23°C, warming',
        rainfall: 'Very low (2mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Clear skies returning', 'Warming temperatures', 'Great for outdoor activities', 'Low crowds'],
        considerations: ['Weather can be variable', 'Summer approaching']
      },
      'December': {
        rating: 'very-good',
        temperature: '21-26°C, warm returning',
        rainfall: 'Very low (1mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Summer weather returns', 'Clear sunny days', 'Warm temperatures', 'Christmas atmosphere'],
        considerations: ['Holiday crowds building', 'Weather fully improved']
      }
    }
  },
  'cusco': {
    destination: 'Cusco',
    country: 'Peru',
    bestMonths: ['May', 'June', 'July', 'August', 'September'],
    peakSeason: ['June', 'July', 'August'],
    shoulderSeason: ['April', 'May', 'September', 'October'],
    lowSeason: ['November', 'December', 'January', 'February', 'March'],
    avoidMonths: ['January', 'February'],
    reasons: {
      weather: 'High altitude climate with distinct dry season (May-September) perfect for trekking and wet season (December-March) with afternoon rains.',
      crowds: 'Dry season brings peak crowds for Machu Picchu. Wet season offers solitude but challenging conditions.',
      prices: 'Highest during dry season and Inti Raymi festival. Wet season offers significant savings.',
      activities: 'Trekking season aligns with dry months. Cultural sites accessible year-round with altitude considerations.'
    },
    monthlyBreakdown: {
      'January': {
        rating: 'poor',
        temperature: '6-19°C, wet season peak',
        rainfall: 'Very high (160mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Lowest prices', 'Green landscapes', 'Fewer tourists'],
        considerations: ['Heavy daily rains', 'Inca Trail closed', 'High altitude + wet conditions', 'Muddy conditions']
      },
      'February': {
        rating: 'poor',
        temperature: '6-19°C, continued rains',
        rainfall: 'Very high (140mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Inca Trail closure continues', 'Lush scenery', 'Cultural immersion'],
        considerations: ['Inca Trail closed for maintenance', 'Daily afternoon storms', 'Transportation delays', 'Altitude sickness risk']
      },
      'March': {
        rating: 'fair',
        temperature: '6-20°C, rains decreasing',
        rainfall: 'High (110mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Inca Trail reopens', 'Rains decreasing', 'Beautiful landscapes', 'Good value'],
        considerations: ['Still rainy season', 'Muddy trail conditions', 'Variable weather', 'Altitude adjustment needed']
      },
      'April': {
        rating: 'good',
        temperature: '4-21°C, shoulder season',
        rainfall: 'Moderate (60mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Shoulder season begins', 'Good weather improving', 'Moderate crowds', 'Easter celebrations'],
        considerations: ['Transitional weather', 'Some rain still possible', 'Cool mornings', 'Book Machu Picchu ahead']
      },
      'May': {
        rating: 'excellent',
        temperature: '2-21°C, dry season begins',
        rainfall: 'Low (20mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Dry season starts', 'Perfect trekking weather', 'Clear mountain views', 'Moderate tourists'],
        considerations: ['Cool nights', 'High altitude', 'Popular month', 'Book tours in advance']
      },
      'June': {
        rating: 'excellent',
        temperature: '0-20°C, peak dry season',
        rainfall: 'Very low (5mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Perfect weather', 'Inti Raymi festival', 'Best trekking conditions', 'Clear skies'],
        considerations: ['Peak season crowds', 'Highest prices', 'Very cold nights', 'Book months ahead']
      },
      'July': {
        rating: 'excellent',
        temperature: '0-21°C, continued dry',
        rainfall: 'Very low (5mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Ideal trekking weather', 'Crystal clear views', 'Perfect for Machu Picchu', 'Stable conditions'],
        considerations: ['Peak tourist season', 'Freezing nights', 'Very expensive', 'Extremely crowded']
      },
      'August': {
        rating: 'excellent',
        temperature: '2-21°C, dry continues',
        rainfall: 'Very low (8mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Excellent weather continues', 'Best photography conditions', 'Peak trekking season'],
        considerations: ['Still peak season', 'Cold nights persist', 'Premium pricing', 'Book well ahead']
      },
      'September': {
        rating: 'excellent',
        temperature: '4-22°C, warming',
        rainfall: 'Low (20mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Excellent weather', 'Fewer crowds than peak', 'Good value', 'Warmer temperatures'],
        considerations: ['Shoulder season', 'Still popular', 'Cool mornings', 'Weather remains stable']
      },
      'October': {
        rating: 'very-good',
        temperature: '7-23°C, spring',
        rainfall: 'Moderate (50mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Spring conditions', 'Good weather', 'Moderate crowds', 'Reasonable prices'],
        considerations: ['Rains beginning to return', 'Variable weather', 'Still good for trekking']
      },
      'November': {
        rating: 'good',
        temperature: '8-23°C, wet season approaching',
        rainfall: 'High (90mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Low season value', 'Fewer tourists', 'Green landscapes emerging'],
        considerations: ['Rains increasing', 'Weather becoming unpredictable', 'Muddy conditions starting']
      },
      'December': {
        rating: 'fair',
        temperature: '7-20°C, wet season returns',
        rainfall: 'High (130mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Holiday atmosphere', 'Summer solstice', 'Cultural celebrations'],
        considerations: ['Wet season returns', 'Daily afternoon rains', 'Holiday crowds', 'Weather deteriorating']
      }
    }
  },
  'bogota': {
    destination: 'Bogotá',
    country: 'Colombia',
    bestMonths: ['December', 'January', 'February', 'July', 'August'],
    peakSeason: ['December', 'January', 'June', 'July'],
    shoulderSeason: ['February', 'March', 'August', 'September'],
    lowSeason: ['April', 'May', 'October', 'November'],
    avoidMonths: ['April', 'May', 'October', 'November'],
    reasons: {
      weather: 'Eternal spring climate with two dry seasons and two wet seasons. Stable temperatures year-round due to equatorial highland location.',
      crowds: 'Peak tourism during Northern Hemisphere holidays and local vacation periods. Two distinct dry seasons affect visitor patterns.',
      prices: 'Premium pricing during holidays and dry seasons. Wet seasons offer better accommodation rates.',
      activities: 'Cultural activities excellent year-round. Outdoor excursions best during dry periods. Museums and indoor attractions always accessible.'
    },
    monthlyBreakdown: {
      'January': {
        rating: 'excellent',
        temperature: '6-19°C, dry season peak',
        rainfall: 'Low (40mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Perfect weather', 'Dry sunny days', 'Clear mountain views', 'Ideal for walking'],
        considerations: ['New Year crowds', 'Higher prices', 'Cool mornings', 'Popular month']
      },
      'February': {
        rating: 'excellent',
        temperature: '7-20°C, continued dry',
        rainfall: 'Low (50mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Excellent weather continues', 'Fewer crowds than January', 'Great for outdoor activities'],
        considerations: ['Dry season ending', 'Occasional afternoon showers', 'Cool evenings']
      },
      'March': {
        rating: 'good',
        temperature: '8-20°C, transitional',
        rainfall: 'Moderate (80mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Spring-like conditions', 'Good for city exploration', 'Cultural events'],
        considerations: ['Rains increasing', 'Variable weather', 'Afternoon showers possible']
      },
      'April': {
        rating: 'fair',
        temperature: '9-19°C, wet season begins',
        rainfall: 'High (120mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Low tourist numbers', 'Green landscapes', 'Good museum weather'],
        considerations: ['Wet season peak', 'Daily afternoon rains', 'High humidity', 'Limited outdoor activities']
      },
      'May': {
        rating: 'fair',
        temperature: '9-19°C, continued rains',
        rainfall: 'High (100mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Fewer tourists', 'Lower prices', 'Lush scenery'],
        considerations: ['Rainy season continues', 'Cloudy days', 'Muddy conditions', 'Indoor activities preferred']
      },
      'June': {
        rating: 'good',
        temperature: '8-18°C, mid-year transition',
        rainfall: 'Moderate (60mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['School holidays', 'Weather improving', 'Cultural events'],
        considerations: ['Local holiday season', 'Crowds from domestic tourism', 'Cooler temperatures']
      },
      'July': {
        rating: 'excellent',
        temperature: '7-18°C, second dry season',
        rainfall: 'Low (40mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Second dry season', 'Perfect for outdoor activities', 'Clear skies', 'Festival season'],
        considerations: ['Peak tourist season', 'High prices', 'Cool temperatures', 'Book accommodations ahead']
      },
      'August': {
        rating: 'excellent',
        temperature: '7-18°C, dry continues',
        rainfall: 'Low (40mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Continued dry weather', 'Excellent for sightseeing', 'Cool comfortable temperatures'],
        considerations: ['Still high season', 'Cool evenings', 'Popular with locals', 'Advance booking needed']
      },
      'September': {
        rating: 'good',
        temperature: '8-19°C, shoulder season',
        rainfall: 'Moderate (70mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Shoulder season', 'Good weather balance', 'Moderate tourists', 'Pleasant conditions'],
        considerations: ['Rains returning gradually', 'Variable conditions', 'Pack rain gear']
      },
      'October': {
        rating: 'fair',
        temperature: '9-19°C, wet season returns',
        rainfall: 'High (120mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Low season pricing', 'Fewer crowds', 'Good for indoor attractions'],
        considerations: ['Second wet season begins', 'Frequent rains', 'Cloudy weather', 'High humidity']
      },
      'November': {
        rating: 'fair',
        temperature: '9-19°C, peak wet season',
        rainfall: 'Very high (140mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Lowest prices', 'Minimal crowds', 'Cultural immersion opportunities'],
        considerations: ['Wettest month', 'Daily heavy rains', 'Flooding possible', 'Limited outdoor activities']
      },
      'December': {
        rating: 'excellent',
        temperature: '7-19°C, dry season returns',
        rainfall: 'Low (50mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Holiday season', 'Dry weather returns', 'Christmas markets', 'Festive atmosphere'],
        considerations: ['Holiday crowds', 'Peak pricing', 'Book well ahead', 'Cool temperatures']
      }
    }
  },
  'buenosaires': {
    destination: 'Buenos Aires',
    country: 'Argentina',
    bestMonths: ['March', 'April', 'May', 'September', 'October', 'November'],
    peakSeason: ['December', 'January', 'February'],
    shoulderSeason: ['March', 'April', 'May', 'September', 'October', 'November'],
    lowSeason: ['June', 'July', 'August'],
    avoidMonths: ['June', 'July'],
    reasons: {
      weather: 'Temperate climate with opposite seasons to Northern Hemisphere. Hot humid summers, mild autumns/springs, cool winters.',
      crowds: 'Summer brings local and international tourists. Winter months see fewer visitors but cultural scene remains active.',
      prices: 'Peak pricing during summer holidays. Winter offers excellent value with active cultural calendar.',
      activities: 'Tango season peaks in winter. Summer perfect for outdoor cafes and parks. Cultural activities excellent year-round.'
    },
    monthlyBreakdown: {
      'January': {
        rating: 'good',
        temperature: '20-30°C, peak summer',
        rainfall: 'Moderate (100mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Peak summer energy', 'Outdoor dining', 'Long daylight hours', 'Beach nearby'],
        considerations: ['Very hot and humid', 'Highest crowds', 'Many locals vacation away', 'Some businesses closed']
      },
      'February': {
        rating: 'good',
        temperature: '19-28°C, late summer',
        rainfall: 'Moderate (110mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Summer continues', 'Carnaval celebrations', 'Outdoor festivals', 'Warm evenings'],
        considerations: ['Still very hot', 'Humid conditions', 'Tourist season continues', 'Higher prices persist']
      },
      'March': {
        rating: 'excellent',
        temperature: '16-26°C, autumn begins',
        rainfall: 'High (130mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Perfect temperatures', 'Beautiful autumn colors', 'Comfortable walking weather', 'Fewer crowds'],
        considerations: ['Occasional rains', 'Weather can be variable', 'Light jacket for evenings']
      },
      'April': {
        rating: 'excellent',
        temperature: '12-23°C, mid-autumn',
        rainfall: 'Moderate (90mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Ideal weather', 'Perfect for walking', 'Great for outdoor cafes', 'Excellent value'],
        considerations: ['Cooler evenings', 'Some rainy days', 'Jacket recommended']
      },
      'May': {
        rating: 'excellent',
        temperature: '9-19°C, late autumn',
        rainfall: 'Low (70mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Crisp clear days', 'Perfect for city exploration', 'Comfortable temperatures', 'Low tourist numbers'],
        considerations: ['Getting cooler', 'Shorter days', 'Pack warm clothes for evenings']
      },
      'June': {
        rating: 'poor',
        temperature: '6-15°C, early winter',
        rainfall: 'Low (50mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Tango high season begins', 'Cozy cafes', 'Cultural events', 'Winter charm'],
        considerations: ['Cold weather', 'Short daylight hours', 'Need warm clothing', 'Some outdoor venues closed']
      },
      'July': {
        rating: 'poor',
        temperature: '5-14°C, mid-winter',
        rainfall: 'Low (60mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Winter cultural season', 'Indoor venues excel', 'Tango shows peak', 'Cozy atmosphere'],
        considerations: ['Coldest month', 'Very short days', 'Central heating needed', 'Limited outdoor dining']
      },
      'August': {
        rating: 'fair',
        temperature: '7-16°C, late winter',
        rainfall: 'Low (60mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Winter season continues', 'Cultural calendar full', 'Good museum weather', 'Authentic local experience'],
        considerations: ['Still cold', 'Variable weather', 'Spring hints appearing', 'Warm clothes essential']
      },
      'September': {
        rating: 'very-good',
        temperature: '9-19°C, early spring',
        rainfall: 'Low (70mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Spring arrives', 'Warmer days', 'Outdoor activities return', 'Jacaranda blooms'],
        considerations: ['Variable spring weather', 'Cool mornings', 'Pack layers']
      },
      'October': {
        rating: 'excellent',
        temperature: '12-22°C, mid-spring',
        rainfall: 'Moderate (90mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Beautiful spring weather', 'Perfect temperatures', 'Outdoor dining returns', 'City comes alive'],
        considerations: ['Some rainy days', 'Weather can change quickly', 'Popular month']
      },
      'November': {
        rating: 'excellent',
        temperature: '15-25°C, late spring',
        rainfall: 'Moderate (90mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Excellent weather', 'Long warm days', 'Perfect for all activities', 'Pre-summer energy'],
        considerations: ['Getting warmer', 'Occasional storms', 'Crowds building toward summer']
      },
      'December': {
        rating: 'good',
        temperature: '18-28°C, early summer',
        rainfall: 'Moderate (100mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Summer season begins', 'Holiday atmosphere', 'Long daylight', 'Outdoor festivals'],
        considerations: ['Getting hot and humid', 'Holiday crowds arrive', 'Prices increase', 'Book ahead']
      }
    }
  },
  'riodejaneiro': {
    destination: 'Rio de Janeiro',
    country: 'Brazil',
    bestMonths: ['April', 'May', 'June', 'August', 'September', 'October'],
    peakSeason: ['December', 'January', 'February', 'March'],
    shoulderSeason: ['April', 'May', 'September', 'October', 'November'],
    lowSeason: ['June', 'July', 'August'],
    avoidMonths: ['January', 'February'],
    reasons: {
      weather: 'Tropical coastal climate with hot humid summers (Dec-Mar) and mild pleasant winters. Summer can be overwhelming with heat and crowds.',
      crowds: 'Peak crowds during Carnaval and summer holidays. Winter offers respite from both heat and tourists.',
      prices: 'Extreme premium during Carnaval. Summer months expensive. Winter provides excellent value.',
      activities: 'Beach season peaks with summer heat. Year-round sightseeing with winter being most comfortable for exploring.'
    },
    monthlyBreakdown: {
      'January': {
        rating: 'poor',
        temperature: '24-30°C, peak summer heat',
        rainfall: 'High (130mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Beach season peak', 'New Year energy', 'Summer festivals', 'Ocean activities'],
        considerations: ['Extremely hot and humid', 'Overwhelming crowds', 'Very expensive', 'Daily afternoon storms']
      },
      'February': {
        rating: 'poor',
        temperature: '24-30°C, Carnaval heat',
        rainfall: 'High (120mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Carnaval season', 'Beach culture peak', 'Vibrant nightlife', 'Cultural celebrations'],
        considerations: ['Carnaval crowds', 'Extreme prices', 'Sweltering heat', 'Accommodation scarce', 'Heavy rains']
      },
      'March': {
        rating: 'fair',
        temperature: '23-29°C, late summer',
        rainfall: 'High (110mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Post-Carnaval energy', 'Still great for beaches', 'Warm ocean temperatures'],
        considerations: ['Very hot and humid', 'Frequent rain storms', 'High prices continue', 'Crowded beaches']
      },
      'April': {
        rating: 'excellent',
        temperature: '21-27°C, autumn comfort',
        rainfall: 'Moderate (80mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Perfect temperatures', 'Fewer crowds', 'Great for sightseeing', 'Comfortable beach weather'],
        considerations: ['Occasional rain', 'Humidity decreasing', 'Excellent overall conditions']
      },
      'May': {
        rating: 'excellent',
        temperature: '19-25°C, ideal weather',
        rainfall: 'Low (60mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Ideal temperatures', 'Low humidity', 'Perfect for outdoor activities', 'Great value'],
        considerations: ['Cooler evenings', 'Excellent weather for exploring', 'Tourist numbers down']
      },
      'June': {
        rating: 'excellent',
        temperature: '18-23°C, winter begins',
        rainfall: 'Low (40mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Perfect mild weather', 'Minimal crowds', 'Excellent for sightseeing', 'Clear skies'],
        considerations: ['Too cool for beach', 'Shorter days', 'Bring light jacket for evenings']
      },
      'July': {
        rating: 'very-good',
        temperature: '17-23°C, mid-winter',
        rainfall: 'Low (40mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Mild comfortable weather', 'Perfect for walking', 'Cultural events', 'Clear views'],
        considerations: ['Winter vacation season for locals', 'Cool for beach activities', 'Excellent for city exploration']
      },
      'August': {
        rating: 'excellent',
        temperature: '18-24°C, late winter',
        rainfall: 'Low (50mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Perfect weather for sightseeing', 'Comfortable temperatures', 'Clear skies', 'Low tourist numbers'],
        considerations: ['Still too cool for beach', 'Light jacket needed for evenings', 'Excellent for outdoor activities']
      },
      'September': {
        rating: 'excellent',
        temperature: '19-25°C, spring begins',
        rainfall: 'Low (60mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Spring weather arrives', 'Perfect temperatures', 'Independence Day celebrations', 'Excellent conditions'],
        considerations: ['Weather warming up', 'Great transition month', 'Beach weather returning']
      },
      'October': {
        rating: 'excellent',
        temperature: '20-26°C, spring peak',
        rainfall: 'Moderate (80mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Excellent weather', 'Perfect for all activities', 'Spring energy', 'Great beach weather returns'],
        considerations: ['Crowds starting to build', 'Occasional spring rains', 'Popular month']
      },
      'November': {
        rating: 'very-good',
        temperature: '22-27°C, pre-summer',
        rainfall: 'High (100mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Warm beach weather', 'Good for outdoor activities', 'Pre-summer energy'],
        considerations: ['Getting hotter', 'Humidity increasing', 'Rains returning', 'Crowds building']
      },
      'December': {
        rating: 'good',
        temperature: '23-29°C, summer returns',
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
        rating: 'fair',
        temperature: '12-29°C, peak summer',
        rainfall: 'Very low (1mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Peak summer', 'Long daylight hours', 'Andes access excellent', 'Outdoor activities'],
        considerations: ['Very hot', 'Smog issues', 'Extreme crowds', 'Water restrictions possible']
      },
      'February': {
        rating: 'fair',
        temperature: '12-28°C, late summer',
        rainfall: 'Very low (3mm)',
        crowds: 'high',
        prices: 'high',
        highlights: ['Summer continues', 'Harvest season begins', 'Great for wine tours', 'Mountain access'],
        considerations: ['Still very hot', 'Air quality concerns', 'Tourist season continues', 'Dry conditions']
      },
      'March': {
        rating: 'excellent',
        temperature: '9-26°C, autumn begins',
        rainfall: 'Low (8mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Perfect weather', 'Harvest season peak', 'Ideal temperatures', 'Wine country excellent'],
        considerations: ['Occasional heat waves', 'Excellent overall', 'Popular with wine tourists']
      },
      'April': {
        rating: 'excellent',
        temperature: '6-22°C, mid-autumn',
        rainfall: 'Low (13mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Ideal temperatures', 'Beautiful autumn colors', 'Perfect for walking', 'Wine harvest'],
        considerations: ['Cooler evenings', 'Excellent weather', 'Great value period']
      },
      'May': {
        rating: 'excellent',
        temperature: '3-18°C, late autumn',
        rainfall: 'Moderate (60mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Crisp clear days', 'Perfect for city exploration', 'Snow-capped Andes views', 'Low crowds'],
        considerations: ['Getting cooler', 'Rain increases', 'Pack warm clothes for evenings']
      },
      'June': {
        rating: 'poor',
        temperature: '1-15°C, early winter',
        rainfall: 'High (80mm)',
        crowds: 'low',
        prices: 'low',
        highlights: ['Ski season begins', 'Cozy city atmosphere', 'Cultural events', 'Andes skiing'],
        considerations: ['Cold and rainy', 'Short daylight', 'Need warm clothing', 'Limited outdoor activities']
      },
      'July': {
        rating: 'poor',
        temperature: '0-14°C, mid-winter',
        rainfall: 'High (76mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Peak ski season', 'Winter sports', 'Cultural calendar full', 'Cozy cafes'],
        considerations: ['Coldest month', 'Frequent rain', 'Skiing crowds', 'Central heating needed']
      },
      'August': {
        rating: 'fair',
        temperature: '2-16°C, late winter',
        rainfall: 'High (56mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Ski season continues', 'Cultural events', 'Winter charm', 'Indoor attractions'],
        considerations: ['Still cold and rainy', 'Variable weather', 'Spring hints', 'Warm clothes needed']
      },
      'September': {
        rating: 'excellent',
        temperature: '4-19°C, spring begins',
        rainfall: 'Moderate (25mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Spring arrives', 'Independence Day', 'Perfect weather', 'Cherry blossoms'],
        considerations: ['Variable spring weather', 'National holidays', 'Weather improving rapidly']
      },
      'October': {
        rating: 'excellent',
        temperature: '7-22°C, mid-spring',
        rainfall: 'Low (15mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Beautiful spring weather', 'Perfect temperatures', 'Outdoor activities return', 'Clear mountain views'],
        considerations: ['Some variable weather', 'Popular month', 'Excellent overall conditions']
      },
      'November': {
        rating: 'excellent',
        temperature: '9-25°C, late spring',
        rainfall: 'Low (8mm)',
        crowds: 'moderate',
        prices: 'moderate',
        highlights: ['Excellent weather', 'Perfect for all activities', 'Pre-summer energy', 'Ideal conditions'],
        considerations: ['Getting warmer', 'Popular month', 'Crowds building toward summer']
      },
      'December': {
        rating: 'good',
        temperature: '11-27°C, early summer',
        rainfall: 'Very low (4mm)',
        crowds: 'very-high',
        prices: 'very-high',
        highlights: ['Summer begins', 'Holiday atmosphere', 'Long days', 'Mountain access'],
        considerations: ['Getting hot', 'Crowds arrive', 'Prices increase', 'Smog season begins']
      }
    }
  }
};

export class TravelTimingService {
  getBestTimeInfo(destination: string, country?: string): TravelTimingInfo | null {
    const key = destination.toLowerCase().replace(/[^a-z]/g, '');
    return TRAVEL_TIMING_DATABASE[key] || null;
  }

  getCurrentMonthRating(destination: string): string {
    const info = this.getBestTimeInfo(destination);
    if (!info) return 'good';
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const monthData = info.monthlyBreakdown[currentMonth];
    return monthData?.rating || 'good';
  }

  getSeasonalSummary(destination: string): string {
    const info = this.getBestTimeInfo(destination);
    if (!info) return 'Year-round destination with mild climate';
    
    const currentRating = this.getCurrentMonthRating(destination);
    const bestMonths = info.bestMonths.slice(0, 3).join(', ');
    
    return `Currently ${currentRating}. Best months: ${bestMonths}`;
  }

  getAvailableDestinations(): string[] {
    return Object.keys(TRAVEL_TIMING_DATABASE);
  }
}

export const travelTimingService = new TravelTimingService();
export type { TravelTimingInfo };