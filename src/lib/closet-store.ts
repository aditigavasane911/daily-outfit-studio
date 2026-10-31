import { useSyncExternalStore } from "react";
import knitImg from "@/assets/garment-knit.png";
import jacketImg from "@/assets/garment-jacket.png";
import trousersImg from "@/assets/garment-trousers.png";
import shirtImg from "@/assets/garment-shirt.png";
import {
  isSupabaseConfigured,
  supabase,
  fetchUserGarments,
  insertDbGarment,
  deleteDbGarment,
  updateDbGarmentFavorite,
  fetchDbProfile,
  updateDbProfile,
  signOutUser,
  fetchSavedOutfits,
  saveDbOutfit,
  deleteDbOutfit,
  hasActiveSupabaseAuth,
} from "./supabase";

/* ---------------- Types ---------------- */

export type Category = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
export type Formality = "casual" | "smart" | "formal";
export type Season = "spring" | "summer" | "fall" | "winter";

export interface Garment {
  id: string;
  name: string;
  category: Category;
  colorName: string;
  colorHex: string;
  size: string;
  brand?: string | undefined;
  fabric?: string | undefined;
  seasons: Season[];
  formality: Formality;
  imageUrl?: string | undefined;
  favorite: boolean;
  createdAt: number;
}

export interface Outfit {
  id: string;
  pieces: Garment[];
  score: number;
  reasons: string[];
  matchedPalette?: StudioPalette | undefined;
}

/* ---------------- Studio Palette Collection (from image) ---------------- */

export interface StudioPalette {
  id: number;
  name: string;
  theme: string;
  topHex: string;
  topName: string;
  bottomHex: string;
  bottomName: string;
  gradientCss: string;
}

export const STUDIO_PALETTES: StudioPalette[] = [
  {
    id: 1,
    name: "Crimson & Ice",
    theme: "High-Contrast Electric",
    topHex: "#EA2F4A",
    topName: "Crimson Red",
    bottomHex: "#D2ECF9",
    bottomName: "Ice Blue",
    gradientCss: "linear-gradient(180deg, #EA2F4A 0%, #D2ECF9 100%)",
  },
  {
    id: 2,
    name: "Coral & Buttercream",
    theme: "Warm Sunrise Glow",
    topHex: "#EF564B",
    topName: "Coral Red",
    bottomHex: "#F7EE9F",
    bottomName: "Buttercream",
    gradientCss: "linear-gradient(180deg, #EF564B 0%, #F7EE9F 100%)",
  },
  {
    id: 3,
    name: "Ocean & Mint",
    theme: "Aquatic Freshness",
    topHex: "#57ABAD",
    topName: "Ocean Teal",
    bottomHex: "#DDF4BA",
    bottomName: "Mint Lime",
    gradientCss: "linear-gradient(180deg, #57ABAD 0%, #DDF4BA 100%)",
  },
  {
    id: 4,
    name: "Chartreuse & Sage",
    theme: "Verdant Botanic",
    topHex: "#C0DD73",
    topName: "Chartreuse",
    bottomHex: "#539B77",
    bottomName: "Forest Sage",
    gradientCss: "linear-gradient(180deg, #C0DD73 0%, #539B77 100%)",
  },
  {
    id: 5,
    name: "Plum & Petrol",
    theme: "Midnight Velvet",
    topHex: "#5E3C66",
    topName: "Deep Plum",
    bottomHex: "#257C93",
    bottomName: "Petrol Teal",
    gradientCss: "linear-gradient(180deg, #5E3C66 0%, #257C93 100%)",
  },
  {
    id: 6,
    name: "Lavender & Rose",
    theme: "Dusty Blossom",
    topHex: "#7B6899",
    topName: "Muted Violet",
    bottomHex: "#DB89B3",
    bottomName: "Rose Mauve",
    gradientCss: "linear-gradient(180deg, #7B6899 0%, #DB89B3 100%)",
  },
  {
    id: 7,
    name: "Periwinkle & Orchid",
    theme: "Dreamy Lilac",
    topHex: "#8F9AC9",
    topName: "Periwinkle",
    bottomHex: "#EFABDA",
    bottomName: "Lilac Orchid",
    gradientCss: "linear-gradient(180deg, #8F9AC9 0%, #EFABDA 100%)",
  },
  {
    id: 8,
    name: "Spruce & Emerald",
    theme: "Jewel Tone Balance",
    topHex: "#165B6D",
    topName: "Midnight Spruce",
    bottomHex: "#199E72",
    bottomName: "Emerald Jade",
    gradientCss: "linear-gradient(180deg, #165B6D 0%, #199E72 100%)",
  },
  {
    id: 9,
    name: "Sage & Warm Sand",
    theme: "Linen & Earth",
    topHex: "#73A879",
    topName: "Earthy Sage",
    bottomHex: "#F4E1C1",
    bottomName: "Warm Sand",
    gradientCss: "linear-gradient(180deg, #73A879 0%, #F4E1C1 100%)",
  },
  {
    id: 10,
    name: "Sunset & Amber",
    theme: "Golden Hour Heat",
    topHex: "#EF5835",
    topName: "Flame Orange",
    bottomHex: "#E29F17",
    bottomName: "Golden Amber",
    gradientCss: "linear-gradient(180deg, #EF5835 0%, #E29F17 100%)",
  },
];

