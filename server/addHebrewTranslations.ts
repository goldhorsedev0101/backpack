import { db } from "./db";
import { destinations, destinationsI18n } from "@shared/schema";
import { eq } from "drizzle-orm";

const HEBREW_TRANSLATIONS: Record<string, { name: string; description: string }> = {
  "Paris": { name: "פריז", description: "גלו את פריז, צרפת - עיר האורות" },
  "Tokyo": { name: "טוקיו", description: "גלו את טוקיו, יפן - מטרופולין מודרני" },
  "New York": { name: "ניו יורק", description: "גלו את ניו יורק, ארצות הברית - העיר שלא ישנה" },
  "London": { name: "לונדון", description: "גלו את לונדון, בריטניה - בירת התרבות" },
  "Dubai": { name: "דובאי", description: "גלו את דובאי, איחוד האמירויות - עיר העתיד" },
  "Rome": { name: "רומא", description: "גלו את רומא, איטליה - העיר הנצחית" },
  "Barcelona": { name: "ברצלונה", description: "גלו את ברצלונה, ספרד - פנינת הים התיכון" },
  "Istanbul": { name: "איסטנבול", description: "גלו את איסטנבול, טורקיה - המפגש בין מזרח למערב" },
  "Sydney": { name: "סידני", description: "גלו את סידני, אוסטרליה - נמל החוף המדהים" },
  "Bangkok": { name: "בנגקוק", description: "גלו את בנגקוק, תאילנד - עיר המקדשים הזהובים" },
  "Amsterdam": { name: "אמסטרדם", description: "גלו את אמסטרדם, הולנד - עיר התעלות" },
  "Prague": { name: "פראג", description: "גלו את פראג, צ'כיה - העיר המאה פינות" },
  "Vienna": { name: "וינה", description: "גלו את וינה, אוסטריה - בירת המוזיקה" },
  "Athens": { name: "אתונה", description: "גלו את אתונה, יוון - ערש הדמוקרטיה" },
  "Lisbon": { name: "ליסבון", description: "גלו את ליסבון, פורטוגל - עיר השבעה גבעות" },
  "Berlin": { name: "ברלין", description: "גלו את ברלין, גרמניה - עיר הקירות והאמנות" },
  "Moscow": { name: "מוסקבה", description: "גלו את מוסקבה, רוסיה - בירת ענק" },
  "Reykjavik": { name: "רייקיאוויק", description: "גלו את רייקיאוויק, איסלנד - השער לאיסלנד" },
  "Santorini": { name: "סנטוריני", description: "גלו את סנטוריני, יוון - האי הרומנטי" },
  "Venice": { name: "ונציה", description: "גלו את ונציה, איטליה - עיר התעלות הרומנטית" },
  "Florence": { name: "פירנצה", description: "גלו את פירנצה, איטליה - ערש הרנסנס" },
  "Milan": { name: "מילאנו", description: "גלו את מילאנו, איטליה - בירת האופנה" },
  "Madrid": { name: "מדריד", description: "גלו את מדריד, ספרד - הבירה המלכותית" },
  "Seville": { name: "סביליה", description: "גלו את סביליה, ספרד - לב אנדלוסיה" },
  "Munich": { name: "מינכן", description: "גלו את מינכן, גרמניה - עיר הבירה והמסורת" },
  "Edinburgh": { name: "אדינבורו", description: "גלו את אדינבורו, בריטניה - העיר ההיסטורית" },
  "Dublin": { name: "דבלין", description: "גלו את דבלין, אירלנד - עיר המוזיקה והתרבות" },
  "Copenhagen": { name: "קופנהגן", description: "גלו את קופנהגן, דנמרק - עיר האופניים" },
  "Stockholm": { name: "סטוקהולם", description: "גלו את סטוקהולם, שוודיה - ונציה הצפונית" },
  "Oslo": { name: "אוסלו", description: "גלו את אוסלו, נורווגיה - בירת הפיורדים" },
  "Budapest": { name: "בודפשט", description: "גלו את בודפשט, הונגריה - פנינת הדנובה" },
  "Krakow": { name: "קרקוב", description: "גלו את קרקוב, פולין - העיר ההיסטורית" },
  "Zurich": { name: "ציריך", description: "גלו את ציריך, שווייץ - מרכז הפיננסים" },
  "Brussels": { name: "בריסל", description: "גלו את בריסל, בלגיה - בירת אירופה" },
  "Singapore": { name: "סינגפור", description: "גלו את סינגפור - האי הירוק" },
  "Bali": { name: "באלי", description: "גלו את באלי, אינדונזיה - אי האלים" },
  "Mumbai": { name: "מומבאי", description: "גלו את מומבאי, הודו - העיר שלא ישנה" },
  "Seoul": { name: "סיאול", description: "גלו את סיאול, דרום קוריאה - מטרופולין מודרני" },
  "Hong Kong": { name: "הונג קונג", description: "גלו את הונג קונג - פנינת אסיה" },
  "Kyoto": { name: "קיוטו", description: "גלו את קיוטו, יפן - עיר המקדשים" },
  "Shanghai": { name: "שנחאי", description: "גלו את שנחאי, סין - מטרופולין עתידני" },
  "Beijing": { name: "בייג'ינג", description: "גלו את בייג'ינג, סין - הבירה ההיסטורית" },
  "Hanoi": { name: "האנוי", description: "גלו את האנוי, וייטנאם - הבירה העתיקה" },
  "Ho Chi Minh City": { name: "הו צ'י מין", description: "גלו את הו צ'י מין, וייטנאם - העיר התוססת" },
  "Kuala Lumpur": { name: "קואלה לומפור", description: "גלו את קואלה לומפור, מלזיה - עיר המגדלים" },
  "Manila": { name: "מנילה", description: "גלו את מנילה, הפיליפינים - פנינת המזרח" },
  "Jakarta": { name: "ג'קרטה", description: "גלו את ג'קרטה, אינדונזיה - מטרופולין ענק" },
  "Delhi": { name: "דלהי", description: "גלו את דלהי, הודו - הבירה ההיסטורית" },
  "Jaipur": { name: "ג'איפור", description: "גלו את ג'איפור, הודו - העיר הוורודה" },
  "Agra": { name: "אגרה", description: "גלו את אגרה, הודו - בית הטאג' מאהל" },
  "Tel Aviv": { name: "תל אביב", description: "גלו את תל אביב, ישראל - עיר שלא ישנה" },
  "Jerusalem": { name: "ירושלים", description: "גלו את ירושלים, ישראל - העיר הקדושה" },
  "Colombo": { name: "קולומבו", description: "גלו את קולומבו, סרי לנקה - נמל האוקיינוס ההודי" },
  "Kathmandu": { name: "קטמנדו", description: "גלו את קטמנדו, נפאל - שער ההימלאיה" },
  "Phuket": { name: "פוקט", description: "גלו את פוקט, תאילנד - פנינת החופים" },
  "Los Angeles": { name: "לוס אנג'לס", description: "גלו את לוס אנג'לס, ארצות הברית - עיר המלאכים" },
  "Miami": { name: "מיאמי", description: "גלו את מיאמי, ארצות הברית - פנינת החופים" },
  "Mexico City": { name: "מקסיקו סיטי", description: "גלו את מקסיקו סיטי, מקסיקו - הבירה העתיקה" },
  "Las Vegas": { name: "לאס וגאס", description: "גלו את לאס וגאס, ארצות הברית - עיר החטאים" },
  "San Francisco": { name: "סן פרנסיסקו", description: "גלו את סן פרנסיסקו, ארצות הברית - העיר על המפרץ" },
  "Chicago": { name: "שיקגו", description: "גלו את שיקגו, ארצות הברית - עיר הרוחות" },
  "Toronto": { name: "טורונטו", description: "גלו את טורונטו, קנדה - המטרופולין הקנדי" },
  "Vancouver": { name: "ונקובר", description: "גלו את ונקובר, קנדה - פנינת החוף המערבי" },
  "Cancun": { name: "קנקון", description: "גלו את קנקון, מקסיקו - פרדייס הקריביים" },
  "Playa del Carmen": { name: "פלאיה דל כרמן", description: "גלו את פלאיה דל כרמן, מקסיקו - חוף הקריביים" },
  "Montreal": { name: "מונטריאול", description: "גלו את מונטריאול, קנדה - העיר הצרפתית" },
  "Rio de Janeiro": { name: "ריו דה ז'נרו", description: "גלו את ריו דה ז'נרו, ברזיל - עיר הקרנבל" },
  "Buenos Aires": { name: "בואנוס איירס", description: "גלו את בואנוס איירס, ארגנטינה - פאריס של דרום אמריקה" },
  "Lima": { name: "לימה", description: "גלו את לימה, פרו - הבירה ההיסטורית" },
  "Cusco": { name: "קוסקו", description: "גלו את קוסקו, פרו - שער מאצ'ו פיצ'ו" },
  "Santiago": { name: "סנטיאגו", description: "גלו את סנטיאגו, צ'ילה - העיר בין ההרים" },
  "Bogota": { name: "בוגוטה", description: "גלו את בוגוטה, קולומביה - הבירה על ההרים" },
  "Cartagena": { name: "קרטחנה", description: "גלו את קרטחנה, קולומביה - פנינת הקריביים" },
  "Medellin": { name: "מדיין", description: "גלו את מדיין, קולומביה - עיר האביב הנצחי" },
  "Quito": { name: "קיטו", description: "גלו את קיטו, אקוודור - הבירה על קו המשווה" },
  "La Paz": { name: "לה פאס", description: "גלו את לה פאס, בוליביה - הבירה הגבוהה בעולם" },
  "Montevideo": { name: "מונטווידאו", description: "גלו את מונטווידאו, אורוגוואי - העיר היפה" },
  "Sao Paulo": { name: "סאו פאולו", description: "גלו את סאו פאולו, ברזיל - מטרופולין ענק" },
  "Melbourne": { name: "מלבורן", description: "גלו את מלבורן, אוסטרליה - עיר התרבות" },
  "Auckland": { name: "אוקלנד", description: "גלו את אוקלנד, ניו זילנד - עיר המפרשים" },
  "Brisbane": { name: "בריסביין", description: "גלו את בריסביין, אוסטרליה - עיר השמש" },
  "Perth": { name: "פרת'", description: "גלו את פרת', אוסטרליה - העיר המבודדת" },
  "Wellington": { name: "וולינגטון", description: "גלו את וולינגטון, ניו זילנד - הבירה על הים" },
  "Queenstown": { name: "קווינסטאון", description: "גלו את קווינסטאון, ניו זילנד - בירת ההרפתקאות" },
  "Fiji": { name: "פיג'י", description: "גלו את פיג'י - גן עדן טרופי" },
  "Cape Town": { name: "קייפטאון", description: "גלו את קייפטאון, דרום אפריקה - העיר האם" },
  "Cairo": { name: "קהיר", description: "גלו את קהיר, מצרים - עיר הפירמידות" },
  "Marrakech": { name: "מרקש", description: "גלו את מרקש, מרוקו - העיר האדומה" },
  "Nairobi": { name: "ניירובי", description: "גלו את ניירובי, קניה - שער לספארי" },
  "Johannesburg": { name: "יוהנסבורג", description: "גלו את יוהנסבורג, דרום אפריקה - עיר הזהב" },
  "Casablanca": { name: "קזבלנקה", description: "גלו את קזבלנקה, מרוקו - פנינת האוקיינוס האטלנטי" },
  "Luxor": { name: "לוקסור", description: "גלו את לוקסור, מצרים - מוזיאון פתוח" },
  "Zanzibar": { name: "זנזיבר", description: "גלו את זנזיבר, טנזניה - אי הפנינים" },
  "Tunis": { name: "תוניס", description: "גלו את תוניס, תוניסיה - שער צפון אפריקה" },
  "Mauritius": { name: "מאוריציוס", description: "גלו את מאוריציוס - גן עדן טרופי" },
  "Punta Cana": { name: "פונטה קאנה", description: "גלו את פונטה קאנה, הרפובליקה הדומיניקנית - חופים לבנים" },
  "Havana": { name: "הוואנה", description: "גלו את הוואנה, קובה - הבירה הצבעונית" },
  "Nassau": { name: "נסאו", description: "גלו את נסאו, באהאמס - פרדייס הקריביים" },
  "Montego Bay": { name: "מונטגו ביי", description: "גלו את מונטגו ביי, ג'מייקה - חוף הרגאיי" },
  "San Juan": { name: "סן חואן", description: "גלו את סן חואן, פורטו ריקו - העיר העתיקה" },
  "Santo Domingo": { name: "סנטו דומינגו", description: "גלו את סנטו דומינגו, הרפובליקה הדומיניקנית - הבירה ההיסטורית" },
};

async function addTranslations() {
  console.log("🚀 Starting Hebrew translations...");
  
  const allDestinations = await db.select().from(destinations);
  console.log(`📊 Found ${allDestinations.length} destinations`);
  
  for (const dest of allDestinations) {
    const translation = HEBREW_TRANSLATIONS[dest.name || ""];
    if (!translation) {
      console.log(`⚠️  No translation found for ${dest.name}`);
      continue;
    }
    
    try {
      await db
        .insert(destinationsI18n)
        .values({
          destinationId: dest.id,
          locale: "he",
          name: translation.name,
          description: translation.description,
        });
    } catch (e: any) {
      // Ignore duplicate key errors
      if (!e.message?.includes('duplicate') && !e.message?.includes('conflict')) {
        throw e;
      }
    }
    
    console.log(`✅ Added Hebrew translation for ${dest.name} → ${translation.name}`);
  }
  
  console.log("✨ All Hebrew translations added successfully!");
}

addTranslations().catch(console.error);
