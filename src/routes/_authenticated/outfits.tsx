import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2, Radio, Bookmark } from "lucide-react";
import { toast } from "sonner";
import {
  generateOutfits,
  useCloset,
  useSavedOutfits,
  toggleSaveOutfit,
  isOutfitSaved,
  type Season,
  type Garment,
  type Outfit,
} from "@/lib/closet-store";
import { cn } from "@/lib/utils";
import { AiStylistView } from "@/components/closet/AiStylistView";

export const Route = createFileRoute("/_authenticated/outfits")({
  validateSearch: (search: Record<string, unknown>): { tab?: "smart" | "saved" | "ai" } => ({
    tab: search["tab"] === "ai" ? "ai" : search["tab"] === "saved" ? "saved" : "smart",
  }),
  head: () => ({
    meta: [
      { title: "Today's match-ups — Rewear Radar" },
      {
        name: "description",
        content: "Intelligent outfit suggestions built from the clothes you already own.",
      },
    ],
  }),
  component: OutfitsPage,
});

const SEASON_FILTERS: (Season | "any")[] = ["any", "spring", "summer", "fall", "winter"];

function OutfitsPage() {
  const search = Route.useSearch();
  const items = useCloset();
  const savedList = useSavedOutfits();
  const [season, setSeason] = useState<Season | "any">("any");
  const [tab, setTab] = useState<"smart" | "saved" | "ai">(search.tab || "smart");

  const outfits = generateOutfits(items, season === "any" ? undefined : season);

  const savedResolvedOutfits: Outfit[] = savedList
    .map((s) => {
      const pieces = s.pieceIds
        .map((pid) => items.find((it) => it.id === pid))
        .filter(Boolean) as Garment[];
      if (pieces.length === 0) return null;
      return {
        id: s.id,
        pieces,
        score: s.score,
        reasons: s.reasons,
      };
    })
    .filter(Boolean) as Outfit[];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Radio className="size-3.5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Radar Daily Pick
            </p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Today's match-ups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Combinations curated from your wardrobe based on chromatic harmony, dress level, and
            season.
          </p>
        </div>

        {tab === "smart" && (
          <div className="flex flex-wrap gap-2">
            {SEASON_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all",
                  season === s
                    ? "bg-brand-gradient text-white border-transparent shadow-xs font-semibold"
                    : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {s === "any" ? "Any season" : s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid max-w-md grid-cols-3 gap-1 rounded-full bg-secondary p-1">
        {(
          [
            { key: "smart", label: "Smart match-ups", icon: Sparkles },
            { key: "saved", label: `Saved (${savedList.length})`, icon: Bookmark },
            { key: "ai", label: "AI stylist", icon: Wand2 },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            data-testid={`tab-${key}`}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-2 text-xs sm:text-sm font-medium transition-colors",
              tab === key
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 sm:size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "smart" ? (
        outfits.length === 0 ? (
          <EmptyMatchups season={season} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {outfits.map((outfit, index) => {
              const saved = isOutfitSaved(outfit.id, outfit.pieces.map((p) => p.id));
              return (
                <article
                  key={outfit.id}
                  className={cn(
                    "grain-card lift relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6",
                    index === 0 && "ring-2 ring-primary/40 shadow-md",
                  )}
                >
                  {/* Top status bar */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {index === 0 ? (
                          <span className="flex items-center gap-1 rounded-full bg-accent-gradient px-2 py-0.5 text-[10px] text-white">
                            <Sparkles className="size-3" /> Top Pick
                          </span>
                        ) : (
                          `Match-up ${index + 1}`
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold capitalize text-secondary-foreground">
                          {outfit.pieces.reduce<Set<string>>(
                            (acc, p) => acc.add(p.formality),
                            new Set(),
                          ).size === 1
                            ? (outfit.pieces[0]?.formality ?? "")
                            : "mixed level"}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            const nowSaved = await toggleSaveOutfit(outfit);
                            toast.success(
                              nowSaved
                                ? "Match-up saved to your collection!"
                                : "Removed from saved match-ups.",
                            );
                          }}
                          title={saved ? "Remove from saved" : "Save this combination"}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors border",
                            saved
                              ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          <Bookmark className={cn("size-3", saved && "fill-current")} />
                          {saved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>

                    {/* Piece Thumbnails in Row */}
                    <div className="mt-5 flex items-center gap-2.5 overflow-x-auto pb-2">
                      {outfit.pieces.map((piece, i) => (
                        <div key={piece.id} className="flex items-center gap-2.5">
                          {i > 0 && <span className="font-bold text-muted-foreground/60">+</span>}
                          <PieceThumb
                            id={piece.id}
                            name={piece.name}
                            hex={piece.colorHex}
                            url={piece.imageUrl}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Reasons styled with palette dots */}
                    <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                      {outfit.reasons.map((reason, ri) => (
                        <li
                          key={reason}
                          className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground"
                        >
                          <span
                            className={cn(
                              "mt-1.5 size-1.5 shrink-0 rounded-full",
                              ri === 0 ? "bg-[#199E72]" : ri === 1 ? "bg-[#EF5835]" : "bg-[#165B6D]",
                            )}
                          />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : tab === "saved" ? (
        savedResolvedOutfits.length === 0 ? (
          <div className="grain-card rounded-2xl p-10 text-center">
            <Bookmark className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <h2 className="font-display text-xl font-semibold">No saved match-ups yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Browse your daily Smart match-ups and click the “Save” button on any look to store it in your collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedResolvedOutfits.map((outfit, index) => (
              <article
                key={outfit.id}
                className="grain-card lift relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Bookmark className="size-3.5 fill-primary text-primary" /> Saved Look {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleSaveOutfit(outfit);
                        toast.success("Removed from saved match-ups.");
                      }}
                      className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 overflow-x-auto pb-2">
                    {outfit.pieces.map((piece, i) => (
                      <div key={piece.id} className="flex items-center gap-2.5">
                        {i > 0 && <span className="font-bold text-muted-foreground/60">+</span>}
                        <PieceThumb
                          id={piece.id}
                          name={piece.name}
                          hex={piece.colorHex}
                          url={piece.imageUrl}
                        />
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                    {outfit.reasons.map((reason, ri) => (
                      <li
                        key={reason}
                        className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            ri === 0 ? "bg-[#199E72]" : ri === 1 ? "bg-[#EF5835]" : "bg-[#165B6D]",
                          )}
                        />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <AiStylistView items={items} season={season} />
      )}
    </div>
  );
}

function PieceThumb({
  name,
  hex,
  url,
  id,
}: {
  name: string;
  hex: string;
  url?: string | undefined;
  id: string;
}) {
  return (
    <div
      title={name}
      className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary sm:size-20"
      data-piece={id}
    >
      {url ? (
        <img src={url} alt={name} loading="lazy" className="size-full object-cover" />
      ) : (
        <div
          className="flex size-full items-center justify-center"
          style={{ backgroundColor: `${hex}22` }}
        >
          <span
            className="size-7 rounded-full border border-black/10"
            style={{ backgroundColor: hex }}
          />
        </div>
      )}
    </div>
  );
}

function EmptyMatchups({ season }: { season: Season | "any" }) {
  const hasShoes = useCloset().some((i) => i.category === "shoes");
  return (
    <div className="grain-card rounded-2xl p-10 text-center">
      <h2 className="font-display text-xl font-semibold">Not enough pieces to match yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {!hasShoes
          ? "Add at least one pair of shoes — every match-up needs footwear."
          : season !== "any"
            ? `No combinations share the ${season} season. Try “Any season”, or add a piece that works for ${season}.`
            : "A top, a bottom and shoes are all Rewear Radar needs to start suggesting looks."}
      </p>
    </div>
  );
}
