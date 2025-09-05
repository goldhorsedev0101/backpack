import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wuzhvkmfdyiwaaladyxc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emh2a21mZHlpd2FhbGFkeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMzUzOTEsImV4cCI6MjAzOTcxMTM5MX0.MWpORmQyq2m8TgAM5g2KcH69hJd1aFc0YKI5nOYNvxs'

export const supabase = createClient(supabaseUrl, supabaseKey)

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