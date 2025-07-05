# 📸 TripWise App Categories - Visual Guide

## 1. 🌟 Landing Page
**Route**: `/` (unauthenticated)

**Screen Description**:
- **Hero Section**: Large title "TripWise - Your South American Adventure Awaits"
- **Subtitle**: "AI-driven social trip planning platform for backpackers"
- **Primary CTA**: "Start Planning Your Trip" button
- **Feature Grid**: 3-4 cards showing key features
- **Social Proof**: Testimonials or user count
- **Color Scheme**: Orange/amber primary colors with clean white/gray background

## 2. 🏠 Home Dashboard
**Route**: `/` (authenticated)

**Screen Description**:
- **Navigation Header**: Logo, main menu items, user profile
- **Welcome Banner**: "Welcome back, [User Name]"
- **Quick Actions**: Cards for "Plan New Trip", "Track Expenses", "Explore Community"
- **Recent Trips**: Horizontal carousel of user's recent trips
- **Stats Overview**: Budget summary, trips planned, destinations visited
- **Activity Feed**: Recent community activity or personal trip updates

## 3. 🎯 Trip Builder (Enhanced with Budget Estimator)
**Route**: `/trip-builder`

**Screen Layout** (3-column on desktop):

### Column 1: Trip Preferences Form
- **Destination Dropdown**: Select from 10 South American countries
- **Duration Selector**: 1-2 weeks to 3+ months options
- **Travel Style Grid**: 4 cards (Adventure, Culture, Food, Nightlife)
- **Additional Notes**: Text area for preferences
- **Generate Trip Button**: AI-powered trip creation

### Column 2: AI Generated Itinerary
- **Trip Overview**: Title, description, total cost
- **Destinations List**: Each with days, cost, activities
- **Recommendations**: AI suggestions for the trip
- **Save/Start Over Actions**: Trip management buttons

### Column 3: Interactive Budget Estimator (NEW!)
- **Budget Slider**: Range from $500 to $8,000
- **Budget Level Badge**: "Budget", "Mid-Range", or "Luxury"
- **Daily Cost Display**: Real-time calculation per day
- **Budget Breakdown**: 5 categories with progress bars:
  - Accommodation (35-45%)
  - Transportation (15-25%)
  - Food & Drinks (25%)
  - Activities (10-12%)
  - Other (3-5%)
- **Smart Recommendations**: Context-aware tips
- **Budget Insights**: Alerts and comparisons
- **Budget vs Average**: Comparison with country averages

## 4. 👥 Community
**Route**: `/community`

**Screen Description**:
- **Filter Tabs**: "All Trips", "Recent", "Popular"
- **Trip Cards Grid**: Public trips with:
  - Trip title and destination
  - User profile with avatar
  - Trip duration and budget range
  - Key highlights/activities
  - View/Like actions
- **Search Bar**: Find trips by destination or keywords
- **Sidebar**: Featured destinations, popular users
- **Chat Integration**: Community chat rooms

## 5. 💰 Budget Tracker (Enhanced)
**Route**: `/budget-tracker`

**Screen Layout**:

### Top Section: Trip Selection & Overview
- **Trip Selector**: Dropdown to choose active trip
- **Add Expense Button**: Quick action to log new expense

### Main Content (2-column):

#### Left Column: Budget Overview (Enhanced Component)
- **Trip Information**: Title, dates, destinations
- **Budget Progress Bar**: Visual representation of spending
- **Budget Stats Grid**: 4 cards showing:
  - Total Budget ($)
  - Total Spent ($)
  - Remaining ($)
  - Daily Budget ($)
- **Budget Status Alert**: Color-coded warnings/success messages
- **Category Breakdown**: Spending by category with percentages

#### Right Column: Expense Management
- **Category Filter**: Toggle between expense categories
- **Expense List**: Recent expenses with:
  - Amount and category
  - Description and location
  - Date and delete option
- **Add Expense Form**: Quick entry form
- **AI Insights**: Smart spending recommendations

### Bottom Section: Analytics
- **Spending by Category**: Pie chart or bar chart
- **Daily Spending Trend**: Line graph over time
- **Budget Comparison**: Progress across multiple trips

## 6. 💬 Chat Interface (Component)
**Integrated into other pages**

**Chat Panel Features**:
- **Chat Rooms List**: Different topics/destinations
- **Message Thread**: Real-time conversation
- **User Avatars**: Profile pictures for participants
- **Message Input**: Text area with send button
- **Online Status**: Active users indicator

## 🎨 Visual Design Elements

### Color Palette
- **Primary**: Orange/amber tones (#f97316, #ea580c)
- **Secondary**: Blue accents (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow/amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray scales (#f8fafc to #1e293b)

### Typography
- **Headers**: Bold, large font sizes (text-3xl, text-4xl)
- **Body**: Regular weight, readable sizes (text-sm, text-base)
- **Labels**: Medium weight (font-medium)

### Layout Patterns
- **Cards**: Rounded corners, subtle shadows
- **Forms**: Clean inputs with proper spacing
- **Buttons**: Consistent sizing and hover states
- **Responsive**: Mobile-first design approach

### Icons
- **Lucide React**: Consistent icon library
- **Contextual**: Icons match their functionality
- **Sizes**: 16px, 20px, 24px standard sizes

## 🔧 Interactive Elements

### Budget Estimator Highlights
- **Real-time Updates**: Instant recalculation on input change
- **Visual Feedback**: Progress bars and color coding
- **Smart Recommendations**: Dynamic content based on selections
- **Responsive Design**: Works on all screen sizes

### Form Interactions
- **Validation**: Real-time error messaging
- **Loading States**: Spinners and disabled states
- **Success Feedback**: Toast notifications
- **Smooth Transitions**: CSS animations for state changes