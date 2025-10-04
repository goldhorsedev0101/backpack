# GlobeMate Community API Documentation

## Chat Rooms API

### Get All Chat Rooms
```
GET /api/chat-rooms
```

**Description**: Retrieves all available chat rooms with basic information.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Machu Picchu Travelers",
    "description": "Chat about visiting Machu Picchu",
    "destination": "Machu Picchu",
    "member_count": 24,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Chat Messages
```
GET /api/chat/messages/:roomId
```

**Description**: Retrieves messages for a specific chat room.

**Parameters**:
- `roomId` (number): ID of the chat room

**Response**:
```json
[
  {
    "id": 1,
    "room_id": 1,
    "message": "Hello everyone! Planning to visit next month.",
    "author_name": "TravelLover123",
    "user_id": null,
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

### Send Chat Message
```
POST /api/chat/messages
```

**Description**: Sends a new message to a chat room.

**Request Body**:
```json
{
  "room_id": 1,
  "message": "Looking forward to my trip!",
  "author_name": "Explorer456"
}
```

**Response**:
```json
{
  "id": 2,
  "room_id": 1,
  "message": "Looking forward to my trip!",
  "author_name": "Explorer456",
  "user_id": null,
  "created_at": "2025-01-01T10:05:00Z"
}
```

---

## Travel Buddy Posts API

### Get Travel Buddy Posts
```
GET /api/travel-buddy-posts
```

**Description**: Retrieves travel buddy posts with optional filtering.

**Query Parameters**:
- `destination` (string): Filter by destination
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)
- `budget` (string): Filter by budget range (budget, mid-range, luxury)
- `search` (string): Search in titles and descriptions

**Response**:
```json
[
  {
    "id": 1,
    "title": "Backpacking Through Peru",
    "description": "Looking for adventure buddies to explore Peru",
    "destination": "Peru",
    "start_date": "2025-03-15",
    "end_date": "2025-03-30",
    "budget_range": "budget",
    "group_size": "small_group",
    "travel_style": ["adventure", "cultural"],
    "contact_info": "email@example.com",
    "author_name": "AdventurePal",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Travel Buddy Post
```
POST /api/travel-buddy-posts
```

**Description**: Creates a new travel buddy post.

**Request Body**:
```json
{
  "title": "Amazon Rainforest Adventure",
  "description": "Seeking eco-conscious travelers for Amazon exploration",
  "destination": "Amazon Rainforest",
  "start_date": "2025-04-01",
  "end_date": "2025-04-10",
  "budget_range": "mid-range",
  "group_size": "small_group",
  "travel_style": ["adventure", "nature"],
  "contact_info": "traveler@email.com",
  "author_name": "EcoExplorer"
}
```

**Response**:
```json
{
  "id": 2,
  "title": "Amazon Rainforest Adventure",
  "description": "Seeking eco-conscious travelers for Amazon exploration",
  "destination": "Amazon Rainforest",
  "start_date": "2025-04-01",
  "end_date": "2025-04-10",
  "budget_range": "mid-range",
  "group_size": "small_group",
  "travel_style": ["adventure", "nature"],
  "contact_info": "traveler@email.com",
  "author_name": "EcoExplorer",
  "created_at": "2025-01-01T12:00:00Z"
}
```

### Get Specific Travel Buddy Post
```
GET /api/travel-buddy-posts/:id
```

**Description**: Retrieves details for a specific travel buddy post.

**Parameters**:
- `id` (number): ID of the travel buddy post

**Response**: Same format as single post in the list above.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Data Models

### Chat Room
```typescript
interface ChatRoom {
  id: number;
  name: string;
  description: string;
  destination: string;
  member_count: number;
  created_at: string;
}
```

### Chat Message
```typescript
interface ChatMessage {
  id: number;
  room_id: number;
  message: string;
  author_name: string;
  user_id: string | null;
  created_at: string;
}
```

### Travel Buddy Post
```typescript
interface TravelBuddyPost {
  id: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_range: 'budget' | 'mid-range' | 'luxury';
  group_size: 'solo' | 'couple' | 'small_group' | 'large_group';
  travel_style: string[];
  contact_info: string;
  author_name: string;
  created_at: string;
}
```