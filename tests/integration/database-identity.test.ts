import { PrismaClient, ProductCategory } from "@prisma/client";
import { describe, expect, it, beforeAll, afterAll } from "vitest";

// These tests intentionally require an explicit test URL and opt-in flag so a
// normal application DATABASE_URL cannot be used for destructive fixture cleanup.
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const shouldRunDatabaseTests =
  process.env.RUN_DATABASE_TESTS === "true" && Boolean(testDatabaseUrl);
const describeDatabase = describe.skipIf(!shouldRunDatabaseTests);

describeDatabase("database identity boundaries", () => {
  const prisma = new PrismaClient({ datasourceUrl: testDatabaseUrl ?? "" });
  const runTag = `identity-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createdUserIds: string[] = [];
  let productId = "";
  let collectorAId = "";
  let collectorBId = "";
  let artistId = "";

  beforeAll(async () => {
    const artistUser = await prisma.user.create({
      data: {
        email: `${runTag}-artist@example.test`,
        password: "integration-test-password",
        firstName: "Integration",
        lastName: "Artist",
        role: "ARTIST",
      },
    });
    createdUserIds.push(artistUser.id);

    const artist = await prisma.artist.create({
      data: {
        userId: artistUser.id,
        handle: runTag,
      },
    });
    artistId = artist.id;

    const collectors = await Promise.all(
      ["collector-a", "collector-b"].map((name) =>
        prisma.user.create({
          data: {
            email: `${runTag}-${name}@example.test`,
            password: "integration-test-password",
            firstName: "Integration",
            lastName: name,
          },
        })
      )
    );
    collectorAId = collectors[0].id;
    collectorBId = collectors[1].id;
    createdUserIds.push(...collectors.map((collector) => collector.id));

    const product = await prisma.product.create({
      data: {
        artistId,
        title: `${runTag} artwork`,
        description: "Integration fixture",
        price: 100000,
        category: ProductCategory.PAINTINGS,
        stock: 2,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("keeps cart and wishlist records scoped to their owning user", async () => {
    const [cartA, cartB] = await Promise.all([
      prisma.cartItem.create({
        data: { userId: collectorAId, productId, quantity: 1, size: "5x7" },
      }),
      prisma.cartItem.create({
        data: { userId: collectorBId, productId, quantity: 2, size: "5x7" },
      }),
    ]);

    await prisma.wishlistItem.create({ data: { userId: collectorAId, productId } });

    const [visibleCartA, visibleCartB, wishlistA, wishlistB] = await Promise.all([
      prisma.cartItem.findMany({ where: { userId: collectorAId } }),
      prisma.cartItem.findMany({ where: { userId: collectorBId } }),
      prisma.wishlistItem.findMany({ where: { userId: collectorAId } }),
      prisma.wishlistItem.findMany({ where: { userId: collectorBId } }),
    ]);

    expect(visibleCartA.map((item) => item.id)).toEqual([cartA.id]);
    expect(visibleCartB.map((item) => item.id)).toEqual([cartB.id]);
    expect(wishlistA).toHaveLength(1);
    expect(wishlistB).toHaveLength(0);
  });

  it("rejects cross-user cart mutation lookups", async () => {
    const item = await prisma.cartItem.create({
      data: { userId: collectorBId, productId, quantity: 1, size: "8x10" },
    });

    const ownedByA = await prisma.cartItem.findFirst({
      where: { id: item.id, userId: collectorAId },
    });

    expect(ownedByA).toBeNull();
    await expect(
      prisma.cartItem.updateMany({
        where: { id: item.id, userId: collectorAId },
        data: { quantity: 2 },
      })
    ).resolves.toMatchObject({ count: 0 });

    await expect(
      prisma.cartItem.findUnique({ where: { id: item.id } })
    ).resolves.toMatchObject({ quantity: 1, userId: collectorBId });
  });

  it("rejects cross-user wishlist deletion and non-owner product mutation", async () => {
    const wishlistItem = await prisma.wishlistItem.create({
      data: { userId: collectorBId, productId },
    });

    await expect(
      prisma.wishlistItem.deleteMany({
        where: { id: wishlistItem.id, userId: collectorAId },
      })
    ).resolves.toMatchObject({ count: 0 });

    await expect(
      prisma.wishlistItem.findUnique({ where: { id: wishlistItem.id } })
    ).resolves.toMatchObject({ id: wishlistItem.id, userId: collectorBId });

    const originalTitle = `${runTag} artwork`;
    await expect(
      prisma.product.updateMany({
        where: { id: productId, artistId: "artist-owned-by-another-user" },
        data: { title: "Unauthorized mutation" },
      })
    ).resolves.toMatchObject({ count: 0 });

    await expect(
      prisma.product.findUnique({ where: { id: productId } })
    ).resolves.toMatchObject({ id: productId, artistId, title: originalTitle });

    await expect(
      prisma.product.updateMany({
        where: { id: productId, artistId },
        data: { title: "Owner mutation" },
      })
    ).resolves.toMatchObject({ count: 1 });

    await expect(
      prisma.product.findUnique({ where: { id: productId } })
    ).resolves.toMatchObject({ title: "Owner mutation", artistId });
  });

  it("keeps follows scoped to the collector and rejects duplicate follows", async () => {
    await prisma.follow.create({ data: { artistId, userId: collectorAId } });

    await expect(
      prisma.follow.findMany({ where: { artistId, userId: collectorAId } })
    ).resolves.toHaveLength(1);
    await expect(
      prisma.follow.findMany({ where: { artistId, userId: collectorBId } })
    ).resolves.toHaveLength(0);

    await expect(
      prisma.follow.create({ data: { artistId, userId: collectorAId } })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("enforces one review per buyer while allowing reviews from another buyer", async () => {
    await prisma.review.create({
      data: { productId, userId: collectorAId, rating: 5, text: "A careful review" },
    });

    await expect(
      prisma.review.create({
        data: { productId, userId: collectorAId, rating: 4, text: "A duplicate review" },
      })
    ).rejects.toMatchObject({ code: "P2002" });

    await expect(
      prisma.review.create({
        data: { productId, userId: collectorBId, rating: 4, text: "A second buyer review" },
      })
    ).resolves.toMatchObject({ productId, userId: collectorBId });
  });

  it("keeps order reads private to the owning user", async () => {
    const order = await prisma.order.create({
      data: {
        userId: collectorAId,
        subtotal: 100000,
        shippingCost: 20000,
        tax: 12000,
        total: 132000,
        shippingAddress: "Integration test address",
        items: {
          create: { productId, quantity: 1, size: "5x7", price: 100000 },
        },
      },
    });

    await expect(
      prisma.order.findFirst({ where: { id: order.id, userId: collectorAId } })
    ).resolves.toMatchObject({ id: order.id, userId: collectorAId });
    await expect(
      prisma.order.findFirst({ where: { id: order.id, userId: collectorBId } })
    ).resolves.toBeNull();
  });

  it("allows only one concurrent buyer to claim a one-of-one last item", async () => {
    const lastItem = await prisma.product.create({
      data: {
        artistId,
        title: `${runTag} one-of-one concurrency fixture`,
        price: 100000,
        category: ProductCategory.PAINTINGS,
        stock: 1,
      },
    });

    const claim = (userId: string) => prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: { id: lastItem.id, isActive: true, stock: { gte: 1 } },
        data: { stock: { decrement: 1 } },
      });
      if (updated.count !== 1) return false;
      await tx.cartItem.deleteMany({ where: { userId, productId: lastItem.id } });
      return true;
    });

    await prisma.cartItem.create({ data: { userId: collectorAId, productId: lastItem.id, quantity: 1, size: "5x7" } });
    await prisma.cartItem.create({ data: { userId: collectorBId, productId: lastItem.id, quantity: 1, size: "5x7" } });
    const results = await Promise.all([claim(collectorAId), claim(collectorBId)]);

    expect(results.sort()).toEqual([false, true]);
    await expect(prisma.product.findUnique({ where: { id: lastItem.id }, select: { stock: true } })).resolves.toEqual({ stock: 0 });
  });
});
