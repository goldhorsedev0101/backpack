const { spawn } = require('child_process');

const env = {
  ...process.env,
  DATABASE_URL: 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
};

const child = spawn('npx', ['drizzle-kit', 'push', '--force'], {
  env: env,
  stdio: ['pipe', 'inherit', 'inherit']
});

// Send default answers to the interactive prompts
setTimeout(() => {
  child.stdin.write('\n'); // Select first option (create table)
}, 2000);

setTimeout(() => {
  child.stdin.write('y\n'); // Confirm
}, 4000);

child.on('close', (code) => {
  console.log(`Migration finished with code ${code}`);
});
