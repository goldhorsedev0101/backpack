# Community RLS Policies - GlobeMate Chat System

This document outlines the Row Level Security (RLS) policies for the GlobeMate community chat system featuring public/private rooms, direct messages, and guest mode support with participant invitations.

## ⚠️ Important: DEV vs PROD

**DEV Mode**: Open policies for development and testing  
**PROD Mode**: Secure policies based on authentication and room membership

## DEV Setup (Open Access)

Use these policies for development when `ALLOW_DEV_WRITES=true`. **DO NOT use in production.**

```sql
-- Enable RLS on all community tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_buddy_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_attachments ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ - Everyone can view content
CREATE POLICY IF NOT EXISTS "public read chat_rooms" 
  ON public.chat_rooms FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "public read messages" 
  ON public.messages FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "public read tb_posts" 
  ON public.travel_buddy_posts FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "public read members" 
  ON public.chat_room_members FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "public read attachments" 
  ON public.chat_attachments FOR SELECT USING (true);

-- DEV WRITE POLICIES (⚠️ DANGER: Not for production)
CREATE POLICY IF NOT EXISTS "public write messages" 
  ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "public write tb_posts" 
  ON public.travel_buddy_posts FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "public write members" 
  ON public.chat_room_members FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "public write attachments" 
  ON public.chat_attachments FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "public write rooms" 
  ON public.chat_rooms FOR INSERT WITH CHECK (true);
```

## PROD Setup (Secure Access)

Use these policies for production with proper authentication and authorization.

### Core Table Policies

```sql
-- CHAT ROOMS
-- View: Public rooms = everyone; Private rooms = members only
CREATE POLICY "secure_view_chat_rooms" 
  ON public.chat_rooms FOR SELECT USING (
    NOT is_private 
    OR EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = chat_rooms.id 
      AND (user_id = auth.uid() OR guest_name = current_setting('app.guest_name', true))
    )
  );

-- Create: Authenticated users only
CREATE POLICY "secure_create_chat_rooms" 
  ON public.chat_rooms FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- MESSAGES
-- View: Members of the room only
CREATE POLICY "secure_view_messages" 
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = messages.room_id 
      AND (user_id = auth.uid() OR guest_name = current_setting('app.guest_name', true))
    )
  );

-- Create: Members of the room only
CREATE POLICY "secure_create_messages" 
  ON public.messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = messages.room_id 
      AND (user_id = auth.uid() OR guest_name = current_setting('app.guest_name', true))
    )
  );

-- Update/Delete: Own messages only
CREATE POLICY "secure_update_messages" 
  ON public.messages FOR UPDATE USING (
    user_id = auth.uid() OR author_name = current_setting('app.guest_name', true)
  );

-- CHAT ROOM MEMBERS
-- View: Members of the same room
CREATE POLICY "secure_view_members" 
  ON public.chat_room_members FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM public.chat_room_members 
      WHERE user_id = auth.uid() OR guest_name = current_setting('app.guest_name', true)
    )
  );

-- Join: Public rooms or invited to private rooms
CREATE POLICY "secure_join_members" 
  ON public.chat_room_members FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND NOT is_private
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = chat_room_members.room_id 
      AND role IN ('admin', 'moderator')
      AND (user_id = auth.uid() OR guest_name = current_setting('app.guest_name', true))
    )
  );

-- ATTACHMENTS
-- View: Members of the room containing the message
CREATE POLICY "secure_view_attachments" 
  ON public.chat_attachments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.chat_room_members crm ON crm.room_id = m.room_id
      WHERE m.id = chat_attachments.message_id
      AND (crm.user_id = auth.uid() OR crm.guest_name = current_setting('app.guest_name', true))
    )
  );

-- Create: Members of the room can attach files
CREATE POLICY "secure_create_attachments" 
  ON public.chat_attachments FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.chat_room_members crm ON crm.room_id = m.room_id
      WHERE m.id = chat_attachments.message_id
      AND (crm.user_id = auth.uid() OR crm.guest_name = current_setting('app.guest_name', true))
    )
  );
```

### Storage Policies

