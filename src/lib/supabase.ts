import { createClient } from "@supabase/supabase-js";
import type { Garment, Profile } from "./closet-store";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseAnonKey.includes("your-anon-key"),
);

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/* ---------------- Auth API ---------------- */

export async function signUpWithEmail(email: string, password: string, name?: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || email.split("@")[0],
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
  }
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/closet` : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* ---------------- PostgreSQL Database CRUD API ---------------- */

export interface DbGarment {
  id: string;
  user_id: string;
  name: string;
  category: "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
  color_name: string;
  color_hex: string;
  size: string;
  brand?: string;
  fabric?: string;
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  formality: "casual" | "smart" | "formal";
  image_url?: string;
  favorite: boolean;
  created_at: string;
}

export function dbToGarment(g: DbGarment): Garment {
  return {
    id: g.id,
    name: g.name,
    category: g.category,
    colorName: g.color_name,
    colorHex: g.color_hex,
    size: g.size,
    brand: g.brand,
    fabric: g.fabric,
    seasons: g.seasons,
    formality: g.formality,
    imageUrl: g.image_url,
    favorite: g.favorite,
    createdAt: new Date(g.created_at).getTime(),
  };
}

export async function fetchUserGarments(): Promise<Garment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("garments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching garments from Supabase:", error);
    throw error;
  }
  return (data as DbGarment[]).map(dbToGarment);
}

export async function insertDbGarment(
  garment: Omit<Garment, "id" | "createdAt" | "favorite">,
): Promise<Garment> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No authenticated user found.");

  const payload = {
    user_id: user.id,
    name: garment.name,
    category: garment.category,
    color_name: garment.colorName,
    color_hex: garment.colorHex,
    size: garment.size || "",
    brand: garment.brand || null,
    fabric: garment.fabric || null,
    seasons: garment.seasons || [],
    formality: garment.formality || "casual",
    image_url: garment.imageUrl || null,
    favorite: false,
  };

  const { data, error } = await supabase
    .from("garments")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error inserting garment:", error);
    throw error;
  }
  return dbToGarment(data as DbGarment);
}

export async function deleteDbGarment(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("garments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting garment:", error);
    throw error;
  }
}

export async function updateDbGarmentFavorite(id: string, favorite: boolean): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from("garments")
    .update({ favorite })
    .eq("id", id);
  if (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

/* ---------------- Storage API ---------------- */

export async function uploadGarmentPhoto(file: File | Blob): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No authenticated user found.");

  const fileExt = file instanceof File ? file.name.split(".").pop() || "jpg" : "jpg";
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from("garments")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.warn("Supabase Storage upload warning (falling back to data URL):", error.message);
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("garments").getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.warn("Storage upload failed, falling back to data URL encoding:", err);
    throw err;
  }
}

/* ---------------- Profile API ---------------- */

export async function fetchDbProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Could not fetch profile:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    name: data.name || "",
    sizes: data.sizes || "",
    favoriteColors: data.favorite_colors || [],
    budget: data.budget || "",
    styleNote: data.style_note || "",
  };
}

export async function updateDbProfile(profile: Partial<Profile>): Promise<void> {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const payload: Record<string, unknown> = {
    id: user.id,
    updated_at: new Date().toISOString(),
  };
  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.sizes !== undefined) payload.sizes = profile.sizes;
  if (profile.favoriteColors !== undefined) payload.favorite_colors = profile.favoriteColors;
  if (profile.budget !== undefined) payload.budget = profile.budget;
  if (profile.styleNote !== undefined) payload.style_note = profile.styleNote;

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Error updating profile in Supabase:", error);
    throw error;
  }
}

/* ---------------- Saved Outfits Database API ---------------- */

export interface DbSavedOutfit {
  id: string;
  user_id: string;
  score: number;
  reasons: string[];
  matched_palette_id: number | null;
  piece_ids: string[];
  created_at: string;
}

export async function fetchSavedOutfits(): Promise<DbSavedOutfit[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("saved_outfits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved outfits:", error);
    return [];
  }
  return data as DbSavedOutfit[];
}

export async function saveDbOutfit(outfit: {
  score: number;
  reasons: string[];
  matchedPaletteId?: number;
  pieceIds: string[];
}): Promise<DbSavedOutfit> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated to save outfits.");

  const payload = {
    user_id: user.id,
    score: outfit.score,
    reasons: outfit.reasons,
    matched_palette_id: outfit.matchedPaletteId ?? null,
    piece_ids: outfit.pieceIds,
  };

  const { data, error } = await supabase
    .from("saved_outfits")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error saving outfit to Supabase:", error);
    throw error;
  }
  return data as DbSavedOutfit;
}

export async function deleteDbOutfit(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("saved_outfits").delete().eq("id", id);
  if (error) {
    console.error("Error deleting saved outfit:", error);
    throw error;
  }
}

/* ---------------- OAuth & Session Helpers ---------------- */

export function hasActiveSupabaseAuth(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const val = localStorage.getItem(key);
        if (val && val !== "null" && val !== "undefined") return true;
      }
    }
    if (
      window.location.hash.includes("access_token=") ||
      window.location.search.includes("code=")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

