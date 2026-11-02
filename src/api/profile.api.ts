import { apiClient } from "./client";
import type { Profile } from "@/lib/closet-store";

export async function fetchProfileApi(): Promise<Profile> {
  return await apiClient<Profile>("/profile");
}

export async function updateProfileApi(data: Partial<Profile>): Promise<Profile> {
  return await apiClient<Profile>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
