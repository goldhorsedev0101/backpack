import { createClient } from '@supabase/supabase-js'

// Get environment variables - support both browser and server
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
  (import.meta as any).env?.SUPABASE_URL ||
  process.env.SUPABASE_URL
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Photo related types and functions (matching schema.ts structure)
export interface LocationPhoto {
  id: number
  locationId: string
  locationCategory: 'accommodation' | 'attraction' | 'restaurant' | 'destination'
  photoUrl: string
  thumbnailUrl?: string
  caption?: string
  createdAt: string
}

// Fetch photos for multiple entities efficiently (avoid N+1)
export async function fetchPhotosForEntities(
  locationCategory: LocationPhoto['locationCategory'], 
  locationIds: string[]
): Promise<Map<string, LocationPhoto>> {
  if (!locationIds.length) return new Map()
  
  const { data: photos, error } = await supabase
    .from('location_photos')
    .select('*')
    .eq('locationCategory', locationCategory)
    .in('locationId', locationIds)
    .order('createdAt', { ascending: false })
  
  if (error) {
    console.warn('Failed to fetch photos:', error)
    return new Map()
  }
  
  // Create a map where each locationId gets its first (most recent) photo
  const photoMap = new Map<string, LocationPhoto>()
  photos?.forEach(photo => {
    if (!photoMap.has(photo.locationId)) {
      photoMap.set(photo.locationId, photo)
    }
  })
  
  return photoMap
}