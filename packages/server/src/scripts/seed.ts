/**
 * Idempotent dev seed: clears app collections and inserts fixture-aligned data.
 * Requires MONGODB_URI (and running Mongo). Does not require JWT_SECRET.
 */
import { loadEnv } from "../loadEnv.js";
loadEnv();

import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import { CSV_IMPORT_JOBS_COLLECTION } from "jobs";
import { COL } from "../adapters/persistence/mongo/collections.js";
import type {
  CategoryDoc,
  ItemDoc,
  MenuDoc,
  UserDoc,
  VenueDoc,
} from "../adapters/persistence/mongo/types.js";
import { ensureIndexes } from "../adapters/persistence/mongo/ensureIndexes.js";

const IMG = "/images/placeholder-dish.jpg";

function dbNameFromUri(uri: string): string {
  try {
    const normalized = uri.replace(/^mongodb(\+srv)?:\/\//i, "http://");
    const u = new URL(normalized);
    const segment = u.pathname.replace(/^\//, "").split("/")[0];
    return segment && segment.length > 0 ? segment : "dimome";
  } catch {
    return "dimome";
  }
}

const itemsMenu1: Omit<ItemDoc, "_id" | "menuPublicId" | "venueId" | "updatedAt">[] = [
  {
    publicId: "101",
    categoryPublicId: "cat-1",
    name: "Truffle Arancini",
    price: 12,
    description: "Crispy risotto balls with truffle oil and parmesan.",
    allergens: ["Milk (including lactose)", "Cereals containing gluten"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: false,
    sku: "SKU-101",
    stockStatus: "in_stock",
    dietaryTags: [],
  },
  {
    publicId: "102",
    categoryPublicId: "cat-1",
    name: "Burrata & Heirloom Tomato",
    price: 14,
    description: "Fresh burrata with basil oil and aged balsamic.",
    allergens: ["Milk (including lactose)"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: false,
    sku: "SKU-102",
    stockStatus: "in_stock",
    dietaryTags: [],
  },
  {
    publicId: "201",
    categoryPublicId: "cat-2",
    name: "Wild Mushroom Risotto",
    price: 22,
    description: "Creamy arborio rice with seasonal mushrooms.",
    allergens: ["Milk (including lactose)", "Cereals containing gluten"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: false,
    sku: "SKU-201",
    stockStatus: "in_stock",
    dietaryTags: [],
  },
  {
    publicId: "202",
    categoryPublicId: "cat-2",
    name: "Grilled Salmon",
    price: 28.5,
    description:
      "Atlantic salmon with lemon-butter glaze, jasmine rice, asparagus.",
    allergens: ["Fish", "Milk (including lactose)"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: true,
    sku: "SKU-202",
    stockStatus: "in_stock",
    dietaryTags: [],
  },
  {
    publicId: "301",
    categoryPublicId: "cat-3",
    name: "Dark Chocolate Torte",
    price: 9,
    description: "Flourless chocolate with sea salt.",
    allergens: ["Eggs", "Milk (including lactose)"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: false,
    sku: "SKU-301",
    stockStatus: "in_stock",
    dietaryTags: ["Vegan"],
  },
  {
    publicId: "401",
    categoryPublicId: "cat-4",
    name: "Seasonal Spritz",
    price: 11,
    description: "Aperitivo, prosecco, soda, citrus.",
    allergens: ["Sulphur dioxide and sulphites"],
    image: IMG,
    ingredients:
      "Sample ingredients list for kitchen tracking and allergen hints.",
    visibleOnMenu: true,
    featured: false,
    sku: "SKU-401",
    stockStatus: "in_stock",
    dietaryTags: [],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB?.trim() || dbNameFromUri(uri));

  for (const c of [...Object.values(COL), CSV_IMPORT_JOBS_COLLECTION]) {
    await db.collection(c).deleteMany({});
  }

  const now = new Date();
  const venueId = new ObjectId();
  await db.collection<VenueDoc>(COL.venues).insertOne({
    _id: venueId,
    name: "Emerald Hearth",
  });

  const passwordHash = await bcrypt.hash("password", 10);
  await db.collection<UserDoc>(COL.users).insertOne({
    _id: new ObjectId(),
    email: "dev@dimome.local",
    passwordHash,
    venueId,
  });

  const menus: MenuDoc[] = [
    {
      _id: new ObjectId(),
      publicId: "menu-1",
      venueId,
      guestVenueName: "The Green Table",
      name: "Dinner Service",
      contextLabel: "Emerald Hearth · Primary dining",
      isActive: true,
      isPublished: true,
      thumbnail: IMG,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      publicId: "menu-2",
      venueId,
      guestVenueName: "The Green Table",
      name: "Seasonal Brunch",
      contextLabel: "Emerald Hearth · Weekend service",
      isActive: true,
      isPublished: true,
      thumbnail: IMG,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      publicId: "menu-3",
      venueId,
      guestVenueName: "The Green Table",
      name: "Winter tasting (archived)",
      contextLabel: "Emerald Hearth · Archived version",
      isActive: false,
      isPublished: false,
      thumbnail: IMG,
      updatedAt: now,
    },
  ];
  await db.collection(COL.menus).insertMany(menus);

  const categoriesMenu1: Omit<CategoryDoc, "_id" | "venueId" | "updatedAt">[] = [
    {
      publicId: "cat-1",
      menuPublicId: "menu-1",
      menuName: "Dinner Service",
      name: "Starters",
      sortOrder: 1,
      thumbnail: IMG,
      itemIds: ["101", "102"],
    },
    {
      publicId: "cat-2",
      menuPublicId: "menu-1",
      menuName: "Dinner Service",
      name: "Mains",
      sortOrder: 2,
      thumbnail: IMG,
      itemIds: ["201", "202"],
    },
    {
      publicId: "cat-3",
      menuPublicId: "menu-1",
      menuName: "Dinner Service",
      name: "Desserts",
      sortOrder: 3,
      thumbnail: IMG,
      itemIds: ["301"],
    },
    {
      publicId: "cat-4",
      menuPublicId: "menu-1",
      menuName: "Dinner Service",
      name: "Drinks",
      sortOrder: 4,
      thumbnail: IMG,
      itemIds: ["401"],
    },
  ];
  const categoriesMenu2: Omit<CategoryDoc, "_id" | "venueId" | "updatedAt">[] = [
    {
      publicId: "cat-1",
      menuPublicId: "menu-2",
      menuName: "Seasonal Brunch",
      name: "Starters",
      sortOrder: 1,
      thumbnail: IMG,
      itemIds: ["501", "502"],
    },
    {
      publicId: "cat-2",
      menuPublicId: "menu-2",
      menuName: "Seasonal Brunch",
      name: "Mains",
      sortOrder: 2,
      thumbnail: IMG,
      itemIds: ["503", "504"],
    },
  ];

  for (const c of [...categoriesMenu1, ...categoriesMenu2]) {
    await db.collection(COL.categories).insertOne({
      ...c,
      venueId,
      updatedAt: now,
    } satisfies Omit<CategoryDoc, "_id">);
  }

  for (const it of itemsMenu1) {
    await db.collection(COL.items).insertOne({
      ...it,
      menuPublicId: "menu-1",
      venueId,
      updatedAt: now,
    } satisfies Omit<ItemDoc, "_id">);
  }

  const itemsMenu2: Omit<ItemDoc, "_id" | "menuPublicId" | "venueId" | "updatedAt">[] = [
    {
      publicId: "501",
      categoryPublicId: "cat-1",
      name: "Brunch Starter A",
      price: 10,
      description: "Sample brunch item.",
      allergens: [],
      image: IMG,
      ingredients: "",
      visibleOnMenu: true,
      featured: false,
      sku: "SKU-501",
      stockStatus: "in_stock",
      dietaryTags: [],
    },
    {
      publicId: "502",
      categoryPublicId: "cat-1",
      name: "Brunch Starter B",
      price: 11,
      description: "Sample brunch item.",
      allergens: ["Eggs"],
      image: IMG,
      ingredients: "",
      visibleOnMenu: true,
      featured: false,
      sku: "SKU-502",
      stockStatus: "in_stock",
      dietaryTags: [],
    },
    {
      publicId: "503",
      categoryPublicId: "cat-2",
      name: "Brunch Main A",
      price: 18,
      description: "Sample brunch main.",
      allergens: [],
      image: IMG,
      ingredients: "",
      visibleOnMenu: true,
      featured: false,
      sku: "SKU-503",
      stockStatus: "in_stock",
      dietaryTags: [],
    },
    {
      publicId: "504",
      categoryPublicId: "cat-2",
      name: "Brunch Main B",
      price: 19,
      description: "Sample brunch main.",
      allergens: [],
      image: IMG,
      ingredients: "",
      visibleOnMenu: true,
      featured: false,
      sku: "SKU-504",
      stockStatus: "in_stock",
      dietaryTags: [],
    },
  ];
  for (const it of itemsMenu2) {
    await db.collection(COL.items).insertOne({
      ...it,
      menuPublicId: "menu-2",
      venueId,
      updatedAt: now,
    } satisfies Omit<ItemDoc, "_id">);
  }

  await ensureIndexes(db);
  await client.close();
  console.log("Seed complete. Login: dev@dimome.local / password");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
