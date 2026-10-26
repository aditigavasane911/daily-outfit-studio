import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { generateOutfits, useCloset, type Season } from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/outfits")({
  head: () => ({
    meta: [
      { title: "Today's match-ups — Drape" },
      { name: "description", content: "Outfit suggestions built from the clothes you already own." },
    ],
  }),
  component: OutfitsPage,
});

const SEASON_FILTERS: (Season | "any")[] = ["any", "spring", "summer", "fall", "winter"];

function OutfitsPage() {
  const items = useCloset();
  const [season, setSeason] = useState<Season | "any">("any");
  const [tab, setTab] = useState<"smart" | "ai">("smart");

  const outfits = generateOutfits(items, season === "any" ? undefined : season);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Daily pick</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Today's match-ups
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEASON_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                season === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {s === "any" ? "Any season" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-w-md grid-cols-2 gap-1 rounded-full bg-secondary p-1">
        {(
          [
            { key: "smart", label: "Smart match-ups", icon: Sparkles },
            { key: "ai", label: "AI stylist", icon: Wand2 },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "smart" ? (
        outfits.length === 0 ? (
          <EmptyMatchups season={season} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {outfits.map((outfit, index) => (
              <article key={outfit.id} className="grain-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {index === 0 ? "Top pick" : `Match-up ${index + 1}`}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium capitalize">
                    {outfit.pieces.reduce<Set<string>>(
                      (acc, p) => acc.add(p.formality),
                      new Set(),
                    ).size === 1
                      ? outfit.pieces[0].formality
                      : "mixed dress level"}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {outfit.pieces.map((piece, i) => (
                    <div key={piece.id} className="flex items-center gap-2">
                      {i > 0 && <span className="text-muted-foreground">+</span>}
                      <PieceThumb id={piece.id} name={piece.name} hex={piece.colorHex} url={piece.imageUrl} />
                    </div>
                  ))}
                </div>
                <ul className="mt-4 space-y-1.5">
                  {outfit.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="grain-card max-w-xl rounded-2xl p-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Wand2 className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold">AI stylist — coming next</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Once the backend is connected, the AI stylist will study your photos and details to write
            full outfit ideas — layered looks, accessories and a note on what to wear them for. The
            smart match-ups you see now are the rule-based foundation it will build on.
          </p>
        </div>
      )}
    </div>
  );
}

function PieceThumb({ name, hex, url, id }: { name: string; hex: string; url?: string; id: string }) {
  return (
    <div
      title={name}
      className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary sm:size-20"
      data-piece={id}
    >
      {url ? (
        <img src={url} alt={name} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center" style={{ backgroundColor: `${hex}22` }}>
          <span className="size-7 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
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
            : "A top, a bottom and shoes — or a dress and shoes — is all Drape needs to start suggesting looks."}
      </p>
    </div>
  );
}
