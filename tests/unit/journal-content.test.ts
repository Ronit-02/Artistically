import type { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoJournalStories, seedJournal } from "../../prisma/journal-content";
import nextConfig from "../../next.config";

afterEach(() => vi.unstubAllEnvs());

describe("mock editorial journal", () => {
  it("provides substantial distinct articles with remote covers and no em dashes", () => {
    expect(demoJournalStories).toHaveLength(12);
    expect(new Set(demoJournalStories.map((story) => story.id)).size).toBe(12);
    expect(new Set(demoJournalStories.map((story) => story.title)).size).toBe(12);
    expect(new Set(demoJournalStories.map((story) => story.image)).size).toBe(12);
    for (const story of demoJournalStories) {
      expect(story.content.split(/\s+/).length).toBeGreaterThanOrEqual(350);
      expect(story.content.split("\n\n")).toHaveLength(8);
      expect(`${story.title} ${story.excerpt} ${story.category} ${story.content}`).not.toContain("\u2014");
      expect(story.content).toContain("mock journal content");
      expect(story.published).toBe(true);
      expect(story.createdAt.getTime()).toBeLessThan(new Date("2026-10-25T00:00:00Z").getTime());
      const url = new URL(story.image);
      expect(url.protocol).toBe("https:");
      expect(nextConfig.images?.remotePatterns?.some((pattern) => pattern.hostname === url.hostname)).toBe(true);
    }
  });

  it("blocks production seeding before accessing the database", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const prisma = { $transaction: vi.fn() };
    await expect(seedJournal(prisma as unknown as PrismaClient)).rejects.toThrow("must not run in production");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
