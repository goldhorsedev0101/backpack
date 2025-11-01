import { db } from "./db.js";
import { attractions, attractionsI18n, destinations } from "@shared/schema";
import { eq } from "drizzle-orm";

interface AttractionData {
  name: string;
  description: string;
  nameHe: string;
  descriptionHe: string;
  lat: string;
  lon: string;
  rating: string;
  tags: string[];
}

// Map of destination names to their 3 top attractions (90 destinations, 270 attractions)
const attractionsData: Record<string, AttractionData[]> = {
  "Athens": [
    {
      name: "Acropolis",
      description: "Ancient citadel containing the Parthenon, Erechtheion, and other historic Greek temples from the 5th century BC.",
      nameHe: "האקרופוליס",
      descriptionHe: "מצודה עתיקה המכילה את הפרתנון, אר אכתיאון ומקדשים יווניים היסטוריים נוספים מהמאה ה-5 לפנה\"ס.",
      lat: "37.9715",
      lon: "23.7267",
      rating: "4.8",
      tags: ["ancient", "landmark", "history"]
    },
    {
      name: "Acropolis Museum",
      description: "Modern museum displaying ancient artifacts from the Acropolis archaeological sites with stunning Parthenon views.",
      nameHe: "מוזיאון האקרופוליס",
      descriptionHe: "מוזיאון מודרני המציג חפצים עתיקים מאתרי החפירות של האקרופוליס עם נוף מדהים לפרתנון.",
      lat: "37.9686",
      lon: "23.7279",
      rating: "4.7",
      tags: ["museum", "cultural", "history"]
    },
    {
      name: "Plaka District",
      description: "Historic neighborhood with narrow streets, neoclassical architecture, tavernas, and vibrant shopping.",
      nameHe: "רובע פלאקה",
      descriptionHe: "שכונה היסטורית עם רחובות צרים, אדריכלות ניאו-קלאסית, טברנות וקניות תוססות.",
      lat: "37.9735",
      lon: "23.7298",
      rating: "4.5",
      tags: ["neighborhood", "shopping", "cultural"]
    }
  ],
  "Agra": [
    {
      name: "Taj Mahal",
      description: "Iconic white marble mausoleum built by Mughal emperor Shah Jahan, one of the Seven Wonders of the World.",
      nameHe: "טאג' מהאל",
      descriptionHe: "מאוזוליאום שיש לבן אייקוני שנבנה על ידי הקיסר המוגולי שאה ג'האן, אחד משבעת פלאי העולם.",
      lat: "27.1751",
      lon: "78.0421",
      rating: "4.8",
      tags: ["landmark", "historic", "monument"]
    },
    {
      name: "Agra Fort",
      description: "16th-century Mughal fortress in red sandstone, a UNESCO World Heritage site with stunning palaces and mosques.",
      nameHe: "מבצר אגרה",
      descriptionHe: "מבצר מוגולי מהמאה ה-16 באבן חול אדומה, אתר מורשת עולמית של אונסק\"ו עם ארמונות ומסגדים מדהימים.",
      lat: "27.1795",
      lon: "78.0211",
      rating: "4.6",
      tags: ["fort", "history", "unesco"]
    },
    {
      name: "Mehtab Bagh",
      description: "Charbagh garden complex offering the best sunset views of the Taj Mahal across the Yamuna River.",
      nameHe: "מהטאב באג",
      descriptionHe: "מתחם גן צ'רבאג המציע את נופי השקיעה הטובים ביותר של טאג' מהאל מעבר לנהר יאמונה.",
      lat: "27.1816",
      lon: "78.0445",
      rating: "4.5",
      tags: ["garden", "viewpoint", "nature"]
    }
  ],
  "Auckland": [
    {
      name: "Sky Tower",
      description: "328-meter observation and telecommunications tower offering panoramic Auckland views and SkyWalk experience.",
      nameHe: "מגדל הסקיי",
      descriptionHe: "מגדל תצפית ותקשורת בגובה 328 מטר המציע נוף פנורמי של אוקלנד וחוויית סקייווק.",
      lat: "-36.8485",
      lon: "174.7633",
      rating: "4.5",
      tags: ["tower", "viewpoint", "landmark"]
    },
    {
      name: "Waiheke Island",
      description: "Scenic island known for vineyards, beaches, art galleries, and just 40 minutes by ferry from Auckland.",
      nameHe: "אי ווייהקה",
      descriptionHe: "אי ציורי הידוע בכרמים, חופים, גלריות אמנות ו-40 דקות בלבד במעבורת מאוקלנד.",
      lat: "-36.7919",
      lon: "175.0874",
      rating: "4.7",
      tags: ["island", "wine", "nature"]
    },
    {
      name: "Auckland War Memorial Museum",
      description: "Major museum showcasing New Zealand history, Maori culture, and natural history in the Auckland Domain.",
      nameHe: "מוזיאון אנדרטת המלחמה של אוקלנד",
      descriptionHe: "מוזיאון גדול המציג את ההיסטוריה של ניו זילנד, תרבות המאורים וההיסטוריה הטבעית ב-Auckland Domain.",
      lat: "-36.8602",
      lon: "174.7787",
      rating: "4.6",
      tags: ["museum", "cultural", "history"]
    }
  ],
  "Bali": [
    {
      name: "Tanah Lot Temple",
      description: "Ancient Hindu shrine perched on a rock formation in the sea, famous for stunning sunset views.",
      nameHe: "מקדש טנה לוט",
      descriptionHe: "מקדש הינדי עתיק השוכן על תצורת סלע בים, מפורסם בנופי השקיעה המדהימים.",
      lat: "-8.6211",
      lon: "115.0869",
      rating: "4.6",
      tags: ["temple", "coastal", "sunset"]
    },
    {
      name: "Ubud Monkey Forest",
      description: "Sacred nature reserve and Hindu temple complex home to over 700 long-tailed macaques.",
      nameHe: "יער הקופים אובוד",
      descriptionHe: "שמורת טבע קדושה ומתחם מקדש הינדי הבית ליותר מ-700 מקוקים ארוכי זנב.",
      lat: "-8.5186",
      lon: "115.2587",
      rating: "4.5",
      tags: ["nature", "temple", "wildlife"]
    },
    {
      name: "Tegallalang Rice Terraces",
      description: "Stunning stepped rice paddies showcasing traditional Balinese irrigation and offering photo opportunities.",
      nameHe: "מדרגות האורז טגאללאנג",
      descriptionHe: "שדות אורז מדורגים מדהימים המציגים השקיה בלינזית מסורתית ומציעים הזדמנויות לצילום.",
      lat: "-8.4343",
      lon: "115.2779",
      rating: "4.5",
      tags: ["nature", "agriculture", "scenic"]
    }
  ],
  "Beijing": [
    {
      name: "Forbidden City",
      description: "Imperial palace complex with 980 buildings, home to 24 emperors and a UNESCO World Heritage site.",
      nameHe: "העיר האסורה",
      descriptionHe: "מתחם ארמון קיסרי עם 980 מבנים, בית ל-24 קיסרים ואתר מורשת עולמית של אונסק\"ו.",
      lat: "39.9163",
      lon: "116.3972",
      rating: "4.7",
      tags: ["palace", "history", "unesco"]
    },
    {
      name: "Great Wall of China",
      description: "Ancient fortification stretching 13,000 miles, one of the world's most impressive architectural feats.",
      nameHe: "החומה הגדולה של סין",
      descriptionHe: "ביצור עתיק הנמתח על פני 13,000 מייל, אחד מההישגים האדריכליים המרשימים ביותר בעולם.",
      lat: "40.4319",
      lon: "116.5704",
      rating: "4.8",
      tags: ["ancient", "landmark", "unesco"]
    },
    {
      name: "Temple of Heaven",
      description: "15th-century complex where emperors performed ceremonies, featuring the iconic Hall of Prayer.",
      nameHe: "מקדש השמיים",
      descriptionHe: "מתחם מהמאה ה-15 שבו ביצעו הקיסרים טקסים, המציג את אולם התפילה האייקוני.",
      lat: "39.8822",
      lon: "116.4066",
      rating: "4.6",
      tags: ["temple", "history", "cultural"]
    }
  ],
  "Berlin": [
    {
      name: "Brandenburg Gate",
      description: "18th-century neoclassical monument symbolizing German reunification and a powerful symbol of European unity.",
      nameHe: "שער ברנדנבורג",
      descriptionHe: "אנדרטה ניאו-קלאסית מהמאה ה-18 המסמלת את איחוד גרמניה וסמל עוצמתי לאחדות האירופית.",
      lat: "52.5163",
      lon: "13.3777",
      rating: "4.6",
      tags: ["landmark", "history", "monument"]
    },
    {
      name: "Berlin Wall Memorial",
      description: "Historic site preserving the last piece of the Berlin Wall with documentation center and watchtower.",
      nameHe: "אנדרטת חומת ברלין",
      descriptionHe: "אתר היסטורי המשמר את החלק האחרון של חומת ברלין עם מרכז תיעוד ומגדל שמירה.",
      lat: "52.5352",
      lon: "13.3903",
      rating: "4.7",
      tags: ["history", "memorial", "cultural"]
    },
    {
      name: "Museum Island",
      description: "UNESCO World Heritage site featuring five world-class museums including the Pergamon Museum.",
      nameHe: "אי המוזיאונים",
      descriptionHe: "אתר מורשת עולמית של אונסק\"ו המציג חמישה מוזיאונים ברמה עולמית כולל מוזיאון פרגמון.",
      lat: "52.5169",
      lon: "13.4013",
      rating: "4.7",
      tags: ["museum", "cultural", "unesco"]
    }
  ],
  "Bogota": [
    {
      name: "Monserrate",
      description: "Mountain sanctuary at 3,152 meters offering panoramic Bogotá views, accessible by cable car or funicular.",
      nameHe: "מונסראטה",
      descriptionHe: "מקדש הר בגובה 3,152 מטר המציע נוף פנורמי של בוגוטה, נגיש ברכבל או פוניקולר.",
      lat: "4.6054",
      lon: "-74.0563",
      rating: "4.6",
      tags: ["mountain", "viewpoint", "religious"]
    },
    {
      name: "La Candelaria",
      description: "Historic colonial neighborhood with colorful buildings, street art, museums, and vibrant cultural scene.",
      nameHe: "לה קנדלריה",
      descriptionHe: "שכונה קולוניאלית היסטורית עם בניינים צבעוניים, אמנות רחוב, מוזיאונים וסצנה תרבותית תוססת.",
      lat: "4.5977",
      lon: "-74.0741",
      rating: "4.5",
      tags: ["neighborhood", "cultural", "historic"]
    },
    {
      name: "Gold Museum",
      description: "World's largest collection of pre-Hispanic gold artifacts with over 55,000 pieces of gold and emeralds.",
      nameHe: "מוזיאון הזהב",
      descriptionHe: "האוסף הגדול בעולם של חפצי זהב פרה-היספניים עם למעלה מ-55,000 חלקי זהב ואזמרגד.",
      lat: "4.6017",
      lon: "-74.0723",
      rating: "4.7",
      tags: ["museum", "cultural", "history"]
    }
  ],
  "Brisbane": [
    {
      name: "Lone Pine Koala Sanctuary",
      description: "World's first and largest koala sanctuary where visitors can cuddle koalas and see native Australian wildlife.",
      nameHe: "מקלט הקואלה לון פיין",
      descriptionHe: "המקלט הראשון והגדול בעולם לקואלות שבו המבקרים יכולים לחבק קואלות ולראות חיות בר אוסטרליות.",
      lat: "-27.5340",
      lon: "152.9698",
      rating: "4.7",
      tags: ["wildlife", "nature", "family"]
    },
    {
      name: "South Bank Parklands",
      description: "Urban oasis featuring lagoon pool, gardens, restaurants, and cultural precinct along the Brisbane River.",
      nameHe: "פארקלנדס סאות' בנק",
      descriptionHe: "נווה מדבר עירוני המציג בריכת לגונה, גנים, מסעדות ואזור תרבותי לאורך נהר בריסביין.",
      lat: "-27.4748",
      lon: "153.0217",
      rating: "4.6",
      tags: ["park", "recreation", "cultural"]
    },
    {
      name: "Story Bridge",
      description: "Iconic cantilever bridge offering adventurous bridge climb experiences with spectacular city views.",
      nameHe: "גשר סטורי",
      descriptionHe: "גשר קונסולי אייקוני המציע חוויות טיפוס גשר הרפתקניות עם נופי עיר מרהיבים.",
      lat: "-27.4634",
      lon: "153.0408",
      rating: "4.6",
      tags: ["bridge", "viewpoint", "landmark"]
    }
  ],
  "Brussels": [
    {
      name: "Grand Place",
      description: "UNESCO-listed central square surrounded by opulent guildhalls, considered one of Europe's most beautiful squares.",
      nameHe: "הכיכר הגדולה",
      descriptionHe: "כיכר מרכזית ברשימת אונסק\"ו המוקפת אולמות גילדה מפוארים, נחשבת לאחת הכיכרות היפות באירופה.",
      lat: "50.8467",
      lon: "4.3525",
      rating: "4.7",
      tags: ["square", "historic", "unesco"]
    },
    {
      name: "Manneken Pis",
      description: "Iconic bronze statue and fountain of a little boy urinating, a symbol of Brussels' irreverent spirit.",
      nameHe: "מאנקן פיס",
      descriptionHe: "פסל ברונזה ומזרקה אייקוניים של ילד קטן משתין, סמל לרוח הבלתי-נכנעת של בריסל.",
      lat: "50.8450",
      lon: "4.3499",
      rating: "4.3",
      tags: ["statue", "landmark", "cultural"]
    },
    {
      name: "Atomium",
      description: "Futuristic 102-meter structure representing an iron crystal magnified 165 billion times, built for 1958 Expo.",
      nameHe: "אטומיום",
      descriptionHe: "מבנה עתידני בגובה 102 מטר המייצג גביש ברזל מוגדל פי 165 מיליארד, נבנה לתערוכה של 1958.",
      lat: "50.8950",
      lon: "4.3412",
      rating: "4.5",
      tags: ["landmark", "modern", "viewpoint"]
    }
  ],
  "Budapest": [
    {
      name: "Buda Castle",
      description: "Historic royal palace complex on Castle Hill with stunning architecture and panoramic Danube views.",
      nameHe: "ארמון בודה",
      descriptionHe: "מתחם ארמון מלכותי היסטורי על גבעת הטירה עם אדריכלות מדהימה ונוף פנורמי לדנובה.",
      lat: "47.4966",
      lon: "19.0397",
      rating: "4.6",
      tags: ["palace", "history", "viewpoint"]
    },
    {
      name: "Széchenyi Thermal Bath",
      description: "Largest medicinal bath in Europe featuring 18 pools, saunas, and Neo-Baroque architecture.",
      nameHe: "מרחצאות ססצ'ניי תרמליים",
      descriptionHe: "המרחץ הרפואי הגדול באירופה המציג 18 בריכות, סאונות ואדריכלות ניאו-בארוקית.",
      lat: "47.5194",
      lon: "19.0813",
      rating: "4.7",
      tags: ["spa", "thermal", "wellness"]
    },
    {
      name: "Hungarian Parliament Building",
      description: "Magnificent Gothic Revival building on the Danube, one of Europe's oldest legislative buildings.",
      nameHe: "בניין הפרלמנט ההונגרי",
      descriptionHe: "בניין מפואר בסגנון תחייה גותית על הדנובה, אחד מבניני החקיקה העתיקים באירופה.",
      lat: "47.5070",
      lon: "19.0458",
      rating: "4.7",
      tags: ["building", "historic", "landmark"]
    }
  ],
  "Buenos Aires": [
    {
      name: "La Boca",
      description: "Colorful waterfront neighborhood famous for tango, street art, and the iconic Caminito street museum.",
      nameHe: "לה בוקה",
      descriptionHe: "שכונת חוף צבעונית המפורסמת בטנגו, אמנות רחוב ומוזיאון הרחוב האייקוני קמיניטו.",
      lat: "-34.6346",
      lon: "-58.3631",
      rating: "4.4",
      tags: ["neighborhood", "cultural", "art"]
    },
    {
      name: "Recoleta Cemetery",
      description: "Elaborate cemetery featuring ornate mausoleums and the tomb of Eva Perón, like an outdoor museum.",
      nameHe: "בית הקברות רקולטה",
      descriptionHe: "בית קברות מפואר המציג מאוזוליאומים מעוטרים וקבר אווה פרון, כמו מוזיאון חיצוני.",
      lat: "-34.5878",
      lon: "-58.3931",
      rating: "4.7",
      tags: ["cemetery", "historic", "cultural"]
    },
    {
      name: "Teatro Colón",
      description: "World-renowned opera house with exceptional acoustics and stunning Belle Époque architecture.",
      nameHe: "תיאטרו קולון",
      descriptionHe: "בית אופרה מוכר עולמית עם אקוסטיקה יוצאת דופן ואדריכלות בל אפוק מדהימה.",
      lat: "-34.6010",
      lon: "-58.3832",
      rating: "4.7",
      tags: ["theater", "cultural", "landmark"]
    }
  ],
  "Cairo": [
    {
      name: "Pyramids of Giza",
      description: "Ancient Egyptian pyramids and the Sphinx, the last remaining Wonder of the Ancient World.",
      nameHe: "פירמידות גיזה",
      descriptionHe: "פירמידות מצרים עתיקות והספינקס, הפלא האחרון שנותר מהעולם העתיק.",
      lat: "29.9773",
      lon: "31.1325",
      rating: "4.7",
      tags: ["ancient", "landmark", "unesco"]
    },
    {
      name: "Egyptian Museum",
      description: "World's largest collection of ancient Egyptian artifacts including Tutankhamun's treasures.",
      nameHe: "המוזיאון המצרי",
      descriptionHe: "האוסף הגדול בעולם של חפצים מצריים עתיקים כולל אוצרות תותנקאמון.",
      lat: "30.0478",
      lon: "31.2336",
      rating: "4.5",
      tags: ["museum", "history", "cultural"]
    },
    {
      name: "Khan el-Khalili",
      description: "Historic bazaar dating to the 14th century, offering spices, jewelry, textiles, and traditional crafts.",
      nameHe: "חאן א-ח'לילי",
      descriptionHe: "בזאר היסטורי מהמאה ה-14, המציע תבלינים, תכשיטים, טקסטיל ומלאכות מסורתיות.",
      lat: "30.0475",
      lon: "31.2624",
      rating: "4.5",
      tags: ["market", "shopping", "historic"]
    }
  ],
  "Cancun": [
    {
      name: "Chichen Itza",
      description: "Ancient Mayan city featuring the iconic El Castillo pyramid, a UNESCO World Heritage site.",
      nameHe: "צ'יצ'ן איצה",
      descriptionHe: "עיר מאיה עתיקה המציגה את פירמידת אל קסטיו האייקונית, אתר מורשת עולמית של אונסק\"ו.",
      lat: "20.6829",
      lon: "-88.5686",
      rating: "4.7",
      tags: ["ancient", "maya", "unesco"]
    },
    {
      name: "Xcaret Park",
      description: "Eco-archaeological park featuring underground rivers, beach, wildlife, and Mexican cultural shows.",
      nameHe: "פארק אקס-קארט",
      descriptionHe: "פארק אקולוגי-ארכיאולוגי המציג נהרות תת קרקעיים, חוף, חיות בר ומופעי תרבות מקסיקניים.",
      lat: "20.5786",
      lon: "-87.1206",
      rating: "4.7",
      tags: ["park", "nature", "cultural"]
    },
    {
      name: "Isla Mujeres",
      description: "Small island paradise with pristine beaches, coral reefs for snorkeling, and laid-back Caribbean vibes.",
      nameHe: "איסלה מוחרס",
      descriptionHe: "גן עדן אי קטן עם חופים בתוליים, שוניות אלמוגים לשנורקלינג ואווירה קאריבית רגועה.",
      lat: "21.2311",
      lon: "-86.7309",
      rating: "4.6",
      tags: ["island", "beach", "snorkeling"]
    }
  ],
  "Cape Town": [
    {
      name: "Table Mountain",
      description: "Iconic flat-topped mountain with cable car access offering panoramic views of Cape Town and coastline.",
      nameHe: "הר השולחן",
      descriptionHe: "הר אייקוני בעל פסגה שטוחה עם גישה ברכבל המציע נוף פנורמי של קייפטאון וחוף הים.",
      lat: "-33.9626",
      lon: "18.4098",
      rating: "4.8",
      tags: ["mountain", "viewpoint", "nature"]
    },
    {
      name: "Robben Island",
      description: "UNESCO site where Nelson Mandela was imprisoned, accessible by ferry with guided tours by ex-prisoners.",
      nameHe: "האי רובן",
      descriptionHe: "אתר אונסק\"ו שבו נכלא נלסון מנדלה, נגיש במעבורת עם סיורים מודרכים על ידי אסירים לשעבר.",
      lat: "-33.8070",
      lon: "18.3696",
      rating: "4.6",
      tags: ["historic", "museum", "unesco"]
    },
    {
      name: "Victoria & Alfred Waterfront",
      description: "Historic harbor with shops, restaurants, aquarium, and stunning views of Table Mountain.",
      nameHe: "רציף ויקטוריה ואלפרד",
      descriptionHe: "נמל היסטורי עם חנויות, מסעדות, אקווריום ונוף מדהים להר השולחן.",
      lat: "-33.9045",
      lon: "18.4197",
      rating: "4.6",
      tags: ["waterfront", "shopping", "entertainment"]
    }
  ],
  "Cartagena": [
    {
      name: "Walled City",
      description: "Historic colonial center with colorful buildings, cobblestone streets, and well-preserved Spanish architecture.",
      nameHe: "העיר המוקפת חומה",
      descriptionHe: "מרכז קולוניאלי היסטורי עם בניינים צבעוניים, רחובות מרוצפים אבן ואדריכלות ספרדית שמורה היטב.",
      lat: "10.4236",
      lon: "-75.5478",
      rating: "4.7",
      tags: ["historic", "colonial", "unesco"]
    },
    {
      name: "Castillo San Felipe de Barajas",
      description: "Massive 17th-century fortress built by the Spanish, the largest colonial military structure in Americas.",
      nameHe: "מבצר סן פליפה דה בראחס",
      descriptionHe: "מבצר עצום מהמאה ה-17 שנבנה על ידי הספרדים, המבנה הצבאי הקולוניאלי הגדול ביותר ביבשת אמריקה.",
      lat: "10.4224",
      lon: "-75.5422",
      rating: "4.6",
      tags: ["fort", "historic", "military"]
    },
    {
      name: "Islas del Rosario",
      description: "Coral island archipelago offering crystal-clear waters, snorkeling, and pristine beaches.",
      nameHe: "איי רוסריו",
      descriptionHe: "ארכיפלג איי אלמוגים המציע מים צלולים, שנורקלינג וחופים בתוליים.",
      lat: "10.1705",
      lon: "-75.7545",
      rating: "4.5",
      tags: ["islands", "beach", "snorkeling"]
    }
  ],
  "Casablanca": [
    {
      name: "Hassan II Mosque",
      description: "Magnificent mosque with world's tallest minaret at 210 meters, featuring stunning oceanfront location.",
      nameHe: "מסגד חסן השני",
      descriptionHe: "מסגד מפואר עם המינרט הגבוה בעולם בגובה 210 מטר, במיקום חוף ים מדהים.",
      lat: "33.6086",
      lon: "-7.6327",
      rating: "4.7",
      tags: ["mosque", "religious", "architecture"]
    },
    {
      name: "Rick's Café",
      description: "Legendary restaurant recreating the café from the 1942 film 'Casablanca' with live piano music.",
      nameHe: "בית קפה של ריק",
      descriptionHe: "מסעדה אגדית המשחזרת את בית הקפה מהסרט 'קזבלנקה' משנת 1942 עם מוזיקת פסנתר חיה.",
      lat: "33.6040",
      lon: "-7.6280",
      rating: "4.3",
      tags: ["restaurant", "cultural", "entertainment"]
    },
    {
      name: "Corniche",
      description: "Beachfront promenade with restaurants, cafes, and the Morocco Mall, perfect for sunset strolls.",
      nameHe: "הקורניש",
      descriptionHe: "טיילת חוף עם מסעדות, בתי קפה וקניון מרוקו, מושלם לטיולי שקיעה.",
      lat: "33.5928",
      lon: "-7.6380",
      rating: "4.4",
      tags: ["beach", "promenade", "recreation"]
    }
  ],
  "Chicago": [
    {
      name: "Millennium Park",
      description: "Urban park featuring Cloud Gate sculpture, Crown Fountain, and free concerts at Jay Pritzker Pavilion.",
      nameHe: "פארק המילניום",
      descriptionHe: "פארק עירוני המציג את פסל Cloud Gate, מזרקת קראון וקונצרטים חינם בביתן ג'יי פריצקר.",
      lat: "41.8826",
      lon: "-87.6226",
      rating: "4.7",
      tags: ["park", "art", "cultural"]
    },
    {
      name: "Willis Tower Skydeck",
      description: "103rd-floor observation deck with glass boxes extending 4 feet outside the building, offering thrilling views.",
      nameHe: "סקיידק של מגדל וויליס",
      descriptionHe: "מרפסת תצפית בקומה 103 עם תיבות זכוכית המשתרעות 4 רגל מחוץ לבניין, מציעות נוף מרגש.",
      lat: "41.8789",
      lon: "-87.6359",
      rating: "4.6",
      tags: ["building", "viewpoint", "landmark"]
    },
    {
      name: "Navy Pier",
      description: "Historic pier with Ferris wheel, restaurants, boat tours, and stunning Lake Michigan views.",
      nameHe: "מזח הצי",
      descriptionHe: "מזח היסטורי עם גלגל ענק, מסעדות, סיורי סירות ונוף מדהים לאגם מישיגן.",
      lat: "41.8917",
      lon: "-87.6086",
      rating: "4.5",
      tags: ["pier", "entertainment", "waterfront"]
    }
  ],
  "Colombo": [
    {
      name: "Gangaramaya Temple",
      description: "Buddhist temple complex blending modern and traditional architecture with museum and library.",
      nameHe: "מקדש גנגרמאיה",
      descriptionHe: "מתחם מקדש בודהיסטי המשלב אדריכלות מודרנית ומסורתית עם מוזיאון וספרייה.",
      lat: "6.9186",
      lon: "79.8558",
      rating: "4.5",
      tags: ["temple", "buddhist", "cultural"]
    },
    {
      name: "Galle Face Green",
      description: "Historic urban park along the oceanfront, perfect for kite flying, street food, and sunset views.",
      nameHe: "גאלה פייס גרין",
      descriptionHe: "פארק עירוני היסטורי לאורך חוף הים, מושלם לעפיפונים, אוכל רחוב ונופי שקיעה.",
      lat: "6.9271",
      lon: "79.8433",
      rating: "4.4",
      tags: ["park", "beach", "recreation"]
    },
    {
      name: "National Museum of Colombo",
      description: "Sri Lanka's largest museum showcasing ancient artifacts, royal regalia, and cultural heritage.",
      nameHe: "המוזיאון הלאומי של קולומבו",
      descriptionHe: "המוזיאון הגדול בסרי לנקה המציג חפצים עתיקים, סמלי מלכות ומורשת תרבותית.",
      lat: "6.9088",
      lon: "79.8608",
      rating: "4.4",
      tags: ["museum", "history", "cultural"]
    }
  ],
  "Copenhagen": [
    {
      name: "Nyhavn",
      description: "Picturesque 17th-century waterfront with colorful townhouses, restaurants, and historic wooden ships.",
      nameHe: "ניהאבן",
      descriptionHe: "חוף ים ציורי מהמאה ה-17 עם בתי עיר צבעוניים, מסעדות וספינות עץ היסטוריות.",
      lat: "55.6798",
      lon: "12.5912",
      rating: "4.6",
      tags: ["waterfront", "historic", "scenic"]
    },
    {
      name: "Tivoli Gardens",
      description: "Historic amusement park from 1843 with rides, gardens, concerts, and fairy-tale atmosphere.",
      nameHe: "גני טיבולי",
      descriptionHe: "פארק שעשועים היסטורי משנת 1843 עם מתקנים, גנים, קונצרטים ואווירת אגדה.",
      lat: "55.6738",
      lon: "12.5681",
      rating: "4.7",
      tags: ["amusement", "garden", "entertainment"]
    },
    {
      name: "The Little Mermaid",
      description: "Iconic bronze statue based on Hans Christian Andersen's fairy tale, Copenhagen's most famous landmark.",
      nameHe: "בתולת הים הקטנה",
      descriptionHe: "פסל ברונזה אייקוני המבוסס על אגדת הנס כריסטיאן אנדרסן, הנקודת ציון המפורסמת ביותר בקופנהגן.",
      lat: "55.6929",
      lon: "12.5993",
      rating: "4.2",
      tags: ["statue", "landmark", "cultural"]
    }
  ],
  "Cusco": [
    {
      name: "Machu Picchu",
      description: "Ancient Incan citadel set high in the Andes, one of the New Seven Wonders of the World.",
      nameHe: "מאצ'ו פיצ'ו",
      descriptionHe: "מצודה אינקה עתיקה הממוקמת גבוה בהרי האנדים, אחד משבעת פלאי העולם החדשים.",
      lat: "-13.1631",
      lon: "-72.5450",
      rating: "4.8",
      tags: ["ancient", "inca", "unesco"]
    },
    {
      name: "Sacsayhuamán",
      description: "Massive Inca fortress with giant stone walls built without mortar, overlooking Cusco.",
      nameHe: "סאקסייוואמן",
      descriptionHe: "מבצר אינקה עצום עם חומות אבן ענקיות שנבנו ללא טיט, משקיף על קוסקו.",
      lat: "-13.5084",
      lon: "-71.9816",
      rating: "4.7",
      tags: ["ancient", "inca", "fortress"]
    },
    {
      name: "Plaza de Armas",
      description: "Historic main square surrounded by colonial architecture, churches, and restaurants.",
      nameHe: "פלאסה דה ארמאס",
      descriptionHe: "כיכר ראשית היסטורית המוקפת באדריכלות קולוניאלית, כנסיות ומסעדות.",
      lat: "-13.5164",
      lon: "-71.9785",
      rating: "4.6",
      tags: ["square", "historic", "colonial"]
    }
  ],
  "Delhi": [
    {
      name: "Red Fort",
      description: "17th-century Mughal fort with red sandstone walls, a UNESCO World Heritage site and symbol of India.",
      nameHe: "המבצר האדום",
      descriptionHe: "מבצר מוגולי מהמאה ה-17 עם חומות אבן חול אדומות, אתר מורשת עולמית של אונסק\"ו וסמל של הודו.",
      lat: "28.6562",
      lon: "77.2410",
      rating: "4.5",
      tags: ["fort", "unesco", "historic"]
    },
    {
      name: "Qutub Minar",
      description: "73-meter tall victory tower and UNESCO site, the tallest brick minaret in the world.",
      nameHe: "קוטוב מינאר",
      descriptionHe: "מגדל ניצחון בגובה 73 מטר ואתר אונסק\"ו, המינרט לבני הגבוה בעולם.",
      lat: "28.5244",
      lon: "77.1855",
      rating: "4.5",
      tags: ["tower", "unesco", "historic"]
    },
    {
      name: "India Gate",
      description: "War memorial arch honoring 70,000 Indian soldiers, a symbol of New Delhi and popular gathering spot.",
      nameHe: "שער הודו",
      descriptionHe: "קשת זיכרון מלחמה המכבדת 70,000 חיילים הודים, סמל של ניו דלהי ונקודת מפגש פופולרית.",
      lat: "28.6129",
      lon: "77.2295",
      rating: "4.5",
      tags: ["monument", "memorial", "landmark"]
    }
  ],
  "Dublin": [
    {
      name: "Trinity College & Book of Kells",
      description: "Historic university housing the 9th-century illuminated manuscript in the stunning Long Room library.",
      nameHe: "טריניטי קולג' וספר הקלס",
      descriptionHe: "אוניברסיטה היסטורית המאכסנת את כתב היד המואר מהמאה ה-9 בספריית הלונג רום המדהימה.",
      lat: "53.3438",
      lon: "-6.2546",
      rating: "4.7",
      tags: ["university", "library", "historic"]
    },
    {
      name: "Guinness Storehouse",
      description: "Seven-story brewery museum with interactive exhibits and rooftop Gravity Bar offering 360° Dublin views.",
      nameHe: "מחסן גינס",
      descriptionHe: "מוזיאון מבשלת בירה בן שבע קומות עם תצוגות אינטראקטיביות ובר גרביטי על הגג המציע נוף 360° של דבלין.",
      lat: "53.3419",
      lon: "-6.2867",
      rating: "4.6",
      tags: ["brewery", "museum", "cultural"]
    },
    {
      name: "Temple Bar",
      description: "Cultural quarter famous for traditional pubs, live Irish music, street art, and vibrant nightlife.",
      nameHe: "טמפל בר",
      descriptionHe: "רובע תרבות מפורסם בפאבים מסורתיים, מוזיקה אירית חיה, אמנות רחוב וחיי לילה תוססים.",
      lat: "53.3456",
      lon: "-6.2645",
      rating: "4.5",
      tags: ["neighborhood", "nightlife", "cultural"]
    }
  ],
  "Edinburgh": [
    {
      name: "Edinburgh Castle",
      description: "Historic fortress perched on Castle Rock, housing the Scottish Crown Jewels and Stone of Destiny.",
      nameHe: "טירת אדינבורו",
      descriptionHe: "מבצר היסטורי השוכן על סלע הטירה, המאכסן את תכשיטי הכתר הסקוטיים ואבן הגורל.",
      lat: "55.9486",
      lon: "-3.1999",
      rating: "4.7",
      tags: ["castle", "historic", "landmark"]
    },
    {
      name: "Royal Mile",
      description: "Historic street connecting Edinburgh Castle to Holyrood Palace, lined with shops, pubs, and attractions.",
      nameHe: "המייל המלכותי",
      descriptionHe: "רחוב היסטורי המחבר את טירת אדינבורו לארמון הולירוד, משופע בחנויות, פאבים ואטרקציות.",
      lat: "55.9502",
      lon: "-3.1883",
      rating: "4.6",
      tags: ["street", "historic", "shopping"]
    },
    {
      name: "Arthur's Seat",
      description: "Ancient volcano and hill in Holyrood Park offering panoramic Edinburgh views after a moderate hike.",
      nameHe: "מושב ארתור",
      descriptionHe: "הר געש עתיק וגבעה בפארק הולירוד המציעים נוף פנורמי של אדינבורו לאחר טיול מתון.",
      lat: "55.9445",
      lon: "-3.1618",
      rating: "4.8",
      tags: ["mountain", "viewpoint", "nature"]
    }
  ],
  "Fiji": [
    {
      name: "Mamanuca Islands",
      description: "Stunning archipelago with crystal-clear waters, coral reefs, luxury resorts, and water sports.",
      nameHe: "איי ממאנוקה",
      descriptionHe: "ארכיפלג מדהים עם מים צלולים, שוניות אלמוגים, אתרי נופש יוקרתיים וספורט ימי.",
      lat: "-17.6714",
      lon: "177.1953",
      rating: "4.8",
      tags: ["islands", "beach", "resort"]
    },
    {
      name: "Yasawa Islands",
      description: "Remote volcanic islands with pristine beaches, traditional villages, and exceptional snorkeling.",
      nameHe: "איי יאסאווה",
      descriptionHe: "איים וולקניים נידחים עם חופים בתוליים, כפרים מסורתיים ושנורקלינג יוצא מן הכלל.",
      lat: "-16.7667",
      lon: "177.4167",
      rating: "4.7",
      tags: ["islands", "beach", "snorkeling"]
    },
    {
      name: "Garden of the Sleeping Giant",
      description: "Orchid garden showcasing over 2,000 orchid varieties amid lush tropical rainforest.",
      nameHe: "גן הענק הישן",
      descriptionHe: "גן סחלבים המציג למעלה מ-2,000 זני סחלבים בתוך יער גשם טרופי עבות.",
      lat: "-17.7167",
      lon: "177.4333",
      rating: "4.6",
      tags: ["garden", "nature", "flowers"]
    }
  ],
  "Florence": [
    {
      name: "Uffizi Gallery",
      description: "World-renowned art museum featuring Renaissance masterpieces by Botticelli, da Vinci, and Michelangelo.",
      nameHe: "גלריית אופיצי",
      descriptionHe: "מוזיאון אמנות מפורסם עולמית המציג יצירות מופת מתקופת הרנסנס של בוטיצ'לי, דה וינצ'י ומיכלאנג'לו.",
      lat: "43.7687",
      lon: "11.2558",
      rating: "4.7",
      tags: ["museum", "art", "renaissance"]
    },
    {
      name: "Florence Cathedral",
      description: "Iconic Duomo with Brunelleschi's dome, Giotto's Campanile, and stunning Renaissance architecture.",
      nameHe: "קתדרלת פירנצה",
      descriptionHe: "הדואומו האייקוני עם כיפת ברונלסקי, קמפנילה של ג'וטו ואדריכלות רנסנס מדהימה.",
      lat: "43.7732",
      lon: "11.2560",
      rating: "4.8",
      tags: ["cathedral", "landmark", "renaissance"]
    },
    {
      name: "Ponte Vecchio",
      description: "Medieval stone bridge lined with jewelry shops, offering romantic Arno River views.",
      nameHe: "פונטה וקיו",
      descriptionHe: "גשר אבן מימי הביניים משופע בחנויות תכשיטים, מציע נוף רומנטי לנהר ארנו.",
      lat: "43.7679",
      lon: "11.2530",
      rating: "4.6",
      tags: ["bridge", "historic", "landmark"]
    }
  ],
  "Hanoi": [
    {
      name: "Hoan Kiem Lake",
      description: "Scenic lake in city center with Turtle Tower, Ngoc Son Temple, and red bridge.",
      nameHe: "אגם הואן קיאם",
      descriptionHe: "אגם ציורי במרכז העיר עם מגדל הצב, מקדש Ngoc Son וגשר אדום.",
      lat: "21.0285",
      lon: "105.8542",
      rating: "4.5",
      tags: ["lake", "cultural", "scenic"]
    },
    {
      name: "Old Quarter",
      description: "Historic district with narrow streets, traditional shophouses, street food, and vibrant atmosphere.",
      nameHe: "הרובע העתיק",
      descriptionHe: "רובע היסטורי עם רחובות צרים, בתי חנויות מסורתיים, אוכל רחוב ואווירה תוססת.",
      lat: "21.0364",
      lon: "105.8490",
      rating: "4.6",
      tags: ["neighborhood", "historic", "shopping"]
    },
    {
      name: "Temple of Literature",
      description: "Vietnam's first university from 1070, dedicated to Confucius with beautiful courtyards and gardens.",
      nameHe: "מקדש הספרות",
      descriptionHe: "האוניברסיטה הראשונה של וייטנאם משנת 1070, המוקדשת לקונפוציוס עם חצרות וגנים יפים.",
      lat: "21.0277",
      lon: "105.8355",
      rating: "4.6",
      tags: ["temple", "historic", "cultural"]
    }
  ],
  "Havana": [
    {
      name: "Old Havana",
      description: "UNESCO-listed colonial center with colorful buildings, plazas, vintage cars, and vibrant street life.",
      nameHe: "הוואנה העתיקה",
      descriptionHe: "מרכז קולוניאלי ברשימת אונסק\"ו עם בניינים צבעוניים, כיכרות, מכוניות וינטג' וחיי רחוב תוססים.",
      lat: "23.1370",
      lon: "-82.3504",
      rating: "4.6",
      tags: ["historic", "colonial", "unesco"]
    },
    {
      name: "El Malecón",
      description: "Iconic 8km seaside boulevard perfect for sunset walks, socializing, and experiencing Cuban culture.",
      nameHe: "אל מלקון",
      descriptionHe: "שדרת חוף אייקונית באורך 8 ק\"מ מושלמת לטיולי שקיעה, התרועעות וחוויית התרבות הקובנית.",
      lat: "23.1481",
      lon: "-82.3787",
      rating: "4.7",
      tags: ["promenade", "beach", "cultural"]
    },
    {
      name: "Plaza de la Catedral",
      description: "Beautiful baroque square featuring Havana Cathedral and surrounded by colonial mansions.",
      nameHe: "פלאסה דה לה קתדרל",
      descriptionHe: "כיכר בארוקית יפה המציגה את קתדרלת הוואנה ומוקפת אחוזות קולוניאליות.",
      lat: "23.1421",
      lon: "-82.3518",
      rating: "4.6",
      tags: ["square", "cathedral", "colonial"]
    }
  ],
  "Ho Chi Minh City": [
    {
      name: "War Remnants Museum",
      description: "Powerful museum documenting the Vietnam War with exhibits, military equipment, and photographs.",
      nameHe: "מוזיאון שרידי המלחמה",
      descriptionHe: "מוזיאון עוצמתי המתעד את מלחמת וייטנאם עם תערוכות, ציוד צבאי ותצלומים.",
      lat: "10.7797",
      lon: "106.6918",
      rating: "4.6",
      tags: ["museum", "history", "war"]
    },
    {
      name: "Ben Thanh Market",
      description: "Historic market offering handicrafts, textiles, food, and authentic Vietnamese street food experience.",
      nameHe: "שוק בן תאן",
      descriptionHe: "שוק היסטורי המציע מלאכת יד, טקסטיל, אוכל וחוויית אוכל רחוב וייטנאמית אותנטית.",
      lat: "10.7722",
      lon: "106.6981",
      rating: "4.3",
      tags: ["market", "shopping", "food"]
    },
    {
      name: "Notre-Dame Cathedral Basilica",
      description: "French colonial cathedral with distinctive red brick facade and neo-Romanesque architecture.",
      nameHe: "בזיליקת קתדרלת נוטרדאם",
      descriptionHe: "קתדרלה קולוניאלית צרפתית עם חזית לבנים אדומות מיוחדת ואדריכלות ניאו-רומנסקית.",
      lat: "10.7797",
      lon: "106.6990",
      rating: "4.5",
      tags: ["cathedral", "colonial", "landmark"]
    }
  ],
  "Hong Kong": [
    {
      name: "Victoria Peak",
      description: "Mountain summit offering spectacular panoramic views of Hong Kong's skyline via Peak Tram.",
      nameHe: "פסגת ויקטוריה",
      descriptionHe: "פסגת הר המציעה נוף פנורמי מרהיב של קו הרקיע של הונג קונג דרך רכבת הפסגה.",
      lat: "22.2716",
      lon: "114.1488",
      rating: "4.7",
      tags: ["mountain", "viewpoint", "landmark"]
    },
    {
      name: "Tian Tan Buddha",
      description: "Giant 34-meter bronze Buddha statue on Lantau Island, reached by 268 steps with stunning views.",
      nameHe: "בודהה טיאן טאן",
      descriptionHe: "פסל בודהה ברונזה ענק בגובה 34 מטר באי לנטאו, אליו מגיעים ב-268 מדרגות עם נופים מדהימים.",
      lat: "22.2544",
      lon: "113.9046",
      rating: "4.6",
      tags: ["statue", "buddhist", "mountain"]
    },
    {
      name: "Star Ferry",
      description: "Historic ferry crossing Victoria Harbour, offering iconic views of Hong Kong's skyline since 1888.",
      nameHe: "מעבורת הכוכב",
      descriptionHe: "מעבורת היסטורית החוצה את נמל ויקטוריה, מציעה נופים איקוניים של קו הרקיע של הונג קונג מאז 1888.",
      lat: "22.2934",
      lon: "114.1681",
      rating: "4.6",
      tags: ["ferry", "harbor", "scenic"]
    }
  ],
  "Istanbul": [
    {
      name: "Hagia Sophia",
      description: "Magnificent 6th-century Byzantine basilica turned mosque, a UNESCO World Heritage masterpiece.",
      nameHe: "האגיה סופיה",
      descriptionHe: "בזיליקה ביזנטית מפוארת מהמאה ה-6 שהפכה למסגד, יצירת מופת של מורשת עולמית של אונסק\"ו.",
      lat: "41.0086",
      lon: "28.9802",
      rating: "4.7",
      tags: ["mosque", "historic", "unesco"]
    },
    {
      name: "Blue Mosque",
      description: "Stunning Ottoman mosque with six minarets and iconic blue Iznik tiles in the interior.",
      nameHe: "המסגד הכחול",
      descriptionHe: "מסגד עות'מאני מדהים עם שישה מינרטים ואריחי איזניק כחולים אייקוניים בפנים.",
      lat: "41.0054",
      lon: "28.9768",
      rating: "4.7",
      tags: ["mosque", "historic", "landmark"]
    },
    {
      name: "Grand Bazaar",
      description: "One of world's oldest covered markets with 4,000 shops selling jewelry, carpets, spices, and crafts.",
      nameHe: "הבזאר הגדול",
      descriptionHe: "אחד השווקים המקורים העתיקים בעולם עם 4,000 חנויות המוכרות תכשיטים, שטיחים, תבלינים ומלאכות.",
      lat: "41.0108",
      lon: "28.9680",
      rating: "4.5",
      tags: ["market", "shopping", "historic"]
    }
  ],
  "Jaipur": [
    {
      name: "Amber Fort",
      description: "Majestic hilltop fort with ornate palaces, mirror work, and elephant rides to the entrance.",
      nameHe: "מבצר אמבר",
      descriptionHe: "מבצר רכס הרים מלכותי עם ארמונות מעוטרים, עבודת מראות וטיולי פילים לכניסה.",
      lat: "26.9855",
      lon: "75.8513",
      rating: "4.7",
      tags: ["fort", "historic", "palace"]
    },
    {
      name: "City Palace",
      description: "Royal residence complex blending Rajput and Mughal architecture with museums and courtyards.",
      nameHe: "ארמון העיר",
      descriptionHe: "מתחם מגורים מלכותי המשלב אדריכלות ראג'פוט ומוגולית עם מוזיאונים וחצרות.",
      lat: "26.9258",
      lon: "75.8237",
      rating: "4.6",
      tags: ["palace", "museum", "historic"]
    },
    {
      name: "Hawa Mahal",
      description: "Iconic Palace of Winds with 953 pink sandstone windows, a stunning example of Rajput architecture.",
      nameHe: "הוואה מהאל",
      descriptionHe: "ארמון הרוחות האייקוני עם 953 חלונות אבן חול ורודים, דוגמה מדהימה לאדריכלות ראג'פוט.",
      lat: "26.9239",
      lon: "75.8267",
      rating: "4.5",
      tags: ["palace", "landmark", "architecture"]
    }
  ],
  "Jakarta": [
    {
      name: "National Monument (Monas)",
      description: "132-meter tower commemorating Indonesian independence with observation deck and museum.",
      nameHe: "האנדרטה הלאומית (מונאס)",
      descriptionHe: "מגדל בגובה 132 מטר המנציח את עצמאות אינדונזיה עם מרפסת תצפית ומוזיאון.",
      lat: "-6.1754",
      lon: "106.8272",
      rating: "4.5",
      tags: ["monument", "landmark", "viewpoint"]
    },
    {
      name: "Old Batavia (Kota Tua)",
      description: "Historic Dutch colonial district with museums, vintage buildings, and Fatahillah Square.",
      nameHe: "בטאוויה העתיקה (קוטה טואה)",
      descriptionHe: "רובע קולוניאלי הולנדי היסטורי עם מוזיאונים, בניינים וינטג' וכיכר פאטהילה.",
      lat: "-6.1352",
      lon: "106.8133",
      rating: "4.4",
      tags: ["historic", "colonial", "cultural"]
    },
    {
      name: "Istiqlal Mosque",
      description: "Southeast Asia's largest mosque with modern architecture and capacity for 120,000 worshippers.",
      nameHe: "מסגד איסתיקלאל",
      descriptionHe: "המסגד הגדול בדרום מזרח אסיה עם אדריכלות מודרנית וקיבולת של 120,000 מתפללים.",
      lat: "-6.1702",
      lon: "106.8297",
      rating: "4.7",
      tags: ["mosque", "religious", "landmark"]
    }
  ],
  "Jerusalem": [
    {
      name: "Western Wall",
      description: "Judaism's holiest site where people pray and place notes in the ancient wall's crevices.",
      nameHe: "הכותל המערבי",
      descriptionHe: "האתר הקדוש ביותר ליהדות שבו אנשים מתפללים ומניחים פתקים בסדקי החומה העתיקה.",
      lat: "31.7767",
      lon: "35.2345",
      rating: "4.8",
      tags: ["religious", "historic", "landmark"]
    },
    {
      name: "Dome of the Rock",
      description: "Iconic Islamic shrine with golden dome on Temple Mount, one of Jerusalem's most recognizable landmarks.",
      nameHe: "כיפת הסלע",
      descriptionHe: "מקדש אסלאמי אייקוני עם כיפה זהובה על הר הבית, אחד מציוני הדרך המזוהים ביותר בירושלים.",
      lat: "31.7780",
      lon: "35.2354",
      rating: "4.7",
      tags: ["religious", "historic", "landmark"]
    },
    {
      name: "Church of the Holy Sepulchre",
      description: "Christian pilgrimage site believed to be the location of Jesus's crucifixion and tomb.",
      nameHe: "כנסיית הקבר הקדוש",
      descriptionHe: "אתר עלייה לרגל נוצרי המאמין שהוא המקום שבו נצלב ישו ונקבר.",
      lat: "31.7784",
      lon: "35.2297",
      rating: "4.7",
      tags: ["church", "religious", "historic"]
    }
  ],
  "Johannesburg": [
    {
      name: "Apartheid Museum",
      description: "Powerful museum documenting South Africa's apartheid history through multimedia exhibits.",
      nameHe: "מוזיאון האפרטהייד",
      descriptionHe: "מוזיאון עוצמתי המתעד את היסטוריית האפרטהייד של דרום אפריקה באמצעות תערוכות מולטימדיה.",
      lat: "-26.2348",
      lon: "27.9891",
      rating: "4.7",
      tags: ["museum", "history", "cultural"]
    },
    {
      name: "Constitution Hill",
      description: "Historic fort and former prison complex now housing South Africa's Constitutional Court.",
      nameHe: "גבעת החוקה",
      descriptionHe: "מבצר היסטורי ומתחם בית כלא לשעבר המאכסן כעת את בית המשפט החוקתי של דרום אפריקה.",
      lat: "-26.1875",
      lon: "28.0418",
      rating: "4.6",
      tags: ["historic", "museum", "cultural"]
    },
    {
      name: "Soweto Township",
      description: "Historic township with Vilakazi Street, Mandela House Museum, and vibrant cultural experiences.",
      nameHe: "עיירת סוטו",
      descriptionHe: "עיירה היסטורית עם רחוב ויאלקזי, מוזיאון בית מנדלה וחוויות תרבותיות תוססות.",
      lat: "-26.2678",
      lon: "27.8585",
      rating: "4.5",
      tags: ["township", "historic", "cultural"]
    }
  ],
  "Kathmandu": [
    {
      name: "Swayambhunath (Monkey Temple)",
      description: "Ancient Buddhist stupa on hilltop with resident monkeys, prayer flags, and panoramic valley views.",
      nameHe: "סווימבונאת' (מקדש הקופים)",
      descriptionHe: "סטופה בודהיסטית עתיקה על ראש גבעה עם קופים תושבים, דגלי תפילה ונוף פנורמי של העמק.",
      lat: "27.7149",
      lon: "85.2906",
      rating: "4.6",
      tags: ["temple", "buddhist", "viewpoint"]
    },
    {
      name: "Boudhanath Stupa",
      description: "One of world's largest Buddhist stupas, a UNESCO site and center of Tibetan Buddhism in Nepal.",
      nameHe: "סטופת באודהנאת'",
      descriptionHe: "אחת הסטופות הבודהיסטיות הגדולות בעולם, אתר אונסק\"ו ומרכז הבודהיזם הטיבטי בנפאל.",
      lat: "27.7212",
      lon: "85.3622",
      rating: "4.7",
      tags: ["temple", "buddhist", "unesco"]
    },
    {
      name: "Durbar Square",
      description: "Historic royal plaza with ancient temples, palaces, and traditional Newari architecture.",
      nameHe: "כיכר דורבאר",
      descriptionHe: "כיכר מלכותית היסטורית עם מקדשים עתיקים, ארמונות ואדריכלות ניוארי מסורתית.",
      lat: "27.7042",
      lon: "85.3068",
      rating: "4.5",
      tags: ["square", "historic", "unesco"]
    }
  ],
  "Krakow": [
    {
      name: "Wawel Castle",
      description: "Royal castle and cathedral complex on hill overlooking Vistula River, symbol of Polish national identity.",
      nameHe: "טירת ואוול",
      descriptionHe: "מתחם טירה וקתדרלה מלכותי על גבעה המשקיפה על נהר ויסלה, סמל לזהות הלאומית הפולנית.",
      lat: "50.0544",
      lon: "19.9356",
      rating: "4.7",
      tags: ["castle", "historic", "landmark"]
    },
    {
      name: "Main Market Square",
      description: "Medieval Europe's largest square with Cloth Hall, St. Mary's Basilica, and vibrant atmosphere.",
      nameHe: "כיכר השוק הראשית",
      descriptionHe: "הכיכר הגדולה ביותר באירופה מימי הביניים עם אולם הבדים, בזיליקת מריה הקדושה ואווירה תוססת.",
      lat: "50.0617",
      lon: "19.9370",
      rating: "4.7",
      tags: ["square", "historic", "market"]
    },
    {
      name: "Auschwitz-Birkenau",
      description: "Former Nazi concentration camp, now a memorial and museum, a sobering UNESCO World Heritage site.",
      nameHe: "אושוויץ-בירקנאו",
      descriptionHe: "מחנה ריכוז נאצי לשעבר, כעת אתר הנצחה ומוזיאון, אתר מורשת עולמית מפוכח של אונסק\"ו.",
      lat: "50.0267",
      lon: "19.2039",
      rating: "4.8",
      tags: ["memorial", "historic", "unesco"]
    }
  ],
  "Kuala Lumpur": [
    {
      name: "Petronas Twin Towers",
      description: "Iconic 452-meter twin skyscrapers connected by sky bridge, offering observation deck views.",
      nameHe: "מגדלי התאומים פטרונאס",
      descriptionHe: "גורדי שחקים תאומים אייקוניים בגובה 452 מטר המחוברים בגשר שמיים, מציעים נוף ממרפסת תצפית.",
      lat: "3.1579",
      lon: "101.7116",
      rating: "4.6",
      tags: ["building", "viewpoint", "landmark"]
    },
    {
      name: "Batu Caves",
      description: "Limestone hill with cave temples and 140-foot golden Murugan statue, reached by 272 colorful steps.",
      nameHe: "מערות באטו",
      descriptionHe: "גבעת אבן גיר עם מקדשי מערות ופסל מורוגן זהוב בגובה 140 רגל, אליו מגיעים ב-272 מדרגות צבעוניות.",
      lat: "3.2379",
      lon: "101.6841",
      rating: "4.5",
      tags: ["cave", "temple", "landmark"]
    },
    {
      name: "KL Tower",
      description: "421-meter telecommunications tower with observation deck offering 360-degree city views.",
      nameHe: "מגדל KL",
      descriptionHe: "מגדל תקשורת בגובה 421 מטר עם מרפסת תצפית המציעה נוף 360 מעלות של העיר.",
      lat: "3.1529",
      lon: "101.7014",
      rating: "4.5",
      tags: ["tower", "viewpoint", "landmark"]
    }
  ],
  "Kyoto": [
    {
      name: "Fushimi Inari Shrine",
      description: "Iconic shrine with thousands of vermilion torii gates forming tunnels up the mountain.",
      nameHe: "מקדש פושימי אינארי",
      descriptionHe: "מקדש אייקוני עם אלפי שערי טוריי ורמיליון היוצרים מנהרות במעלה ההר.",
      lat: "34.9671",
      lon: "135.7727",
      rating: "4.8",
      tags: ["shrine", "cultural", "hiking"]
    },
    {
      name: "Kinkaku-ji (Golden Pavilion)",
      description: "Zen Buddhist temple covered in gold leaf, reflected in mirror pond, a UNESCO World Heritage site.",
      nameHe: "קינקאקו-ג'י (הביתן הזהוב)",
      descriptionHe: "מקדש בודהיסטי זן מכוסה עלי זהב, המשתקף באגם מראה, אתר מורשת עולמית של אונסק\"ו.",
      lat: "35.0394",
      lon: "135.7292",
      rating: "4.7",
      tags: ["temple", "zen", "unesco"]
    },
    {
      name: "Arashiyama Bamboo Grove",
      description: "Serene bamboo forest with towering stalks creating a mesmerizing green tunnel experience.",
      nameHe: "חורשת הבמבוק של אראשיאמה",
      descriptionHe: "יער במבוק שליו עם גבעולים מתנשאים היוצרים חוויית מנהרה ירוקה מהפנטת.",
      lat: "35.0089",
      lon: "135.6716",
      rating: "4.6",
      tags: ["nature", "bamboo", "scenic"]
    }
  ],
  "La Paz": [
    {
      name: "Valle de la Luna",
      description: "Moon-like landscape of eroded clay formations and pinnacles in the Altiplano desert.",
      nameHe: "עמק הירח",
      descriptionHe: "נוף דמוי ירח של תצורות חימר נשחקות ופסגות במדבר האלטיפלנו.",
      lat: "-16.5696",
      lon: "-68.0923",
      rating: "4.5",
      tags: ["nature", "desert", "scenic"]
    },
    {
      name: "Teleférico Cable Car",
      description: "World's longest and highest urban cable car network with spectacular views of La Paz and surrounding mountains.",
      nameHe: "רכבל טלפריקו",
      descriptionHe: "רשת הרכבלים העירונית הארוכה והגבוהה בעולם עם נוף מרהיב של לה פאס וההרים שמסביב.",
      lat: "-16.5000",
      lon: "-68.1500",
      rating: "4.7",
      tags: ["cable car", "viewpoint", "transportation"]
    },
    {
      name: "Witches' Market",
      description: "Traditional market selling llama fetuses, herbs, potions, and Aymara folk medicine and crafts.",
      nameHe: "שוק המכשפות",
      descriptionHe: "שוק מסורתי המוכר עוברי לאמה, עשבי תיבול, שיקויים ורפואה עממית ומלאכות איימארה.",
      lat: "-16.4964",
      lon: "-68.1389",
      rating: "4.3",
      tags: ["market", "cultural", "traditional"]
    }
  ],
  "Las Vegas": [
    {
      name: "Bellagio Fountains",
      description: "Spectacular choreographed water show with music and lights on an 8-acre lake.",
      nameHe: "מזרקות בלאג'יו",
      descriptionHe: "מופע מים כוראוגרפי מרהיב עם מוזיקה ואורות על אגם בשטח 8 דונם.",
      lat: "36.1126",
      lon: "-115.1767",
      rating: "4.7",
      tags: ["fountain", "entertainment", "landmark"]
    },
    {
      name: "Fremont Street Experience",
      description: "Pedestrian mall with LED canopy light shows, street performers, and vintage Vegas atmosphere.",
      nameHe: "חוויית רחוב פרמונט",
      descriptionHe: "קניון להולכי רגל עם מופעי אור חופת LED, אמני רחוב ואווירת וגאס וינטג'.",
      lat: "36.1699",
      lon: "-115.1423",
      rating: "4.5",
      tags: ["street", "entertainment", "nightlife"]
    },
    {
      name: "High Roller Observation Wheel",
      description: "World's tallest observation wheel at 550 feet offering panoramic Las Vegas Strip views.",
      nameHe: "גלגל התצפית היי רולר",
      descriptionHe: "גלגל התצפית הגבוה בעולם בגובה 550 רגל המציע נוף פנורמי של רצועת לאס וגאס.",
      lat: "36.1173",
      lon: "-115.1681",
      rating: "4.6",
      tags: ["observation", "viewpoint", "landmark"]
    }
  ],
  "Lima": [
    {
      name: "Larco Museum",
      description: "Pre-Columbian art museum with extensive collection of pottery, textiles, and gold artifacts.",
      nameHe: "מוזיאון לארקו",
      descriptionHe: "מוזיאון אמנות פרה-קולומבית עם אוסף נרחב של כלי חרס, טקסטיל וחפצי זהב.",
      lat: "-12.0752",
      lon: "-77.0712",
      rating: "4.7",
      tags: ["museum", "cultural", "history"]
    },
    {
      name: "Miraflores Boardwalk",
      description: "Clifftop promenade along Pacific Ocean with parks, paragliders, restaurants, and sunset views.",
      nameHe: "טיילת מירפלורס",
      descriptionHe: "טיילת מצוק לאורך האוקיינוס השקט עם פארקים, מצנחי רחיפה, מסעדות ונופי שקיעה.",
      lat: "-12.1196",
      lon: "-77.0311",
      rating: "4.6",
      tags: ["promenade", "ocean", "scenic"]
    },
    {
      name: "Historic Center of Lima",
      description: "UNESCO-listed colonial center with Plaza Mayor, Government Palace, and baroque architecture.",
      nameHe: "המרכז ההיסטורי של לימה",
      descriptionHe: "מרכז קולוניאלי ברשימת אונסק\"ו עם פלאסה מאיור, ארמון הממשלה ואדריכלות בארוקית.",
      lat: "-12.0464",
      lon: "-77.0428",
      rating: "4.5",
      tags: ["historic", "colonial", "unesco"]
    }
  ],
  "Lisbon": [
    {
      name: "Belém Tower",
      description: "16th-century fortified tower on Tagus River, a UNESCO World Heritage symbol of Age of Discoveries.",
      nameHe: "מגדל בלם",
      descriptionHe: "מגדל מבוצר מהמאה ה-16 על נהר טאגוס, סמל מורשת עולמית של אונסק\"ו לעידן התגליות.",
      lat: "38.6916",
      lon: "-9.2160",
      rating: "4.5",
      tags: ["tower", "historic", "unesco"]
    },
    {
      name: "Jerónimos Monastery",
      description: "Stunning Manueline monastery housing Vasco da Gama's tomb, a UNESCO World Heritage masterpiece.",
      nameHe: "מנזר ג'רונימוס",
      descriptionHe: "מנזר מנואלי מדהים המאכסן את קברו של וסקו דה גאמה, יצירת מופת של מורשת עולמית של אונסק\"ו.",
      lat: "38.6978",
      lon: "-9.2061",
      rating: "4.7",
      tags: ["monastery", "historic", "unesco"]
    },
    {
      name: "Alfama District",
      description: "Oldest neighborhood with narrow medieval streets, Fado music, viewpoints, and historic trams.",
      nameHe: "רובע אלפמה",
      descriptionHe: "השכונה העתיקה ביותר עם רחובות מימי הביניים צרים, מוזיקת פאדו, נקודות תצפית וחשמליות היסטוריות.",
      lat: "38.7130",
      lon: "-9.1314",
      rating: "4.6",
      tags: ["neighborhood", "historic", "cultural"]
    }
  ],
  "Los Angeles": [
    {
      name: "Griffith Observatory",
      description: "Iconic observatory with planetarium, exhibits, and spectacular views of Hollywood Sign and LA basin.",
      nameHe: "מצפה גריפית'",
      descriptionHe: "מצפה כוכבים אייקוני עם פלנטריום, תערוכות ונוף מרהיב של שלט הוליווד ואגן LA.",
      lat: "34.1184",
      lon: "-118.3004",
      rating: "4.7",
      tags: ["observatory", "viewpoint", "landmark"]
    },
    {
      name: "Santa Monica Pier",
      description: "Historic pier with Pacific Park amusement rides, aquarium, restaurants, and beach access.",
      nameHe: "מזח סנטה מוניקה",
      descriptionHe: "מזח היסטורי עם מתקני שעשועים של פסיפיק פארק, אקווריום, מסעדות וגישה לחוף.",
      lat: "34.0094",
      lon: "-118.4977",
      rating: "4.5",
      tags: ["pier", "beach", "entertainment"]
    },
    {
      name: "Hollywood Walk of Fame",
      description: "Iconic sidewalk with 2,700+ stars honoring entertainment industry legends along Hollywood Boulevard.",
      nameHe: "שדרת הכוכבים של הוליווד",
      descriptionHe: "מדרכה אייקונית עם למעלה מ-2,700 כוכבים המכבדים אגדות תעשיית הבידור לאורך שדרת הוליווד.",
      lat: "34.1016",
      lon: "-118.3267",
      rating: "4.3",
      tags: ["landmark", "entertainment", "cultural"]
    }
  ],
  "Luxor": [
    {
      name: "Karnak Temple",
      description: "Vast temple complex dedicated to Amun-Ra, featuring colossal columns and hieroglyphic inscriptions.",
      nameHe: "מקדש כרנק",
      descriptionHe: "מתחם מקדש עצום המוקדש לאמון-רא, המציג עמודים ענקיים וכתובות הירוגליפיות.",
      lat: "25.7188",
      lon: "32.6573",
      rating: "4.7",
      tags: ["temple", "ancient", "historic"]
    },
    {
      name: "Valley of the Kings",
      description: "Ancient burial site with 63 royal tombs including Tutankhamun's, adorned with elaborate murals.",
      nameHe: "עמק המלכים",
      descriptionHe: "אתר קבורה עתיק עם 63 קברים מלכותיים כולל של תותנקאמון, מעוטרים בציורי קיר משוכללים.",
      lat: "25.7402",
      lon: "32.6014",
      rating: "4.8",
      tags: ["ancient", "tomb", "historic"]
    },
    {
      name: "Luxor Temple",
      description: "Ancient Egyptian temple complex on Nile's east bank, beautifully illuminated at night.",
      nameHe: "מקדש לוקסור",
      descriptionHe: "מתחם מקדש מצרי עתיק בגדה המזרחית של הנילוס, מואר יפהפה בלילה.",
      lat: "25.6995",
      lon: "32.6391",
      rating: "4.7",
      tags: ["temple", "ancient", "historic"]
    }
  ],
  "Madrid": [
    {
      name: "Prado Museum",
      description: "World-class art museum with Spanish masterpieces by Velázquez, Goya, and El Greco.",
      nameHe: "מוזיאון הפראדו",
      descriptionHe: "מוזיאון אמנות ברמה עולמית עם יצירות מופת ספרדיות של ולאסקז, גויה ואל גרקו.",
      lat: "40.4138",
      lon: "-3.6922",
      rating: "4.7",
      tags: ["museum", "art", "cultural"]
    },
    {
      name: "Royal Palace of Madrid",
      description: "Official residence of Spanish Royal Family with 3,418 rooms, baroque architecture, and lavish interiors.",
      nameHe: "הארמון המלכותי של מדריד",
      descriptionHe: "המעון הרשמי של משפחת המלוכה הספרדית עם 3,418 חדרים, אדריכלות בארוקית ופנים מפוארים.",
      lat: "40.4180",
      lon: "-3.7140",
      rating: "4.6",
      tags: ["palace", "historic", "landmark"]
    },
    {
      name: "Retiro Park",
      description: "Historic 350-acre park with Crystal Palace, rowing lake, sculptures, and gardens.",
      nameHe: "פארק רטירו",
      descriptionHe: "פארק היסטורי בשטח 350 דונם עם ארמון הקריסטל, אגם חתירה, פסלים וגנים.",
      lat: "40.4153",
      lon: "-3.6844",
      rating: "4.7",
      tags: ["park", "nature", "recreation"]
    }
  ],
  "Manila": [
    {
      name: "Intramuros",
      description: "Historic walled city from Spanish colonial period with Fort Santiago, churches, and cobblestone streets.",
      nameHe: "אינטרמורוס",
      descriptionHe: "עיר מוקפת חומה היסטורית מהתקופה הקולוניאלית הספרדית עם מבצר סנטיאגו, כנסיות ורחובות מרוצפים.",
      lat: "14.5906",
      lon: "120.9753",
      rating: "4.5",
      tags: ["historic", "colonial", "fortification"]
    },
    {
      name: "Rizal Park",
      description: "Urban park and national shrine honoring national hero José Rizal with gardens and monuments.",
      nameHe: "פארק ריזל",
      descriptionHe: "פארק עירוני ומקדש לאומי המכבד את הגיבור הלאומי חוסה ריזל עם גנים ואנדרטאות.",
      lat: "14.5834",
      lon: "120.9785",
      rating: "4.4",
      tags: ["park", "historic", "memorial"]
    },
    {
      name: "Mall of Asia",
      description: "One of world's largest malls with shops, entertainment, ice rink, and Manila Bay sunset views.",
      nameHe: "קניון של אסיה",
      descriptionHe: "אחד הקניונים הגדולים בעולם עם חנויות, בידור, משטח החלקה ונופי שקיעה של מפרץ מנילה.",
      lat: "14.5357",
      lon: "120.9822",
      rating: "4.6",
      tags: ["mall", "shopping", "entertainment"]
    }
  ],
  "Marrakech": [
    {
      name: "Jemaa el-Fnaa",
      description: "Bustling main square with snake charmers, storytellers, food stalls, and vibrant street life.",
      nameHe: "ג'מאה אל-פנאע",
      descriptionHe: "כיכר ראשית סואנת עם מקסמי נחשים, מספרי סיפורים, דוכני אוכל וחיי רחוב תוססים.",
      lat: "31.6259",
      lon: "-7.9893",
      rating: "4.5",
      tags: ["square", "market", "cultural"]
    },
    {
      name: "Bahia Palace",
      description: "19th-century palace with ornate Islamic architecture, courtyards, and colorful zellige tilework.",
      nameHe: "ארמון בהייה",
      descriptionHe: "ארמון מהמאה ה-19 עם אדריכלות אסלאמית מעוטרת, חצרות ועבודת אריחי זליג' צבעוניים.",
      lat: "31.6213",
      lon: "-7.9832",
      rating: "4.4",
      tags: ["palace", "historic", "architecture"]
    },
    {
      name: "Majorelle Garden",
      description: "Botanical garden with vibrant blue villa, exotic plants, and designed by French artist Jacques Majorelle.",
      nameHe: "גן מז'ורל",
      descriptionHe: "גן בוטני עם וילה כחולה תוססת, צמחים אקזוטיים ועוצב על ידי האמן הצרפתי ז'אק מז'ורל.",
      lat: "31.6409",
      lon: "-8.0032",
      rating: "4.6",
      tags: ["garden", "art", "scenic"]
    }
  ],
  "Mauritius": [
    {
      name: "Le Morne Brabant",
      description: "UNESCO-listed mountain peninsula with hiking trails and stunning 360-degree ocean views.",
      nameHe: "לה מורן ברבנט",
      descriptionHe: "חצי אי הרים ברשימת אונסק\"ו עם שבילי טיול ונופי אוקיינוס מדהימים של 360 מעלות.",
      lat: "-20.4545",
      lon: "57.3184",
      rating: "4.7",
      tags: ["mountain", "unesco", "hiking"]
    },
    {
      name: "Chamarel Seven Colored Earths",
      description: "Unique geological formation with sand dunes in seven distinct colors created by volcanic activity.",
      nameHe: "שבע אדמות צבעוניות של שמאראל",
      descriptionHe: "תצורה גיאולוגית ייחודית עם דיונות חול בשבעה צבעים שונים שנוצרו מפעילות וולקנית.",
      lat: "-20.4242",
      lon: "57.3806",
      rating: "4.4",
      tags: ["nature", "geological", "scenic"]
    },
    {
      name: "Île aux Cerfs",
      description: "Paradise island off the east coast with white sand beaches, water sports, and turquoise lagoons.",
      nameHe: "אי או סרף",
      descriptionHe: "אי גן עדן מול החוף המזרחי עם חופי חול לבן, ספורט ימי ולגונות טורקיז.",
      lat: "-20.2786",
      lon: "57.7930",
      rating: "4.6",
      tags: ["island", "beach", "watersports"]
    }
  ],
  "Medellin": [
    {
      name: "Plaza Botero",
      description: "Public square featuring 23 sculptures by Fernando Botero, surrounded by museums and colonial buildings.",
      nameHe: "פלאסה בוטרו",
      descriptionHe: "כיכר ציבורית המציגה 23 פסלים של פרננדו בוטרו, מוקפת מוזיאונים ובניינים קולוניאליים.",
      lat: "6.2520",
      lon: "-75.5668",
      rating: "4.6",
      tags: ["square", "art", "cultural"]
    },
    {
      name: "Metrocable",
      description: "Cable car system connecting hillside communes with spectacular city views and social impact.",
      nameHe: "מטרוקייבל",
      descriptionHe: "מערכת רכבל המחברת קהילות גבעה עם נוף עיר מרהיב והשפעה חברתית.",
      lat: "6.2918",
      lon: "-75.5570",
      rating: "4.7",
      tags: ["cable car", "viewpoint", "transportation"]
    },
    {
      name: "Comuna 13",
      description: "Transformed neighborhood with vibrant street art, outdoor escalators, and powerful history of resilience.",
      nameHe: "קומונה 13",
      descriptionHe: "שכונה שעברה טרנספורמציה עם אמנות רחוב תוססת, מדרגות נעות חיצוניות והיסטוריה עוצמתית של חוסן.",
      lat: "6.2474",
      lon: "-75.5985",
      rating: "4.8",
      tags: ["neighborhood", "street art", "cultural"]
    }
  ],
  "Melbourne": [
    {
      name: "Federation Square",
      description: "Cultural precinct with museums, galleries, restaurants, and events on Yarra River.",
      nameHe: "כיכר הפדרציה",
      descriptionHe: "אזור תרבותי עם מוזיאונים, גלריות, מסעדות ואירועים על נהר יארה.",
      lat: "-37.8180",
      lon: "144.9692",
      rating: "4.4",
      tags: ["square", "cultural", "entertainment"]
    },
    {
      name: "Royal Botanic Gardens",
      description: "38-hectare garden with 8,500 plant species, ornamental lake, and stunning city skyline views.",
      nameHe: "הגנים הבוטניים המלכותיים",
      descriptionHe: "גן בשטח 38 הקטרים עם 8,500 מיני צמחים, אגם נוי ונוף מדהים של קו הרקיע של העיר.",
      lat: "-37.8304",
      lon: "144.9803",
      rating: "4.8",
      tags: ["garden", "nature", "scenic"]
    },
    {
      name: "Great Ocean Road",
      description: "Scenic coastal drive featuring the Twelve Apostles limestone stacks and stunning ocean views.",
      nameHe: "כביש האוקיינוס הגדול",
      descriptionHe: "נסיעה חופית ציורית המציגה את ערימות אבן הגיר של שנים עשר השליחים ונוף אוקיינוס מדהים.",
      lat: "-38.6857",
      lon: "143.1047",
      rating: "4.8",
      tags: ["coastal", "scenic", "nature"]
    }
  ],
  "Mexico City": [
    {
      name: "Zócalo",
      description: "One of world's largest public squares surrounded by Metropolitan Cathedral, National Palace, and Aztec ruins.",
      nameHe: "הזוקאלו",
      descriptionHe: "אחת הכיכרות הציבוריות הגדולות בעולם המוקפת בקתדרלה מטרופולינית, הארמון הלאומי והריסות אצטקיות.",
      lat: "19.4326",
      lon: "-99.1332",
      rating: "4.6",
      tags: ["square", "historic", "cultural"]
    },
    {
      name: "Frida Kahlo Museum",
      description: "Blue House where Frida Kahlo was born and died, showcasing her art, life, and Mexican culture.",
      nameHe: "מוזיאון פרידה קאלו",
      descriptionHe: "הבית הכחול שבו נולדה ומתה פרידה קאלו, המציג את האמנות, החיים והתרבות המקסיקנית שלה.",
      lat: "19.3551",
      lon: "-99.1625",
      rating: "4.6",
      tags: ["museum", "art", "cultural"]
    },
    {
      name: "Teotihuacan",
      description: "Ancient Mesoamerican city with Pyramid of the Sun and Moon, a UNESCO World Heritage site.",
      nameHe: "טאוטיהואקן",
      descriptionHe: "עיר מסו-אמריקנית עתיקה עם פירמידת השמש והירח, אתר מורשת עולמית של אונסק\"ו.",
      lat: "19.6925",
      lon: "-98.8438",
      rating: "4.7",
      tags: ["ancient", "pyramid", "unesco"]
    }
  ],
  "Miami": [
    {
      name: "South Beach",
      description: "Famous beach with Art Deco architecture, vibrant nightlife, and white sand stretching along Ocean Drive.",
      nameHe: "סאות' ביץ'",
      descriptionHe: "חוף מפורסם עם אדריכלות ארט דקו, חיי לילה תוססים וחול לבן הנמתח לאורך אושן דרייב.",
      lat: "25.7907",
      lon: "-80.1300",
      rating: "4.6",
      tags: ["beach", "nightlife", "architecture"]
    },
    {
      name: "Vizcaya Museum and Gardens",
      description: "Italian Renaissance-style villa with stunning gardens overlooking Biscayne Bay.",
      nameHe: "מוזיאון וגנים של ויזקאיה",
      descriptionHe: "וילה בסגנון רנסנס איטלקי עם גנים מדהימים המשקיפים על מפרץ ביסקיין.",
      lat: "25.7444",
      lon: "-80.2106",
      rating: "4.7",
      tags: ["museum", "garden", "historic"]
    },
    {
      name: "Wynwood Walls",
      description: "Outdoor museum showcasing colorful street art and murals by international artists.",
      nameHe: "קירות וינווד",
      descriptionHe: "מוזיאון חיצוני המציג אמנות רחוב צבעונית וציורי קיר של אמנים בינלאומיים.",
      lat: "25.8010",
      lon: "-80.1995",
      rating: "4.5",
      tags: ["art", "street art", "cultural"]
    }
  ],
  "Milan": [
    {
      name: "Milan Cathedral (Duomo)",
      description: "Gothic cathedral with intricate facade, rooftop terraces offering city views, and 135 spires.",
      nameHe: "קתדרלת מילאנו (דואומו)",
      descriptionHe: "קתדרלה גותית עם חזית מורכבת, מרפסות גג המציעות נוף לעיר ו-135 צריחים.",
      lat: "45.4642",
      lon: "9.1900",
      rating: "4.7",
      tags: ["cathedral", "gothic", "landmark"]
    },
    {
      name: "Galleria Vittorio Emanuele II",
      description: "Historic shopping arcade with glass dome, luxury boutiques, and cafes connecting Duomo to La Scala.",
      nameHe: "גלריה ויטוריו עמנואל השני",
      descriptionHe: "גלריית קניות היסטורית עם כיפת זכוכית, בוטיקים יוקרתיים ובתי קפה המחברים את הדואומו לה סקאלה.",
      lat: "45.4654",
      lon: "9.1897",
      rating: "4.7",
      tags: ["shopping", "historic", "architecture"]
    },
    {
      name: "The Last Supper",
      description: "Leonardo da Vinci's masterpiece mural in Santa Maria delle Grazie convent.",
      nameHe: "הסעודה האחרונה",
      descriptionHe: "ציור הקיר של לאונרדו דה וינצ'י במנזר סנטה מריה דלה גרציה.",
      lat: "45.4658",
      lon: "9.1708",
      rating: "4.8",
      tags: ["art", "historic", "unesco"]
    }
  ],
  "Montego Bay": [
    {
      name: "Doctor's Cave Beach",
      description: "Famous white sand beach with crystal-clear turquoise waters and beach club amenities.",
      nameHe: "חוף מערת הדוקטור",
      descriptionHe: "חוף חול לבן מפורסם עם מים טורקיז צלולים ושירותי מועדון חוף.",
      lat: "18.4805",
      lon: "-77.9377",
      rating: "4.5",
      tags: ["beach", "swimming", "resort"]
    },
    {
      name: "Martha Brae River",
      description: "Scenic river offering bamboo rafting tours through lush tropical landscape.",
      nameHe: "נהר מרתה בריי",
      descriptionHe: "נהר ציורי המציע סיורי רפסודות במבוק דרך נוף טרופי עבות.",
      lat: "18.4833",
      lon: "-77.6667",
      rating: "4.6",
      tags: ["river", "nature", "rafting"]
    },
    {
      name: "Rose Hall Great House",
      description: "Restored Georgian plantation house with legends of the White Witch and colonial history.",
      nameHe: "הבית הגדול של רוז הול",
      descriptionHe: "בית מטע גאורגי משוחזר עם אגדות על המכשפה הלבנה והיסטוריה קולוניאלית.",
      lat: "18.5045",
      lon: "-77.8862",
      rating: "4.4",
      tags: ["historic", "colonial", "cultural"]
    }
  ],
  "Montevideo": [
    {
      name: "Ciudad Vieja",
      description: "Historic old town with colonial architecture, museums, theaters, and bustling port market.",
      nameHe: "סיודד וייחה",
      descriptionHe: "עיר עתיקה היסטורית עם אדריכלות קולוניאלית, מוזיאונים, תיאטראות ושוק נמל סואן.",
      lat: "-34.9071",
      lon: "-56.2084",
      rating: "4.5",
      tags: ["historic", "colonial", "neighborhood"]
    },
    {
      name: "Rambla of Montevideo",
      description: "22km waterfront promenade perfect for walking, cycling, and enjoying Rio de la Plata views.",
      nameHe: "רמבלה של מונטווידאו",
      descriptionHe: "טיילת חוף באורך 22 ק\"מ מושלמת להליכה, רכיבה על אופניים ונופים של ריו דה לה פלטה.",
      lat: "-34.9011",
      lon: "-56.1645",
      rating: "4.7",
      tags: ["promenade", "waterfront", "scenic"]
    },
    {
      name: "Mercado del Puerto",
      description: "Historic market hall with traditional parrillas grilling meat and lively atmosphere.",
      nameHe: "מרקדו דל פוארטו",
      descriptionHe: "אולם שוק היסטורי עם פארייאס מסורתיות הצולות בשר ואווירה תוססת.",
      lat: "-34.9053",
      lon: "-56.2140",
      rating: "4.5",
      tags: ["market", "food", "cultural"]
    }
  ],
  "Montreal": [
    {
      name: "Old Montreal",
      description: "Historic district with cobblestone streets, Notre-Dame Basilica, and charming European atmosphere.",
      nameHe: "מונטריאול העתיקה",
      descriptionHe: "רובע היסטורי עם רחובות מרוצפים, בזיליקת נוטרדאם ואווירה אירופית מקסימה.",
      lat: "45.5077",
      lon: "-73.5540",
      rating: "4.6",
      tags: ["historic", "neighborhood", "architecture"]
    },
    {
      name: "Mount Royal",
      description: "Large park with hiking trails, viewpoint offering panoramic city views, and Beaver Lake.",
      nameHe: "הר רויאל",
      descriptionHe: "פארק גדול עם שבילי טיול, נקודת תצפית המציעה נוף פנורמי של העיר ואגם ביבר.",
      lat: "45.5088",
      lon: "-73.5878",
      rating: "4.7",
      tags: ["mountain", "park", "viewpoint"]
    },
    {
      name: "Notre-Dame Basilica",
      description: "Gothic Revival church with stunning blue interior, intricate woodwork, and spectacular light shows.",
      nameHe: "בזיליקת נוטרדאם",
      descriptionHe: "כנסייה בסגנון תחייה גותית עם פנים כחול מדהים, עבודות עץ מורכבות ומופעי אור מרהיבים.",
      lat: "45.5045",
      lon: "-73.5561",
      rating: "4.7",
      tags: ["church", "historic", "landmark"]
    }
  ],
  "Moscow": [
    {
      name: "Red Square",
      description: "Iconic square with St. Basil's Cathedral, Lenin's Mausoleum, and Kremlin walls.",
      nameHe: "הכיכר האדומה",
      descriptionHe: "כיכר אייקונית עם קתדרלת סנט באזיל, מאוזוליאום לנין וחומות הקרמלין.",
      lat: "55.7539",
      lon: "37.6208",
      rating: "4.8",
      tags: ["square", "historic", "landmark"]
    },
    {
      name: "The Kremlin",
      description: "Fortified complex with palaces, cathedrals, and government buildings, symbol of Russian power.",
      nameHe: "הקרמלין",
      descriptionHe: "מתחם מבוצר עם ארמונות, קתדרלות ובניינים ממשלתיים, סמל הכוח הרוסי.",
      lat: "55.7520",
      lon: "37.6175",
      rating: "4.7",
      tags: ["fortress", "historic", "government"]
    },
    {
      name: "St. Basil's Cathedral",
      description: "Colorful 16th-century cathedral with distinctive onion domes, Russia's most recognizable landmark.",
      nameHe: "קתדרלת סנט באזיל",
      descriptionHe: "קתדרלה צבעונית מהמאה ה-16 עם כיפות בצל מיוחדות, נקודת הציון המזוהה ביותר של רוסיה.",
      lat: "55.7525",
      lon: "37.6231",
      rating: "4.8",
      tags: ["cathedral", "historic", "landmark"]
    }
  ],
  "Mumbai": [
    {
      name: "Gateway of India",
      description: "Iconic arch monument built during British Raj, overlooking Mumbai Harbor and popular gathering spot.",
      nameHe: "שער הודו",
      descriptionHe: "אנדרטת קשת אייקונית שנבנתה בתקופת השלטון הבריטי, משקיפה על נמל מומבאי ונקודת מפגש פופולרית.",
      lat: "18.9220",
      lon: "72.8347",
      rating: "4.5",
      tags: ["monument", "historic", "landmark"]
    },
    {
      name: "Marine Drive",
      description: "Scenic 3km promenade along Arabian Sea, perfect for sunset walks and people-watching.",
      nameHe: "מרין דרייב",
      descriptionHe: "טיילת ציורית באורך 3 ק\"מ לאורך הים הערבי, מושלמת לטיולי שקיעה וצפייה באנשים.",
      lat: "18.9432",
      lon: "72.8236",
      rating: "4.6",
      tags: ["promenade", "beach", "scenic"]
    },
    {
      name: "Chhatrapati Shivaji Terminus",
      description: "UNESCO-listed Victorian Gothic railway station, an architectural masterpiece and busy transport hub.",
      nameHe: "תחנת צ'הטרפאטי שיוואג'י",
      descriptionHe: "תחנת רכבת ויקטוריאנית גותית ברשימת אונסק\"ו, יצירת מופת אדריכלית ומרכז תחבורה עמוס.",
      lat: "18.9400",
      lon: "72.8350",
      rating: "4.5",
      tags: ["architecture", "unesco", "historic"]
    }
  ],
  "Munich": [
    {
      name: "Marienplatz",
      description: "Central square with New Town Hall's Glockenspiel, historic buildings, and vibrant atmosphere.",
      nameHe: "מריאנפלאץ",
      descriptionHe: "כיכר מרכזית עם הגלוקנשפיל של עיריית העיר החדשה, בניינים היסטוריים ואווירה תוססת.",
      lat: "48.1374",
      lon: "11.5755",
      rating: "4.6",
      tags: ["square", "historic", "landmark"]
    },
    {
      name: "Neuschwanstein Castle",
      description: "Fairy-tale castle that inspired Disney, perched on rugged hill with stunning Alpine views.",
      nameHe: "טירת נוישוונשטיין",
      descriptionHe: "טירת אגדות שהשפיעה על דיסני, יושבת על גבעה מחוספסת עם נופי האלפים מדהימים.",
      lat: "47.5576",
      lon: "10.7498",
      rating: "4.7",
      tags: ["castle", "landmark", "scenic"]
    },
    {
      name: "English Garden",
      description: "One of world's largest urban parks with beer gardens, surfing river wave, and Japanese tea house.",
      nameHe: "הגן האנגלי",
      descriptionHe: "אחד הפארקים העירוניים הגדולים בעולם עם גני בירה, גל גלישה בנהר ובית תה יפני.",
      lat: "48.1640",
      lon: "11.6050",
      rating: "4.7",
      tags: ["park", "nature", "recreation"]
    }
  ],
  "Nairobi": [
    {
      name: "Nairobi National Park",
      description: "Unique wildlife park within city limits, home to lions, rhinos, giraffes with Nairobi skyline backdrop.",
      nameHe: "הפארק הלאומי ניירובי",
      descriptionHe: "פארק חיות בר ייחודי בתחומי העיר, ביתם של אריות, קרנפים וג'ירפות עם רקע קו הרקיע של ניירובי.",
      lat: "-1.3733",
      lon: "36.8582",
      rating: "4.5",
      tags: ["wildlife", "nature", "safari"]
    }
  ]
};