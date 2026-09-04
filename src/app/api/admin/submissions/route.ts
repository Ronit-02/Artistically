import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, AdminSubmissionQuerySchema } from "@/lib/validators";
import { mediaService } from "@/lib/services/media.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrators only");
  return ok(await mediaService.listAllSubmissions(validate(AdminSubmissionQuerySchema, Object.fromEntries(new URL(req.url).searchParams)).status));
});
