// POST /api/reports/[id]/appeal — submit an appeal as the affected owner

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validate, CreateAppealSchema, RouteIdSchema } from "@/lib/validators";
import { conflict, forbidden, notFound, created, withErrorHandler } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const auth = await requireAuth(req);
  const { id } = await (ctx as Ctx).params;
  const reportId = validate(RouteIdSchema, { id }).id;
  const { statement } = validate(CreateAppealSchema, await req.json());

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      appeal: { select: { id: true } },
      product: { select: { artist: { select: { userId: true } } } },
      collection: { select: { ownerArtist: { select: { userId: true } } } },
    },
  });
  if (!report) return notFound("Report not found");
  if (report.status !== "RESOLVED") return forbidden("Only resolved reports can be appealed");
  const ownerUserId = report.product?.artist.userId ?? report.collection?.ownerArtist?.userId;
  if (ownerUserId !== auth.userId) return forbidden("Only the affected owner can appeal");
  if (report.appeal) return conflict("This report already has an appeal");

  const appeal = await prisma.$transaction(async (tx) => {
    const createdAppeal = await tx.moderationAppeal.create({
      data: { reportId, appellantId: auth.userId, statement },
    });
    await tx.moderationEvent.create({
      data: {
        reportId,
        appealId: createdAppeal.id,
        actorId: auth.userId,
        type: "APPEAL_SUBMITTED",
        note: statement,
      },
    });
    return createdAppeal;
  });

  return created(appeal);
});
