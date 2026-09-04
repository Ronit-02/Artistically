import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { auditService } from "@/lib/services/audit.service";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  return ok(await auditService.list(req.nextUrl.searchParams.get("targetType") ?? undefined, req.nextUrl.searchParams.get("targetId") ?? undefined));
});
