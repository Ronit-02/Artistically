import type { PrismaClient } from "@prisma/client";
import { demoArtists, demoId } from "./demo-content";
import { digitalArtworks } from "./digital-content";
import { sculptureArtworks } from "./sculpture-content";
import { woodworkArtworks } from "./woodwork-content";
import { ceramicArtworks } from "./ceramic-content";
import { glassArtworks } from "./glass-content";
import { textileArtworks } from "./textile-content";
import { additionalPaintingArtworks } from "./painting-content";

// User-supplied covers; all listing facts and artist assignments are fictional.
const paintingArtworks = [
  { title: "Embers Across the Anchorage", artist: 1, originalRupees: 28000, discount: 10, width: 90, height: 60, medium: "Oil on canvas", description: "A luminous evening sky stretches over still water, where pale sails and a dark vessel meet warm reflections.", image: "https://media.gq-magazine.co.uk/photos/5d1394937eab72a8e73f4758/master/w_1600,c_limit/The-Fighting-Temeraire-GQ-31Oct14_pr_b.jpg" },
  { title: "A City Wakes in Gold", artist: 0, originalRupees: 32000, discount: 15, width: 100, height: 70, medium: "Oil on linen", description: "Sunlight opens between monumental buildings and a quiet waterfront, filling the distant sky with amber haze.", image: "https://media.gq-magazine.co.uk/photos/5d139493b3005e3ff47c4b85/master/w_1600,c_limit/Dido-Building-Carthage-GQ-31Oct14_pr_b.jpg" },
  { title: "The Blue Before Silence", artist: 9, originalRupees: 12000, discount: 10, width: 60, height: 40, medium: "Pigment print on cotton paper", description: "A curling crest of deep blue water frames small boats and a distant peak, balancing fine lines with sweeping movement.", image: "https://i0.wp.com/d16kd6gzalkogb.cloudfront.net/magazine_images/Katsushika_Hokusai_-_The_Great_Wave_off_Kanagawa_1831_art_masterpiece.jpeg?ssl=1" },
  { title: "When the Horizon Answers", artist: 1, originalRupees: 36000, discount: 20, width: 110, height: 75, medium: "Oil on canvas", description: "Figures gather beneath a restless sky, their reaching gestures and diagonal silhouettes creating an intense passage from shadow toward light.", image: "https://i0.wp.com/d16kd6gzalkogb.cloudfront.net/magazine_images/Theodore_Gericault_-_The_Raft_of_the_Medusa_1818_1819.jpeg?ssl=1" },
  { title: "Rooms for a Thousand Dreams", artist: 0, originalRupees: 24000, discount: 15, width: 80, height: 60, medium: "Oil on panel", description: "An immense circular building rises above a busy landscape, its repeating arches and warm stone tones inviting a closer look.", image: "https://i0.wp.com/d16kd6gzalkogb.cloudfront.net/magazine_images/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_1563.jpeg?ssl=1" },
  { title: "The Weight of a Quiet Gaze", artist: 1, originalRupees: 20000, discount: 5, width: 50, height: 65, medium: "Oil on canvas", description: "A close portrait in warm rose and ochre tones, with a raised hand and broad, angular brushwork shaping a thoughtful face.", image: "https://www.artfund.org/_amplify/image?url=https:%2F%2Fdw4k6npnyoqvk.cloudfront.net%2Fnews%2F2013%2F08%2Ftop-ten-british%2Ftop-ten-british-5.jpg&w=1536&format=webp&q=75" },
  { title: "The Distance We Remember", artist: 0, originalRupees: 26000, discount: 10, width: 85, height: 60, medium: "Oil on linen", description: "A reclining figure floats beneath flowering branches in a richly detailed green waterway, surrounded by reeds, leaves, and small scattered blossoms.", image: "https://www.artfund.org/_amplify/image?url=https:%2F%2Fdw4k6npnyoqvk.cloudfront.net%2Fnews%2F2013%2F08%2Ftop-ten-british%2Ftop-ten-british-2.jpg&w=1536&format=webp&q=75" },
];

export const urlArtworks = [
  ...paintingArtworks.map((artwork) => ({ ...artwork, category: "PAINTINGS" as const })),
  ...digitalArtworks,
  ...sculptureArtworks,
  ...woodworkArtworks,
  ...ceramicArtworks,
  ...glassArtworks,
  ...textileArtworks,
  // Append additions so persisted artwork IDs and collection indices stay stable.
  ...additionalPaintingArtworks,
];

