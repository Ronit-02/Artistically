import { prisma } from "@/lib/prisma";
import { productService } from "@/lib/services/product.service";
import { fromMinorUnits } from "@/lib/money";

export const metadataService = {
  async getProduct(id: string) {
    const product = await productService.getById(id);
    if (!product) return null;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      artistName: `${product.artist.user.firstName} ${product.artist.user.lastName}`.trim(),
      image: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? null,
      price: fromMinorUnits(product.price),
      stock: product.stock,
    };
  },

  async getArtist(id: string) {
    return prisma.artist.findUnique({
      where: { id },
      select: {
        id: true,
        handle: true,
        bio: true,
        cover: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }).then((artist) => {
      if (!artist) return null;
      return {
        id: artist.id,
        name: `${artist.user.firstName} ${artist.user.lastName}`.trim(),
        handle: artist.handle,
        bio: artist.bio,
        cover: artist.cover,
      };
    });
  },

  async getStory(id: string) {
    return prisma.story.findFirst({
      where: { id, published: true },
      select: { title: true, excerpt: true, image: true, category: true },
    }).then((story) => (story ? { ...story, id } : null));
  },

  async getCollection(id: string) {
    return prisma.collection.findFirst({
      where: { id, published: true },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        _count: { select: { items: true } },
      },
    }).then((collection) => collection ? {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      artworkCount: collection._count.items,
    } : null);
  },
};
