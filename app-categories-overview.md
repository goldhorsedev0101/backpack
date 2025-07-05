# TripWise App Categories Overview

## 📱 Application Structure

TripWise is organized into several main categories accessible through different routes:

### 1. **Landing Page** (`/`)
- **Purpose**: Entry point for new users
- **Features**:
  - Hero section with app introduction
  - Key features showcase
  - Call-to-action for authentication
  - Social proof and testimonials
- **Access**: Public (unauthenticated users only)

### 2. **Home Dashboard** (`/` - authenticated)
- **Purpose**: Main dashboard after login
- **Features**:
  - Welcome message and user overview
  - Quick access to main features
  - Recent trips summary
  - Activity feed
  - Quick stats and insights
- **Access**: Authenticated users only

### 3. **Trip Builder** (`/trip-builder`)
- **Purpose**: AI-powered trip planning interface
- **Features**:
  - **Interactive Budget Estimator** (NEW):
    - Real-time cost calculations
    - Budget breakdown by category
    - Smart recommendations based on budget level
    - Daily cost analysis
    - Country-specific pricing data
  - Destination selection (10 South American countries)
  - Duration picker (1-2 weeks to 3+ months)
  - Travel style preferences (Adventure, Culture, Food, Nightlife)
  - AI-generated itineraries
  - Trip saving functionality
- **Access**: Authenticated users only

### 4. **Community** (`/community`)
- **Purpose**: Social features and trip sharing
- **Features**:
  - Public trip gallery
  - User-generated content
  - Trip reviews and ratings
  - Community discussions
  - Traveler connections
  - Destination insights from other users
- **Access**: Authenticated users only

### 5. **Budget Tracker** (`/budget-tracker`)
- **Purpose**: Comprehensive expense management
- **Features**:
  - **Enhanced Budget Overview Component**:
    - Real-time budget progress tracking
    - Visual budget breakdown
    - Smart budget alerts and insights
    - Category-based expense analysis
  - Expense logging by category
  - Trip-specific expense tracking
  - Budget vs actual spending comparison
  - Expense categorization (Accommodation, Transportation, Food, Activities, Other)
  - Multi-trip expense management
- **Access**: Authenticated users only

### 6. **Chat Interface** (Component-based)
- **Purpose**: Real-time communication
- **Features**:
  - WebSocket-powered messaging
  - Chat rooms for different topics
  - Direct messaging between users
  - Travel advice and tips sharing
- **Access**: Authenticated users only (integrated into other sections)

## 🎨 UI Components Structure

### Navigation
- **Primary Navigation**: Fixed sidebar/header with main category links
- **Mobile Navigation**: Responsive hamburger menu
- **User Profile**: Authentication status and user menu

### Common UI Elements
- **Cards**: Consistent card-based layout for content
- **Forms**: Shadcn UI components with validation
- **Modals**: Dialog-based interactions
- **Toasts**: User feedback notifications
- **Loading States**: Consistent loading indicators

## 🔧 Technical Architecture

### Frontend Categories
- **Pages**: Main route components (`/client/src/pages/`)
- **Components**: Reusable UI components (`/client/src/components/`)
- **Hooks**: Custom React hooks for state management
- **Services**: API communication layer

### Backend Categories
- **API Routes**: RESTful endpoints (`/server/routes.ts`)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration
- **WebSocket**: Real-time communication server

## 🌟 Key Features by Category

### Trip Planning
- AI-powered itinerary generation
- Real-time budget estimation
- Destination-specific recommendations
- Travel style customization

### Budget Management
- Interactive budget sliders
- Real-time cost calculations
- Category-based tracking
- Smart spending insights

### Community Features
- Trip sharing and discovery
- User reviews and ratings
- Social connections
- Travel advice exchange

### Data Management
- User profiles and preferences
- Trip history and favorites
- Expense tracking across trips
- Review and rating system

## 📊 Recent Enhancements

### Interactive Budget Estimator (Latest)
- **Real-time Cost Calculation**: Dynamic pricing based on destination, duration, and travel style
- **Budget Breakdown**: Visual representation of spending categories
- **Smart Recommendations**: Context-aware suggestions based on budget level
- **Country-Specific Data**: Accurate pricing for 10 South American countries
- **Integration**: Seamlessly integrated into Trip Builder interface

### Enhanced Budget Overview
- **Visual Progress Tracking**: Real-time budget utilization monitoring
- **Category Analysis**: Detailed breakdown of spending patterns
- **Smart Alerts**: Proactive budget warnings and insights
- **Multi-trip Support**: Expense tracking across multiple trips