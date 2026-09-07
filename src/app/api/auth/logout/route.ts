// POST /api/auth/logout
import { clearAuthCookie } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async () => {
  await clearAuthCookie();
  return ok({ message: "Logged out successfully" });
});
