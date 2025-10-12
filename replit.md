# GlobeMate - Global Travel Platform

## Overview
GlobeMate is a full-stack web application for global travel planning and community building. It provides an AI-powered platform for trip recommendations, itinerary generation, expense tracking, and real-time communication among travelers. The project aims to be a comprehensive, AI-driven resource for exploring worldwide destinations, combining advanced AI capabilities with robust social features to simplify travel logistics and foster a vibrant global travel community. It supports over 70 countries globally with multilingual support (Hebrew/English) and detailed destination data, including climate and travel timing information.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 12, 2025)
- **Colorful Page Redesign**: Complete visual overhaul of My Trips page for vibrant, modern look
  - **Background**: Clean white background for entire page
  - **Card Design**: All cards now use colorful gradient backgrounds (orange-50 → teal-50 → blue-50)
  - **Consistent Headers**: All tab sections now feature:
    - Orange (orange-500) section titles with matching icons
    - Centered layout with descriptive subtitle text
    - Uniform 2xl font-size headers
  - **Sections Redesigned**: Preferences, Suggestions, Itinerary, My Itineraries, Saved Trips
  
- **Trip Type & Travelers Header**: Interactive header section ONLY in Preferences tab
  - **Section Title**: "הרכב המטיילים ואופי הטיול / Travelers & Trip Type" with Users icon
  - **Description**: Explanatory text encouraging users to share travel group details
  - **Trip Type Selector**: Choose from 11 trip types including new "ירח דבש/Honeymoon" option
  - **Adults/Children Counters**: Interactive +/- buttons for selecting travelers
    - Adults: 1-8 travelers (default: 2)
    - Children: 0-10 kids (updated from 0-6)
  - **Visual Design**: Orange title header above gradient card (orange→teal)
  - **AI Integration**: Trip type, adults, and children data sent to AI for personalized recommendations
  - **Translations**: Full Hebrew/English support for all 11 trip types
  - **Location**: Inside Preferences tab only, at the top before destination selection
  - **Removed Duplicates**: Deleted redundant adults/children fields from Preferences tab

## Previous Updates (October 12, 2025)
- **Family-Friendly Trip Planning System**: Complete overhaul to support all traveler types
  - **Schema Updates**: 
    - Added `adults` (integer, default: 2) and `children` (integer, default: 0) to `travel_buddy_posts` table
    - Validation: adults 1-8, children 0-6 via Zod schema
  - **Travel Buddy Posts (Community Page)**:
    - Added separate selects for adults and children instead of single group size
    - Fixed Promise rendering bug by properly destructuring `useLocalizedDestinations()` hook
    - Added fallback destinations list for reliability when API doesn't load
    - Fixed field naming from snake_case to camelCase (startDate, endDate, groupSize, travelStyle, contactInfo)
  - **My Trips Page** (my-trips-new.tsx):
    - Added adults (מבוגרים) selector: 1-8 travelers (default: 2)
    - Added children (ילדים) selector: 0-6 kids (default: 0)
    - Updated TripFormData interface to include adults/children fields
    - UI shows separate fields in trip generation form after duration field
    - Note: Old my-trips.tsx deleted (unused, app uses my-trips-new.tsx)
  - **Backend API**:
    - Updated POST /api/travel-buddy-posts to support guest users (userId defaults to 'guest')
    - Validates adults/children fields with insertTravelBuddyPostSchema
  - **AI Integration**:
    - Updated welcome message to emphasize family-friendly worldwide travel
    - AI prompts now consider family composition for personalized recommendations
  - **Translations**: Full Hebrew/English support for "מבוגרים"/"Adults" and "ילדים"/"Children"
  - **Database Migration**: Columns added via Supabase SQL Editor manually

