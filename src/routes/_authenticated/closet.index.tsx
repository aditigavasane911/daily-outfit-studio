import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ItemCard } from "@/components/closet/ItemCard";
import { CATEGORY_LABELS, toggleFavorite, useCloset, type Category } from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/closet/")({
  component: ClosetGrid,
});

function ClosetGrid() {
  const items = useCloset();
  const [filter, setFilter] = useState<Category | "all">("all");

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const tabs: (Category | "all")[] = ["all", ...(Object.keys(CATEGORY_LABELS) as Category[])];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const count =
            tab === "all" ? items.length : items.filter((i) => i.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                filter === tab
                  ? "bg-brand-gradient text-white border-transparent shadow-xs font-semibold"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab === "all" ? "All pieces" : CATEGORY_LABELS[tab]}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="grain-card rounded-2xl p-12 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">
            {items.length === 0
              ? "Your Rewear Radar closet is empty"
              : "Nothing in this category yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {items.length === 0
              ? "Add your first pieces — a top, a bottom, and shoes are enough to start generating intelligent match-ups."
              : "Add a piece in this category and Rewear Radar will automatically compute harmonies and combinations."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
