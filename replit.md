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

## User Personalization & Onboarding System

### Features Implemented
- **Multi-Step Onboarding**: 6-step guided setup for new users
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