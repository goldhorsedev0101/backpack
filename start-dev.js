import { spawn } from 'child_process';

const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('Error starting dev server:', error);
});

devServer.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
});