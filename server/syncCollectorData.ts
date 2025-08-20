import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple script to sync collector data with main app
 * Copies SQLite data and creates API endpoints for access
 */
export async function syncCollectorData() {
  try {
    // Check if collector database exists
    const collectorDbPath = path.join('tripwise', 'tripwise.db');
    if (!fs.existsSync(collectorDbPath)) {
      console.log('No collector database found');
      return;
    }

    // Copy collector database to main directory for easy access
    const mainDbPath = path.join('collected_places.db');
    fs.copyFileSync(collectorDbPath, mainDbPath);
    
    console.log('✓ Collector data synced to main app');
    console.log(`  Database: ${mainDbPath}`);
    
    // Get stats
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(mainDbPath);
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT COUNT(*) as places FROM places", (err, placesRow) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.get("SELECT COUNT(*) as reviews FROM reviews", (err, reviewsRow) => {
            if (err) {
              reject(err);
              return;
            }
            
            console.log(`  Places: ${placesRow.places}`);
            console.log(`  Reviews: ${reviewsRow.reviews}`);
            
            db.close();
            resolve({ places: placesRow.places, reviews: reviewsRow.reviews });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error syncing collector data:', error);
    throw error;
  }
}

// Add API endpoints to server/routes.ts for accessing collector data
const apiEndpoints = `
// Collector Data API Endpoints
app.get('/api/collector/places', async (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('collected_places.db');
  
  const { search, country, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM places WHERE 1=1';
  const params = [];
  
  if (search) {
    query += ' AND (name LIKE ? OR address LIKE ?)';
    params.push(\`%\${search}%\`, \`%\${search}%\`);
  }
  
  if (country) {
    query += ' AND address LIKE ?';
    params.push(\`%\${country}%\`);
  }
  
  query += ' ORDER BY rating DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const places = rows.map(row => ({
        ...row,
        types: JSON.parse(row.types || '[]'),
        reviews_count: row.reviews_count || 0
      }));
      res.json({ places, total: places.length });
    }
    db.close();
  });
});

app.get('/api/collector/places/:placeId/reviews', async (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('collected_places.db');
  
  const { placeId } = req.params;
  
  db.all('SELECT * FROM reviews WHERE place_id = ? ORDER BY rating DESC', [placeId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ reviews: rows });
    }
    db.close();
  });
});

app.get('/api/collector/stats', async (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('collected_places.db');
  
  db.serialize(() => {
    let stats = {};
    
    db.get('SELECT COUNT(*) as places FROM places', (err, placesRow) => {
      if (!err) stats.places = placesRow.places;
      
      db.get('SELECT COUNT(*) as reviews FROM reviews', (err, reviewsRow) => {
        if (!err) stats.reviews = reviewsRow.reviews;
        
        db.all(\`
          SELECT SUBSTR(address, -20) as country, COUNT(*) as count 
          FROM places 
          WHERE address IS NOT NULL 
          GROUP BY SUBSTR(address, -20) 
          ORDER BY count DESC 
          LIMIT 10
        \`, (err, countryRows) => {
          if (!err) stats.countries = countryRows;
          
          db.get('SELECT AVG(rating) as avgRating FROM places WHERE rating > 0', (err, avgRow) => {
            if (!err) stats.averageRating = avgRow.avgRating;
            
            res.json(stats);
            db.close();
          });
        });
      });
    });
  });
});
`;

console.log('To integrate collector data with main app, add these API endpoints to server/routes.ts:');
console.log(apiEndpoints);

if (require.main === module) {
  syncCollectorData()
    .then((stats) => {
      console.log('✓ Sync completed:', stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Sync failed:', error);
      process.exit(1);
    });
}