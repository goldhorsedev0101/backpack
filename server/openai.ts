import OpenAI from "openai";
import { googlePlaces } from './googlePlaces';

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

// Generate personalized travel suggestions for South America based on user preferences
export async function generateTravelSuggestions(
  preferences: {
    travelStyle?: string[];
    budget?: number;
    duration?: string;
    interests?: string[];
    preferredCountries?: string[];
    language?: string;
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
    const durationStr = preferences.duration || 'Flexible';
    const interestsStr = preferences.interests?.join(', ') || 'General exploration';
    const countriesStr = preferences.preferredCountries?.join(', ') || 'Any South American country';

    const isHebrew = preferences.language === 'he';
    
    const prompt = `You are GlobeMate – a smart, friendly, and social travel planner built for Gen Z and solo travelers.  
Your mission is to help travelers discover personalized, exciting, and budget-conscious trips across South America.

${isHebrew ? 'IMPORTANT: Respond in Hebrew. All text fields (destination, country, description, bestTimeToVisit, highlights) must be in Hebrew.' : ''}

Using the following preferences:
- Travel Style: ${travelStylesStr}
- Budget: ${budgetStr}
- Duration: ${durationStr}
- Interests: ${interestsStr}
- Preferred Countries: ${countriesStr}

Provide 3 trip suggestions in a JSON format.  
Each suggestion should feel exciting and tailored, not generic.

For each suggestion, include:
- destination (city or region name)
- country
- description: 2–3 sentence overview (inspiring and clear)
- bestTimeToVisit: e.g., "April to June"
- estimatedBudget: {low, high} in USD
- highlights: 3–5 key attractions or activities
- travelStyle: relevant styles (e.g., adventure, culture, relax)
- duration: how long to stay (e.g., "7–10 days")

Make sure the suggestions are diverse — different vibes, locations and experiences. Speak like a local travel buddy, not a formal guide.

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    {
      "destination": "string",
      "country": "string",
      "description": "string",
      "bestTimeToVisit": "string",
      "estimatedBudget": {"low": number, "high": number},
      "highlights": ["string", "string", "string"],
      "travelStyle": ["string", "string"],
      "duration": "string"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are GlobeMate, a smart and friendly travel planner for Gen Z and solo travelers exploring South America. Provide exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy, not a formal guide.${preferences.language === 'he' ? ' Respond in Hebrew - all descriptions, highlights, and text must be in Hebrew.' : ''}`
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
    console.log('OpenAI response content:', content);
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const result = JSON.parse(content);
    console.log('Parsed OpenAI result:', result);
    
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
          content: "You are a local South American travel guide. Create detailed day-by-day itineraries in JSON format: [{day, location, activities: [], estimatedCost, tips: []}]"
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

Provide budget optimization recommendations for South American travel, focusing on practical savings opportunities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a budget travel expert for South America. Analyze spending patterns and provide practical optimization suggestions in JSON format: [{category, currentSpending, recommendedBudget, tips: [], potentialSavings}]"
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
  context: ChatContext = {}
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are GlobeMate – a smart, friendly, and social travel planner built for Gen Z and solo travelers.

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

Focus on South American travel experiences.${contextInfo}`
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
  previousSuggestions: TripSuggestion[] = []
): Promise<TripSuggestion[]> {
  try {
    const conversationText = chatHistory.map(h => `${h.role}: ${h.content}`).join('\n');
    const previousDestinations = previousSuggestions.map(s => `${s.destination}, ${s.country}`).join('; ');
    
    const prompt = `You are GlobeMate – a smart, friendly, and social travel planner built for Gen Z and solo travelers.

Based on this conversation, generate 3 exciting, personalized trip suggestions for South America:

Conversation:
${conversationText}

IMPORTANT: Do not suggest these previously mentioned destinations: ${previousDestinations}

Generate 3 trip suggestions in JSON format. Each suggestion should include:
- destination: city or region
- country: South American country  
- description: 2–3 engaging sentences
- bestTimeToVisit: e.g., "April to June"
- estimatedBudget: {low, high} in USD
- highlights: 3–5 key places or experiences
- travelStyle: ["adventure", "chill", etc.]
- duration: how long to stay (e.g., "7–10 days")

Make sure the suggestions are diverse — different vibes, locations and experiences. Speak like a local travel buddy, not a formal guide.

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are GlobeMate, a smart and friendly travel planner for Gen Z and solo travelers exploring South America. Generate exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy."
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
  }
): Promise<string> {
  try {
    const chatContext: ChatContext = {
      userTrips: context?.userTrips,
      currentLocation: context?.currentLocation,
      travelPreferences: context?.travelPreferences
    };
    
    const response = await conversationalTripAssistant(message, chatContext);
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