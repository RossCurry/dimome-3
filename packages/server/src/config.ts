export type AppConfig = {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
};

function parseOrigins(raw: string | undefined): string[] {
  const defaults = ["http://localhost:5173"];
  if (!raw?.trim()) return defaults;
  const extra = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...extra])];
}

export function loadConfig(): AppConfig {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }
  const port = Number(process.env.PORT) || 3000;
  return {
    port,
    mongodbUri,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  };
}
