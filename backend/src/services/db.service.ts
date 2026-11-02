import { getPostgresClient } from "../config/db.js";
import type {
  Garment,
  DbGarmentRow,
  Profile,
  DbProfileRow,
  SavedOutfit,
  DbSavedOutfitRow,
} from "../types/index.js";

// Row mappers
function mapGarmentRow(row: DbGarmentRow): Garment {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    colorName: row.color_name,
    colorHex: row.color_hex,
    size: row.size || "",
    brand: row.brand || undefined,
    fabric: row.fabric || undefined,
    seasons: row.seasons || [],
    formality: row.formality || "casual",
    imageUrl: row.image_url || undefined,
    favorite: Boolean(row.favorite),
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapProfileRow(row: DbProfileRow): Profile {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    sizes: row.sizes || "",
    favoriteColors: row.favorite_colors || [],
    budget: row.budget || "",
    styleNote: row.style_note || "",
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function mapOutfitRow(row: DbSavedOutfitRow): SavedOutfit {
  return {
    id: row.id,
    userId: row.user_id,
    score: Number(row.score) || 0,
    reasons: row.reasons || [],
    matchedPaletteId: row.matched_palette_id ?? null,
    pieceIds: row.piece_ids || [],
    createdAt: new Date(row.created_at).getTime(),
  };
}

// In-memory fallback if no PostgreSQL connection is provided yet
const fallbackGarments: Map<string, Garment[]> = new Map();
const fallbackProfiles: Map<string, Profile> = new Map();
const fallbackOutfits: Map<string, SavedOutfit[]> = new Map();

/* ---------------- GARMENTS ---------------- */

export async function getGarmentsByUser(userId: string): Promise<Garment[]> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbGarmentRow[]>`
        SELECT * FROM garments
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return rows.map(mapGarmentRow);
    } catch (err) {
      console.error("PostgreSQL query error in getGarmentsByUser:", err);
      throw err;
    }
  }

  return fallbackGarments.get(userId) || [];
}

export async function getGarmentById(id: string, userId: string): Promise<Garment | null> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbGarmentRow[]>`
        SELECT * FROM garments
        WHERE id = ${id} AND user_id = ${userId}
        LIMIT 1
      `;
      return rows.length > 0 ? mapGarmentRow(rows[0]!) : null;
    } catch (err) {
      console.error("PostgreSQL query error in getGarmentById:", err);
      throw err;
    }
  }

  const list = fallbackGarments.get(userId) || [];
  return list.find((g) => g.id === id) || null;
}

export async function createGarment(
  data: Omit<Garment, "id" | "userId" | "createdAt">,
  userId: string,
): Promise<Garment> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbGarmentRow[]>`
        INSERT INTO garments (
          user_id, name, category, color_name, color_hex,
          size, brand, fabric, seasons, formality, image_url, favorite
        ) VALUES (
          ${userId},
          ${data.name},
          ${data.category},
          ${data.colorName},
          ${data.colorHex},
          ${data.size || ""},
          ${data.brand || null},
          ${data.fabric || null},
          ${data.seasons || []},
          ${data.formality || "casual"},
          ${data.imageUrl || null},
          ${Boolean(data.favorite)}
        )
        RETURNING *
      `;
      return mapGarmentRow(rows[0]!);
    } catch (err) {
      console.error("PostgreSQL query error in createGarment:", err);
      throw err;
    }
  }

  const newGarment: Garment = {
    id: `local-garment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    name: data.name,
    category: data.category,
    colorName: data.colorName,
    colorHex: data.colorHex,
    size: data.size || "",
    brand: data.brand,
    fabric: data.fabric,
    seasons: data.seasons || [],
    formality: data.formality || "casual",
    imageUrl: data.imageUrl,
    favorite: Boolean(data.favorite),
    createdAt: Date.now(),
  };

  const list = fallbackGarments.get(userId) || [];
  fallbackGarments.set(userId, [newGarment, ...list]);
  return newGarment;
}

export async function updateGarment(
  id: string,
  userId: string,
  data: Partial<Garment>,
): Promise<Garment | null> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const current = await getGarmentById(id, userId);
      if (!current) return null;

      const updated = {
        name: data.name ?? current.name,
        category: data.category ?? current.category,
        color_name: data.colorName ?? current.colorName,
        color_hex: data.colorHex ?? current.colorHex,
        size: data.size ?? current.size,
        brand: data.brand !== undefined ? data.brand : current.brand,
        fabric: data.fabric !== undefined ? data.fabric : current.fabric,
        seasons: data.seasons ?? current.seasons,
        formality: data.formality ?? current.formality,
        image_url: data.imageUrl !== undefined ? data.imageUrl : current.imageUrl,
        favorite: data.favorite !== undefined ? data.favorite : current.favorite,
      };

      const rows = await sql<DbGarmentRow[]>`
        UPDATE garments SET
          name = ${updated.name},
          category = ${updated.category},
          color_name = ${updated.color_name},
          color_hex = ${updated.color_hex},
          size = ${updated.size},
          brand = ${updated.brand || null},
          fabric = ${updated.fabric || null},
          seasons = ${updated.seasons},
          formality = ${updated.formality},
          image_url = ${updated.image_url || null},
          favorite = ${updated.favorite}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      return rows.length > 0 ? mapGarmentRow(rows[0]!) : null;
    } catch (err) {
      console.error("PostgreSQL query error in updateGarment:", err);
      throw err;
    }
  }

  const list = fallbackGarments.get(userId) || [];
  const idx = list.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx]!, ...data };
  list[idx] = updated;
  fallbackGarments.set(userId, list);
  return updated;
}

export async function toggleFavoriteGarment(
  id: string,
  userId: string,
  favorite: boolean,
): Promise<Garment | null> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbGarmentRow[]>`
        UPDATE garments
        SET favorite = ${favorite}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      return rows.length > 0 ? mapGarmentRow(rows[0]!) : null;
    } catch (err) {
      console.error("PostgreSQL query error in toggleFavoriteGarment:", err);
      throw err;
    }
  }

  return updateGarment(id, userId, { favorite });
}

