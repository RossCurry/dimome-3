import { Router } from "express";
import type { AuthService } from "../../services/authService.js";
import { sendError } from "../../http/errors.js";

/**
 * Future: per-route rate limiting (and a shared store such as Redis for multi-instance).
 * Not required for the initial register endpoint.
 */
export function authRouter(auth: AuthService): Router {
  const r = Router();
  r.post("/login", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      sendError(res, 400, "validation_error", "email and password required");
      return;
    }
    const result = await auth.login(email, password);
    if (!result.ok) {
      sendError(res, 401, "invalid_credentials", "Invalid email or password");
      return;
    }
    res.json({
      token: result.token,
      userId: result.userId,
      venueId: result.venueId,
    });
  });

  r.post("/register", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const businessName =
      typeof req.body?.businessName === "string" ? req.body.businessName : "";
    const result = await auth.register(email, password, businessName);
    if (!result.ok) {
      if (result.reason === "validation_error") {
        sendError(res, 400, "validation_error", result.message);
        return;
      }
      sendError(res, 409, "email_taken", "An account with this email already exists");
      return;
    }
    res.status(201).json({
      token: result.token,
      userId: result.userId,
      venueId: result.venueId,
    });
  });

  return r;
}
