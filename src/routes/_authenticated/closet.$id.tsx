import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ItemCard } from "@/components/closet/ItemCard";
import {
  CATEGORY_LABELS,
  colorDef,
  pairWith,
  removeItem,
  toggleFavorite,
  useCloset,
} from "@/lib/closet-store";

export const Route = createFileRoute("/_authenticated/closet/$id")({
  head: () => ({
    meta: [{ title: "Piece Details — Rewear Radar" }],
  }),
  component: PieceDetail,
});

function PieceDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const items = useCloset();
  const item = items.find((g) => g.id === id);

  if (!item) {
    return (
      <div className="grain-card mx-auto max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-xl font-semibold">
          This piece is no longer in your closet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed.</p>
        <Link
          to="/closet"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to closet
        </Link>
      </div>
    );
  }

  const swatch = colorDef(item.colorName);
  const pairs = pairWith(item, items);

  const handleRemove = () => {
    removeItem(item.id);
    toast("Removed from your closet.");
    navigate({ to: "/closet", replace: true });
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate({ to: "/closet" })}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to closet
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="grain-card overflow-hidden rounded-2xl">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div
              className="flex aspect-square w-full flex-col items-center justify-center gap-3"
              style={{ backgroundColor: `${swatch.hex}22` }}
            >
              <span
                className="size-24 rounded-full border border-black/10 shadow-inner"
                style={{ backgroundColor: swatch.hex }}
                aria-hidden
              />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {item.colorName}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {CATEGORY_LABELS[item.category]}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{item.name}</h1>
            {item.brand && <p className="mt-1 text-sm text-muted-foreground">{item.brand}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip>{item.colorName}</Chip>
            <Chip>Size {item.size}</Chip>
            <Chip className="capitalize">{item.formality}</Chip>
            {item.seasons.map((s) => (
              <Chip key={s} className="capitalize">
                {s}
              </Chip>
            ))}
            {item.fabric && <Chip>{item.fabric}</Chip>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleFavorite(item.id)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-input py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Heart className={item.favorite ? "size-4 fill-accent text-accent" : "size-4"} />
              {item.favorite ? "Favourited" : "Add to favourites"}
            </button>
            <button
              onClick={handleRemove}
              aria-label="Remove piece"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Pairs well with</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chosen from your closet by colour harmony, season and dress level.
        </p>
        {pairs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Add more pieces — tops, bottoms, shoes or a jacket — and Rewear Radar will start pairing them
            with this one.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pairs.map(({ piece, note }) => (
              <div key={piece.id} className="space-y-2">
                <ItemCard item={piece} />
                <p className="px-1 text-xs leading-snug text-muted-foreground">
                  {note.startsWith("Studio Palette harmony") ? (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Sparkles className="size-3 text-accent shrink-0" />
                      {note}
                    </span>
                  ) : (
                    note
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
