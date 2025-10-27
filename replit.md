# GlobeMate - Global Travel Platform

## Overview
GlobeMate is a full-stack web application designed for comprehensive global travel planning and community building. It leverages AI to offer personalized trip recommendations, itinerary generation, and expense tracking. The platform integrates advanced AI capabilities with social features to streamline travel logistics and cultivate a global travel community. It supports over 70 countries with full multilingual support (Hebrew/English) and provides detailed destination data, including climate information, aiming to be a holistic global travel planner.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod
- **UI/UX Decisions**: Responsive design, consistent shadcn/ui components, Tailwind CSS for custom styling, tabbed navigation, clean visual style with white background, colorful gradient cards (orange-50 → teal-50 → blue-50), and orange (orange-500) section titles. Desktop sidebar navigation uses ScrollArea for all menu items. Trip planning features a unified "Interests" section combining travel styles and interests with icons for simplified user experience.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Google OAuth via Supabase
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support

### Python Microservice (GlobeMate Collector)
- **Framework**: FastAPI with Python 3.11
- **Purpose**: Google Places API data collection and processing.

### Database Design
- **ORM**: Drizzle with PostgreSQL
- **Key Tables**: Users, Sessions, Trips, Reviews, Expenses, Chat, User Connections, Journeys, Destinations, Destinations_i18n (for translations), Accommodations, Attractions, Restaurants, Location Reviews, Location Photos, Location Ancestors.

### Core Features & Technical Implementations
- **AI-Powered Trip Planning**: Utilizes OpenAI for personalized recommendations, itinerary generation, and an interactive assistant, considering traveler composition and trip type. Integrates Google Places API for real-world booking suggestions.
- **AI Assistant Page**: Dedicated full-page AI assistant interface with active chat and conversation history sidebar. Features include: auto-save, view past chats, start new ones, and seamless auto-redirect from the home page. Supports full language (Hebrew/English) based on UI settings.
- **Multi-Destination Journeys**: Curated multi-city itineraries with detailed breakdowns, filterable lists, detailed pages, and conversion to personalized trips via AI.
- **Community Features**: Reviews, user connections, real-time chat (WebSockets), content sharing, and gamified achievements.
- **Budget Tracking**: Expense categorization, trip association, visual analytics, and multi-currency support.
- **User Onboarding & Personalization**: Multi-step registration for tailored recommendations, fully translated (Hebrew/English) with i18n for all UI elements.
- **Multi-API Travel Data Integration**: Combines Google Places API for real-time search with a seeded database and TripAdvisor-ready infrastructure.
- **Weather & Travel Timing System**: Real-time weather data (OpenWeather API) and historical climate analysis for "Best Time to Travel" recommendations.
- **Real Places Booking Integration**: Enriches AI-generated suggestions with bookable locations from Google Places API.
- **Destinations Hub**: Comprehensive discovery system with search, filters, sorting, detailed pages including weather, attractions, and interactive Google Maps integration. All 101 destinations now include enriched metadata (continent, country flag, ratings, descriptions) and full Hebrew/English translations via the `destinations_i18n` table. The API endpoint `/api/destinations` accepts a `lang` parameter and returns localized names and descriptions for all destinations.
- **Global Expansion & Multilingual Support**: Worldwide destination coverage with full Hebrew/English bilingual support across all features, including instant language toggling and RTL support. All destination content (names, descriptions) is fully translated and stored in the `destinations_i18n` table, with seamless integration via API language parameter.
- **Support Pages**: Help Center, Contact Us, Privacy Policy, Terms of Service, Accessibility Statement, and About Us pages with full translation and RTL support.
- **Optimized Image Loading**: Custom `OptimizedImage` component with retry, lazy loading, skeleton states, and error handling for galleries.
- **Hotel Deals Landing Page & Email Notification System**: Landing page for hotel quote requests, saving inquiries to Supabase, and sending email notifications via Nodemailer with Hebrew RTL template.
- **Emergency Information Management**: Comprehensive system with dual view/edit modes for emergency contacts, medical info, insurance, and passport details. After save, displays organized summary card with color-coded sections (red for contacts, blue for medical, green for insurance, purple for passport) featuring gradient boxes and badges. Edit button returns to form mode. Includes passport number, expiry date, and issuing country fields.
- **Comprehensive Translation for Trip Content**: Functions to translate month names, travel styles, common nouns, and descriptive words in trip content for bilingual display.
- **Flight Management System**: Integrated Duffel Flights API for flight search and booking, OpenSky Network API for real-time flight tracking, and a booking management system with current and past bookings.
- **Intelligent Image Fallback System**: Three-tier fallback for location photos with Supabase Storage caching. Priority: Google Places (real photos) → Unsplash (50/hour rate limited) → Wikimedia Commons (free, unlimited) → Pexels (fallback). All fetched images uploaded as buffers to Supabase Storage (location-photos bucket) for CDN delivery and cached URLs in location_photos table for fast retrieval. MediaOrchestrator singleton service manages fallback logic, persistent rate limiting, and attribution. API endpoints: `/api/media/location-photo` for photo retrieval, `/api/media/unsplash-rate-limit` for rate limit status. Admin endpoint `/api/admin/populate-images` for batch image population. Successfully pre-populated 12 destinations + 8 attractions with high-quality Unsplash images. Storage methods include `getAllDestinations()` and `getAllAttractions()` for batch operations.
- **Database-First Attractions System**: Comprehensive attractions database with full multilingual support and 100% image coverage. Attractions stored with UUID-based schema in `attractions` table, linked to `attractionsI18n` for Hebrew/English translations. **310 attractions (3 per destination) pre-populated across all 101 worldwide destinations** with AI-generated detailed descriptions, ratings, and coordinates. All 310 attractions feature high-quality cached images via the intelligent image fallback system (270 from Pexels, 37 from Unsplash, 3 manual placeholders). New API endpoint `/api/destinations/:destinationId/attractions?locale=en|he` returns localized attractions with proper translation fallback. Frontend seamlessly integrates database attractions in destination detail pages with automatic fallback to Google Places API when database content unavailable. Scripts: `generateAttractionsBatch.ts` for AI-powered generation in batches, `populateAttractionImages.ts` for automated batch image caching from Pexels/Unsplash/Wikimedia.

## External Dependencies
- **PostgreSQL**: Primary database (via Supabase).
- **Supabase**: BaaS for PostgreSQL, Authentication (Google OAuth), and storage.
- **OpenAI API**: For AI trip planning and conversational features.
- **Google Places API**: For real-world location data and booking suggestions.
- **OpenWeather API**: For real-time weather data and forecasts.
- **Duffel Flights API**: For flight search and booking.
- **OpenSky Network API**: For real-time flight tracking.
- **drizzle-orm**: ORM for database interaction.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **connect-pg-simple**: PostgreSQL session store.
- **FastAPI**: Python web framework used in the Collector microservice.
- **Uvicorn**: ASGI server.
- **Requests**: HTTP library (used in Collector).
- **Jinja2**: Template engine (used in Collector).
- **SQLAlchemy**: ORM used in Collector microservice.
- **Google Maps JavaScript API**: For interactive maps.
- **Nodemailer**: For sending email notifications.
- **Unsplash API**: For high-quality stock photography (50 requests/hour free tier).
- **Wikimedia Commons API**: For free, unlimited access to public domain images.
- **Pexels API**: Fallback source for stock photography.