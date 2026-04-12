import { Router, type RequestHandler } from "express";
import multer from "multer";
import type { CsvColumnMapping, MongoCsvImportJobStore } from "jobs";
import type { OwnerMenusPort } from "../../ports/ownerMenusPort.js";
import { sendError } from "../../http/errors.js";
import { MAX_CSV_UTF8_BYTES } from "../../services/csvImport/csvConstants.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CSV_UTF8_BYTES },
});

export type CsvImportRouterDeps = {
  store: MongoCsvImportJobStore;
  menus: OwnerMenusPort;
};

async function assertMenuOwned(
  menus: OwnerMenusPort,
  venueId: string,
  menuPublicId: string,
): Promise<boolean> {
  const list = await menus.listMenusForVenue(venueId);
  return list.some((m) => m.id === menuPublicId);
}

export function csvImportJobsRouter(deps: CsvImportRouterDeps): Router {
  const { store, menus } = deps;
  const r = Router();

  const postJob: RequestHandler = async (req, res) => {
    const venueId = req.auth!.venueId;
    const menuPublicId = String(req.params.menuId ?? "");
    if (!(await assertMenuOwned(menus, venueId, menuPublicId))) {
      sendError(res, 404, "not_found", "Menu not found");
      return;
    }
    const file = req.file;
    if (!file?.buffer) {
      sendError(res, 400, "validation_error", "CSV file is required (field: file)");
      return;
    }
    const utf8 = file.buffer.toString("utf8");
    if (utf8.length > MAX_CSV_UTF8_BYTES) {
      sendError(res, 400, "validation_error", `CSV exceeds max size (${MAX_CSV_UTF8_BYTES} bytes)`);
      return;
    }
    const jobId = await store.insertPendingJob({
      venueId,
      menuPublicId,
      fileName: file.originalname || "upload.csv",
      rawCsvUtf8: utf8,
    });
    res.status(201).json({ id: jobId });
  };

  r.post("/menus/:menuId/csv-import-jobs", upload.single("file"), postJob);

  r.get("/menus/:menuId/csv-import-jobs/:jobId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const menuPublicId = String(req.params.menuId ?? "");
    const jobId = String(req.params.jobId ?? "");
    const job = await store.getJob(venueId, menuPublicId, jobId);
    if (!job) {
      sendError(res, 404, "not_found", "Job not found");
      return;
    }
    res.json(job);
  });

  r.patch("/menus/:menuId/csv-import-jobs/:jobId", async (req, res) => {
    const venueId = req.auth!.venueId;
    const menuPublicId = String(req.params.menuId ?? "");
    const jobId = String(req.params.jobId ?? "");
    const body = req.body as { mapping?: CsvColumnMapping };
    const m = body.mapping;
    if (!m || typeof m.name !== "string" || typeof m.price !== "string") {
      sendError(res, 400, "validation_error", "mapping.name and mapping.price are required");
      return;
    }
    const mapping: CsvColumnMapping = {
      name: m.name,
      price: m.price,
      category: typeof m.category === "string" ? m.category : "",
      description: typeof m.description === "string" ? m.description : "",
      allergens: typeof m.allergens === "string" ? m.allergens : "",
    };
    const ok = await store.submitMapping(venueId, menuPublicId, jobId, mapping);
    if (!ok) {
      sendError(res, 400, "invalid_state", "Job is not awaiting column mapping");
      return;
    }
    const job = await store.getJob(venueId, menuPublicId, jobId);
    res.json(job);
  });

  r.post("/menus/:menuId/csv-import-jobs/:jobId/commit", async (req, res) => {
    const venueId = req.auth!.venueId;
    const menuPublicId = String(req.params.menuId ?? "");
    const jobId = String(req.params.jobId ?? "");
    const job = await store.getJob(venueId, menuPublicId, jobId);
    if (!job) {
      sendError(res, 404, "not_found", "Job not found");
      return;
    }
    if (job.status === "committed") {
      res.json(job);
      return;
    }
    const ok = await store.requestCommit(venueId, menuPublicId, jobId);
    if (!ok) {
      sendError(res, 400, "invalid_state", "Job is not ready to commit");
      return;
    }
    const next = await store.getJob(venueId, menuPublicId, jobId);
    res.status(202).json(next ?? job);
  });

  return r;
}
