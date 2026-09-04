import { describe, expect, it } from "vitest";
import { metadata as accountMetadata } from "@/app/(account)/layout";
import { metadata as authMetadata } from "@/app/(auth)/layout";
import { metadata as artistMetadata } from "@/app/(artist-portal)/artist-portal/layout";

describe("private route metadata", () => {
  it("prevents authenticated, artist, and auth surfaces from indexing", () => {
    for (const metadata of [accountMetadata, authMetadata, artistMetadata]) {
      expect(metadata.robots).toEqual({ index: false, follow: false });
    }
  });
});
