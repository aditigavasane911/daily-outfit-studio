import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  getSavedOutfitsByUser,
  createSavedOutfit,
  deleteSavedOutfit,
} from "../services/db.service.js";
import { z } from "zod";

const outfitSchema = z.object({
  score: z.number().default(0),
  reasons: z.array(z.string()).default([]),
  matchedPaletteId: z.number().nullable().optional(),
  pieceIds: z.array(z.string()).min(1, "At least one piece ID is required"),
});

export async function listSavedOutfits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const outfits = await getSavedOutfitsByUser(userId);
    res.json({ count: outfits.length, outfits });
  } catch (err) {
    next(err);
  }
}

export async function saveOutfit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const parsed = outfitSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "ValidationError",
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const outfit = await createSavedOutfit(
      {
        score: parsed.data.score,
        reasons: parsed.data.reasons,
        matchedPaletteId: parsed.data.matchedPaletteId,
        pieceIds: parsed.data.pieceIds,
      },
      userId,
    );

    res.status(201).json(outfit);
  } catch (err) {
    next(err);
  }
}

export async function removeSavedOutfit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: "MissingId", message: "Outfit ID is required." });
      return;
    }

    const success = await deleteSavedOutfit(id, userId);
    if (!success) {
      res.status(404).json({ error: "NotFound", message: "Saved outfit not found." });
      return;
    }

    res.json({ success: true, message: "Saved outfit removed successfully." });
  } catch (err) {
    next(err);
  }
}
