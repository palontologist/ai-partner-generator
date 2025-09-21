import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create a function to get the database connection
function createDatabase() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not defined');
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is not defined');
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return drizzle(client, { schema });
}

// Only create the database connection when actually needed
let _db: ReturnType<typeof createDatabase> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDatabase();
  }
  return _db;
}

// For backward compatibility
export const db = new Proxy({} as ReturnType<typeof createDatabase>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDatabase>];
  }
});

export { schema };
