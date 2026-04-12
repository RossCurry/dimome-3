import { ObjectId, type Db, type UpdateFilter } from "mongodb";
import type {
  OwnerItemsPort,
  CreateItemInput,
  UpdateItemInput,
} from "../../../ports/ownerItemsPort.js";
import type { MenuItemDto, MenuItemEditorDto } from "../../../domain/menu.js";
import { COL } from "./collections.js";
import type { CategoryDoc, ItemDoc, MenuDoc } from "./types.js";

function toVenueOid(venueId: string): ObjectId {
  return new ObjectId(venueId);
}

function toListDto(it: ItemDoc): MenuItemDto {
  return {
    id: it.publicId,
    name: it.name,
    price: it.price,
    description: it.description,
    allergens: it.allergens,
    image: it.image,
    category: it.categoryPublicId,
    visibleOnMenu: it.visibleOnMenu,
  };
}

function toEditorDto(it: ItemDoc): MenuItemEditorDto {
  return {
    id: it.publicId,
    name: it.name,
    price: it.price,
    description: it.description,
    allergens: it.allergens,
    image: it.image,
    category: it.categoryPublicId,
    ingredients: it.ingredients,
    visibleOnMenu: it.visibleOnMenu,
    featured: it.featured,
    sku: it.sku,
    stockStatus: it.stockStatus,
    dietaryTags: it.dietaryTags,
  };
}

export class MongoOwnerItemsAdapter implements OwnerItemsPort {
  constructor(private readonly db: Db) {}

  private async assertMenuOwned(menuPublicId: string, venueId: string): Promise<MenuDoc | null> {
    return this.db.collection<MenuDoc>(COL.menus).findOne({
      publicId: menuPublicId,
      venueId: toVenueOid(venueId),
    });
  }

