import { Router } from "express";
import type { PublicMenuReadPort } from "../../ports/publicMenuReadPort.js";
import { sendError } from "../../http/errors.js";

export function publicMenuRouter(publicMenu: PublicMenuReadPort): Router {
  const r = Router();
  r.get("/menus/:menuId", async (req, res) => {
    const menu = await publicMenu.getPublishedMenuByPublicId(req.params.menuId);
    if (!menu) {
      sendError(res, 404, "not_found", "Menu not found or not published");
      return;
    }
    res.json(menu);
  });
  return r;
}
