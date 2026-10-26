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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const count = tab === "all" ? items.length : items.filter((i) => i.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === tab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab === "all" ? "All" : CATEGORY_LABELS[tab]}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="grain-card rounded-2xl p-10 text-center">
          <h2 className="font-display text-xl font-semibold">
            {items.length === 0 ? "Your closet is empty" : "Nothing in this category yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {items.length === 0
              ? "Add your first pieces — a top, a bottom and shoes are enough to start getting match-ups."
              : "Add a piece in this category and Drape will start pairing it for you."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
