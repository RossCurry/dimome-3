import type { ObjectId } from "mongodb";

export type VenueDoc = {
  _id: ObjectId;
  name: string;
};

export type UserDoc = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  venueId: ObjectId;
};

export type MenuDoc = {
  _id: ObjectId;
  publicId: string;
  venueId: ObjectId;
  guestVenueName: string;
  name: string;
  contextLabel: string;
  isActive: boolean;
  isPublished: boolean;
  thumbnail: string;
  updatedAt: Date;
};

export type CategoryDoc = {
  _id: ObjectId;
  publicId: string;
  menuPublicId: string;
  venueId: ObjectId;
  menuName: string;
  name: string;
  sortOrder: number;
  thumbnail: string;
  itemIds: string[];
  updatedAt: Date;
};

export type ItemDoc = {
  _id: ObjectId;
  publicId: string;
  menuPublicId: string;
  venueId: ObjectId;
  categoryPublicId: string;
  name: string;
  price: number;
  description: string;
  allergens: string[];
  image: string;
  ingredients: string;
  visibleOnMenu: boolean;
  featured: boolean;
  sku: string;
  stockStatus: "in_stock" | "low" | "out";
  dietaryTags: string[];
  updatedAt: Date;
};
