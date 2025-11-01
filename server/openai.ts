import OpenAI from "openai";
import { googlePlaces } from './googlePlaces.js';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

export interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  realPlaces?: RealPlace[];
  destinationBreakdown?: {
    destination: string;
    country: string;
    description: string;
    highlights: string[];
    duration: string;
    dateRange?: string;
  }[];
  transportation?: {
    from: string;
    to: string;
    recommendations: string[];
    estimatedCost?: string;
    estimatedTime?: string;
  }[];
}

export interface TripItinerary {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

export interface BudgetOptimization {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  tips: string[];
  potentialSavings: number;
}

export interface ChatContext {
  userTrips?: any[];
  currentLocation?: string;
  travelPreferences?: any;
  previousSuggestions?: TripSuggestion[];
  chatHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface ConversationalResponse {
  type: 'question' | 'suggestions' | 'general';
  message: string;
  suggestions?: TripSuggestion[];
  missingInfo?: string[];
  nextActions?: string[];
}

// Generate personalized travel suggestions worldwide based on user preferences
export async function generateTravelSuggestions(
  preferences: {
    travelStyle?: string[];
    budget?: number;
    duration?: string | number;
    interests?: string[];
    preferredCountries?: string[];
    specificCity?: string;
    language?: string;
    adults?: number;
    children?: number;
    tripType?: string;
    destinations?: Array<{
      country: string;
      city?: string;
      startDate?: Date;
      endDate?: Date;
    }>;
  }
): Promise<TripSuggestion[]> {
  try {
    // Add API key check
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Generating suggestions with preferences:', preferences);
    
    const travelStylesStr = preferences.travelStyle?.join(', ') || 'Flexible';
    const budgetStr = preferences.budget ? `$${preferences.budget}` : 'Flexible';
    // Convert duration to days if it's a number, otherwise use the string as-is
    const durationStr = typeof preferences.duration === 'number' 
      ? `${preferences.duration} days` 
      : preferences.duration || 'Flexible';
    const interestsStr = preferences.interests?.join(', ') || 'General exploration';
    const countriesStr = preferences.preferredCountries?.join(', ') || 'Any country worldwide';
    const specificCity = preferences.specificCity;
    const adults = preferences.adults || 2;
    const children = preferences.children || 0;
    const tripType = preferences.tripType || 'family';

    const isHebrew = preferences.language === 'he';
    
    console.log('Countries string for OpenAI prompt:', countriesStr);
    console.log('Specific city for OpenAI prompt:', specificCity);
    console.log('Multi-city destinations:', preferences.destinations);
    
    // Check if this is a multi-city trip
    const isMultiCity = preferences.destinations && preferences.destinations.length > 1;
    
    // Build multi-city destinations string with date ranges
    const multiCityStr = isMultiCity 
      ? preferences.destinations!.map((dest, idx) => {
          const cityPart = dest.city ? `${dest.city}, ` : '';
          let datesPart = '';
          if (dest.startDate && dest.endDate) {
            const formatDate = (date: Date) => {
              const d = new Date(date);
              return d.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { 
                month: 'short', 
                day: 'numeric' 
              });
            };
            datesPart = ` (${formatDate(dest.startDate)} - ${formatDate(dest.endDate)})`;
          }
          return `${idx + 1}. ${cityPart}${dest.country}${datesPart}`;
        }).join('\n')
      : '';
    
    // Build the location constraint based on trip type
    const locationConstraint = isMultiCity
      ? `⚠️ CRITICAL MULTI-CITY TRIP REQUIREMENTS ⚠️

This is a MULTI-CITY trip with ${preferences.destinations!.length} destinations that the user wants to visit:
${multiCityStr}

🚨 MANDATORY REQUIREMENTS - READ CAREFULLY:
1. You MUST create suggestions that include ALL ${preferences.destinations!.length} destinations
2. DO NOT create suggestions for only one city - the user wants to visit multiple cities
3. EVERY suggestion must visit: ${preferences.destinations!.map(d => `${d.city || ''} ${d.country}`.trim()).join(' AND ')}
4. Use the "destinationBreakdown" field to provide details for EACH destination separately
5. Use the "transportation" field to suggest how to travel between consecutive destinations

Required JSON structure for multi-city:
- destinationBreakdown: Array with ${preferences.destinations!.length} objects (one per destination)
- transportation: Array with ${preferences.destinations!.length - 1} objects (between each pair of cities)
- Overall "destination" field should be a creative name for the multi-city journey
- Overall "description" should explain the full multi-city experience

Example: If user selected Paris → Rome → Barcelona, your suggestion should cover ALL THREE cities with breakdown and transportation between them.`
      : specificCity 
        ? `CRITICAL: The user has selected a SPECIFIC CITY: ${specificCity} in ${countriesStr}
You MUST provide 3 trip suggestions ONLY for ${specificCity} specifically. All suggestions must be about ${specificCity}, not other cities in ${countriesStr}.`
        : `CRITICAL: The user has selected these specific countries: ${countriesStr}
You MUST provide trip suggestions ONLY for destinations within these countries. Do NOT suggest destinations in other countries.`;
    
    const travelerComposition = children > 0 
      ? `${adults} adult${adults > 1 ? 's' : ''} and ${children} child${children > 1 ? 'ren' : ''}`
      : `${adults} adult${adults > 1 ? 's' : ''}`;
    
    // Build concise user prompt (critical instructions now in system message)
    const prompt = `Create 3 diverse trip suggestions with these preferences:

Trip Details:
- Travelers: ${travelerComposition} (${tripType} trip)
- Travel Styles: ${travelStylesStr}
- Budget: ${budgetStr}
- Duration: ${durationStr}
- Interests: ${interestsStr}

${isMultiCity ? `
Multi-City Destinations (visit ALL ${preferences.destinations!.length} cities):
${preferences.destinations!.map((d, i) => {
  const cityPart = d.city ? `${d.city}, ` : '';
  const dates = d.startDate && d.endDate 
    ? ` (${new Date(d.startDate).toLocaleDateString()} - ${new Date(d.endDate).toLocaleDateString()})`
    : '';
  return `${i+1}. ${cityPart}${d.country}${dates}`;
}).join('\n')}
` : specificCity 
  ? `Specific City: ${specificCity} in ${countriesStr}` 
  : `Countries: ${countriesStr}`}

${children > 0 ? 'Family-friendly with child-appropriate activities.' : ''}
${tripType === 'honeymoon' ? 'Romantic and intimate experiences for couples.' : ''}
${tripType === 'solo' ? 'Safe solo-friendly activities and social opportunities.' : ''}
${tripType === 'couples' ? 'Romantic couple-friendly activities.' : ''}

Make each suggestion exciting, personalized, and diverse in theme/style.`;

    console.log('🚀 Sending prompt to OpenAI (multi-city:', isMultiCity, ')');
    if (isMultiCity) {
      console.log('📍 Multi-city destinations:', preferences.destinations);
    }

    // Build strict system message for multi-city trips
    const systemMessage = isMultiCity 
      ? `You are GlobeMate, a smart and friendly travel planner. 

MANDATORY RULES FOR THIS MULTI-CITY TRIP:
1. The user selected ${preferences.destinations!.length} destinations: ${preferences.destinations!.map(d => `${d.city || ''} ${d.country}`.trim()).join(' → ')}
2. You MUST create suggestions that cover ALL ${preferences.destinations!.length} destinations
3. EVERY suggestion must include a "destinationBreakdown" array with EXACTLY ${preferences.destinations!.length} objects (one per destination)
4. EVERY suggestion must include a "transportation" array with EXACTLY ${preferences.destinations!.length - 1} objects (between consecutive destinations)
5. The "destination" field should be a creative name for the full multi-city journey (not just the first city)
6. DO NOT create suggestions for only one destination - cover all ${preferences.destinations!.length} cities

REQUIRED JSON STRUCTURE FOR MULTI-CITY:
{
  "suggestions": [
    {
      "destination": "Creative multi-city journey name",
      "country": "All countries separated by ' & ' (e.g., 'Italy & United Kingdom' or 'France & Spain & Germany')",
      "description": "2-3 sentence overview of full journey",
      "bestTimeToVisit": "Best season",
      "estimatedBudget": {"low": number, "high": number},
      "highlights": ["Highlight from destination 1", "Highlight from destination 2", "Highlight from destination 3"],
      "travelStyle": ["style1", "style2"],
      "duration": "Total trip duration",
      "destinationBreakdown": [
        {
          "destination": "City 1 name",
          "country": "Country 1",
          "description": "What makes this city special",
          "highlights": ["Activity 1", "Activity 2", "Activity 3"],
          "duration": "Days in this city",
          "dateRange": "Date range for this city"
        },
        // ... EXACTLY ${preferences.destinations!.length} objects total
      ],
      "transportation": [
        {
          "from": "City 1",
          "to": "City 2",
          "recommendations": ["Option 1 with cost/time", "Option 2 with cost/time"],
          "estimatedCost": "Cost range",
          "estimatedTime": "Time range"
        },
        // ... EXACTLY ${preferences.destinations!.length - 1} objects total
      ]
    }
  ]
}

CRITICAL: The "country" field for multi-city trips MUST include ALL countries visited, separated by " & ".
Example: If trip goes to Rome (Italy) → London (UK), country should be "Italy & United Kingdom"
Example: If trip goes to Paris (France) → Rome (Italy) → Barcelona (Spain), country should be "France & Italy & Spain"

${preferences.language === 'he' ? 'LANGUAGE: Respond in Hebrew - all text fields must be in Hebrew.' : 'LANGUAGE: Respond in English'}

Return ONLY valid JSON with NO extra text. Be authentic and inspiring.`
      : `You are GlobeMate, a smart and friendly travel planner for Gen Z and solo travelers exploring the world. Provide exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy, not a formal guide.${preferences.language === 'he' ? ' Respond in Hebrew - all descriptions, highlights, and text must be in Hebrew.' : ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    console.log('✅ OpenAI response received (length:', content?.length, ')');
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const result = JSON.parse(content);
    console.log('📦 Parsed OpenAI result:', JSON.stringify(result, null, 2));
    
    // Check if destinationBreakdown exists for multi-city trips
    if (isMultiCity) {
      const firstSuggestion = result.suggestions?.[0];
      console.log('🔍 First suggestion has destinationBreakdown?', !!firstSuggestion?.destinationBreakdown);
      console.log('🔍 First suggestion has transportation?', !!firstSuggestion?.transportation);
      if (firstSuggestion?.destinationBreakdown) {
        console.log('📍 Breakdown count:', firstSuggestion.destinationBreakdown.length);
      }
      if (firstSuggestion?.transportation) {
        console.log('✈️ Transportation count:', firstSuggestion.transportation.length);
      }
    }
    
    // Handle different response formats
    const suggestions = result.suggestions || result.trips || result;
    let baseSuggestions: TripSuggestion[];
    
    if (Array.isArray(suggestions)) {
      baseSuggestions = suggestions;
    } else if (Array.isArray(result)) {
      baseSuggestions = result;
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Temporarily disable real places enrichment to fix timeout issues
    console.log('Skipping real places enrichment for now...');
    
    return baseSuggestions;
  } catch (error) {
    console.error('Error generating travel suggestions:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    throw new Error(`Failed to generate travel suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate detailed itinerary for a specific trip
export async function generateItinerary(
  destination: string,
  duration: number,
  budget: number,
  preferences: string[]
): Promise<TripItinerary[]> {
  try {
    const prompt = `Create a detailed ${duration}-day itinerary for ${destination} with a budget of $${budget}. 
    
Preferences: ${preferences.join(', ')}

Include daily activities, estimated costs, and practical tips. Focus on authentic local experiences and budget-friendly options.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced world travel guide. Create detailed day-by-day itineraries in JSON format: [{day, location, activities: [], estimatedCost, tips: []}]"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const result = JSON.parse(response.choices[0].message.content || '{"itinerary": []}');
    return result.itinerary || result.days || [];
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary');
  }
}

// Analyze expenses and provide budget optimization suggestions
export async function analyzeBudget(
  expenses: Array<{
    category: string;
    amount: number;
    description: string;
    location?: string;
  }>,
  totalBudget: number
): Promise<BudgetOptimization[]> {
  try {
    const expenseBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const prompt = `Analyze this travel budget and provide optimization suggestions:

Total Budget: $${totalBudget}
Total Spent: $${totalSpent}

Expense Breakdown:
${Object.entries(expenseBreakdown).map(([category, amount]) => `${category}: $${amount}`).join('\n')}

Recent Expenses:
${expenses.slice(-10).map(e => `${e.category}: $${e.amount} - ${e.description}`).join('\n')}

Provide budget optimization recommendations for global travel, focusing on practical savings opportunities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a budget travel expert. Analyze spending patterns and provide practical optimization suggestions in JSON format: [{category, currentSpending, recommendedBudget, tips: [], potentialSavings}]"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || '{"optimizations": []}');
    return result.optimizations || result.suggestions || [];
  } catch (error) {
    console.error('Error analyzing budget:', error);
    throw new Error('Failed to analyze budget');
  }
}

// Generate travel recommendations based on community reviews
export async function generateRecommendations(
  destination: string,
  reviews: Array<{
    rating: number;
    comment: string;
    tags?: string[];
  }>
): Promise<string[]> {
  try {
    const reviewSummary = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n');

    const prompt = `Based on these community reviews for ${destination}, generate 5-7 personalized travel recommendations:

${reviewSummary}

Focus on practical tips, hidden gems, and advice that addresses common concerns mentioned in the reviews.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a local travel expert. Generate practical travel recommendations based on community feedback. Respond with a JSON object containing an array of recommendation strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// Enhanced conversational AI that maintains chat history and generates trip suggestions
export async function conversationalTripAssistant(
  message: string,
  context: ChatContext = {},
  language: string = 'en'
): Promise<ConversationalResponse> {
  try {
    const { userTrips = [], travelPreferences, previousSuggestions = [], chatHistory = [] } = context;
    
    // Extract information from chat history
    const chatText = chatHistory.map(h => `${h.role}: ${h.content}`).join('\n');
    const previousDestinations = previousSuggestions.map(s => s.destination).join(', ');
    
    const contextInfo = `
Current context:
- User trips: ${userTrips.length} trips planned
- Previous suggestions: ${previousDestinations || 'None'}
- Travel style: ${travelPreferences?.style || 'Not specified'}
- Chat history length: ${chatHistory.length} messages

Previous conversation:
${chatText}
`;

    const isHebrew = language === 'he';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are GlobeMate – a smart, friendly, and social travel planner built for Gen Z and solo travelers.

${isHebrew ? 'CRITICAL INSTRUCTION: You MUST respond ONLY in Hebrew. All your messages, questions, and responses must be written entirely in Hebrew.' : ''}

Your role is to:
1. Provide personalized travel suggestions based on the user's preferences.
2. Maintain conversation continuity and remember what has been discussed.
3. Generate trip suggestions when you have enough information.

When receiving new input, do the following:
- Check if the user has provided a destination, interests, duration, travel style, and daily budget.
- If anything is missing, ask follow-up questions in a casual, helpful tone (use emojis if you want).
- Once you have all the info, indicate that you're ready to generate suggestions.
- Do not repeat destinations from previous suggestions: ${previousDestinations}

If you have enough information to generate suggestions, respond with:
"GENERATE_SUGGESTIONS" followed by your response.

Style:
- Write like a friendly, adventurous local friend – not like a travel agent.
- Be energetic, positive, and clear.
- Ask one question at a time to avoid overwhelming the user.
${isHebrew ? '- Remember: ALL responses must be in Hebrew.' : ''}

Focus on worldwide travel experiences.${contextInfo}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const aiResponse = response.choices[0].message.content || '';
    
    // Check if AI wants to generate suggestions
    if (aiResponse.includes('GENERATE_SUGGESTIONS')) {
      return {
        type: 'suggestions',
        message: aiResponse.replace('GENERATE_SUGGESTIONS', '').trim(),
        suggestions: [],
        nextActions: ['generate', 'modify', 'save']
      };
    }
    
    return {
      type: 'question',
      message: aiResponse,
      missingInfo: []
    };
    
  } catch (error) {
    console.error('Error in conversational trip assistant:', error);
    throw new Error('Failed to get response from travel assistant');
  }
}

// Generate suggestions with conversation context
export async function generateConversationalSuggestions(
  chatHistory: Array<{role: 'user' | 'assistant'; content: string;}>,
  previousSuggestions: TripSuggestion[] = [],
  language: string = 'en'
): Promise<TripSuggestion[]> {
  try {
    const conversationText = chatHistory.map(h => `${h.role}: ${h.content}`).join('\n');
    const previousDestinations = previousSuggestions.map(s => `${s.destination}, ${s.country}`).join('; ');
    const isHebrew = language === 'he';
    
    const prompt = `You are GlobeMate – a smart, friendly, and social travel planner built for Gen Z and solo travelers.

${isHebrew ? 'CRITICAL INSTRUCTION: You MUST generate ALL content in Hebrew. All fields including destination names must be in Hebrew. For example: "פריז" not "Paris", "טוקיו" not "Tokyo", "ברצלונה" not "Barcelona". Everything must be written in Hebrew.' : ''}

Based on this conversation, generate 3 exciting, personalized trip suggestions:

Conversation:
${conversationText}

CRITICAL RULES:
1. If the user asks for suggestions about a SPECIFIC country or region (e.g., "Brazil", "Japan", "Europe"), ALL 3 suggestions MUST be destinations WITHIN that country/region.
   - Example: If user asks about Brazil → suggest Rio de Janeiro, São Paulo, Amazon
   - Example: If user asks about Japan → suggest Tokyo, Kyoto, Osaka
2. If the user asks for general travel suggestions without specifying a location, suggest diverse destinations worldwide.
3. Do not suggest these previously mentioned destinations: ${previousDestinations}

Generate 3 trip suggestions in JSON format. Each suggestion should include:
- destination: city or region name ${isHebrew ? '(MUST be in Hebrew, e.g., "פריז", "טוקיו", "ברצלונה")' : ''}
- country: country name ${isHebrew ? '(MUST be in Hebrew, e.g., "צרפת", "יפן", "ספרד")' : ''}
- description: 2–3 engaging sentences ${isHebrew ? '(MUST be in Hebrew)' : ''}
- bestTimeToVisit: e.g., ${isHebrew ? '"אפריל עד יוני" or "ספטמבר עד נובמבר" (MUST be in Hebrew)' : '"April to June"'}
- estimatedBudget: {low, high} in USD
- highlights: 3–5 key places or experiences ${isHebrew ? '(MUST be in Hebrew)' : ''}
- travelStyle: array of travel styles ${isHebrew ? '(MUST be in Hebrew, e.g., ["הרפתקאות", "תרבות", "רגוע"])' : '(e.g., ["adventure", "culture", "relaxation"])'}
- duration: how long to stay ${isHebrew ? '(MUST be in Hebrew, e.g., "7-10 ימים")' : '(e.g., "7–10 days")'}

Make sure the suggestions are diverse — different vibes, locations and experiences. Speak like a local travel buddy, not a formal guide.
${isHebrew ? 'Remember: ALL text content INCLUDING destination names must be in Hebrew.' : ''}

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    {
      "destination": "string",
      "country": "string", 
      "description": "string",
      "bestTimeToVisit": "string",
      "estimatedBudget": {"low": number, "high": number},
      "highlights": ["string"],
      "travelStyle": ["string"],
      "duration": "string"
    }
  ]
}`;

    const systemMessage = isHebrew 
      ? "You are GlobeMate, a smart and friendly travel planner for Gen Z and solo travelers exploring the world. Generate exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy. CRITICAL: You MUST write EVERYTHING in Hebrew, including destination names. For example: פריז (not Paris), טוקיו (not Tokyo), ברצלונה (not Barcelona)."
      : "You are GlobeMate, a smart and friendly travel planner for Gen Z and solo travelers exploring the world. Generate exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const result = JSON.parse(content);
    const baseSuggestions = result.suggestions || [];
    
    // Enrich suggestions with real places
    if (baseSuggestions.length > 0) {
      console.log('Enriching conversational suggestions with real places...');
      const enrichedSuggestions = await enrichSuggestionsWithRealPlaces(baseSuggestions);
      return enrichedSuggestions;
    }
    
    return baseSuggestions;
    
  } catch (error) {
    console.error('Error generating conversational suggestions:', error);
    throw new Error('Failed to generate trip suggestions');
  }
}

// Legacy chat assistant for backward compatibility  
export async function chatAssistant(
  message: string,
  context?: {
    userTrips?: any[];
    currentLocation?: string;
    travelPreferences?: any;
  },
  language: string = 'en'
): Promise<string> {
  try {
    const chatContext: ChatContext = {
      userTrips: context?.userTrips,
      currentLocation: context?.currentLocation,
      travelPreferences: context?.travelPreferences
    };
    
    const response = await conversationalTripAssistant(message, chatContext, language);
    return response.message;
  } catch (error) {
    console.error('Error in chat assistant:', error);
    throw new Error('Failed to get response from travel assistant');
  }
}

// Enrich trip suggestions with real places from Google Places API
export async function enrichSuggestionsWithRealPlaces(suggestions: TripSuggestion[]): Promise<TripSuggestion[]> {
  try {
    console.log('Enriching suggestions with real places...');
    
    // Add timeout wrapper for the entire enrichment process
    const enrichmentPromise = Promise.all(
      suggestions.map(async (suggestion) => {
        const realPlaces: RealPlace[] = [];
        
        // Limit to first 2 highlights to avoid timeout
        const limitedHighlights = suggestion.highlights.slice(0, 2);
        
        // Search for real places for each highlight
        for (const highlight of limitedHighlights) {
          try {
            console.log(`Searching for: ${highlight} in ${suggestion.destination}, ${suggestion.country}`);
            
            // Search for places using Google Places API with timeout
            const searchQuery = `${highlight} ${suggestion.destination} ${suggestion.country}`;
            const searchPromise = googlePlaces.searchPlaces(searchQuery, 'tourist_attraction', `${suggestion.destination}, ${suggestion.country}`);
            
            // Add 5 second timeout for each search
            const timeoutPromise = new Promise<any[]>((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), 5000)
            );
            
            const places = await Promise.race([searchPromise, timeoutPromise]);
            
            // Get only the top place for this highlight
            const topPlace = places[0];
            
            if (topPlace) {
              // Generate Google Maps link
              const googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${topPlace.place_id}`;
              
              realPlaces.push({
                title: topPlace.name,
                link: googleMapsLink,
                source: "Google",
                placeId: topPlace.place_id,
                rating: topPlace.rating,
                address: topPlace.formatted_address,
                photoUrl: undefined // Skip photo fetching to avoid additional delays
              });
            }
          } catch (error) {
            console.error(`Error searching for ${highlight}:`, error);
            // Continue with other highlights even if one fails
          }
        }
        
        return {
          ...suggestion,
          realPlaces
        };
      })
    );
    
    // Add 15 second timeout for the entire enrichment process
    const timeoutPromise = new Promise<TripSuggestion[]>((_, reject) => 
      setTimeout(() => reject(new Error('Enrichment timeout')), 15000)
    );
    
    const enrichedSuggestions = await Promise.race([enrichmentPromise, timeoutPromise]);
    
    console.log('Successfully enriched suggestions with real places');
    return enrichedSuggestions;
    
  } catch (error) {
    console.error('Error enriching suggestions with real places:', error);
    // Return original suggestions if enrichment fails
    return suggestions;
  }
}