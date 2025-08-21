-- Export script for migrating to Supabase
-- Run this in your current database to get data for Supabase

-- Count existing data
SELECT 'Users count:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Place reviews count:', COUNT(*) FROM place_reviews
UNION ALL
SELECT 'Chat rooms count:', COUNT(*) FROM chat_rooms
UNION ALL  
SELECT 'Travel buddy posts count:', COUNT(*) FROM travel_buddy_posts;

-- Export users table
\copy (SELECT * FROM users) TO 'users_export.csv' WITH CSV HEADER;

-- Export place reviews
\copy (SELECT * FROM place_reviews) TO 'place_reviews_export.csv' WITH CSV HEADER;

-- Export chat rooms
\copy (SELECT * FROM chat_rooms) TO 'chat_rooms_export.csv' WITH CSV HEADER;

-- Export travel buddy posts  
\copy (SELECT * FROM travel_buddy_posts) TO 'travel_buddy_posts_export.csv' WITH CSV HEADER;