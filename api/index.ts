import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBackendApp } from '../server/src/app';

const app = createBackendApp({ standaloneApiServer: true });

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