export async function seedUrlContent(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development catalog must not run in production");
  }

  await prisma.$transaction(async (tx) => {
    if (process.env.REPLACE_CATALOG === "true") {
      // Never erase purchase history or change artwork underneath an existing order.
      if (await tx.orderItem.count() > 0) {
        throw new Error("Catalog replacement requires a development database without order items");
      }
      await tx.collection.deleteMany();
      await tx.story.deleteMany();
      await tx.product.deleteMany();
      // Remove only inactive, passwordless identities created by the former fixtures.
      await tx.user.deleteMany({ where: {
        isActive: false, password: null, email: { endsWith: ".reference@example.com" },
        artist: { handle: { startsWith: "@reference-" } },
      } });
    }

    const owners = [];
    for (const [index, profile] of demoArtists.entries()) {
      const { email, firstName, lastName, handle, bio, avatar } = profile;
      const user = await tx.user.upsert({
        where: { email }, update: { avatar },
        create: { email, firstName, lastName, avatar, role: "ARTIST" },
      });
      const cover = urlArtworks.find((artwork) => artwork.artist === index)?.image ?? null;
      owners.push(await tx.artist.upsert({
        where: { userId: user.id }, update: { cover },
        create: { userId: user.id, handle, bio, cover, verified: false },
      }));
    }

    const categoryCounts = new Map<string, number>();
    for (const [index, artwork] of urlArtworks.entries()) {
      const categoryCount = (categoryCounts.get(artwork.category) ?? 0) + 1;
      categoryCounts.set(artwork.category, categoryCount);
      const id = demoId(3000000 + index);
      const isDigital = artwork.category === "DIGITAL_ART";
      const details = {
        artworkType: isDigital ? "DIGITAL" as const : "ORIGINAL" as const,
        medium: artwork.medium, materials: artwork.medium,
        width: artwork.width, height: artwork.height, dimensionUnit: isDigital ? "px" : "cm",
        ...(artwork.category === "SCULPTURES" || artwork.category === "WOODWORK" || artwork.category === "CERAMICS" || artwork.category === "GLASS_ART" || artwork.category === "TEXTILE" ? { depth: artwork.depth } : {}),
        condition: isDigital ? "Digital artwork (development sample)" : "New (development sample)",
        framing: isDigital ? "Not applicable; digital artwork preview" : artwork.category === "SCULPTURES" ? "Freestanding sculpture; display plinth and props excluded (sample specification)" : artwork.category === "WOODWORK" ? "Display props excluded; mounting and finish are sample specifications" : artwork.category === "CERAMICS" ? "Decorative ceramic; plants, display supports, and props excluded (sample specification)" : artwork.category === "GLASS_ART" ? "Decorative glasswork; display props excluded; mounting and lighting are sample specifications" : artwork.category === "TEXTILE" ? "Decorative textile artwork; mounting, hoops, and display enclosures are sample specifications; props excluded" : "Unframed (sample specification)",
        authenticity: "Demo only; no creator attribution or authenticity certificate",
        provenance: "User-supplied external cover; fictional app artist assignment",
        fulfillmentMode: isDigital ? "DIGITAL" as const : "PHYSICAL" as const,
      };
      const listing = {
        artistId: owners[artwork.artist].id,
        title: artwork.title,
        description: `${artwork.description}\n\nFictional Artistically development listing with sample artist assignments, materials, dimensions, pricing, and inventory.`,
        category: artwork.category, badge: null, stock: categoryCount <= 3 ? 0 : 1,
        originalPrice: artwork.originalRupees * 100,
        price: artwork.originalRupees * (100 - artwork.discount), discount: artwork.discount,
      };
      const image = { url: artwork.image, isPrimary: true, sortOrder: 0 };
      await tx.product.upsert({
        where: { id },
        create: { id, ...listing, images: { create: image }, artworkDetails: { create: details } },
        update: { ...listing, images: { deleteMany: {}, create: image }, artworkDetails: { upsert: { create: details, update: details } } },
      });
    }
  }, { timeout: 180000 });
  console.log(`Seeded ${urlArtworks.length} URL-backed artworks.`);
}

