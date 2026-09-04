import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiRequest: vi.fn() };
});

import { fetchStoryById } from "@/lib/api/stories";

const mockedApiRequest = vi.mocked(apiRequest);

const storyDto = {
  id: "cmabcdefghijklmnopqrstuvwx",
  title: "Making Space for Art",
  excerpt: "A published story excerpt.",
  content: "The published story body.",
  image: "/stories/story-1.jpg",
  category: "Collecting",
  date: "2026-08-24T00:00:00.000Z",
};

describe("story detail API mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps a published story", async () => {
    mockedApiRequest.mockResolvedValueOnce(storyDto);

    await expect(fetchStoryById(storyDto.id)).resolves.toMatchObject({
      id: storyDto.id,
      title: storyDto.title,
      content: storyDto.content,
    });
  });

  it("returns null only for a not-found response", async () => {
    mockedApiRequest.mockRejectedValueOnce(new ApiClientError("Not found", 404));

    await expect(fetchStoryById(storyDto.id)).resolves.toBeNull();
  });

  it("rethrows retryable API failures so the page can offer retry", async () => {
    const error = new ApiClientError("Service unavailable", 503);
    mockedApiRequest.mockRejectedValueOnce(error);

    await expect(fetchStoryById(storyDto.id)).rejects.toBe(error);
  });
});
