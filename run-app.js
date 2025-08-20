import { spawn } from 'child_process';
import path from 'path';

console.log('Starting TripWise application...');

const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    PORT: '5000'
  },
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});