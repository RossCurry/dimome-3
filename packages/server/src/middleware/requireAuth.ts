import type { RequestHandler } from "express";
import type { AuthService } from "../services/authService.js";
import { sendError } from "../http/errors.js";

export function requireAuth(auth: AuthService): RequestHandler {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const regMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
    if (!regMatch?.[1]) {
      sendError(res, 401, "unauthorized", "Missing or invalid Authorization header");
      return;
    }
    const session = auth.verifyToken(regMatch[1]);
    if (!session) {
      sendError(res, 401, "unauthorized", "Invalid or expired token");
      return;
    }
    req.auth = session;
    next();
  };
}
