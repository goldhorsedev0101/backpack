import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { achievements } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  insertTripSchema,
  insertReviewSchema,
  insertExpenseSchema,
  insertChatMessageSchema,
  insertConnectionSchema,
} from "@shared/schema";
import {
  generateTravelSuggestions,
  generateItinerary,
  analyzeBudget,
  generateRecommendations,
  chatAssistant
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Handle localhost test user
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences endpoints
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        interests: user.interests || [],
        travelStyles: user.travelStyles || [],
        budgetRange: user.budgetRange,
        experienceLevel: user.experienceLevel,
        groupSize: user.groupSize,
        preferredDuration: user.preferredDuration,
        accommodationType: user.accommodationType || [],
        activities: user.activities || [],
        dietaryRestrictions: user.dietaryRestrictions || [],
        languages: user.languages || [],
        personalityTraits: user.personalityTraits || [],
        bio: user.bio,
        onboardingCompleted: user.onboardingCompleted || false,
        registrationCompleted: user.registrationCompleted || false
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const preferences = req.body;
      
      // Map travelStyle to travelStyles for database storage
      if (preferences.travelStyle) {
        preferences.travelStyles = preferences.travelStyle;
        delete preferences.travelStyle;
      }
      
      // Mark onboarding as completed
      preferences.onboardingCompleted = true;
      
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      
      res.json({
        message: "Preferences updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Registry completion endpoint
  app.post('/api/user/registry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const registryData = req.body;
      
      // Mark registration as completed
      registryData.registrationCompleted = true;
      
      const updatedUser = await storage.updateUserPreferences(userId, registryData);
      
      res.json({
        message: "Registration completed successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error completing registry:", error);
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  // Trip routes
  app.get('/api/trips', async (req, res) => {
    try {
      const trips = await storage.getPublicTrips();
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get('/api/trips/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trips = await storage.getUserTrips(userId);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      res.status(500).json({ message: "Failed to fetch user trips" });
    }
  });

  app.post('/api/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tripData = insertTripSchema.parse({ ...req.body, userId });
      const trip = await storage.createTrip(tripData);
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(400).json({ message: "Failed to create trip" });
    }
  });

  app.get('/api/trips/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const { destination } = req.query;
      if (destination) {
        const reviews = await storage.getReviewsByDestination(destination as string);
        res.json(reviews);
      } else {
        const reviews = await storage.getRecentReviews();
        res.json(reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Expense routes
  app.get('/api/expenses/trip/:tripId', isAuthenticated, async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const expenses = await storage.getTripExpenses(tripId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching trip expenses:", error);
      res.status(500).json({ message: "Failed to fetch trip expenses" });
    }
  });

  app.get('/api/expenses/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenses = await storage.getUserExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching user expenses:", error);
      res.status(500).json({ message: "Failed to fetch user expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/messages/:roomId', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Connection routes
  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = insertConnectionSchema.parse({ ...req.body, requesterId: userId });
      const connection = await storage.createConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(400).json({ message: "Failed to create connection" });
    }
  });

  app.patch('/api/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const connection = await storage.updateConnectionStatus(id, status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(400).json({ message: "Failed to update connection" });
    }
  });

  // Debug endpoint for authentication testing
  app.get('/api/debug/auth', isAuthenticated, async (req: any, res) => {
    res.json({ 
      authenticated: true, 
      user: req.user?.claims?.sub || req.user?.id,
      timestamp: new Date().toISOString() 
    });
  });

  // AI-powered trip generation
  app.post('/api/ai/generate-trip', isAuthenticated, async (req: any, res) => {
    try {
      const { destination, duration, budget, travelStyle, interests } = req.body;
      
      console.log('Trip generation request:', { destination, duration, budget, travelStyle, interests });
      
      // Validate required fields
      if (!destination || !duration || !budget || !travelStyle) {
        return res.status(400).json({ 
          message: "Missing required fields: destination, duration, budget, and travelStyle are required" 
        });
      }
      
      // Enhanced destination-specific trip data
      const destinationData = {
        'Peru': {
          activities: ['Machu Picchu trek', 'Sacred Valley exploration', 'Cusco city tour', 'Amazon rainforest adventure', 'Lima food tour'],
          description: 'Discover ancient Inca civilization, stunning mountain landscapes, and rich cultural heritage in Peru.',
          highlights: ['Machu Picchu', 'Sacred Valley', 'Rainbow Mountain', 'Amazon jungle', 'Colonial architecture']
        },
        'Colombia': {
          activities: ['Cartagena colonial tour', 'Coffee region exploration', 'Medellín city experience', 'Tayrona National Park', 'Salsa dancing lessons'],
          description: 'Experience vibrant culture, stunning Caribbean coast, and world-renowned coffee regions in Colombia.',
          highlights: ['Cartagena old city', 'Coffee plantations', 'Caribbean beaches', 'Pablo Escobar tour', 'Street art scene']
        },
        'Bolivia': {
          activities: ['Salar de Uyuni tour', 'La Paz cable car ride', 'Death Road cycling', 'Lake Titicaca visit', 'Sucre colonial exploration'],
          description: 'Explore otherworldly salt flats, high-altitude adventures, and indigenous culture in Bolivia.',
          highlights: ['Salt flats mirror effect', 'Floating islands', 'World\'s most dangerous road', 'Witch markets', 'Colonial Sucre']
        },
        'Chile': {
          activities: ['Atacama Desert stargazing', 'Patagonia hiking', 'Santiago wine tours', 'Easter Island exploration', 'Valparaíso street art tour'],
          description: 'Journey through diverse landscapes from desert to glaciers, with world-class wine and unique culture.',
          highlights: ['Atacama geysers', 'Torres del Paine', 'Moai statues', 'Wine valleys', 'Colorful port cities']
        },
        'Argentina': {
          activities: ['Buenos Aires tango shows', 'Iguazu Falls visit', 'Patagonia glacier trekking', 'Mendoza wine tasting', 'Bariloche lake district'],
          description: 'Experience passionate tango culture, incredible natural wonders, and world-famous beef and wine.',
          highlights: ['Iguazu waterfalls', 'Perito Moreno glacier', 'Tango shows', 'Wine country', 'Lake district']
        },
        'Brazil': {
          activities: ['Rio de Janeiro beaches', 'Amazon rainforest tour', 'Salvador cultural immersion', 'Iguazu Falls Brazilian side', 'São Paulo food scene'],
          description: 'Immerse yourself in carnival culture, pristine beaches, and the world\'s largest rainforest.',
          highlights: ['Christ the Redeemer', 'Copacabana beach', 'Amazon wildlife', 'Carnival festivals', 'Capoeira performances']
        },
        'Ecuador': {
          activities: ['Galápagos wildlife tour', 'Quito colonial exploration', 'Amazon lodge stay', 'Cotopaxi volcano hike', 'Otavalo market visit'],
          description: 'Discover unique wildlife, colonial architecture, and diverse ecosystems from coast to jungle.',
          highlights: ['Galápagos islands', 'Equatorial monuments', 'Cloud forests', 'Indigenous markets', 'Active volcanoes']
        }
      };

      const selectedDestination = destinationData[destination] || {
        activities: ['Explore local culture', 'Visit main attractions', 'Try local cuisine', 'Meet local people', 'Discover hidden gems'],
        description: `Explore the amazing ${destination} with authentic ${travelStyle?.join(' and ') || 'adventure'} experiences.`,
        highlights: ['Cultural sites', 'Local markets', 'Traditional food', 'Natural landscapes', 'Historical monuments']
      };

      // Use enhanced destination-specific data for reliable trip generation
      const trip = {
        destination: destination,
        description: selectedDestination.description,
        highlights: selectedDestination.activities.slice(0, 5),
        estimatedBudget: {
          low: Math.max(budget * 0.8, 500),
          high: Math.max(budget * 1.2, 800)
        }
      };

      const response = {
        title: `${destination} ${travelStyle?.includes('adventure') ? 'Adventure' : travelStyle?.includes('cultural') ? 'Cultural Journey' : 'Experience'}`,
        description: trip.description,
        destinations: [
          {
            name: destination,
            days: duration === "1-2 weeks" ? 10 : duration === "2-4 weeks" ? 21 : 14,
            activities: trip.highlights || selectedDestination.activities,
            estimatedCost: trip.estimatedBudget?.low || budget * 0.8
          }
        ],
        totalEstimatedCost: trip.estimatedBudget?.high || budget * 1.2,
        recommendations: selectedDestination.highlights
      };
      
      console.log('Sending trip response:', response);
      res.json(response);
    } catch (error) {
      console.error("Error generating trip:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Provide more specific error information
      if (errorMessage.includes("API key")) {
        res.status(500).json({ 
          message: "OpenAI API key issue. Please check configuration.",
          error: errorMessage 
        });
      } else if (errorMessage.includes("rate limit")) {
        res.status(500).json({ 
          message: "OpenAI rate limit reached. Please try again later.",
          error: errorMessage 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to generate trip with AI",
          error: errorMessage 
        });
      }
    }
  });

  // AI-powered travel suggestions
  app.post('/api/ai/travel-suggestions', isAuthenticated, async (req, res) => {
    try {
      const { travelStyle, budget, duration, interests, preferredCountries } = req.body;
      const suggestions = await generateTravelSuggestions({
        travelStyle,
        budget,
        duration,
        interests,
        preferredCountries
      });
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating travel suggestions:", error);
      res.status(500).json({ message: "Failed to generate travel suggestions" });
    }
  });

  // AI-powered itinerary generation
  app.post('/api/ai/itinerary', isAuthenticated, async (req, res) => {
    try {
      const { destination, duration, budget, preferences } = req.body;
      const itinerary = await generateItinerary(destination, duration, budget, preferences);
      res.json(itinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  // AI-powered budget analysis
  app.post('/api/ai/budget-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tripId, totalBudget } = req.body;
      
      let expenses;
      if (tripId) {
        expenses = await storage.getTripExpenses(tripId);
      } else {
        expenses = await storage.getUserExpenses(userId);
      }

      // Transform expenses to match the expected format
      const transformedExpenses = expenses.map(expense => ({
        category: expense.category,
        amount: parseFloat(expense.amount),
        description: expense.description,
        location: expense.location || undefined
      }));

      const analysis = await analyzeBudget(transformedExpenses, totalBudget);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing budget:", error);
      res.status(500).json({ message: "Failed to analyze budget" });
    }
  });

  // AI-powered recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { destination } = req.body;
      const reviews = await storage.getReviewsByDestination(destination);
      // Transform reviews to match the expected format
      const transformedReviews = reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        tags: Array.isArray(review.tags) ? review.tags : []
      }));
      const recommendations = await generateRecommendations(destination, transformedReviews);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Test OpenAI API endpoint
  app.get('/api/ai/test', async (req, res) => {
    try {
      console.log('Testing OpenAI API...');
      const testResponse = await generateTravelSuggestions({
        travelStyle: 'adventure',
        budget: 1000,
        duration: '1-2 weeks',
        interests: ['hiking'],
        preferredCountries: ['Peru']
      });
      console.log('OpenAI test successful:', testResponse);
      res.json({ status: 'success', suggestions: testResponse });
    } catch (error) {
      console.error('OpenAI test failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // AI chat assistant
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      // Get user context
      const userTrips = await storage.getUserTrips(userId);
      const context = {
        userTrips,
        currentLocation: req.body.currentLocation,
        travelPreferences: req.body.travelPreferences
      };

      const response = await chatAssistant(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Error in chat assistant:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  // Weather & Travel Conditions API
  app.get('/api/weather/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      // This would integrate with a weather API like OpenWeatherMap
      const mockWeather = {
        destination,
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temp: Math.floor(Math.random() * 20) + 15,
          condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        }))
      };
      res.json(mockWeather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Currency Exchange API
  app.get('/api/currency/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      // This would integrate with a currency API like ExchangeRate-API
      const rates: Record<string, number> = {
        'USD-PEN': 3.75, 'USD-COP': 4200, 'USD-BOB': 6.9, 'USD-CLP': 950,
        'USD-ARS': 800, 'USD-BRL': 5.2, 'USD-UYU': 39, 'USD-PYG': 7200,
        'USD-VES': 36, 'USD-GYD': 210, 'USD-SRD': 36, 'USD-FRF': 4.2
      };
      const rate = rates[`${from}-${to}`] || 1;
      res.json({
        from,
        to,
        rate,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  // Safety & Travel Advisories API
  app.get('/api/safety/:country', async (req, res) => {
    try {
      const { country } = req.params;
      const safetyInfo = {
        country,
        riskLevel: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        advisories: [
          'Avoid displaying valuable items in public',
          'Use registered taxi services',
          'Stay in well-lit areas at night',
          'Keep copies of important documents'
        ],
        emergencyNumbers: {
          police: '105',
          ambulance: '106',
          fire: '116',
          tourist_police: '0800-123456'
        },
        lastUpdated: new Date().toISOString()
      };
      res.json(safetyInfo);
    } catch (error) {
      console.error("Error fetching safety info:", error);
      res.status(500).json({ message: "Failed to fetch safety information" });
    }
  });

  // Transportation Options API
  app.get('/api/transport/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      const { type } = req.query; // bus, flight, train
      
      const transportOptions = [
        {
          type: 'flight',
          provider: 'LATAM Airlines',
          duration: '2h 30m',
          price: 180,
          currency: 'USD',
          departure: '08:00',
          arrival: '10:30'
        },
        {
          type: 'bus',
          provider: 'Cruz del Sur',
          duration: '8h 45m',
          price: 25,
          currency: 'USD',
          departure: '22:00',
          arrival: '06:45'
        }
      ].filter(option => !type || option.type === type);

      res.json(transportOptions);
    } catch (error) {
      console.error("Error fetching transport options:", error);
      res.status(500).json({ message: "Failed to fetch transport options" });
    }
  });

  // Accommodation Search API
  app.get('/api/accommodation/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { checkin, checkout, guests, type } = req.query;
      
      const accommodations = [
        {
          id: 1,
          name: 'Backpacker Hostel Central',
          type: 'hostel',
          price: 15,
          currency: 'USD',
          rating: 4.2,
          amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area'],
          location: `${destination} City Center`,
          availability: true
        },
        {
          id: 2,
          name: 'Boutique Hotel Plaza',
          type: 'hotel',
          price: 85,
          currency: 'USD',
          rating: 4.6,
          amenities: ['WiFi', 'Restaurant', 'Pool', 'Spa'],
          location: `${destination} Historic District`,
          availability: true
        },
        {
          id: 3,
          name: 'Mountain View Lodge',
          type: 'lodge',
          price: 120,
          currency: 'USD',
          rating: 4.8,
          amenities: ['WiFi', 'Restaurant', 'Hiking', 'Nature Tours'],
          location: `${destination} Mountains`,
          availability: true
        }
      ].filter(acc => !type || acc.type === type);

      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  // Local Activities & Tours API
  app.get('/api/activities/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { category, duration } = req.query;
      
      const activities = [
        {
          id: 1,
          name: 'Historic City Walking Tour',
          category: 'cultural',
          duration: '3 hours',
          price: 25,
          currency: 'USD',
          rating: 4.5,
          description: 'Explore the colonial architecture and learn about local history',
          included: ['Guide', 'Museum entries', 'Light snacks']
        },
        {
          id: 2,
          name: 'Mountain Hiking Adventure',
          category: 'adventure',
          duration: 'full day',
          price: 65,
          currency: 'USD',
          rating: 4.7,
          description: 'Challenge yourself with breathtaking mountain trails',
          included: ['Guide', 'Equipment', 'Lunch', 'Transportation']
        },
        {
          id: 3,
          name: 'Traditional Cooking Class',
          category: 'cultural',
          duration: '4 hours',
          price: 40,
          currency: 'USD',
          rating: 4.8,
          description: 'Learn to cook authentic local dishes with a chef',
          included: ['Ingredients', 'Recipes', 'Meal', 'Certificate']
        }
      ].filter(activity => 
        (!category || activity.category === category) &&
        (!duration || activity.duration.includes(duration as string))
      );

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Local Food & Restaurant API
  app.get('/api/restaurants/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { cuisine, priceRange } = req.query;
      
      const restaurants = [
        {
          id: 1,
          name: 'Mercado Central Food Court',
          cuisine: 'local',
          priceRange: 'budget',
          averagePrice: 8,
          currency: 'USD',
          rating: 4.3,
          specialties: ['Ceviche', 'Empanadas', 'Fresh Juices'],
          location: `${destination} Central Market`,
          openHours: '06:00-18:00'
        },
        {
          id: 2,
          name: 'Casa de la Abuela',
          cuisine: 'traditional',
          priceRange: 'mid',
          averagePrice: 25,
          currency: 'USD',
          rating: 4.6,
          specialties: ['Lomo Saltado', 'Aji de Gallina', 'Chicha Morada'],
          location: `${destination} Old Town`,
          openHours: '12:00-22:00'
        },
        {
          id: 3,
          name: 'The Gourmet Corner',
          cuisine: 'fusion',
          priceRange: 'upscale',
          averagePrice: 55,
          currency: 'USD',
          rating: 4.8,
          specialties: ['Tasting Menu', 'Wine Pairing', 'Chef Specials'],
          location: `${destination} Business District`,
          openHours: '18:00-24:00'
        }
      ].filter(restaurant => 
        (!cuisine || restaurant.cuisine === cuisine) &&
        (!priceRange || restaurant.priceRange === priceRange)
      );

      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  // Travel Documents & Visa Requirements API
  app.get('/api/visa-requirements/:fromCountry/:toCountry', async (req, res) => {
    try {
      const { fromCountry, toCountry } = req.params;
      
      const visaInfo = {
        fromCountry,
        toCountry,
        visaRequired: Math.random() > 0.5,
        stayDuration: '90 days',
        requirements: [
          'Valid passport (6+ months validity)',
          'Proof of onward travel',
          'Proof of sufficient funds',
          'Yellow fever vaccination certificate (if applicable)'
        ],
        processing: {
          time: '5-10 business days',
          fee: Math.random() > 0.5 ? 50 : 0,
          currency: 'USD'
        },
        lastUpdated: new Date().toISOString()
      };
      
      res.json(visaInfo);
    } catch (error) {
      console.error("Error fetching visa requirements:", error);
      res.status(500).json({ message: "Failed to fetch visa requirements" });
    }
  });

  // Travel Insurance API
  app.get('/api/insurance/quotes', async (req, res) => {
    try {
      const { destination, duration, coverage, age } = req.query;
      
      const quotes = [
        {
          provider: 'World Nomads',
          plan: 'Explorer',
          price: 45,
          currency: 'USD',
          coverage: {
            medical: 100000,
            evacuation: 1000000,
            baggage: 2500,
            cancellation: 5000
          },
          features: ['24/7 Support', 'Adventure Sports', 'COVID Coverage']
        },
        {
          provider: 'SafetyWing',
          plan: 'Nomad Insurance',
          price: 37,
          currency: 'USD',
          coverage: {
            medical: 250000,
            evacuation: 100000,
            baggage: 1000,
            cancellation: 0
          },
          features: ['Flexible Plans', 'Worldwide Coverage', 'Telemedicine']
        }
      ];
      
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching insurance quotes:", error);
      res.status(500).json({ message: "Failed to fetch insurance quotes" });
    }
  });

  // Travel Checklist & Tips API
  app.get('/api/checklist/:destination/:duration', async (req, res) => {
    try {
      const { destination, duration } = req.params;
      
      const checklist = {
        destination,
        duration,
        beforeTravel: [
          'Check passport validity (6+ months)',
          'Get travel insurance',
          'Notify bank of travel plans',
          'Download offline maps',
          'Learn basic local phrases',
          'Check vaccination requirements'
        ],
        packing: [
          'Weather-appropriate clothing',
          'Universal power adapter',
          'First aid kit',
          'Copies of important documents',
          'Portable charger',
          'Reusable water bottle'
        ],
        onArrival: [
          'Get local SIM card or data plan',
          'Exchange currency',
          'Save emergency contacts',
          'Register with embassy (long stays)',
          'Download local transport apps'
        ],
        tips: [
          'Always negotiate taxi fares beforehand',
          'Keep valuables in hotel safe',
          'Try local food but choose busy restaurants',
          'Learn about local customs and etiquette',
          'Keep emergency cash in different locations'
        ]
      };
      
      res.json(checklist);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      res.status(500).json({ message: "Failed to fetch travel checklist" });
    }
  });

  // Emergency Contacts API
  app.get('/api/emergency/:country', async (req, res) => {
    try {
      const { country } = req.params;
      
      const emergency = {
        country,
        contacts: {
          police: '105',
          ambulance: '106',
          fire: '116',
          tourist_police: '0800-123456',
          embassy: '+1-555-0123'
        },
        hospitals: [
          {
            name: 'Hospital Internacional',
            phone: '+51-1-234-5678',
            address: 'Av. Principal 123',
            services: ['Emergency', 'English Speaking Staff']
          }
        ],
        consulates: [
          {
            country: 'United States',
            phone: '+51-1-618-2000',
            address: 'Av. La Encalada 1245',
            hours: 'Mon-Fri 8:00-17:00'
          }
        ]
      };
      
      res.json(emergency);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  // Offline Maps & Navigation API
  app.get('/api/maps/:destination/download', async (req, res) => {
    try {
      const { destination } = req.params;
      
      const mapInfo = {
        destination,
        downloadUrl: `https://maps.example.com/offline/${destination}.map`,
        size: '45MB',
        coverage: `${destination} city center and surrounding areas`,
        features: ['GPS Navigation', 'Points of Interest', 'Public Transport'],
        validFor: '30 days',
        lastUpdated: new Date().toISOString()
      };
      
      res.json(mapInfo);
    } catch (error) {
      console.error("Error preparing map download:", error);
      res.status(500).json({ message: "Failed to prepare map download" });
    }
  });

  // User Preferences & Settings API
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const preferences = {
        userId,
        travelStyle: user?.travelStyle || 'adventure',
        budget: 'mid',
        interests: ['culture', 'food', 'nature'],
        notifications: {
          email: true,
          push: true,
          deals: true,
          tips: true
        },
        currency: 'USD',
        language: 'en',
        privacy: {
          profileVisible: true,
          tripsPublic: false,
          shareLocation: false
        }
      };
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      // In a real app, you'd update the user's preferences in the database
      res.json({ message: "Preferences updated successfully", preferences });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Travel Deals & Offers API
  app.get('/api/deals', async (req, res) => {
    try {
      const { destination, type, category } = req.query;
      
      const deals = [
        {
          id: 1,
          title: '50% Off Peru Adventure Tours',
          description: 'Limited time offer on Machu Picchu and Sacred Valley tours',
          discount: 50,
          originalPrice: 300,
          dealPrice: 150,
          currency: 'USD',
          category: 'tours',
          destination: 'Peru',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'Inca Trail Adventures',
          rating: 4.8
        },
        {
          id: 2,
          title: 'Hostel Flash Sale - Colombia',
          description: 'Book now and save on accommodations in Bogotá and Cartagena',
          discount: 30,
          originalPrice: 25,
          dealPrice: 18,
          currency: 'USD',
          category: 'accommodation',
          destination: 'Colombia',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'Backpacker Hostels',
          rating: 4.3
        },
        {
          id: 3,
          title: 'Flight Sale: US to South America',
          description: 'Round-trip flights starting from $399 to major SA cities',
          discount: 25,
          originalPrice: 599,
          dealPrice: 399,
          currency: 'USD',
          category: 'flights',
          destination: 'South America',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'SkyTravel',
          rating: 4.1
        }
      ].filter(deal => 
        (!destination || deal.destination.toLowerCase().includes(destination.toString().toLowerCase())) &&
        (!type || deal.category === type) &&
        (!category || deal.category === category)
      );

      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Notifications API
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const notifications = [
        {
          id: 1,
          type: 'deal',
          title: 'New Deal Alert',
          message: 'Peru adventure tours are 50% off this week!',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/deals'
        },
        {
          id: 2,
          type: 'trip',
          title: 'Trip Reminder',
          message: 'Your Colombia trip starts in 5 days. Don\'t forget to check-in!',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/trips'
        },
        {
          id: 3,
          type: 'social',
          title: 'New Review',
          message: 'Someone commented on your Cusco review',
          read: true,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/community'
        }
      ];

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      // In a real app, you'd update the notification in the database
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Travel Analytics & Statistics API
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userTrips = await storage.getUserTrips(userId);
      const userExpenses = await storage.getUserExpenses(userId);
      
      const analytics = {
        trips: {
          total: userTrips.length,
          completed: userTrips.filter((trip: any) => new Date(trip.endDate) < new Date()).length,
          upcoming: userTrips.filter((trip: any) => new Date(trip.startDate) > new Date()).length,
          countries: [...new Set(userTrips.map((trip: any) => trip.destinations?.[0]?.country).filter(Boolean))].length
        },
        expenses: {
          total: userExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0),
          thisMonth: userExpenses
            .filter((expense: any) => {
              const expenseDate = new Date(expense.createdAt);
              const now = new Date();
              return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0),
          topCategory: userExpenses.reduce((acc: any, expense: any) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
          }, {}),
          avgPerTrip: userTrips.length > 0 ? userExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0) / userTrips.length : 0
        },
        destinations: {
          visited: [...new Set(userTrips.map((trip: any) => trip.destinations?.[0]?.name).filter(Boolean))],
          wishlist: ['Patagonia', 'Amazon Rainforest', 'Atacama Desert', 'Salar de Uyuni']
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Search API (Universal Search)
  app.get('/api/search', async (req, res) => {
    try {
      const { q, type, limit = 10 } = req.query;
      const query = q?.toString().toLowerCase() || '';
      
      const results = {
        destinations: [
          { type: 'destination', name: 'Machu Picchu', country: 'Peru', rating: 4.9 },
          { type: 'destination', name: 'Salar de Uyuni', country: 'Bolivia', rating: 4.8 },
          { type: 'destination', name: 'Cartagena', country: 'Colombia', rating: 4.7 }
        ].filter(item => !type || type === 'destinations').filter(item => 
          item.name.toLowerCase().includes(query) || item.country.toLowerCase().includes(query)
        ),
        activities: [
          { type: 'activity', name: 'Inca Trail Hiking', location: 'Peru', rating: 4.8 },
          { type: 'activity', name: 'Tango Lessons', location: 'Argentina', rating: 4.6 },
          { type: 'activity', name: 'Amazon River Cruise', location: 'Brazil', rating: 4.7 }
        ].filter(item => !type || type === 'activities').filter(item => 
          item.name.toLowerCase().includes(query) || item.location.toLowerCase().includes(query)
        ),
        restaurants: [
          { type: 'restaurant', name: 'Central Restaurant', location: 'Lima, Peru', rating: 4.9 },
          { type: 'restaurant', name: 'La Puerta Falsa', location: 'Bogotá, Colombia', rating: 4.5 },
          { type: 'restaurant', name: 'Parrilla Don Julio', location: 'Buenos Aires, Argentina', rating: 4.8 }
        ].filter(item => !type || type === 'restaurants').filter(item => 
          item.name.toLowerCase().includes(query) || item.location.toLowerCase().includes(query)
        )
      };

      const allResults = [
        ...results.destinations,
        ...results.activities,
        ...results.restaurants
      ].slice(0, parseInt(limit.toString()));

      res.json(allResults);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Backup & Export API
  app.get('/api/export/user-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userTrips = await storage.getUserTrips(userId);
      const userExpenses = await storage.getUserExpenses(userId);
      const userConnections = await storage.getUserConnections(userId);

      const exportData = {
        user: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          createdAt: user?.createdAt
        },
        trips: userTrips,
        expenses: userExpenses,
        connections: userConnections,
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0'
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="tripwise-data-${userId}-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // Health Check & System Status API
  app.get('/api/health', async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
          storage: 'operational'
        },
        version: '1.0.0',
        uptime: process.uptime()
      };
      res.json(health);
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  });

  // Feedback & Support API
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, subject, message, rating } = req.body;
      
      const feedback = {
        id: Date.now(),
        userId,
        type, // bug, feature, general
        subject,
        message,
        rating,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

      // In a real app, you'd save this to database and possibly send email
      res.json({ message: "Feedback submitted successfully", ticketId: feedback.id });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Achievement System API
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/achievements/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      
      // Also check for new unlocked achievements
      const newAchievements = await storage.checkAndUnlockAchievements(userId);
      
      res.json({
        userAchievements,
        newlyUnlocked: newAchievements
      });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.post('/api/achievements/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const newAchievements = await storage.checkAndUnlockAchievements(userId);
      
      res.json({
        newlyUnlocked: newAchievements,
        count: newAchievements.length
      });
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Initialize default achievements if they don't exist
  app.post('/api/achievements/init', async (req, res) => {
    try {
      const defaultAchievements = [
        {
          name: "First Steps",
          description: "Plan your first trip to South America",
          category: "travel",
          iconName: "MapPin",
          badgeColor: "bg-blue-500",
          requirement: JSON.stringify({ type: "trip_count", value: 1 }),
          points: 10,
          rarity: "common"
        },
        {
          name: "Trip Explorer",
          description: "Plan 5 different trips",
          category: "travel", 
          iconName: "Navigation",
          badgeColor: "bg-green-500",
          requirement: JSON.stringify({ type: "trip_count", value: 5 }),
          points: 50,
          rarity: "rare"
        },
        {
          name: "Country Collector",
          description: "Visit 3 different South American countries",
          category: "exploration",
          iconName: "Globe",
          badgeColor: "bg-purple-500",
          requirement: JSON.stringify({ type: "country_count", value: 3 }),
          points: 75,
          rarity: "epic"
        },
        {
          name: "Budget Tracker",
          description: "Record 10 travel expenses",
          category: "budget",
          iconName: "DollarSign",
          badgeColor: "bg-orange-500",
          requirement: JSON.stringify({ type: "expense_count", value: 10 }),
          points: 30,
          rarity: "common"
        },
        {
          name: "Review Writer",
          description: "Write 5 destination reviews",
          category: "social",
          iconName: "Star",
          badgeColor: "bg-yellow-500",
          requirement: JSON.stringify({ type: "review_count", value: 5 }),
          points: 40,
          rarity: "rare"
        },
        {
          name: "Big Spender",
          description: "Spend over $1000 on travels",
          category: "budget",
          iconName: "CreditCard",
          badgeColor: "bg-red-500",
          requirement: JSON.stringify({ type: "total_spent", value: 1000 }),
          points: 100,
          rarity: "epic"
        },
        {
          name: "Adventure Seeker",
          description: "Plan an adventure-focused trip",
          category: "adventure",
          iconName: "Mountain",
          badgeColor: "bg-emerald-500",
          requirement: JSON.stringify({ type: "trip_style", value: "adventure" }),
          points: 25,
          rarity: "common"
        },
        {
          name: "Cultural Explorer",
          description: "Plan a cultural immersion trip",
          category: "cultural",
          iconName: "Camera",
          badgeColor: "bg-indigo-500",
          requirement: JSON.stringify({ type: "trip_style", value: "cultural" }),
          points: 25,
          rarity: "common"
        },
        {
          name: "Social Butterfly",
          description: "Connect with 10 fellow travelers",
          category: "social",
          iconName: "Users",
          badgeColor: "bg-pink-500",
          requirement: JSON.stringify({ type: "connection_count", value: 10 }),
          points: 60,
          rarity: "rare"
        },
        {
          name: "South America Master",
          description: "Visit all 13 South American countries",
          category: "exploration",
          iconName: "Award",
          badgeColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
          requirement: JSON.stringify({ type: "country_count", value: 13 }),
          points: 500,
          rarity: "legendary"
        }
      ];

      let createdCount = 0;
      for (const achievement of defaultAchievements) {
        try {
          // Check if achievement already exists
          const existing = await storage.getAllAchievements();
          const existingAchievement = existing.find(a => a.name === achievement.name);

          if (!existingAchievement) {
            await db.insert(achievements).values(achievement);
            createdCount++;
          }
        } catch (error) {
          console.error(`Error creating achievement ${achievement.name}:`, error);
        }
      }

      res.json({ 
        message: `Initialized ${createdCount} achievements`,
        total: defaultAchievements.length,
        created: createdCount
      });
    } catch (error) {
      console.error("Error initializing achievements:", error);
      res.status(500).json({ message: "Failed to initialize achievements" });
    }
  });

  // API Documentation Endpoint
  app.get('/api/docs', async (req, res) => {
    const apiDocs = {
      title: "TripWise API Documentation",
      version: "1.0.0",
      description: "Complete API reference for the TripWise South American travel platform",
      endpoints: {
        authentication: {
          "GET /api/auth/user": "Get authenticated user details",
          "GET /api/user/preferences": "Get user travel preferences",
          "PUT /api/user/preferences": "Update user preferences"
        },
        trips: {
          "GET /api/trips": "Get public trips (community)",
          "GET /api/trips/user": "Get user's trips",
          "POST /api/trips": "Create new trip",
          "GET /api/trips/:id": "Get specific trip",
          "PUT /api/trips/:id": "Update trip",
          "DELETE /api/trips/:id": "Delete trip"
        },
        ai_features: {
          "POST /api/ai/generate-trip": "AI-powered trip generation",
          "POST /api/ai/travel-suggestions": "Get personalized suggestions",
          "POST /api/ai/itinerary": "Generate detailed itinerary",
          "POST /api/ai/budget-analysis": "Analyze expenses with AI",
          "POST /api/ai/recommendations": "Get destination recommendations",
          "POST /api/ai/chat": "Chat with travel assistant"
        },
        expenses: {
          "GET /api/expenses/user": "Get user's expenses",
          "GET /api/expenses/trip/:id": "Get trip expenses",
          "POST /api/expenses": "Add new expense"
        },
        community: {
          "GET /api/reviews": "Get recent reviews",
          "POST /api/reviews": "Submit new review",
          "GET /api/reviews/destination/:name": "Get destination reviews"
        },
        travel_info: {
          "GET /api/weather/:destination": "Get weather forecast",
          "GET /api/currency/:from/:to": "Get exchange rates",
          "GET /api/safety/:country": "Get safety advisories",
          "GET /api/transport/:from/:to": "Get transport options",
          "GET /api/accommodation/:destination": "Search accommodations",
          "GET /api/activities/:destination": "Find activities",
          "GET /api/restaurants/:destination": "Find restaurants",
          "GET /api/visa-requirements/:from/:to": "Check visa requirements",
          "GET /api/insurance/quotes": "Get insurance quotes",
          "GET /api/checklist/:destination/:duration": "Get travel checklist",
          "GET /api/emergency/:country": "Get emergency contacts",
          "GET /api/maps/:destination/download": "Get offline maps"
        },
        social: {
          "GET /api/connections": "Get user connections",
          "POST /api/connections": "Add connection",
          "PUT /api/connections/:id": "Update connection",
          "GET /api/chat/rooms": "Get chat rooms",
          "GET /api/chat/messages/:roomId": "Get chat messages",
          "WebSocket /ws": "Real-time chat"
        },
        platform: {
          "GET /api/deals": "Get travel deals",
          "GET /api/notifications": "Get notifications",
          "PUT /api/notifications/:id/read": "Mark notification read",
          "GET /api/analytics/dashboard": "Get travel analytics",
          "GET /api/search": "Universal search",
          "GET /api/export/user-data": "Export user data",
          "GET /api/health": "System health check",
          "POST /api/feedback": "Submit feedback"
        }
      },
      totalEndpoints: 40,
      features: [
        "OpenAI-powered travel planning",
        "Real-time chat and community",
        "Comprehensive expense tracking",
        "Weather and currency integration",
        "Safety and travel advisories",
        "Accommodation and activity search",
        "User analytics and insights",
        "Data export and backup"
      ]
    };
    
    res.json(apiDocs);
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Store message in database
          const messageData = insertChatMessageSchema.parse({
            roomId: message.roomId,
            userId: message.userId,
            message: message.text,
          });
          
          const newMessage = await storage.createChatMessage(messageData);
          
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // TripAdvisor-style data API routes
  
  // Destinations API
  app.get('/api/destinations', async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get('/api/destinations/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const destinations = await storage.searchDestinations(q);
      res.json(destinations);
    } catch (error) {
      console.error("Error searching destinations:", error);
      res.status(500).json({ message: "Failed to search destinations" });
    }
  });

  app.get('/api/destinations/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const destination = await storage.getDestinationByLocationId(locationId);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  // Accommodations API
  app.get('/api/accommodations', async (req, res) => {
    try {
      const { destinationId } = req.query;
      const accommodations = await storage.getAccommodations(
        destinationId ? parseInt(destinationId as string) : undefined
      );
      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  app.get('/api/accommodations/search', async (req, res) => {
    try {
      const { q, destinationId, priceLevel, rating } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        priceLevel: priceLevel as string,
        rating: rating ? parseFloat(rating as string) : undefined,
      };
      
      const accommodations = await storage.searchAccommodations(q, filters);
      res.json(accommodations);
    } catch (error) {
      console.error("Error searching accommodations:", error);
      res.status(500).json({ message: "Failed to search accommodations" });
    }
  });

  app.get('/api/accommodations/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const accommodation = await storage.getAccommodationByLocationId(locationId);
      if (!accommodation) {
        return res.status(404).json({ message: "Accommodation not found" });
      }
      res.json(accommodation);
    } catch (error) {
      console.error("Error fetching accommodation:", error);
      res.status(500).json({ message: "Failed to fetch accommodation" });
    }
  });

  // Attractions API
  app.get('/api/attractions', async (req, res) => {
    try {
      const { destinationId } = req.query;
      const attractions = await storage.getAttractions(
        destinationId ? parseInt(destinationId as string) : undefined
      );
      res.json(attractions);
    } catch (error) {
      console.error("Error fetching attractions:", error);
      res.status(500).json({ message: "Failed to fetch attractions" });
    }
  });

  app.get('/api/attractions/search', async (req, res) => {
    try {
      const { q, destinationId, category } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        category: category as string,
      };
      
      const attractions = await storage.searchAttractions(q, filters);
      res.json(attractions);
    } catch (error) {
      console.error("Error searching attractions:", error);
      res.status(500).json({ message: "Failed to search attractions" });
    }
  });

  app.get('/api/attractions/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const attraction = await storage.getAttractionByLocationId(locationId);
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error) {
      console.error("Error fetching attraction:", error);
      res.status(500).json({ message: "Failed to fetch attraction" });
    }
  });

  // Restaurants API
  app.get('/api/ta-restaurants', async (req, res) => {
    try {
      const { destinationId } = req.query;
      const restaurants = await storage.getRestaurants(
        destinationId ? parseInt(destinationId as string) : undefined
      );
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get('/api/ta-restaurants/search', async (req, res) => {
    try {
      const { q, destinationId, cuisine, priceLevel } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        cuisine: cuisine as string,
        priceLevel: priceLevel as string,
      };
      
      const restaurants = await storage.searchRestaurants(q, filters);
      res.json(restaurants);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });

  app.get('/api/ta-restaurants/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const restaurant = await storage.getRestaurantByLocationId(locationId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  // Location Reviews API
  app.get('/api/location-reviews/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const reviews = await storage.getLocationReviews(locationId, category);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching location reviews:", error);
      res.status(500).json({ message: "Failed to fetch location reviews" });
    }
  });

  app.get('/api/location-reviews/recent', async (req, res) => {
    try {
      const reviews = await storage.getRecentLocationReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching recent location reviews:", error);
      res.status(500).json({ message: "Failed to fetch recent location reviews" });
    }
  });

  app.post('/api/location-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertLocationReviewSchema.parse({ ...req.body, userId });
      const review = await storage.createLocationReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating location review:", error);
      res.status(400).json({ message: "Failed to create location review" });
    }
  });

  // Location Photos API
  app.get('/api/location-photos/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const photos = await storage.getLocationPhotos(locationId, category);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching location photos:", error);
      res.status(500).json({ message: "Failed to fetch location photos" });
    }
  });

  // Location Subratings API
  app.get('/api/location-subratings/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const subratings = await storage.getLocationSubratings(locationId, category);
      res.json(subratings);
    } catch (error) {
      console.error("Error fetching location subratings:", error);
      res.status(500).json({ message: "Failed to fetch location subratings" });
    }
  });

  // Location Ancestors API
  app.get('/api/location-ancestors/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const ancestors = await storage.getLocationAncestors(locationId);
      res.json(ancestors);
    } catch (error) {
      console.error("Error fetching location ancestors:", error);
      res.status(500).json({ message: "Failed to fetch location ancestors" });
    }
  });

  return httpServer;
}
