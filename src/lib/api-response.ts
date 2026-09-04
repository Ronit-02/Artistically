// ─────────────────────────────────────────────────────────────────────────────
// lib/api-response.ts
// Standardised JSON response helpers for all route handlers
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { InvalidStateError } from "./domain-errors";
import { ValidationError } from "./validators";
import { logger } from "./logger";

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
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    const startedAt = Date.now();

    try {
      const response = await handler(req, ctx);
      response.headers.set("x-request-id", requestId);
      logger.info("api.request.completed", {
        requestId,
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (err) {
      let response: NextResponse;

      if (err instanceof AuthError) {
        response = unauthorized(err.message);
      } else if (err instanceof ValidationError) {
        response = badRequest("Validation failed", err.fields);
      } else if (err instanceof InvalidStateError) {
        response = badRequest(err.message);

      // Prisma unique constraint violation
      } else if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        response = conflict("A record with this value already exists");
      } else {
        logger.error("api.request.failed", {
          requestId,
          method: req.method,
          path: new URL(req.url).pathname,
          durationMs: Date.now() - startedAt,
          error: err,
        });
        response = serverError();
      }

      response.headers.set("x-request-id", requestId);
      logger.info("api.request.completed", {
        requestId,
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
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