/* ---------------- Color definitions ---------------- */

export interface ColorDef {
  name: string;
  hex: string;
  neutral: boolean;
  family: "warm" | "cool";
}

export const COLOR_PRESETS: ColorDef[] = [
  // Studio Palette 1
  { name: "Crimson Red", hex: "#EA2F4A", neutral: false, family: "warm" },
  { name: "Ice Blue", hex: "#D2ECF9", neutral: true, family: "cool" },
  // Studio Palette 2
  { name: "Coral Red", hex: "#EF564B", neutral: false, family: "warm" },
  { name: "Buttercream", hex: "#F7EE9F", neutral: true, family: "warm" },
  // Studio Palette 3
  { name: "Ocean Teal", hex: "#57ABAD", neutral: false, family: "cool" },
  { name: "Mint Lime", hex: "#DDF4BA", neutral: false, family: "cool" },
  // Studio Palette 4
  { name: "Chartreuse", hex: "#C0DD73", neutral: false, family: "warm" },
  { name: "Forest Sage", hex: "#539B77", neutral: false, family: "cool" },
  // Studio Palette 5
  { name: "Deep Plum", hex: "#5E3C66", neutral: false, family: "cool" },
  { name: "Petrol Teal", hex: "#257C93", neutral: false, family: "cool" },
  // Studio Palette 6
  { name: "Muted Violet", hex: "#7B6899", neutral: false, family: "cool" },
  { name: "Rose Mauve", hex: "#DB89B3", neutral: false, family: "warm" },
  // Studio Palette 7
  { name: "Periwinkle", hex: "#8F9AC9", neutral: false, family: "cool" },
  { name: "Lilac Orchid", hex: "#EFABDA", neutral: false, family: "cool" },
  // Studio Palette 8
  { name: "Midnight Spruce", hex: "#165B6D", neutral: true, family: "cool" },
  { name: "Emerald Jade", hex: "#199E72", neutral: false, family: "cool" },
  // Studio Palette 9
  { name: "Earthy Sage", hex: "#73A879", neutral: false, family: "cool" },
  { name: "Warm Sand", hex: "#F4E1C1", neutral: true, family: "warm" },
  // Studio Palette 10
  { name: "Flame Orange", hex: "#EF5835", neutral: false, family: "warm" },
  { name: "Golden Amber", hex: "#E29F17", neutral: false, family: "warm" },
  // Wardrobe Essentials
  { name: "White", hex: "#FFFFFF", neutral: true, family: "warm" },
  { name: "Charcoal", hex: "#3A3A3C", neutral: true, family: "cool" },
  { name: "Black", hex: "#1C1B1A", neutral: true, family: "cool" },
];

