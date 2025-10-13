-- Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  destinations JSONB NOT NULL,
  total_nights INTEGER NOT NULL,
  price_min NUMERIC(10,2) NOT NULL,
  price_max NUMERIC(10,2) NOT NULL,
  season TEXT[],
  tags TEXT[],
  audience_tags TEXT[],
  rating NUMERIC(3,2) DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  hero_image TEXT,
  images TEXT[],
  daily_itinerary JSONB,
  costs_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert Classic Japan Circuit
INSERT INTO journeys (title, description, destinations, total_nights, price_min, price_max, season, tags, audience_tags, rating, popularity, hero_image, images, daily_itinerary, costs_breakdown)
VALUES (
  'Classic Japan Circuit',
  'Discover the perfect blend of ancient traditions and modern innovation across Japan''s most iconic cities',
  '[{"name":"Tokyo","country":"Japan","nights":4,"transport":{"type":"flight","cost":450,"duration":"Start point"}},{"name":"Kyoto","country":"Japan","nights":3,"transport":{"type":"bullet_train","cost":140,"duration":"2h 15m"}},{"name":"Osaka","country":"Japan","nights":2,"transport":{"type":"train","cost":15,"duration":"30m"}}]'::jsonb,
  9,
  1800,
  3200,
  ARRAY['spring', 'fall', 'year-round'],
  ARRAY['culture', 'food', 'nightlife', 'nature'],
  ARRAY['couple', 'solo', 'friends', '12+'],
  4.8,
  95,
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
  ARRAY['https://images.unsplash.com/photo-1490806843957-31f4c9a91c65', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9'],
  '{"0":[{"day":1,"activities":["Senso-ji Temple","Shibuya Crossing","Tokyo Tower evening view"],"duration":"8 hours","estimatedCost":60},{"day":2,"activities":["Tsukiji Outer Market","Imperial Palace Gardens","Harajuku & Omotesando"],"duration":"8 hours","estimatedCost":80},{"day":3,"activities":["teamLab Borderless","Odaiba waterfront","Akihabara electronics district"],"duration":"8 hours","estimatedCost":70},{"day":4,"activities":["Meiji Shrine","Yoyogi Park","Shinjuku nightlife"],"duration":"7 hours","estimatedCost":90}],"1":[{"day":5,"activities":["Fushimi Inari Shrine","Arashiyama Bamboo Grove","Kinkaku-ji Golden Pavilion"],"duration":"9 hours","estimatedCost":50},{"day":6,"activities":["Kiyomizu-dera Temple","Gion geisha district","Pontocho alley dining"],"duration":"8 hours","estimatedCost":100},{"day":7,"activities":["Nijo Castle","Philosopher''s Path","Traditional tea ceremony"],"duration":"7 hours","estimatedCost":80}],"2":[{"day":8,"activities":["Osaka Castle","Dotonbori street food","Kuromon Market"],"duration":"8 hours","estimatedCost":70},{"day":9,"activities":["Universal Studios Japan","Evening canal cruise"],"duration":"10 hours","estimatedCost":120}]}'::jsonb,
  '{"transport":{"min":605,"max":805},"activities":{"min":500,"max":800},"lodging":{"min":700,"max":1600}}'::jsonb
);

-- Insert European Capital Tour
INSERT INTO journeys (title, description, destinations, total_nights, price_min, price_max, season, tags, audience_tags, rating, popularity, hero_image, images, daily_itinerary, costs_breakdown)
VALUES (
  'European Capital Tour',
  'Experience the art, culture, and history of three magnificent European capitals in one unforgettable journey',
  '[{"name":"Paris","country":"France","nights":4,"transport":{"type":"flight","cost":350,"duration":"Start point"}},{"name":"Amsterdam","country":"Netherlands","nights":3,"transport":{"type":"train","cost":95,"duration":"3h 20m"}},{"name":"Berlin","country":"Germany","nights":3,"transport":{"type":"train","cost":80,"duration":"6h 30m"}}]'::jsonb,
  10,
  2200,
  4000,
  ARRAY['spring', 'summer', 'fall'],
  ARRAY['culture', 'food', 'nightlife', 'art'],
  ARRAY['couple', 'friends', 'solo', '12+'],
  4.7,
  88,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  ARRAY['https://images.unsplash.com/photo-1534351590666-13e3e96b5017', 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f'],
  '{"0":[{"day":1,"activities":["Eiffel Tower","Seine River cruise","Champs-Élysées walk"],"duration":"8 hours","estimatedCost":80},{"day":2,"activities":["Louvre Museum","Notre-Dame area","Latin Quarter"],"duration":"9 hours","estimatedCost":70},{"day":3,"activities":["Versailles Palace day trip","Palace gardens"],"duration":"8 hours","estimatedCost":100},{"day":4,"activities":["Montmartre & Sacré-Cœur","Moulin Rouge area","Le Marais district"],"duration":"8 hours","estimatedCost":90}],"1":[{"day":5,"activities":["Canal cruise","Anne Frank House","Jordaan neighborhood"],"duration":"8 hours","estimatedCost":70},{"day":6,"activities":["Van Gogh Museum","Rijksmuseum","Vondelpark"],"duration":"8 hours","estimatedCost":60},{"day":7,"activities":["Bike tour","De Wallen district","Evening canal walk"],"duration":"7 hours","estimatedCost":50}],"2":[{"day":8,"activities":["Brandenburg Gate","Reichstag building","Holocaust Memorial"],"duration":"8 hours","estimatedCost":40},{"day":9,"activities":["Museum Island","East Side Gallery","Checkpoint Charlie"],"duration":"8 hours","estimatedCost":50},{"day":10,"activities":["Charlottenburg Palace","KaDeWe shopping","Berlin nightlife"],"duration":"8 hours","estimatedCost":80}]}'::jsonb,
  '{"transport":{"min":525,"max":725},"activities":{"min":600,"max":900},"lodging":{"min":1075,"max":2375}}'::jsonb
);

-- Insert Southeast Asia Adventure
INSERT INTO journeys (title, description, destinations, total_nights, price_min, price_max, season, tags, audience_tags, rating, popularity, hero_image, images, daily_itinerary, costs_breakdown)
VALUES (
  'Southeast Asia Adventure',
  'From bustling Bangkok to serene temples and paradise beaches - the ultimate Thai experience',
  '[{"name":"Bangkok","country":"Thailand","nights":3,"transport":{"type":"flight","cost":800,"duration":"Start point"}},{"name":"Chiang Mai","country":"Thailand","nights":4,"transport":{"type":"flight","cost":60,"duration":"1h 20m"}},{"name":"Phuket","country":"Thailand","nights":4,"transport":{"type":"flight","cost":70,"duration":"2h"}}]'::jsonb,
  11,
  1400,
  2800,
  ARRAY['winter', 'spring', 'year-round'],
  ARRAY['adventure', 'nature', 'food', 'nightlife'],
  ARRAY['solo', 'couple', 'friends', 'group', '12+'],
  4.9,
  92,
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  ARRAY['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1'],
  '{"0":[{"day":1,"activities":["Grand Palace","Wat Pho temple","Khao San Road"],"duration":"8 hours","estimatedCost":40},{"day":2,"activities":["Floating markets","Wat Arun","Rooftop bar evening"],"duration":"9 hours","estimatedCost":60},{"day":3,"activities":["Chatuchak Market","Jim Thompson House","Thai cooking class"],"duration":"8 hours","estimatedCost":80}],"1":[{"day":4,"activities":["Doi Suthep temple","Old City temples tour","Night bazaar"],"duration":"9 hours","estimatedCost":50},{"day":5,"activities":["Elephant sanctuary visit","Organic farm lunch"],"duration":"8 hours","estimatedCost":100},{"day":6,"activities":["Doi Inthanon National Park","Hill tribe villages"],"duration":"10 hours","estimatedCost":70},{"day":7,"activities":["Thai massage course","Art galleries","Riverside dining"],"duration":"7 hours","estimatedCost":90}],"2":[{"day":8,"activities":["Phi Phi Islands day tour","Snorkeling"],"duration":"9 hours","estimatedCost":120},{"day":9,"activities":["Patong Beach","Big Buddha","Sunset viewpoint"],"duration":"8 hours","estimatedCost":60},{"day":10,"activities":["Phang Nga Bay kayaking","James Bond Island"],"duration":"9 hours","estimatedCost":110},{"day":11,"activities":["Beach relaxation","Old Phuket Town","Bangla Road nightlife"],"duration":"8 hours","estimatedCost":70}]}'::jsonb,
  '{"transport":{"min":930,"max":1100},"activities":{"min":450,"max":750},"lodging":{"min":420,"max":950}}'::jsonb
);

-- Insert Mediterranean Dream
INSERT INTO journeys (title, description, destinations, total_nights, price_min, price_max, season, tags, audience_tags, rating, popularity, hero_image, images, daily_itinerary, costs_breakdown)
VALUES (
  'Mediterranean Dream',
  'Sun-soaked coastlines, world-class cuisine, and timeless culture across three Mediterranean gems',
  '[{"name":"Barcelona","country":"Spain","nights":4,"transport":{"type":"flight","cost":400,"duration":"Start point"}},{"name":"Nice","country":"France","nights":3,"transport":{"type":"train","cost":85,"duration":"7h"}},{"name":"Rome","country":"Italy","nights":4,"transport":{"type":"flight","cost":120,"duration":"1h 30m"}}]'::jsonb,
  11,
  2400,
  4500,
  ARRAY['spring', 'summer', 'fall'],
  ARRAY['culture', 'food', 'nature', 'art'],
  ARRAY['couple', 'family', 'friends', '12+'],
  4.6,
  85,
  'https://images.unsplash.com/photo-1583422409516-2895a77efded',
  ARRAY['https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'],
  '{"0":[{"day":1,"activities":["Sagrada Família","Park Güell","Gothic Quarter"],"duration":"9 hours","estimatedCost":80},{"day":2,"activities":["La Rambla","Boqueria Market","Barcelona beach"],"duration":"8 hours","estimatedCost":70},{"day":3,"activities":["Montjuïc hill","Magic Fountain","Tapas tour"],"duration":"8 hours","estimatedCost":100},{"day":4,"activities":["Casa Batlló","Passeig de Gràcia","Barceloneta"],"duration":"8 hours","estimatedCost":90}],"1":[{"day":5,"activities":["Promenade des Anglais","Old Town Nice","Castle Hill"],"duration":"8 hours","estimatedCost":60},{"day":6,"activities":["Monaco day trip","Monte Carlo Casino","Eze village"],"duration":"10 hours","estimatedCost":120},{"day":7,"activities":["Cours Saleya market","Matisse Museum","Beach time"],"duration":"7 hours","estimatedCost":70}],"2":[{"day":8,"activities":["Colosseum","Roman Forum","Palatine Hill"],"duration":"9 hours","estimatedCost":80},{"day":9,"activities":["Vatican Museums","Sistine Chapel","St. Peter''s Basilica"],"duration":"9 hours","estimatedCost":70},{"day":10,"activities":["Trevi Fountain","Spanish Steps","Pantheon"],"duration":"8 hours","estimatedCost":60},{"day":11,"activities":["Trastevere neighborhood","Villa Borghese","Roman dining"],"duration":"8 hours","estimatedCost":90}]}'::jsonb,
  '{"transport":{"min":605,"max":805},"activities":{"min":800,"max":1200},"lodging":{"min":995,"max":2495}}'::jsonb
);

-- Insert East Coast USA Explorer
INSERT INTO journeys (title, description, destinations, total_nights, price_min, price_max, season, tags, audience_tags, rating, popularity, hero_image, images, daily_itinerary, costs_breakdown)
VALUES (
  'East Coast USA Explorer',
  'From the Big Apple to historic Boston - explore America''s most iconic East Coast cities',
  '[{"name":"New York","country":"USA","nights":4,"transport":{"type":"flight","cost":500,"duration":"Start point"}},{"name":"Philadelphia","country":"USA","nights":2,"transport":{"type":"train","cost":45,"duration":"1h 30m"}},{"name":"Washington DC","country":"USA","nights":3,"transport":{"type":"train","cost":50,"duration":"2h"}},{"name":"Boston","country":"USA","nights":3,"transport":{"type":"train","cost":80,"duration":"7h"}}]'::jsonb,
  12,
  2800,
  5000,
  ARRAY['spring', 'summer', 'fall'],
  ARRAY['culture', 'food', 'nightlife', 'art'],
  ARRAY['couple', 'family', 'friends', '12+'],
  4.5,
  78,
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
  ARRAY['https://images.unsplash.com/photo-1501594907352-04cda38ebc29', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'],
  '{"0":[{"day":1,"activities":["Statue of Liberty","Ellis Island","Brooklyn Bridge walk"],"duration":"9 hours","estimatedCost":80},{"day":2,"activities":["Central Park","Metropolitan Museum","Times Square"],"duration":"8 hours","estimatedCost":90},{"day":3,"activities":["9/11 Memorial","One World Observatory","SoHo shopping"],"duration":"8 hours","estimatedCost":100},{"day":4,"activities":["Broadway show","High Line park","Chelsea Market"],"duration":"7 hours","estimatedCost":150}],"1":[{"day":5,"activities":["Liberty Bell","Independence Hall","Reading Terminal Market"],"duration":"8 hours","estimatedCost":60},{"day":6,"activities":["Philadelphia Museum of Art","Rocky Steps","Philly cheesesteak tour"],"duration":"7 hours","estimatedCost":70}],"2":[{"day":7,"activities":["Lincoln Memorial","Washington Monument","National Mall"],"duration":"9 hours","estimatedCost":50},{"day":8,"activities":["Smithsonian Museums","White House tour","Georgetown"],"duration":"8 hours","estimatedCost":60},{"day":9,"activities":["Capitol Hill","Library of Congress","Arlington Cemetery"],"duration":"8 hours","estimatedCost":40}],"3":[{"day":10,"activities":["Freedom Trail","Faneuil Hall","Boston Harbor"],"duration":"8 hours","estimatedCost":70},{"day":11,"activities":["Harvard University","MIT campus","Cambridge exploration"],"duration":"7 hours","estimatedCost":50},{"day":12,"activities":["Fenway Park","North End Italian food","Boston Common"],"duration":"8 hours","estimatedCost":90}]}'::jsonb,
  '{"transport":{"min":675,"max":875},"activities":{"min":900,"max":1300},"lodging":{"min":1225,"max":2825}}'::jsonb
);

-- Verify data
SELECT COUNT(*) as total_journeys FROM journeys;
SELECT title, total_nights, price_min, price_max FROM journeys ORDER BY popularity DESC;
