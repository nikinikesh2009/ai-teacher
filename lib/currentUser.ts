import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("tutorflow_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

