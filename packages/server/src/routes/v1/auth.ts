import { Router } from "express";
import type { AuthService } from "../../services/authService.js";
import { sendError } from "../../http/errors.js";

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
  return r;
}