## Previous Updates (October 12, 2025)
- **Support Pages Implementation**: Created comprehensive support and informational pages
  - **Help Center** (/help): FAQ section with 6 common questions, quick contact options
  - **Contact Us** (/contact): Contact form with email/phone details (support@globemate.co.il, 0525530454)
  - **Privacy Policy** (/privacy): Complete privacy policy with 10 sections
  - **Terms of Service** (/terms): Full terms of service with 13 sections
  - **About Us** (/about): Company mission, values, story, and stats
  - All pages fully translated in Hebrew and English with RTL support
  - All interactive elements have data-testid attributes for testing
  - Footer links updated to navigate to support pages

- **Booking Contact Section**: Added "Book with Us" section to destination detail pages
  - Replaced booking stub with contact information card
  - Displays email (support@globemate.co.il) and phone (0525530454) for booking inquiries
  - Includes direct link to contact page
  - Fully translated in Hebrew and English
  - Professional gradient card design with clear call-to-action

## Previous Changes (October 11, 2025)
- **Explore Page Removal**: Completely removed the /explore page and all related functionality
  - Deleted client/src/pages/explore.tsx (1251 lines)
  - Removed route from App.tsx
  - Removed navigation menu item from navigation.tsx
  - Removed "Learn More" button from landing page
  - Disabled place navigation in ReviewCard component
  
- **Footer Destinations Links Update**: Added destination quick links to landing page footer
  - Each country link navigates to the most attractive destination in that country
  - Links: Tokyo (Japan), Paris (France), Bangkok (Thailand), Rome (Italy), Sydney (Australia)
  - All links navigate to destination detail pages (/destinations/:slug)

## Previous Changes (October 10, 2025)
- **Interactive Google Maps Integration**: Added embedded Google Maps to destination detail pages
  - Server endpoint: /api/maps/key for secure API key delivery
  - GoogleMapEmbed component with iframe embed and directions button
  - Fully responsive design for mobile and desktop
  - i18n: Hebrew/English support for map labels and buttons
  
- **Optimized Image Loading System**: Comprehensive image loading improvements across all galleries
  - **OptimizedImage Component** (client/src/components/OptimizedImage.tsx):
    - Automatic retry mechanism with cache-busting (up to 3 attempts)
    - Smart lazy loading using Intersection Observer (starts 50px before viewport)
    - Loading skeleton states with smooth fade-in transitions
    - Error handling with user-friendly retry button
    - Priority loading support for above-the-fold images
    - Fallback image support
  - **Implementation**: Integrated in DestinationGallery (hero, POI, lightbox) and RealPlaceLinks (place photos)
  - **Verified**: E2E tested with Paris destination - all images load successfully
  
