import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wuzhvkmfdyiwaaladyxc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emh2a21mZHlpd2FhbGFkeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMzUzOTEsImV4cCI6MjAzOTcxMTM5MX0.MWpORmQyq2m8TgAM5g2KcH69hJd1aFc0YKI5nOYNvxs'

const supabase = createClient(supabaseUrl, supabaseKey)

interface TableCheck {
  name: string
  table: string
  entityType?: string
}

const tables: TableCheck[] = [
  { name: 'Destinations', table: 'destinations' },
  { name: 'Accommodations', table: 'accommodations', entityType: 'accommodation' },
  { name: 'Attractions', table: 'attractions', entityType: 'attraction' },
  { name: 'Restaurants', table: 'restaurants', entityType: 'restaurant' }
]

export async function runSupabaseHealthCheck() {
  console.log('=== Supabase Health Check ===')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`)
  console.log()

  for (const { name, table, entityType } of tables) {
    console.log(`--- ${name} (${table}) ---`)
    
    try {
      // Basic count and sample
      const { data: sample, error: sampleError, count } = await supabase
        .from(table)
        .select('id,name,country', { count: 'exact', head: false })
        .limit(3)
      
      if (sampleError) {
        console.log(`❌ Error: ${sampleError.message}`)
        if (sampleError.message.includes('permission')) {
          console.log(`   Likely RLS policy missing for ${table}`)
        }
      } else {
        console.log(`✅ Total count: ${count}`)
        console.log(`   Sample rows: ${sample?.length || 0}`)
        sample?.slice(0, 2).forEach((row, i) => {
          console.log(`   ${i + 1}. ${row.name} (${row.country || 'N/A'})`)
        })
      }

      // Test ilike search
      const { data: searchResults, error: searchError } = await supabase
        .from(table)
        .select('id,name')
        .ilike('name', '%Cusco%')
        .limit(2)

      if (searchError) {
        console.log(`❌ Search error: ${searchError.message}`)
      } else {
        console.log(`🔍 Search 'Cusco': ${searchResults?.length || 0} results`)
        searchResults?.forEach(row => console.log(`   - ${row.name}`))
      }

      // Test pagination
      const { data: pageResults, error: pageError } = await supabase
        .from(table)
        .select('id,name')
        .range(0, 19)

      if (pageError) {
        console.log(`❌ Pagination error: ${pageError.message}`)
      } else {
        console.log(`📄 Pagination (0-19): ${pageResults?.length || 0} rows`)
      }

      // Test photos if applicable
      if (entityType) {
        const { data: photoResults, error: photoError } = await supabase
          .from('location_photos')
          .select('entity_id,thumbnail_url,url')
          .eq('entity_type', entityType)
          .limit(3)

        if (photoError) {
          console.log(`❌ Photos error: ${photoError.message}`)
        } else {
          console.log(`📸 Photos (${entityType}): ${photoResults?.length || 0} found`)
        }
      }

    } catch (err) {
      console.log(`❌ Unexpected error: ${err}`)
    }
    
    console.log()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSupabaseHealthCheck()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Health check failed:', err)
      process.exit(1)
    })
}