import { apiClient } from "./client";
import type { AiOutfitRecommendation } from "@/lib/ai-stylist-service";

export interface AiStatusResponse {
  activeProvider: "ollama" | "gemini";
  gemini: {
    configured: boolean;
    model: string;
  };
  ollama: {
    connected: boolean;
    endpoint: string;
    model: string;
    availableModels: string[];
  };
}

export async function getAiStatusApi(): Promise<AiStatusResponse> {
  return await apiClient<AiStatusResponse>("/ai/status");
}

export async function generateAiOutfitApi(params: {
  occasion: string;
  season?: string;
  customPrompt?: string;
  provider?: "ollama" | "gemini";
  model?: string;
}): Promise<AiOutfitRecommendation> {
  return await apiClient<AiOutfitRecommendation>("/ai/recommend", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