export async function deleteGarment(id: string, userId: string): Promise<boolean> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const result = await sql`
        DELETE FROM garments
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return result.count > 0;
    } catch (err) {
      console.error("PostgreSQL query error in deleteGarment:", err);
      throw err;
    }
  }

  const list = fallbackGarments.get(userId) || [];
  const filtered = list.filter((g) => g.id !== id);
  fallbackGarments.set(userId, filtered);
  return list.length !== filtered.length;
}

/* ---------------- PROFILES ---------------- */

export async function getProfileByUser(userId: string): Promise<Profile | null> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbProfileRow[]>`
        SELECT * FROM profiles
        WHERE id = ${userId}
        LIMIT 1
      `;
      return rows.length > 0 ? mapProfileRow(rows[0]!) : null;
    } catch (err) {
      console.error("PostgreSQL query error in getProfileByUser:", err);
      throw err;
    }
  }

  return fallbackProfiles.get(userId) || null;
}

export async function upsertProfile(
  userId: string,
  data: Partial<Profile>,
): Promise<Profile> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbProfileRow[]>`
        INSERT INTO profiles (id, name, email, sizes, favorite_colors, budget, style_note, updated_at)
        VALUES (
          ${userId},
          ${data.name || ""},
          ${data.email || ""},
          ${data.sizes || ""},
          ${data.favoriteColors || []},
          ${data.budget || ""},
          ${data.styleNote || ""},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, profiles.name),
          email = COALESCE(EXCLUDED.email, profiles.email),
          sizes = COALESCE(EXCLUDED.sizes, profiles.sizes),
          favorite_colors = COALESCE(EXCLUDED.favorite_colors, profiles.favorite_colors),
          budget = COALESCE(EXCLUDED.budget, profiles.budget),
          style_note = COALESCE(EXCLUDED.style_note, profiles.style_note),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      return mapProfileRow(rows[0]!);
    } catch (err) {
      console.error("PostgreSQL query error in upsertProfile:", err);
      throw err;
    }
  }

  const existing = fallbackProfiles.get(userId);
  const now = Date.now();
  const updated: Profile = {
    id: userId,
    name: data.name ?? existing?.name ?? "",
    email: data.email ?? existing?.email ?? "",
    sizes: data.sizes ?? existing?.sizes ?? "",
    favoriteColors: data.favoriteColors ?? existing?.favoriteColors ?? [],
    budget: data.budget ?? existing?.budget ?? "",
    styleNote: data.styleNote ?? existing?.styleNote ?? "",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  fallbackProfiles.set(userId, updated);
  return updated;
}

/* ---------------- SAVED OUTFITS ---------------- */

export async function getSavedOutfitsByUser(userId: string): Promise<SavedOutfit[]> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbSavedOutfitRow[]>`
        SELECT * FROM saved_outfits
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return rows.map(mapOutfitRow);
    } catch (err) {
      console.error("PostgreSQL query error in getSavedOutfitsByUser:", err);
      throw err;
    }
  }

  return fallbackOutfits.get(userId) || [];
}

export async function createSavedOutfit(
  data: {
    score: number;
    reasons: string[];
    matchedPaletteId?: number | null;
    pieceIds: string[];
  },
  userId: string,
): Promise<SavedOutfit> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql<DbSavedOutfitRow[]>`
        INSERT INTO saved_outfits (
          user_id, score, reasons, matched_palette_id, piece_ids
        ) VALUES (
          ${userId},
          ${data.score},
          ${data.reasons || []},
          ${data.matchedPaletteId ?? null},
          ${data.pieceIds || []}
        )
        RETURNING *
      `;
      return mapOutfitRow(rows[0]!);
    } catch (err) {
      console.error("PostgreSQL query error in createSavedOutfit:", err);
      throw err;
    }
  }

  const newOutfit: SavedOutfit = {
    id: `local-outfit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    score: data.score,
    reasons: data.reasons,
    matchedPaletteId: data.matchedPaletteId,
    pieceIds: data.pieceIds,
    createdAt: Date.now(),
  };

  const list = fallbackOutfits.get(userId) || [];
  fallbackOutfits.set(userId, [newOutfit, ...list]);
  return newOutfit;
}

export async function deleteSavedOutfit(id: string, userId: string): Promise<boolean> {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const result = await sql`
        DELETE FROM saved_outfits
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return result.count > 0;
    } catch (err) {
      console.error("PostgreSQL query error in deleteSavedOutfit:", err);
      throw err;
    }
  }

  const list = fallbackOutfits.get(userId) || [];
  const filtered = list.filter((o) => o.id !== id);
  fallbackOutfits.set(userId, filtered);
  return list.length !== filtered.length;
}
