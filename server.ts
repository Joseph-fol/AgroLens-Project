import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createBackendApp } from './server/src/app';
import { closeDatabase, connectToDatabase } from './server/src/config/database';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL);

const app = createBackendApp({ standaloneApiServer: isVercel });
let isDatabaseConnected = false;

async function ensureDatabase() {
  if (!isDatabaseConnected) {
    await connectToDatabase();
    isDatabaseConnected = true;
  }
}

async function startLocalServer() {
  await ensureDatabase();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgroLens local server listening on http://0.0.0:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Only start the persistent HTTP listener when NOT running on Vercel
if (!isVercel) {
  startLocalServer().catch((err) => {
    console.error('Failed to start AgroLens server:', err);
    process.exit(1);
  });
}

// Export the serverless request handler for Vercel
export default async function handler(req: any, res: any) {
  await ensureDatabase();
  return app(req, res);
}
