import type { Garment, Profile, Season } from "./closet-store";

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

export interface OllamaModelInfo {
  name: string;
  size?: number;
  digest?: string;
  modifiedAt?: string;
}

export interface OllamaStatus {
  connected: boolean;
  models: OllamaModelInfo[];
  endpoint: string;
  error?: string;
}

const AI_CONFIG_KEY = "rewear_radar:ai_config";

export interface AiSettings {
  provider: "ollama" | "gemini";
  ollamaModel: string;
  ollamaEndpoint: string;
  geminiApiKey: string;
  geminiModel: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "ollama",
  ollamaModel: "qwen2.5:3b",
  ollamaEndpoint: "/api/ollama",
  geminiApiKey: "",
  geminiModel: "gemini-2.0-flash",
};

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAiSettings(settings: Partial<AiSettings>): AiSettings {
  const current = loadAiSettings();
  const next = { ...current, ...settings };
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(next));
    }
  } catch {
    // ignore write errors
  }
  return next;
}

/**
 * Check if Ollama is running and fetch all available local models
 */
export async function checkOllamaConnection(customEndpoint?: string): Promise<OllamaStatus> {
  const endpoints = [
    customEndpoint || "/api/ollama",
    "http://127.0.0.1:11434",
    "http://localhost:11434",
  ];

  for (const ep of endpoints) {
    try {
      const url = `${ep.replace(/\/$/, "")}/api/tags`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        const models: OllamaModelInfo[] = (data.models || []).map((m: any) => ({
          name: m.name,
          size: m.size,
          digest: m.digest,
          modifiedAt: m.modified_at,
        }));
        return {
          connected: true,
          models,
          endpoint: ep,
        };
      }
    } catch {
      // try next endpoint
    }
  }

  return {
    connected: false,
    models: [],
    endpoint: customEndpoint || "/api/ollama",
    error: "Ollama not responding on port 11434. Ensure Ollama is running (`ollama serve`).",
  };
}

export interface GenerateOutfitParams {
  items: Garment[];
  profile?: Profile;
  occasion: string;
  season?: Season | "any";
  customPrompt?: string;
  settings?: AiSettings;
}

/**
 * Main AI outfit generator supporting Ollama and optional Gemini
 */
export async function generateAiOutfit(
  params: GenerateOutfitParams,
): Promise<AiOutfitRecommendation> {
  const settings = params.settings || loadAiSettings();

  if (settings.provider === "gemini" && settings.geminiApiKey?.trim()) {
    return await generateWithGemini(params, settings);
  }

  return await generateWithOllama(params, settings);
}

/**
 * Call local Ollama model (free, no keys needed)
 */
