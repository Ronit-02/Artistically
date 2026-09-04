import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiRequest: vi.fn() };
});

import { fetchArtistById, updateArtistProfile } from "@/lib/api/artists";

const mockedApiRequest = vi.mocked(apiRequest);

const artistDto = {
  id: "cmabcdefghijklmnopqrstuvwx",
  handle: "@artist",
  bio: "A short biography",
  cover: null,
  verified: true,
  user: { firstName: "Ari", lastName: "Stone", avatar: null },
  _count: { products: 3, followers: 5 },
};

describe("artist detail API mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps a found artist and preserves persisted identity data", async () => {
    mockedApiRequest.mockResolvedValueOnce(artistDto);

    await expect(fetchArtistById(artistDto.id)).resolves.toMatchObject({
      id: artistDto.id,
      name: "Ari Stone",
      designs: 3,
      followers: "5",
      verified: true,
    });
  });

  it("returns null only for a not-found response", async () => {
    mockedApiRequest.mockRejectedValueOnce(new ApiClientError("Not found", 404));

    await expect(fetchArtistById(artistDto.id)).resolves.toBeNull();
  });

  it("rethrows retryable API failures so the page can offer retry", async () => {
    const error = new ApiClientError("Service unavailable", 503);
    mockedApiRequest.mockRejectedValueOnce(error);

    await expect(fetchArtistById(artistDto.id)).rejects.toBe(error);
  });

  it("updates the artist profile through the existing owner-protected route", async () => {
    mockedApiRequest.mockResolvedValueOnce(artistDto);

    await expect(updateArtistProfile(artistDto.id, {
      handle: "@artist_updated",
      bio: "Updated biography",
    })).resolves.toEqual(artistDto);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      `/api/artists/${artistDto.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ handle: "@artist_updated", bio: "Updated biography" }),
      },
    );
  });
});
