import type { PrismaClient } from "@prisma/client";
import { demoArtists, demoId } from "./demo-content";
import { urlArtworks } from "./url-content";

// Development selections use existing catalog records and remote covers.
const selections = [
  { name: "Paintings: Water & Light", description: "Harbours, bright reflections, and the sweep of a wave bring together these paintings of water and changing light.", category: "PAINTINGS", indices: [0, 1, 2] },
  { name: "Paintings: Worlds Within", description: "Expansive scenes and imagined spaces invite a slower look at the figures, architecture, and stories within a painted world.", category: "PAINTINGS", indices: [3, 4] },
  { name: "Paintings: Quiet Encounters", description: "A close gaze and a figure among flowering branches explore two different ways of making a human presence felt.", category: "PAINTINGS", indices: [5, 6] },
  { name: "Digital Art: Imagined Worlds", description: "Cinematic skies, unexpected characters, and luminous landscapes open a window onto worlds built through digital image making.", category: "DIGITAL_ART", indices: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  { name: "Digital Art: Colour Beyond Reality", description: "Electric blues, glowing horizons, and layered forms turn digital colour into a setting for stories beyond the everyday.", category: "DIGITAL_ART", indices: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
  { name: "Sculptures: Lines in Motion", description: "Curves, gestures, and open structures give this selection its sense of movement, tracing a line between solid form and surrounding space.", category: "SCULPTURES", indices: [31, 32, 33, 34, 35, 36, 37, 38] },
  { name: "Sculptures: Balance & Presence", description: "Figures, contours, and balanced forms explore how sculpture can occupy a room with both energy and stillness.", category: "SCULPTURES", indices: [39, 40, 41, 42, 43, 44, 45, 46] },
  { name: "Sculptures: Nature Reimagined", description: "Sails, blossoms, animals, and organic contours offer a sculptural conversation with the shapes of the living world.", category: "SCULPTURES", indices: [47, 48, 49, 50, 51, 52, 53, 54] },
  { name: "Woodwork: Grain & Gesture", description: "Carved surfaces and expressive silhouettes reveal wood as a material for movement, texture, and carefully observed natural forms.", category: "WOODWORK", indices: [55, 56, 57, 58, 59, 60, 61, 62] },
  { name: "Woodwork: Vessels & Flow", description: "Rims, ripples, and winding forms draw attention to the relationship between a wooden object's surface and the space it holds.", category: "WOODWORK", indices: [63, 64, 65, 66, 67, 68, 69, 70] },
  { name: "Woodwork: Branches & Balance", description: "Loops, branching shapes, and gathered grain connect these wooden works through rhythm, balance, and an affinity with the outdoors.", category: "WOODWORK", indices: [71, 72, 73, 74, 75, 76, 77, 78] },
  { name: "Ceramics: Playful Forms", description: "Unexpected silhouettes, vivid surfaces, and small sculptural surprises celebrate the playful possibilities of clay.", category: "CERAMICS", indices: [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91] },
  { name: "Ceramics: Stories in Clay", description: "Faces, figures, painted scenes, and imaginative vessels turn ceramic form into a place for stories and close observation.", category: "CERAMICS", indices: [92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104] },
  { name: "Ceramics: Earth & Imagination", description: "Botanical echoes, textured surfaces, and wandering shapes bring together a selection rooted in clay's expressive range.", category: "CERAMICS", indices: [105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116] },
  { name: "Glass Art: Currents of Colour", description: "Blue depths, flowing lines, and collected light reveal the shifting colours and layered surfaces of glass.", category: "GLASS_ART", indices: [117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127] },
  { name: "Glass Art: Light Held Still", description: "Amber tones, clear pools, delicate ribbons, and branching forms catch the eye through glass's interplay of colour and light.", category: "GLASS_ART", indices: [128, 129, 130, 131, 132, 133, 134, 135, 136, 137] },
  { name: "Glass Art: Sculptural Experiments", description: "From small worlds to architectural arrangements, these glass works explore expressive form, surprising details, and changing viewpoints.", category: "GLASS_ART", indices: [138, 139, 140, 141, 142, 143, 144, 145, 146, 147] },
  { name: "Textiles: Landscapes in Fibre", description: "Soft shorelines, gardens, winter groves, and stitched paths translate the natural world into tactile textile compositions.", category: "TEXTILE", indices: [148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163] },
  { name: "Textiles: Stitched Observations", description: "Flowers, foliage, familiar figures, and small moments emerge through stitches, layered colour, and the texture of thread.", category: "TEXTILE", indices: [164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178] },
  { name: "Textiles: Pattern & Personal Worlds", description: "Portraits, domestic scenes, repeating motifs, and loose threads explore the stories that can unfold across a textile surface.", category: "TEXTILE", indices: [179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193] },
] as const;

const collectionArtistIndices: Partial<Record<number, number>> = {
  1: 1, 3: 5, 5: 3, 8: 6, 11: 2, 14: 8, 17: 4,
};

export const demoCollections = selections.map((selection, index) => {
  const artistIndex = collectionArtistIndices[index];
  const artworks = selection.indices.flatMap((artworkIndex) => {
    const artwork = urlArtworks[artworkIndex];
    if (!artwork || artwork.category !== selection.category) {
      throw new Error(`Invalid artwork selection for ${selection.name}`);
    }
    if (artistIndex !== undefined && artwork.artist !== artistIndex) {return [];}
    return [{ id: demoId(3000000 + artworkIndex), image: artwork.image }];
  });
  return {
    id: demoId(4000000 + index),
    name: selection.name,
    featured: [2, 12, 18].includes(index),
    description: selection.description,
    category: selection.category,
    ownerEmail: artistIndex === undefined ? null : demoArtists[artistIndex].email,
    coverImage: artworks[0].image,
    productIds: artworks.map((artwork) => artwork.id),
  };
});

export async function seedCollections(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development collection seed must not run in production");
  }
  await prisma.$transaction(async (tx) => {
    for (const collection of demoCollections) {
      const owner = collection.ownerEmail
        ? await tx.artist.findFirst({ where: { user: { email: collection.ownerEmail } }, select: { id: true } })
        : null;
      if (collection.ownerEmail && !owner) {
        throw new Error(`Seed the artist before creating ${collection.name}`);
      }
      const existing = await tx.collection.findUnique({ where: { id: collection.id }, select: { ownerArtistId: true } });
      if (existing?.ownerArtistId && existing.ownerArtistId !== owner?.id) {
        throw new Error("The development seed cannot replace an artist-owned collection");
      }
      const count = await tx.product.count({ where: { id: { in: collection.productIds }, category: collection.category, isActive: true, ...(owner ? { artistId: owner.id } : {}) } });
      if (count !== collection.productIds.length) {
        throw new Error(`Seed the catalog before creating ${collection.name}`);
      }
      const fields = { name: collection.name, description: collection.description, coverImage: collection.coverImage, published: true, ownerArtistId: owner?.id ?? null, ...(collection.featured ? { featured: true } : {}) };
      const items = collection.productIds.map((productId, sortOrder) => ({ productId, sortOrder }));
      await tx.collection.upsert({
        where: { id: collection.id },
        create: { id: collection.id, ...fields, items: { create: items } },
        update: { ...fields, items: { deleteMany: {}, create: items } },
      });
    }
  }, { timeout: 60000 });
}
