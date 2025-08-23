// server/index.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes'; // הפונקציה שלכם שמרשמת /api/*
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // חשוב מאחורי פרוקסי (Replit):
  app.set('trust proxy', 1);

  // בסיסי
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // סטטיק לקליינט הבנוי (התאם מיקום build בפועל):
  const publicDir = path.join(__dirname, '../dist/public');
  app.use(express.static(publicDir));

  // רישום כל הראוטים של ה-API
  const httpServer = await registerRoutes(app);

  // (אופציונלי אך מומלץ) timeouts כדי שלא ייחתכו חיבורים ארוכים:
  httpServer.keepAliveTimeout = 61_000;
  httpServer.headersTimeout = 65_000;
  httpServer.requestTimeout = 60_000;

  // Fallback ל-SPA (אחרי כל /api/*):
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).end();
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  // אם registerRoutes לא יצר httpServer, ניצור אחד כאן:
  const serverToListen = httpServer ?? createServer(app);

  serverToListen.listen(PORT, HOST, () => {
    console.log(`[server] listening on http://${HOST}:${PORT}`);
    console.log(`📍 Health: http://${HOST}:${PORT}/api/health`);
    console.log(`🗺️  Places: http://${HOST}:${PORT}/api/places`);
    console.log(`💬 Reviews: http://${HOST}:${PORT}/api/place-reviews`);
    console.log(`👥 Community: http://${HOST}:${PORT}/api/community`);
    console.log(`🔗 Supabase: Connected via Transaction Pooler`);
  });
}

// הפעלת השרת
startServer().catch(console.error);

// טיפול בשגיאות גלובליות
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});