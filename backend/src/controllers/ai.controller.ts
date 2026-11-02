import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, Season } from "../types/index.js";
import { getGarmentsByUser, getProfileByUser } from "../services/db.service.js";
import {
  checkOllamaHealth,
  generateOutfitRecommendation,
} from "../services/ai-stylist.service.js";
import { config } from "../config/env.js";
import { z } from "zod";

const generateSchema = z.object({
  occasion: z.string().min(1, "Occasion is required"),
  season: z.enum(["spring", "summer", "fall", "winter", "any"]).optional().default("any"),
  customPrompt: z.string().optional(),
  provider: z.enum(["ollama", "gemini"]).optional(),
  model: z.string().optional(),
});

export async function getAiEngineStatus(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ollama = await checkOllamaHealth();
    res.json({
      activeProvider: config.ai.geminiApiKey ? "gemini" : "ollama",
      gemini: {
        configured: Boolean(config.ai.geminiApiKey),
        model: config.ai.geminiModel,
      },
      ollama: {
        connected: ollama.connected,
        endpoint: ollama.endpoint,
        model: config.ai.ollamaModel,
        availableModels: ollama.models,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function generateOutfit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const parsed = generateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "ValidationError",
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const items = await getGarmentsByUser(userId);
    if (items.length < 2) {
      res.status(400).json({
        error: "InsufficientItems",
        message: "You need at least 2 pieces in your wardrobe to generate an AI look.",
      });
      return;
    }

    const profile = await getProfileByUser(userId);

    const recommendation = await generateOutfitRecommendation({
      items,
      profile,
      occasion: parsed.data.occasion,
      season: parsed.data.season as Season | "any",
      customPrompt: parsed.data.customPrompt,
      provider: parsed.data.provider,
      model: parsed.data.model,
    });

    res.json(recommendation);
  } catch (err) {
    next(err);
  }
}
