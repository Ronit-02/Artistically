// POST /api/auth/logout
import { clearAuthCookie } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function POST() {
  await clearAuthCookie();
  return ok({ message: "Logged out successfully" });
}