const COLOR_ALIASES: Record<string, string> = {
  cream: "Warm Sand",
  terracotta: "Flame Orange",
  sage: "Earthy Sage",
  olive: "Forest Sage",
  tan: "Warm Sand",
  beige: "Warm Sand",
  blush: "Rose Mauve",
  rust: "Flame Orange",
  navy: "Midnight Spruce",
  indigo: "Petrol Teal",
  grey: "Ice Blue",
};

export function colorDef(name: string): ColorDef {
  const clean = name.trim().toLowerCase();
  const direct = COLOR_PRESETS.find((c) => c.name.toLowerCase() === clean);
  if (direct) return direct;
  const aliasName = COLOR_ALIASES[clean];
  if (aliasName) {
    const alias = COLOR_PRESETS.find((c) => c.name.toLowerCase() === aliasName.toLowerCase());
    if (alias) return alias;
  }
  return {
    name,
    hex: "#165B6D",
    neutral: true,
    family: "cool",
  };
}

export function colorsEquivalent(hexA: string, hexB: string): boolean {
  return hexA.trim().toLowerCase() === hexB.trim().toLowerCase();
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories",
};

export function isMaleGarment(g: Garment): boolean {
  if (!g || !g.name) return false;
  const cat = String(g.category || "").toLowerCase();
  const name = g.name.toLowerCase();
  if (cat === "dresses" || cat === "skirts") return false;
  if (
    name.includes("dress") ||
    name.includes("skirt") ||
    name.includes("blouse") ||
    name.includes("gown") ||
    name.includes("heels")
  ) {
    return false;
  }
  return true;
}

/* ---------------- Tiny persistent store ---------------- */

const ITEMS_KEY = "rewear_radar:items";
const SESSION_KEY = "rewear_radar:session";
const PROFILE_KEY = "rewear_radar:profile";

function load<T>(key: string, fallback: T, legacyKey?: string): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors
  }
}

