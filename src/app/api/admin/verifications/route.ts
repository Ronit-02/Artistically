// GET /api/admin/verifications — list artist verification cases (admin only)

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, AdminVerificationQuerySchema } from "@/lib/validators";
import { verificationService } from "@/lib/services/verification.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrator access required");
  const statusValue = req.nextUrl.searchParams.get("status") ?? undefined;
  const { status } = validate(AdminVerificationQuerySchema, { status: statusValue });
  return ok(await verificationService.listForAdmin(status));
});
