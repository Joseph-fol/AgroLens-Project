import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedMongoDatabase } from './seedData';

let memoryServer: MongoMemoryServer | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const externalUri = process.env.MONGODB_URI?.trim();

    if (externalUri) {
      console.log('Connecting Mongoose to configured MONGODB_URI...');
      const conn = await mongoose.connect(externalUri, {
        dbName: process.env.MONGODB_DB_NAME || 'agrolens',
      });
      await seedMongoDatabase();
      console.log('Connected to external MongoDB & verified AgroLens collections.');
      return conn;
    }

    // Start persistent local MongoDB daemon via mongodb-memory-server when MONGODB_URI is not provided
    const dbPath = path.resolve(process.cwd(), 'server', 'data', 'mongodb');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // Remove stale mongod.lock if container exited uncleanly
    const lockFile = path.join(dbPath, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch {
        // Ignore lock cleanup failure
      }
    }

    try {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'agrolens',
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
    } catch {
      // Fallback to ephemeral storage engine if WiredTiger directory lock prevents startup
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'agrolens',
        },
      });
    }

    const uri = memoryServer.getUri('agrolens');
    const conn = await mongoose.connect(uri);
    console.log(`Connected Mongoose to local MongoDB instance (${uri}).`);

    await seedMongoDatabase();
    console.log('AgroLens MongoDB collections seeded and ready.');
    return conn;
  })();

  return connectionPromise;
}

export async function closeDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  connectionPromise = null;
}

export function getDatabaseStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || 'agrolens',
    mode: process.env.MONGODB_URI ? 'external-mongodb' : 'local-mongodb-wiredtiger',
  };
}
