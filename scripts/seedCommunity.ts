// scripts/seedCommunity.ts - Seed community features with sample data
// Run with: tsx scripts/seedCommunity.ts

import { supabaseAdmin } from '../server/supabase.js';

interface SeedResult {
  table: string;
  action: string;
  count: number;
  sample?: any[];
  error?: string;
}

interface SeedReport {
  overall: 'success' | 'partial' | 'failed';
  timestamp: string;
  results: SeedResult[];
  summary: {
    totalInserted: number;
    tablesSeeded: number;
    errors: number;
  };
}

const sampleChatRooms = [
  {
    name: "🏛️ Machu Picchu Explorers",
    description: "Planning trips to the ancient Inca citadel",
    type: "destination",
    destination: "Peru",
    max_members: 50,
    is_private: false,
    tags: ["machu-picchu", "hiking", "historical"],
    languages: ["en", "es"],
    created_by: "system",
    is_active: true
  },
  {
    name: "🌟 Solo Travel Support",
    description: "Safe space for solo travelers to share tips and stories",
    type: "travel_style", 
    max_members: 100,
    is_private: false,
    tags: ["solo-travel", "safety", "support"],
    languages: ["en"],
    created_by: "system",
    is_active: true
  },
  {
    name: "💰 Budget Backpackers",
    description: "Share money-saving tips and budget itineraries",
    type: "travel_style",
    max_members: 75,
    is_private: false,
    tags: ["budget", "backpacking", "savings"],
    languages: ["en"],
    created_by: "system", 
    is_active: true
  },
  {
    name: "🏔️ Patagonia Adventure",
    description: "Planning epic adventures in Chilean and Argentine Patagonia",
    type: "destination",
    destination: "Chile",
    max_members: 30,
    is_private: false,
    tags: ["patagonia", "adventure", "hiking", "nature"],
    languages: ["en", "es"],
    created_by: "system",
    is_active: true
  },
  {
    name: "🇧🇷 Brazil Culture Exchange",
    description: "Learn about Brazilian culture, language, and customs",
    type: "destination",
    destination: "Brazil",
    max_members: 60,
    is_private: false,
    tags: ["brazil", "culture", "language", "exchange"],
    languages: ["en", "pt"],
    created_by: "system",
    is_active: true
  }
];

const sampleMessages = [
  // Machu Picchu Explorers messages
  {
    room_id: 1,
    message: "Hey everyone! Just got back from Machu Picchu and it was absolutely incredible. The sunrise view is something you'll never forget! 🌅",
    author_name: "Maria_Traveler",
    message_type: "text"
  },
  {
    room_id: 1, 
    message: "Planning to visit in March 2025. Any recommendations for the best time to arrive to avoid crowds?",
    author_name: "Adventure_Pete",
    message_type: "text"
  },
  {
    room_id: 1,
    message: "I went early morning (around 6 AM entry) and it was much less crowded. Also bring layers - it gets cold!",
    author_name: "Hiking_Sarah",
    message_type: "text"
  },

  // Solo Travel Support messages
  {
    room_id: 2,
    message: "First time solo traveling to South America. Any safety tips for a female traveler?",
    author_name: "NewSoloTraveler",
    message_type: "text"
  },
  {
    room_id: 2,
    message: "Stay in hostels with good reviews, always share your location with someone back home, and trust your instincts! You've got this! 💪",
    author_name: "Experienced_Solo",
    message_type: "text"
  },
  {
    room_id: 2,
    message: "I highly recommend joining day tours when starting out. Great way to meet people and see places safely.",
    author_name: "WorldWanderer",
    message_type: "text"
  },

  // Budget Backpackers messages
  {
    room_id: 3,
    message: "Just completed 3 weeks in Bolivia for under $600! Happy to share my budget breakdown if anyone's interested 📊",
    author_name: "BudgetMaster",
    message_type: "text"
  },
  {
    room_id: 3,
    message: "YES please share! Bolivia is next on my list and trying to keep costs low.",
    author_name: "Student_Traveler",
    message_type: "text"
  },
  {
    room_id: 3,
    message: "Pro tip: Street food in South America is amazing and super cheap. Just make sure it's busy/fresh!",
    author_name: "Foodie_Nomad",
    message_type: "text"
  }
];