const SEED_ITEMS: Garment[] = [
  {
    id: "seed-knit",
    name: "Oversized wool knit",
    category: "tops",
    colorName: "Buttercream",
    colorHex: "#F7EE9F",
    size: "M",
    brand: "Everlane",
    fabric: "Merino wool",
    seasons: ["fall", "winter"],
    formality: "smart",
    imageUrl: knitImg,
    favorite: true,
    createdAt: Date.now() - 6 * 864e5,
  },
  {
    id: "seed-jacket",
    name: "Sage utility jacket",
    category: "outerwear",
    colorName: "Earthy Sage",
    colorHex: "#73A879",
    size: "M",
    brand: "Arket",
    fabric: "Cotton twill",
    seasons: ["spring", "fall"],
    formality: "casual",
    imageUrl: jacketImg,
    favorite: false,
    createdAt: Date.now() - 5 * 864e5,
  },
  {
    id: "seed-trousers",
    name: "Wide-leg pleated trousers",
    category: "bottoms",
    colorName: "Midnight Spruce",
    colorHex: "#165B6D",
    size: "32",
    brand: "COS",
    fabric: "Wool blend",
    seasons: ["fall", "winter", "spring"],
    formality: "smart",
    imageUrl: trousersImg,
    favorite: false,
    createdAt: Date.now() - 4 * 864e5,
  },
  {
    id: "seed-shirt",
    name: "Coral Red linen button-down shirt",
    category: "tops",
    colorName: "Coral Red",
    colorHex: "#EF564B",
    size: "M",
    brand: "Sunflower",
    fabric: "Linen",
    seasons: ["spring", "summer"],
    formality: "smart",
    imageUrl: shirtImg,
    favorite: true,
    createdAt: Date.now() - 3 * 864e5,
  },
  {
    id: "seed-tee",
    name: "Heavyweight ice blue tee",
    category: "tops",
    colorName: "Ice Blue",
    colorHex: "#D2ECF9",
    size: "L",
    fabric: "Organic cotton",
    seasons: ["spring", "summer", "fall"],
    formality: "casual",
    favorite: false,
    createdAt: Date.now() - 2 * 864e5,
  },
  {
    id: "seed-jeans",
    name: "Straight-leg petrol jeans",
    category: "bottoms",
    colorName: "Petrol Teal",
    colorHex: "#257C93",
    size: "32",
    fabric: "Selvedge denim",
    seasons: ["spring", "fall", "winter"],
    formality: "casual",
    favorite: false,
    createdAt: Date.now() - 864e5,
  },
  {
    id: "seed-sand-pants",
    name: "Warm sand tailored chinos",
    category: "bottoms",
    colorName: "Warm Sand",
    colorHex: "#F4E1C1",
    size: "32",
    fabric: "Cotton twill",
    seasons: ["spring", "summer", "fall"],
    formality: "casual",
    favorite: true,
    createdAt: Date.now() - 10 * 3600e3,
  },
  {
    id: "seed-emerald-top",
    name: "Emerald knit polo shirt",
    category: "tops",
    colorName: "Emerald Jade",
    colorHex: "#199E72",
    size: "M",
    brand: "Percival",
    fabric: "Cotton knit",
    seasons: ["spring", "fall", "winter"],
    formality: "smart",
    favorite: true,
    createdAt: Date.now() - 6 * 3600e3,
  },
  {
    id: "seed-loafers",
    name: "Deep plum leather penny loafers",
    category: "shoes",
    colorName: "Deep Plum",
    colorHex: "#5E3C66",
    size: "9",
    brand: "G.H. Bass",
    fabric: "Calfskin leather",
    seasons: ["fall", "winter", "spring"],
    formality: "smart",
    favorite: false,
    createdAt: Date.now() - 5 * 864e5,
  },
  {
    id: "seed-sneakers",
    name: "Off-white minimal court sneakers",
    category: "shoes",
    colorName: "Warm Sand",
    colorHex: "#F4E1C1",
    size: "9",
    brand: "Veja",
    fabric: "Leather",
    seasons: ["spring", "summer", "fall"],
    formality: "casual",
    favorite: false,
    createdAt: Date.now() - 6 * 864e5,
  },
];

/* Items */

let items: Garment[] | null = null;
const listeners = new Set<() => void>();

function getItems(): Garment[] {
  if (items === null) {
    const stored = load<Garment[] | null>(ITEMS_KEY, null, "drape:items");
    if (stored && Array.isArray(stored)) {
      // Strictly sanitize cached items: purge any dresses or women's pieces
      const sanitized = stored
        .filter(isMaleGarment)
        .map((item) => {
          if (item.id === "seed-dress") {
            return SEED_ITEMS.find((s) => s.id === "seed-shirt")!;
          }
          if (item.id === "seed-emerald-top" && item.name.toLowerCase().includes("blouse")) {
            return SEED_ITEMS.find((s) => s.id === "seed-emerald-top")!;
          }
          return item;
        })
        .filter(Boolean);

      // Ensure seed shirt exists
      if (!sanitized.some((i) => i.id === "seed-shirt")) {
        const shirt = SEED_ITEMS.find((s) => s.id === "seed-shirt");
        if (shirt) sanitized.push(shirt);
      }

      items = sanitized;
      save(ITEMS_KEY, items);
    } else {
      items = SEED_ITEMS;
      save(ITEMS_KEY, items);
    }
  }
  return items;
}

function setItems(next: Garment[]) {
  items = next;
  save(ITEMS_KEY, next);
  listeners.forEach((l) => l());
}

