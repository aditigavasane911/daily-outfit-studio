import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { getProfileByUser, upsertProfile } from "../services/db.service.js";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  sizes: z.string().optional(),
  favoriteColors: z.array(z.string()).optional(),
  budget: z.string().optional(),
  styleNote: z.string().optional(),
});

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const profile = await getProfileByUser(userId);

    if (!profile) {
      // Default initial profile
      res.json({
        id: userId,
        name: req.user!.name || "Stylist",
        email: req.user!.email || "",
        sizes: "",
        favoriteColors: ["Midnight Spruce", "Earthy Sage", "Warm Sand", "Flame Orange"],
        budget: "Under ₹3,000 per piece",
        styleNote: "Quiet, earthy, easy to move in.",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const parsed = profileSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "ValidationError",
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const updated = await upsertProfile(userId, {
      name: parsed.data.name,
      email: parsed.data.email || req.user?.email,
      sizes: parsed.data.sizes,
      favoriteColors: parsed.data.favoriteColors,
      budget: parsed.data.budget,
      styleNote: parsed.data.styleNote,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
