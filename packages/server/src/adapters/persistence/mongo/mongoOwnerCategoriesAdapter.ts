import { ObjectId, type Db } from "mongodb";
import type {
  OwnerCategoriesPort,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../../ports/ownerCategoriesPort.js";
import type { CategorySummaryDto } from "../../../domain/menu.js";
import { COL } from "./collections.js";
import type { CategoryDoc, MenuDoc } from "./documents.js";
import { formatUpdatedLabel } from "./format.js";

function toVenueOid(venueId: string): ObjectId {
  return new ObjectId(venueId);
}

function mapCategory(c: CategoryDoc): CategorySummaryDto {
  return {
    menuId: c.menuPublicId,
    categoryId: c.publicId,
    menuName: c.menuName,
    name: c.name,
    thumbnail: c.thumbnail,
    lastUpdatedLabel: formatUpdatedLabel(c.updatedAt),
    itemCount: c.itemIds.length,
  };
}

export class MongoOwnerCategoriesAdapter implements OwnerCategoriesPort {
  constructor(private readonly db: Db) {}

  private async assertMenuOwned(menuPublicId: string, venueId: string): Promise<MenuDoc | null> {
    return this.db.collection<MenuDoc>(COL.menus).findOne({
      publicId: menuPublicId,
      venueId: toVenueOid(venueId),
    });
  }

  async listAllForVenue(venueId: string): Promise<CategorySummaryDto[]> {
    const cats = await this.db
      .collection<CategoryDoc>(COL.categories)
      .find({ venueId: toVenueOid(venueId) })
      .sort({ menuPublicId: 1, sortOrder: 1 })
      .toArray();
    return cats.map(mapCategory);
  }

  async listForMenu(venueId: string, menuPublicId: string): Promise<CategorySummaryDto[]> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return [];
    const cats = await this.db
      .collection<CategoryDoc>(COL.categories)
      .find({ menuPublicId, venueId: toVenueOid(venueId) })
      .sort({ sortOrder: 1 })
      .toArray();
    return cats.map(mapCategory);
  }

  async createCategory(
    venueId: string,
    menuPublicId: string,
    input: CreateCategoryInput,
  ): Promise<CategorySummaryDto> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) throw new Error("Menu not found");

    const last = await this.db
      .collection<CategoryDoc>(COL.categories)
      .find({ menuPublicId })
      .sort({ sortOrder: -1 })
      .limit(1)
      .toArray();
    const sortOrder = (last[0]?.sortOrder ?? 0) + 1;
    const publicId =
      input.publicId?.trim() ||
      `cat-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const doc: Omit<CategoryDoc, "_id"> = {
      publicId,
      menuPublicId,
      venueId: toVenueOid(venueId),
      menuName: menu.name,
      name: input.name,
      sortOrder,
      thumbnail: input.thumbnail,
      itemIds: input.itemIds ?? [],
      updatedAt: now,
    };
    const ins = await this.db.collection(COL.categories).insertOne(doc);
    const inserted = await this.db
      .collection<CategoryDoc>(COL.categories)
      .findOne({ _id: ins.insertedId });
    if (!inserted) throw new Error("Insert failed");
    return mapCategory(inserted);
  }

  async updateCategory(
    venueId: string,
    menuPublicId: string,
    categoryPublicId: string,
    input: UpdateCategoryInput,
  ): Promise<CategorySummaryDto | null> {
    const menu = await this.assertMenuOwned(menuPublicId, venueId);
    if (!menu) return null;

    const $set: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) $set.name = input.name;
    if (input.thumbnail !== undefined) $set.thumbnail = input.thumbnail;
    if (input.itemIds !== undefined) $set.itemIds = input.itemIds;
    if (input.name !== undefined || input.thumbnail !== undefined) {
      $set.menuName = menu.name;
    }

    const r = await this.db.collection<CategoryDoc>(COL.categories).findOneAndUpdate(
      {
        publicId: categoryPublicId,
        menuPublicId,
        venueId: toVenueOid(venueId),
      },
      { $set },
      { returnDocument: "after" },
    );
    const c = r.value;
    if (!c) return null;
    return mapCategory(c);
  }
}
