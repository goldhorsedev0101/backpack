# GlobeMate Community Components Guide

## Component Architecture Overview

The community features are built using a modular component architecture with clear separation of concerns. Each feature has its own dedicated components that can be easily maintained and extended.

---

## Chat Components

### ChatSidebar Component
**Location**: `client/src/components/community/ChatSidebar.tsx`

**Purpose**: Displays a sidebar with all available chat rooms, allowing users to select and join conversations.

**Key Features**:
- Lists all active chat rooms
- Shows member counts for each room
- Highlights currently selected room
- Real-time updates of room activity
- Mobile responsive collapsible design

**Props**:
```typescript
interface ChatSidebarProps {
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
}
```

**Usage**:
```tsx
<ChatSidebar 
  selectedRoomId={currentRoom} 
  onRoomSelect={setCurrentRoom} 
/>
```

### RoomView Component
**Location**: `client/src/components/community/RoomView.tsx`

**Purpose**: Main chat interface showing messages for the selected room with a message composer.

**Key Features**:
- Displays chat messages in chronological order
- Auto-scrolls to latest messages
- Message composition with emoji support
- Guest mode username input
- Real-time message updates
- Infinite scroll for message history

**Props**:
```typescript
interface RoomViewProps {
  roomId: number | null;
}
```

**Usage**:
```tsx
<RoomView roomId={selectedRoomId} />
```

### MessageItem Component
**Location**: `client/src/components/community/MessageItem.tsx`

**Purpose**: Individual message display component with author information and timestamp.

**Key Features**:
- Author avatar and name display
- Message content formatting
- Timestamp with relative time
- Support for guest and authenticated users
- Message status indicators

**Props**:
```typescript
interface MessageItemProps {
  message: {
    id: number;
    message: string;
    author_name: string;
    created_at: string;
    user_id: string | null;
  };
}
```

**Usage**:
```tsx
<MessageItem message={messageData} />
```

---

## Travel Buddy Components

### TravelBuddyList Component
**Location**: `client/src/components/community/TravelBuddyList.tsx`

**Purpose**: Grid display of travel buddy posts with filtering and search capabilities.

**Key Features**:
- Grid layout of travel posts
- Search and filter functionality
- Budget, destination, and date filtering
- Responsive card design
- Pagination support
- Create new post button

**Props**:
```typescript
interface TravelBuddyListProps {
  onCreatePost: () => void;
}
```

**Usage**:
```tsx
<TravelBuddyList onCreatePost={() => setShowModal(true)} />
```

### NewBuddyPostModal Component
**Location**: `client/src/components/community/NewBuddyPostModal.tsx`

**Purpose**: Modal form for creating new travel buddy posts with comprehensive trip details.

**Key Features**:
- Multi-step form with validation
- Date picker for travel dates
- Budget range selection
- Travel style preferences
- Group size options
- Contact information fields
- Form validation and error handling

**Props**:
```typescript
interface NewBuddyPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Usage**:
```tsx
<NewBuddyPostModal 
  open={showModal} 
  onOpenChange={setShowModal} 
/>
```

---

## Data Management

### API Layer
**Location**: `client/src/lib/communityApi.ts`

**Purpose**: Centralized API functions for community features.

**Key Functions**:
```typescript
// Chat API
export const fetchChatRooms = () => Promise<ChatRoom[]>
export const fetchChatMessages = (roomId: number) => Promise<ChatMessage[]>
export const sendChatMessage = (data: MessageData) => Promise<ChatMessage>

// Travel Buddy API
export const fetchTravelBuddyPosts = (filters?: PostFilters) => Promise<TravelBuddyPost[]>
export const createTravelBuddyPost = (data: PostData) => Promise<TravelBuddyPost>
```

### State Management
- Uses TanStack Query for server state management
- Real-time updates via polling
- Optimistic updates for better UX
- Error handling and retry logic

---

## Styling and Design

### Design System
- Built with Shadcn/ui components
- Consistent color scheme and typography
- Responsive design principles
- Accessibility features included

### CSS Classes
```css
/* Chat specific styles */
.chat-sidebar { /* Sidebar styling */ }
.message-item { /* Individual message styling */ }
.room-view { /* Main chat area styling */ }

/* Travel buddy specific styles */
.buddy-card { /* Post card styling */ }
.filter-bar { /* Filter controls styling */ }
.modal-form { /* Form modal styling */ }
```

---

## Integration Points

### Community Page Integration
**Location**: `client/src/pages/Community.tsx`

The main Community page integrates both features using a tabbed interface:

```tsx
<Tabs defaultValue="chat">
  <TabsList>
    <TabsTrigger value="chat">Chat Rooms</TabsTrigger>
    <TabsTrigger value="buddies">Travel Buddies</TabsTrigger>
  </TabsList>
  
  <TabsContent value="chat">
    <div className="flex gap-4">
      <ChatSidebar />
      <RoomView />
    </div>
  </TabsContent>
  
  <TabsContent value="buddies">
    <TravelBuddyList />
  </TabsContent>
</Tabs>
```

### Authentication Integration
- Supports both guest and authenticated modes
- Seamless transition between modes
- Protected features for authenticated users

---

## Development Guidelines

### Adding New Features
1. Create new components in appropriate subdirectories
2. Follow existing naming conventions
3. Implement proper TypeScript interfaces
4. Add comprehensive error handling
5. Include responsive design considerations

### Testing Considerations
- Components are designed for easy unit testing
- Mock API responses for development
- Handle loading and error states
- Test responsive behavior

### Performance Optimizations
- Lazy loading for large message lists
- Efficient re-rendering with proper keys
- Image optimization for avatars
- Debounced search and filtering