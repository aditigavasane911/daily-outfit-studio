import { useSyncExternalStore } from "react";
import knitImg from "@/assets/garment-knit.png";
import jacketImg from "@/assets/garment-jacket.png";
import trousersImg from "@/assets/garment-trousers.png";
import dressImg from "@/assets/garment-dress.png";

/* ---------------- Types ---------------- */

export type Category = "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories";
export type Formality = "casual" | "smart" | "formal";
export type Season = "spring" | "summer" | "fall" | "winter";

export interface Garment {
  id: string;
  name: string;
  category: Category;
  colorName: string;
  colorHex: string;
  size: string;
  brand?: string;
  fabric?: string;
  seasons: Season[];
  formality: Formality;
  imageUrl?: string;
  favorite: boolean;
  createdAt: number;
}

export interface Outfit {
  id: string;
  pieces: Garment[];
  score: number;
  reasons: string[];
}

/* ---------------- Color palette ---------------- */

export interface ColorDef {
  name: string;
  hex: string;
  neutral: boolean;
  family: "warm" | "cool";
}

export const COLOR_PRESETS: ColorDef[] = [
  { name: "Cream", hex: "#F2EBDD", neutral: true, family: "warm" },
  { name: "White", hex: "#FFFFFF", neutral: true, family: "warm" },
  { name: "Beige", hex: "#D9C7A7", neutral: true, family: "warm" },
  { name: "Tan", hex: "#C29B6C", neutral: false, family: "warm" },
  { name: "Terracotta", hex: "#B65E38", neutral: false, family: "warm" },
  { name: "Rust", hex: "#9C4A2F", neutral: false, family: "warm" },
  { name: "Blush", hex: "#D8A9A0", neutral: false, family: "warm" },
  { name: "Olive", hex: "#6B6B3F", neutral: false, family: "warm" },
  { name: "Sage", hex: "#8A9B7C", neutral: false, family: "cool" },
  { name: "Navy", hex: "#2B3A55", neutral: true, family: "cool" },
  { name: "Indigo", hex: "#3C4F76", neutral: false, family: "cool" },
  { name: "Grey", hex: "#9A9791", neutral: true, family: "cool" },
  { name: "Charcoal", hex: "#3A3A3C", neutral: true, family: "cool" },
  { name: "Black", hex: "#1C1B1A", neutral: true, family: "cool" },
];

export function colorDef(name: string): ColorDef {
  return COLOR_PRESETS.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? { name, hex: "#9A9791", neutral: true, family: "cool" };
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories",
};

/* ---------------- Tiny persistent store ---------------- */

