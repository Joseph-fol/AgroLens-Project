import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { seedMongoDatabase } from './seedData';

type MemoryServerInstance = {
  getUri: (dbName?: string) => string;
  stop: () => Promise<boolean>;
};

interface MongooseGlobalCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
  memoryServer: MemoryServerInstance | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __agrolensMongooseCache?: MongooseGlobalCache;
};

const cache: MongooseGlobalCache = globalForMongoose.__agrolensMongooseCache || {
  conn: null,
  promise: null,
  seeded: false,
  memoryServer: null,
};

globalForMongoose.__agrolensMongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1 && cache.conn) {
    if (!cache.seeded) {
      await seedMongoDatabase();
      cache.seeded = true;
    }
    return cache.conn;
  }

  if (cache.promise) {
    return cache.promise;
  }

  cache.promise = (async () => {
    const externalUri = process.env.MONGODB_URI?.trim();
    const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

    if (externalUri) {
      const conn = await mongoose.connect(externalUri, {
        dbName: process.env.MONGODB_DB_NAME || 'agrolens',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      });
      cache.conn = conn;
      if (!cache.seeded) {
        await seedMongoDatabase();
        cache.seeded = true;
      }
      return conn;
    }

    if (isVercel) {
      throw new Error(
        'MONGODB_URI is required in Vercel serverless deployments. Add MONGODB_URI to your Vercel Environment Variables.'
      );
    }

    // Start persistent local MongoDB daemon via mongodb-memory-server when MONGODB_URI is not provided locally
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(process.cwd(), 'server', 'data', 'mongodb');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    const lockFile = path.join(dbPath, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch {
        // Ignore lock cleanup failure
      }
    }

    try {
      cache.memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'agrolens',
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
    } catch {
      cache.memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'agrolens',
        },
      });
    }

    const uri = cache.memoryServer.getUri('agrolens');
    const conn = await mongoose.connect(uri);
    cache.conn = conn;
    console.log(`Connected Mongoose to local MongoDB instance (${uri}).`);

    if (!cache.seeded) {
      await seedMongoDatabase();
      cache.seeded = true;
    }
    console.log('AgroLens MongoDB collections seeded and ready.');
    return conn;
  })().catch((err) => {
    cache.promise = null;
    throw err;
  });

  return cache.promise;
}

export async function closeDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (cache.memoryServer) {
    await cache.memoryServer.stop();
    cache.memoryServer = null;
  }
  cache.conn = null;
  cache.promise = null;
  cache.seeded = false;
}

export function getDatabaseStatus() {
  const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || 'agrolens',
    mode: process.env.MONGODB_URI ? 'external-mongodb' : 'local-mongodb-wiredtiger',
    runtime: isVercel ? 'vercel-serverless' : 'local-node-express',
  };
}
