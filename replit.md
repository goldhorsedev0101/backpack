# GlobeMate - Global Travel Platform

## Overview
GlobeMate is a full-stack web application for global travel planning and community building. It provides an AI-powered platform for trip recommendations, itinerary generation, expense tracking, and real-time communication among travelers. The project aims to be a comprehensive, AI-driven resource for exploring worldwide destinations, combining advanced AI capabilities with robust social features to simplify travel logistics and foster a vibrant global travel community. It supports over 70 countries globally with multilingual support (Hebrew/English) and detailed destination data, including climate and travel timing information.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 8, 2025)
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