const ITEMS_KEY = "drape:items";
const SESSION_KEY = "drape:session";
const PROFILE_KEY = "drape:profile";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const SEED_ITEMS: Garment[] = [
  {
    id: "seed-knit",
    name: "Oversized wool knit",
    category: "tops",
    colorName: "Cream",
    colorHex: "#F2EBDD",
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
    colorName: "Sage",
    colorHex: "#8A9B7C",
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
    colorName: "Charcoal",
    colorHex: "#3A3A3C",
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
    id: "seed-dress",
    name: "Linen midi dress",
    category: "dresses",
    colorName: "Terracotta",
    colorHex: "#B65E38",
    size: "S",
    brand: "Sezane",
    fabric: "Linen",
    seasons: ["spring", "summer"],
    formality: "smart",
    imageUrl: dressImg,
    favorite: true,
    createdAt: Date.now() - 3 * 864e5,
  },
  {
    id: "seed-tee",
    name: "Fitted white tee",
    category: "tops",
    colorName: "White",
    colorHex: "#FFFFFF",
    size: "M",
    fabric: "Organic cotton",
    seasons: ["spring", "summer", "fall"],
    formality: "casual",
    favorite: false,
    createdAt: Date.now() - 2 * 864e5,
  },
  {
    id: "seed-jeans",
    name: "Straight-leg indigo jeans",
    category: "bottoms",
    colorName: "Indigo",
    colorHex: "#3C4F76",
    size: "32",
    fabric: "Denim",
    seasons: ["spring", "fall", "winter"],
    formality: "casual",
    favorite: false,
    createdAt: Date.now() - 864e5,
  },
  {
    id: "seed-loafers",
    name: "Black leather loafers",
    category: "shoes",
    colorName: "Black",
    colorHex: "#1C1B1A",
    size: "8",
    brand: "Vagabond",
    seasons: ["fall", "winter", "spring"],
    formality: "smart",
    favorite: false,
    createdAt: Date.now() - 5 * 864e5,
  },
  {
    id: "seed-sneakers",
    name: "Off-white sneakers",
    category: "shoes",
    colorName: "Cream",
    colorHex: "#F2EBDD",
    size: "8",
    brand: "Veja",
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
    const stored = load<Garment[] | null>(ITEMS_KEY, null);
    items = stored ?? SEED_ITEMS;
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
  const garment: Garment = {
    ...input,
    id: `item-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    favorite: false,
    createdAt: Date.now(),
  };
  setItems([garment, ...getItems()]);
  return garment;
}

export function removeItem(id: string) {
  setItems(getItems().filter((g) => g.id !== id));
}

export function toggleFavorite(id: string) {
  setItems(getItems().map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)));
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
  favoriteColors: ["Cream", "Sage", "Terracotta"],
  budget: "Under ₹3,000 per piece",
  styleNote: "Quiet, earthy, easy to move in.",
};

let profile: Profile | null = null;
const profileListeners = new Set<() => void>();

function getProfile(): Profile {
  if (profile === null) {
    profile = { ...DEFAULT_PROFILE, ...load<Partial<Profile>>(PROFILE_KEY, {}) };
  }
  return profile;
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...getProfile(), ...patch };
  save(PROFILE_KEY, profile);
  profileListeners.forEach((l) => l());
}

export function subscribeProfile(listener: () => void) {
  profileListeners.add(listener);
  return () => profileListeners.delete(listener);
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribeProfile, getProfile, () => DEFAULT_PROFILE);
}

/* ---------------- Mock session (UI phase) ---------------- */

export interface Session {
  email: string;
  name: string;
}

let session: Session | null | undefined;
const sessionListeners = new Set<() => void>();

function getSession(): Session | null {
  if (session === undefined) session = load<Session | null>(SESSION_KEY, null);
  return session;
}

export function signIn(email: string, name?: string) {
  session = { email, name: name || email.split("@")[0].replace(/[._]/g, " ") };
  save(SESSION_KEY, session);
  sessionListeners.forEach((l) => l());
}

export function signOut() {
  session = null;
  save(SESSION_KEY, null);
  sessionListeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}

/* ---------------- Outfit matching engine ---------------- */

const FORMALITY_ORDER: Record<Formality, number> = { casual: 0, smart: 1, formal: 2 };

function harmony(a: Garment, b: Garment): { score: number; note: string } {
  const ca = colorDef(a.colorName);
  const cb = colorDef(b.colorName);
  if (ca.neutral && cb.neutral) {
    return { score: 1.2, note: `${a.colorName} and ${b.colorName} make a calm tonal base` };
  }
  if (ca.neutral || cb.neutral) {
    return { score: 2, note: `${cb.neutral ? a.colorName : b.colorName} pops against a neutral` };
  }
  if (ca.family === cb.family) {
    return { score: 1, note: `${a.colorName} tones with ${b.colorName}` };
  }
  return { score: 1.4, note: `Warm ${ca.name.toLowerCase()} against cool ${cb.name.toLowerCase()} balances the look` };
}

function seasonOverlap(a: Garment, b: Garment): Season[] {
  const set = new Set(a.seasons);
  return b.seasons.filter((s) => set.has(s));
}

function composeScore(pieces: Garment[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  for (let i = 0; i < pieces.length - 1; i++) {
    const { score: s, note } = harmony(pieces[i], pieces[i + 1]);
    score += s;
    if (s >= 1.4 && reasons.length < 3 && !reasons.some((r) => r === note)) reasons.push(note);
  }
  const formalities = new Set(pieces.map((p) => p.formality));
  if (formalities.size === 1) {
    score += 1.5;
    reasons.push(`Everything sits at a ${pieces[0].formality} level`);
  } else if (formalities.size <= 2) {
    score += 0.8;
    reasons.push("Relaxed and dressed-up pieces balance each other");
  }
  const seasons = pieces.reduce<Season[]>(
    (acc, p, i) => (i === 0 ? [...p.seasons] : acc.filter((s) => p.seasons.includes(s))),
    [],
  );
  if (seasons.length > 0) {
    score += 1;
    reasons.push(`All pieces work for ${seasons[0]}`);
  }
  return { score, reasons: reasons.slice(0, 3) };
}

export function generateOutfits(all: Garment[], season?: Season): Outfit[] {
  const tops = all.filter((g) => g.category === "tops");
  const bottoms = all.filter((g) => g.category === "bottoms");
  const dresses = all.filter((g) => g.category === "dresses");
  const shoes = all.filter((g) => g.category === "shoes");
  const outer = all.filter((g) => g.category === "outerwear");

  const outfits: Outfit[] = [];
  const push = (pieces: Garment[]) => {
    if (pieces.some((p) => season && !p.seasons.includes(season))) return;
    const { score, reasons } = composeScore(pieces);
    if (score < 2) return;
    outfits.push({ id: pieces.map((p) => p.id).join("+"), pieces, score, reasons });
  };

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        push([top, bottom, shoe]);
        for (const jacket of outer) push([top, bottom, shoe, jacket]);
      }
    }
  }
  for (const dress of dresses) {
    for (const shoe of shoes) {
      push([dress, shoe]);
      for (const jacket of outer) push([dress, shoe, jacket]);
    }
  }

  return outfits.sort((a, b) => b.score - a.score).slice(0, 8);
}

export function pairWith(item: Garment, all: Garment[]): { piece: Garment; note: string }[] {
  const candidates = all.filter(
    (g) => g.id !== item.id && g.category !== item.category && g.category !== "accessories",
  );
  return candidates
    .map((piece) => ({ piece, ...harmony(item, piece), formalityGap: Math.abs(FORMALITY_ORDER[piece.formality] - FORMALITY_ORDER[item.formality]) }))
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
