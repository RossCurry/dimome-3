import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { ObjectId, type Db } from "mongodb";
import { COL } from "../adapters/persistence/mongo/collections.js";
import type { UserDoc } from "../adapters/persistence/mongo/types.js";

export type LoginResult =
  | { ok: true; token: string; userId: string; venueId: string }
  | { ok: false; reason: "invalid_credentials" };

export class AuthService {
  constructor(
    private readonly db: Db,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.db.collection<UserDoc>(COL.users).findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) return { ok: false, reason: "invalid_credentials" };
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return { ok: false, reason: "invalid_credentials" };

    const venueId = user.venueId.toHexString();
    const userId = user._id.toHexString();
    const token = jwt.sign({ sub: userId, venueId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as SignOptions["expiresIn"],
    });
    return { ok: true, token, userId, venueId };
  }

  verifyToken(token: string): { userId: string; venueId: string } | null {
    try {
      const p = jwt.verify(token, this.jwtSecret) as JwtPayload;
      const userId = typeof p.sub === "string" ? p.sub : undefined;
      const venueId = typeof p.venueId === "string" ? p.venueId : undefined;
      if (!userId || !venueId) return null;
      new ObjectId(userId);
      new ObjectId(venueId);
      return { userId, venueId };
    } catch {
      return null;
    }
  }
}
