import { loadEnv } from "./loadEnv.js";
loadEnv();

import { loadConfig } from "./config.js";
import { connectMongo, closeMongo, getDb } from "./db.js";
import { ensureIndexes } from "./adapters/persistence/mongo/ensureIndexes.js";
import { startWorkerLoop } from "jobs";
import { createApp } from "./createApp.js";

async function main() {
  const config = loadConfig();
  await connectMongo(config.mongodbUri);
  await ensureIndexes(getDb());
  const { app, csvImportWorkerTick } = createApp(getDb(), config);
  const server = app.listen(config.port, () => {
    console.log(`DiMoMe API http://localhost:${config.port}/api/v1/health`);
  });

  const csvWorker = startWorkerLoop({
    intervalMs: 450,
    tick: csvImportWorkerTick,
  });

  const shutdown = () => {
    csvWorker.stop();
    server.close(() => {
      void closeMongo().then(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
