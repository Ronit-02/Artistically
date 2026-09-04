import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, DecideSubmissionSchema } from "@/lib/validators";
import { mediaService } from "@/lib/services/media.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ADMIN") return forbidden("Administrators only");
  const { id } = await (ctx as Ctx).params;
  const input = validate(DecideSubmissionSchema, await req.json());
  const submission = await mediaService.decideSubmission(validate(RouteIdSchema, { id }).id, input.status, input.reviewNote);
  if (!submission) return notFound("Submission not found");
  return ok(submission);
});
