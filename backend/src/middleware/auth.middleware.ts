import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, UserContext } from "../types/index.js";
import { verifySupabaseToken } from "../services/supabase.service.js";

export const DEFAULT_DEV_USER: UserContext = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "devin@rewearradar.com",
  name: "Devin Vance",
  role: "authenticated",
};

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const customUserId = req.headers["x-user-id"] as string | undefined;

  // 1. Supabase Bearer Token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "authenticated",
        };
        next();
        return;
      }
    }
  }

  // 2. Custom X-User-Id header (for testing or direct API consumer)
  if (customUserId && customUserId.trim()) {
    req.user = {
      id: customUserId.trim(),
      email: (req.headers["x-user-email"] as string) || "user@rewearradar.com",
      name: (req.headers["x-user-name"] as string) || "Wardrobe Stylist",
      role: "authenticated",
    };
    next();
    return;
  }

  // 3. Frictionless local development fallback to default demo user
  req.user = DEFAULT_DEV_USER;
  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user || !req.user.id) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication token required.",
    });
    return;
  }
  next();
}
