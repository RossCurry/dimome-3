import type { Db } from "mongodb";
import type { PublicMenuReadPort } from "../../../ports/publicMenuReadPort.js";
import type { PublicMenuDto, MenuCategoryDto, MenuItemDto } from "../../../domain/menu.js";
import { COL } from "./collections.js";
import type { CategoryDoc, ItemDoc, MenuDoc } from "./types.js";

export class MongoPublicMenuReadAdapter implements PublicMenuReadPort {
  constructor(private readonly db: Db) {}

  async getPublishedMenuByPublicId(menuPublicId: string): Promise<PublicMenuDto | null> {
    const menu = await this.db.collection<MenuDoc>(COL.menus).findOne({
      publicId: menuPublicId,
      isPublished: true,
    });
    if (!menu) return null;

    const categories = await this.db
      .collection<CategoryDoc>(COL.categories)
      .find({ menuPublicId })
      .sort({ sortOrder: 1 })
      .toArray();

    const items = await this.db
      .collection<ItemDoc>(COL.items)
      .find({ menuPublicId, visibleOnMenu: true })
      .toArray();

    const itemsById: Record<string, MenuItemDto> = {};
    // TODO I believe we can add this to the projection config for mongo
    for (const it of items) {
      itemsById[it.publicId] = {
        id: it.publicId,
        name: it.name,
        price: it.price,
        description: it.description,
        allergens: it.allergens,
        image: it.image,
        category: it.categoryPublicId,
      };
    }

    const allItemIds = items.map((i) => i.publicId);

    const categoryDtos: MenuCategoryDto[] = [
      { id: "cat-0", name: "All", itemIds: allItemIds },
      ...categories.map((c) => {
        const itemIds =
          c.itemIds.length > 0
            ? c.itemIds
            : items
                .filter((i) => i.categoryPublicId === c.publicId)
                .map((i) => i.publicId);
        return { id: c.publicId, name: c.name, itemIds };
      }),
    ];

    return {
      menuId: menu.publicId,
      venueName: menu.guestVenueName,
      categories: categoryDtos,
      itemsById,
    };
  }
}
