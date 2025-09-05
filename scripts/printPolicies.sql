-- Diagnostic script to check existing RLS policies for travel data tables
-- Run this in Supabase SQL Editor to see current policies

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('destinations', 'accommodations', 'attractions', 'restaurants', 'location_photos')
ORDER BY tablename;

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  qual as "Using Expression"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('destinations', 'accommodations', 'attractions', 'restaurants', 'location_photos')
ORDER BY tablename, policyname;

-- If policies are missing, copy-paste this to create read-only access:
/*
-- Enable RLS if not already enabled
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_photos ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "public_read_destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "public_read_accommodations" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "public_read_attractions" ON public.attractions FOR SELECT USING (true);
CREATE POLICY "public_read_restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "public_read_location_photos" ON public.location_photos FOR SELECT USING (true);
*/