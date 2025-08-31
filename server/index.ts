import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes.js';
import { setupVite } from './vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint for monitoring
  app.get('/health-check', (_req, res) => res.send('OK'));

  await registerRoutes(app);

  const publicDir = path.join(__dirname, '../dist/public');
  app.use(express.static(publicDir));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).end();
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  const PORT = Number(process.env.PORT) || 5000;
  const HOST = '0.0.0.0';
  const server = createServer(app);
  server.keepAliveTimeout = 61000;
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;

  // Setup Vite in development mode
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  }

  server.listen(PORT, HOST, () => {
    console.log(`[server] listening on http://${HOST}:${PORT}`);
    console.log(`[server] PORT env = ${process.env.PORT ?? "(undefined)"}`);
  });
}

startServer().catch(console.error);

// טיפול בשגיאות גלובליות
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});