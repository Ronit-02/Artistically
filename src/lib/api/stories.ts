import type { Story } from "@/types";
import { stories } from "@/data";

export async function fetchStories(): Promise<Story[]> {
  return stories;
}

export async function fetchStoryById(id: number): Promise<Story | null> {
  return stories.find((s) => s.id === id) ?? null;
}
