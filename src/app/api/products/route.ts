// GET  /api/products  — list products with filtering, sorting, pagination
// POST /api/products  — create a product (artist only)
import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product.service";
import { requireAuth } from "@/lib/auth";
import { validate, ProductQuerySchema, CreateProductSchema } from "@/lib/validators";
import { paginated, created, forbidden, withErrorHandler } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const query = validate(ProductQuerySchema, {
    ...Object.fromEntries(searchParams),
    categories: searchParams.getAll("category").length > 0 ? searchParams.getAll("category") : undefined,
    priceRanges: searchParams.getAll("priceRange").length > 0 ? searchParams.getAll("priceRange") : undefined,
    minRatings: searchParams.getAll("minRating").length > 0 ? searchParams.getAll("minRating") : undefined,
  });
  const { products, total } = await productService.list(query);
  return paginated(products, total, query.page, query.limit);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);

  // Only artists can create products
  const artist = await prisma.artist.findUnique({ where: { userId: auth.userId } });
  if (!artist) return forbidden("You must be an artist to list products");

  const body = await req.json();
  const input = validate(CreateProductSchema, body);
  const product = await productService.create(artist.id, input);
  return created(product);
});
