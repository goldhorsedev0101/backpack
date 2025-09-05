# Supabase RLS Setup

## Check Current Policies

1. Go to Supabase Dashboard → SQL Editor
2. Copy and run the contents of `scripts/printPolicies.sql`
3. Review the output to see if RLS is enabled and policies exist

## Create Missing Policies

If any table shows "RLS Enabled: false" or has no policies, run this SQL:

```sql
-- Enable RLS
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
```

⚠️ **Warning**: RLS must be properly configured for the client to access data. The app will show empty results if policies are missing.