async function generateWithOllama(
  params: GenerateOutfitParams,
  settings: AiSettings,
): Promise<AiOutfitRecommendation> {
  const { items, profile, occasion, season, customPrompt } = params;

  if (items.length < 2) {
    throw new Error("You need at least 2 pieces in your closet to generate an AI outfit.");
  }

  // Determine model
  const modelToUse = settings.ollamaModel || "qwen2.5:3b";

  // Build condensed closet catalog for model context
  const catalog = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.colorName,
    hex: i.colorHex,
    formality: i.formality,
    fabric: i.fabric || "standard",
    seasons: i.seasons,
  }));

  const systemInstructions = `You are the lead personal menswear fashion stylist for "Rewear Radar", an intelligent wardrobe studio.
Your goal is to build an outstanding, elevated, intentional MALE outfit curated exclusively from the user's closet catalog.

CORE STYLING RULES:
1. MENSWEAR FOCUS: Formulate exclusively stylish male outfits. Do not suggest dresses, skirts, blouses, or any women's garments.
2. SELECT REAL PIECES: Pick only IDs that exist in the provided closet catalog.
3. FULL LOOK STRUCTURE: Formulate complete menswear looks with (Top + Bottom + Shoes), and optionally add (Outerwear / Accessories) if appropriate.
4. COLOR HARMONY: Prioritize elegant color relationships (e.g. Earthy Sage + Warm Sand, Midnight Spruce + Emerald Jade, Coral + Buttercream, Plum + Petrol Teal, or soft tonal monochromes).
5. OCCASION FOCUS: Calibrate silhouette and formality strictly for "${occasion}".
${season && season !== "any" ? `6. SEASON FOCUS: Ensure all selected pieces suit the "${season}" season.` : ""}
${profile?.styleNote ? `7. USER STYLE NOTE: "${profile.styleNote}".` : ""}
${customPrompt ? `8. USER SPECIFIC REQUEST: "${customPrompt}".` : ""}

RESPONSE FORMAT:

You MUST output ONLY a valid JSON object with no markdown wrappers or other text:
{
  "title": "Short creative editorial name for the look (e.g. Earthy Spruce & Linen Contrast)",
  "vibe": "Aesthetic style (e.g. Relaxed Minimalist, Smart Casual, Creative Tailored)",
  "selectedPieceIds": ["id1", "id2", "id3"],
  "whyItWorks": "2-3 sentences explaining the silhouette, fabric balance, and why these exact pieces harmonize.",
  "colorHarmony": "1-2 sentences on how the colors interact chromatically (e.g., contrasting jewel tones grounded by neutral sand).",
  "layeringTips": [
    "Practical styling tip 1 (e.g., half-tuck the knit into the waistband)",
    "Practical styling tip 2 (e.g., roll jacket sleeves to forearm)"
  ],
  "accessoryIdeas": [
    "Suggested accessory or footwear styling tip to complete the look"
  ]
}`;

  const prompt = `CLOSET INVENTORY:
${JSON.stringify(catalog, null, 2)}

TASK:
Craft 1 complete high-harmony outfit for "${occasion}".
Output ONLY the JSON object.`;

  // Try endpoints
  const endpoints = [
    settings.ollamaEndpoint || "/api/ollama",
    "http://127.0.0.1:11434",
    "http://localhost:11434",
  ];

  let lastError: Error | null = null;

  for (const ep of endpoints) {
    try {
      const url = `${ep.replace(/\/$/, "")}/api/generate`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelToUse,
          system: systemInstructions,
          prompt: prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Ollama error ${res.status}: ${txt || res.statusText}`);
      }

      const data = await res.json();
      const rawText = data.response;
      const parsed = parseAiResponse(rawText, items);

      return {
        ...parsed,
        modelUsed: modelToUse,
        provider: "ollama",
        createdAt: Date.now(),
      };
    } catch (err: any) {
      lastError = err;
    }
  }

  throw (
    lastError ||
    new Error(
      "Unable to connect to Ollama. Make sure Ollama is running locally (`ollama serve`).",
    )
  );
}

/**
 * Optional Cloud Gemini Generator (if user provides API key)
 */
async function generateWithGemini(
  params: GenerateOutfitParams,
  settings: AiSettings,
): Promise<AiOutfitRecommendation> {
  const { items, profile, occasion, season, customPrompt } = params;
  const apiKey = settings.geminiApiKey.trim();
  const model = settings.geminiModel || "gemini-2.0-flash";

  const catalog = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.colorName,
    hex: i.colorHex,
    formality: i.formality,
    fabric: i.fabric || "standard",
    seasons: i.seasons,
  }));

  const prompt = `You are the lead AI fashion stylist for "Rewear Radar".
Closet items available:
${JSON.stringify(catalog, null, 2)}

Occasion: ${occasion}
${season && season !== "any" ? `Season: ${season}` : ""}
${profile?.styleNote ? `User Style Note: ${profile.styleNote}` : ""}
${customPrompt ? `Specific Request: ${customPrompt}` : ""}

Select real piece IDs from the catalog to build 1 complete, beautiful, color-harmonious look.
Return ONLY a valid JSON object matching:
{
  "title": "Creative outfit name",
  "vibe": "Aesthetic style",
  "selectedPieceIds": ["id1", "id2", "id3"],
  "whyItWorks": "Explanation of styling and silhouette",
  "colorHarmony": "Chromatic interaction explanation",
  "layeringTips": ["Tip 1", "Tip 2"],
  "accessoryIdeas": ["Idea 1"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API error ${res.status}: ${res.statusText}`,
    );
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini returned an empty response.");

  const parsed = parseAiResponse(rawText, items);

  return {
    ...parsed,
    modelUsed: model,
    provider: "gemini",
    createdAt: Date.now(),
  };
}

/**
 * Safely parse AI response and guarantee selected piece IDs exist in wardrobe
 */
function parseAiResponse(
  raw: string,
  closetItems: Garment[],
): Omit<AiOutfitRecommendation, "modelUsed" | "provider" | "createdAt"> {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }

  let obj: any;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    // Attempt relaxed regex extraction
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      obj = JSON.parse(match[0]);
    } else {
      throw new Error("Could not parse AI response as JSON.");
    }
  }

  const validIds = new Set(closetItems.map((i) => i.id));
  let selectedPieceIds: string[] = Array.isArray(obj.selectedPieceIds)
    ? obj.selectedPieceIds.filter((id: string) => validIds.has(id))
    : [];

  // Fallback if AI selected names or invalid IDs
  if (selectedPieceIds.length < 2) {
    // Attempt name-matching
    const candidates = closetItems.filter((item) =>
      cleaned.toLowerCase().includes(item.name.toLowerCase()),
    );
    if (candidates.length >= 2) {
      selectedPieceIds = candidates.slice(0, 4).map((c) => c.id);
    } else {
      // Pick compatible category items as failsafe
      const top = closetItems.find((i) => i.category === "tops");
      const bottom = closetItems.find((i) => i.category === "bottoms");
      const shoes = closetItems.find((i) => i.category === "shoes");
      selectedPieceIds = [top?.id, bottom?.id, shoes?.id].filter(Boolean) as string[];
    }
  }

  return {
    id: `ai-outfit-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    title: String(obj.title || "Curated Editorial Look"),
    vibe: String(obj.vibe || "Modern Harmonious"),
    selectedPieceIds,
    whyItWorks: String(
      obj.whyItWorks ||
        "A balanced combination celebrating complementary color resonance and relaxed proportions.",
    ),
    colorHarmony: String(
      obj.colorHarmony ||
        "The tones interact smoothly, pairing earthy grounding shades with subtle accent highlights.",
    ),
    layeringTips: Array.isArray(obj.layeringTips)
      ? obj.layeringTips.map(String)
      : ["Keep proportions balanced with an effortless tuck."],
    accessoryIdeas: Array.isArray(obj.accessoryIdeas)
      ? obj.accessoryIdeas.map(String)
      : ["Pair with minimal leather accents."],
  };
}
