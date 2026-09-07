import { rotateAuthSession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async () => {
  await rotateAuthSession();
  return ok({ refreshed: true });
});
