import { MediaPurpose, MediaStatus, MediaVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toMinorUnits } from "@/lib/money";
import { mediaStorageProvider } from "@/lib/integrations/media-storage";
import { ValidationError } from "@/lib/validators";
import type { z } from "zod";
import type { CreateArtistSubmissionSchema } from "@/lib/validators";

const provider = () => mediaStorageProvider();

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "upload";
}

export const mediaService = {
  async authorizeUpload(artistId: string, input: { purpose: MediaPurpose; fileName: string; mimeType: string; sizeBytes: number }) {
    const assetId = crypto.randomUUID().replaceAll("-", "").slice(0, 25);
    const providerKey = `artists/${artistId}/${assetId}/${safeName(input.fileName)}`;
    const visibility = input.purpose === MediaPurpose.ARTWORK_IMAGE || input.purpose === MediaPurpose.ARTIST_COVER ? MediaVisibility.PUBLIC : MediaVisibility.PRIVATE;
    const asset = await prisma.mediaAsset.create({ data: { id: assetId, artistId, purpose: input.purpose, visibility, provider: provider().name, providerKey, originalName: input.fileName, mimeType: input.mimeType, sizeBytes: input.sizeBytes } });
    try {
      const upload = await provider().createUpload({ assetId: asset.id, providerKey, mimeType: input.mimeType, sizeBytes: input.sizeBytes });
      return { asset: { id: asset.id, purpose: asset.purpose, status: asset.status, visibility: asset.visibility, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes }, upload };
    } catch (error) {
      await prisma.mediaAsset.update({ where: { id: asset.id }, data: { status: MediaStatus.FAILED } });
      throw error;
    }
  },

  async completeUpload(artistId: string, assetId: string, checksum?: string) {
    const asset = await prisma.mediaAsset.findFirst({ where: { id: assetId, artistId, status: MediaStatus.UPLOADING } });
    if (!asset) return null;
    const stored = await provider().verifyUpload(asset.providerKey);
    if (stored.sizeBytes !== asset.sizeBytes) {
      await prisma.mediaAsset.update({ where: { id: asset.id }, data: { status: MediaStatus.FAILED } });
      throw new ValidationError({ file: ["Uploaded file size does not match the authorized file"] });
    }
    return prisma.mediaAsset.update({ where: { id: asset.id }, data: { status: MediaStatus.READY, checksum: checksum ?? stored.checksum } });
  },

  async getPublicAsset(assetId: string) {
    return prisma.mediaAsset.findFirst({ where: { id: assetId, status: MediaStatus.READY, visibility: MediaVisibility.PUBLIC }, select: { id: true, provider: true, providerKey: true, mimeType: true } });
  },

  async getPrivateAssetForDownload(assetId: string) {
    return prisma.mediaAsset.findFirst({ where: { id: assetId, status: MediaStatus.READY, visibility: MediaVisibility.PRIVATE }, select: { id: true, provider: true, providerKey: true, mimeType: true, originalName: true } });
  },

  async readLocal(asset: { provider: string; providerKey: string }) {
    if (asset.provider !== "local") throw new Error("Non-local assets must be read by the configured provider");
    const read = provider().readLocal;
    if (!read) throw new Error("Local media provider is unavailable");
    return read.call(provider(), asset.providerKey);
  },

  async listSubmissions(artistId: string) {
    return prisma.listingSubmission.findMany({ where: { artistId }, orderBy: { submittedAt: "desc" }, select: { id: true, productId: true, status: true, submittedAt: true, reviewedAt: true, reviewNote: true, product: { select: { title: true, isActive: true } } } });
  },

  async listAllSubmissions(status?: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED") {
    return prisma.listingSubmission.findMany({ where: status ? { status } : undefined, orderBy: { submittedAt: "asc" }, select: { id: true, productId: true, artistId: true, status: true, submittedAt: true, reviewedAt: true, reviewNote: true, product: { select: { title: true, isActive: true } }, artist: { select: { handle: true } } } });
  },

  async decideSubmission(id: string, status: "UNDER_REVIEW" | "APPROVED" | "REJECTED", reviewNote: string | undefined) {
    const submission = await prisma.listingSubmission.findUnique({ where: { id }, select: { id: true, productId: true, status: true } });
    if (!submission) return null;
    return prisma.$transaction(async (tx) => {
      const updated = await tx.listingSubmission.update({ where: { id }, data: { status, reviewNote, reviewedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : undefined } });
      if (status === "APPROVED") await tx.product.update({ where: { id: submission.productId }, data: { isActive: true } });
      if (status === "REJECTED") await tx.product.update({ where: { id: submission.productId }, data: { isActive: false } });
      return updated;
    });
  },

  async submitListing(artistId: string, input: z.infer<typeof CreateArtistSubmissionSchema>) {
    const imageAssets = await prisma.mediaAsset.findMany({ where: { id: { in: input.imageAssetIds }, artistId, status: MediaStatus.READY, purpose: MediaPurpose.ARTWORK_IMAGE }, orderBy: { createdAt: "asc" } });
    if (imageAssets.length !== input.imageAssetIds.length) throw new ValidationError({ imageAssetIds: ["Every artwork image must be an uploaded ready asset owned by you"] });
    const digitalAsset = input.digitalAssetId ? await prisma.mediaAsset.findFirst({ where: { id: input.digitalAssetId, artistId, status: MediaStatus.READY, purpose: MediaPurpose.DIGITAL_FILE } }) : null;
    if (input.digitalAssetId && !digitalAsset) throw new ValidationError({ digitalAssetId: ["The digital file must be an uploaded ready asset owned by you"] });
    const { price, originalPrice, category, title, description, discount, badge, stock, processingDays, artworkDetails } = input;
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: { artistId, title, description, price: toMinorUnits(price), originalPrice: originalPrice === undefined ? undefined : toMinorUnits(originalPrice), discount, category: category as never, badge, stock, processingDays: processingDays ?? 7, isActive: false, artworkDetails: { create: artworkDetails as never }, images: { create: imageAssets.map((asset, index) => ({ url: provider().publicUrl(asset.providerKey, asset.id), mediaAssetId: asset.id, isPrimary: index === 0, sortOrder: index })) } }, select: { id: true, title: true, isActive: true } });
      await tx.mediaAsset.updateMany({ where: { id: { in: [...input.imageAssetIds, ...(input.digitalAssetId ? [input.digitalAssetId] : [])] }, artistId }, data: { productId: created.id } });
      await tx.listingSubmission.create({ data: { productId: created.id, artistId, status: "SUBMITTED" } });
      return created;
    });
    return { ...product, status: "SUBMITTED" as const };
  },
};
