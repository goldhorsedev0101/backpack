import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

export interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

export interface ItineraryRequest {
  userId: string;
  destination: string;
  duration: number;
  interests: string[];
  travelStyle: string[];
  budget: number;
  language?: string;
}

export async function generateItinerary(request: ItineraryRequest): Promise<ItineraryDay[]> {
  console.log('generateItinerary called with request:', request);
  
  const { destination, duration, interests, travelStyle, budget, language } = request;
  
  // Validate inputs
  if (!destination) {
    throw new Error("Destination is required");
  }
  
  if (!duration || duration < 1) {
    throw new Error("Duration must be at least 1 day");
  }
  
  console.log('Input validation passed. Creating prompt...');
  
  const isHebrew = language === 'he';
  
  const prompt = `You are GlobeMate – an AI travel planner helping solo travelers build day-by-day itineraries.

${isHebrew ? 'IMPORTANT: Respond in Hebrew. All text fields (location, activities, tips) must be in Hebrew.' : ''}

Using the user's preferences:
- Destination: ${destination}
- Duration: ${duration} days
- Interests: ${interests.join(', ')}
- Travel Style: ${travelStyle.join(', ')}
- Daily Budget: $${budget}

Create a full travel itinerary. For each day, include:
- day number (starting from 1)
- location (city or region)
- 2–4 exciting activities or places to visit
- estimatedCost in USD
- 1 helpful local tip

Return the itinerary as a JSON object with an itinerary array, like this:
{
  "itinerary": [
    {
      "day": 1,
      "location": "Medellín",
      "activities": ["Comuna 13 tour", "Coffee tasting", "Cable car ride"],
      "estimatedCost": 40,
      "tips": ["Use the metro to save money"]
    }
  ]
}`;

  try {
    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: `You are GlobeMate, an expert South American travel planner. Always respond with valid JSON only.${isHebrew ? ' Respond in Hebrew - all location, activities, and tips must be in Hebrew.' : ''}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('OpenAI API call successful');
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    console.log('OpenAI response content length:', content.length);

    // Parse the JSON response
    let itinerary: ItineraryDay[];
    try {
      const parsed = JSON.parse(content);
      // Handle both direct array and object with array property
      itinerary = Array.isArray(parsed) ? parsed : parsed.itinerary || parsed.days || [];
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }

    // Validate the structure
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      throw new Error("Invalid itinerary format received");
    }

    // Ensure all required fields are present and properly typed
    const validatedItinerary: ItineraryDay[] = itinerary.map((day, index) => ({
      day: typeof day.day === 'number' ? day.day : index + 1,
      location: typeof day.location === 'string' ? day.location : destination,
      activities: Array.isArray(day.activities) ? day.activities : [],
      estimatedCost: typeof day.estimatedCost === 'number' ? day.estimatedCost : budget,
      tips: Array.isArray(day.tips) ? day.tips : typeof day.tips === 'string' ? [day.tips] : []
    }));

    return validatedItinerary;

  } catch (error) {
    console.error("Error generating itinerary:", error);
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    
    // Re-throw the error instead of using fallback, so we can see what's wrong
    throw error;
  }
}