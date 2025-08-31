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
  app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // Demo mode - skip auth for faster loading
  console.log('Demo mode: running without authentication for faster startup');

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
  server.keepAliveTimeout = 5000;  // Reduced for faster response
  server.headersTimeout = 6000;   // Reduced for faster response
  server.requestTimeout = 5000;   // Reduced for faster response

  // Setup Vite in development mode
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  }

  server.listen(PORT, HOST, () => {
    console.log(`[server] listening on http://${HOST}:${PORT}`);
    console.log(`[server] PORT env = ${process.env.PORT ?? "(undefined)"}`);
    console.log(`[server] Ready to serve TripWise with right sidebar!`);
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