import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { getProfileByUser } from "../services/db.service.js";

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Not logged in" });
      return;
    }

    const profile = await getProfileByUser(user.id);

    res.json({
      user,
      profile: profile || {
        id: user.id,
        name: user.name || "Stylist",
        email: user.email,
        sizes: "",
        favoriteColors: ["Midnight Spruce", "Earthy Sage", "Warm Sand", "Flame Orange"],
        budget: "Under ₹3,000 per piece",
        styleNote: "Quiet, earthy, easy to move in.",
      },
    });
  } catch (err) {
    next(err);
  }
}
