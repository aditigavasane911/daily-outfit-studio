import { apiClient } from "./client";
import type { Garment } from "@/lib/closet-store";

export interface GarmentsListResponse {
  count: number;
  garments: Garment[];
}

export async function fetchGarmentsApi(filters?: {
  category?: string;
  favorite?: boolean;
  formality?: string;
}): Promise<Garment[]> {
  const query = new URLSearchParams();
  if (filters?.category) query.set("category", filters.category);
  if (filters?.favorite !== undefined) query.set("favorite", String(filters.favorite));
  if (filters?.formality) query.set("formality", filters.formality);

  const qs = query.toString();
  const res = await apiClient<GarmentsListResponse>(`/garments${qs ? `?${qs}` : ""}`);
  return res.garments;
}

export async function getGarmentApi(id: string): Promise<Garment> {
  return await apiClient<Garment>(`/garments/${id}`);
}

export async function createGarmentApi(
  data: Omit<Garment, "id" | "createdAt" | "favorite"> & { favorite?: boolean },
): Promise<Garment> {
  return await apiClient<Garment>("/garments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGarmentApi(
  id: string,
  data: Partial<Garment>,
): Promise<Garment> {
  return await apiClient<Garment>(`/garments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function toggleFavoriteGarmentApi(
  id: string,
  favorite: boolean,
): Promise<Garment> {
  return await apiClient<Garment>(`/garments/${id}/favorite`, {
    method: "PATCH",
    body: JSON.stringify({ favorite }),
  });
}

export async function deleteGarmentApi(id: string): Promise<{ success: boolean }> {
  return await apiClient<{ success: boolean }>(`/garments/${id}`, {
    method: "DELETE",
  });
}
