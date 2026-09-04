import { apiRequest } from "@/lib/api/client";
import type { AuthUserDto } from "@/types/api";

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
};

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>(`/api/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
