import { useQuery } from "@tanstack/react-query";
import { fetchStories, fetchStoryById } from "@/lib/api/stories";

export const storyKeys = {
  all: ["stories"] as const,
  detail: (id: number) => ["stories", id] as const,
};

export function useStories() {
  return useQuery({
    queryKey: storyKeys.all,
    queryFn: fetchStories,
  });
}

export function useStory(id: number) {
  return useQuery({
    queryKey: storyKeys.detail(id),
    queryFn: () => fetchStoryById(id),
    enabled: !!id,
  });
}
