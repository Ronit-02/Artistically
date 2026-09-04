import { NextRequest } from "next/server";
import { collectionService } from "@/lib/services/collection.service";
import { validate, RouteIdSchema } from "@/lib/validators";
import { notFound, ok, withErrorHandler } from "@/lib/api-response";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_request: NextRequest, context: unknown) => {
  const { id } = await (context as Context).params;
  const validId = validate(RouteIdSchema, { id }).id;
  const collection = await collectionService.getById(validId);
  if (!collection) return notFound("Collection not found");
  return ok(collection);
});
