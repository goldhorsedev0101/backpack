-- Create chat_attachments table for file/image attachments in messages
-- Run this manually in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  bucket text NOT NULL DEFAULT 'chat-uploads',
  path text NOT NULL,
  url text NULL,
  filename text NULL,
  mime_type text NULL,
  size_bytes int NULL,
  width int NULL,
  height int NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ix_ca_msg ON public.chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS ix_ca_bucket_path ON public.chat_attachments(bucket, path);
CREATE INDEX IF NOT EXISTS ix_ca_created ON public.chat_attachments(created_at);

-- Add constraints
ALTER TABLE public.chat_attachments 
  ADD CONSTRAINT check_positive_size 
  CHECK (size_bytes IS NULL OR size_bytes > 0);

ALTER TABLE public.chat_attachments 
  ADD CONSTRAINT check_positive_dimensions 
  CHECK ((width IS NULL OR width > 0) AND (height IS NULL OR height > 0));

-- Enable RLS (will be configured separately)
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE public.chat_attachments IS 'File and image attachments for chat messages';
COMMENT ON COLUMN public.chat_attachments.bucket IS 'Supabase Storage bucket name';
COMMENT ON COLUMN public.chat_attachments.path IS 'File path within the bucket';
COMMENT ON COLUMN public.chat_attachments.url IS 'Public or signed URL for access';
COMMENT ON COLUMN public.chat_attachments.filename IS 'Original filename';
COMMENT ON COLUMN public.chat_attachments.mime_type IS 'File MIME type (image/jpeg, application/pdf, etc.)';
COMMENT ON COLUMN public.chat_attachments.size_bytes IS 'File size in bytes';
COMMENT ON COLUMN public.chat_attachments.width IS 'Image width in pixels (if applicable)';
COMMENT ON COLUMN public.chat_attachments.height IS 'Image height in pixels (if applicable)';