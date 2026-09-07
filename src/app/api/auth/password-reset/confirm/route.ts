import { NextRequest } from "next/server";
import { badRequest, ok, withErrorHandler } from "@/lib/api-response";
import { resetPassword } from "@/lib/auth-tokens";
import { ConfirmPasswordResetSchema, validate } from "@/lib/validators";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const input = validate(ConfirmPasswordResetSchema, await request.json());
  if (!await resetPassword(input.token, input.password)) return badRequest("This password-reset link is invalid or has expired.");
  return ok({ message: "Your password has been reset. Please sign in with your new password." });
});
