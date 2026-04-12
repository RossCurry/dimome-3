import { ObjectId, type Collection, type Db, type WithId } from "mongodb";
import {
  CSV_IMPORT_JOBS_COLLECTION,
  SAMPLE_ROW_LIMIT,
  type CsvColumnMapping,
  type CsvImportJobBson,
  type CsvImportJobPublic,
  type CsvImportJobStatus,
} from "./csvImportTypes.js";

function toPublic(doc: WithId<CsvImportJobBson>): CsvImportJobPublic {
  const sample = doc.records.slice(0, SAMPLE_ROW_LIMIT);
  return {
    id: doc._id.toHexString(),
    menuId: doc.menuPublicId,
    status: doc.status,
    fileName: doc.fileName,
    errorMessage: doc.errorMessage,
    headers: doc.headers ?? [],
    sampleRows: sample,
    mapping: doc.mapping ?? null,
    previewRows: doc.previewRows ?? null,
    commitResult: doc.commitResult ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class MongoCsvImportJobStore {
  private readonly coll: Collection<CsvImportJobBson>;

  constructor(db: Db) {
    this.coll = db.collection<CsvImportJobBson>(CSV_IMPORT_JOBS_COLLECTION);
  }

  async insertPendingJob(input: {
    venueId: string;
    menuPublicId: string;
    fileName: string;
    rawCsvUtf8: string;
  }): Promise<string> {
    const now = new Date();
    const doc: Omit<CsvImportJobBson, "_id"> = {
      venueId: input.venueId,
      menuPublicId: input.menuPublicId,
      status: "pending_parse",
      fileName: input.fileName,
      rawCsvUtf8: input.rawCsvUtf8,
      headers: [],
      records: [],
      mapping: null,
      previewRows: null,
      commitResult: null,
      createdAt: now,
      updatedAt: now,
    };
    const r = await this.coll.insertOne(doc as CsvImportJobBson);
    return r.insertedId.toHexString();
  }

  async getJob(
    venueId: string,
    menuPublicId: string,
    jobId: string,
  ): Promise<CsvImportJobPublic | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(jobId);
    } catch {
      return null;
    }
    const doc = await this.coll.findOne({
      _id: oid,
      venueId,
      menuPublicId,
    });
    return doc ? toPublic(doc) : null;
  }

  async findJobDoc(
    venueId: string,
    menuPublicId: string,
    jobId: string,
  ): Promise<WithId<CsvImportJobBson> | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(jobId);
    } catch {
      return null;
    }
    return this.coll.findOne({ _id: oid, venueId, menuPublicId });
  }

  async submitMapping(
    venueId: string,
    menuPublicId: string,
    jobId: string,
    mapping: CsvColumnMapping,
  ): Promise<boolean> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(jobId);
    } catch {
      return false;
    }
    const now = new Date();
    const r = await this.coll.updateOne(
      {
        _id: oid,
        venueId,
        menuPublicId,
        status: "awaiting_mapping",
      },
      {
        $set: {
          mapping,
          status: "mapping_submitted" satisfies CsvImportJobStatus,
          previewRows: null,
          updatedAt: now,
        },
      },
    );
    return r.modifiedCount === 1;
  }

  async requestCommit(venueId: string, menuPublicId: string, jobId: string): Promise<boolean> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(jobId);
    } catch {
      return false;
    }
    const now = new Date();
    const r = await this.coll.updateOne(
      {
        _id: oid,
        venueId,
        menuPublicId,
        status: "ready_for_review",
      },
      {
        $set: {
          status: "commit_pending" satisfies CsvImportJobStatus,
          updatedAt: now,
        },
      },
    );
    return r.modifiedCount === 1;
  }

  async claimPendingParse(): Promise<WithId<CsvImportJobBson> | null> {
    const now = new Date();
    return this.coll.findOneAndUpdate(
      { status: "pending_parse" },
      { $set: { status: "parsing" satisfies CsvImportJobStatus, updatedAt: now } },
      { sort: { createdAt: 1 }, returnDocument: "after" },
    );
  }

  async completeParse(
    jobId: ObjectId,
    data: {
      headers: string[];
      records: Record<string, string>[];
    },
  ): Promise<void> {
    const now = new Date();
    await this.coll.updateOne(
      { _id: jobId, status: "parsing" },
      {
        $set: {
          status: "awaiting_mapping" satisfies CsvImportJobStatus,
          headers: data.headers,
          records: data.records,
          updatedAt: now,
        },
        $unset: { rawCsvUtf8: "" },
      },
    );
  }

  async failJob(jobId: ObjectId, message: string): Promise<void> {
    const now = new Date();
    await this.coll.updateOne(
      { _id: jobId },
      {
        $set: {
          status: "failed" satisfies CsvImportJobStatus,
          errorMessage: message,
          updatedAt: now,
        },
      },
    );
  }

  async claimMappingSubmitted(): Promise<WithId<CsvImportJobBson> | null> {
    const now = new Date();
    return this.coll.findOneAndUpdate(
      { status: "mapping_submitted" },
      { $set: { status: "validating" satisfies CsvImportJobStatus, updatedAt: now } },
      { sort: { createdAt: 1 }, returnDocument: "after" },
    );
  }

  async completeValidate(jobId: ObjectId, previewRows: CsvImportJobBson["previewRows"]): Promise<void> {
    const now = new Date();
    await this.coll.updateOne(
      { _id: jobId, status: "validating" },
      {
        $set: {
          status: "ready_for_review" satisfies CsvImportJobStatus,
          previewRows,
          updatedAt: now,
        },
      },
    );
  }

  async claimCommitPending(): Promise<WithId<CsvImportJobBson> | null> {
    const now = new Date();
    return this.coll.findOneAndUpdate(
      { status: "commit_pending" },
      { $set: { status: "committing" satisfies CsvImportJobStatus, updatedAt: now } },
      { sort: { createdAt: 1 }, returnDocument: "after" },
    );
  }

  async completeCommit(
    jobId: ObjectId,
    result: NonNullable<CsvImportJobBson["commitResult"]>,
  ): Promise<void> {
    const now = new Date();
    await this.coll.updateOne(
      { _id: jobId, status: "committing" },
      {
        $set: {
          status: "committed" satisfies CsvImportJobStatus,
          commitResult: result,
          updatedAt: now,
        },
      },
    );
  }
}
