import { parse } from "csv-parse/sync";
import type { CsvColumnMapping, CsvPreviewRowPublic, MongoCsvImportJobStore } from "jobs";
import type { OwnerCategoriesPort } from "../../ports/ownerCategoriesPort.js";
import type { OwnerItemsPort } from "../../ports/ownerItemsPort.js";
import { MAX_CSV_ROWS, MAX_CSV_UTF8_BYTES, UNCATEGORISED_CATEGORY_NAME } from "./csvConstants.js";
import { resolveAllergenToken } from "./euAllergens.js";

const PLACEHOLDER_THUMB = "/images/placeholder-dish.jpg";

function getCell(record: Record<string, string>, header: string): string {
  if (!header) return "";
  const v = record[header];
  return typeof v === "string" ? v.trim() : String(v ?? "").trim();
}

function parsePrice(raw: string): { ok: true; value: number } | { ok: false } {
  const cleaned = raw.replace(/[€$£\s,]/g, (c) => (c === "," ? "." : ""));
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

export function parseCsvUtf8(raw: string): { headers: string[]; records: Record<string, string>[] } {
  if (raw.length > MAX_CSV_UTF8_BYTES) {
    throw new Error(`CSV exceeds max size (${MAX_CSV_UTF8_BYTES} bytes)`);
  }
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];
  if (records.length === 0) {
    throw new Error("CSV has no data rows");
  }
  const capped = records.slice(0, MAX_CSV_ROWS);
  const headers = Object.keys(capped[0] ?? {});
  if (headers.length === 0) {
    throw new Error("CSV has no columns");
  }
  return { headers, records: capped };
}

export function buildPreviewRows(
  records: Record<string, string>[],
  mapping: CsvColumnMapping,
): CsvPreviewRowPublic[] {
  const rows: CsvPreviewRowPublic[] = [];
  for (let rowIndex = 0; rowIndex < records.length; rowIndex++) {
    const record = records[rowIndex]!;
    const name = getCell(record, mapping.name);
    const priceRaw = getCell(record, mapping.price);
    let category = mapping.category ? getCell(record, mapping.category) : "";
    if (!category) category = UNCATEGORISED_CATEGORY_NAME;
    const description = mapping.description ? getCell(record, mapping.description) : "";
    const allergensRaw = mapping.allergens ? getCell(record, mapping.allergens) : "";

    const issues: string[] = [];
    let flagged = false;
    if (!name) {
      issues.push("Missing item name");
      flagged = true;
    }
    const priceParsed = parsePrice(priceRaw);
    if (!priceParsed.ok) {
      issues.push("Invalid price");
      flagged = true;
    }
    const allergenLabels: string[] = [];
    const parts = allergensRaw.split(",").map((s) => s.trim()).filter(Boolean);
    for (const p of parts) {
      const r = resolveAllergenToken(p);
      if (r) allergenLabels.push(r);
      else issues.push(`Unknown allergen: ${p}`);
    }

    rows.push({
      rowIndex,
      name,
      price: priceParsed.ok ? String(priceParsed.value) : priceRaw,
      category,
      description,
      allergenLabels,
      allergensDisplay: allergenLabels.join(", "),
      flagged,
      issues,
    });
  }
  return rows;
}

export type CsvImportPorts = {
  store: MongoCsvImportJobStore;
  categories: OwnerCategoriesPort;
  items: OwnerItemsPort;
};

export async function processCsvImportTick(p: CsvImportPorts): Promise<void> {
  const { store, categories, items } = p;

  for (;;) {
  const parseJob = await store.claimPendingParse();
  if (parseJob) {
    try {
      const raw = parseJob.rawCsvUtf8 ?? "";
      const { headers, records } = parseCsvUtf8(raw);
      await store.completeParse(parseJob._id, { headers, records });
    } catch (e) {
      await store.failJob(parseJob._id, e instanceof Error ? e.message : String(e));
    }
    continue;
  }

  const validateJob = await store.claimMappingSubmitted();
  if (validateJob) {
    try {
      const mapping = validateJob.mapping;
      if (!mapping || !mapping.name || !mapping.price) {
        await store.failJob(validateJob._id, "Column mapping is incomplete");
        continue;
      }
      const previewRows = buildPreviewRows(validateJob.records, mapping);
      await store.completeValidate(validateJob._id, previewRows);
    } catch (e) {
      await store.failJob(validateJob._id, e instanceof Error ? e.message : String(e));
    }
    continue;
  }

  const commitJob = await store.claimCommitPending();
  if (commitJob) {
    const venueId = commitJob.venueId;
    const menuPublicId = commitJob.menuPublicId;
    const messages: string[] = [];
    let imported = 0;
    let skipped = 0;
    try {
      const preview = commitJob.previewRows ?? [];
      const existing = await categories.listForMenu(venueId, menuPublicId);
      const nameToCategoryId = new Map(existing.map((c) => [c.name, c.categoryId] as const));

      async function ensureCategoryId(catName: string): Promise<string> {
        let id = nameToCategoryId.get(catName);
        if (id) return id;
        const created = await categories.createCategory(venueId, menuPublicId, {
          name: catName,
          thumbnail: PLACEHOLDER_THUMB,
        });
        nameToCategoryId.set(catName, created.categoryId);
        return created.categoryId;
      }

      for (const row of preview) {
        if (row.flagged) {
          skipped += 1;
          continue;
        }
        const price = Number.parseFloat(row.price);
        if (!Number.isFinite(price)) {
          skipped += 1;
          messages.push(`Skipped row ${row.rowIndex + 1}: invalid price`);
          continue;
        }
        const categoryId = await ensureCategoryId(row.category);
        await items.createItem(venueId, menuPublicId, {
          categoryPublicId: categoryId,
          name: row.name,
          price,
          description: row.description,
          allergens: row.allergenLabels,
          image: PLACEHOLDER_THUMB,
          visibleOnMenu: true,
        });
        imported += 1;
      }

      await store.completeCommit(commitJob._id, {
        imported,
        skipped,
        messages,
      });
    } catch (e) {
      await store.failJob(commitJob._id, e instanceof Error ? e.message : String(e));
    }
    continue;
  }

  return;
  }
}
