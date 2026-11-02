import type { Request } from "express";

export type Category = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
export type Formality = "casual" | "smart" | "formal";
export type Season = "spring" | "summer" | "fall" | "winter";

export interface Garment {
  id: string;
  userId: string;
  name: string;
  category: Category;
  colorName: string;
  colorHex: string;
  size: string;
  brand?: string | null;
  fabric?: string | null;
  seasons: Season[];
  formality: Formality;
  imageUrl?: string | null;
  favorite: boolean;
  createdAt: number;
}

export interface DbGarmentRow {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  color_name: string;
  color_hex: string;
  size: string;
  brand: string | null;
  fabric: string | null;
  seasons: Season[] | null;
  formality: Formality;
  image_url: string | null;
  favorite: boolean;
  created_at: string | Date;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  sizes: string;
  favoriteColors: string[];
  budget: string;
  styleNote: string;
  createdAt: number;
  updatedAt: number;
}

export interface DbProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  sizes: string | null;
  favorite_colors: string[] | null;
  budget: string | null;
  style_note: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  score: number;
  reasons: string[];
  matchedPaletteId?: number | null;
  pieceIds: string[];
  createdAt: number;
}

export interface DbSavedOutfitRow {
  id: string;
  user_id: string;
  score: number;
  reasons: string[] | null;
  matched_palette_id: number | null;
  piece_ids: string[] | null;
  created_at: string | Date;
}

export interface UserContext {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

export interface AiOutfitRecommendation {
  id: string;
  title: string;
  vibe: string;
  selectedPieceIds: string[];
  whyItWorks: string;
  colorHarmony: string;
  layeringTips: string[];
  accessoryIdeas: string[];
  modelUsed: string;
  provider: "ollama" | "gemini";
  createdAt: number;
}