  async listItems(
    venueId: string,
    menuPublicId: string,
    filter?: { categoryPublicId?: string },
  ): Promise<MenuItemDto[] | null> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return null;
    const q: Record<string, unknown> = {
      menuPublicId,
      venueId: toVenueOid(venueId),
    };
    if (filter?.categoryPublicId) {
      q.categoryPublicId = filter.categoryPublicId;
    }
    const docs = await this.db
      .collection<ItemDoc>(COL.items)
      .find(q)
      .sort({ updatedAt: -1 })
      .toArray();
    return docs.map(toListDto);
  }

  async getItem(
    venueId: string,
    menuPublicId: string,
    itemPublicId: string,
  ): Promise<MenuItemEditorDto | null> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return null;
    const it = await this.db.collection<ItemDoc>(COL.items).findOne({
      menuPublicId,
      publicId: itemPublicId,
      venueId: toVenueOid(venueId),
    });
    return it ? toEditorDto(it) : null;
  }

  async createItem(
    venueId: string,
    menuPublicId: string,
    input: CreateItemInput,
  ): Promise<MenuItemEditorDto> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) throw new Error("Menu not found");

    const publicId =
      input.publicId?.trim() || `item-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const doc: Omit<ItemDoc, "_id"> = {
      publicId,
      menuPublicId,
      venueId: toVenueOid(venueId),
      categoryPublicId: input.categoryPublicId,
      name: input.name,
      price: input.price,
      description: input.description,
      allergens: input.allergens,
      image: input.image,
      ingredients: input.ingredients ?? "",
      visibleOnMenu: input.visibleOnMenu ?? true,
      featured: input.featured ?? false,
      sku: input.sku ?? `SKU-${publicId}`,
      stockStatus: input.stockStatus ?? "in_stock",
      dietaryTags: input.dietaryTags ?? [],
      updatedAt: now,
    };
    await this.db.collection(COL.items).insertOne(doc);

    await this.syncCategoryItemIds(menuPublicId, venueId, input.categoryPublicId);

    const inserted = await this.db.collection<ItemDoc>(COL.items).findOne({
      menuPublicId,
      publicId,
    });
    if (!inserted) throw new Error("Insert failed");
    return toEditorDto(inserted);
  }

  async updateItem(
    venueId: string,
    menuPublicId: string,
    itemPublicId: string,
    input: UpdateItemInput,
  ): Promise<MenuItemEditorDto | null> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return null;

    const existing = await this.db.collection<ItemDoc>(COL.items).findOne({
      menuPublicId,
      publicId: itemPublicId,
      venueId: toVenueOid(venueId),
    });
    if (!existing) return null;

    const $set: Record<string, unknown> = { updatedAt: new Date() };
    if (input.categoryPublicId !== undefined) $set.categoryPublicId = input.categoryPublicId;
    if (input.name !== undefined) $set.name = input.name;
    if (input.price !== undefined) $set.price = input.price;
    if (input.description !== undefined) $set.description = input.description;
    if (input.allergens !== undefined) $set.allergens = input.allergens;
    if (input.image !== undefined) $set.image = input.image;
    if (input.ingredients !== undefined) $set.ingredients = input.ingredients;
    if (input.visibleOnMenu !== undefined) $set.visibleOnMenu = input.visibleOnMenu;
    if (input.featured !== undefined) $set.featured = input.featured;
    if (input.sku !== undefined) $set.sku = input.sku;
    if (input.stockStatus !== undefined) $set.stockStatus = input.stockStatus;
    if (input.dietaryTags !== undefined) $set.dietaryTags = input.dietaryTags;

    const next = await this.db.collection<ItemDoc>(COL.items).findOneAndUpdate(
      {
        menuPublicId,
        publicId: itemPublicId,
        venueId: toVenueOid(venueId),
      },
      { $set },
      { returnDocument: "after" },
    );
    if (!next) return null;

    if (input.categoryPublicId !== undefined && input.categoryPublicId !== existing.categoryPublicId) {
      await this.removeItemFromCategoryList(menuPublicId, venueId, existing.categoryPublicId, itemPublicId);
      await this.syncCategoryItemIds(menuPublicId, venueId, input.categoryPublicId);
    }

    return toEditorDto(next);
  }

  async deleteItem(
    venueId: string,
    menuPublicId: string,
    itemPublicId: string,
  ): Promise<boolean> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return false;

    const existing = await this.db.collection<ItemDoc>(COL.items).findOne({
      menuPublicId,
      publicId: itemPublicId,
      venueId: toVenueOid(venueId),
    });
    if (!existing) return false;

    const del = await this.db.collection(COL.items).deleteOne({
      menuPublicId,
      publicId: itemPublicId,
      venueId: toVenueOid(venueId),
    });
    if (del.deletedCount === 0) return false;

    await this.syncCategoryItemIds(menuPublicId, venueId, existing.categoryPublicId);
    return true;
  }

  private async removeItemFromCategoryList(
    menuPublicId: string,
    venueId: string,
    categoryPublicId: string,
    itemPublicId: string,
  ): Promise<void> {
    const pullUpdate: UpdateFilter<CategoryDoc> = { $pull: { itemIds: itemPublicId } };
    await this.db.collection<CategoryDoc>(COL.categories).updateOne(
      {
        menuPublicId,
        publicId: categoryPublicId,
        venueId: toVenueOid(venueId),
      },
      pullUpdate,
    );
  }

  /** Append item id to category.itemIds if missing (best-effort denormalized list). */
  private async syncCategoryItemIds(
    menuPublicId: string,
    venueId: string,
    categoryPublicId: string,
  ): Promise<void> {
    const docs = await this.db
      .collection<ItemDoc>(COL.items)
      .find({
        menuPublicId,
        venueId: toVenueOid(venueId),
        categoryPublicId,
      })
      .toArray();
    const itemIds = docs.map((x) => x.publicId);
    await this.db.collection(COL.categories).updateOne(
      {
        menuPublicId,
        publicId: categoryPublicId,
        venueId: toVenueOid(venueId),
      },
      { $set: { itemIds, updatedAt: new Date() } },
    );
  }
}
