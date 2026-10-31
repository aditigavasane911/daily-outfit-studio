import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Heart, Layers, Shirt, Radio, Sparkles } from "lucide-react";
import { useCloset } from "@/lib/closet-store";

export const Route = createFileRoute("/_authenticated/closet")({
  head: () => ({
    meta: [
      { title: "My closet — Rewear Radar" },
      { name: "description", content: "Browse every piece in your Rewear Radar digital closet." },
    ],
  }),
  component: ClosetLayout,
});

function ClosetLayout() {
  const items = useCloset();
  const favourites = items.filter((i) => i.favorite).length;
  const categories = new Set(items.map((i) => i.category)).size;

  const stats = [
    {
      icon: Shirt,
      label: "Total Pieces",
      value: items.length,
      colorCls: "bg-[#165B6D]/15 text-[#165B6D]",
      borderCls: "border-l-4 border-l-[#165B6D]",
    },
    {
      icon: Layers,
      label: "Categories",
      value: categories,
      colorCls: "bg-[#199E72]/15 text-[#199E72]",
      borderCls: "border-l-4 border-l-[#199E72]",
    },
    {
      icon: Heart,
      label: "Favourites",
      value: favourites,
      colorCls: "bg-[#EA2F4A]/15 text-[#EA2F4A]",
      borderCls: "border-l-4 border-l-[#EA2F4A]",
    },
    {
      icon: Radio,
      label: "Radar Active",
      value: `${items.length > 0 ? "100%" : "0%"}`,
      colorCls: "bg-[#EF5835]/15 text-[#EF5835]",
      borderCls: "border-l-4 border-l-[#EF5835]",
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Radio className="size-3 text-accent" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Rewear Radar Wardrobe
            </p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Your closet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track, rotate, and style every garment you own.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map(({ icon: Icon, label, value, colorCls, borderCls }) => (
          <div
            key={label}
            className={`grain-card lift flex items-center gap-3.5 rounded-2xl p-4 sm:p-5 ${borderCls}`}
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colorCls}`}
            >
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold leading-none text-foreground">
                {value}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
