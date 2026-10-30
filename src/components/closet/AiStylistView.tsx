import { useState, useEffect } from "react";
import {
  Wand2,
  Sparkles,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Settings2,
  Key,
  Layers,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkOllamaConnection,
  generateAiOutfit,
  loadAiSettings,
  saveAiSettings,
  type AiOutfitRecommendation,
  type AiSettings,
  type OllamaStatus,
} from "@/lib/ai-stylist-service";
import {
  CATEGORY_LABELS,
  colorDef,
  useProfile,
  type Garment,
  type Season,
} from "@/lib/closet-store";
import { cn } from "@/lib/utils";

const OCCASIONS = [
  { label: "Smart Coffee Meetup", icon: "☕" },
  { label: "Office & Work Presentation", icon: "💼" },
  { label: "Casual Weekend Walk", icon: "🌿" },
  { label: "Evening Dinner & Drinks", icon: "🍷" },
  { label: "Creative Studio & Gallery", icon: "🎨" },
  { label: "Breezy Seasonal Layering", icon: "🧥" },
];

interface AiStylistViewProps {
  items: Garment[];
  season: Season | "any";
}

export function AiStylistView({ items, season }: AiStylistViewProps) {
  const profile = useProfile();
  const [settings, setSettings] = useState<AiSettings>(loadAiSettings());
  const [status, setStatus] = useState<OllamaStatus>({
    connected: false,
    models: [],
    endpoint: "/api/ollama",
  });
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const [occasion, setOccasion] = useState(OCCASIONS[0].label);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<AiOutfitRecommendation | null>(null);
  const [history, setHistory] = useState<AiOutfitRecommendation[]>(() => {
    try {
      const raw = localStorage.getItem("rewear_radar:ai_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Verify Ollama on mount
  useEffect(() => {
    refreshConnection();
  }, []);

  const refreshConnection = async () => {
    setCheckingStatus(true);
    try {
      const res = await checkOllamaConnection(settings.ollamaEndpoint);
      setStatus(res);
      // Auto-select first detected model if current selection isn't in list
      if (res.connected && res.models.length > 0) {
        const hasCurrent = res.models.some((m) => m.name === settings.ollamaModel);
        if (!hasCurrent) {
          const nextModel = res.models[0].name;
          const updated = saveAiSettings({ ollamaModel: nextModel });
          setSettings(updated);
        }
      }
    } catch (err) {
      setStatus({
        connected: false,
        models: [],
        endpoint: settings.ollamaEndpoint,
        error: String(err),
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleGenerate = async () => {
    if (items.length < 2) {
      toast.error("Add at least 2 pieces to your closet before styling looks.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAiOutfit({
        items,
        profile,
        occasion,
        season,
        customPrompt: customPrompt.trim() || undefined,
        settings,
      });

      setCurrentOutfit(result);
      const nextHistory = [result, ...history.filter((h) => h.id !== result.id)].slice(0, 8);
      setHistory(nextHistory);
      localStorage.setItem("rewear_radar:ai_history", JSON.stringify(nextHistory));
      toast.success(`Generated: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not generate outfit. Please check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWearLook = (outfit: AiOutfitRecommendation) => {
    toast.success(`Look "${outfit.title}" logged for today! Rewear Radar updated.`);
  };

  // Find garments chosen by the AI
  const selectedPieces = currentOutfit
    ? currentOutfit.selectedPieceIds
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as Garment[]
    : [];

  return (
    <div className="w-full space-y-6">
      {/* Top Engine Status Bar */}
      <div className="grain-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-xs">
              <Wand2 className="size-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold text-foreground">
                  AI Stylist Engine
                </span>
                {settings.provider === "ollama" ? (
                  status.connected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#199E72]/15 px-2.5 py-0.5 text-xs font-semibold text-[#199E72]">
                      <span className="size-2 rounded-full bg-[#199E72] animate-pulse" />
                      Ollama Local (Free • Connected)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF5835]/15 px-2.5 py-0.5 text-xs font-semibold text-[#EF5835]">
                      <span className="size-2 rounded-full bg-[#EF5835]" />
                      Ollama Offline
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    <Key className="size-3" />
                    Cloud Gemini Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.provider === "ollama"
                  ? status.connected
                    ? `Running on local model: ${settings.ollamaModel}`
                    : "Local service not detected on :11434"
                  : `Model: ${settings.geminiModel}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings.provider === "ollama" && status.connected && status.models.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:inline">Model:</span>
              <select
                value={settings.ollamaModel}
                onChange={(e) => {
                  const updated = saveAiSettings({ ollamaModel: e.target.value });
                  setSettings(updated);
                  toast.info(`Model switched to ${e.target.value}`);
                }}
                className="rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                {status.models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={refreshConnection}
            title="Refresh Ollama status"
            disabled={checkingStatus}
            className="flex size-8 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", checkingStatus && "animate-spin")} />
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium transition",
              showConfig ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
            )}
          >
            <Settings2 className="size-3.5" />
            Config
          </button>
        </div>
      </div>

      {/* Optional Configuration Card */}
      {showConfig && (
        <div className="grain-card space-y-4 rounded-2xl border border-primary/25 p-5 sm:p-6 bg-card/60 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">AI Provider Configuration</h3>
            <span className="text-xs text-muted-foreground">Free local or cloud AI keys</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Provider Switch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Engine Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = saveAiSettings({ provider: "ollama" });
                    setSettings(u);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition",
                    settings.provider === "ollama"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-card text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Cpu className="size-3.5" /> Local Ollama (Free)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = saveAiSettings({ provider: "gemini" });
                    setSettings(u);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition",
                    settings.provider === "gemini"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-card text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Key className="size-3.5" /> Cloud Gemini Key
                </button>
              </div>
            </div>

            {/* Provider Details */}
            {settings.provider === "ollama" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ollama Model & Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.ollamaModel}
                    onChange={(e) => {
                      const u = saveAiSettings({ ollamaModel: e.target.value });
                      setSettings(u);
                    }}
                    placeholder="e.g. qwen2.5:3b or llama3:latest"
                    className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={refreshConnection}
                    className="rounded-xl border border-input bg-secondary px-3 py-2 text-xs font-semibold hover:bg-secondary/80"
                  >
                    Test
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Detected models: {status.models.map((m) => m.name).join(", ") || "None currently detected"}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => {
                    const u = saveAiSettings({ geminiApiKey: e.target.value });
                    setSettings(u);
                  }}
                  placeholder="Paste free Gemini API key here..."
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline text-primary">aistudio.google.com</a>. Saved only in your browser.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Stylist Prompting Bar */}
      <div className="grain-card space-y-6 rounded-2xl p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Curated Outfit Synthesis
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Where are you heading today?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a style destination or describe your mood. The AI stylist evaluates your wardrobe palette, fit, and seasonality.
          </p>
        </div>

        {/* Occasion chips */}
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.label}
              type="button"
              onClick={() => setOccasion(occ.label)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95",
                occasion === occ.label
                  ? "bg-brand-gradient text-white border-transparent shadow-xs font-semibold"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span>{occ.icon}</span>
              <span>{occ.label}</span>
            </button>
          ))}
        </div>

        {/* Custom prompt input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Styling Note (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
              placeholder="e.g. Include my sage jacket with casual sneakers, or create a cozy oversized vibe..."
              className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Styling Look...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate AI Look
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help text for Ollama connection if offline */}
        {settings.provider === "ollama" && !status.connected && (
          <div className="flex items-start gap-3 rounded-xl border border-[#EF5835]/30 bg-[#EF5835]/10 p-3.5 text-xs text-foreground">
            <AlertCircle className="size-4 text-[#EF5835] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#EF5835]">Local Ollama is not connected yet</p>
              <p className="text-muted-foreground">
                To run free local AI: open your terminal and run <code className="rounded bg-black/10 px-1.5 py-0.5 text-foreground font-mono">ollama serve</code> or launch Ollama from your desktop. You already have <code className="font-semibold text-foreground">qwen2.5:3b</code> and <code className="font-semibold text-foreground">llama3:latest</code> installed!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generated Outfit Result Showcase */}
      {currentOutfit && (
        <article className="grain-card overflow-hidden rounded-2xl border-2 border-primary/40 shadow-lg animate-in fade-in duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-secondary to-accent/10 p-6 sm:p-8 border-b border-border">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-accent-gradient px-3 py-1 text-xs font-bold text-white shadow-xs">
                  {currentOutfit.vibe}
                </span>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                  {currentOutfit.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Engine: {currentOutfit.modelUsed} ({currentOutfit.provider === "ollama" ? "Local Ollama" : "Cloud Gemini"}) · Calibrated for {occasion}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWearLook(currentOutfit)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:opacity-95 active:scale-95"
                >
                  <CalendarCheck className="size-4" /> Wear today
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-full border border-input bg-card px-4 py-2.5 text-xs sm:text-sm font-medium transition hover:bg-secondary active:scale-95"
                >
                  <RefreshCw className={cn("size-3.5", isGenerating && "animate-spin")} /> Another option
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Pieces Grid */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Selected Pieces from Your Wardrobe ({selectedPieces.length})
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {selectedPieces.map((piece) => {
                  const swatch = colorDef(piece.colorName);
                  return (
                    <div
                      key={piece.id}
                      className="group overflow-hidden rounded-xl border border-border bg-card p-3 shadow-2xs transition hover:border-primary/50"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                        {piece.imageUrl ? (
                          <img
                            src={piece.imageUrl}
                            alt={piece.name}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="flex size-full flex-col items-center justify-center gap-2"
                            style={{ backgroundColor: `${swatch.hex}22` }}
                          >
                            <span
                              className="size-12 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {piece.colorName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {CATEGORY_LABELS[piece.category]}
                        </span>
                        <p className="font-display text-sm font-semibold line-clamp-1 text-foreground">
                          {piece.name}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
                          <span
                            className="size-2 rounded-full border border-black/15"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span>{piece.colorName}</span>
                          <span>·</span>
                          <span className="capitalize">{piece.formality}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stylist Breakdown Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <h4 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                    <Sparkles className="size-4 text-accent" />
                    Why This Look Works
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {currentOutfit.whyItWorks}
                  </p>
                </div>

                <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
                  <h4 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                    <Layers className="size-4 text-accent" />
                    Chromatic & Texture Harmony
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {currentOutfit.colorHarmony}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h4 className="font-display text-sm font-bold text-foreground mb-3">
                    Stylist Layering & Fit Guidance
                  </h4>
                  <ul className="space-y-2.5">
                    {currentOutfit.layeringTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 text-[#199E72] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentOutfit.accessoryIdeas?.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h4 className="font-display text-sm font-bold text-foreground mb-2">
                      Finishing Touches & Accessories
                    </h4>
                    <ul className="space-y-1.5">
                      {currentOutfit.accessoryIdeas.map((acc, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-accent" />
                          <span>{acc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      )}

      {/* History of Past AI Looks */}
      {history.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">
              Recent AI Match-Ups ({history.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("rewear_radar:ai_history");
                toast("History cleared.");
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Clear history
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((h) => {
              const matched = h.selectedPieceIds
                .map((id) => items.find((i) => i.id === id))
                .filter(Boolean) as Garment[];

              return (
                <div
                  key={h.id}
                  onClick={() => setCurrentOutfit(h)}
                  className="grain-card group lift cursor-pointer space-y-3 rounded-2xl p-5 border border-border hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                      {h.vibe}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition">
                    {h.title}
                  </h4>

                  <div className="flex items-center gap-2">
                    {matched.map((p) => {
                      const swatch = colorDef(p.colorName);
                      return (
                        <div
                          key={p.id}
                          title={p.name}
                          className="size-10 overflow-hidden rounded-lg border border-border bg-secondary"
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                          ) : (
                            <div
                              className="size-full flex items-center justify-center"
                              style={{ backgroundColor: `${swatch.hex}33` }}
                            >
                              <span
                                className="size-4 rounded-full border border-black/10"
                                style={{ backgroundColor: swatch.hex }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {h.whyItWorks}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
