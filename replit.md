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
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support

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
- **@neondatabase/serverless**: PostgreSQL connection.
- **drizzle-orm**: ORM.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **openid-client**: OpenID Connect implementation.
- **passport**: Authentication middleware.
- **connect-pg-simple**: PostgreSQL session store.