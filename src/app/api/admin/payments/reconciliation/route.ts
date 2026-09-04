// GET /api/admin/payments/reconciliation — inspect durable payment balance checks
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, AdminReconciliationQuerySchema } from "@/lib/validators";
import { paymentService } from "@/lib/services/payment.service";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrators only");
  const input = validate(AdminReconciliationQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
  return ok(await paymentService.listReconciliations(input.status));
});
