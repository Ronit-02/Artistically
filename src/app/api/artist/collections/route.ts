import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { collectionService } from "@/lib/services/collection.service";
import { created, forbidden, ok, withErrorHandler } from "@/lib/api-response";
import { validate, CreateArtistCollectionSchema } from "@/lib/validators";

function assertArtistRole(role: string) {
  if (role !== "ARTIST" && role !== "ADMIN") return false;
  return true;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!assertArtistRole(auth.role)) return forbidden("Artists only");
  return ok(await collectionService.listForArtist(auth.userId));
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!assertArtistRole(auth.role)) return forbidden("Artists only");
  const collection = await collectionService.createForArtist(auth.userId, validate(CreateArtistCollectionSchema, await req.json()));
  if (!collection) return forbidden("You must have an artist profile to create a collection");
  return created(collection);
});
