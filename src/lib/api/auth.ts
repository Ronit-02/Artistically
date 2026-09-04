import { apiRequest } from "@/lib/api/client";
import type { AuthUserDto } from "@/types/api";

export type Credentials = { email: string; password: string };

export async function login(credentials: Credentials): Promise<AuthUserDto> {
  const response = await apiRequest<{ user: AuthUserDto }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return response.user;
}

export async function register(input: Credentials & { firstName: string; lastName: string }): Promise<AuthUserDto> {
  const response = await apiRequest<{ user: AuthUserDto }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.user;
}

export async function logout(): Promise<void> {
  await apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>("/api/auth/me");
}
