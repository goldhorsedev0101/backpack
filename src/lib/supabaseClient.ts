import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/config/env'

export const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  { auth: { persistSession: false } }
)

export interface LocationPhoto {
  entity_id: number
  entity_type: 'destination' | 'accommodation' | 'attraction' | 'restaurant'
  thumbnail_url?: string
  url: string
  inserted_at: string
}

export async function fetchPhotosForEntities(
  entityType: LocationPhoto['entity_type'],
  entityIds: number[]
): Promise<Map<number, LocationPhoto>> {
  if (!entityIds.length) return new Map()

  const { data: photos, error } = await supabase
    .from('location_photos')
    .select('entity_id,thumbnail_url,url,inserted_at')
    .eq('entity_type', entityType)
    .in('entity_id', entityIds)
    .order('inserted_at', { ascending: false })

  if (error) {
    console.warn(`Failed to fetch photos for ${entityType}:`, error)
    return new Map()
  }

  const photoMap = new Map<number, LocationPhoto>()
  photos?.forEach(photo => {
    if (!photoMap.has(photo.entity_id)) {
      photoMap.set(photo.entity_id, photo)
    }
  })

  return photoMap
}