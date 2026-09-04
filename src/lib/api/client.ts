import type { ApiResponse, PaginationMeta } from "@/types/api";

export class ApiClientError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string[]>;

  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fields = fields;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.success ? "Request failed" : payload.error,
      response.status,
      payload.success ? undefined : payload.fields,
    );
  }

  return payload.data;
}

export async function apiRequestPaginated<T>(path: string, init?: RequestInit): Promise<{ data: T; pagination: PaginationMeta }> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<T> & { pagination?: PaginationMeta };
  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.success ? "Request failed" : payload.error,
      response.status,
      payload.success ? undefined : payload.fields,
    );
  }
  if (!payload.pagination) throw new ApiClientError("Pagination metadata is missing", response.status);
  return { data: payload.data, pagination: payload.pagination };
}
