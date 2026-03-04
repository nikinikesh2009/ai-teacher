import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

const JWT_SECRET = getJwtSecret();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type AdminPayload = { adminId: string; email: string; role: string };

export function generateAdminToken(payload: AdminPayload): string {
  return jwt.sign(
    { ...payload, scope: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload & {
      scope?: string;
    };
    if (decoded.scope !== "admin") return null;
    return {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
