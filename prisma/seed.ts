// Development fixtures — run with npm run db:seed.
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { demoArtists } from "./demo-content";
import { seedUrlContent } from "./url-content";
import { seedCollections } from "./collection-content";
import { seedJournal } from "./journal-content";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production");
  }

  console.log("Seeding development accounts and demo catalog...");
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "admin123", 12);
  const artistPassword = await bcrypt.hash(process.env.SEED_ARTIST_PASSWORD ?? "artist123", 12);
  const collectorPassword = await bcrypt.hash(process.env.SEED_COLLECTOR_PASSWORD ?? "user123", 12);

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

  // Preserve the existing five artist sign-ins; additional demo profiles have no password.
  for (const { email, firstName, lastName } of demoArtists.slice(0, 5)) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: artistPassword, firstName, lastName, role: Role.ARTIST },
    });
  }

  await prisma.user.upsert({
    where: { email: "ronit@example.com" },
    update: {},
    create: {
      email: "ronit@example.com",
      password: collectorPassword,
      firstName: "Ronit",
      lastName: "Khatri",
    },
  });

  await seedUrlContent(prisma);
  await seedCollections(prisma);
  await seedJournal(prisma);
  console.log("Seeding complete. Existing development sign-ins are preserved.");
}

main()
  .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
