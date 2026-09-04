import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  listForArtist: vi.fn(),
  createForArtist: vi.fn(),
  updateForArtist: vi.fn(),
  archiveForArtist: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/services/collection.service", () => ({ collectionService: {
  listForArtist: mocks.listForArtist,
  createForArtist: mocks.createForArtist,
  updateForArtist: mocks.updateForArtist,
  archiveForArtist: mocks.archiveForArtist,
} }));

import { GET, POST } from "@/app/api/artist/collections/route";
import { DELETE, PATCH } from "@/app/api/artist/collections/[id]/route";

const collection = { id: "cm7q1k8l90000abcde1234567", name: "Quiet Materials" };

function request(method: string, body?: unknown) {
  return new NextRequest("https://artistically.example/api/artist/collections", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "content-type": "application/json" } : undefined,
  });
}

function context(id = collection.id) { return { params: Promise.resolve({ id }) }; }

describe("artist collection routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.listForArtist.mockResolvedValue([collection]);
    mocks.createForArtist.mockResolvedValue(collection);
    mocks.updateForArtist.mockResolvedValue(collection);
    mocks.archiveForArtist.mockResolvedValue(true);
  });

  it("lists and creates collections for an authenticated artist", async () => {
    expect((await GET(request("GET"))).status).toBe(200);
    expect((await POST(request("POST", {
      name: "Quiet Materials",
      description: "Texture-led works.",
      coverImage: "https://example.com/collection.jpg",
      productIds: [],
    }))).status).toBe(201);
    expect(mocks.listForArtist).toHaveBeenCalledWith("artist-user");
    expect(mocks.createForArtist).toHaveBeenCalledWith("artist-user", expect.objectContaining({ name: "Quiet Materials" }));
  });

  it("rejects collector access before touching the collection service", async () => {
    mocks.requireAuth.mockResolvedValue({ userId: "collector-user", role: "USER" });
    const response = await GET(request("GET"));
    expect(response.status).toBe(403);
    expect(mocks.listForArtist).not.toHaveBeenCalled();
  });

  it("updates and archives an owner-scoped collection", async () => {
    expect((await PATCH(request("PATCH", { name: "Updated" }), context())).status).toBe(200);
    expect((await DELETE(request("DELETE"), context())).status).toBe(204);
    expect(mocks.updateForArtist).toHaveBeenCalledWith("artist-user", collection.id, { name: "Updated" });
    expect(mocks.archiveForArtist).toHaveBeenCalledWith("artist-user", collection.id);
  });

  it("does not disclose a collection that the owner service cannot find", async () => {
    mocks.updateForArtist.mockResolvedValue(null);
    expect((await PATCH(request("PATCH", { name: "Updated" }), context())).status).toBe(404);
  });
});
