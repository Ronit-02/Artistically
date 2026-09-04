import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, CreateCertificateSchema } from "@/lib/validators";
import { forbidden, created, withErrorHandler } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (auth.role !== "ARTIST" && auth.role !== "ADMIN") return forbidden("Artist access required");
  const input = validate(CreateCertificateSchema, await req.json());
  const product = await prisma.product.findFirst({ where: auth.role === "ADMIN" ? { id: input.productId } : { id: input.productId, artist: { userId: auth.userId } }, select: { id: true, artistId: true } });
  if (!product) return forbidden("You can only certify your own artwork");
  if (input.mediaAssetId) {
    const media = await prisma.mediaAsset.findFirst({ where: { id: input.mediaAssetId, artist: { userId: auth.userId }, status: "READY", purpose: "VERIFICATION_EVIDENCE" }, select: { id: true } });
    if (!media && auth.role !== "ADMIN") return forbidden("Certificate media must be a ready evidence asset you own");
  }
  const certificate = await prisma.certificateOfAuthenticity.create({ data: { ...input, artistId: product.artistId } });
  await prisma.auditLog.create({ data: { actorId: auth.userId, action: "CERTIFICATE_CREATED", targetType: "CERTIFICATE", targetId: certificate.id, metadata: { productId: product.id } } });
  return created(certificate);
});
