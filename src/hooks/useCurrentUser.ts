import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import type { AuthUserDto } from "@/types/api";

export const authKeys = {
  currentUser: ["auth", "current-user"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: async (): Promise<AuthUserDto | null> => {
      try {
        return await getCurrentUser();
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}
