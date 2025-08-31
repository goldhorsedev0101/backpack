#!/usr/bin/env node

const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve built files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    time: new Date().toISOString(),
    message: 'TripWise running with right sidebar navigation',
    features: ['Sidebar', 'All 9 pages', 'Ingestion Dashboard']
  });
});

// API routes for demo
app.get('/api/places', (req, res) => {
  res.json([
    { id: 1, name: 'Machu Picchu', country: 'Peru' },
    { id: 2, name: 'Cristo Redentor', country: 'Brazil' },
    { id: 3, name: 'Salar de Uyuni', country: 'Bolivia' }
  ]);
});

// Catch all - serve React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not found' });
  }
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TripWise server started on http://0.0.0.0:${PORT}`);
  console.log(`📱 Right sidebar with 9 navigation items ready!`);
  console.log(`✅ Ingestion Dashboard accessible at /ingestion-dashboard`);
});