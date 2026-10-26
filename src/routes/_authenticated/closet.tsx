import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Heart, Layers, Shirt } from "lucide-react";
import { useCloset } from "@/lib/closet-store";

export const Route = createFileRoute("/_authenticated/closet")({
  head: () => ({
    meta: [
      { title: "My closet — Drape" },
      { name: "description", content: "Browse every piece in your digital closet." },
    ],
  }),
  component: ClosetLayout,
});

function ClosetLayout() {
  const items = useCloset();
  const favourites = items.filter((i) => i.favorite).length;
  const categories = new Set(items.map((i) => i.category)).size;

  const stats = [
    { icon: Shirt, label: "Pieces", value: items.length },
    { icon: Layers, label: "Categories", value: categories },
    { icon: Heart, label: "Favourites", value: favourites },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Wardrobe</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your closet
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="grain-card flex items-center gap-3 rounded-2xl p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-xl font-semibold leading-none">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
