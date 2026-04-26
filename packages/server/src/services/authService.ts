import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { MongoServerError, ObjectId, type Db } from "mongodb";
import { COL } from "../adapters/persistence/mongo/collections.js";
import type { UserDoc, VenueDoc } from "../adapters/persistence/mongo/types.js";

const BCRYPT_COST = 10;
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_MAX_LENGTH = 254;
const BUSINESS_NAME_MAX_LENGTH = 200;

export type LoginResult =
  | { ok: true; token: string; userId: string; venueId: string }
  | { ok: false; reason: "invalid_credentials" };

export type RegisterResult =
  | { ok: true; token: string; userId: string; venueId: string }
  | { ok: false; reason: "validation_error"; message: string }
  | { ok: false; reason: "email_taken" };

function isDuplicateKeyError(e: unknown): boolean {
  return e instanceof MongoServerError && e.code === 11000;
}

export class AuthService {
  constructor(
    private readonly db: Db,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string,
  ) {}

  private signSession(userId: ObjectId, venueId: ObjectId): string {
    return jwt.sign(
      { sub: userId.toHexString(), venueId: venueId.toHexString() },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn as SignOptions["expiresIn"] },
    );
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.db.collection<UserDoc>(COL.users).findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) return { ok: false, reason: "invalid_credentials" };
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return { ok: false, reason: "invalid_credentials" };

    const venueId = user.venueId.toHexString();
    const userId = user._id.toHexString();
    const token = this.signSession(user._id, user.venueId);
    return { ok: true, token, userId, venueId };
  }

  /**
   * Creates a venue + owner user and returns a session token. Uses a duplicate-email
   * pre-check plus compensating venue delete on insert races (standalone Mongo has no
   * reliable multi-doc transactions here).
   */
  async register(
    email: string,
    password: string,
    businessName: string,
  ): Promise<RegisterResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedBusiness = businessName.trim();

    if (!normalizedEmail || !password || !trimmedBusiness) {
      return {
        ok: false,
        reason: "validation_error",
        message: "email, password, and business name are required",
      };
    }
    if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
      return {
        ok: false,
        reason: "validation_error",
        message: "email is too long",
      };
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return {
        ok: false,
        reason: "validation_error",
        message: `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      };
    }
    if (trimmedBusiness.length > BUSINESS_NAME_MAX_LENGTH) {
      return {
        ok: false,
        reason: "validation_error",
        message: "business name is too long",
      };
    }

    const taken = await this.db.collection<UserDoc>(COL.users).findOne({
      email: normalizedEmail,
    });
    if (taken) {
      return { ok: false, reason: "email_taken" };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const venueId = new ObjectId();
    const userId = new ObjectId();

    try {
      await this.db.collection<VenueDoc>(COL.venues).insertOne({
        _id: venueId,
        name: trimmedBusiness,
      });
      await this.db.collection<UserDoc>(COL.users).insertOne({
        _id: userId,
        email: normalizedEmail,
        passwordHash,
        venueId,
      });
    } catch (e) {
      await this.db.collection(COL.venues).deleteOne({ _id: venueId });
      if (isDuplicateKeyError(e)) {
        return { ok: false, reason: "email_taken" };
      }
      throw e;
    }

    const token = this.signSession(userId, venueId);
    return {
      ok: true,
      token,
      userId: userId.toHexString(),
      venueId: venueId.toHexString(),
    };
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
