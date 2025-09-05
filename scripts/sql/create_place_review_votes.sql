-- Create place_review_votes table for "Helpful" voting functionality
-- This script should be run manually in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.place_review_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL,
    user_id uuid NULL,
    guest_token text NULL,
    is_helpful boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS place_review_votes_review_id_idx ON public.place_review_votes(review_id);

-- Unique constraint to prevent duplicate votes from same user/guest per review
CREATE UNIQUE INDEX IF NOT EXISTS place_review_votes_user_unique_idx 
    ON public.place_review_votes(review_id, user_id) 
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS place_review_votes_guest_unique_idx 
    ON public.place_review_votes(review_id, guest_token) 
    WHERE guest_token IS NOT NULL;

-- Add foreign key constraint to place_reviews if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'place_reviews' AND table_schema = 'public') THEN
        ALTER TABLE public.place_review_votes 
        ADD CONSTRAINT fk_place_review_votes_review_id 
        FOREIGN KEY (review_id) REFERENCES public.place_reviews(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS (will be configured later)
ALTER TABLE public.place_review_votes ENABLE ROW LEVEL SECURITY;

-- Comment on table
COMMENT ON TABLE public.place_review_votes IS 'Stores helpful votes for place reviews from both authenticated users and guests';
COMMENT ON COLUMN public.place_review_votes.user_id IS 'Reference to authenticated user who voted (NULL for guests)';
COMMENT ON COLUMN public.place_review_votes.guest_token IS 'Unique token stored in localStorage for guest voters (NULL for auth users)';
COMMENT ON COLUMN public.place_review_votes.is_helpful IS 'Whether the vote is helpful (always true for now, could support downvotes later)';