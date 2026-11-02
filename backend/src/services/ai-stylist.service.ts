import { config } from "../config/env.js";
import type { Garment, Profile, Season, AiOutfitRecommendation } from "../types/index.js";

export interface GenerateAiParams {
  items: Garment[];
  profile?: Profile | null;
  occasion: string;
  season?: Season | "any";
  customPrompt?: string;
  provider?: "ollama" | "gemini";
  model?: string;
}

export async function checkOllamaHealth(): Promise<{
  connected: boolean;
  endpoint: string;
  models: string[];
}> {
  const endpoint = config.ai.ollamaEndpoint || "http://127.0.0.1:11434";
  try {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const models = (data.models || []).map((m) => m.name);
      return { connected: true, endpoint, models };
    }
  } catch {
    // not reachable
  }
  return { connected: false, endpoint, models: [] };
}

export async function generateOutfitRecommendation(
  params: GenerateAiParams,
): Promise<AiOutfitRecommendation> {
  const { items, profile, occasion, season, customPrompt } = params;

  if (items.length < 2) {
    throw new Error("At least 2 garments in wardrobe are required to generate an AI outfit.");
  }

  const provider = params.provider || (config.ai.geminiApiKey ? "gemini" : "ollama");

  if (provider === "gemini" && config.ai.geminiApiKey) {
    return await generateWithGemini(params);
  }

  return await generateWithOllama(params);
}

async function generateWithOllama(params: GenerateAiParams): Promise<AiOutfitRecommendation> {
  const { items, profile, occasion, season, customPrompt } = params;
  const endpoint = config.ai.ollamaEndpoint || "http://127.0.0.1:11434";
  const model = params.model || config.ai.ollamaModel || "qwen2.5:3b";

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
Formulate an outstanding, elevated, intentional MALE outfit curated exclusively from the user's closet catalog.
Output ONLY a valid JSON object matching:
{
  "title": "Creative outfit editorial title",
  "vibe": "Aesthetic style (e.g. Modern Minimalist, Relaxed Tailoring)",
  "selectedPieceIds": ["id1", "id2", "id3"],
  "whyItWorks": "Explanation of silhouette, fabric balance, and aesthetic harmony.",
  "colorHarmony": "Chromatic explanation of the palette combination.",
  "layeringTips": ["Tip 1", "Tip 2"],
  "accessoryIdeas": ["Footwear/accessory suggestion"]
}`;

  const prompt = `CLOSET CATALOG:
${JSON.stringify(catalog, null, 2)}

Occasion: ${occasion}
${season && season !== "any" ? `Season: ${season}` : ""}
${profile?.styleNote ? `User Style Note: ${profile.styleNote}` : ""}
${customPrompt ? `Special Request: ${customPrompt}` : ""}

Select real piece IDs from the catalog to craft 1 cohesive, high-harmony look. Output ONLY JSON.`;

  const res = await fetch(`${endpoint.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: systemInstructions,
      prompt,
      stream: false,
      format: "json",
      options: { temperature: 0.7 },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Ollama generation error ${res.status}: ${txt || res.statusText}`);
  }

  const data = (await res.json()) as { response: string };
  const parsed = parseAiOutput(data.response, items);

  return {
    ...parsed,
    modelUsed: model,
    provider: "ollama",
    createdAt: Date.now(),
  };
}

async function generateWithGemini(params: GenerateAiParams): Promise<AiOutfitRecommendation> {
  const { items, profile, occasion, season, customPrompt } = params;
  const apiKey = config.ai.geminiApiKey;
  const model = params.model || config.ai.geminiModel || "gemini-2.0-flash";

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

  const prompt = `You are the lead menswear fashion stylist for "Rewear Radar".
Wardrobe items:
${JSON.stringify(catalog, null, 2)}

Occasion: ${occasion}
${season && season !== "any" ? `Season: ${season}` : ""}
${profile?.styleNote ? `Style Note: ${profile.styleNote}` : ""}
${customPrompt ? `Request: ${customPrompt}` : ""}

Select real piece IDs from the wardrobe to build 1 complete color-harmonious look.
Return ONLY a valid JSON object matching:
{
  "title": "Editorial title",
  "vibe": "Style aesthetic",
  "selectedPieceIds": ["id1", "id2", "id3"],
  "whyItWorks": "Styling rationale",
  "colorHarmony": "Color resonance explanation",
  "layeringTips": ["Tip 1"],
  "accessoryIdeas": ["Idea 1"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(errorData.error?.message || `Gemini API error ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini returned an empty response.");

  const parsed = parseAiOutput(rawText, items);

  return {
    ...parsed,
    modelUsed: model,
    provider: "gemini",
    createdAt: Date.now(),
  };
}

function parseAiOutput(
  raw: string,
  closetItems: Garment[],
): Omit<AiOutfitRecommendation, "modelUsed" | "provider" | "createdAt"> {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }

  interface RawResult {
    title?: string;
    vibe?: string;
    selectedPieceIds?: unknown;
    whyItWorks?: string;
    colorHarmony?: string;
    layeringTips?: unknown;
    accessoryIdeas?: unknown;
  }

  let obj: RawResult;
  try {
    obj = JSON.parse(cleaned) as RawResult;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      obj = JSON.parse(match[0]) as RawResult;
    } else {
      throw new Error("Unable to parse AI response as valid JSON.");
    }
  }

  const validIds = new Set(closetItems.map((i) => i.id));
  let selectedPieceIds: string[] = Array.isArray(obj.selectedPieceIds)
    ? (obj.selectedPieceIds.filter(
        (id): id is string => typeof id === "string" && validIds.has(id),
      ) as string[])
    : [];

  if (selectedPieceIds.length < 2) {
    const top = closetItems.find((i) => i.category === "tops");
    const bottom = closetItems.find((i) => i.category === "bottoms");
    const shoes = closetItems.find((i) => i.category === "shoes");
    selectedPieceIds = [top?.id, bottom?.id, shoes?.id].filter(Boolean) as string[];
  }

  return {
    id: `ai-outfit-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    title: String(obj.title || "Curated Editorial Look"),
    vibe: String(obj.vibe || "Modern Harmonious"),
    selectedPieceIds,
    whyItWorks: String(
      obj.whyItWorks || "A balanced combination celebrating complementary tonal resonance.",
    ),
    colorHarmony: String(
      obj.colorHarmony || "The shades interact smoothly, pairing earthy tones with neutral grounding.",
    ),
    layeringTips: Array.isArray(obj.layeringTips)
      ? obj.layeringTips.map(String)
      : ["Keep proportions balanced with an effortless tuck."],
    accessoryIdeas: Array.isArray(obj.accessoryIdeas)
      ? obj.accessoryIdeas.map(String)
      : ["Pair with minimal leather accents."],
  };
}
