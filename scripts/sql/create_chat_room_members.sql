-- Create chat_room_members table for DM and room membership management
-- Run this manually in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NULL,
  guest_name text NULL,
  role text DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ix_crm_room ON public.chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS ix_crm_user ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS ix_crm_guest ON public.chat_room_members(guest_name);

-- Add constraints
ALTER TABLE public.chat_room_members 
  ADD CONSTRAINT check_user_or_guest 
  CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL);

-- Enable RLS (will be configured separately)
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE public.chat_room_members IS 'Manages membership in chat rooms and DMs';
COMMENT ON COLUMN public.chat_room_members.user_id IS 'Authenticated user ID (null for guests)';
COMMENT ON COLUMN public.chat_room_members.guest_name IS 'Guest username (null for authenticated users)';
COMMENT ON COLUMN public.chat_room_members.role IS 'Member role: member, admin, moderator';