const sampleTravelBuddyPosts = [
  {
    title: "Looking for hiking buddy - Torres del Paine",
    description: "Planning a 5-day trek in Torres del Paine National Park in February 2025. I'm an experienced hiker but would love company for safety and fun! Looking for someone who enjoys early starts and doesn't mind camping.",
    destination: "Chile",
    start_date: "2025-02-15",
    end_date: "2025-02-20", 
    group_size: 2,
    current_members: 1,
    budget: "mid",
    travel_style: ["adventure", "hiking", "camping"],
    activities: ["hiking", "photography", "wildlife watching"],
    requirements: "Must be comfortable with multi-day hiking and camping. Age 25-40 preferred.",
    contact_info: { method: "chat", username: "Hiker_Alex" },
    is_active: true,
    expires_at: "2025-02-10"
  },
  {
    title: "Carnival Partner - Rio de Janeiro",
    description: "First time at Rio Carnival! Looking for fun travel partner to explore the festivities, try local food, and experience the culture. I'm outgoing, love music and dancing.",
    destination: "Brazil",
    start_date: "2025-02-28",
    end_date: "2025-03-05",
    group_size: 2,
    current_members: 1,
    budget: "mid",
    travel_style: ["cultural", "party", "social"],
    activities: ["carnival", "dancing", "food tours", "nightlife"],
    requirements: "Must love music, dancing, and staying up late! Open to all ages and backgrounds.",
    contact_info: { method: "chat", username: "Carnival_Anna" },
    is_active: true,
    expires_at: "2025-02-25"
  },
  {
    title: "Photography Tour - Colombian Coffee Region",
    description: "Semi-professional photographer planning a 7-day photography tour of Colombia's coffee region. Looking for another photography enthusiast to share costs and experiences.",
    destination: "Colombia",
    start_date: "2025-04-10",
    end_date: "2025-04-17",
    group_size: 2, 
    current_members: 1,
    budget: "high",
    travel_style: ["photography", "cultural", "luxury"],
    activities: ["coffee farm tours", "landscape photography", "cultural immersion"],
    requirements: "Must have decent camera equipment and photography experience. 30+ preferred.",
    contact_info: { method: "chat", username: "PhotoPro_Mike" },
    is_active: true,
    expires_at: "2025-04-05"
  }
];

