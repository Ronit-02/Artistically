import { prisma } from "@/lib/prisma";

export const reviewService = {
  async listForArtist(userId: string) {
    return prisma.review.findMany({
      where: { product: { artist: { userId } } },
      select: {
        id: true,
        rating: true,
        text: true,
        orderItemId: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    }).then((reviews) => reviews.map(({ orderItemId, ...review }) => ({ ...review, verified: Boolean(orderItemId) })));
  },
};
