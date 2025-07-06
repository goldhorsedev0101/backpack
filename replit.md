# TripWise - South American Travel Platform

## Overview

TripWise is a full-stack web application focused on South American travel planning and community building. The platform combines AI-powered trip planning, expense tracking, community features, and real-time chat functionality to help travelers explore South America effectively.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support for chat features

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Key Tables**:
  - Users (mandatory for Replit Auth)
  - Sessions (mandatory for Replit Auth)
  - Trips (user travel plans)
  - Reviews (destination feedback)
  - Expenses (budget tracking)
  - Chat rooms and messages
  - User connections

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Authorization**: Route-level protection with middleware
- **User Management**: Automatic user creation and profile management

### Trip Planning Module
- **AI-Powered Suggestions**: Bot-assisted trip recommendations
- **Destination Focus**: South American countries (Peru, Colombia, Bolivia, etc.)
- **Budget Planning**: Integrated expense tracking and budget management
- **Travel Styles**: Customizable preferences (adventure, cultural, budget, luxury)

### Community Features
- **Reviews System**: Destination reviews with ratings
- **User Connections**: Social networking between travelers
- **Real-time Chat**: WebSocket-based chat rooms
- **Content Sharing**: Trip sharing and community engagement

### Budget Tracking
- **Expense Categories**: Accommodation, transport, food, activities, etc.
- **Trip Association**: Expenses linked to specific trips
- **Visual Analytics**: Budget overview and spending insights
- **Multi-currency Support**: Designed for international travel

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created → User profile accessed
2. **Trip Creation**: User inputs preferences → AI suggestions generated → Trip saved to database
3. **Community Interaction**: Users browse content → Leave reviews → Connect with others → Real-time chat
4. **Expense Tracking**: Users log expenses → Associated with trips → Analytics generated

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui/***: Accessible UI primitives

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Backend bundling for production

### Authentication & Session
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Configured via `DATABASE_URL` environment variable
- **Authentication**: Replit Auth with development domain support

### Production
- **Build Process**: 
  - Frontend: Vite build to `dist/public`
  - Backend: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served from `dist/public`
- **Environment**: Node.js production server
- **Database**: PostgreSQL with connection pooling

### Configuration Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed authentication domains
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)

## AI Integration

### OpenAI Features
- **Trip Planning**: AI-powered travel suggestions for South American destinations
- **Itinerary Generation**: Detailed day-by-day trip planning with activities and costs
- **Budget Analysis**: Smart expense analysis with optimization recommendations  
- **Travel Assistant**: Interactive chat bot for travel questions and advice
- **Destination Recommendations**: Community-driven suggestions powered by AI

### Core API Endpoints

**Authentication & Users**
- `/api/auth/user` - Get authenticated user details
- `/api/user/preferences` - Get/update user travel preferences and settings

**Trip Management**
- `/api/trips` - Get public trips (community feed)
- `/api/trips/user` - Get user's personal trips
- `/api/trips` (POST) - Create new trip
- `/api/trips/:id` - Get/update/delete specific trip

**AI-Powered Features**
- `/api/ai/generate-trip` - Enhanced trip generation with real AI
- `/api/ai/travel-suggestions` - Get personalized destination recommendations
- `/api/ai/itinerary` - Generate detailed itineraries
- `/api/ai/budget-analysis` - Analyze expenses and get savings tips
- `/api/ai/recommendations` - Get destination advice based on reviews
- `/api/ai/chat` - Interactive travel assistant

**Budget & Expenses**
- `/api/expenses/user` - Get user's all expenses
- `/api/expenses/trip/:id` - Get expenses for specific trip
- `/api/expenses` (POST) - Add new expense

**Community & Reviews**
- `/api/reviews` - Get recent community reviews
- `/api/reviews` (POST) - Submit new review
- `/api/reviews/destination/:name` - Get reviews for specific destination

**Travel Information**
- `/api/weather/:destination` - Get weather forecast
- `/api/currency/:from/:to` - Get exchange rates
- `/api/safety/:country` - Get safety advisories and tips
- `/api/transport/:from/:to` - Get transportation options
- `/api/accommodation/:destination` - Search accommodations
- `/api/activities/:destination` - Find local activities and tours
- `/api/restaurants/:destination` - Discover local restaurants
- `/api/visa-requirements/:from/:to` - Check visa requirements
- `/api/insurance/quotes` - Get travel insurance quotes
- `/api/checklist/:destination/:duration` - Get travel preparation checklist
- `/api/emergency/:country` - Get emergency contacts and info
- `/api/maps/:destination/download` - Get offline map downloads

**Social Features**
- `/api/connections` - Get/manage user connections
- `/api/chat/rooms` - Get available chat rooms
- `/api/chat/messages/:roomId` - Get chat messages
- `/ws` - WebSocket for real-time chat

**Platform Features**
- `/api/deals` - Get current travel deals and offers
- `/api/notifications` - Get user notifications
- `/api/analytics/dashboard` - Get user travel analytics
- `/api/search` - Universal search (destinations, activities, restaurants)
- `/api/export/user-data` - Export user data backup
- `/api/health` - System health check
- `/api/feedback` (POST) - Submit feedback and support requests

### Components
- `AiChat` - Standalone AI chat component with quick prompts
- Enhanced trip builder with real OpenAI suggestions
- Budget tracker with AI-powered optimization tips

## Changelog
- July 05, 2025. Initial setup
- July 05, 2025. Added OpenAI API integration with comprehensive AI features
- July 05, 2025. Implemented gamified achievement badge system with database schema, API routes, and modern UI components
- July 05, 2025. Fixed navigation layout issues preventing main content display after login
- July 05, 2025. Resolved OpenAI integration issues for trip generation and AI chat assistant functionality
- July 05, 2025. Implemented comprehensive user onboarding and personalization system with multi-step preference collection, personalized destination recommendations, and enhanced trip planning
- July 05, 2025. Fixed onboarding "Complete Setup" button navigation issue - now properly redirects to home page after completing setup
- July 05, 2025. Restructured user flow - Landing page now appears first for all users, onboarding only starts after sign-in button is clicked
- July 05, 2025. Modified authentication flow - Personalization (onboarding) now always happens immediately after login/register, regardless of previous completion status
- July 05, 2025. Implemented conditional authentication UI on landing page - separate login/register buttons, welcome messages for authenticated users, and dynamic trip generation functionality
- July 05, 2025. Fixed logout functionality - added proper environment-based redirect logic, cache clearing to prevent stale auth state, and consistent logout handling across all components
- July 05, 2025. Resolved application loading issues - fixed unhandled promise rejections in authentication, added error boundary component, and improved error handling in query client
- July 06, 2025. Implemented comprehensive TripAdvisor-style database integration with complete schema, API endpoints, and sample South American travel data including destinations, accommodations, attractions, restaurants, reviews, and ratings
- July 06, 2025. Added user registry page that appears after registration - collects basic profile information (bio, location, travel style, budget) before proceeding to full onboarding
- July 06, 2025. Enhanced logout system with complete session clearing - removes all authentication data, clears cache, destroys server sessions, and prevents authentication persistence
- July 06, 2025. Updated landing page "Start Planning" buttons to navigate directly to AI Trip Builder for authenticated users, or redirect to login for new users

## User Preferences

Preferred communication style: Simple, everyday language.

## Gamified Achievement System

### Features Implemented
- **Database Schema**: Achievement definitions and user progress tracking tables
- **API Endpoints**: 
  - `/api/achievements` - Get all available achievements
  - `/api/achievements/user` - Get user's achievement progress  
  - `/api/achievements/check` - Check for newly unlocked achievements
  - `/api/achievements/init` - Initialize default achievement set
- **Frontend Components**:
  - `AchievementBadge` - Reusable badge component with rarity styling
  - `/achievements` page - Complete achievement tracking dashboard
- **Achievement Categories**: Travel, Budget, Social, Exploration, Adventure, Cultural
- **Rarity System**: Common, Rare, Epic, Legendary with visual effects
- **Auto-checking**: System automatically checks for new achievements based on user activity

### Default Achievements
1. **First Steps** (10 pts) - Plan your first trip
2. **Trip Explorer** (50 pts) - Plan 5 different trips  
3. **Country Collector** (75 pts) - Visit 3 different countries
4. **Budget Tracker** (30 pts) - Record 10 expenses
5. **Review Writer** (40 pts) - Write 5 destination reviews
6. **Big Spender** (100 pts) - Spend over $1000 on travels
7. **Adventure Seeker** (25 pts) - Plan an adventure trip
8. **Cultural Explorer** (25 pts) - Plan a cultural trip
9. **Social Butterfly** (60 pts) - Connect with 10 travelers
10. **South America Master** (500 pts) - Visit all 13 SA countries

## User Registration & Onboarding System

### Registry Page (Post-Registration)
- **Initial Profile Setup**: Required after user registration/login
- **Basic Information Collection**:
  - Personal bio (10-500 characters)
  - Current location
  - Primary travel style selection
  - Preferred trip duration
  - Budget range preference
- **User Flow**: Registry → Onboarding → Main Application
- **Database Field**: `registrationCompleted` boolean tracks completion

### Onboarding System (Post-Registry)
- **Multi-Step Onboarding**: 6-step guided setup for registered users
- **Comprehensive Preference Collection**:
  - Travel interests (12 categories: History & Culture, Adventure Sports, Nature & Wildlife, etc.)
  - Travel styles (9 options: Adventure, Cultural, Budget Backpacking, Luxury, etc.)
  - Budget preferences (Budget $500-1500, Mid-range $1500-3000, Luxury $3000+)
  - Group size and duration preferences
  - Activity preferences and personality traits
  - Accommodation preferences and dietary restrictions
- **Smart Recommendation Engine**: Personalized destination suggestions based on user preferences
- **Dynamic Content**: Home page adapts based on user interests and travel style

### Database Schema Enhancements
Added to users table:
- `interests` (text array) - User's travel interests
- `travelStyles` (text array) - Preferred travel styles  
- `budgetRange` (varchar) - Budget preference category
- `experienceLevel` (varchar) - Travel experience level
- `groupSize` (varchar) - Typical group size
- `preferredDuration` (varchar) - Preferred trip length
- `accommodationType` (text array) - Accommodation preferences
- `activities` (text array) - Preferred activities
- `personalityTraits` (text array) - Travel personality indicators
- `onboardingCompleted` (boolean) - Tracks onboarding completion

### API Endpoints
- `GET /api/user/preferences` - Retrieve user preferences
- `POST /api/user/preferences` - Save/update user preferences with onboarding completion

### Components
- `Onboarding` - Complete 6-step onboarding flow with progress tracking
- `PersonalizedRecommendations` - Dynamic destination recommendations based on user preferences
- Enhanced routing logic to redirect new users to onboarding

## TripAdvisor-Style Database Integration

### Overview
Comprehensive TripAdvisor-like database system for travel data management with full CRUD operations, search functionality, and detailed travel information storage.

### Database Schema

**Core Travel Data Tables:**
- `destinations` - Geographic destinations with coordinates and metadata
- `accommodations` - Hotels, hostels, and lodging options with TripAdvisor-style data
- `attractions` - Tourist attractions and points of interest
- `restaurants` - Dining establishments with cuisine and pricing information
- `location_reviews` - User reviews for all location types
- `location_subratings` - Detailed ratings (service, cleanliness, location, etc.)
- `location_photos` - Photo storage for all locations
- `location_ancestors` - Geographic hierarchy (city → state → country)

### API Endpoints

**Destinations**
- `GET /api/destinations` - List all destinations
- `GET /api/destinations/search?q={query}` - Search destinations by name/location
- `GET /api/destinations/{locationId}` - Get destination details

**Accommodations**
- `GET /api/accommodations` - List accommodations (optional destinationId filter)
- `GET /api/accommodations/search` - Search with filters (location, price, rating)
- `GET /api/accommodations/{locationId}` - Get accommodation details

**Attractions**
- `GET /api/attractions` - List attractions (optional destinationId filter)
- `GET /api/attractions/search` - Search with filters (location, category)
- `GET /api/attractions/{locationId}` - Get attraction details

**Restaurants**
- `GET /api/ta-restaurants` - List restaurants (optional destinationId filter)
- `GET /api/ta-restaurants/search` - Search with filters (location, cuisine, price)
- `GET /api/ta-restaurants/{locationId}` - Get restaurant details

**Reviews & Ratings**
- `GET /api/location-reviews/{locationId}/{category}` - Get reviews for specific location
- `GET /api/location-reviews/recent` - Get recent reviews across all locations
- `POST /api/location-reviews` - Create new review (authenticated)
- `GET /api/location-subratings/{locationId}/{category}` - Get detailed ratings
- `GET /api/location-photos/{locationId}/{category}` - Get photos for location
- `GET /api/location-ancestors/{locationId}` - Get geographic hierarchy

### Data Structure Features

**TripAdvisor Compatibility:**
- Location IDs matching TripAdvisor format
- Comprehensive rating system (1-5 stars with subratings)
- Price level indicators ($, $$, $$$, $$$$)
- Review system with trip types (business, couples, solo, family, friends)
- Awards and recognition tracking
- Photo galleries with metadata
- Operating hours and contact information
- Geographic ancestry for location context

**South American Focus:**
- Seeded with authentic destinations (Lima, Cusco, Bogotá, La Paz)
- Top-rated accommodations and restaurants
- Major attractions including Machu Picchu
- Local cuisine and dining options
- Regional travel patterns and preferences

### Sample Data Included
- 4 major South American destinations
- 2 luxury accommodations with detailed amenities
- 2 world-class attractions including UNESCO sites
- 2 acclaimed restaurants with cuisine details
- Sample reviews and subratings
- Geographic hierarchy data

### Search & Filtering
- Full-text search across names and descriptions
- Geographic filtering by destination
- Price range filtering for accommodations/restaurants
- Category filtering for attractions
- Rating-based filtering
- Cuisine type filtering for restaurants

### Integration Benefits
- Ready for TripAdvisor API data import
- Supports third-party travel data sources
- Scalable schema for millions of locations
- Optimized queries for travel search patterns
- Review aggregation and analysis capabilities