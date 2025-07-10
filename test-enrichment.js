#!/usr/bin/env node
/**
 * TripWise Real Places Enrichment Demo
 * 
 * This demonstrates the enrichSuggestionsWithRealPlaces function that integrates
 * Google Places API with AI-generated trip suggestions to provide real, bookable
 * locations for travelers.
 * 
 * Features demonstrated:
 * - AI trip suggestion enrichment with Google Places API
 * - Real place data extraction (names, ratings, addresses, photos)
 * - Google Maps link generation for navigation and booking
 * - Error handling and graceful degradation
 */

import { enrichSuggestionsWithRealPlaces } from './server/openai.js';

// Sample AI-generated trip suggestions to enrich
const sampleSuggestions = [
  {
    destination: "Cusco",
    country: "Peru", 
    description: "Explore the ancient Inca capital and gateway to Machu Picchu with rich cultural heritage.",
    bestTimeToVisit: "May-September",
    estimatedBudget: { low: 800, high: 1200 },
    highlights: ["Machu Picchu", "Sacred Valley", "San Blas neighborhood", "Sacsayhuamán ruins"],
    travelStyle: ["adventure", "cultural"],
    duration: "7-10 days"
  },
  {
    destination: "Cartagena",
    country: "Colombia",
    description: "Discover colonial charm and Caribbean vibes in this historic coastal city.",
    bestTimeToVisit: "December-April",
    estimatedBudget: { low: 600, high: 1000 },
    highlights: ["Old Town", "Castillo San Felipe", "Rosario Islands", "Las Bóvedas"],
    travelStyle: ["cultural", "beach", "photography"],
    duration: "5-7 days"
  }
];

async function demonstrateEnrichment() {
  console.log('🚀 TripWise Real Places Enrichment Demo');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n📍 Original AI Suggestions:');
    sampleSuggestions.forEach((suggestion, idx) => {
      console.log(`${idx + 1}. ${suggestion.destination}, ${suggestion.country}`);
      console.log(`   Highlights: ${suggestion.highlights.join(', ')}`);
    });
    
    console.log('\n🔍 Enriching with real places from Google Places API...\n');
    
    const enrichedSuggestions = await enrichSuggestionsWithRealPlaces(sampleSuggestions);
    
    console.log('✅ Enrichment Complete!\n');
    
    enrichedSuggestions.forEach((suggestion, idx) => {
      console.log(`${idx + 1}. ${suggestion.destination}, ${suggestion.country}`);
      console.log(`   💰 Budget: $${suggestion.estimatedBudget.low}-${suggestion.estimatedBudget.high}`);
      console.log(`   📅 Best Time: ${suggestion.bestTimeToVisit}`);
      
      if (suggestion.realPlaces && suggestion.realPlaces.length > 0) {
        console.log(`   🗺️  Real Places Found: ${suggestion.realPlaces.length}`);
        suggestion.realPlaces.slice(0, 5).forEach((place, placeIdx) => {
          console.log(`      ${placeIdx + 1}. ${place.title}`);
          console.log(`         ⭐ Rating: ${place.rating || 'N/A'}`);
          console.log(`         📍 ${place.address || 'Address not available'}`);
          console.log(`         🔗 ${place.link || 'No link available'}`);
          if (place.photoUrl) {
            console.log(`         📸 Photo available`);
          }
        });
      } else {
        console.log(`   ❌ No real places found`);
      }
      console.log('');
    });
    
    console.log('🎯 Integration Benefits:');
    console.log('   • AI suggestions enhanced with real, bookable locations');
    console.log('   • Direct Google Maps links for navigation and booking');  
    console.log('   • Authentic ratings and photos from real visitors');
    console.log('   • Seamless transition from planning to action');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure GOOGLE_PLACES_API_KEY is configured');
    console.log('   • Check internet connection');
    console.log('   • Verify API quotas and permissions');
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnrichment();
}