- **Geo Basics Enhancements**: 
  - Fixed timezone display to show max 2 zones + count (e.g., "UTC+01:00, UTC+02:00 +13")
  - Added country code mapping (UK→United Kingdom, USA→United States, etc.)
  - Server endpoints: /api/destinations/geo-basics (public proxy), /api/geo/* (internal with x-globemate-key)
  - Integration layer: src/integrations/geo/restCountries.ts + geoNames.ts with structured logging
  - Unified service: server/services/destinations/geoService.ts with caching (24h country, 6h city)
  - UI: Enhanced Basics card in destination detail with country flag, currencies, languages, timezones, calling code, city info
  - i18n: Full Hebrew/English translations for all geo-related content
  - Security: API key managed server-side only, never exposed to client
  - Feature flag: config.geo.enabled based on ENABLE_GEO env var

## Previous Changes (October 8, 2025)
- **Destinations Hub - Tabbed Interface Implementation**: Restructured destinations hub with four categories
  - **Destinations Tab**: Shows popular worldwide destinations from database (30+ major cities)
  - **Accommodations Tab**: Google Places API results filtered by type "lodging" with infinite scroll
  - **Restaurants Tab**: Google Places API results filtered by type "restaurant" with infinite scroll
  - **Attractions Tab**: Google Places API results filtered by type "tourist_attraction" with infinite scroll
  - Each tab (except Destinations) uses `/api/destinations/infinite` endpoint with 10km radius
  - Added telemetry tracking for tab changes (destinations_hub_tab_change event)
  - Fixed "results is not iterable" error by adding Array.isArray validation in filteredPlaces
  - Cleared Vite cache to ensure browser loads latest code
  - Note: **Server must be manually started** via Workflows UI (see below)

## Important Setup Notes
- **Starting the Development Server**: 
  - The `.replit.yaml` defines workflows but they must be registered in the Replit UI
  - To start: Open Workflows tool → Create "Start application" → Add shell command `npm run dev` → Click Run
  - Or simply click the Run button if the workflow is already configured

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Google OAuth via Supabase
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support

### Python Microservice (GlobeMate Collector)
- **Framework**: FastAPI with Python 3.11
- **Purpose**: Google Places API data collection and processing
- **Location**: `/globemate/` directory

### Database Design
- **ORM**: Drizzle with PostgreSQL
- **Key Tables**: Users, Sessions, Trips, Reviews, Expenses, Chat (rooms & messages), User Connections. Includes detailed tables for destinations, accommodations, attractions, restaurants, location_reviews, location_photos, location_ancestors.

### Core Features & Technical Implementations
- **Authentication**: Google OAuth via Supabase for secure authentication.
- **AI-Powered Trip Planning**: Utilizes OpenAI for personalized trip recommendations, itinerary generation, budget analysis, and an interactive travel assistant. Integrates Google Places API for real-world booking suggestions.
- **Community Features**: Reviews system, user connections, WebSocket-based real-time chat, content sharing, and a gamified achievements system with point tracking and leaderboards.
- **Budget Tracking**: Expense categorization, trip association, visual analytics, and multi-currency support.
- **User Onboarding & Personalization**: Multi-step registration to collect user preferences for personalized recommendations.
- **Multi-API Travel Data Integration**: Combines Google Places API for real-time search, a comprehensive seeded database, and a TripAdvisor-ready infrastructure.
- **Weather Integration & Travel Timing System**: Real-time weather data (OpenWeather API) and historical climate analysis, providing "Best Time to Travel" recommendations.
- **Real Places Booking Integration**: Enriches AI-generated suggestions with bookable locations from Google Places API.
- **UI/UX Decisions**: Consistent use of shadcn/ui components, Tailwind CSS for custom styling, responsive design, and unified interfaces with tabbed navigation. Features a continent-based trip selection system for improved UX.
- **Destinations Hub**: Comprehensive destination discovery system with search, filters, sorting, and detailed destination pages including weather cards, attractions, and interactive maps. Features a robust feature flag system for external providers. **Updated (Oct 2025)**: Now displays real destinations from Google Places API across 30+ major global cities instead of hardcoded data. Uses dynamic data fetching with TanStack Query and proper loading states.
- **Global Expansion & Multilingual Support**: Worldwide destination coverage with full Hebrew/English bilingual support across all features, including instant language toggling and RTL support.

## External Dependencies
- **PostgreSQL**: Primary database (managed by Supabase).
- **Supabase**: Backend-as-a-service providing PostgreSQL, Authentication (Google OAuth), and storage.
- **OpenAI API**: For AI trip planning and conversational features.
- **Google Places API**: For real-world location data, booking suggestions, and enriching AI outputs.
- **OpenWeather API**: For real-time weather data and forecasts.
- **@neondatabase/serverless**: PostgreSQL connection (historical, now via Supabase).
- **drizzle-orm**: ORM for database interaction.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **openid-client**: OpenID Connect implementation (historical, superseded by Supabase OAuth).
- **passport**: Authentication middleware (historical, superseded by Supabase OAuth).
- **connect-pg-simple**: PostgreSQL session store.
- **FastAPI**: Python web framework used in the Collector microservice.
- **Uvicorn**: ASGI server.
- **Requests**: HTTP library.
- **Jinja2**: Template engine.
- **SQLAlchemy**: ORM used in Collector microservice.
- **Google Maps JavaScript API**: For interactive maps.
- **Facebook Graph API**: For social media content collection.