async function clearTable(tableName: string): Promise<SeedResult> {
  try {
    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .gte('id', 0); // Delete all rows

    if (error) {
      return { table: tableName, action: 'clear', count: 0, error: error.message };
    }

    return { table: tableName, action: 'clear', count: 0 };
  } catch (error) {
    return { 
      table: tableName, 
      action: 'clear', 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function seedChatRooms(): Promise<SeedResult> {
  try {
    // First check if table exists and is accessible
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('chat_rooms')
      .select('id')
      .limit(1);

    if (checkError) {
      return { 
        table: 'chat_rooms', 
        action: 'seed', 
        count: 0, 
        error: `Table check failed: ${checkError.message}` 
      };
    }

    // Clear existing data
    await clearTable('chat_rooms');

    // Insert sample chat rooms
    const { data, error } = await supabaseAdmin
      .from('chat_rooms')
      .insert(sampleChatRooms)
      .select();

    if (error) {
      return { table: 'chat_rooms', action: 'seed', count: 0, error: error.message };
    }

    return { 
      table: 'chat_rooms', 
      action: 'seed', 
      count: data?.length || 0,
      sample: data?.slice(0, 2)
    };
  } catch (error) {
    return { 
      table: 'chat_rooms', 
      action: 'seed', 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function seedMessages(): Promise<SeedResult> {
  try {
    // Check if messages table exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('messages')
      .select('id')
      .limit(1);

    if (checkError) {
      return { 
        table: 'messages', 
        action: 'seed', 
        count: 0, 
        error: `Table check failed: ${checkError.message}` 
      };
    }

    // Clear existing messages
    await clearTable('messages');

    // Insert sample messages
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert(sampleMessages)
      .select();

    if (error) {
      return { table: 'messages', action: 'seed', count: 0, error: error.message };
    }

    return { 
      table: 'messages', 
      action: 'seed', 
      count: data?.length || 0,
      sample: data?.slice(0, 3)
    };
  } catch (error) {
    return { 
      table: 'messages', 
      action: 'seed', 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function seedTravelBuddyPosts(): Promise<SeedResult> {
  try {
    // Check if travel_buddy_posts table exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('travel_buddy_posts')
      .select('id')
      .limit(1);

    if (checkError) {
      return { 
        table: 'travel_buddy_posts', 
        action: 'seed', 
        count: 0, 
        error: `Table check failed: ${checkError.message}` 
      };
    }

    // Clear existing posts
    await clearTable('travel_buddy_posts');

    // Insert sample travel buddy posts
    const { data, error } = await supabaseAdmin
      .from('travel_buddy_posts')
      .insert(sampleTravelBuddyPosts)
      .select();

    if (error) {
      return { table: 'travel_buddy_posts', action: 'seed', count: 0, error: error.message };
    }

    return { 
      table: 'travel_buddy_posts', 
      action: 'seed', 
      count: data?.length || 0,
      sample: data?.slice(0, 2)
    };
  } catch (error) {
    return { 
      table: 'travel_buddy_posts', 
      action: 'seed', 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function runCommunitySeed(): Promise<SeedReport> {
  console.log('🌱 Starting Community Data Seeding...\n');

  const results: SeedResult[] = [
    await seedChatRooms(),
    await seedMessages(), 
    await seedTravelBuddyPosts()
  ];

  // Calculate summary
  const totalInserted = results.reduce((sum, r) => sum + r.count, 0);
  const tablesSeeded = results.filter(r => r.count > 0).length;
  const errors = results.filter(r => r.error).length;

  const overall = errors === 0 ? 'success' : 
                  totalInserted > 0 ? 'partial' : 'failed';

  return {
    overall,
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalInserted,
      tablesSeeded,
      errors
    }
  };
}

function printSeedReport(report: SeedReport) {
  const statusEmoji = {
    success: '✅',
    partial: '⚠️',
    failed: '❌'
  };

  console.log('🌱 Community Seed Report');
  console.log('========================');
  console.log(`Overall Status: ${statusEmoji[report.overall]} ${report.overall.toUpperCase()}`);
  console.log(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`Total Inserted: ${report.summary.totalInserted} records`);
  console.log(`Tables Seeded: ${report.summary.tablesSeeded}/${report.results.length}\n`);

  console.log('Table Results:');
  report.results.forEach(result => {
    const emoji = result.error ? '❌' : result.count > 0 ? '✅' : '⚠️';
    console.log(`  ${emoji} ${result.table}: ${result.action} (${result.count} records)`);
    
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    } else if (result.sample && result.sample.length > 0) {
      console.log(`     Sample: ${result.sample[0].name || result.sample[0].title || result.sample[0].message?.substring(0, 50) || 'N/A'}`);
    }
  });

  if (report.summary.errors > 0) {
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure database tables exist (run SQL scripts in scripts/sql/)');
    console.log('   • Check RLS policies (see docs/community-rls.md)'); 
    console.log('   • Verify Supabase connection and permissions');
    console.log('   • Set ALLOW_DEV_WRITES=true for development');
  } else if (report.overall === 'success') {
    console.log('\n🎉 Success! Community features are ready with sample data.');
    console.log('   • Chat rooms: Ready for conversations');
    console.log('   • Messages: Sample conversations started');
    console.log('   • Travel buddy posts: Connections waiting to be made');
  }

  console.log('\n📱 Next Steps:');
  console.log('   • Visit /community to see the seeded data');
  console.log('   • Test chat functionality and DM features');
  console.log('   • Try creating your own posts and messages');
}

// Export for use in other modules
export { runCommunitySeed, type SeedReport };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCommunitySeed()
    .then(printSeedReport)
    .catch(error => {
      console.error('❌ Community seeding failed:', error);
      process.exit(1);
    });
}