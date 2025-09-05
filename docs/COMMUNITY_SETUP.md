# TripWise Community Setup Guide

This guide will walk you through setting up TripWise's comprehensive community features including chat rooms, direct messages, file attachments, and travel buddy matching.

## 🚀 Quick Start

### 1. Prerequisites
- Supabase project with PostgreSQL database
- Environment variables configured (see `.env.example`)
- Node.js development environment

### 2. Database Setup

#### Create Required Tables
Run these SQL scripts in your Supabase SQL editor:

```bash
# 1. Create chat room members table
scripts/sql/create_chat_room_members.sql

# 2. Create chat attachments table
scripts/sql/create_chat_attachments.sql
```

#### Check Table Status
```bash
# View current RLS policies
scripts/sql/printCommunityPolicies.sql
```

### 3. Configure Security (RLS Policies)

Choose your security model:

#### DEV Mode (Open Access)
For development and testing - **NOT for production**:

```sql
-- Set DEV mode
-- Apply policies from docs/community-rls.md (DEV section)
```

#### PROD Mode (Secure Access) 
For production with proper authentication:

```sql
-- Apply policies from docs/community-rls.md (PROD section)
```

### 4. Storage Setup

Configure Supabase Storage for file attachments:

```bash
# Run storage setup script
tsx scripts/setupStorage.ts
```

This will:
- Create `chat-uploads` bucket
- Configure file upload policies
- Set up file access controls

### 5. Seed Sample Data

Populate your community with sample content:

```bash
# Seed chat rooms, messages, and travel buddy posts
tsx scripts/seedCommunity.ts
```

### 6. Health Check

Verify everything is working:

```bash
# Run comprehensive health check
tsx src/health/communityCheck.ts
```

## 🏗️ Architecture Overview

### Core Components

#### Frontend Components
- **Community.tsx** - Main community page with tabs
- **SidebarDMs.tsx** - Direct message sidebar with invite functionality
- **RoomView.tsx** - Chat interface with message composer
- **FileUpload.tsx** - File attachment with drag & drop
- **MessageItem.tsx** - Rich message display with attachments

#### Backend Services
- **Chat Rooms API** - `/api/chat-rooms` endpoints
- **Direct Messages API** - `/api/dm-rooms` endpoints  
- **File Upload API** - `/api/upload-attachment` endpoint
- **Real-time Messaging** - WebSocket support

#### Database Tables
- `chat_rooms` - Chat room metadata
- `chat_room_members` - Room membership (supports guests)
- `messages` - Chat messages with attachments
- `chat_attachments` - File attachment metadata
- `travel_buddy_posts` - Travel buddy matching

## 📋 Features

### ✅ Implemented Features

#### Chat Rooms
- [x] Public and private chat rooms
- [x] Room discovery and search
- [x] Member management
- [x] Real-time messaging
- [x] Guest user support

#### Direct Messages
- [x] Private 1-on-1 conversations
- [x] Invite by username
- [x] Message history
- [x] Unread message counts

#### File Attachments
- [x] Image uploads with preview
- [x] Document uploads (PDF, Word, etc.)
- [x] File size validation (10MB limit)
- [x] Secure storage with Supabase
- [x] Download functionality

#### Travel Buddy Matching
- [x] Create travel buddy posts
- [x] Browse available trips
- [x] Filter by destination/dates
- [x] Application system

#### Security
- [x] Row Level Security (RLS) policies
- [x] Guest mode with session management
- [x] File access controls
- [x] Anti-spam measures

### 🔄 Message Types Supported
- Text messages with URL auto-linking
- Image attachments with preview
- File attachments with download
- System messages
- Message editing and deletion

### 🛡️ Security Features
- RLS policies for all tables
- Guest session management  
- File upload validation
- Size and type restrictions
- Secure signed URLs for file access

## 🔧 Configuration

### Environment Variables

Required environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Development Settings
ALLOW_DEV_WRITES=true  # For development RLS policies
NODE_ENV=development

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key
```

### File Upload Limits

Current configuration:
- Max file size: 10MB
- Allowed types: Images, PDFs, Documents
- Storage bucket: `chat-uploads`
- Retention: Permanent (manual cleanup)

### Chat Room Settings

Default limits:
- Max members per room: 50-100
- Message length: 2000 characters
- Guest session duration: Session-based
- File attachments per message: 5

## 🐛 Troubleshooting

### Common Issues

#### "Policy violation" errors
- **Cause**: RLS policies blocking access
- **Solution**: Apply correct DEV or PROD policies from `docs/community-rls.md`

#### File upload fails
- **Cause**: Storage bucket not configured or permissions
- **Solution**: Run `tsx scripts/setupStorage.ts`

#### Can't see messages
- **Cause**: Not a member of the room
- **Solution**: Join the room first or check room privacy settings

#### Guest users blocked
- **Cause**: Guest session not set
- **Solution**: Set guest name in chat room first

#### Tables don't exist
- **Cause**: Database tables not created
- **Solution**: Run SQL scripts in `scripts/sql/` directory

### Health Check Tool

Use the health check to diagnose issues:

```bash
tsx src/health/communityCheck.ts
```

This will check:
- Database connection
- Table existence
- API endpoints
- Storage configuration
- RLS policies

### Log Analysis

Check server logs for detailed error information:
- File upload errors
- Database connection issues
- Permission problems
- API endpoint failures

## 🚀 Development Workflow

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run health check
tsx src/health/communityCheck.ts

# Seed sample data
tsx scripts/seedCommunity.ts
```

### 2. Testing Community Features

1. **Visit `/community`** - Main community page
2. **Test chat rooms** - Join public rooms, send messages
3. **Try direct messages** - Invite users, private conversations
4. **Upload files** - Test image and document uploads
5. **Create travel buddy posts** - Test matching system

### 3. Production Deployment

1. **Update environment** - Remove `ALLOW_DEV_WRITES`
2. **Apply PROD policies** - Secure RLS policies
3. **Configure storage** - Production bucket settings
4. **Test thoroughly** - All features with real users

## 📚 Additional Resources

### Documentation Files
- `docs/community-rls.md` - Complete RLS policy guide
- `scripts/sql/` - Database setup scripts
- `src/health/` - Health check tools
- `scripts/setupStorage.ts` - Storage configuration

### API Endpoints
- `GET /api/chat-rooms` - List chat rooms
- `GET /api/dm-rooms` - List direct messages
- `POST /api/chat/messages` - Send message
- `POST /api/upload-attachment` - Upload file
- `GET /api/health` - Health check

### Component Structure
```
client/src/components/community/
├── ChatSidebar.tsx         # Chat room list
├── SidebarDMs.tsx          # Direct message list  
├── RoomView.tsx            # Chat interface
├── MessageItem.tsx         # Message display
├── FileUpload.tsx          # File attachment
├── TravelBuddyList.tsx     # Travel buddy posts
└── NewBuddyPostModal.tsx   # Create new post
```

## 🆘 Support

If you encounter issues:

1. **Run health check** - `tsx src/health/communityCheck.ts`
2. **Check RLS policies** - Apply correct policies for your environment
3. **Verify environment variables** - Ensure all required vars are set
4. **Review server logs** - Check for detailed error messages
5. **Test with sample data** - Use seeding script to verify setup

The community features are designed to be robust and production-ready with proper security, file handling, and real-time messaging capabilities.