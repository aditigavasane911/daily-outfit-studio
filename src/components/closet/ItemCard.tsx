import { Link } from "@tanstack/react-router";
import { Heart, ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORY_LABELS, colorDef, type Garment } from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export function ItemCard({
  item,
  onToggleFavorite,
}: {
  item: Garment;
  onToggleFavorite?: (id: string) => void;
}) {
  const swatch = colorDef(item.colorName);
  return (
    <Link
      to="/closet/$id"
      params={{ id: item.id }}
      className="group grain-card lift block overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center gap-2"
            style={{ backgroundColor: `${swatch.hex}22` }}
          >
            <span
              className="size-14 rounded-full border border-black/10 shadow-inner"
              style={{ backgroundColor: swatch.hex }}
              aria-hidden
            />
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <ImageIcon className="size-3" /> {item.colorName}
            </span>
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(item.id);
            }}
            aria-label={item.favorite ? "Remove from favourites" : "Add to favourites"}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/85 shadow-sm backdrop-blur transition-transform active:scale-90"
          >
            <Heart
              className={cn("size-4", item.favorite ? "fill-accent text-accent" : "text-muted-foreground")}
            />
          </button>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {CATEGORY_LABELS[item.category]}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug text-foreground">{item.name}</h3>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <Chip>{item.colorName}</Chip>
          <Chip>Size {item.size}</Chip>
          <Chip>{item.formality}</Chip>
        </div>
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {children}
    </span>
  );
}
