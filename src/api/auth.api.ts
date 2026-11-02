import { apiClient } from "./client";

export interface UserMeResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  profile: {
    id: string;
    name: string;
    email: string;
    sizes: string;
    favoriteColors: string[];
    budget: string;
    styleNote: string;
  };
}

export async function getCurrentUserApi(): Promise<UserMeResponse> {
  return await apiClient<UserMeResponse>("/auth/me");
}