```sql
-- Create chat-uploads bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-uploads', 'chat-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Upload: Authenticated users (files will be linked to messages)
CREATE POLICY "secure_upload_chat_files" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'chat-uploads' 
    AND auth.role() = 'authenticated'
  );

-- View: Members of rooms containing files
CREATE POLICY "secure_view_chat_files" 
  ON storage.objects FOR SELECT USING (
    bucket_id = 'chat-uploads'
    AND EXISTS (
      SELECT 1 FROM public.chat_attachments ca
      JOIN public.messages m ON m.id = ca.message_id
      JOIN public.chat_room_members crm ON crm.room_id = m.room_id
      WHERE ca.path = objects.name
      AND (crm.user_id = auth.uid() OR crm.guest_name = current_setting('app.guest_name', true))
    )
  );

-- Delete: File owner or room admin
CREATE POLICY "secure_delete_chat_files" 
  ON storage.objects FOR DELETE USING (
    bucket_id = 'chat-uploads'
    AND (
      -- File owner
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Room admin
      EXISTS (
        SELECT 1 FROM public.chat_attachments ca
        JOIN public.messages m ON m.id = ca.message_id
        JOIN public.chat_room_members crm ON crm.room_id = m.room_id
        WHERE ca.path = objects.name
        AND crm.user_id = auth.uid()
        AND crm.role IN ('admin', 'moderator')
      )
    )
  );
```

## Guest Support

For guest users (non-authenticated), use application-level session management:

```typescript
// Set guest name for RLS policies
const setGuestSession = async (guestName: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.guest_name',
    setting_value: guestName,
    is_local: true
  });
};
```

## Testing Policies

1. **View Scripts**: Run `scripts/sql/printCommunityPolicies.sql` to see current policies
2. **Test with different users**: Verify room access, message visibility
3. **Test guest mode**: Ensure guest users can participate appropriately
4. **Test file access**: Verify attachments are only visible to room members

## Switching Between DEV and PROD

To switch from DEV to PROD policies:

1. Drop all DEV policies:
```sql
DROP POLICY IF EXISTS "public write messages" ON public.messages;
DROP POLICY IF EXISTS "public write tb_posts" ON public.travel_buddy_posts;
-- ... etc for all public write policies
```

2. Apply PROD policies (see above)

3. Update environment: Remove `ALLOW_DEV_WRITES=true`

## Place Reviews and Voting Policies

### Place Reviews Table

```sql
-- Enable RLS on place_reviews
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;

-- DEV: Allow all operations for development
CREATE POLICY IF NOT EXISTS "dev_place_reviews_read" 
  ON public.place_reviews FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "dev_place_reviews_write" 
  ON public.place_reviews FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev_place_reviews_update" 
  ON public.place_reviews FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev_place_reviews_delete" 
  ON public.place_reviews FOR DELETE USING (true);

-- PROD: Secure policies
CREATE POLICY "secure_view_place_reviews" 
  ON public.place_reviews FOR SELECT USING (true);

CREATE POLICY "secure_create_place_reviews" 
  ON public.place_reviews FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    OR current_setting('app.guest_name', true) IS NOT NULL
  );

CREATE POLICY "secure_update_place_reviews" 
  ON public.place_reviews FOR UPDATE USING (
    user_id = auth.uid() 
    OR (user_id IS NULL AND author_name = current_setting('app.guest_name', true))
  );

CREATE POLICY "secure_delete_place_reviews" 
  ON public.place_reviews FOR DELETE USING (
    user_id = auth.uid() 
    OR (user_id IS NULL AND author_name = current_setting('app.guest_name', true))
  );
```

### Place Review Votes Table

```sql
-- Enable RLS on place_review_votes
ALTER TABLE public.place_review_votes ENABLE ROW LEVEL SECURITY;

-- DEV: Allow all operations
CREATE POLICY IF NOT EXISTS "dev_place_review_votes_read" 
  ON public.place_review_votes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "dev_place_review_votes_write" 
  ON public.place_review_votes FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev_place_review_votes_delete" 
  ON public.place_review_votes FOR DELETE USING (true);

-- PROD: Secure voting policies
CREATE POLICY "secure_view_place_review_votes" 
  ON public.place_review_votes FOR SELECT USING (true);

CREATE POLICY "secure_create_place_review_votes" 
  ON public.place_review_votes FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    OR current_setting('app.guest_vote_token', true) IS NOT NULL
  );

CREATE POLICY "secure_delete_place_review_votes" 
  ON public.place_review_votes FOR DELETE USING (
    user_id = auth.uid() 
    OR guest_token = current_setting('app.guest_vote_token', true)
  );
```

### Guest Support for Reviews

```typescript
// Set guest name for review authoring
const setGuestName = async (guestName: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.guest_name',
    setting_value: guestName,
    is_local: true
  });
};

// Set guest vote token for helpful votes
const setGuestVoteToken = async (token: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.guest_vote_token', 
    setting_value: token,
    is_local: true
  });
};
```

## Troubleshooting

- **"Policy violation" errors**: Check if user is member of the room
- **Can't see messages**: Verify room membership and RLS policies
- **File upload fails**: Check storage policies and bucket permissions
- **Guest users blocked**: Ensure guest session is set with `set_config`
- **Review creation fails**: Verify guest name is set in session
- **Helpful votes not working**: Check guest vote token is configured
- **Can't edit reviews**: Verify ownership (user_id match or guest name match)