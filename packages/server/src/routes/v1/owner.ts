import { Router } from "express";
import type { OwnerMenusPort } from "../../ports/ownerMenusPort.js";
import type { OwnerCategoriesPort } from "../../ports/ownerCategoriesPort.js";
import type { OwnerItemsPort } from "../../ports/ownerItemsPort.js";
import { sendError } from "../../http/errors.js";

export function ownerRouter(
  menus: OwnerMenusPort,
  categories: OwnerCategoriesPort,
  items: OwnerItemsPort,
  getVenueName: (venueId: string) => Promise<string>,
): Router {
  const r = Router();

  r.get("/menus", async (req, res) => {
    const venueId = req.auth!.venueId;
    const list = await menus.listMenusForVenue(venueId);
    res.json(list);
  });

  r.post("/menus", async (req, res) => {
    const venueId = req.auth!.venueId;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const contextLabel =
      typeof req.body?.contextLabel === "string" ? req.body.contextLabel.trim() : "";
    const thumbnail =
      typeof req.body?.thumbnail === "string" ? req.body.thumbnail : "/images/placeholder-dish.jpg";
    if (!name) {
      sendError(res, 400, "validation_error", "name is required");
      return;
    }
    const created = await menus.createMenu(venueId, {
      name,
      contextLabel: contextLabel || name,
      thumbnail,
      isActive: Boolean(req.body?.isActive ?? true),
      isPublished: Boolean(req.body?.isPublished),
      guestVenueName:
        typeof req.body?.guestVenueName === "string" ? req.body.guestVenueName : undefined,
    });
    res.status(201).json(created);
  });

  r.patch("/menus/:menuId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const updated = await menus.updateMenu(venueId, req.params.menuId, {
      name: typeof req.body?.name === "string" ? req.body.name : undefined,
      contextLabel: typeof req.body?.contextLabel === "string" ? req.body.contextLabel : undefined,
      thumbnail: typeof req.body?.thumbnail === "string" ? req.body.thumbnail : undefined,
      isActive: typeof req.body?.isActive === "boolean" ? req.body.isActive : undefined,
      isPublished: typeof req.body?.isPublished === "boolean" ? req.body.isPublished : undefined,
      guestVenueName:
        typeof req.body?.guestVenueName === "string" ? req.body.guestVenueName : undefined,
    });
    if (!updated) {
      sendError(res, 404, "not_found", "Menu not found");
      return;
    }
    res.json(updated);
  });

  r.delete("/menus/:menuId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const ok = await menus.deleteMenu(venueId, req.params.menuId);
    if (!ok) {
      sendError(res, 404, "not_found", "Menu not found");
      return;
    }
    res.status(204).send();
  });

  r.get("/categories", async (req, res) => {
    const venueId = req.auth!.venueId;
    const [venueName, list] = await Promise.all([
      getVenueName(venueId),
      categories.listAllForVenue(venueId),
    ]);
    res.json({ venueName, categories: list });
  });

  r.get("/menus/:menuId/categories", async (req, res) => {
    const venueId = req.auth!.venueId;
    const list = await categories.listForMenu(venueId, req.params.menuId);
    res.json(list);
  });

  r.post("/menus/:menuId/categories", async (req, res) => {
    const venueId = req.auth!.venueId;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const thumbnail =
      typeof req.body?.thumbnail === "string" ? req.body.thumbnail : "/images/placeholder-dish.jpg";
    if (!name) {
      sendError(res, 400, "validation_error", "name is required");
      return;
    }
    try {
      const created = await categories.createCategory(venueId, req.params.menuId, {
        name,
        thumbnail,
        publicId: typeof req.body?.publicId === "string" ? req.body.publicId : undefined,
        itemIds: Array.isArray(req.body?.itemIds) ? req.body.itemIds : undefined,
      });
      res.status(201).json(created);
    } catch {
      sendError(res, 404, "not_found", "Menu not found");
    }
  });

  r.patch("/menus/:menuId/categories/:categoryId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const updated = await categories.updateCategory(
      venueId,
      req.params.menuId,
      req.params.categoryId,
      {
        name: typeof req.body?.name === "string" ? req.body.name : undefined,
        thumbnail: typeof req.body?.thumbnail === "string" ? req.body.thumbnail : undefined,
        itemIds: Array.isArray(req.body?.itemIds) ? req.body.itemIds : undefined,
      },
    );
    if (!updated) {
      sendError(res, 404, "not_found", "Category not found");
      return;
    }
    res.json(updated);
  });

  r.delete("/menus/:menuId/categories/:categoryId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const ok = await categories.deleteCategory(venueId, req.params.menuId, req.params.categoryId);
    if (!ok) {
      sendError(res, 404, "not_found", "Category not found");
      return;
    }
    res.status(204).send();
  });

  r.get("/menus/:menuId/items", async (req, res) => {
    const venueId = req.auth!.venueId;
    const categoryPublicId =
      typeof req.query.categoryPublicId === "string" ? req.query.categoryPublicId : undefined;
    const list = await items.listItems(venueId, req.params.menuId, { categoryPublicId });
    if (list === null) {
      sendError(res, 404, "not_found", "Menu not found");
      return;
    }
    res.json(list);
  });

  r.get("/menus/:menuId/items/:itemId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const item = await items.getItem(venueId, req.params.menuId, req.params.itemId);
    if (!item) {
      sendError(res, 404, "not_found", "Item not found");
      return;
    }
    res.json(item);
  });

  r.post("/menus/:menuId/items", async (req, res) => {
    const venueId = req.auth!.venueId;
    const b = req.body ?? {};
    const name = typeof b.name === "string" ? b.name.trim() : "";
    const categoryPublicId = typeof b.categoryPublicId === "string" ? b.categoryPublicId : "";
    if (!name || !categoryPublicId) {
      sendError(res, 400, "validation_error", "name and categoryPublicId are required");
      return;
    }
    const price = typeof b.price === "number" ? b.price : Number(b.price);
    if (Number.isNaN(price)) {
      sendError(res, 400, "validation_error", "price must be a number");
      return;
    }
    try {
      const created = await items.createItem(venueId, req.params.menuId, {
        publicId: typeof b.publicId === "string" ? b.publicId : undefined,
        categoryPublicId,
        name,
        price,
        description: typeof b.description === "string" ? b.description : "",
        allergens: Array.isArray(b.allergens) ? b.allergens : [],
        image:
          typeof b.image === "string" ? b.image : "/images/placeholder-dish.jpg",
        ingredients: typeof b.ingredients === "string" ? b.ingredients : undefined,
        visibleOnMenu: typeof b.visibleOnMenu === "boolean" ? b.visibleOnMenu : undefined,
        featured: typeof b.featured === "boolean" ? b.featured : undefined,
        sku: typeof b.sku === "string" ? b.sku : undefined,
        stockStatus: b.stockStatus,
        dietaryTags: Array.isArray(b.dietaryTags) ? b.dietaryTags : undefined,
      });
      res.status(201).json(created);
    } catch {
      sendError(res, 404, "not_found", "Menu not found");
    }
  });

  r.patch("/menus/:menuId/items/:itemId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const b = req.body ?? {};
    const updated = await items.updateItem(venueId, req.params.menuId, req.params.itemId, {
      categoryPublicId: typeof b.categoryPublicId === "string" ? b.categoryPublicId : undefined,
      name: typeof b.name === "string" ? b.name : undefined,
      price: typeof b.price === "number" ? b.price : b.price !== undefined ? Number(b.price) : undefined,
      description: typeof b.description === "string" ? b.description : undefined,
      allergens: Array.isArray(b.allergens) ? b.allergens : undefined,
      image: typeof b.image === "string" ? b.image : undefined,
      ingredients: typeof b.ingredients === "string" ? b.ingredients : undefined,
      visibleOnMenu: typeof b.visibleOnMenu === "boolean" ? b.visibleOnMenu : undefined,
      featured: typeof b.featured === "boolean" ? b.featured : undefined,
      sku: typeof b.sku === "string" ? b.sku : undefined,
      stockStatus: b.stockStatus,
      dietaryTags: Array.isArray(b.dietaryTags) ? b.dietaryTags : undefined,
    });
    if (!updated) {
      sendError(res, 404, "not_found", "Item not found");
      return;
    }
    res.json(updated);
  });

  r.delete("/menus/:menuId/items/:itemId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const ok = await items.deleteItem(venueId, req.params.menuId, req.params.itemId);
    if (!ok) {
      sendError(res, 404, "not_found", "Item not found");
      return;
    }
    res.status(204).send();
  });

  return r;
}
