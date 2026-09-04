import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { collectionService } from "@/lib/services/collection.service";
import { forbidden, noContent, notFound, ok, withErrorHandler } from "@/lib/api-response";
import { validate, RouteIdSchema, UpdateArtistCollectionSchema } from "@/lib/validators";

function isArtistRole(role: string) {
  return role === "ARTIST" || role === "ADMIN";
}

export const PATCH = withErrorHandler(async (req: NextRequest, ctx) => {
  const auth = await requireAuth(req);
  if (!isArtistRole(auth.role)) return forbidden("Artists only");
  const { id } = validate(RouteIdSchema, await (ctx as { params: Promise<{ id: string }> }).params);
  const collection = await collectionService.updateForArtist(auth.userId, id, validate(UpdateArtistCollectionSchema, await req.json()));
  return collection ? ok(collection) : notFound("Collection not found");
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx) => {
  const auth = await requireAuth(req);
  if (!isArtistRole(auth.role)) return forbidden("Artists only");
  const { id } = validate(RouteIdSchema, await (ctx as { params: Promise<{ id: string }> }).params);
  const archived = await collectionService.archiveForArtist(auth.userId, id);
  return archived ? noContent() : notFound("Collection not found");
});
