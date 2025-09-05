-- Query to view existing RLS policies for community tables
-- Run this in your Supabase SQL editor to see current policies

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN (
    'chat_rooms', 
    'messages', 
    'travel_buddy_posts', 
    'chat_room_members', 
    'chat_attachments'
  )
ORDER BY tablename, policyname;

-- Also check if RLS is enabled on these tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN (
    'chat_rooms', 
    'messages', 
    'travel_buddy_posts', 
    'chat_room_members', 
    'chat_attachments'
  )
ORDER BY tablename;

-- Check storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%chat%'
ORDER BY policyname;