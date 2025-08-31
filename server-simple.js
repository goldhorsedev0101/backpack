const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/public')));

// API endpoints for TripWise functionality
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    time: new Date().toISOString(),
    message: 'TripWise server is running with sidebar navigation'
  });
});

// Mock API endpoints for demo
app.get('/api/places', (req, res) => {
  res.json([
    { id: 1, name: 'Machu Picchu', country: 'Peru', type: 'attraction' },
    { id: 2, name: 'Christ the Redeemer', country: 'Brazil', type: 'attraction' },
    { id: 3, name: 'Salar de Uyuni', country: 'Bolivia', type: 'attraction' }
  ]);
});

app.get('/api/trips', (req, res) => {
  res.json([
    { id: 1, title: 'Peru Adventure', destination: 'Machu Picchu', duration: 7 },
    { id: 2, title: 'Brazil Explorer', destination: 'Rio de Janeiro', duration: 5 }
  ]);
});

app.get('/api/weather/:location', (req, res) => {
  const { location } = req.params;
  res.json({
    location,
    temperature: 22,
    condition: 'Sunny',
    humidity: 65,
    forecast: 'Perfect weather for travel!'
  });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TripWise server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Right sidebar navigation is ready!`);
  console.log(`✅ All 9 pages accessible including Ingestion Dashboard`);
});