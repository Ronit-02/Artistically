import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/hooks/useCurrentUser";
import { updateProfile } from "@/lib/api/users";
import type { UpdateProfileInput } from "@/lib/api/users";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateProfileInput }) => updateProfile(userId, input),
    onSuccess: (user) => queryClient.setQueryData(authKeys.currentUser, user),
  });
}
