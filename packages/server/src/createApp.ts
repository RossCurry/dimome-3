import cors from "cors";
import express, { type Express, Router } from "express";
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { MongoCsvImportJobStore } from "jobs";
import type { AppConfig } from "./config.js";
import { MongoPublicMenuReadAdapter } from "./adapters/persistence/mongo/mongoPublicMenuReadAdapter.js";
import { MongoOwnerMenusAdapter } from "./adapters/persistence/mongo/mongoOwnerMenusAdapter.js";
import { MongoOwnerCategoriesAdapter } from "./adapters/persistence/mongo/mongoOwnerCategoriesAdapter.js";
import { MongoOwnerItemsAdapter } from "./adapters/persistence/mongo/mongoOwnerItemsAdapter.js";
import { COL } from "./adapters/persistence/mongo/collections.js";
import type { VenueDoc } from "./adapters/persistence/mongo/types.js";
import { AuthService } from "./services/authService.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { healthRouter } from "./routes/v1/health.js";
import { publicMenuRouter } from "./routes/v1/publicMenu.js";
import { authRouter } from "./routes/v1/auth.js";
import { ownerRouter } from "./routes/v1/owner.js";
import { csvImportJobsRouter } from "./routes/v1/csvImportJobs.js";
import { defaultErrorHandler } from "./http/errors.js";
import { processCsvImportTick } from "./services/csvImport/csvImportProcessor.js";

export type CreateAppResult = {
  app: Express;
  csvImportWorkerTick: () => Promise<void>;
};

export function createApp(db: Db, config: AppConfig): CreateAppResult {
  const app = express();
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  const publicMenu = new MongoPublicMenuReadAdapter(db);
  const ownerMenus = new MongoOwnerMenusAdapter(db);
  const ownerCategories = new MongoOwnerCategoriesAdapter(db);
  const ownerItems = new MongoOwnerItemsAdapter(db);
  const auth = new AuthService(db, config.jwtSecret, config.jwtExpiresIn);

  const csvJobStore = new MongoCsvImportJobStore(db);

  // TODO seems like this stack would be easier to read in its own file
  const ownerStack = Router();
  ownerStack.use(
    ownerRouter(
      ownerMenus,
      ownerCategories,
      ownerItems,
      async (venueId: string) => {
        const v = await db.collection<VenueDoc>(COL.venues).findOne({
          _id: new ObjectId(venueId),
        });
        return v?.name ?? "";
      },
    ),
  );
  ownerStack.use(csvImportJobsRouter({ store: csvJobStore, menus: ownerMenus }));

  const v1 = express.Router();
  v1.use(healthRouter());
  v1.use("/public", publicMenuRouter(publicMenu));
  v1.use("/auth", authRouter(auth));
  v1.use("/owner", requireAuth(auth), ownerStack);

  app.use("/api/v1", v1);

  // will catch final errors that bubble up
  app.use(defaultErrorHandler);

  const csvImportWorkerTick = () =>
    processCsvImportTick({
      store: csvJobStore,
      categories: ownerCategories,
      items: ownerItems,
    });

  return { app, csvImportWorkerTick };
}
