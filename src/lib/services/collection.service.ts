import { prisma } from "@/lib/prisma";
import { productService } from "@/lib/services/product.service";
import { InvalidStateError } from "@/lib/domain-errors";

const collectionSelect = {
  id: true,
  name: true,
  description: true,
  coverImage: true,
  featured: true,
  published: true,
  _count: { select: { items: true } },
  ownerArtist: {
    select: {
      id: true,
      handle: true,
      verified: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
} as const;

function mapCollection(collection: {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  _count: { items: number };
  ownerArtist: { id: string; handle: string; verified: boolean; user: { firstName: string; lastName: string } } | null;
}) {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    coverImage: collection.coverImage,
    featured: collection.featured,
    published: collection.published,
    artworkCount: collection._count.items,
    ownerArtist: collection.ownerArtist
      ? {
          id: collection.ownerArtist.id,
          handle: collection.ownerArtist.handle,
          verified: collection.ownerArtist.verified,
          name: `${collection.ownerArtist.user.firstName} ${collection.ownerArtist.user.lastName}`.trim(),
        }
      : null,
  };
}

export const collectionService = {
  async list() {
    const collections = await prisma.collection.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: collectionSelect,
    });
    return collections.map(mapCollection);
  },

  async getById(id: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, published: true },
      select: {
        ...collectionSelect,
        items: { select: { productId: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    if (!collection) return null;

    const products = await Promise.all(collection.items.map((item) => productService.getById(item.productId)));
    return {
      ...mapCollection(collection),
      products: products.filter((product): product is NonNullable<typeof product> => product !== null),
    };
  },

  async listForArtist(userId: string) {
    const artist = await prisma.artist.findUnique({ where: { userId }, select: { id: true } });
    if (!artist) return [];
    const collections = await prisma.collection.findMany({
      where: { ownerArtistId: artist.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        published: true,
        _count: { select: { items: true } },
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            product: {
              select: {
                id: true,
                title: true,
                stock: true,
                isActive: true,
                images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    return collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      published: collection.published,
      artworkCount: collection._count.items,
      products: collection.items.map(({ product }) => ({
        id: product.id,
        title: product.title,
        image: product.images[0]?.url ?? null,
        stock: product.stock,
        isActive: product.isActive,
      })),
    }));
  },

  async createForArtist(userId: string, input: { name: string; description: string; coverImage: string; productIds: string[] }) {
    const artist = await prisma.artist.findUnique({ where: { userId }, select: { id: true } });
    if (!artist) return null;
    await assertArtistProducts(artist.id, input.productIds);
    const created = await prisma.collection.create({
      data: {
        name: input.name,
        description: input.description,
        coverImage: input.coverImage,
        ownerArtistId: artist.id,
        published: false,
        items: { create: input.productIds.map((productId, sortOrder) => ({ productId, sortOrder })) },
      },
    });
    const collections = await this.listForArtist(userId);
    return collections.find((collection) => collection.id === created.id) ?? null;
  },

  async updateForArtist(userId: string, id: string, input: { name?: string; description?: string; coverImage?: string; productIds?: string[] }) {
    const collection = await prisma.collection.findFirst({
      where: { id, ownerArtist: { userId } },
      select: { id: true },
    });
    if (!collection) return null;
    const artist = await prisma.artist.findUnique({ where: { userId }, select: { id: true } });
    if (!artist) return null;
    if (input.productIds) await assertArtistProducts(artist.id, input.productIds);
    await prisma.$transaction(async (tx) => {
      if (input.productIds) {
        await tx.collectionItem.deleteMany({ where: { collectionId: id } });
      }
      return tx.collection.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
          ...(input.productIds ? { items: { create: input.productIds.map((productId, sortOrder) => ({ productId, sortOrder })) } } : {}),
        },
      });
    });
    const collections = await this.listForArtist(userId);
    return collections.find((candidate) => candidate.id === id) ?? null;
  },

  async archiveForArtist(userId: string, id: string) {
    const result = await prisma.collection.updateMany({
      where: { id, ownerArtist: { userId } },
      data: { published: false },
    });
    return result.count === 1;
  },
};

async function assertArtistProducts(artistId: string, productIds: string[]) {
  if (new Set(productIds).size !== productIds.length) {
    throw new InvalidStateError("A collection cannot contain the same artwork twice");
  }
  if (productIds.length === 0) return;
  const count = await prisma.product.count({ where: { id: { in: productIds }, artistId, isActive: true } });
  if (count !== productIds.length) {
    throw new InvalidStateError("Collections can contain only your active artworks");
  }
}
