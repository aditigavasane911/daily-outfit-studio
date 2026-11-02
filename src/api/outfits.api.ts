import { apiClient } from "./client";
import type { SavedOutfit } from "@/lib/closet-store";

export interface SavedOutfitsResponse {
  count: number;
  outfits: SavedOutfit[];
}

export async function fetchSavedOutfitsApi(): Promise<SavedOutfit[]> {
  const res = await apiClient<SavedOutfitsResponse>("/outfits/saved");
  return res.outfits;
}

export async function saveOutfitApi(data: {
  score: number;
  reasons: string[];
  matchedPaletteId?: number | null;
  pieceIds: string[];
}): Promise<SavedOutfit> {
  return await apiClient<SavedOutfit>("/outfits/saved", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteSavedOutfitApi(id: string): Promise<{ success: boolean }> {
  return await apiClient<{ success: boolean }>(`/outfits/saved/${id}`, {
    method: "DELETE",
  });
}
