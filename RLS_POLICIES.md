# Row Level Security (RLS) Policies for GlobeMate DMs and Attachments

This document outlines the Row Level Security policies needed for the Direct Messages and File Attachments feature in Supabase.

## Overview

The DM and attachments feature requires the following new tables:
- `chat_attachments` - Stores file metadata for message attachments
- Enhanced `chat_room_members` - Manages DM room membership
- Enhanced `chat_rooms` - Includes `room_type` for distinguishing DMs from group chats

## Required RLS Policies

### 1. Chat Attachments Table

```sql
-- Enable RLS
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attachments in rooms they're members of
CREATE POLICY "Users can view attachments in accessible rooms" ON chat_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_members crm
            JOIN chat_messages cm ON cm.id = chat_attachments.message_id
            WHERE crm.room_id = cm.room_id 
            AND crm.user_id = auth.uid()::text
        )
    );

-- Policy: Users can insert attachments in rooms they're members of
CREATE POLICY "Users can upload attachments to accessible rooms" ON chat_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_room_members crm
            JOIN chat_messages cm ON cm.id = chat_attachments.message_id
            WHERE crm.room_id = cm.room_id 
            AND crm.user_id = auth.uid()::text
        )
    );

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments" ON chat_attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_messages cm
            WHERE cm.id = chat_attachments.message_id 
            AND cm.user_id = auth.uid()::text
        )
    );
```

### 2. Chat Room Members Table (Enhanced)

```sql
-- Enable RLS if not already enabled
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of rooms they belong to
CREATE POLICY "Users can view members of their rooms" ON chat_room_members
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_room_members 
            WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can join public rooms or be added to DMs
CREATE POLICY "Users can join accessible rooms" ON chat_room_members
    FOR INSERT WITH CHECK (
        -- Can join public rooms
        EXISTS (
            SELECT 1 FROM chat_rooms cr 
            WHERE cr.id = room_id 
            AND cr.is_private = false
        )
        OR
        -- Can be added to DMs by existing members
        EXISTS (
            SELECT 1 FROM chat_rooms cr 
            WHERE cr.id = room_id 
            AND cr.room_type = 'dm'
            AND EXISTS (
                SELECT 1 FROM chat_room_members crm 
                WHERE crm.room_id = room_id 
                AND crm.user_id = auth.uid()::text
            )
        )
    );

-- Policy: Users can leave rooms they're members of
CREATE POLICY "Users can leave their rooms" ON chat_room_members
    FOR DELETE USING (user_id = auth.uid()::text);
```

### 3. Chat Rooms Table (Enhanced for DMs)

```sql
-- Enable RLS if not already enabled
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view rooms they're members of
CREATE POLICY "Users can view accessible rooms" ON chat_rooms
    FOR SELECT USING (
        -- Public rooms are viewable by all
        is_private = false
        OR
        -- Private rooms (DMs) are viewable by members only
        EXISTS (
            SELECT 1 FROM chat_room_members crm 
            WHERE crm.room_id = id 
            AND crm.user_id = auth.uid()::text
        )
    );

-- Policy: Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" ON chat_rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Room members can update room details
CREATE POLICY "Room members can update room details" ON chat_rooms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_room_members crm 
            WHERE crm.room_id = id 
            AND crm.user_id = auth.uid()::text
            AND crm.role IN ('admin', 'moderator')
        )
    );
```

### 4. Chat Messages Table (Enhanced for Attachments)

```sql
-- Enhanced policy for viewing messages with attachment support
DROP POLICY IF EXISTS "Users can view messages in accessible rooms" ON chat_messages;

CREATE POLICY "Users can view messages in accessible rooms" ON chat_messages
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_room_members 
            WHERE user_id = auth.uid()::text
        )
    );

-- Policy for creating messages remains the same but should support attachments
DROP POLICY IF EXISTS "Users can send messages to accessible rooms" ON chat_messages;

CREATE POLICY "Users can send messages to accessible rooms" ON chat_messages
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT room_id FROM chat_room_members 
            WHERE user_id = auth.uid()::text
        )
    );
```

### 5. Storage Bucket Policies

```sql
-- Bucket: attachments
-- Enable RLS on storage.objects
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'attachments' 
        AND auth.role() = 'authenticated'
    );

-- Policy: Users can view attachments (public bucket)
CREATE POLICY "Anyone can view attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'attachments');

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Implementation Notes

### Guest Mode Support
Since GlobeMate supports guest mode (users without authentication), the current implementation uses `author_name` instead of `user_id` for identifying message senders. The RLS policies above assume authenticated users, but the application layer handles guest users separately.

### Room Types
- `public` - Open chat rooms visible to all users
- `dm` - Direct message rooms between two users
- `group` - Private group chats (future enhancement)

### File Upload Security
1. Files are uploaded to Supabase Storage with unique names
2. File metadata is stored in `chat_attachments` table
3. Only members of the relevant chat room can access attachments
4. File size limits are enforced at application level (10MB)

### Migration Considerations
When implementing these policies:
1. Test with a small dataset first
2. Ensure existing data is not affected
3. Consider creating a backup before applying RLS policies
4. Test both authenticated and guest user flows

## Testing the Policies

After implementing these policies, test the following scenarios:

1. **DM Creation**: Two users should be able to start a DM
2. **File Upload**: Users should be able to upload files to DMs they're part of
3. **Access Control**: Users should not see DMs they're not part of
4. **File Access**: Users should only access attachments from accessible rooms
5. **Guest Mode**: Guest users should still be able to use public chat rooms

## Security Considerations

1. **File Content Scanning**: Consider implementing virus scanning for uploaded files
2. **File Type Validation**: Restrict file types at both client and server level
3. **Rate Limiting**: Implement rate limiting for file uploads to prevent abuse
4. **File Cleanup**: Implement periodic cleanup of orphaned attachments
5. **Privacy**: Ensure DM content is truly private and not accessible to unauthorized users