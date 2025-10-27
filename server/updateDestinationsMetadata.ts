import { db } from "./db";
import { destinations } from "@shared/schema";
import { eq } from "drizzle-orm";

const CONTINENT_MAP: Record<string, string> = {
  // Europe
  "France": "Europe",
  "Spain": "Spain",
  "Italy": "Europe",
  "United Kingdom": "Europe",
  "Greece": "Europe",
  "Germany": "Europe",
  "Netherlands": "Europe",
  "Switzerland": "Europe",
  "Austria": "Europe",
  "Czech Republic": "Europe",
  "Portugal": "Europe",
  "Ireland": "Europe",
  "Belgium": "Europe",
  "Hungary": "Europe",
  "Poland": "Europe",
  "Croatia": "Europe",
  "Iceland": "Europe",
  "Norway": "Europe",
  "Sweden": "Europe",
  "Denmark": "Europe",
  "Finland": "Europe",
  
  // Asia
  "Japan": "Asia",
  "Thailand": "Asia",
  "Singapore": "Asia",
  "United Arab Emirates": "Asia",
  "China": "Asia",
  "Vietnam": "Asia",
  "India": "Asia",
  "Indonesia": "Asia",
  "Malaysia": "Asia",
  "South Korea": "Asia",
  "Philippines": "Asia",
  "Turkey": "Asia",
  "Israel": "Asia",
  "Sri Lanka": "Asia",
  "Nepal": "Asia",
  
  // North America
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  
  // South America
  "Brazil": "South America",
  "Argentina": "South America",
  "Peru": "South America",
  "Colombia": "South America",
  "Chile": "South America",
  "Ecuador": "South America",
  "Bolivia": "South America",
  "Uruguay": "South America",
  
  // Oceania
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Fiji": "Oceania",
  
  // Africa
  "South Africa": "Africa",
  "Egypt": "Africa",
  "Morocco": "Africa",
  "Kenya": "Africa",
  "Tunisia": "Africa",
  "Tanzania": "Africa",
  "Mauritius": "Africa",
  
  // Caribbean
  "Dominican Republic": "North America",
  "Cuba": "North America",
  "Bahamas": "North America",
  "Jamaica": "North America",
  "Puerto Rico": "North America",
};

const FLAG_MAP: Record<string, string> = {
  "France": "🇫🇷",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "United Kingdom": "🇬🇧",
  "Greece": "🇬🇷",
  "Germany": "🇩🇪",
  "Netherlands": "🇳🇱",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Czech Republic": "🇨🇿",
  "Portugal": "🇵🇹",
  "Ireland": "🇮🇪",
  "Belgium": "🇧🇪",
  "Hungary": "🇭🇺",
  "Poland": "🇵🇱",
  "Croatia": "🇭🇷",
  "Iceland": "🇮🇸",
  "Norway": "🇳🇴",
  "Sweden": "🇸🇪",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Japan": "🇯🇵",
  "Thailand": "🇹🇭",
  "Singapore": "🇸🇬",
  "United Arab Emirates": "🇦🇪",
  "China": "🇨🇳",
  "Vietnam": "🇻🇳",
  "India": "🇮🇳",
  "Indonesia": "🇮🇩",
  "Malaysia": "🇲🇾",
  "South Korea": "🇰🇷",
  "Philippines": "🇵🇭",
  "Turkey": "🇹🇷",
  "Israel": "🇮🇱",
  "United States": "🇺🇸",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Peru": "🇵🇪",
  "Colombia": "🇨🇴",
  "Chile": "🇨🇱",
  "Ecuador": "🇪🇨",
  "Bolivia": "🇧🇴",
  "Uruguay": "🇺🇾",
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Fiji": "🇫🇯",
  "South Africa": "🇿🇦",
  "Egypt": "🇪🇬",
  "Morocco": "🇲🇦",
  "Kenya": "🇰🇪",
  "Tunisia": "🇹🇳",
  "Tanzania": "🇹🇿",
  "Mauritius": "🇲🇺",
  "Dominican Republic": "🇩🇴",
  "Cuba": "🇨🇺",
  "Bahamas": "🇧🇸",
  "Jamaica": "🇯🇲",
  "Puerto Rico": "🇵🇷",
  "Sri Lanka": "🇱🇰",
  "Nepal": "🇳🇵",
};

async function updateDestinations() {
  console.log("🚀 Starting destinations metadata update...");
  
  const allDestinations = await db.select().from(destinations);
  console.log(`📊 Found ${allDestinations.length} destinations to update`);
  
  for (const dest of allDestinations) {
    const continent = CONTINENT_MAP[dest.country || ""] || "Unknown";
    const flag = FLAG_MAP[dest.country || ""] || "🌍";
    const description = `Explore ${dest.name}, ${dest.country}`;
    const rating = 4.5;
    const userRatingsTotal = null; // We'll hide the reviews count by setting it to null
    const trending = false;
    
    await db
      .update(destinations)
      .set({
        continent,
        flag,
        description,
        rating,
        userRatingsTotal,
        trending,
      })
      .where(eq(destinations.id, dest.id));
    
    console.log(`✅ Updated ${dest.name}, ${dest.country} (${continent} ${flag})`);
  }
  
  console.log("✨ All destinations updated successfully!");
}

updateDestinations().catch(console.error);
