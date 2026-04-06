import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        venueId: string;
      };
    }
  }
}

export type AuthedRequest = Request;
