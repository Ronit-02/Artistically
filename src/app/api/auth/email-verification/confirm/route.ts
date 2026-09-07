import type { NextRequest } from "next/server";
import { badRequest, ok, withErrorHandler } from "@/lib/api-response";
import { verifyEmail } from "@/lib/auth-tokens";
import { ConfirmEmailVerificationSchema, validate } from "@/lib/validators";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const input = validate(ConfirmEmailVerificationSchema, await request.json());
  if (!await verifyEmail(input.token)) {return badRequest("This verification link is invalid or has expired.");}
  return ok({ message: "Your email address has been verified." });
});
