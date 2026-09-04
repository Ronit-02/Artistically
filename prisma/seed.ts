// ─────────────────────────────────────────────────────────────────────────────
// Seed script — run with: npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, ProductCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production");
  }

  const adminSeedPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const artistSeedPassword = process.env.SEED_ARTIST_PASSWORD ?? "artist123";
  const collectorSeedPassword = process.env.SEED_COLLECTOR_PASSWORD ?? "user123";

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(adminSeedPassword, 12);
  await prisma.user.upsert({
    where: { email: "admin@artistically.com" },
    update: {},
    create: {
      email: "admin@artistically.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
    },
  });

  // ── Artist users ──────────────────────────────────────────────────────────
  const artistPassword = await bcrypt.hash(artistSeedPassword, 12);

  const kellyUser = await prisma.user.upsert({
    where: { email: "kelly@artistically.com" },
    update: {},
    create: {
      email: "kelly@artistically.com",
      password: artistPassword,
      firstName: "Kelly",
      lastName: "Schmidt",
      role: Role.ARTIST,
      avatar: "/artists/artist-1.jpg",
    },
  });

  const kelly = await prisma.artist.upsert({
    where: { userId: kellyUser.id },
    update: {},
    create: {
      userId: kellyUser.id,
      handle: "@kgschmidt",
      bio: "Award-winning abstract painter based in New York. My work explores the intersection of color and emotion.",
      cover: "/artists/artist-1-cover.jpg",
      verified: true,
    },
  });

  const anaUser = await prisma.user.upsert({
    where: { email: "ana@artistically.com" },
    update: {},
    create: {
      email: "ana@artistically.com",
      password: artistPassword,
      firstName: "Ana",
      lastName: "Illueca",
      role: Role.ARTIST,
      avatar: "/artists/artist-2.jpg",
    },
  });

  const ana = await prisma.artist.upsert({
    where: { userId: anaUser.id },
    update: {},
    create: {
      userId: anaUser.id,
      handle: "@anaillueca",
      bio: "Contemporary landscape artist inspired by the natural world.",
      cover: "/artists/artist-2-cover.jpg",
      verified: true,
    },
  });

  const miraUser = await prisma.user.upsert({
    where: { email: "mira@artistically.com" },
    update: {},
    create: {
      email: "mira@artistically.com",
      password: artistPassword,
      firstName: "Mira",
      lastName: "Sen",
      role: Role.ARTIST,
      avatar: "/artists/artist-3.jpg",
    },
  });

  const mira = await prisma.artist.upsert({
    where: { userId: miraUser.id },
    update: {},
    create: {
      userId: miraUser.id,
      handle: "@mirasen",
      bio: "Ceramic artist shaping tactile vessels and quiet sculptural forms from her studio in Kolkata.",
      cover: "/artists/artist-3-cover.jpg",
      verified: false,
    },
  });

  const arjunUser = await prisma.user.upsert({
    where: { email: "arjun@artistically.com" },
    update: {},
    create: {
      email: "arjun@artistically.com",
      password: artistPassword,
      firstName: "Arjun",
      lastName: "Mehta",
      role: Role.ARTIST,
      avatar: "/artists/artist-1.jpg",
    },
  });

  const arjun = await prisma.artist.upsert({
    where: { userId: arjunUser.id },
    update: {},
    create: {
      userId: arjunUser.id,
      handle: "@arjunmehta",
      bio: "Mixed-media artist working with earthen pigments, carved surfaces, and collected textures.",
      cover: "/artists/artist-1-cover.jpg",
      verified: true,
    },
  });

  const leelaUser = await prisma.user.upsert({
    where: { email: "leela@artistically.com" },
    update: {},
    create: {
      email: "leela@artistically.com",
      password: artistPassword,
      firstName: "Leela",
      lastName: "Rao",
      role: Role.ARTIST,
      avatar: "/artists/artist-2.jpg",
    },
  });

  const leela = await prisma.artist.upsert({
    where: { userId: leelaUser.id },
    update: {},
    create: {
      userId: leelaUser.id,
      handle: "@leelarao",
      bio: "Artist and maker exploring the relationship between useful objects, ritual, and colour.",
      cover: "/artists/artist-2-cover.jpg",
      verified: false,
    },
  });

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    {
      id: "cm0000000000000000000001",
      artistId: kelly.id,
      title: "Botanical Study in Red",
      description: "A richly detailed floral painting with red, blue, and yellow blooms against a dark ground.",
      price: 2499_00,
      originalPrice: 4999_00,
      discount: 50,
      category: ProductCategory.PAINTINGS,
      imageUrl: "/paintings/painting-1.jpg",
    },
    {
      id: "cm0000000000000000000002",
      artistId: kelly.id,
      title: "Blue Ridge in Spring",
      description: "A blue and green landscape painting with distant hills, water, and a bright opening sky.",
      price: 1725_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.PAINTINGS,
      imageUrl: "/paintings/painting-2.jpg",
    },
    {
      id: "cm0000000000000000000003",
      artistId: ana.id,
      title: "Golden Draped Figure",
      description: "A figurative oil painting of a seated figure wrapped in warm gold and cream fabric.",
      price: 1989_00,
      originalPrice: 2789_00,
      discount: 29,
      category: ProductCategory.PAINTINGS,
      badge: "LIMITED EDITION",
      imageUrl: "/paintings/painting-3.jpg",
    },
    {
      id: "cm0000000000000000000004",
      artistId: ana.id,
      title: "Carved Bull in Brass",
      description: "A detailed seated bull sculpture with an engraved surface and dark wood plinth.",
      price: 259_00,
      originalPrice: 280_00,
      discount: 10,
      category: ProductCategory.SCULPTURES,
      imageUrl: "/sculptures/sculpture-1.jpg",
    },
    {
      id: "cm0000000000000000000005",
      artistId: kelly.id,
      title: "Blue Floral Storage Jars",
      description: "A pair of blue ceramic jars with hand-painted floral decoration.",
      price: 789_00,
      originalPrice: 1400_00,
      discount: 47,
      category: ProductCategory.CERAMICS,
      imageUrl: "/ceramics/ceramic-1.jpg",
    },
    {
      id: "cm0000000000000000000006",
      artistId: ana.id,
      title: "Sunset Field",
      description: "A luminous landscape painting with a figure walking through a field beneath a glowing sky.",
      price: 3200_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.PAINTINGS,
      stock: 1,
      imageUrl: "/paintings/painting-6.jpg",
    },
    {
      id: "cm0000000000000000000007",
      artistId: kelly.id,
      title: "Quiet Geometry",
      description: "Minimal geometric forms in ochre, cream, and charcoal on cotton canvas.",
      price: 2850_00,
      originalPrice: 3500_00,
      discount: 19,
      category: ProductCategory.PAINTINGS,
      stock: 2,
      badge: "NEW",
      imageUrl: "/paintings/painting-7.jpg",
    },
    {
      id: "cm0000000000000000000008",
      artistId: ana.id,
      title: "Dancing Bronze Figure",
      description: "A small sculpture of a dancing figure framed by a circular bronze silhouette.",
      price: 1450_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.SCULPTURES,
      stock: 1,
      imageUrl: "/sculptures/sculpture-2.jpg",
    },
    {
      id: "cm0000000000000000000009",
      artistId: kelly.id,
      title: "Classical Marble Bust",
      description: "A white marble portrait bust presented against a charcoal studio background.",
      price: 2100_00,
      originalPrice: 2600_00,
      discount: 19,
      category: ProductCategory.SCULPTURES,
      stock: 0,
      badge: "LIMITED EDITION",
      imageUrl: "/sculptures/sculpture-3.jpg",
    },
    {
      id: "cm0000000000000000000010",
      artistId: ana.id,
      title: "Colour Garden Vessel",
      description: "A playful ceramic vessel assembled from colourful sculptural forms.",
      price: 950_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.CERAMICS,
      stock: 4,
      imageUrl: "/ceramics/ceramic-2.jpg",
    },
    {
      id: "cm0000000000000000000013",
      artistId: kelly.id,
      title: "Valley of Light",
      description: "A digital fantasy landscape with a lone traveller, distant mountains, and a pale stone castle.",
      price: 1800_00,
      originalPrice: 2200_00,
      discount: 18,
      category: ProductCategory.DIGITAL_ART,
      stock: 3,
      badge: "DIGITAL EDITION",
      imageUrl: "/digital-arts/digital-art-cover.jpg",
    },
    {
      id: "cm0000000000000000000014",
      artistId: ana.id,
      title: "Valley of Light, Study",
      description: "A second edition of the digital landscape study, focused on its green valley and river paths.",
      price: 1250_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.DIGITAL_ART,
      stock: 5,
      imageUrl: "/digital-arts/digital-art-cover.jpg",
    },
    {
      id: "cm0000000000000000000015",
      artistId: kelly.id,
      title: "Castle Valley, Detail",
      description: "A close study from the digital landscape series, centred on the castle above the valley.",
      price: 2400_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.DIGITAL_ART,
      stock: 2,
      imageUrl: "/digital-arts/digital-art-cover.jpg",
    },
    {
      id: "cm0000000000000000000016",
      artistId: ana.id,
      title: "Blue Glass Wave",
      description: "A translucent blue glass wave sculpture displayed on a simple metal stand.",
      price: 2750_00,
      originalPrice: 3200_00,
      discount: 14,
      category: ProductCategory.GLASS_ART,
      stock: 1,
      imageUrl: "/sculptures/sculpture-4.jpg",
    },
    {
      id: "cm0000000000000000000017",
      artistId: kelly.id,
      title: "Blue Glass Wave, Small Study",
      description: "A smaller glass wave study with the same curved form and clear blue surface.",
      price: 1650_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.GLASS_ART,
      stock: 2,
      imageUrl: "/sculptures/sculpture-4.jpg",
    },
    {
      id: "cm0000000000000000000018",
      artistId: ana.id,
      title: "Blue Glass Wave, Edition",
      description: "A limited edition glass wave sculpture that catches daylight through its curved surface.",
      price: 3900_00,
      originalPrice: 4500_00,
      discount: 13,
      category: ProductCategory.GLASS_ART,
      stock: 1,
      badge: "ONE OF A KIND",
      imageUrl: "/sculptures/sculpture-4.jpg",
    },
    {
      id: "cm0000000000000000000019",
      artistId: kelly.id,
      title: "Stone Bust on Wood Plinth",
      description: "A smooth stone portrait bust presented on a warm wooden plinth.",
      price: 4600_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.WOODWORK,
      stock: 1,
      imageUrl: "/sculptures/sculpture-7.jpg",
    },
    {
      id: "cm0000000000000000000020",
      artistId: ana.id,
      title: "Carved Form on Wood",
      description: "A carved stone form with a rounded silhouette and natural wood base.",
      price: 1350_00,
      originalPrice: 1600_00,
      discount: 16,
      category: ProductCategory.WOODWORK,
      stock: 3,
      imageUrl: "/sculptures/sculpture-7.jpg",
    },
    {
      id: "cm0000000000000000000023",
      artistId: kelly.id,
      title: "Carved Form, Side View",
      description: "A side view of the carved stone and wood composition, showing its rounded profile.",
      price: 2200_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.WOODWORK,
      stock: 2,
      imageUrl: "/sculptures/sculpture-7.jpg",
    },
    {
      id: "cm0000000000000000000024",
      artistId: ana.id,
      title: "Portrait in Winter Light",
      description: "A black-and-white portrait photograph with a quiet, direct studio composition.",
      price: 1950_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.PHOTOGRAPHY,
      stock: 4,
      imageUrl: "/artists/artist-1.jpg",
    },
    {
      id: "cm0000000000000000000025",
      artistId: kelly.id,
      title: "Artist in the Garden",
      description: "A candid portrait photograph made outdoors among trees and soft afternoon light.",
      price: 2450_00,
      originalPrice: 2900_00,
      discount: 16,
      category: ProductCategory.PHOTOGRAPHY,
      stock: 2,
      imageUrl: "/artists/artist-3.jpg",
    },
    {
      id: "cm0000000000000000000026",
      artistId: ana.id,
      title: "Gallery Portrait",
      description: "A monochrome photographic portrait set against a textured gallery wall.",
      price: 1100_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.PHOTOGRAPHY,
      stock: 5,
      imageUrl: "/artists/artist-1.jpg",
    },
    {
      id: "cm0000000000000000000027",
      artistId: kelly.id,
      title: "Painted Textile Tools",
      description: "A colourful studio still life of worn brushes, bristles, and layered pigment.",
      price: 3100_00,
      originalPrice: 3600_00,
      discount: 14,
      category: ProductCategory.TEXTILE,
      stock: 1,
      badge: "HANDMADE",
      imageUrl: "/stories/story-2.jpg",
    },
    {
      id: "cm0000000000000000000028",
      artistId: ana.id,
      title: "Textile Studio Detail",
      description: "A close-up study of coloured fibres and tools used in a working artist studio.",
      price: 1850_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.TEXTILE,
      stock: 2,
      imageUrl: "/stories/story-2.jpg",
    },
    {
      id: "cm0000000000000000000029",
      artistId: kelly.id,
      title: "Brush Fibre Study",
      description: "A detailed study of natural and dyed fibres gathered across a painter’s worktable.",
      price: 780_00,
      originalPrice: 950_00,
      discount: 18,
      category: ProductCategory.TEXTILE,
      stock: 6,
      imageUrl: "/stories/story-2.jpg",
    },
    {
      id: "cm0000000000000000000030",
      artistId: mira.id,
      title: "Riverbed Tea Bowl",
      description: "A hand-thrown stoneware bowl with a deep blue glaze that pools around its ridged rim.",
      price: 1180_00,
      originalPrice: 1450_00,
      discount: 19,
      category: ProductCategory.CERAMICS,
      stock: 3,
      badge: "HANDMADE",
      imageUrl: "/ceramics/ceramic-3.jpg",
    },
    {
      id: "cm0000000000000000000031",
      artistId: arjun.id,
      title: "Sunbaked Terracotta Vessel",
      description: "A warm terracotta vessel with a sculpted shoulder and softly weathered natural finish.",
      price: 1650_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.CERAMICS,
      stock: 2,
      imageUrl: "/ceramics/ceramic-4.jpg",
    },
    {
      id: "cm0000000000000000000032",
      artistId: leela.id,
      title: "Ivory Pinch Pot Pair",
      description: "A pair of small hand-shaped ceramic pots with an ivory glaze and subtle thumbprint texture.",
      price: 890_00,
      originalPrice: 1100_00,
      discount: 19,
      category: ProductCategory.CERAMICS,
      stock: 5,
      imageUrl: "/ceramics/ceramic-5.jpg",
    },
    {
      id: "cm0000000000000000000033",
      artistId: mira.id,
      title: "Cobalt Bloom Planter",
      description: "A compact ceramic planter decorated with cobalt brushwork and an organic fluted silhouette.",
      price: 1320_00,
      originalPrice: null,
      discount: null,
      category: ProductCategory.CERAMICS,
      stock: 4,
      imageUrl: "/ceramics/ceramic-1.jpg",
    },
  ];

  for (const p of products) {
    const { imageUrl, ...data } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        ...data,
        images: {
          deleteMany: {},
          create: { url: imageUrl, isPrimary: true },
        },
      },
      create: {
        ...data,
        images: {
          create: { url: imageUrl, isPrimary: true },
        },
      },
    });
  }

  // ── Editorial collections ─────────────────────────────────────────────────
  const collections = [
    {
      id: "cm0000000000000000000021",
      name: "Chromatic Dreams",
      description: "A curated journey through bold colors and abstract expression.",
      coverImage: products[1].imageUrl,
      featured: true,
      productIds: [products[0].id, products[1].id, products[2].id],
    },
    {
      id: "cm0000000000000000000022",
      name: "Earth & Form",
      description: "Sculptures and ceramics celebrating texture, weight, and the human hand.",
      coverImage: products[4].imageUrl,
      featured: true,
      productIds: [products[3].id, products[4].id],
    },
    {
      id: "cm0000000000000000000034",
      name: "Quiet Rituals",
      description: "Small vessels and useful forms made for slower mornings and everyday rituals.",
      coverImage: products[25].imageUrl,
      featured: true,
      productIds: [products[25].id, products[27].id, products[28].id],
    },
    {
      id: "cm0000000000000000000035",
      name: "Blue Notes",
      description: "A study in blue across painted surfaces, glazed clay, and translucent glass.",
      coverImage: products[26].imageUrl,
      featured: false,
      productIds: [products[26].id, products[16].id, products[9].id],
    },
  ];

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { id: collection.id },
      update: {
        name: collection.name,
        description: collection.description,
        coverImage: collection.coverImage,
        featured: collection.featured,
        published: true,
        items: {
          deleteMany: {},
          create: collection.productIds.map((productId, sortOrder) => ({ productId, sortOrder })),
        },
      },
      create: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        coverImage: collection.coverImage,
        featured: collection.featured,
        published: true,
        items: {
          create: collection.productIds.map((productId, sortOrder) => ({ productId, sortOrder })),
        },
      },
    });
  }

  // ── Regular user ──────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash(collectorSeedPassword, 12);
  await prisma.user.upsert({
    where: { email: "ronit@example.com" },
    update: {},
    create: {
      email: "ronit@example.com",
      password: userPassword,
      firstName: "Ronit",
      lastName: "Khatri",
      phone: "9871471000",
      address: "Block-10, Pashchim Vihar, New Delhi",
    },
  });

  // ── Stories ───────────────────────────────────────────────────────────────
  const stories = [
      {
        id: "cm0000000000000000000011",
        title: "ACRYLIC ON CANVAS",
        excerpt: "Exploring the limitless possibilities of acrylic paint.",
        content: "Acrylic rewards attention. Unlike oils, it dries quickly, so each layer records a decision: a wash left translucent, a mark covered, a texture kept. That pace makes the medium especially useful for artists who want to build an image through revision rather than plan every detail in advance.\n\nThis guide follows a simple studio rhythm: begin with a limited palette, establish the largest shapes first, and let each layer dry before deciding what the painting still needs. The aim is not to control every accident, but to give the surface enough structure for unexpected colour and texture to remain visible.\n\nFor collectors, the result is a work whose surface holds evidence of its making. Look closely at overlaps, edges, and changes in opacity; they are part of the artwork’s visual record.",
        image: "/stories/story-1.jpg",
        category: "Technique",
        published: true,
      },
      {
        id: "cm0000000000000000000012",
        title: "CASH, CREDIT OR PAINTING?",
        excerpt: "The evolving conversation around art as investment.",
        content: "The language of collecting has expanded beyond a single idea of investment. For many first-time collectors, a painting is first a meaningful object: something that changes the atmosphere of a room, records a relationship with an artist, or marks a moment in a life. Financial value may matter, but it is only one part of the decision.\n\nA practical purchase begins with clear facts. Collectors should be able to understand the medium, dimensions, condition, edition information, provenance, delivery expectations, and the artist’s identity before they decide. Those details make comparison possible without reducing art to a score.\n\nArtistically’s marketplace is built around that balance: editorial discovery paired with transparent artwork information and a dependable path from selection to delivery.",
        image: "/stories/story-2.jpg",
        category: "Business",
        published: true,
      },
      {
        id: "cm0000000000000000000036",
        title: "THE QUIET LANGUAGE OF CLAY",
        excerpt: "Why handmade vessels carry the marks of both maker and use.",
        content: "Clay keeps a record of pressure. A thumbprint at the rim, a brush dragged through wet slip, and the slight lean of a hand-built wall all remain visible after firing. Those details give a vessel its particular presence and make each one feel closer to an object with a biography than a factory-perfect container.\n\nFor collectors, ceramics offer a direct way to live with an artist’s decisions. Notice how a glaze pools, how the foot meets a table, and how the form changes as you move around it. Utility is not separate from the artwork; it is part of the conversation.\n\nThe most generous ceramic pieces invite touch while also rewarding close looking. Their surfaces change with daylight, use, and the small rituals that gather around them.",
        image: "/stories/story-3.jpg",
        category: "Materials",
        published: true,
      },
      {
        id: "cm0000000000000000000037",
        title: "HOW TO BEGIN COLLECTING ART",
        excerpt: "A practical guide to choosing work that will stay meaningful.",
        content: "Starting an art collection does not require a large room or a large budget. It begins with attention: notice the subjects, materials, colours, and ideas that you return to without being asked. Those patterns can become a useful personal compass when you are comparing unfamiliar work.\n\nBefore buying, look for the information that makes a piece understandable: the artist’s name, medium, dimensions, edition details, condition, and delivery expectations. Asking clear questions is part of collecting, not a distraction from it.\n\nOver time, a collection becomes a record of changing curiosity. The strongest pieces are often the ones that continue to reveal something after the first excitement has passed.",
        image: "/stories/story-1.jpg",
        category: "Collecting",
        published: true,
      },
    ];

  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.id },
      update: story,
      create: story,
    });
  }

  console.log("✅ Seeding complete.");
  console.log("   Seeded admin@artistically.com");
  console.log("   Seeded kelly@artistically.com");
  console.log("   Seeded ronit@example.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
