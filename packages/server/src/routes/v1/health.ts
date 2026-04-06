import { Router } from "express";
import { pingDb } from "../../db.js";

export function healthRouter(): Router {
  const r = Router();
  r.get("/health", async (_req, res) => {
    const dbOk = await pingDb();
    res.json({ ok: true, db: dbOk });
  });
  return r;
}
