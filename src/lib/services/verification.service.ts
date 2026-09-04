import { prisma } from "@/lib/prisma";
import { InvalidStateError } from "@/lib/domain-errors";
import type { z } from "zod";
import type {
  DecideArtistVerificationSchema,
  SubmitArtistVerificationSchema,
} from "@/lib/validators";

type SubmitInput = z.infer<typeof SubmitArtistVerificationSchema>;
type DecisionInput = z.infer<typeof DecideArtistVerificationSchema>;

const ownerSelect = {
  id: true,
  artistId: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  decisionNote: true,
  evidence: { select: { type: true, note: true, createdAt: true } },
} as const;

export const verificationService = {
  async getForOwner(artistId: string) {
    return prisma.artistVerification.findUnique({ where: { artistId }, select: ownerSelect });
  },

  async submit(artistId: string, input: SubmitInput) {
    const existing = await prisma.artistVerification.findUnique({
      where: { artistId },
      select: { id: true, status: true },
    });

    if (existing && ["SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(existing.status)) {
      throw new InvalidStateError("This verification cannot be submitted again at its current stage");
    }

    return prisma.$transaction(async (tx) => {
      const verification = existing
        ? await tx.artistVerification.update({
            where: { id: existing.id },
            data: {
              status: "SUBMITTED",
              submittedAt: new Date(),
              reviewedAt: null,
              reviewerId: null,
              decisionNote: null,
            },
          })
        : await tx.artistVerification.create({
            data: { artistId, status: "SUBMITTED", submittedAt: new Date() },
          });

      if (existing) {
        await tx.artistVerificationEvidence.deleteMany({ where: { verificationId: verification.id } });
      }

      const policy = await tx.evidenceProviderPolicy.upsert({
        where: { providerKey: "artistically-verification" },
        create: { providerKey: "artistically-verification", name: "Artistically verification evidence", retentionDays: 2555 },
        update: {},
      });
      const retainedUntil = new Date(Date.now() + policy.retentionDays * 24 * 60 * 60 * 1000);

      await tx.artistVerificationEvidence.createMany({
        data: [
          { verificationId: verification.id, type: "IDENTITY", reference: input.identityReference, providerPolicyId: policy.id, retainedUntil },
          { verificationId: verification.id, type: "BACKGROUND", reference: "artist-submitted", note: input.backgroundStatement, providerPolicyId: policy.id, retainedUntil },
          ...(input.portfolioReference
            ? [{ verificationId: verification.id, type: "PORTFOLIO" as const, reference: input.portfolioReference, providerPolicyId: policy.id, retainedUntil }]
            : []),
        ],
      });

      return tx.artistVerification.findUniqueOrThrow({ where: { id: verification.id }, select: ownerSelect });
    });
  },

  async listForAdmin(status?: DecisionInput["status"] | "SUBMITTED") {
    return prisma.artistVerification.findMany({
      where: status ? { status } : undefined,
      include: {
        artist: { select: { id: true, handle: true, verified: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        evidence: { select: { id: true, type: true, reference: true, note: true, createdAt: true } },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "asc" }],
    });
  },

  async decideForAdmin(verificationId: string, reviewerId: string, input: DecisionInput) {
    const existing = await prisma.artistVerification.findUnique({
      where: { id: verificationId },
      select: { id: true, status: true, artistId: true },
    });
    if (!existing) return null;
    if (["NOT_SUBMITTED", "VERIFIED", "REJECTED", "REVOKED"].includes(existing.status) && input.status !== "REVOKED") {
      throw new InvalidStateError("This verification is not awaiting an administrator decision");
    }

    return prisma.$transaction(async (tx) => {
      await tx.artist.update({
        where: { id: existing.artistId },
        data: { verified: input.status === "VERIFIED" },
      });
      return tx.artistVerification.update({
        where: { id: verificationId },
        data: {
          status: input.status,
          reviewerId,
          reviewedAt: new Date(),
          decisionNote: input.decisionNote,
        },
        include: {
          artist: { select: { id: true, handle: true, verified: true, user: { select: { firstName: true, lastName: true, email: true } } } },
          reviewer: { select: { id: true, firstName: true, lastName: true } },
          evidence: { select: { id: true, type: true, reference: true, note: true, createdAt: true } },
        },
      });
    });
  },
};
