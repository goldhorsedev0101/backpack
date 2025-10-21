# GlobeMate - Global Travel Platform

## Overview
GlobeMate is a full-stack web application for worldwide travel planning and community building. It uses AI to provide personalized trip recommendations, itinerary generation, and expense tracking. The platform integrates advanced AI capabilities with social features to simplify travel logistics and foster a global travel community. It supports over 70 countries with multilingual support (Hebrew/English) and offers detailed destination data, including climate information. The platform aims to be a comprehensive global travel planner.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod
- **UI/UX Decisions**: Responsive design with consistent shadcn/ui components, Tailwind CSS for custom styling, tabbed navigation, and a clean visual style with a white background, colorful gradient cards (orange-50 → teal-50 → blue-50), and orange (orange-500) section titles. Desktop sidebar navigation uses ScrollArea component to display all 11 menu items with proper scrolling. Trip planning interface uses unified "Interests" section that combines travel styles and interests into a single selection experience with icons (24 options total) for simplified user experience.

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
- **Key Tables**: Users, Sessions, Trips, Reviews, Expenses, Chat, User Connections, Journeys. Includes detailed tables for destinations, accommodations, attractions, restaurants, location_reviews, location_photos, location_ancestors.

### Core Features & Technical Implementations
- **AI-Powered Trip Planning**: Utilizes OpenAI for personalized recommendations, itinerary generation, and an interactive assistant, considering traveler composition and trip type. Integrates Google Places API for real-world booking suggestions.
- **AI Assistant Page**: Dedicated full-page AI assistant interface (`/ai-assistant`) that combines active chat with conversation history sidebar. Features include: auto-save of conversations 2 seconds after last message, sidebar with all past conversations, ability to view past chats or start new ones, seamless auto-redirect from home page when user sends first message (message is automatically submitted and answered without re-entry). Users can seamlessly switch between new conversations and viewing history. Uses `chat_sessions` table with JSONB message storage and sessionStorage for cross-page message passing. **Full language support**: AI responds entirely in Hebrew when interface is in Hebrew, including welcome message, questions, and trip suggestions. Language detection is automatic based on UI language setting. Accessible from main navigation and home page sidebar.
- **Multi-Destination Journeys**: Pre-planned, curated multi-city itineraries with detailed breakdowns (accommodations, daily schedules, transport, cost estimates). Features a filterable list (`/journeys`) and detailed pages, with an option to convert journeys into personalized trips via AI.
- **Community Features**: Reviews, user connections, real-time chat (WebSockets), content sharing, and gamified achievements.
- **Budget Tracking**: Expense categorization, trip association, visual analytics, and multi-currency support with dynamic budget ranges.
- **User Onboarding & Personalization**: Multi-step registration to collect preferences for tailored recommendations. Fully translated with Hebrew/English support, using i18n for all UI text including step titles, descriptions, form labels, placeholders, and button text. Uses translation keys as stable identifiers to preserve backend data integrity.
- **Multi-API Travel Data Integration**: Combines Google Places API for real-time search with a seeded database and TripAdvisor-ready infrastructure.
- **Weather & Travel Timing System**: Real-time weather data (OpenWeather API) and historical climate analysis for "Best Time to Travel" recommendations.
- **Real Places Booking Integration**: Enriches AI-generated suggestions with bookable locations from Google Places API.
- **Destinations Hub**: Comprehensive discovery system with search, filters, sorting, and detailed pages including weather, attractions, and interactive Google Maps integration using real Google Places API data.
- **Global Expansion & Multilingual Support**: Worldwide destination coverage with full Hebrew/English bilingual support across all features, including instant language toggling and RTL support for content and interactive elements.
- **Support Pages**: Help Center, Contact Us, Privacy Policy, Terms of Service, Accessibility Statement, and About Us pages with full translation and RTL support.
- **Footer Component**: Comprehensive footer with 4 columns (About, Quick Links, Support, Contact Info), social media links, and legal links. Fully responsive with RTL support and proper sidebar spacing.
- **Optimized Image Loading**: Custom `OptimizedImage` component with retry, lazy loading, skeleton states, and error handling for galleries.
- **Hotel Deals Landing Page & Email Notification System**: A landing page (`/hotel-deals`) for capturing hotel quote requests, saving inquiries to a `hotel_inquiries` table in Supabase, and sending email notifications via Gmail SMTP (nodemailer) with a Hebrew RTL template.

## External Dependencies
- **PostgreSQL**: Primary database (via Supabase).
- **Supabase**: BaaS for PostgreSQL, Authentication (Google OAuth), and storage.
- **OpenAI API**: For AI trip planning and conversational features.
- **Google Places API**: For real-world location data and booking suggestions.
- **OpenWeather API**: For real-time weather data and forecasts.
- **drizzle-orm**: ORM for database interaction.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **connect-pg-simple**: PostgreSQL session store.
- **FastAPI**: Python web framework used in the Collector microservice.
- **Uvicorn**: ASGI server.
- **Requests**: HTTP library.
- **Jinja2**: Template engine.
- **SQLAlchemy**: ORM used in Collector microservice.
- **Google Maps JavaScript API**: For interactive maps.
- **Nodemailer**: For sending email notifications (e.g., hotel inquiry confirmations).