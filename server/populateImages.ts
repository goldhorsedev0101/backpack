import { storage } from './storage.js';
import { MediaOrchestrator } from './integrations/media/mediaOrchestrator.js';

async function populateImages() {
  const mediaOrchestrator = new MediaOrchestrator(storage);
  const results: any = {
    destinations: { total: 0, success: 0, failed: 0, errors: [] },
    attractions: { total: 0, success: 0, failed: 0, errors: [] }
  };

  try {
    // Get all destinations
    const destinations = await storage.getAllDestinations();
    results.destinations.total = destinations.length;

    console.log(`🖼️  Populating images for ${destinations.length} destinations...`);

    // Populate destination images
    for (const dest of destinations) {
      try {
        // Check if already has cached photo
        const existing = await storage.getPrimaryLocationPhoto('destination', dest.id);
        
        if (!existing) {
          // Fetch and cache image
          console.log(`🔍 Fetching image for: ${dest.name}, ${dest.country}`);
          const result = await mediaOrchestrator.getLocationPhoto({
            entityType: 'destination',
            entityId: dest.id,
            entityName: dest.name,
            country: dest.country || undefined,
            forceRefresh: false
          });
          results.destinations.success++;
          console.log(`✅ Image cached from ${result.source}: ${dest.name}, ${dest.country}`);
        } else {
          results.destinations.success++;
          console.log(`⏭️  Destination already has image: ${dest.name}`);
        }
      } catch (error: any) {
        results.destinations.failed++;
        results.destinations.errors.push({
          destination: dest.name,
          error: error.message
        });
        console.error(`❌ Failed for ${dest.name}:`, error.message);
      }
    }

    // Get all attractions
    const attractions = await storage.getAllAttractions();
    results.attractions.total = attractions.length;

    console.log(`\n🖼️  Populating images for ${attractions.length} attractions...`);

    // Populate attraction images
    for (const attr of attractions) {
      try {
        // Check if already has cached photo
        const existing = await storage.getPrimaryLocationPhoto('attraction', attr.id);
        
        if (!existing) {
          // Fetch and cache image
          console.log(`🔍 Fetching image for: ${attr.name}`);
          const result = await mediaOrchestrator.getLocationPhoto({
            entityType: 'attraction',
            entityId: attr.id,
            entityName: attr.name,
            country: undefined, // Attractions don't have country field in this schema
            forceRefresh: false
          });
          results.attractions.success++;
          console.log(`✅ Image cached from ${result.source}: ${attr.name}`);
        } else {
          results.attractions.success++;
          console.log(`⏭️  Attraction already has image: ${attr.name}`);
        }
      } catch (error: any) {
        results.attractions.failed++;
        results.attractions.errors.push({
          attraction: attr.name,
          error: error.message
        });
        console.error(`❌ Failed for ${attr.name}:`, error.message);
      }
    }

    console.log('\n🎉 Image population completed!');
    console.log(`\nResults:`);
    console.log(`  Destinations: ${results.destinations.success}/${results.destinations.total} succeeded`);
    console.log(`  Attractions: ${results.attractions.success}/${results.attractions.total} succeeded`);
    
    if (results.destinations.failed > 0 || results.attractions.failed > 0) {
      console.log(`\n⚠️  Errors:`);
      results.destinations.errors.forEach((e: any) => console.log(`  - ${e.destination}: ${e.error}`));
      results.attractions.errors.forEach((e: any) => console.log(`  - ${e.attraction}: ${e.error}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating images:', error);
    process.exit(1);
  }
}

populateImages();
