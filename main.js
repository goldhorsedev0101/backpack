const { spawn } = require('child_process');

// Start the application
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start application:', err);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
});