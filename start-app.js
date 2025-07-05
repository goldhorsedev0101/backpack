const { spawn } = require('child_process');

console.log('Starting TripWise application...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});