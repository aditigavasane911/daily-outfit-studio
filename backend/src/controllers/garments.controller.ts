import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, Category, Formality, Season } from "../types/index.js";
import {
  getGarmentsByUser,
  getGarmentById,
  createGarment,
  updateGarment,
  deleteGarment,
  toggleFavoriteGarment,
} from "../services/db.service.js";
import { z } from "zod";

const garmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["tops", "bottoms", "outerwear", "shoes", "accessories"]),
  colorName: z.string().min(1, "Color name is required"),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex code"),
  size: z.string().optional().default(""),
  brand: z.string().optional(),
  fabric: z.string().optional(),
  seasons: z.array(z.enum(["spring", "summer", "fall", "winter"])).optional().default([]),
  formality: z.enum(["casual", "smart", "formal"]).optional().default("casual"),
  imageUrl: z.string().optional(),
  favorite: z.boolean().optional().default(false),
});

export async function listGarments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    let garments = await getGarmentsByUser(userId);

    const { category, favorite, formality } = req.query;

    if (category && typeof category === "string") {
      garments = garments.filter((g) => g.category === category);
    }
    if (favorite !== undefined) {
      const isFav = favorite === "true" || favorite === "1";
      garments = garments.filter((g) => g.favorite === isFav);
    }
    if (formality && typeof formality === "string") {
      garments = garments.filter((g) => g.formality === formality);
    }

    res.json({ count: garments.length, garments });
  } catch (err) {
    next(err);
  }
}

export async function getGarment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: "MissingId", message: "Garment ID is required." });
      return;
    }

    const garment = await getGarmentById(id, userId);
    if (!garment) {
      res.status(404).json({ error: "NotFound", message: "Garment not found." });
      return;
    }

    res.json(garment);
  } catch (err) {
    next(err);
  }
}

export async function addGarment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const parsed = garmentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "ValidationError",
        message: parsed.error.issues.map((i) => i.message).join(", "),
        issues: parsed.error.issues,
      });
      return;
    }

    const newGarment = await createGarment(
      {
        name: parsed.data.name,
        category: parsed.data.category as Category,
        colorName: parsed.data.colorName,
        colorHex: parsed.data.colorHex,
        size: parsed.data.size,
        brand: parsed.data.brand,
        fabric: parsed.data.fabric,
        seasons: parsed.data.seasons as Season[],
        formality: parsed.data.formality as Formality,
        imageUrl: parsed.data.imageUrl,
        favorite: parsed.data.favorite,
      },
      userId,
    );

    res.status(201).json(newGarment);
  } catch (err) {
    next(err);
  }
}

export async function editGarment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: "MissingId", message: "Garment ID is required." });
      return;
    }

    const updated = await updateGarment(id, userId, req.body);
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "Garment not found or unauthorized." });
      return;
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { favorite } = req.body;

    if (!id) {
      res.status(400).json({ error: "MissingId", message: "Garment ID is required." });
      return;
    }

    const updated = await toggleFavoriteGarment(id, userId, Boolean(favorite));
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "Garment not found." });
      return;
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function removeGarment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: "MissingId", message: "Garment ID is required." });
      return;
    }

    const success = await deleteGarment(id, userId);
    if (!success) {
      res.status(404).json({ error: "NotFound", message: "Garment not found." });
      return;
    }

    res.json({ success: true, message: "Garment successfully deleted." });
  } catch (err) {
    next(err);
  }
}
