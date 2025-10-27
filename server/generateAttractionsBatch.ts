import { db } from "./db.js";
import { attractions, attractionsI18n, destinations } from "../shared/schema.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get batch size from command line args or use default
const BATCH_SIZE = parseInt(process.argv[2] || "10");

interface GeneratedAttraction {
  name: string;
  description: string;
  nameHe: string;
  descriptionHe: string;
  lat: string;
  lon: string;
  rating: string;
  tags: string[];
}

async function generateAttractionsForDestination(
  destinationName: string
): Promise<GeneratedAttraction[]> {
  const prompt = `Generate exactly 3 top tourist attractions for ${destinationName}.

For each attraction, provide:
1. Name (in English)
2. Description (50-80 words, highlighting what makes it special and unique)
3. Name in Hebrew (authentic translation)
4. Description in Hebrew (authentic translation, 50-80 words)
5. Realistic latitude and longitude coordinates for the attraction in ${destinationName}
6. Rating (between 4.3 and 4.8)
7. 2-3 relevant tags from: museum, art, cultural, historic, landmark, nature, beach, temple, church, mosque, palace, castle, park, garden, viewpoint, shopping, food, market, entertainment, architecture, monument, ancient, unesco, colonial

Return ONLY a valid JSON array with 3 objects, each with these exact fields:
- name (string)
- description (string)
- nameHe (string)
- descriptionHe (string)
- lat (string, format: "12.3456")
- lon (string, format: "123.4567")
- rating (string, format: "4.5")
- tags (array of strings)

Example format:
[
  {
    "name": "Example Museum",
    "description": "A fascinating museum...",
    "nameHe": "מוזיאון לדוגמה",
    "descriptionHe": "מוזיאון מרתק...",
    "lat": "12.3456",
    "lon": "123.4567",
    "rating": "4.6",
    "tags": ["museum", "cultural", "history"]
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a tourism expert. Generate authentic, high-quality attraction data. Return ONLY valid JSON, no markdown, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Clean up response - remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const attractionsData = JSON.parse(cleanedContent);

    if (!Array.isArray(attractionsData) || attractionsData.length !== 3) {
      throw new Error("Invalid response format from OpenAI");
    }

    return attractionsData;
  } catch (error) {
    console.error(`❌ Error generating attractions for ${destinationName}:`, error);
    throw error;
  }
}

async function generateAttractionsBatch() {
  console.log(`🚀 Starting AI-powered attractions generation (Batch size: ${BATCH_SIZE})...`);

  try {
    // Get all destinations
    const allDestinations = await db.select().from(destinations);
    console.log(`📍 Found ${allDestinations.length} total destinations`);

    // Get destinations that already have attractions
    const destinationsWithAttractions = await db
      .select({ destinationId: attractions.destinationId })
      .from(attractions)
      .groupBy(attractions.destinationId);

    const destIdsWithAttractions = destinationsWithAttractions.map((d) => d.destinationId);

    // Filter to get destinations without attractions
    const destinationsNeedingAttractions = allDestinations.filter(
      (dest) => !destIdsWithAttractions.includes(dest.id)
    );

    console.log(`✨ Need to generate attractions for ${destinationsNeedingAttractions.length} destinations`);
    console.log(`📦 Processing ${Math.min(BATCH_SIZE, destinationsNeedingAttractions.length)} destinations in this batch`);

    if (destinationsNeedingAttractions.length === 0) {
      console.log("✅ All destinations already have attractions!");
      return;
    }

    // Process only BATCH_SIZE destinations
    const batch = destinationsNeedingAttractions.slice(0, BATCH_SIZE);

    let totalAdded = 0;
    let failedDestinations: string[] = [];

    for (let i = 0; i < batch.length; i++) {
      const destination = batch[i];
      console.log(`\n📍 [${i + 1}/${batch.length}] Processing: ${destination.name}...`);

      try {
        // Generate attractions using AI
        const attractionsData = await generateAttractionsForDestination(
          destination.name
        );

        // Insert each attraction
        for (const attr of attractionsData) {
          // Insert attraction
          const [inserted] = await db
            .insert(attractions)
            .values({
              destinationId: destination.id,
              name: attr.name,
              description: attr.description,
              lat: attr.lat,
              lon: attr.lon,
              rating: attr.rating,
              tags: attr.tags,
              source: "ai_generated",
              externalId: `ai_${destination.name}_${attr.name}`
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, ""),
            })
            .returning();

          console.log(`  ✅ Added: ${attr.name}`);

          // Insert English translation
          await db.insert(attractionsI18n).values({
            attractionId: inserted.id,
            locale: "en",
            name: attr.name,
            description: attr.description,
            nameLc: attr.name.toLowerCase(),
            descriptionLc: attr.description.toLowerCase(),
          });

          // Insert Hebrew translation
          await db.insert(attractionsI18n).values({
            attractionId: inserted.id,
            locale: "he",
            name: attr.nameHe,
            description: attr.descriptionHe,
            nameLc: attr.nameHe,
            descriptionLc: attr.descriptionHe,
          });

          console.log(`  🌐 Added translations (en/he)`);
          totalAdded++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`❌ Failed to generate attractions for ${destination.name}:`, error);
        failedDestinations.push(destination.name);
      }
    }

    console.log(`\n✅ Batch generation complete!`);
    console.log(`   Added: ${totalAdded} attractions`);
    console.log(`   Processed: ${batch.length} destinations`);
    console.log(`   Remaining: ${destinationsNeedingAttractions.length - batch.length} destinations`);
    if (failedDestinations.length > 0) {
      console.log(`   Failed: ${failedDestinations.length} destinations`);
      console.log(`   Failed destinations: ${failedDestinations.join(", ")}`);
    }

    if (destinationsNeedingAttractions.length > BATCH_SIZE) {
      console.log(`\n💡 Run this script again to process the next batch!`);
    }
  } catch (error) {
    console.error("❌ Error in attraction generation:", error);
    throw error;
  }
}

// Run the script
generateAttractionsBatch()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
