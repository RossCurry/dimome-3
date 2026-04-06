import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

function databaseNameFromUri(uri: string): string {
  try {
    const normalized = uri.replace(/^mongodb(\+srv)?:\/\//i, "http://");
    const u = new URL(normalized);
    const segment = u.pathname.replace(/^\//, "").split("/")[0];
    return segment && segment.length > 0 ? segment : "dimome";
  } catch {
    return "dimome";
  }
}

export async function connectMongo(uri: string): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  const name = process.env.MONGODB_DB?.trim() || databaseNameFromUri(uri);
  db = client.db(name);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not connected");
  return db;
}

export async function closeMongo(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}

export async function pingDb(): Promise<boolean> {
  if (!db) return false;
  try {
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
