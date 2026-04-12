import { ObjectId, type Db } from "mongodb";
import { CSV_IMPORT_JOBS_COLLECTION } from "jobs";
import type { OwnerMenusPort, CreateMenuInput, UpdateMenuInput } from "../../../ports/ownerMenusPort.js";
import type { OwnerMenuSummaryDto } from "../../../domain/menu.js";
import { COL } from "./collections.js";
import type { MenuDoc } from "./types.js";
import { formatUpdatedLabel } from "./format.js";

function toVenueOid(venueId: string): ObjectId {
  return new ObjectId(venueId);
}

export class MongoOwnerMenusAdapter implements OwnerMenusPort {
  constructor(private readonly db: Db) {}

  async listMenusForVenue(venueId: string): Promise<OwnerMenuSummaryDto[]> {
    const vid = toVenueOid(venueId);
    const menus = await this.db
      .collection<MenuDoc>(COL.menus)
      .find({ venueId: vid })
      .sort({ name: 1 })
      .toArray();

    const out: OwnerMenuSummaryDto[] = [];
    for (const m of menus) {
      const categoryCount = await this.db.collection(COL.categories).countDocuments({
        menuPublicId: m.publicId,
      });
      const itemCount = await this.db.collection(COL.items).countDocuments({
        menuPublicId: m.publicId,
      });
      out.push({
        id: m.publicId,
        name: m.name,
        contextLabel: m.contextLabel,
        lastUpdatedLabel: formatUpdatedLabel(m.updatedAt),
        categoryCount,
        itemCount,
        thumbnail: m.thumbnail,
        isActive: m.isActive,
      });
    }
    return out;
  }

  async createMenu(venueId: string, input: CreateMenuInput): Promise<OwnerMenuSummaryDto> {
    const vid = toVenueOid(venueId);
    const publicId = `menu-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const doc: Omit<MenuDoc, "_id"> = {
      publicId,
      venueId: vid,
      guestVenueName: input.guestVenueName ?? "",
      name: input.name,
      contextLabel: input.contextLabel,
      isActive: input.isActive ?? true,
      isPublished: input.isPublished ?? false,
      thumbnail: input.thumbnail,
      updatedAt: now,
    };
    await this.db.collection(COL.menus).insertOne(doc);
    return {
      id: publicId,
      name: input.name,
      contextLabel: input.contextLabel,
      lastUpdatedLabel: formatUpdatedLabel(now),
      categoryCount: 0,
      itemCount: 0,
      thumbnail: input.thumbnail,
      isActive: doc.isActive,
    };
  }

  async updateMenu(
    venueId: string,
    menuPublicId: string,
    input: UpdateMenuInput,
  ): Promise<OwnerMenuSummaryDto | null> {
    const vid = toVenueOid(venueId);
    const $set: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) $set.name = input.name;
    if (input.contextLabel !== undefined) $set.contextLabel = input.contextLabel;
    if (input.thumbnail !== undefined) $set.thumbnail = input.thumbnail;
    if (input.isActive !== undefined) $set.isActive = input.isActive;
    if (input.isPublished !== undefined) $set.isPublished = input.isPublished;
    if (input.guestVenueName !== undefined) $set.guestVenueName = input.guestVenueName;

    const m = await this.db.collection<MenuDoc>(COL.menus).findOneAndUpdate(
      { publicId: menuPublicId, venueId: vid },
      { $set },
      { returnDocument: "after" },
    );
    if (!m) return null;
    const categoryCount = await this.db.collection(COL.categories).countDocuments({
      menuPublicId: m.publicId,
    });
    const itemCount = await this.db.collection(COL.items).countDocuments({
      menuPublicId: m.publicId,
    });
    return {
      id: m.publicId,
      name: m.name,
      contextLabel: m.contextLabel,
      lastUpdatedLabel: formatUpdatedLabel(m.updatedAt),
      categoryCount,
      itemCount,
      thumbnail: m.thumbnail,
      isActive: m.isActive,
    };
  }

  async deleteMenu(venueId: string, menuPublicId: string): Promise<boolean> {
    const vid = toVenueOid(venueId);
    const menu = await this.db.collection<MenuDoc>(COL.menus).findOne({
      publicId: menuPublicId,
      venueId: vid,
    });
    if (!menu) return false;

    await this.db.collection(COL.items).deleteMany({ menuPublicId, venueId: vid });
    await this.db.collection(COL.categories).deleteMany({ menuPublicId, venueId: vid });
    await this.db.collection(CSV_IMPORT_JOBS_COLLECTION).deleteMany({
      venueId,
      menuPublicId,
    });
    const r = await this.db.collection(COL.menus).deleteOne({ publicId: menuPublicId, venueId: vid });
    return r.deletedCount > 0;
  }
}
