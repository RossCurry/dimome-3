import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/** Resolve dimome3 workspace root (contains package.json workspaces). */
export function loadEnv(): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/ -> server/ -> packages/ -> dimome3/
  const dimome3Root = path.resolve(here, "../../..");
  dotenv.config({ path: path.join(dimome3Root, ".env") });
  dotenv.config({ path: path.join(dimome3Root, ".env.local") });
}
