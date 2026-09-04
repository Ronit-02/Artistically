import type { Story } from "@/types";
import type { StoryDto } from "@/types/api";
import { apiRequest, ApiClientError } from "@/lib/api/client";

export function mapStory(story: StoryDto): Story {
  return {
    id: story.id,
    title: story.title,
    date: story.date,
    image: story.image,
    ...(story.excerpt ? { excerpt: story.excerpt } : {}),
    ...(story.category ? { category: story.category } : {}),
    content: story.content,
  };
}

export async function fetchStories(): Promise<Story[]> {
  const stories = await apiRequest<StoryDto[]>("/api/stories");
  return stories.map(mapStory);
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  try {
    return mapStory(await apiRequest<StoryDto>(`/api/stories/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}
