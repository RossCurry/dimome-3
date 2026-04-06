import type { Db } from "mongodb";
import { COL } from "./collections.js";

export async function ensureIndexes(db: Db): Promise<void> {
  await db.collection(COL.menus).createIndex({ publicId: 1 }, { unique: true });
  await db.collection(COL.menus).createIndex({ venueId: 1 });
  await db.collection(COL.categories).createIndex(
    { menuPublicId: 1, publicId: 1 },
    { unique: true },
  );
  await db.collection(COL.categories).createIndex({ venueId: 1 });
  await db.collection(COL.items).createIndex(
    { menuPublicId: 1, publicId: 1 },
    { unique: true },
  );
  await db.collection(COL.items).createIndex({ venueId: 1 });
  await db.collection(COL.users).createIndex({ email: 1 }, { unique: true });
}
