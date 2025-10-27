import { db } from "./db";
import { destinations, destinationsI18n } from "@shared/schema";
import { eq } from "drizzle-orm";

// Enhanced descriptions for all 101 destinations
const destinationDescriptions: Record<string, { en: string; he: string }> = {
  // Europe
  "Paris": {
    en: "The City of Light captivates visitors with its timeless elegance, world-renowned museums like the Louvre and Musée d'Orsay, iconic landmarks including the Eiffel Tower and Notre-Dame, charming cafés, haute couture fashion, and exquisite French cuisine. Stroll along the Seine, explore Montmartre's artistic heritage, and immerse yourself in centuries of art, culture, and romance.",
    he: "עיר האורות מרתקת את המבקרים באלגנטיות נצחית, מוזיאונים מפורסמים כמו הלובר ומוזה ד'אורסה, ציוני דרך איקוניים כולל מגדל אייפל ונוטרדאם, בתי קפה מקסימים, אופנת אוט קוטור ומטבח צרפתי משובח. טיילו לאורך הסיין, חקרו את המורשת האמנותית של מונמארטר והשתקעו במאות שנים של אמנות, תרבות ורומנטיקה."
  },
  "London": {
    en: "A vibrant metropolis blending royal heritage with cutting-edge modernity. From Buckingham Palace and the Tower of London to world-class theaters in the West End, diverse neighborhoods like Camden and Notting Hill, and multicultural cuisine from every corner of the globe. Experience British history, contemporary art at Tate Modern, and the energy of one of the world's most dynamic cities.",
    he: "מטרופולין תוסס המשלב מורשת מלכותית עם מודרניות חדשנית. מארמון בקינגהאם ומגדל לונדון ועד תיאטראות ברמה עולמית בווסט אנד, שכונות מגוונות כמו קמדן ונוטינג היל ומטבח רב-תרבותי מכל קצוות העולם. חוו היסטוריה בריטית, אמנות עכשווית בטייט מודרן והאנרגיה של אחת הערים הדינמיות ביותר בעולם."
  },
  "Rome": {
    en: "The Eternal City is an open-air museum showcasing 3,000 years of history. Walk through the ancient Colosseum and Roman Forum, toss a coin in the Trevi Fountain, marvel at Michelangelo's Sistine Chapel, and savor authentic pasta and gelato. Every cobblestone street tells a story of emperors, artists, and the birth of Western civilization.",
    he: "העיר הנצחית היא מוזיאון תחת כיפת השמיים המציג 3,000 שנות היסטוריה. טיילו בקולוסיאום העתיק ובפורום הרומי, זרקו מטבע למזרקת טרווי, הישאו מול קפלת הסיסטינה של מיכלאנג'לו וטעמו פסטה אותנטית וג'לטו. כל אבן רצף מספרת סיפור של קיסרים, אמנים ולידת הציוויליזציה המערבית."
  },
  "Barcelona": {
    en: "Gaudí's architectural masterpieces, including the breathtaking Sagrada Família and whimsical Park Güell, define this Mediterranean jewel. Wander through Gothic Quarter's narrow lanes, relax on golden beaches, experience vibrant nightlife, and indulge in tapas and Catalan cuisine. Barcelona perfectly balances artistic innovation with beachside relaxation and passionate Spanish culture.",
    he: "יצירות המופת האדריכליות של גאודי, כולל הסגרדה פמיליה עוצרת הנשימה ופארק גואל הגחמני, מגדירות את פנינת הים התיכון הזו. טיילו בסמטאות הצרות של הרובע הגותי, הירגעו על חופים זהובים, חוו חיי לילה תוססים והתמכרו לטאפאס ולמטבח הקטלוני. ברצלונה מאזנת באופן מושלם חדשנות אמנותית עם הרפיה חופית ותרבות ספרדית נלהבת."
  },
  "Amsterdam": {
    en: "Picturesque canals, world-class museums like the Rijksmuseum and Van Gogh Museum, historic canal houses, vibrant cycling culture, and a progressive spirit define this Dutch capital. Explore the Anne Frank House, admire tulips at Keukenhof, cruise the waterways, and experience the unique blend of history, art, and liberal values.",
    he: "תעלות ציוריות, מוזיאונים ברמה עולמית כמו הרייקסמוזיאום ומוזיאון ואן גוך, בתי תעלה היסטוריים, תרבות רכיבה על אופניים תוססת ורוח פרוגרסיבית מגדירים את בירת הולנד. חקרו את בית אנה פרנק, התפעלו מהצבעונים בקוקנהוף, שוטו במסלולי המים וחוו את השילוב הייחודי של היסטוריה, אמנות וערכים ליברליים."
  },
  "Berlin": {
    en: "A city reborn from its divided past, Berlin pulses with creative energy, street art, avant-garde galleries, legendary nightlife, and powerful historical sites. Walk along remnants of the Berlin Wall, visit moving Holocaust memorials, explore trendy neighborhoods like Kreuzberg and Friedrichshain, and witness a city that has transformed itself into Europe's coolest cultural capital.",
    he: "עיר שנולדה מחדש מעברה המחולק, ברלין פועמת באנרגיה יצירתית, אמנות רחוב, גלריות אוונגרדיות, חיי לילה אגדיים ואתרים היסטוריים חזקים. טיילו לאורך שרידי חומת ברלין, בקרו באנדרטאות השואה מרגשות, חקרו שכונות טרנדיות כמו קרויצברג ופרידריכסהיין והיו עדים לעיר שהפכה את עצמה לבירת התרבות הכי מגניבה באירופה."
  },
  "Prague": {
    en: "Medieval charm meets fairytale beauty in this Central European gem. The astronomical clock in Old Town Square, Prague Castle overlooking the Vltava River, Charles Bridge adorned with baroque statues, and Gothic spires create an enchanting atmosphere. Enjoy Czech beer culture, classical concerts, and a city that seems frozen in time.",
    he: "קסם מימי הביניים פוגש יופי אגדי בפנינה מרכז אירופית זו. השעון האסטרונומי בכיכר העיר העתיקה, טירת פראג המשקיפה על נהר הוולטבה, גשר קרל המעוטר בפסלים בארוקיים וצריחים גותיים יוצרים אווירה קסומה. תהנו מתרבות הבירה הצ'כית, קונצרטים קלאסיים ועיר שנראית קפואה בזמן."
  },
  "Vienna": {
    en: "Imperial palaces, coffeehouses, and musical heritage define Austria's elegant capital. Tour the opulent Schönbrunn Palace, attend a performance at the State Opera, visit museums housing works by Klimt and Schiele, and indulge in Sachertorte and Wiener schnitzel. Vienna embodies Central European sophistication and classical grandeur.",
    he: "ארמונות קיסריים, בתי קפה ומורשת מוזיקלית מגדירים את בירת אוסטריה האלגנטית. סיירו בארמון שנברון המפואר, השתתפו בהופעה באופרה הממלכתית, בקרו במוזיאונים המכילים יצירות של קלימט ושילה והתמכרו לזכטורטה ולשניצל וינאי. וינה מגלמת תחכום מרכז אירופי ופאר קלאסי."
  },
  "Budapest": {
    en: "Thermal baths, stunning Danube riverfront, ruin bars, and architectural splendor from the Austro-Hungarian Empire make Budapest unforgettable. Soak in Széchenyi Baths, explore Buda Castle, walk across Chain Bridge, and enjoy hearty Hungarian cuisine with paprika-spiced goulash. The 'Paris of the East' offers grand boulevards and historic charm at accessible prices.",
    he: "מרחצאות תרמליים, חוף נהר הדנובה מהמם, ברים הריסות ופאר אדריכלי מהאימפריה האוסטרו-הונגרית הופכים את בודפשט לבלתי נשכחת. השרו במרחצאות סצ'ני, חקרו את טירת בודה, טיילו על גשר השרשרת ותהנו ממטבח הונגרי דשן עם גולאש מתובל בפפריקה. 'פריז של המזרח' מציעה שדרות מפוארות וקסם היסטורי במחירים נגישים."
  },
  "Istanbul": {
    en: "Where East meets West, Istanbul straddles two continents with Byzantine churches, Ottoman mosques, bustling bazaars, and Bosphorus views. Marvel at Hagia Sophia and the Blue Mosque, shop in the Grand Bazaar, cruise between Europe and Asia, and savor Turkish delights, kebabs, and strong tea. A city of empires, cultures, and timeless allure.",
    he: "היכן שמזרח פוגש מערב, איסטנבול משתרעת על שתי יבשות עם כנסיות ביזנטיות, מסגדים עות'מאניים, שווקים סוערים ונופי הבוספורוס. הישאו מהאיה סופיה והמסגד הכחול, קנו בגרנד בזאר, שוטו בין אירופה לאסיה וטעמו מעדני טורקי, קבב ותה חזק. עיר של אימפריות, תרבויות וקסם נצחי."
  },
  "Athens": {
    en: "The cradle of Western civilization and democracy, Athens boasts the iconic Acropolis and Parthenon, ancient agora, world-class archaeological museums, and vibrant neighborhoods like Plaka. Explore 2,500 years of history, enjoy Greek tavernas serving moussaka and souvlaki, and soak in Mediterranean sunshine in this historic capital.",
    he: "ערש הציוויליזציה המערבית והדמוקרטיה, אתונה מתגאה באקרופוליס האיקוני ובפרתנון, האגורה העתיקה, מוזיאונים ארכיאולוגיים ברמה עולמית ושכונות תוססות כמו פלאקה. חקרו 2,500 שנות היסטוריה, תהנו מטברנות יווניות המגישות מוסקה וסובלקי והשתזפו בשמש הים התיכונית בבירה היסטורית זו."
  },
  "Lisbon": {
    en: "Portugal's hilly coastal capital enchants with colorful azulejo tiles, vintage trams, Fado music, delicious pastéis de nata, and stunning Tagus River views. Explore Alfama's winding streets, visit the Belém Tower, ride tram 28, and enjoy fresh seafood. Lisbon combines old-world charm with a vibrant contemporary culture at Europe's western edge.",
    he: "הבירה החופית הגבעתית של פורטוגל מקסימה באריחי אזולז'ו צבעוניים, חשמליות וינטג', מוזיקת פאדו, פסטל דה נאטה טעימים ונופי נהר הטאגוס מהממים. חקרו את הרחובות המפותלים של אלפמה, בקרו במגדל בלם, רכבו בחשמלית 28 ותהנו ממאכלי ים טריים. ליסבון משלבת קסם עולם ישן עם תרבות עכשווית תוססת בקצה המערבי של אירופה."
  },
  "Madrid": {
    en: "Spain's passionate capital dazzles with world-famous art museums (Prado, Reina Sofía), grand plazas, lively tapas bars, flamenco shows, and an infectious energy that keeps the city awake until dawn. Stroll through Retiro Park, watch Real Madrid play, and experience the essence of Spanish culture, cuisine, and nightlife.",
    he: "בירת ספרד הנלהבת מסנוורת במוזיאוני אמנות מפורסמים (פראדו, ריינה סופיה), כיכרות מפוארות, ברי טאפאס תוססים, מופעי פלמנקו ואנרגיה מדבקת ששומרת על העיר ערה עד עלות השחר. טיילו בפארק רטירו, צפו בריאל מדריד משחקת וחוו את מהות התרבות, המטבח וחיי הלילה הספרדיים."
  },
  "Venice": {
    en: "A floating masterpiece of canals, gondolas, and palazzos, Venice is unlike anywhere else on Earth. Glide through waterways, marvel at St. Mark's Basilica, get lost in charming alleyways, and experience the magic of a car-free city built on lagoons. From Carnevale masks to Venetian glass, this romantic city is pure enchantment.",
    he: "יצירת מופת צפה של תעלות, גונדולות וארמונות, ונציה אינה דומה לשום מקום אחר על פני כדור הארץ. גלשו במסלולי מים, הישאו מבזיליקת סן מרקו, תעו בסמטאות מקסימות וחוו את הקסם של עיר נטולת מכוניות הבנויה על לגונות. ממסכות קרנבל ועד זכוכית ונציאנית, עיר רומנטית זו היא קסם טהור."
  },
  "Florence": {
    en: "The birthplace of the Renaissance overflows with artistic treasures. Michelangelo's David, Brunelleschi's Duomo, the Uffizi Gallery, and Ponte Vecchio showcase unparalleled beauty. Wander cobblestone streets, sample Tuscan wines and bistecca alla fiorentina, and immerse yourself in the city that gave the world Leonardo, Botticelli, and Dante.",
    he: "מקום הולדתו של הרנסנס שופע אוצרות אמנותיים. הדוד של מיכלאנג'לו, הדואומו של ברונלסקי, גלריית אופיצי ופונטה וקיו מציגים יופי שאין שני לו. טיילו ברחובות אבן משתלבת, טעמו יינות טוסקניים וביסטקה אלה פיורנטינה והשקיעו בעיר שהעניקה לעולם את ליאונרדו, בוטיצ'לי ודנטה."
  },
  "Milan": {
    en: "Italy's fashion and finance capital blends high-end shopping in the Galleria Vittorio Emanuele II with Leonardo da Vinci's Last Supper, the stunning Gothic Duomo, and world-class opera at La Scala. Milan is sleek, sophisticated, and stylish—a modern Italian city with deep historical roots and cutting-edge design.",
    he: "בירת האופנה והפיננסים של איטליה משלבת קניות יוקרה בגלריה ויטוריו עמנואלה השני עם הסעודה האחרונה של לאונרדו דה וינצ'י, הדואומו הגותי המהמם ואופרה ברמה עולמית בלה סקאלה. מילאנו היא חלקה, מתוחכמת ומסוגננת - עיר איטלקית מודרנית עם שורשים היסטוריים עמוקים ועיצוב חדשני."
  },
  "Dubrovnik": {
    en: "The 'Pearl of the Adriatic' mesmerizes with medieval walls encircling a perfectly preserved Old Town, marble streets, baroque buildings, and sparkling azure waters. Walk the city walls at sunset, explore Game of Thrones filming locations, take a cable car for panoramic views, and enjoy fresh seafood by the harbor.",
    he: "פנינת האדריאטי' מהפנטת עם חומות מימי הביניים המקיפות עיר עתיקה משומרת לחלוטין, רחובות שיש, בניינים בארוקיים ומים תכלת נוצצים. טיילו על חומות העיר עם השקיעה, חקרו מקומות צילום של משחקי הכס, קחו רכבל לנופים פנורמיים ותהנו ממאכלי ים טריים ליד הנמל."
  },
  "Santorini": {
    en: "Iconic white-washed buildings with blue domes perch on dramatic volcanic cliffs overlooking the caldera. Santorini offers spectacular sunsets in Oia, unique black sand beaches, excellent wines from volcanic soil, ancient ruins at Akrotiri, and romantic ambiance. This Greek island paradise is a photographer's dream and honeymooner's haven.",
    he: "בניינים מלובנים איקוניים עם כיפות כחולות יושבים על צוקי הר געש דרמטיים המשקיפים על הקלדרה. סנטוריני מציעה שקיעות מרהיבות באויה, חופי חול שחור ייחודיים, יינות מעולים מאדמת וולקנית, חורבות עתיקות באקרוטירי ואווירה רומנטית. גן עדן יווני זה הוא חלום של צלם ומקלט לזוגות טריים."
  },
  "Mykonos": {
    en: "Famous for whitewashed windmills, vibrant nightlife, pristine beaches, and cosmopolitan atmosphere, Mykonos attracts jet-setters and party lovers alike. Dance at beach clubs, explore Little Venice, wander through maze-like streets of Chora, and enjoy fresh Greek cuisine. This Cycladic island perfectly balances Aegean beauty with international glamour.",
    he: "מפורסמת בטחנות רוח מלובנות, חיי לילה תוססים, חופים בתוליים ואווירה קוסמופוליטית, מיקונוס מושכת אנשי עילית ואוהבי מסיבות כאחד. רקדו במועדוני חוף, חקרו את ונציה הקטנה, נדדו ברחובות דמויי מבוך של חורה ותהנו ממטבח יווני טרי. האי הקיקלדי הזה מאזן באופן מושלם יופי אגאי עם זוהר בינלאומי."
  },
  "Zurich": {
    en: "Switzerland's largest city combines pristine lakeside beauty, medieval Old Town, world-class banking, luxury shopping on Bahnhofstrasse, and stunning Alpine views. Enjoy Swiss chocolate, precision watches, excellent museums, and efficient public transport. Zurich is clean, safe, and sophisticated—epitomizing Swiss quality of life.",
    he: "העיר הגדולה ביותר של שוויץ משלבת יופי חופי אגם בתולי, עיר עתיקה מימי הביניים, בנקאות ברמה עולמית, קניות יוקרה בבאנהופשטראסה ונופי אלפים מהממים. תהנו משוקולד שוויצרי, שעונים מדויקים, מוזיאונים מצוינים ותחבורה ציבורית יעילה. ציריך היא נקייה, בטוחה ומתוחכמת - מגלמת איכות חיים שוויצרית."
  },
  "Stockholm": {
    en: "Built on 14 islands connected by bridges, Sweden's capital showcases Scandinavian design, the historic Gamla Stan (Old Town), the Vasa Museum, ABBA Museum, and progressive urban planning. Experience long summer days, cozy winter hygge, innovative cuisine, and a city that seamlessly blends nature with modernity.",
    he: "נבנתה על 14 איים המחוברים בגשרים, בירת שבדיה מציגה עיצוב סקנדינבי, גמלה סטן ההיסטורית (העיר העתיקה), מוזיאון וסה, מוזיאון ABBA ותכנון עירוני פרוגרסיבי. חוו ימי קיץ ארוכים, הוגה חורפית נעימה, מטבח חדשני ועיר המשלבת בצורה חלקה טבע עם מודרניות."
  },
  "Copenhagen": {
    en: "Denmark's bicycle-friendly capital delights with Tivoli Gardens, colorful Nyhavn harbor, The Little Mermaid statue, innovative Nordic cuisine, and hygge-inspired cozy cafés. Visit design shops, tour Christiania's alternative community, enjoy sustainable living practices, and experience one of the world's happiest cities.",
    he: "בירת דנמרק הידידותית לרוכבי אופניים מענגת עם גני טיבולי, נמל ניהאבן הצבעוני, פסל הבתולה הקטנה, מטבח נורדי חדשני ובתי קפה נעימים בהשראת הוגה. בקרו בחנויות עיצוב, סיירו בקהילה האלטרנטיבית של כריסטיאניה, תהנו משיטות חיים בר-קיימא וחוו את אחת הערים המאושרות בעולם."
  },
  "Reykjavik": {
    en: "Iceland's colorful capital is the gateway to otherworldly landscapes. Experience the Blue Lagoon, Northern Lights, midnight sun, geothermal pools, and vibrant nightlife despite its small size. Reykjavik offers unique Nordic culture, fresh seafood, and access to glaciers, waterfalls, and volcanic terrain just beyond the city limits.",
    he: "בירתה הצבעונית של איסלנד היא שער לנופים עולמיים אחרים. חוו את הלגונה הכחולה, הזוהר הצפוני, שמש חצות, בריכות גיאותרמיות וחיי לילה תוססים למרות גודלה הקטן. רייקיאוויק מציעה תרבות נורדית ייחודית, מאכלי ים טריים וגישה לקרחונים, מפלים ושטח וולקני ממש מעבר לגבולות העיר."
  },
  "Edinburgh": {
    en: "Scotland's historic capital captivates with its medieval Old Town, Georgian New Town, imposing Edinburgh Castle, Royal Mile, and dramatic volcanic Arthur's Seat. Experience the world's largest arts festival in August, explore Harry Potter connections, enjoy whisky tastings, and immerse yourself in Scottish heritage and bagpipe melodies.",
    he: "בירת סקוטלנד ההיסטורית שובה לב עם העיר העתיקה מימי הביניים, העיר החדשה הגאורגית, טירת אדינבורו המרשימה, הרויאל מייל ומושב ארתור הוולקני הדרמטי. חוו את פסטיבל האמנויות הגדול בעולם באוגוסט, חקרו קשרים של הארי פוטר, תהנו מטעימות וויסקי והשקיעו במורשת הסקוטית ובמנגינות חלילי-חמת."
  },
  "Dublin": {
    en: "Ireland's literary capital brims with pub culture, Georgian architecture, Trinity College's Book of Kells, Guinness Storehouse, and warm Irish hospitality. Walk in the footsteps of Joyce and Wilde, enjoy traditional music sessions, explore Temple Bar, and experience the craic (fun) that makes Dublin endlessly charming.",
    he: "בירת הספרות של אירלנד גדושה בתרבות פאבים, אדריכלות גאורגית, ספר קלס של טריניטי קולג', מחסן גינס והכנסת אורחים אירית חמה. צעדו בעקבות ג'ויס ווילד, תהנו ממופעי מוזיקה מסורתיים, חקרו את טמפל בר וחוו את ה-craic (הכיף) שהופך את דבלין למקסימה עד אין סוף."
  },
  "Brussels": {
    en: "Belgium's capital and EU headquarters combines Grand Place's gilded splendor, Art Nouveau architecture, world-famous chocolates, hundreds of beer varieties, crispy frites, and the quirky Manneken Pis statue. Brussels is multilingual, multicultural, and surprisingly charming with comic strip murals and cozy Belgian taverns.",
    he: "בירת בלגיה ומטה האיחוד האירופי משלבת את הפאר המוזהב של גראנד פלאס, אדריכלות ארט נובו, שוקולדים מפורסמים, מאות זני בירה, צ'יפס פריך ופסל המנקן פיס המשונה. בריסל היא רב-לשונית, רב-תרבותית ומקסימה באופן מפתיע עם ציורי קיר של רצועות קומיקס וטברנות בלגיות נעימות."
  },
  "Oslo": {
    en: "Norway's capital nestles between fjords and forests, offering the Viking Ship Museum, Vigeland Sculpture Park, modern Opera House, and Nobel Peace Center. Experience Scandinavian quality of life, outdoor activities year-round, progressive values, and a city that balances urban sophistication with pristine nature.",
    he: "בירת נורווגיה שוכנת בין פיורדים ויערות, ומציעה את מוזיאון ספינות הוויקינגים, פארק הפסלים של ויגלנד, בית האופרה המודרני ומרכז פרס נובל לשלום. חוו איכות חיים סקנדינבית, פעילויות חוצות לאורך כל השנה, ערכים פרוגרסיביים ועיר המאזנת תחכום עירוני עם טבע בתולי."
  },
  "Helsinki": {
    en: "Finland's capital on the Baltic Sea showcases Scandinavian design, the fortress island of Suomenlinna, neoclassical Senate Square, saunas, and innovative architecture. Experience long summer white nights, cozy winter darkness, Nordic cuisine, and a city that embraces technology, nature, and quality design in equal measure.",
    he: "בירת פינלנד על הים הבלטי מציגה עיצוב סקנדינבי, אי המבצר סואומנלינה, כיכר הסנאט הניאו-קלאסית, סאונות ואדריכלות חדשנית. חוו לילות לבנים ארוכים בקיץ, חושך חורפי נעים, מטבח נורדי ועיר המאמצת טכנולוגיה, טבע ועיצוב איכותי במידה שווה."
  },
  "Krakow": {
    en: "Poland's former royal capital enchants with its medieval market square, Wawel Castle, Jewish Quarter (Kazimierz), and sobering proximity to Auschwitz. Explore Gothic churches, underground salt mines at Wieliczka, vibrant café culture, and a city that preserves both tragic history and joyful resilience.",
    he: "הבירה המלכותית לשעבר של פולין מקסימה עם כיכר השוק מימי הביניים, טירת ואוול, הרובע היהודי (קזימיר) והקרבה המפוכחת לאושוויץ. חקרו כנסיות גותיות, מכרות מלח תת-קרקעיים בוויאליצ'קה, תרבות בתי קפה תוססת ועיר המשמרת גם היסטוריה טראגית וגם חוסן עליז."
  },
  "New York": {
    en: "The city that never sleeps pulses with unmatched energy, iconic skyline, Broadway theaters, world-class museums (MoMA, Met), Central Park, diverse neighborhoods from SoHo to Harlem, and cuisine from every nation. Experience Times Square, the Statue of Liberty, Brooklyn Bridge, and the cultural melting pot that defines American urban life.",
    he: "העיר שאינה ישנה פועמת באנרגיה שאין שני לה, קו רקיע איקוני, תיאטראות ברודווי, מוזיאונים ברמה עולמית (MoMA, Met), סנטרל פארק, שכונות מגוונות מסוהו להארלם ומטבח מכל אומה. חוו את טיימס סקוור, פסל החירות, גשר ברוקלין וכור ההיתוך התרבותי שמגדיר את החיים העירוניים האמריקאים."
  },
  "Los Angeles": {
    en: "The entertainment capital of the world offers Hollywood glamour, beautiful beaches from Malibu to Venice, diverse neighborhoods, celebrity culture, year-round sunshine, and a sprawling urban landscape. Tour movie studios, hike to the Hollywood Sign, stroll down Rodeo Drive, and experience the creativity that drives global pop culture.",
    he: "בירת הבידור של העולם מציעה זוהר הוליוודי, חופים יפים ממליבו לונציה, שכונות מגוונות, תרבות סלבריטאים, שמש לאורך כל השנה ונוף עירוני מתפשט. סיירו באולפני סרטים, טיילו לשלט הוליווד, טיילו ברודיאו דרייב וחוו את היצירתיות שמניעה את תרבות הפופ העולמית."
  },
  "San Francisco": {
    en: "Hilly streets, the Golden Gate Bridge, historic cable cars, Alcatraz Island, diverse neighborhoods like the Mission and Haight-Ashbury, and fog rolling in from the bay create San Francisco's unique character. Experience tech innovation in Silicon Valley, Victorian architecture, sourdough bread, and progressive Californian culture.",
    he: "רחובות גבעתיים, גשר שער הזהב, חשמליות היסטוריות, אי אלקטרז, שכונות מגוונות כמו המישן והייט-אשבורי וערפל מתגלגל מהמפרץ יוצרים את האופי הייחודי של סן פרנסיסקו. חוו חדשנות טכנולוגית בעמק הסיליקון, אדריכלות ויקטוריאנית, לחם מחמצת ותרבות קליפורנית פרוגרסיבית."
  },
  "Las Vegas": {
    en: "The Entertainment Capital dazzles with mega-resorts, world-class shows, casinos, nightlife, and 24/7 excitement. Beyond the Strip, explore Red Rock Canyon, Fremont Street's vintage neon, and nearby natural wonders. Vegas offers over-the-top spectacle, celebrity chef restaurants, and the ultimate adult playground in the Nevada desert.",
    he: "בירת הבידור מסנוורת עם אתרי נופש מגה, מופעים ברמה עולמית, קזינואים, חיי לילה והתרגשות 24/7. מעבר לסטריפ, חקרו את רד רוק קניון, הניאון הוינטג' של פרימונט סטריט ופלאי טבע סמוכים. ווגאס מציעה מחזה מוגזם, מסעדות שף סלבריטאים ומגרש משחקים מבוגרים אולטימטיבי במדבר נבאדה."
  },
  "Miami": {
    en: "Latin American flavor, Art Deco architecture, pristine beaches, vibrant nightlife, and year-round warm weather define this Florida hotspot. Experience Little Havana's Cuban culture, South Beach's glamour, Wynwood's street art, and a multicultural atmosphere where Caribbean rhythms meet American energy.",
    he: "טעם אמריקה הלטינית, אדריכלות ארט דקו, חופים בתוליים, חיי לילה תוססים ומזג אוויר חם לאורך כל השנה מגדירים את נקודת החום הפלורידאית הזו. חוו את התרבות הקובנית של ליטל הוואנה, את הזוהר של סאות' ביץ', את אמנות הרחוב של ווינווד ואווירה רב-תרבותית שבה קצבים קריביים פוגשים אנרגיה אמריקאית."
  },
  "Chicago": {
    en: "The Windy City impresses with stunning architecture, deep-dish pizza, blues and jazz heritage, Millennium Park's Cloud Gate, Navy Pier, world-class museums, and Lake Michigan waterfront. Experience Midwestern hospitality, the legacy of Al Capone, architectural boat tours, and a city that rebuilt itself to become a cultural powerhouse.",
    he: "עיר הרוח מרשימה עם אדריכלות מהממת, פיצה עמוקה, מורשת בלוז וג'אז, שער העננים של מילניום פארק, ניווי פייר, מוזיאונים ברמה עולמית וחוף אגם מישיגן. חוו הכנסת אורחים מערב תיכונית, מורשת אל קפונה, סיורי סירות אדריכליים ועיר שבנתה את עצמה מחדש כדי להפוך למעצמה תרבותית."
  },
  "Boston": {
    en: "America's historic city played a pivotal role in the Revolutionary War. Walk the Freedom Trail, visit Harvard and MIT, explore Fenway Park, enjoy New England seafood, and experience the intellectual atmosphere of this educational hub. Boston perfectly balances colonial history with cutting-edge innovation.",
    he: "העיר ההיסטורית של אמריקה מילאה תפקיד מרכזי במלחמת העצמאות. הלכו בשביל החירות, בקרו בהרווארד ו-MIT, חקרו את פנוויי פארק, תהנו ממאכלי ים של ניו אינגלנד וחוו את האווירה האינטלקטואלית של מרכז חינוכי זה. בוסטון מאזנת באופן מושלם היסטוריה קולוניאלית עם חדשנות חדשנית."
  },
  "Washington DC": {
    en: "The nation's capital showcases iconic monuments, world-class Smithsonian museums (all free!), the White House, Capitol Building, and cherry blossoms in spring. Experience American democracy in action, memorial-lined National Mall, diverse neighborhoods, and a city designed to inspire with its neoclassical grandeur.",
    he: "בירת המדינה מציגה אנדרטאות איקוניות, מוזיאוני סמיתסוניאן ברמה עולמית (כולם בחינם!), הבית הלבן, בניין הקפיטול ופריחת הדובדבן באביב. חוו את הדמוקרטיה האמריקאית בפעולה, נשיונל מול מרופד באנדרטאות, שכונות מגוונות ועיר שתוכננה להשראה עם פאר ניאו-קלאסי."
  },
  "Seattle": {
    en: "The Emerald City nestles between Puget Sound and mountains, famous for Pike Place Market, Space Needle, coffee culture (Starbucks birthplace), music history (grunge, Jimi Hendrix), tech giants, and stunning natural beauty. Experience the Pacific Northwest's outdoor lifestyle, innovative cuisine, and progressive spirit.",
    he: "עיר האזמרגד שוכנת בין פיוג'ט סאונד להרים, מפורסמת בשוק פייק פלייס, מחט החלל, תרבות קפה (מקום לידתה של סטארבקס), היסטוריה מוזיקלית (גראנג', ג'ימי הנדריקס), ענקיות טק ויופי טבעי מהמם. חוו את אורח החיים החיצוני של צפון מערב האוקיינוס השקט, מטבח חדשני ורוח פרוגרסיבית."
  },
  "New Orleans": {
    en: "The Big Easy captivates with jazz music, Creole and Cajun cuisine, Mardi Gras celebrations, historic French Quarter, above-ground cemeteries, and a unique cultural blend of French, Spanish, African, and American influences. Experience voodoo heritage, steamboat cruises, beignets at Café Du Monde, and infectious joie de vivre.",
    he: "ביג איזי שובה לב עם מוזיקת ג'אז, מטבח קריאולי וקייג'ון, חגיגות מארדי גרא, הרובע הצרפתי ההיסטורי, בתי קברות מעל הקרקע ושילוב תרבותי ייחודי של השפעות צרפתיות, ספרדיות, אפריקאיות ואמריקאיות. חוו מורשת וודו, שייט בסירות קיטור, ביינייה בקפה דו מונד ושמחת חיים מדבקת."
  },
  "Nashville": {
    en: "Music City USA is the heart of country music, with honky-tonk bars on Broadway, the Grand Ole Opry, Country Music Hall of Fame, hot chicken, and Southern hospitality. Experience live music everywhere, recording studios, vibrant nightlife, and a city that celebrates its musical heritage while embracing growth.",
    he: "עיר המוזיקה של ארה\"ב היא לב מוזיקת הקאנטרי, עם ברי הונקי-טונק בברודווי, הגראנד אולד אופרי, היכל התהילה של מוזיקת קאנטרי, עוף חריף והכנסת אורחים דרומית. חוו מוזיקה חיה בכל מקום, אולפני הקלטות, חיי לילה תוססים ועיר החוגגת את מורשתה המוזיקלית תוך אימוץ צמיחה."
  },
  "Austin": {
    en: "Keep Austin Weird—the Texas capital embraces live music (self-proclaimed Live Music Capital), tech innovation, food trucks, BBQ, vibrant nightlife on Sixth Street, and outdoor activities. Experience South by Southwest festival, bat watching at Congress Bridge, swimming holes, and a city that balances Southern charm with progressive culture.",
    he: "שמרו על אוסטין מוזרה - בירת טקסס מאמצת מוזיקה חיה (בירת המוזיקה החיה המוכרזת), חדשנות טכנולוגית, משאיות אוכל, BBQ, חיי לילה תוססים ברחוב השישי ופעילויות חוצות. חוו את פסטיבל South by Southwest, צפייה בעטלפים בגשר הקונגרס, בריכות שחייה ועיר המאזנת קסם דרומי עם תרבות פרוגרסיבית."
  },
  "Vancouver": {
    en: "Surrounded by mountains and ocean, Vancouver offers stunning natural beauty, diverse neighborhoods, Stanley Park's seawall, Granville Island, excellent Asian cuisine, and outdoor adventures year-round. Ski in the morning, kayak in the afternoon—this Pacific Northwest gem perfectly balances urban sophistication with wilderness access.",
    he: "מוקפת הרים ואוקיינוס, ונקובר מציעה יופי טבעי מהמם, שכונות מגוונות, חומת הים של סטנלי פארק, אי גרנוויל, מטבח אסיאתי מצוין והרפתקאות חוצות לאורך כל השנה. סקי בבוקר, קיאק אחר הצהריים - פנינת צפון מערב האוקיינוס השקט הזו מאזנת באופן מושלם תחכום עירוני עם גישה לטבע פראי."
  },
  "Toronto": {
    en: "Canada's largest city is multicultural, safe, and vibrant, with the iconic CN Tower, diverse neighborhoods, world-class dining, Distillery District, and proximity to Niagara Falls. Experience international cuisine, cultural festivals, professional sports, and a city that embraces diversity while maintaining Canadian politeness.",
    he: "העיר הגדולה ביותר של קנדה היא רב-תרבותית, בטוחה ותוססת, עם מגדל CN האיקוני, שכונות מגוונות, מסעדות ברמה עולמית, רובע המזקקות והקרבה למפלי הניאגרה. חוו מטבח בינלאומי, פסטיבלים תרבותיים, ספורט מקצועי ועיר המאמצת גיוון תוך שמירה על נימוס קנדי."
  },
  "Montreal": {
    en: "North America's most European city blends French language and culture, cobblestone Old Montreal, Mount Royal, world-famous bagels, poutine, jazz festivals, and vibrant arts scene. Experience bilingual charm, underground city (RESO), diverse neighborhoods, and a city that celebrates both French heritage and Canadian multiculturalism.",
    he: "העיר האירופית ביותר בצפון אמריקה משלבת שפה ותרבות צרפתית, העיר העתיקה מונטריאול עם רחובות אבן משתלבת, הר רויאל, בייגלס מפורסמים, פוטין, פסטיבלי ג'אז וסצנת אמנות תוססת. חוו קסם דו-לשוני, עיר תת-קרקעית (RESO), שכונות מגוונות ועיר החוגגת גם מורשת צרפתית וגם רב-תרבותיות קנדית."
  },
  "Tokyo": {
    en: "A mesmerizing blend of ultra-modern and traditional, Tokyo offers neon-lit Shibuya and Shinjuku, serene temples and gardens, incredible sushi and ramen, cutting-edge technology, anime culture, and impeccable hospitality. Experience cherry blossoms, bustling fish markets, quirky cafés, and a city that respects tradition while embracing the future.",
    he: "שילוב מהפנט של אולטרה-מודרני ומסורתי, טוקיו מציעה שיבויה ושינג'וקו מוארים בניאון, מקדשים וגנים שלווים, סושי ורמן מדהימים, טכנולוגיה חדשנית, תרבות אנימה והכנסת אורחים ללא דופי. חוו פריחת דובדבן, שווקי דגים סוערים, בתי קפה מוזרים ועיר המכבדת מסורת תוך אימוץ העתיד."
  },
  "Kyoto": {
    en: "Japan's cultural heart preserves 2,000 temples and shrines, traditional geisha districts, bamboo groves, zen gardens, and kaiseki cuisine. Walk through Fushimi Inari's thousands of red torii gates, experience tea ceremonies, explore Arashiyama, and immerse yourself in ancient Japanese aesthetics and spirituality.",
    he: "לב התרבות של יפן משמר 2,000 מקדשים ומקדשים, רובעי גיישה מסורתיים, חורשות במבוק, גני זן ומטבח קייסקי. הלכו דרך אלפי שערי הטורי האדומים של פושימי אינארי, חוו טקסי תה, חקרו את ארשיאמה והשקיעו באסתטיקה ורוחניות יפניות עתיקות."
  },
  "Osaka": {
    en: "Known as Japan's kitchen, Osaka excels in street food—takoyaki, okonomiyaki, kushikatsu—alongside historic Osaka Castle, vibrant Dotonbori district, and friendly locals. Experience kuidaore (eat till you drop) culture, neon-lit nightlife, comedy traditions, and a more laid-back atmosphere than Tokyo.",
    he: "ידועה כמטבח של יפן, אוסקה מצטיינת באוכל רחוב - טקויאקי, אוקונומיאקי, קושיקצו - לצד טירת אוסקה ההיסטורית, רובע דוטונבורי התוסס ומקומיים ידידותיים. חוו תרבות קוידאורה (אכול עד שתיפול), חיי לילה מוארים בניאון, מסורות קומדיה ואווירה יותר רגועה מטוקיו."
  },
  "Bangkok": {
    en: "Thailand's vibrant capital buzzes with ornate temples, floating markets, street food paradise, rooftop bars, bustling night markets, and warm hospitality. Experience the Grand Palace, take a boat through klongs, get traditional Thai massages, and savor pad thai, tom yum, and mango sticky rice in this energetic metropolis.",
    he: "בירת תאילנד התוססת רוחשת במקדשים מעוטרים, שווקים צפים, גן עדן של אוכל רחוב, ברים על גגות, שווקי לילה סוערים והכנסת אורחים חמה. חוו את הארמון המלכותי, קחו סירה דרך הקלונגים, קבלו עיסויים תאילנדיים מסורתיים וטעמו פאד תאי, טום יאם ואורז דביק מנגו במטרופולין האנרגטי הזה."
  },
  "Singapore": {
    en: "A futuristic city-state where East meets West, Singapore dazzles with Marina Bay Sands, Gardens by the Bay, hawker center cuisine, multicultural neighborhoods (Chinatown, Little India), impeccable cleanliness, and efficient infrastructure. Experience luxury shopping, night safari, and a green city that punches above its weight.",
    he: "עיר-מדינה עתידנית שבה מזרח פוגש מערב, סינגפור מסנוורת עם מרינה ביי סנדס, גרדנס ביי דה ביי, מטבח מרכזי הוקר, שכונות רב-תרבותיות (צ'יינה טאון, ליטל אינדיה), ניקיון ללא דופי ותשתית יעילה. חוו קניות יוקרה, ספארי לילה ועיר ירוקה שמנצחת מעל משקלה."
  },
  "Hong Kong": {
    en: "Where skyscrapers meet mountains and harbors, Hong Kong offers dim sum, double-decker trams, Victoria Peak views, bustling street markets, feng shui architecture, and East-meets-West culture. Experience neon-lit streets, island hopping, luxury malls, temple visits, and one of the world's most dramatic cityscapes.",
    he: "היכן שגורדי שחקים פוגשים הרים ונמלים, הונג קונג מציעה דים סאם, חשמליות דו-קומתיות, נופי ויקטוריה פיק, שווקי רחוב סוערים, אדריכלות פנג שוי ותרבות מזרח-פוגשת-מערב. חוו רחובות מוארים בניאון, דילוג בין איים, קניונים יוקרתיים, ביקורים במקדשים ואחד מנופי העיר הדרמטיים ביותר בעולם."
  },
  "Seoul": {
    en: "South Korea's capital seamlessly blends futuristic technology with traditional palaces, K-pop culture, Korean BBQ, 24-hour neighborhoods, Buddhist temples, and innovative beauty trends. Experience Gangnam's modernity, Bukchon Hanok Village's tradition, Han River parks, vibrant street food, and a city that never stops moving.",
    he: "בירת דרום קוריאה משלבת בצורה חלקה טכנולוגיה עתידנית עם ארמונות מסורתיים, תרבות K-pop, BBQ קוריאני, שכונות 24 שעות, מקדשים בודהיסטים וטרנדים חדשניים של יופי. חוו את המודרניות של גנגנאם, המסורת של כפר בוקצ'ון הנוק, פארקי נהר האן, אוכל רחוב תוסס ועיר שאף פעם לא מפסיקה לזוז."
  },
  "Dubai": {
    en: "A desert metropolis of superlatives: tallest building (Burj Khalifa), largest mall, indoor skiing, man-made islands, luxury hotels, gold souks, and audacious ambition. Experience traditional Emirati culture alongside ultra-modern architecture, tax-free shopping, desert safaris, and a city built on dreams in the Arabian sand.",
    he: "מטרופולין מדברי של סופרלטיבים: הבניין הגבוה ביותר (בורג' ח'ליפה), הקניון הגדול ביותר, סקי פנימי, איים מעשה ידי אדם, מלונות יוקרה, שווקי זהב ושאפתנות נועזת. חוו תרבות אמירטית מסורתית לצד אדריכלות אולטרה-מודרנית, קניות פטורות ממס, ספארי מדברי ועיר שנבנתה על חלומות בחול הערבי."
  },
  "Bali": {
    en: "Indonesia's Island of the Gods offers lush rice terraces, ancient temples, yoga retreats, surfing beaches, vibrant arts scene, and spiritual atmosphere. Experience Ubud's cultural heart, beach clubs in Seminyak, diving in Amed, traditional ceremonies, Balinese cuisine, and warm hospitality that makes visitors feel like family.",
    he: "אי האלים של אינדונזיה מציע מדרגות אורז שופעות, מקדשים עתיקים, נסיגות יוגה, חופי גלישה, סצנת אמנות תוססת ואווירה רוחנית. חוו את הלב התרבותי של אובוד, מועדוני חוף בסמיניאק, צלילה באמד, טקסים מסורתיים, מטבח באלינזי והכנסת אורחים חמה שגורמת למבקרים להרגיש כמו משפחה."
  },
  "Phuket": {
    en: "Thailand's largest island paradise combines stunning beaches (Patong, Kata, Karon), limestone cliffs, vibrant nightlife, water sports, island hopping to Phi Phi, and delicious seafood. Experience Thai hospitality, Buddhist temples, elephant sanctuaries, and tropical beauty that attracts millions seeking sun and sea.",
    he: "גן העדן הגדול ביותר של תאילנד משלב חופים מהממים (פטונג, קאטה, קארון), צוקי אבן גיר, חיי לילה תוססים, ספורט ימי, דילוג בין איים לפי פי ומאכלי ים טעימים. חוו הכנסת אורחים תאילנדית, מקדשים בודהיסטים, מקלטי פילים ויופי טרופי המושך מיליונים המחפשים שמש וים."
  },
  "Mumbai": {
    en: "India's financial capital and Bollywood hub pulses with chaotic energy, colonial architecture, street food, Gateway of India, Marine Drive, and extreme contrasts between wealth and poverty. Experience the dabbawalas' lunch delivery system, vibrant markets, Dharavi's entrepreneurial spirit, and a city of dreams and hustle.",
    he: "הבירה הפיננסית של הודו ומרכז בוליווד פועמת באנרגיה כאוטית, אדריכלות קולוניאלית, אוכל רחוב, שער הודו, מרין דרייב וניגודים קיצוניים בין עושר ועוני. חוו את מערכת אספקת הצהריים של דבאוואלה, שווקים תוססים, רוח יזמית של דהראווי ועיר של חלומות והמולה."
  },
  "Delhi": {
    en: "India's capital city blends Mughal monuments like Red Fort and Humayun's Tomb, bustling bazaars, street food paradise, modern metro, and diverse neighborhoods. Experience Old Delhi's narrow lanes, New Delhi's wide avenues, spice markets, Sikh temples, and a city where ancient history meets contemporary Indian life.",
    he: "עיר הבירה של הודו משלבת אנדרטאות מוגוליות כמו המבצר האדום וקבר הומאיון, שווקים סוערים, גן עדן של אוכל רחוב, מטרו מודרני ושכונות מגוונות. חוו את הסמטאות הצרות של דלהי העתיקה, השדרות הרחבות של ניו דלהי, שווקי תבלינים, מקדשים סיקים ועיר שבה היסטוריה עתיקה פוגשת חיים הודיים עכשוויים."
  },
  "Shanghai": {
    en: "China's most cosmopolitan city showcases futuristic Pudong skyline, historic Bund waterfront, French Concession's tree-lined streets, Yu Garden, soup dumplings, and rapid modernization. Experience magnetic levitation trains, art deco architecture, vibrant nightlife, luxury shopping, and a city racing toward the future while preserving glimpses of its past.",
    he: "העיר הקוסמופוליטית ביותר של סין מציגה קו רקיע עתידני של פודונג, חוף הבונד ההיסטורי, רחובות מוצלי עצים של הזיכיון הצרפתי, גן יו, כופתאות מרק ומודרניזציה מהירה. חוו רכבות ריחוף מגנטי, אדריכלות ארט דקו, חיי לילה תוססים, קניות יוקרה ועיר הדוהרת לקראת העתיד תוך שמירה על הצצות לעברה."
  },
  "Beijing": {
    en: "China's ancient and modern capital houses the Forbidden City, Great Wall, Temple of Heaven, hutong alleyways, Peking duck, and Olympic stadiums. Experience imperial grandeur, communist history, contemporary art districts, and a city that serves as the political and cultural heart of the world's most populous nation.",
    he: "הבירה העתיקה והמודרנית של סין מכילה את העיר האסורה, החומה הגדולה, מקדש השמיים, סמטאות הוטונג, ברווז פקין ואצטדיוני אולימפיים. חוו פאר קיסרי, היסטוריה קומוניסטית, רובעי אמנות עכשווית ועיר המשמשת לב הפוליטי והתרבותי של האומה המאוכלסת ביותר בעולם."
  },
  "Kuala Lumpur": {
    en: "Malaysia's capital is famous for the iconic Petronas Twin Towers, diverse street food, bustling night markets, Batu Caves, and multicultural blend of Malay, Chinese, and Indian influences. Experience affordable luxury, rainforest within the city, colonial architecture, and a gateway to Southeast Asian exploration.",
    he: "בירת מלזיה מפורסמת במגדלי התאומים האיקוניים פטרונאס, אוכל רחוב מגוון, שווקי לילה סוערים, מערות באטו ושילוב רב-תרבותי של השפעות מלאיות, סיניות והודיות. חוו יוקרה במחיר סביר, יער גשם בתוך העיר, אדריכלות קולוניאלית ושער לחקירת דרום מזרח אסיה."
  },
  "Hanoi": {
    en: "Vietnam's capital captivates with Old Quarter's bustling streets, French colonial architecture, Hoan Kiem Lake, water puppetry, pho and bun cha, and resilient history. Experience motorbike chaos, ancient temples, egg coffee, street-side dining, and a city balancing tradition with rapid development.",
    he: "בירת ויטנאם שובה לב עם רחובות סוערים של הרובע העתיק, אדריכלות קולוניאלית צרפתית, אגם הואן קים, בובות מים, פו ובון צ'ה והיסטוריה עמידה. חוו כאוס אופנועים, מקדשים עתיקים, קפה ביצה, סעודה בצד רחוב ועיר המאזנת מסורת עם פיתוח מהיר."
  },
  "Ho Chi Minh City": {
    en: "Formerly Saigon, this dynamic city buzzes with motorbikes, French colonial landmarks, War Remnants Museum, vibrant street food, Mekong Delta access, and entrepreneurial energy. Experience Notre Dame Cathedral, Ben Thanh Market, rooftop bars, and a city that embodies Vietnam's resilience and rapid modernization.",
    he: "לשעבר סייגון, עיר דינמית זו רוחשת באופנועים, ציוני דרך קולוניאליים צרפתיים, מוזיאון שרידי המלחמה, אוכל רחוב תוסס, גישה לדלתת המקונג ואנרגיה יזמית. חוו את הקתדרלה של נוטרדאם, שוק בן תאן, ברים על גגות ועיר המגלמת את חוסנה והמודרניזציה המהירה של ויטנאם."
  },
  "Manila": {
    en: "The Philippines' capital offers Spanish colonial heritage in Intramuros, chaotic urban energy, vibrant nightlife, jeepneys, Filipino hospitality, and access to beautiful beaches. Experience San Miguel beer, adobo cuisine, Rizal Park, and a city that serves as the gateway to the Philippine archipelago's 7,000+ islands.",
    he: "בירת הפיליפינים מציעה מורשת קולוניאלית ספרדית באינטרמורוס, אנרגיה עירונית כאוטית, חיי לילה תוססים, ג'יפניז, הכנסת אורחים פיליפינית וגישה לחופים יפים. חוו בירה של סן מיגל, מטבח אדובו, פארק ריזאל ועיר המשמשת שער לארכיפלג הפיליפיני של למעלה מ-7,000 איים."
  },
  "Kathmandu": {
    en: "Nepal's capital is the gateway to Himalayan adventures, with ancient temples, Durbar Square, Boudhanath Stupa, trekking outfitters, and spiritual atmosphere. Experience colorful prayer flags, dal bhat cuisine, living goddess Kumari, and a city where Hindu and Buddhist traditions blend amid the backdrop of snow-capped peaks.",
    he: "בירת נפאל היא שער להרפתקאות הימלאיה, עם מקדשים עתיקים, כיכר דורבר, סטופת בודהנאת', מתלבשי טרקים ואווירה רוחנית. חוו דגלי תפילה צבעוניים, מטבח דאל באט, האלה החיה קומארי ועיר שבה מסורות הינדיות ובודהיסטיות מתמזגות על רקע פסגות מכוסות שלג."
  },
  "Colombo": {
    en: "Sri Lanka's commercial capital blends colonial architecture, Buddhist temples, bustling markets, seafront promenade, and diverse cuisine. Experience Gangaramaya Temple, Galle Face Green, spicy curries, tea culture, and a city recovering from civil war to become a vibrant gateway to island adventures.",
    he: "הבירה המסחרית של סרי לנקה משלבת אדריכלות קולוניאלית, מקדשים בודהיסטים, שווקים סוערים, טיילת חוף וים ומטבח מגוון. חוו את מקדש גנגרמאיה, גאלה פייס גרין, קארי חריף, תרבות תה ועיר המתאוששת ממלחמת אזרחים כדי להפוך לשער תוסס להרפתקאות אי."
  },
  "Sydney": {
    en: "Australia's iconic harbor city dazzles with the Opera House, Harbour Bridge, Bondi Beach, diverse neighborhoods, outdoor lifestyle, and year-round sunshine. Experience coastal walks, multicultural cuisine, laid-back Aussie culture, and a city that perfectly balances urban sophistication with beach culture and natural beauty.",
    he: "עיר הנמל האיקונית של אוסטרליה מסנוורת עם בית האופרה, גשר הנמל, חוף בונדי, שכונות מגוונות, אורח חיים חיצוני ושמש לאורך כל השנה. חוו טיולים חופיים, מטבח רב-תרבותי, תרבות אוסי נינוחה ועיר המאזנת באופן מושלם תחכום עירוני עם תרבות חוף ויופי טבעי."
  },
  "Melbourne": {
    en: "Australia's cultural capital impresses with laneways filled with street art, coffee culture, sports fanaticism (Australian Rules football, cricket), diverse neighborhoods, and thriving food scene. Experience the Great Ocean Road, Yarra Valley wineries, multicultural dining, and a city consistently ranked among the world's most livable.",
    he: "הבירה התרבותית של אוסטרליה מרשימה עם סמטאות מלאות אמנות רחוב, תרבות קפה, פנאטיות ספורט (כדורגל חוקים אוסטרלי, קריקט), שכונות מגוונות וסצנת אוכל משגשגת. חוו את הכביש האוקיאני הגדול, יקבי עמק יארה, סעודה רב-תרבותית ועיר המדורגת בעקביות בין החיות ביותר בעולם."
  },
  "Auckland": {
    en: "New Zealand's largest city sits on two harbors with volcanic cones, Maori culture, sailing culture (City of Sails), nearby islands, adventure activities, and cosmopolitan dining. Experience the Sky Tower, black sand beaches, wine regions, and a city that serves as the perfect base for exploring New Zealand's North Island.",
    he: "העיר הגדולה ביותר של ניו זילנד יושבת על שני נמלים עם קונוסים וולקניים, תרבות מאורי, תרבות שייט (עיר המפרשים), איים סמוכים, פעילויות הרפתקה וסעודה קוסמופוליטית. חוו את מגדל הסקיי, חופי חול שחור, אזורי יין ועיר המשמשת בסיס מושלם לחקירת האי הצפוני של ניו זילנד."
  },
  "Brisbane": {
    en: "Queensland's sunny capital offers year-round warmth, South Bank's lagoon and cultural precinct, accessible urban lifestyle, proximity to Gold and Sunshine Coasts, and laid-back Australian charm. Experience Story Bridge climbs, koala sanctuaries, craft beer scene, and a city that balances metropolitan amenities with outdoor adventure.",
    he: "בירת קווינסלנד השמשית מציעה חמימות לאורך כל השנה, הלגונה והמחוז התרבותי של סאות' בנק, אורח חיים עירוני נגיש, קרבה לחופי גולד וסאנשיין וקסם אוסטרלי נינוח. חוו טיפוסים על גשר סטורי, מקלטי קואלה, סצנת בירה מלאכה ועיר המאזנת שירותים מטרופוליטניים עם הרפתקה חיצונית."
  },
  "Perth": {
    en: "Australia's most isolated major city offers pristine beaches, Kings Park, Swan Valley wineries, Rottnest Island with friendly quokkas, and a relaxed Western Australian lifestyle. Experience endless sunshine, Indian Ocean sunsets, outdoor dining, and a city that feels like a hidden gem at the continent's western edge.",
    he: "העיר העיקרית המבודדת ביותר של אוסטרליה מציעה חופים בתוליים, קינגס פארק, יקבי עמק סוואן, אי רוטנסט עם קווקות ידידותיות ואורח חיים מערב אוסטרלי רגוע. חוו שמש אינסופית, שקיעות האוקיינוס ההודי, סעודה חיצונית ועיר שמרגישה כמו פנינה נסתרת בקצה המערבי של היבשת."
  },
  "Queenstown": {
    en: "New Zealand's adventure capital nestles on Lake Wakatipu with dramatic mountain scenery, bungee jumping (birthplace), skiing, jet boating, wine tours, and stunning landscapes. Experience adrenaline activities, Lord of the Rings locations, Milford Sound trips, and a town that attracts thrill-seekers from around the world.",
    he: "בירת ההרפתקאות של ניו זילנד שוכנת על אגם ואקאטיפו עם נופי הרים דרמטיים, בנג'י ג'אמפינג (מקום לידה), סקי, סירות ג'ט, סיורי יין ונופים מהממים. חוו פעילויות אדרנלין, מקומות שר הטבעות, טיולים למילפורד סאונד ועיר המושכת מחפשי ריגושים מכל העולם."
  },
  "Wellington": {
    en: "New Zealand's compact capital impresses with Te Papa Museum, craft coffee culture, film industry (Weta Workshop), windy harbor setting, and vibrant arts scene. Experience Cuba Street's bohemian vibe, cable car rides, craft beer breweries, and a city that punches above its weight culturally despite its small size.",
    he: "הבירה הקומפקטית של ניו זילנד מרשימה עם מוזיאון טה פאפה, תרבות קפה מלאכה, תעשיית קולנוע (Weta Workshop), תפאורת נמל סוערת וסצנת אמנות תוססת. חוו את האווירה הבוהמית של רחוב קובה, נסיעות בעגלת כבלים, מבשלות בירה מלאכה ועיר שמנצחת מעל משקלה תרבותית למרות גודלה הקטן."
  },
  "Fiji": {
    en: "This South Pacific paradise offers crystal-clear waters, coral reefs, luxury resorts, traditional kava ceremonies, friendly locals, and 'Bula!' greetings. Experience white sand beaches, world-class diving, island hopping, Fijian culture, and tropical beauty that defines the ultimate island escape.",
    he: "גן עדן דרום האוקיינוס השקט הזה מציע מים צלולים, שוניות אלמוגים, אתרי נופש יוקרתיים, טקסי קאווה מסורתיים, מקומיים ידידותיים וברכות 'בולה!'. חוו חופי חול לבן, צלילה ברמה עולמית, דילוג בין איים, תרבות פיג'יאנית ויופי טרופי המגדיר את בריחת האי האולטימטיבית."
  },
  "Cape Town": {
    en: "Beneath Table Mountain's iconic flat top, Cape Town offers stunning beaches, Cape Winelands, Robben Island, vibrant V&A Waterfront, diverse culture, and dramatic coastlines. Experience penguins at Boulders Beach, Cape Point, colorful Bo-Kaap, and a city where natural beauty meets complex history.",
    he: "מתחת לראש השטוח האיקוני של הר השולחן, קייפטאון מציעה חופים מהממים, אזור היין של הכף, אי רובן, רציף V&A תוסס, תרבות מגוונת וקווי חוף דרמטיים. חוו פינגווינים בחוף בולדרס, קייפ פוינט, בו-קאאפ צבעוני ועיר שבה יופי טבעי פוגש היסטוריה מורכבת."
  },
  "Cairo": {
    en: "The gateway to ancient Egypt houses the Pyramids of Giza, Sphinx, Egyptian Museum, Khan el-Khalili bazaar, and Nile River. Experience 5,000 years of history, Islamic architecture, chaotic traffic, aromatic spices, and a city where pharaonic wonders coexist with modern Arab culture.",
    he: "שער למצרים העתיקה מכיל את הפירמידות של גיזה, הספינקס, המוזיאון המצרי, בזאר חאן אל-חלילי ונהר הנילוס. חוו 5,000 שנות היסטוריה, אדריכלות איסלאמית, תנועה כאוטית, תבלינים ארומטיים ועיר שבה פלאים פרעוניים מתקיימים יחד עם תרבות ערבית מודרנית."
  },
  "Marrakech": {
    en: "Morocco's red city captivates with bustling souks, Jemaa el-Fnaa square, stunning riads, Atlas Mountains backdrop, Majorelle Garden, and sensory overload. Experience snake charmers, mint tea, tagine cuisine, hammams, intricate tilework, and a city that embodies exotic North African mystique.",
    he: "העיר האדומה של מרוקו שובה לב עם שווקים סוערים, כיכר ג'מאא אל-פנא, ריאדים מהממים, רקע הרי האטלס, גן מז'ורל ועומס חושים. חוו מקסמי נחשים, תה נענע, מטבח טאג'ין, חממים, עבודת אריחים מורכבת ועיר המגלמת מיסטיקה אקזוטית צפון אפריקאית."
  },
  "Johannesburg": {
    en: "South Africa's largest city is the economic powerhouse with Apartheid Museum, Soweto's rich history, gold mining heritage, vibrant arts scene, and diverse neighborhoods. Experience constitutional hill, Maboneng Precinct, township tours, and a city confronting its past while building a democratic future.",
    he: "העיר הגדולה ביותר של דרום אפריקה היא מעצמת הכלכלה עם מוזיאון האפרטהייד, ההיסטוריה העשירה של סואטו, מורשת כריית זהב, סצנת אמנות תוססת ושכונות מגוונות. חוו את גבעת החוקה, מחוז מבונאנג, סיורי טאונשיפ ועיר המתעמתת עם עברה תוך בניית עתיד דמוקרטי."
  },
  "Nairobi": {
    en: "Kenya's capital serves as the safari gateway with Nairobi National Park (wildlife minutes from downtown), Giraffe Centre, David Sheldrick Elephant Orphanage, and vibrant East African culture. Experience matatus (colorful minibuses), nyama choma, and a city balancing urbanization with wildlife conservation.",
    he: "בירת קניה משמשת שער לספארי עם פארק נאירובי הלאומי (חיות בר דקות ממרכז העיר), מרכז הג'ירפות, בית היתומים לפילים של דייוויד שלדריק ותרבות מזרח אפריקאית תוססת. חוו מטטוס (מיניבוסים צבעוניים), ניאמה צ'ומה ועיר המאזנת עיור עם שימור חיות בר."
  },
  "Casablanca": {
    en: "Morocco's largest city blends Art Deco architecture, the stunning Hassan II Mosque, French colonial influences, Atlantic Ocean setting, and modern Moroccan life. Experience the corniche, old medina, seafood restaurants, and a city that's more business hub than tourist destination but charms nonetheless.",
    he: "העיר הגדולה ביותר של מרוקו משלבת אדריכלות ארט דקו, מסגד חסן השני המהמם, השפעות קולוניאליות צרפתיות, תפאורת האוקיינוס האטלנטי וחיים מרוקאים מודרניים. חוו את הקורניש, המדינה העתיקה, מסעדות מאכלי ים ועיר שהיא יותר מרכז עסקים מיעד תיירותי אבל מקסימה בכל זאת."
  },
  "Luxor": {
    en: "Ancient Thebes houses the Valley of the Kings, Karnak Temple, Luxor Temple, and more archaeological wonders than anywhere on Earth. Float over temples in hot air balloons, cruise the Nile, explore royal tombs, and step into the world of pharaohs in this open-air museum.",
    he: "תבאי העתיקה מכילה את עמק המלכים, מקדש כרנק, מקדש לוקסור ויותר פלאים ארכיאולוגיים מאשר בכל מקום אחר על פני כדור הארץ. צפו מעל מקדשים בכדורים פורחים, שוטו בנילוס, חקרו קברי מלכים וצעדו לעולם הפרעונים במוזיאון התחת כיפת השמיים הזה."
  },
  "Tunis": {
    en: "Tunisia's capital blends ancient Carthage ruins, Arab medina, French colonial quarters, and Mediterranean beaches. Experience the Bardo Museum's mosaics, Sidi Bou Said's blue and white village, couscous cuisine, and a gateway to North African history where Phoenicians, Romans, and Arabs left their mark.",
    he: "בירת תוניסיה משלבת חורבות קרתגו עתיקות, מדינה ערבית, רבעים קולוניאליים צרפתיים וחופי ים תיכון. חוו את הפסיפסים של מוזיאון בארדו, הכפר הכחול והלבן של סידי בו סעיד, מטבח קוסקוס ושער להיסטוריה צפון אפריקאית שבה הפיניקים, הרומאים והערבים הותירו את חותמם."
  },
  "Zanzibar": {
    en: "Tanzania's spice island paradise offers turquoise waters, white sand beaches, Stone Town's winding alleys, dhow boats, spice tours, and Swahili culture. Experience sunset cruises, snorkeling, historic slave trade sites, and an island that blends African, Arab, and Indian influences into unique East African character.",
    he: "גן עדן אי התבלינים של טנזניה מציע מים טורקיז, חופי חול לבן, הסמטאות המפותלות של סטון טאון, סירות דאו, סיורי תבלינים ותרבות סוואהילית. חוו שייט שקיעה, שנורקלינג, אתרים היסטוריים של סחר עבדים ואי המשלב השפעות אפריקאיות, ערביות והודיות לאופי מזרח אפריקאי ייחודי."
  },
  "Mauritius": {
    en: "This Indian Ocean island nation dazzles with pristine beaches, luxury resorts, volcanic landscapes, multicultural fusion (Indian, African, French, Chinese), water sports paradise, and dramatic Le Morne mountain. Experience underwater waterfall illusion, botanical gardens, and island hospitality in this tropical haven.",
    he: "אי-מדינה באוקיינוס ההודי זה מסנוור עם חופים בתוליים, אתרי נופש יוקרתיים, נופים וולקניים, מיזוג רב-תרבותי (הודי, אפריקאי, צרפתי, סיני), גן עדן של ספורט ימי והר לה מורן הדרמטי. חוו אשליית מפל תת-מימי, גנים בוטניים והכנסת אורחים באי במקלט טרופי זה."
  },
  "Punta Cana": {
    en: "Dominican Republic's eastern resort paradise offers endless white sand beaches, turquoise Caribbean waters, all-inclusive luxury resorts, water sports, championship golf, and year-round warm weather. Experience catamaran tours, zip-lining, beach clubs, and the ultimate tropical vacation escape.",
    he: "גן עדן המזרחי של הרפובליקה הדומיניקנית מציע חופי חול לבן אינסופיים, מים קריביים טורקיז, אתרי נופש יוקרתיים הכל כלול, ספורט ימי, גולף אליפות ומזג אוויר חם לאורך כל השנה. חוו סיורי קטמרן, זיפליין, מועדוני חוף ובריחת חופשה טרופית אולטימטיבית."
  },
  "Havana": {
    en: "Cuba's colorful capital is frozen in time with 1950s American cars, Spanish colonial architecture, Malecón waterfront, live salsa music, rum, cigars, and revolutionary history. Experience Old Havana's cobblestone streets, classic mojitos, vintage charm, and a city emerging from decades of isolation with authentic Caribbean soul.",
    he: "הבירה הצבעונית של קובה קפואה בזמן עם מכוניות אמריקאיות משנות ה-50, אדריכלות קולוניאלית ספרדית, חוף הים מלקון, מוזיקת סלסה חיה, רום, סיגרים והיסטוריה מהפכנית. חוו את הרחובות המרוצפים של הוואנה העתיקה, מוחיטו קלאסי, קסם וינטג' ועיר המתגלה מעשרות שנים של בידוד עם נשמה קריבית אותנטית."
  },
  "Nassau": {
    en: "Bahamas' capital on New Providence Island combines British colonial heritage, pastel-colored buildings, pristine beaches, duty-free shopping, and proximity to Paradise Island's Atlantis resort. Experience Junkanoo festivals, conch fritters, swimming with pigs at nearby Exumas, and quintessential Caribbean beach paradise.",
    he: "בירת איי בהאמה באי ניו פרובידנס משלבת מורשת קולוניאלית בריטית, בניינים בצבעי פסטל, חופים בתוליים, קניות פטורות ממס וקרבה לאתר הנופש אטלנטיס של אי פרדייס. חוו פסטיבלי ג'ונקנו, קציצות צדף, שחייה עם חזירים באקסומאס הסמוכות וגן עדן חוף קריבי אופייני."
  },
  "Montego Bay": {
    en: "Jamaica's second city offers beautiful beaches, all-inclusive resorts, duty-free shopping, reggae culture, Doctor's Cave Beach, and warm Jamaican hospitality. Experience jerk chicken, rum tours, river rafting, Bob Marley's legacy, and the laid-back Caribbean lifestyle with 'no problem, mon' attitude.",
    he: "העיר השנייה של ג'מייקה מציעה חופים יפים, אתרי נופש הכל כלול, קניות פטורות ממס, תרבות רגאיי, חוף מערת הרופא והכנסת אורחים ג'מייקנית חמה. חוו עוף ג'רק, סיורי רום, רפטינג בנהר, מורשת בוב מארלי ואורח החיים הקריבי הרגוע עם גישת 'אין בעיה, מון'."
  },
  "San Juan": {
    en: "Puerto Rico's historic capital combines 500-year-old Spanish fortresses (El Morro, San Cristóbal), colorful colonial Old San Juan, beautiful beaches, vibrant nightlife, and US convenience without passport. Experience salsa dancing, mofongo, bioluminescent bays, and a perfect blend of American and Caribbean cultures.",
    he: "הבירה ההיסטורית של פורטו ריקו משלבת מבצרים ספרדיים בני 500 שנה (אל מורו, סן כריסטובל), סן חואן העתיקה הקולוניאלית הצבעונית, חופים יפים, חיי לילה תוססים ונוחות אמריקאית ללא דרכון. חוו ריקוד סלסה, מופונגו, מפרצים ביולומינסנטיים ושילוב מושלם של תרבויות אמריקאיות וקריביות."
  },
  "Santo Domingo": {
    en: "The Dominican Republic's capital and oldest European settlement in the Americas boasts Zona Colonial's cobblestone streets, first cathedral in the New World, merengue music, rich history, and Caribbean warmth. Experience colonial architecture, Malecón waterfront, local cuisine, and a city celebrating 500+ years of history.",
    he: "בירת הרפובליקה הדומיניקנית וההתיישבות האירופית העתיקה ביותר באמריקה מתגאה ברחובות המרוצפים של זונה קולוניאל, הקתדרלה הראשונה בעולם החדש, מוזיקת מרנגה, היסטוריה עשירה וחמימות קריבית. חוו אדריכלות קולוניאלית, חוף הים מלקון, מטבח מקומי ועיר החוגגת למעלה מ-500 שנות היסטוריה."
  },
  "Playa del Carmen": {
    en: "Mexico's Riviera Maya gem offers Caribbean beaches, vibrant Fifth Avenue pedestrian street, access to Mayan ruins (Tulum, Coba), cenotes swimming, Cozumel diving, and cosmopolitan atmosphere. Experience beach clubs, Mexican cuisine, nightlife, eco-parks, and the perfect balance of relaxation and adventure.",
    he: "פנינת ריביירה מאיה של מקסיקו מציעה חופי קריביים, שדרה חמישית להולכי רגל תוססת, גישה לחורבות מאיה (טולום, קובה), שחייה בסנוטים, צלילה בקוזומל ואווירה קוסמופוליטית. חוו מועדוני חוף, מטבח מקסיקני, חיי לילה, פארקי אקולוגיה והאיזון המושלם בין הרפיה והרפתקה."
  },
  "Cancun": {
    en: "Mexico's Caribbean paradise offers powdery white beaches, turquoise waters, Hotel Zone's all-inclusive resorts, Mayan archaeological sites, vibrant nightlife, and water activities. Experience underwater museums, snorkeling in cenotes, day trips to Isla Mujeres, and spring break energy mixed with family-friendly luxury.",
    he: "גן עדן הקריבי של מקסיקו מציע חופי חול לבן אבקתי, מים טורקיז, אתרי נופש הכל כלול של אזור המלונות, אתרים ארכיאולוגיים מאיה, חיי לילה תוססים ופעילויות מים. חוו מוזיאונים תת-מימיים, שנורקלינג בסנוטים, טיולי יום לאיסלה מוחרס ואנרגיית חופשת האביב מעורבת עם יוקרה ידידותית למשפחה."
  },
  "Rio de Janeiro": {
    en: "The Marvelous City captivates with Copacabana and Ipanema beaches, Christ the Redeemer statue, Sugarloaf Mountain, Carnival celebrations, samba rhythms, and stunning natural setting between mountains and sea. Experience favela culture, Lapa nightlife, caipirinha cocktails, and infectious Brazilian energy.",
    he: "העיר המופלאה שובה לב עם חופי קופקבנה ואיפנמה, פסל ישו הגואל, הר לחם הסוכר, חגיגות קרנבל, קצבי סמבה ותפאורה טבעית מהממת בין הרים לים. חוו תרבות פאבלה, חיי לילה בלאפה, קוקטיילי קאיפירינייה ואנרגיה ברזילאית מדבקת."
  },
  "Buenos Aires": {
    en: "Argentina's passionate capital seduces with tango dancing, European architecture, steak houses (parrillas), wine culture, bookstores, colorful La Boca neighborhood, and sophisticated café culture. Experience Teatro Colón, San Telmo antique markets, Eva Perón's legacy, and a city that feels like Paris in South America.",
    he: "הבירה הנלהבת של ארגנטינה מפתה בריקוד טנגו, אדריכלות אירופאית, בתי סטייק (parrillas), תרבות יין, חנויות ספרים, שכונת לה בוקה הצבעונית ותרבות בתי קפה מתוחכמת. חוו את תיאטרון קולון, שווקי עתיקות סן טלמו, מורשת אווה פרון ועיר שמרגישה כמו פריז בדרום אמריקה."
  },
  "Lima": {
    en: "Peru's coastal capital offers world-class gastronomy (ceviche capital!), colonial architecture in historic center, cliffside parks overlooking the Pacific, pre-Columbian sites, and vibrant arts scene. Experience Miraflores' modern amenities, Barranco's bohemian charm, Huaca Pucllana ruins, and cuisine that rivals any on Earth.",
    he: "הבירה החופית של פרו מציעה גסטרונומיה ברמה עולמית (בירת הסביצ'ה!), אדריכלות קולוניאלית במרכז ההיסטורי, פארקים על צוקים המשקיפים על האוקיינוס השקט, אתרים קדם-קולומביאניים וסצנת אמנות תוססת. חוו את השירותים המודרניים של מיראפלורס, הקסם הבוהמי של בארנקו, חורבות הואקה פוקלאנה ומטבח המתחרה בכל מקום על פני כדור הארץ."
  },
  "Cusco": {
    en: "The ancient Inca capital serves as the gateway to Machu Picchu, with cobblestone streets, Spanish colonial churches built on Inca foundations, vibrant markets, high-altitude setting (11,150 ft), and indigenous Quechua culture. Experience Sacred Valley tours, pisco sours, acclimatization to altitude, and Andean mysticism.",
    he: "הבירה האינקית העתיקה משמשת שער למאצ'ו פיצ'ו, עם רחובות מרוצפים, כנסיות קולוניאליות ספרדיות הבנויות על יסודות אינקה, שווקים תוססים, תפאורה בגובה רב (11,150 רגל) ותרבות קצ'ואה ילידית. חוו סיורי עמק הקדוש, פיסקו סאואר, התאקלמות לגובה ומיסטיקה אנדית."
  },
  "Bogotá": {
    en: "Colombia's high-altitude capital (8,660 ft) offers colonial La Candelaria quarter, world-class museums (Gold Museum), vibrant street art, Monserrate mountain views, emerging culinary scene, and improving safety. Experience ciclovía (car-free Sundays), coffee culture, salsa clubs, and a city shedding its troubled past.",
    he: "הבירה בגובה רב של קולומביה (8,660 רגל) מציעה רובע לה קנדלריה הקולוניאלי, מוזיאונים ברמה עולמית (מוזיאון הזהב), אמנות רחוב תוססת, נופי הר מונסראטה, סצנת קולינריה מתפתחת ושיפור בטיחות. חוו ciclovía (ראשונות ללא מכוניות), תרבות קפה, מועדוני סלסה ועיר משילה עברה בעייתי."
  },
  "Santiago": {
    en: "Chile's capital nestles in a valley surrounded by Andes mountains, offering wine regions, nearby ski resorts, cosmopolitan neighborhoods, pre-Columbian museums, and mountain viewpoints. Experience Cerro San Cristóbal views, Bellavista's bohemian vibe, Chilean wine tastings, and easy access to beaches and mountains.",
    he: "בירת צ'ילה שוכנת בעמק המוקף בהרי האנדים, ומציעה אזורי יין, אתרי סקי סמוכים, שכונות קוסמופוליטיות, מוזיאונים קדם-קולומביאניים ונקודות תצפית הרריות. חוו נופי סרו סן כריסטובל, האווירה הבוהמית של בליאויסטה, טעימות יין צ'יליאני וגישה קלה לחופים ולהרים."
  },
  "Cartagena": {
    en: "Colombia's Caribbean jewel enchants with walled colonial Old Town (UNESCO site), colorful buildings, tropical climate, Caribbean beaches, salsa rhythms, and romantic ambiance. Experience fortress walls at sunset, street vendors, Getsemaní's nightlife, island hopping to Rosario Islands, and García Márquez's magical realism setting.",
    he: "פנינת הקריבי של קולומביה מקסימה עם העיר העתיקה הקולוניאלית המוקפת חומה (אתר UNESCO), בניינים צבעוניים, אקלים טרופי, חופי קריביים, קצבי סלסה ואווירה רומנטית. חוו חומות מבצר עם השקיעה, רוכלי רחוב, חיי הלילה של גטסמאני, דילוג בין איים לאיי רוזאריו והתפאורה של ריאליזם קסום של גרסיה מרקס."
  },
  "Medellín": {
    en: "Once notorious, now innovative—the City of Eternal Spring boasts perfect year-round weather, modern metro system, Comuna 13's transformation story, vibrant nightlife in Poblado, Fernando Botero sculptures, and proud paisa culture. Experience cable cars connecting hillside neighborhoods, salsa dancing, coffee tours, and a city reborn.",
    he: "פעם ידועה לשמצה, כיום חדשנית - עיר האביב הנצחי מתגאה במזג אוויר מושלם לאורך כל השנה, מערכת מטרו מודרנית, סיפור השינוי של קומונה 13, חיי לילה תוססים בפובלאדו, פסלי פרננדו בוטרו ותרבות פאיסה גאה. חוו רכבלים המחברים שכונות גבעות, ריקוד סלסה, סיורי קפה ועיר שנולדה מחדש."
  },
  "Quito": {
    en: "Ecuador's capital sits on the equator at 9,350 feet elevation with the best-preserved colonial center in Latin America, stunning Andean backdrop, nearby volcanoes, and Middle of the World monument. Experience teleferico cable car, colorful markets, historic churches with gold leaf interiors, and gateway to Galápagos and Amazon.",
    he: "בירת אקוודור יושבת על קו המשווה בגובה 9,350 רגל עם המרכז הקולוניאלי המשומר ביותר באמריקה הלטינית, רקע אנדי מהמם, הרי געש סמוכים ואנדרטת אמצע העולם. חוו רכבל טלפריקו, שווקים צבעוניים, כנסיות היסטוריות עם פנים עלי זהב ושער לגלפגוס ולאמזונס."
  },
  "La Paz": {
    en: "The world's highest capital city (11,975 feet!) clings to Andean slopes with cable cars for transportation, witches' markets, pre-Columbian ruins at Tiwanaku, stunning Valle de la Luna, and indigenous Aymara culture. Experience altitude challenges, cholita wrestling, Death Road biking, and a uniquely Bolivian urban landscape.",
    he: "עיר הבירה הגבוהה ביותר בעולם (11,975 רגל!) נאחזת במדרונות האנדים עם רכבלים לתחבורה, שווקי מכשפות, חורבות קדם-קולומביאניות בטיוואנאקו, ואלה דה לה לונה מהמם ותרבות אימארה ילידית. חוו אתגרי גובה, היאבקות צ'וליטה, רכיבה על דרך המוות ונוף עירוני בוליביאני ייחודי."
  },
  "Montevideo": {
    en: "Uruguay's relaxed capital offers beautiful rambla waterfront, colonial Ciudad Vieja, tango culture, excellent beef and wine, progressive politics, and laid-back atmosphere. Experience Mercado del Puerto, beach neighborhoods, mate culture, candombe drumming, and a city that feels like a hidden South American gem.",
    he: "הבירה הרגועה של אורוגוואי מציעה רמבלה חופית יפה, סיודאד ויחה קולוניאלית, תרבות טנגו, בשר ויין מעולים, פוליטיקה פרוגרסיבית ואווירה נינוחה. חוו את מרקאדו דל פוארטו, שכונות חוף, תרבות מטה, תיפוף קנדומבה ועיר שמרגישה כמו פנינה דרום אמריקאית נסתרת."
  },
  "São Paulo": {
    en: "Brazil's megacity and economic powerhouse offers incredible diversity, world-class dining (from Japanese to Italian), vibrant street art, museums (MASP), nightlife, shopping, and cultural richness. Experience the concrete jungle's energy, Avenida Paulista, diverse neighborhoods, and South America's most cosmopolitan metropolis.",
    he: "מגה-עיר ברזיל ומעצמת הכלכלה מציעה גיוון מדהים, מסעדות ברמה עולמית (מיפנית לאיטלקית), אמנות רחוב תוססת, מוזיאונים (MASP), חיי לילה, קניות ועושר תרבותי. חוו את האנרגיה של ג'ונגל הבטון, אווניו פאוליסטה, שכונות מגוונות והמטרופולין הקוסמופוליטי ביותר בדרום אמריקה."
  },
  "Moscow": {
    en: "Russia's vast capital showcases onion-domed St. Basil's Cathedral, the Kremlin fortress, Red Square, Bolshoi Theatre, Soviet history, and endless cultural offerings. Experience metro stations that resemble palaces, traditional borscht and vodka, Tretyakov Gallery's art treasures, and a city where imperial grandeur meets communist legacy and modern ambition.",
    he: "הבירה העצומה של רוסיה מציגה את קתדרלת סנט בזיל עם כיפות הבצל, מבצר הקרמלין, הכיכר האדומה, תיאטרון בולשוי, היסטוריה סובייטית והצעות תרבותיות אינסופיות. חוו תחנות מטרו שנראות כמו ארמונות, בורשט ווודקה מסורתיים, אוצרות האמנות של גלריית טרטיאקוב ועיר שבה פאר קיסרי פוגש מורשת קומוניסטית ושאפתנות מודרנית."
  },
  "Seville": {
    en: "Andalusia's passionate capital enchants with flamenco dancing, the stunning Alcázar palace, Gothic cathedral with Giralda tower, tapas culture, orange-tree-lined streets, and authentic Spanish soul. Experience Semana Santa processions, bullfighting tradition, riverside promenades, and a city that defines southern Spanish charm with year-round sunshine.",
    he: "הבירה הנלהבת של אנדלוסיה מקסימה עם ריקוד פלמנקו, ארמון אלקזאר המהמם, קתדרלה גותית עם מגדל חירלדה, תרבות טאפאס, רחובות מרופדי עצי תפוז ונשמה ספרדית אותנטית. חוו תהלוכות סמאנה סנטה, מסורת מלחמת שוורים, טיילות נהר ועיר שמגדירה קסם דרום ספרדי עם שמש לאורך כל השנה."
  },
  "Munich": {
    en: "Bavaria's capital blends beer gardens, Oktoberfest celebrations, BMW headquarters, stunning Alps proximity, royal palaces like Nymphenburg, and Marienplatz's Glockenspiel. Experience lederhosen and dirndls, pretzels and weisswurst, world-class museums, English Garden larger than Central Park, and Bavarian traditions in Germany's most prosperous city.",
    he: "בירת בוואריה משלבת גני בירה, חגיגות אוקטוברפסט, מטה BMW, קרבה מהממת לאלפים, ארמונות מלכותיים כמו נימפנבורג וגלוקנשפיל של מריינפלאץ. חוו לדרהוזן ודירנדלס, בייגלה ווייסווורסט, מוזיאונים ברמה עולמית, גן אנגלי גדול מסנטרל פארק ומסורות בווריות בעיר המשגשגת ביותר של גרמניה."
  },
  "Jaipur": {
    en: "The 'Pink City' captivates with majestic forts (Amber, Jaigarh), City Palace, Hawa Mahal's intricate facade, vibrant bazaars, elephant rides, and Rajasthani heritage. Experience colorful textiles, traditional jewelry, palace hotels, authentic curries, and royal history in Rajasthan's capital that showcases India's regal splendor.",
    he: "העיר הוורודה' שובה לב עם מבצרים מלכותיים (עמבר, ג'איגאר), ארמון העיר, חזית מורכבת של האווה מאהל, שווקים תוססים, רכיבות על פילים ומורשת ראג'סטאני. חוו טקסטיל צבעוני, תכשיטים מסורתיים, מלונות ארמון, קארי אותנטי והיסטוריה מלכותית בבירת ראג'סטאן המציגה את הפאר המלכותי של הודו."
  },
  "Agra": {
    en: "Home to the breathtaking Taj Mahal, one of the Seven Wonders of the World, Agra offers this marble monument to eternal love alongside Agra Fort, Fatehpur Sikri, and Mughal architectural mastery. Experience sunrise views of the Taj, intricate inlay work, Mughlai cuisine, and India's most iconic symbol of romance and architectural perfection.",
    he: "ביתו של הטאג' מאהל עוצר הנשימה, אחד משבעת פלאי העולם, אגרה מציעה אנדרטת שיש זו לאהבה נצחית לצד מבצר אגרה, פאטהפור סיקרי ומומחיות אדריכלית מוגולית. חוו נופי זריחה של הטאג', עבודת שיבוץ מורכבת, מטבח מוגלאי והסמל האיקוני ביותר של הודו לרומנטיקה ושלמות אדריכלית."
  },
  "Jerusalem": {
    en: "One of the world's oldest and holiest cities, Jerusalem holds sacred sites for Judaism, Christianity, and Islam. Walk ancient streets, visit the Western Wall, Church of the Holy Sepulchre, Dome of the Rock, vibrant markets, and experience millennia of history, faith, and cultural convergence in this profoundly moving destination.",
    he: "אחת הערים העתיקות והקדושות ביותר בעולם, ירושלים מכילה אתרים קדושים ליהדות, נצרות ואיסלאם. טיילו ברחובות עתיקים, בקרו בכותל המערבי, כנסיית הקבר הקדוש, כיפת הסלע, שווקים תוססים וחוו אלפי שנות היסטוריה, אמונה והתכנסות תרבותית ביעד מרגש עמוקות זה."
  },
  "Mexico City": {
    en: "One of the world's largest metropolises offers ancient Aztec ruins (Templo Mayor), colonial architecture, world-class museums (Frida Kahlo, Anthropology), vibrant street food, mariachi music, and incredible tacos. Experience Zócalo square, Chapultepec Park, Xochimilco's floating gardens, and a city where pre-Hispanic heritage meets modern Latin American energy.",
    he: "אחת המטרופולינים הגדולים בעולם מציעה חורבות אצטקיות עתיקות (טמפלו מאיור), אדריכלות קולוניאלית, מוזיאונים ברמה עולמית (פרידה קאלו, אנתרופולוגיה), אוכל רחוב תוסס, מוזיקת מריאצ'י וטאקו מדהים. חוו את כיכר הסוקאלו, פארק צ'אפולטפק, גנים צפים של קסוצ'ימילקו ועיר שבה מורשת פרה-היספנית פוגשת אנרגיה אמריקה לטינית מודרנית."
  },
  "Medellin": {
    en: "Once notorious, now innovative—the City of Eternal Spring boasts perfect year-round weather, modern metro system, Comuna 13's transformation story, vibrant nightlife in Poblado, Fernando Botero sculptures, and proud paisa culture. Experience cable cars connecting hillside neighborhoods, salsa dancing, coffee tours, and a city reborn.",
    he: "פעם ידועה לשמצה, כיום חדשנית - עיר האביב הנצחי מתגאה במזג אוויר מושלם לאורך כל השנה, מערכת מטרו מודרנית, סיפור השינוי של קומונה 13, חיי לילה תוססים בפובלאדו, פסלי פרננדו בוטרו ותרבות פאיסה גאה. חוו רכבלים המחברים שכונות גבעות, ריקוד סלסה, סיורי קפה ועיר שנולדה מחדש."
  },
  "Jakarta": {
    en: "Indonesia's bustling capital offers a mix of modern skyscrapers, Dutch colonial architecture, vibrant street markets, diverse cuisine, and gateway to Indonesian islands. Experience the National Monument (Monas), old town (Kota Tua), shopping malls, street food paradise, and a city representing Southeast Asia's largest economy with chaotic energy.",
    he: "הבירה הסואנת של אינדונזיה מציעה שילוב של גורדי שחקים מודרניים, אדריכלות קולוניאלית הולנדית, שווקי רחוב תוססים, מטבח מגוון ושער לאיי אינדונזיה. חוו את האנדרטה הלאומית (מונאס), העיר העתיקה (קוטה טואה), קניונים, גן עדן של אוכל רחוב ועיר המייצגת את הכלכלה הגדולה ביותר בדרום מזרח אסיה עם אנרגיה כאוטית."
  },
  "Tel Aviv": {
    en: "Israel's vibrant Mediterranean city pulses with beaches, Bauhaus architecture (White City UNESCO site), thriving tech scene, 24/7 nightlife, diverse culinary scene, and liberal atmosphere. Experience beach culture, Carmel Market, ancient Jaffa, gay-friendly environment, and a city that never stops celebrating life with innovation and hedonism.",
    he: "העיר הים-תיכונית התוססת של ישראל פועמת עם חופים, אדריכלות באוהאוס (העיר הלבנה - אתר UNESCO), סצנת טק משגשגת, חיי לילה 24/7, סצנת קולינריה מגוונת ואווירה ליברלית. חוו תרבות חוף, שוק הכרמל, יפו העתיקה, סביבה ידידותית להומואים ועיר שלעולם לא מפסיקה לחגוג את החיים עם חדשנות והנאות."
  },
  "Bogota": {
    en: "Colombia's high-altitude capital (8,660 ft) offers colonial La Candelaria quarter, world-class museums (Gold Museum), vibrant street art, Monserrate mountain views, emerging culinary scene, and improving safety. Experience ciclovía (car-free Sundays), coffee culture, salsa clubs, and a city shedding its troubled past.",
    he: "הבירה בגובה רב של קולומביה (8,660 רגל) מציעה רובע לה קנדלריה הקולוניאלי, מוזיאונים ברמה עולמית (מוזיאון הזהב), אמנות רחוב תוססת, נופי הר מונסראטה, סצנת קולינריה מתפתחת ושיפור בטיחות. חוו ciclovía (ראשונות ללא מכוניות), תרבות קפה, מועדוני סלסה ועיר משילה עברה בעייתי."
  },
  "Sao Paulo": {
    en: "Brazil's megacity and economic powerhouse offers incredible diversity, world-class dining (from Japanese to Italian), vibrant street art, museums (MASP), nightlife, shopping, and cultural richness. Experience the concrete jungle's energy, Avenida Paulista, diverse neighborhoods, and South America's most cosmopolitan metropolis.",
    he: "מגה-עיר ברזיל ומעצמת הכלכלה מציעה גיוון מדהים, מסעדות ברמה עולמית (מיפנית לאיטלקית), אמנות רחוב תוססת, מוזיאונים (MASP), חיי לילה, קניות ועושר תרבותי. חוו את האנרגיה של ג'ונגל הבטון, אווניו פאוליסטה, שכונות מגוונות והמטרופולין הקוסמופוליטי ביותר בדרום אמריקה."
  }
};

async function updateDescriptions() {
  console.log("Starting to update destination descriptions...");
  
  try {
    // Get all destinations
    const allDestinations = await db.select().from(destinations);
    console.log(`Found ${allDestinations.length} destinations to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const destination of allDestinations) {
      const descriptions = destinationDescriptions[destination.name];
      
      if (!descriptions) {
        console.log(`⚠️  No descriptions found for: ${destination.name}`);
        skippedCount++;
        continue;
      }
      
      // Update English description in destinations table
      await db
        .update(destinations)
        .set({ description: descriptions.en })
        .where(eq(destinations.id, destination.id));
      
      // Update Hebrew description in destinations_i18n table
      await db
        .update(destinationsI18n)
        .set({ description: descriptions.he })
        .where(eq(destinationsI18n.destinationId, destination.id));
      
      updatedCount++;
      console.log(`✅ Updated: ${destination.name}`);
    }
    
    console.log("\n📊 Summary:");
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   📝 Total: ${allDestinations.length}`);
    
  } catch (error) {
    console.error("❌ Error updating descriptions:", error);
    throw error;
  }
}

// Run the update
updateDescriptions()
  .then(() => {
    console.log("\n✨ All descriptions updated successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed to update descriptions:", error);
    process.exit(1);
  });
