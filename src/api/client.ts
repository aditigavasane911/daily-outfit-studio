/**
 * Daily Outfit Studio — Unified Frontend API Client
 * Automatically connects to backend at /api and attaches authentication tokens
 */

const API_BASE = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) || "/api";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Retrieve user auth token from local storage (Supabase session or demo token)
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed?.access_token) return parsed.access_token as string;
        }
      }
    }

    const sessionRaw = localStorage.getItem("rewear_radar:session");
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.id) return `user-${parsed.id}`;
    }
  } catch {
    // Ignore storage parse issues
  }

  return null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    let errorData: unknown;
    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null && "message" in errorData) {
        errorMessage = String((errorData as { message: unknown }).message);
      }
    } catch {
      // not JSON
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