export function subscribeCloset(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addItem(input: Omit<Garment, "id" | "favorite" | "createdAt">): Garment {
  const tempId = `item-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  const garment: Garment = {
    ...input,
    id: tempId,
    favorite: false,
    createdAt: Date.now(),
  };
  setItems([garment, ...getItems()]);

  // If connected to Supabase and authenticated, persist to PostgreSQL
  if (isSupabaseConfigured && session?.isSupabase) {
    insertDbGarment(input)
      .then((createdDbGarment) => {
        // Swap temp ID with the PostgreSQL UUID
        items = getItems().map((g) => (g.id === tempId ? createdDbGarment : g));
        save(ITEMS_KEY, items);
        listeners.forEach((l) => l());
      })
      .catch((err) => {
        console.error("Failed to persist garment to Supabase PostgreSQL:", err);
      });
  }

  return garment;
}

export function removeItem(id: string) {
  setItems(getItems().filter((g) => g.id !== id));
  if (isSupabaseConfigured && session?.isSupabase && !id.startsWith("seed-")) {
    deleteDbGarment(id).catch((err) => {
      console.error("Failed to delete garment from Supabase PostgreSQL:", err);
    });
  }
}

export function toggleFavorite(id: string) {
  const current = getItems().find((g) => g.id === id);
  const nextFav = current ? !current.favorite : false;
  setItems(getItems().map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)));
  if (isSupabaseConfigured && session?.isSupabase && !id.startsWith("seed-")) {
    updateDbGarmentFavorite(id, nextFav).catch((err) => {
      console.error("Failed to update favorite in Supabase PostgreSQL:", err);
    });
  }
}

export function useCloset(): Garment[] {
  return useSyncExternalStore(subscribeCloset, getItems, () => []);
}

/* ---------------- Profile ---------------- */

export interface Profile {
  name: string;
  sizes: string;
  favoriteColors: string[];
  budget: string;
  styleNote: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  sizes: "",
  favoriteColors: ["Midnight Spruce", "Earthy Sage", "Warm Sand", "Flame Orange"],
  budget: "Under ₹3,000 per piece",
  styleNote: "Quiet, earthy, easy to move in.",
};

let profile: Profile | null = null;
const profileListeners = new Set<() => void>();

function getProfile(): Profile {
  if (profile === null) {
    profile = { ...DEFAULT_PROFILE, ...load<Partial<Profile>>(PROFILE_KEY, {}, "drape:profile") };
  }
  return profile;
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...getProfile(), ...patch };
  save(PROFILE_KEY, profile);
  profileListeners.forEach((l) => l());
  if (isSupabaseConfigured && session?.isSupabase) {
    updateDbProfile(patch).catch((err) => {
      console.error("Failed to update profile in Supabase PostgreSQL:", err);
    });
  }
}

export function subscribeProfile(listener: () => void) {
  profileListeners.add(listener);
  return () => profileListeners.delete(listener);
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribeProfile, getProfile, () => DEFAULT_PROFILE);
}

/* ---------------- Session (Supabase Auth + Mock Fallback) ---------------- */

export interface Session {
  email: string;
  name: string;
  id?: string;
  isSupabase?: boolean;
}

let session: Session | null | undefined;
const sessionListeners = new Set<() => void>();

function getSession(): Session | null {
  if (session === undefined) session = load<Session | null>(SESSION_KEY, null, "drape:session");
  return session;
}

export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? localStorage.getItem("drape:session");
    if (raw && raw !== "null" && raw !== "undefined") {
      const parsed = JSON.parse(raw) as Partial<Session> | null;
      if (parsed && typeof parsed === "object" && parsed.email) return true;
    }
    return hasActiveSupabaseAuth();
  } catch {
    return false;
  }
}

export function signIn(email?: string, name?: string, isSupabase = false, id?: string) {
  const cleanEmail = email?.trim() || "demo@rewearradar.com";
  const defaultName = cleanEmail.includes("@")
    ? (cleanEmail.split("@")[0]?.replace(/[._]/g, " ") ?? "Demo Stylist")
    : cleanEmail;
  session = {
    id,
    email: cleanEmail,
    name: name?.trim() || defaultName || "Demo Stylist",
    isSupabase,
  };
  save(SESSION_KEY, session);
  sessionListeners.forEach((l) => l());
}

export function signOut() {
  if (isSupabaseConfigured && session?.isSupabase) {
    signOutUser().catch(() => {});
  }
  session = null;
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  sessionListeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}

/* ---------------- Saved Outfits Store ---------------- */

const SAVED_OUTFITS_KEY = "rewear_radar:saved_outfits";

export interface SavedOutfit {
  id: string;
  score: number;
  reasons: string[];
  matchedPaletteId?: number | null;
  pieceIds: string[];
  createdAt: number;
}

let savedOutfits: SavedOutfit[] | null = null;
const savedOutfitsListeners = new Set<() => void>();

function getSavedOutfits(): SavedOutfit[] {
  if (savedOutfits === null) {
    savedOutfits = load<SavedOutfit[]>(SAVED_OUTFITS_KEY, []);
  }
  return savedOutfits;
}

function setSavedOutfits(next: SavedOutfit[]) {
  savedOutfits = next;
  save(SAVED_OUTFITS_KEY, next);
  savedOutfitsListeners.forEach((l) => l());
}

export function subscribeSavedOutfits(listener: () => void) {
  savedOutfitsListeners.add(listener);
  return () => savedOutfitsListeners.delete(listener);
}

export function useSavedOutfits(): SavedOutfit[] {
  return useSyncExternalStore(subscribeSavedOutfits, getSavedOutfits, () => []);
}

export async function toggleSaveOutfit(outfit: Outfit): Promise<boolean> {
  const current = getSavedOutfits();
  const piecesKey = outfit.pieces.map((p) => p.id).join("+");
  const existing = current.find(
    (s) => s.id === outfit.id || s.pieceIds.join("+") === piecesKey,
  );

  if (existing) {
    // Remove from saved
    setSavedOutfits(current.filter((s) => s.id !== existing.id));
    if (isSupabaseConfigured && session?.isSupabase && !existing.id.startsWith("local-")) {
      deleteDbOutfit(existing.id).catch((err) => {
        console.error("Failed to delete saved outfit in Supabase:", err);
      });
    }
    return false; // Now unsaved
  } else {
    // Save outfit
    const tempId = `local-${Date.now()}`;
    const newSaved: SavedOutfit = {
      id: tempId,
      score: outfit.score,
      reasons: outfit.reasons,
      matchedPaletteId: outfit.matchedPalette?.id ?? null,
      pieceIds: outfit.pieces.map((p) => p.id),
      createdAt: Date.now(),
    };
    setSavedOutfits([newSaved, ...current]);

    if (isSupabaseConfigured && session?.isSupabase) {
      try {
        const dbResult = await saveDbOutfit({
          score: outfit.score,
          reasons: outfit.reasons,
          matchedPaletteId: outfit.matchedPalette?.id,
          pieceIds: outfit.pieces.map((p) => p.id),
        });
        setSavedOutfits(
          getSavedOutfits().map((s) =>
            s.id === tempId ? { ...s, id: dbResult.id } : s,
          ),
        );
      } catch (err) {
        console.error("Failed to persist outfit to Supabase:", err);
      }
    }
    return true; // Now saved
  }
}

export function isOutfitSaved(outfitId: string, pieceIds?: string[]): boolean {
  const current = getSavedOutfits();
  const piecesKey = pieceIds ? pieceIds.join("+") : outfitId;
  return current.some((s) => s.id === outfitId || s.pieceIds.join("+") === piecesKey);
}

/* ---------------- Supabase Real-time / Auth Sync ---------------- */

let hasInitializedSync = false;

export function initSupabaseSync() {
  if (hasInitializedSync || typeof window === "undefined" || !isSupabaseConfigured) return;
  hasInitializedSync = true;

  supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
    if (currentSession?.user) {
      handleUserSession(currentSession.user);
    }
  });

  supabase.auth.onAuthStateChange((event, currentSession) => {
    if (currentSession?.user) {
      handleUserSession(currentSession.user);
    } else if (event === "SIGNED_OUT") {
      session = null;
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
      items = SEED_ITEMS;
      save(ITEMS_KEY, items);
      sessionListeners.forEach((l) => l());
      listeners.forEach((l) => l());
    }
  });
}

async function handleUserSession(user: { id: string; email?: string; user_metadata?: Record<string, any> }) {
  const email = user.email || "";
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    email.split("@")[0] ||
    "Stylist";

  session = {
    id: user.id,
    email,
    name,
    isSupabase: true,
  };
  save(SESSION_KEY, session);
  sessionListeners.forEach((l) => l());

  try {
    const dbGarments = await fetchUserGarments();
    // Strictly preserve demo items: merge user's PostgreSQL items with SEED_ITEMS
    const dbIds = new Set((dbGarments || []).map((g) => g.id));
    const preservedDemos = SEED_ITEMS.filter((s) => !dbIds.has(s.id));
    items = [...(dbGarments || []), ...preservedDemos];
    save(ITEMS_KEY, items);
    listeners.forEach((l) => l());

    const dbProfile = await fetchDbProfile();
    if (dbProfile) {
      profile = { ...DEFAULT_PROFILE, ...dbProfile, name: dbProfile.name || name };
      save(PROFILE_KEY, profile);
      profileListeners.forEach((l) => l());
    }

    const dbOutfits = await fetchSavedOutfits();
    if (dbOutfits && dbOutfits.length > 0) {
      const mapped: SavedOutfit[] = dbOutfits.map((o) => ({
        id: o.id,
        score: Number(o.score),
        reasons: o.reasons || [],
        matchedPaletteId: o.matched_palette_id,
        pieceIds: o.piece_ids || [],
        createdAt: new Date(o.created_at).getTime(),
      }));
      setSavedOutfits(mapped);
    }
  } catch (err) {
    console.error("Error syncing Supabase PostgreSQL data:", err);
  }
}

// Auto-initialize when in browser environment
if (typeof window !== "undefined") {
  initSupabaseSync();
}


/* ---------------- Outfit matching engine ---------------- */

const FORMALITY_ORDER: Record<Formality, number> = { casual: 0, smart: 1, formal: 2 };

export function findMatchingPalette(pieces: Garment[]): StudioPalette | undefined {
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const p1 = pieces[i];
      const p2 = pieces[j];
      if (!p1 || !p2) continue;
      const c1 = colorDef(p1.colorName);
      const c2 = colorDef(p2.colorName);
      const match = STUDIO_PALETTES.find(
        (sp) =>
          (colorsEquivalent(c1.hex, sp.topHex) && colorsEquivalent(c2.hex, sp.bottomHex)) ||
          (colorsEquivalent(c1.hex, sp.bottomHex) && colorsEquivalent(c2.hex, sp.topHex)),
      );
      if (match) return match;
    }
  }
  return undefined;
}

function harmony(a: Garment, b: Garment): { score: number; note: string; palette?: StudioPalette } {
  const ca = colorDef(a.colorName);
  const cb = colorDef(b.colorName);

  // Exact Studio Palette Match
  const directPalette = STUDIO_PALETTES.find(
    (sp) =>
      (colorsEquivalent(ca.hex, sp.topHex) && colorsEquivalent(cb.hex, sp.bottomHex)) ||
      (colorsEquivalent(ca.hex, sp.bottomHex) && colorsEquivalent(cb.hex, sp.topHex)),
  );
  if (directPalette) {
    return {
      score: 2.8,
      note: `Studio Palette harmony: ${directPalette.name} (${directPalette.theme})`,
      palette: directPalette,
    };
  }

  if (ca.neutral && cb.neutral) {
    return { score: 1.2, note: `${a.colorName} and ${b.colorName} make a calm tonal base` };
  }
  if (ca.neutral || cb.neutral) {
    return { score: 2, note: `${cb.neutral ? a.colorName : b.colorName} pops against a neutral` };
  }
  if (ca.family === cb.family) {
    return { score: 1, note: `${a.colorName} tones with ${b.colorName}` };
  }
  return {
    score: 1.4,
    note: `Warm ${ca.name.toLowerCase()} against cool ${cb.name.toLowerCase()} balances the look`,
  };
}

function seasonOverlap(a: Garment, b: Garment): Season[] {
  const set = new Set(a.seasons);
  return b.seasons.filter((s) => set.has(s));
}

function composeScore(pieces: Garment[]): {
  score: number;
  reasons: string[];
  matchedPalette?: StudioPalette | undefined;
} {
  let score = 0;
  const reasons: string[] = [];
  let matchedPalette: StudioPalette | undefined;

  for (let i = 0; i < pieces.length - 1; i++) {
    const p1 = pieces[i];
    const p2 = pieces[i + 1];
    if (!p1 || !p2) continue;
    const h = harmony(p1, p2);
    score += h.score;
    if (h.palette && !matchedPalette) {
      matchedPalette = h.palette;
    }
    if (h.score >= 1.4 && reasons.length < 3 && !reasons.some((r) => r === h.note)) {
      reasons.push(h.note);
    }
  }

  if (!matchedPalette) {
    matchedPalette = findMatchingPalette(pieces);
  }
  if (matchedPalette && !reasons.some((r) => r.includes(matchedPalette!.name))) {
    score += 1.5;
    reasons.unshift(`Studio Harmony: ${matchedPalette.name} (${matchedPalette.theme})`);
  }

  const formalities = new Set(pieces.map((p) => p.formality));
  const firstPiece = pieces[0];
  if (formalities.size === 1 && firstPiece) {
    score += 1.5;
    reasons.push(`Everything sits at a ${firstPiece.formality} level`);
  } else if (formalities.size <= 2) {
    score += 0.8;
    reasons.push("Relaxed and dressed-up pieces balance each other");
  }
  const seasons = pieces.reduce<Season[]>(
    (acc, p, i) => (i === 0 ? [...p.seasons] : acc.filter((s) => p.seasons.includes(s))),
    [],
  );
  const firstSeason = seasons[0];
  if (firstSeason) {
    score += 1;
    reasons.push(`All pieces work for ${firstSeason}`);
  }
  return { score, reasons: reasons.slice(0, 3), matchedPalette };
}

export function generateOutfits(all: Garment[], season?: Season): Outfit[] {
  // Strictly curate only male pieces
  const maleItems = all.filter(isMaleGarment);
  const tops = maleItems.filter((g) => g.category === "tops");
  const bottoms = maleItems.filter((g) => g.category === "bottoms");
  const shoes = maleItems.filter((g) => g.category === "shoes");
  const outer = maleItems.filter((g) => g.category === "outerwear");

  const outfits: Outfit[] = [];
  const push = (pieces: Garment[]) => {
    if (pieces.some((p) => season && !p.seasons.includes(season))) return;
    if (pieces.some((p) => !isMaleGarment(p))) return;
    const { score, reasons, matchedPalette } = composeScore(pieces);
    if (score < 2) return;
    outfits.push({
      id: pieces.map((p) => p.id).join("+"),
      pieces,
      score,
      reasons,
      matchedPalette,
    });
  };

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        push([top, bottom, shoe]);
        for (const jacket of outer) push([top, bottom, shoe, jacket]);
      }
    }
  }

  return outfits.sort((a, b) => b.score - a.score).slice(0, 10);
}

export function pairWith(item: Garment, all: Garment[]): { piece: Garment; note: string }[] {
  if (!isMaleGarment(item)) return [];
  const candidates = all
    .filter(isMaleGarment)
    .filter(
      (g) => g.id !== item.id && g.category !== item.category && g.category !== "accessories",
    );
  return candidates
    .map((piece) => ({
      piece,
      ...harmony(item, piece),
      formalityGap: Math.abs(FORMALITY_ORDER[piece.formality] - FORMALITY_ORDER[item.formality]),
    }))
    .filter((c) => c.formalityGap <= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ piece, note }) => ({ piece, note }));
}

/* ---------------- Photo downscaling for local persistence ---------------- */

export async function fileToDataUrl(file: File, maxDim = 480): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}
