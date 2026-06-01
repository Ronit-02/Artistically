// ─────────────────────────────────────────────────────────────────────────────
// Seed script — run with: npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, ProductCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
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
  const artistPassword = await bcrypt.hash("artist123", 12);

  const kellyUser = await prisma.user.upsert({
    where: { email: "kelly@artistically.com" },
    update: {},
    create: {
      email: "kelly@artistically.com",
      password: artistPassword,
      firstName: "Kelly",
      lastName: "Schmidt",
      role: Role.ARTIST,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    },
  });

  const kelly = await prisma.artist.upsert({
    where: { userId: kellyUser.id },
    update: {},
    create: {
      userId: kellyUser.id,
      handle: "@kgschmidt",
      bio: "Award-winning abstract painter based in New York. My work explores the intersection of color and emotion.",
      cover: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80",
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
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    },
  });

  const ana = await prisma.artist.upsert({
    where: { userId: anaUser.id },
    update: {},
    create: {
      userId: anaUser.id,
      handle: "@anaillueca",
      bio: "Contemporary landscape artist inspired by the natural world.",
      cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      verified: true,
    },
  });

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    {
      artistId: kelly.id,
      title: "Vasi Wood Yellow Canvas Painting",
      description: "A vibrant abstract canvas painting in warm yellows and earthy tones.",
      price: 2499,
      originalPrice: 4999,
      discount: 50,
      category: ProductCategory.PAINTINGS,
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
    },
    {
      artistId: kelly.id,
      title: "Abstract Floral Art",
      description: "Delicate floral forms rendered in bold abstract style.",
      price: 1725,
      originalPrice: null,
      discount: null,
      category: ProductCategory.PAINTINGS,
      imageUrl: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80",
    },
    {
      artistId: ana.id,
      title: "7 Colors Decors Beautiful Colourful Trees Landscape",
      description: "A lush landscape painting celebrating the diversity of colour in nature.",
      price: 1989,
      originalPrice: 2789,
      discount: 29,
      category: ProductCategory.PAINTINGS,
      badge: "LIMITED EDITION",
      imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80",
    },
    {
      artistId: ana.id,
      title: "Buddha Polyserin Statue",
      description: "A serene Buddha sculpture in polished resin.",
      price: 259,
      originalPrice: 280,
      discount: 10,
      category: ProductCategory.SCULPTURES,
      imageUrl: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&q=80",
    },
    {
      artistId: kelly.id,
      title: "Pink Ceramic Vase",
      description: "Hand-thrown ceramic vase in blush pink glaze.",
      price: 789,
      originalPrice: 1400,
      discount: 47,
      category: ProductCategory.CERAMICS,
      imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&q=80",
    },
  ];

  for (const p of products) {
    const { imageUrl, ...data } = p;
    const product = await prisma.product.create({ data });
    await prisma.productImage.create({
      data: { productId: product.id, url: imageUrl, isPrimary: true },
    });
  }

  // ── Regular user ──────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("user123", 12);
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
  await prisma.story.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "ACRYLIC ON CANVAS",
        excerpt: "Exploring the limitless possibilities of acrylic paint.",
        content: "Full article content goes here...",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80",
        category: "Technique",
        published: true,
      },
      {
        title: "CASH, CREDIT OR PAINTING?",
        excerpt: "The evolving conversation around art as investment.",
        content: "Full article content goes here...",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
        category: "Business",
        published: true,
      },
    ],
  });

  console.log("✅ Seeding complete.");
  console.log("   Admin:  admin@artistically.com / admin123");
  console.log("   Artist: kelly@artistically.com / artist123");
  console.log("   User:   ronit@example.com / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
