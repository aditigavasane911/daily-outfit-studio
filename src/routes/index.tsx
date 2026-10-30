import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ScanLine, Sparkles, CalendarClock, Radio, RefreshCw, Layers, ShieldCheck } from "lucide-react";
import knitImg from "@/assets/garment-knit.png";
import jacketImg from "@/assets/garment-jacket.png";
import shirtImg from "@/assets/garment-shirt.png";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rewear Radar — Your Intelligent Wardrobe & Outfit Studio" },
      {
        name: "description",
        content:
          "Rewear Radar digitizes your closet and crafts high-harmony daily match-ups from the clothes you already own.",
      },
      { property: "og:title", content: "Rewear Radar — Your Intelligent Wardrobe & Outfit Studio" },
      {
        property: "og:description",
        content:
          "Rewear Radar digitizes your closet and crafts high-harmony daily match-ups from the clothes you already own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Radio,
    title: "Rewear Intelligence",
    body: "Radar tracks garment rotation and wear frequency so your best clothes never get pushed to the back of the closet.",
    accent: "from-[#165B6D] to-[#199E72]",
    pill: "Smart Tracking",
  },
  {
    icon: Sparkles,
    title: "Editorial Color Harmony",
    body: "Built-in chromatic science pairs contrasting jewel tones, warm terracotta accents, and soft linen neutrals with intention.",
    accent: "from-[#EF5835] to-[#E29F17]",
    pill: "Color Science",
  },
  {
    icon: CalendarClock,
    title: "Daily Match-Up Ritual",
    body: "Wake up to fresh combination suggestions calibrated for season, formality level, and color balance in 10 seconds.",
    accent: "from-[#57ABAD] to-[#DDF4BA]",
    pill: "Zero Effort",
  },
  {
    icon: ShieldCheck,
    title: "100% Private Wardrobe",
    body: "No social feed, no ads, no shopping push. Just an intentional personal studio dedicated to wearing what you own.",
    accent: "from-[#5E3C66] to-[#257C93]",
    pill: "Sustainable",
  },
] as const;

function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Top Banner */}
      <div className="w-full bg-brand-gradient py-2 px-4 text-center text-xs font-semibold tracking-wide text-white">
        <span>✨ Rewear Radar · Unlock your wardrobe's fullest potential with intelligent color matching</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Rewear Radar Logo"
              className="size-10 rounded-xl object-contain shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Rewear Radar
              </span>
              <span className="-mt-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Second Life Fashion Discovery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auth"
              className="rounded-full border border-input bg-card px-5 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="hidden rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-xs transition-transform hover:opacity-95 sm:inline-flex"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Edge to Edge */}
      <section className="relative w-full overflow-hidden border-b border-border py-12 lg:py-20 px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-[#165B6D]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 size-96 rounded-full bg-[#EF5835]/10 blur-3xl" />

        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Radio className="size-3.5 text-accent animate-pulse" />
              <span>Smart Wardrobe Digitization & Match-up Engine</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
              Every piece you own,{" "}
              <span className="block text-gradient-accent">styled on radar.</span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Rewear Radar turns your clothes into a high-resonance digital wardrobe. Get daily match-ups balanced by color harmony, formality, and season — reach for pieces you love, wear them more, and buy less.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-gradient px-7 py-3.5 text-base font-semibold text-white shadow-md transition-transform hover:opacity-95 active:scale-95"
              >
                Open my closet <ArrowRight className="size-4.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Explore Features
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#199E72]" /> No purchases required
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#EF5835]" /> 10 Studio color harmonies
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#165B6D]" /> Private & personal
              </div>
            </div>
          </div>

          {/* Hero Visual Cards */}
          <div className="relative w-full">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <figure className="grain-card group relative overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src={shirtImg}
                  alt="Coral Red linen button-down shirt"
                  width={1024}
                  height={1024}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 text-white">
                  <span className="inline-block rounded-full bg-[#EF564B] px-2.5 py-0.5 text-[11px] font-semibold">
                    Coral Red · Shirt
                  </span>
                  <p className="mt-1 text-sm font-medium">Linen button-down shirt</p>
                </div>
              </figure>

              <figure className="grain-card group relative mt-8 overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src={knitImg}
                  alt="Buttercream oversized wool knit"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 text-white">
                  <span className="inline-block rounded-full bg-[#165B6D] px-2.5 py-0.5 text-[11px] font-semibold">
                    Buttercream · Tops
                  </span>
                  <p className="mt-1 text-sm font-medium">Oversized wool knit</p>
                </div>
              </figure>

              <figure className="grain-card group relative col-span-2 overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src={jacketImg}
                  alt="Earthy sage utility jacket"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[18/8] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <div>
                    <span className="rounded-full bg-[#199E72] px-2.5 py-0.5 text-[11px] font-semibold">
                      Earthy Sage · Outerwear
                    </span>
                    <p className="mt-1 text-sm font-medium">Sage utility jacket</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-xs">
                    <Sparkles className="size-3 text-[#E29F17]" />
                    <span>Pairs with Warm Sand</span>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Full Width */}
      <section id="features" className="w-full py-16 lg:py-24 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Core Architecture
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            A wardrobe radar, not a fast-fashion shop
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            Every feature is engineered to make rediscovering what you own satisfying, effortless, and creatively inspiring.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body, accent, pill }) => (
            <div
              key={title}
              className="grain-card lift relative flex flex-col justify-between rounded-2xl border border-border p-6 sm:p-7 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-xs`}>
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                    {pill}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <span className="text-xs font-medium text-primary flex items-center gap-1">
                  Radar capability <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Width CTA Banner */}
      <section className="w-full border-t border-border bg-gradient-to-r from-[#165B6D]/10 via-[#199E72]/10 to-[#EF5835]/10 py-16 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Ready to radar your wardrobe?
            </h2>
            <p className="text-base text-muted-foreground">
              Start with just five pieces: a top, a bottom, and a pair of shoes. Rewear Radar immediately computes your color matches and styling combos.
            </p>
          </div>
          <Link
            to="/auth"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent-gradient px-8 py-4 text-base font-bold text-white shadow-md transition-transform hover:opacity-95 active:scale-95"
          >
            Launch My Radar <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* Full Width Footer */}
      <footer className="w-full border-t border-border bg-background py-8 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Rewear Radar Logo"
              className="size-7 rounded-md object-contain"
            />
            <span className="font-bold text-foreground">Rewear Radar</span>
            <span>— Second Life Fashion Discovery</span>
          </div>
          <span>© {new Date().getFullYear()} Rewear Radar Studio. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
