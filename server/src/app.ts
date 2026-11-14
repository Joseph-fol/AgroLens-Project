import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/database';
import { apiRouter } from './routes/api';

export interface BackendAppOptions {
  /** Mount root JSON status routes when deployed as a standalone API server (e.g., Vercel serverless). */
  standaloneApiServer?: boolean;
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://agrolensserver.vercel.app',
];

function buildAllowedOrigins(): string[] {
  const extra = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]));
}

export function createBackendApp(options: BackendAppOptions = {}) {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server, curl, same-origin, AI Studio preview hosts, and Vercel hosts
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.run.app')
        ) {
          callback(null, true);
          return;
        }
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  );

  app.use(express.json({ limit: '2mb' }));

  // Ensure MongoDB / Mongoose connection is established on serverless cold starts
  const ensureDb = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await connectToDatabase();
      next();
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Database connection unavailable',
      });
    }
  };

  app.use('/api', ensureDb, apiRouter);

  if (options.standaloneApiServer) {
    // Also support root health/info & direct API routes without '/api' prefix when hit on agrolensserver.vercel.app
    app.get('/', (_req, res) => {
      res.json({
        service: 'AgroLens Backend API',
        status: 'online',
        environment: process.env.VERCEL ? 'vercel-serverless' : 'local',
        deployedUrl: 'https://agrolensserver.vercel.app',
        healthEndpoint: '/api/health',
      });
    });

    app.use('/', ensureDb, apiRouter);
  }

  return app;
}
