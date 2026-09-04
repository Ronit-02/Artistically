import { collectionService } from "@/lib/services/collection.service";
import { ok, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async () => ok(await collectionService.list()));
