import type { RequestHandler } from "express";
import type { AuthService } from "../services/authService.js";
import { sendError } from "../http/errors.js";

export function requireAuth(auth: AuthService): RequestHandler {
  return (req, res, next) => {
    const h = req.headers.authorization;
    // TODO this needs to be more transparent. Dont use single letter variables. Always use clear, understandable variables.
    const m = h?.match(/^Bearer\s+(.+)$/i);
    if (!m?.[1]) {
      sendError(res, 401, "unauthorized", "Missing or invalid Authorization header");
      return;
    }
    const session = auth.verifyToken(m[1]);
    if (!session) {
      sendError(res, 401, "unauthorized", "Invalid or expired token");
      return;
    }
    req.auth = session;
    next();
  };
}
