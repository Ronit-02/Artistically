// ─────────────────────────────────────────────────────────────────────────────
// lib/api-response.ts
// Standardised JSON response helpers for all route handlers
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { ValidationError } from "./validators";

// ─── Success ─────────────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export function badRequest(message: string, fields?: Record<string, string[] | undefined>) {
  return NextResponse.json(
    { success: false, error: message, fields },
    { status: 400 }
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 409 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ─── Central error handler ───────────────────────────────────────────────────
// Wrap route handlers with this to catch all errors uniformly

export function withErrorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: any, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AuthError) return unauthorized(err.message);
      if (err instanceof ValidationError) return badRequest("Validation failed", err.fields);

      // Prisma unique constraint violation
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        return conflict("A record with this value already exists");
      }

      console.error("[API Error]", err);
      return serverError();
    }
  };
}

// ─── Pagination helper ───────────────────────────────────────────────────────

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
