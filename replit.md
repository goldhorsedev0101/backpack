# TripWise - South American Travel Platform

## Overview
TripWise is a full-stack web application designed for South American travel planning and community building. Its core purpose is to provide an AI-powered platform for trip recommendations, itinerary generation, expense tracking, and real-time communication among travelers. The project aims to be a comprehensive resource for exploring South America, combining advanced AI capabilities with robust social features to simplify travel logistics and foster a vibrant travel community.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support

### Python Microservice (TripWise Collector)
- **Framework**: FastAPI with Python 3.11
- **Purpose**: Google Places API data collection and processing
- **Location**: `/tripwise/` directory
- **Features**: Interactive Google Maps, place search, data export
- **APIs**: Google Places API integration, place details retrieval

### Database Design
- **ORM**: Drizzle with PostgreSQL
- **Key Tables**: Users, Sessions, Trips, Reviews, Expenses, Chat (rooms & messages), User Connections.
- **TripAdvisor-Style Data**: Dedicated tables for destinations, accommodations, attractions, restaurants, location_reviews, location_photos, location_ancestors for detailed travel data.

### Core Features & Technical Implementations
- **Authentication**: Replit Auth integration with PostgreSQL-backed sessions and route-level protection.
- **AI-Powered Trip Planning**: Utilizes OpenAI for personalized trip recommendations, itinerary generation, budget analysis, and an interactive travel assistant. Integrates Google Places API for real-world booking suggestions.
- **Community Features**: Reviews system, user connections, WebSocket-based real-time chat, and content sharing.
- **Budget Tracking**: Expense categorization, trip association, visual analytics, and multi-currency support.
- **Gamified Achievements**: Tracks user activity (e.g., trips planned, expenses recorded, reviews written) to unlock achievements with different rarity levels.
- **User Onboarding & Personalization**: Multi-step registration and onboarding process to collect detailed user preferences (interests, travel styles, budget, group size) for personalized recommendations and dynamic content adaptation.
- **Multi-API Travel Data Integration**: Combines Google Places API for real-time search and place details, a comprehensive seeded South American database, and a TripAdvisor-ready infrastructure for future integration.
- **Weather Integration & Travel Timing System**: Real-time weather data (OpenWeather API) and historical climate analysis. Provides "Best Time to Travel" recommendations based on climate patterns, tourist density, and pricing cycles for specific South American destinations.
- **Real Places Booking Integration**: Automatically enriches AI-generated trip suggestions with real, bookable locations from Google Places API, including links, ratings, addresses, and photos.
- **UI/UX Decisions**: Consistent use of shadcn/ui components, custom styling with Tailwind CSS, fixed dimensions and responsive text styling for cards, unified trip planning interface with tabbed navigation, and visual indicators for weather and travel timing.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Replit Auth**: Authentication provider.
- **OpenAI API**: For AI-powered trip planning, itinerary generation, and conversational AI.
- **Google Places API**: For real-world location data, booking suggestions, and enriching AI outputs.
- **OpenWeather API**: For real-time weather data and forecasts.
- **Facebook Graph API**: For social media content collection with FB_PAGE_TOKEN.
- **@neondatabase/serverless**: PostgreSQL connection.
- **drizzle-orm**: ORM.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **openid-client**: OpenID Connect implementation.
- **passport**: Authentication middleware.
- **connect-pg-simple**: PostgreSQL session store.

## Python Collector Service
- **FastAPI**: Modern Python web framework with SQLAlchemy ORM
- **Uvicorn**: ASGI server for FastAPI
- **Requests**: HTTP library for API calls
- **Jinja2**: Template engine for HTML rendering
- **SQLAlchemy**: Database ORM with SQLite backend
- **Google Maps JavaScript API**: For interactive maps
- **Google Places API**: For detailed place information and automated collection
- **Facebook Graph API**: For social media content extraction

## Recent Migration to Supabase (Aug 2025)
- **Migration Prepared**: Updated database connection from Neon to Supabase PostgreSQL
- **Connection Setup**: Updated server/db.ts to use standard PostgreSQL driver instead of Neon serverless
- **Database Configuration**: Ready for Supabase with proper SSL and connection pooling
- **Migration Scripts**: Created comprehensive SQL scripts and migration guides for Supabase setup
- **Community Platform**: Full social platform with place reviews, chat rooms, and travel buddy matching
- **Data Preservation**: All 392 places and 1,943 reviews prepared for Supabase migration
- **Network Challenge**: Replit → Supabase direct connection blocked, requires Connection Pooler or Vercel deployment
- **Schema Compatibility**: Maintained all existing table structures and relationships for seamless migration
- **Migration Completed**: Successfully migrated to Supabase PostgreSQL via Transaction Pooler
- **Connection Fixed**: Resolved "getaddrinfo ENOTFOUND" error by updating DATABASE_URL secret with correct Transaction Pooler address (aws-1-sa-east-1.pooler.supabase.com:6543)
- **Database API**: Added basic /api/places endpoint that combines destinations, accommodations, attractions, and restaurants
- **Current Status**: Server running successfully with Supabase connection and OpenAI API integration. All core functionality operational.