#!/usr/bin/env node

console.log('Starting TripWise server...');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

// Import and start the server
import('./server/index.ts')
  .then(() => {
    console.log('Server started successfully');
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });