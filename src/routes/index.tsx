import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hanger, ScanLine, Sparkles, CalendarClock } from "lucide-react";
import knitImg from "@/assets/garment-knit.png";
import jacketImg from "@/assets/garment-jacket.png";
import dressImg from "@/assets/garment-dress.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drape — Your Daily Digital Closet" },
      {
        name: "description",
        content:
          "Add the clothes you own to a private digital closet and get daily match-up suggestions built from your own wardrobe.",
      },
      { property: "og:title", content: "Drape — Your Daily Digital Closet" },
      {
        property: "og:description",
        content:
          "Add the clothes you own to a private digital closet and get daily match-up suggestions built from your own wardrobe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: ScanLine,
    title: "Add what you own",
    body: "Snap a photo or just note the details — colour, size, season, how dressy it is.",
  },
  {
    icon: Sparkles,
    title: "Get match-ups",
    body: "Drape pairs your pieces by colour harmony, season and dress level, and explains why they work.",
  },
  {
    icon: CalendarClock,
    title: "Wear it today",
    body: "Open the app each morning, pick today's match-up, and reach for clothes you already love.",
  },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Hanger className="size-4" strokeWidth={1.75} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Drape</span>
        </div>
        <Link
          to="/auth"
          className="rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Your wardrobe, digitised
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            Every piece you own,
            <span className="block italic text-accent">worn to its fullest.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Drape keeps a private record of your clothes and suggests the best match-ups from
            your own closet each day — no shopping, no noise, just what you already have.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open my closet <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how"
              className="rounded-full border border-input px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          <figure className="grain-card overflow-hidden rounded-2xl">
            <img src={dressImg} alt="Terracotta linen midi dress" width={1024} height={1024} className="aspect-[4/5] w-full object-cover" />
          </figure>
          <figure className="grain-card mt-10 overflow-hidden rounded-2xl">
            <img src={knitImg} alt="Cream oversized wool knit" loading="lazy" width={1024} height={1024} className="aspect-[4/5] w-full object-cover" />
          </figure>
          <figure className="grain-card col-span-2 -mt-2 overflow-hidden rounded-2xl">
            <img src={jacketImg} alt="Sage utility jacket" loading="lazy" width={1024} height={1024} className="aspect-[16/9] w-full object-cover" />
          </figure>
        </div>
      </section>

      <section id="how" className="ink-rule">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            A daily ritual, not a shopping app
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="grain-card rounded-2xl p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ink-rule bg-secondary/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Start with five pieces
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              You don't need to catalogue everything at once. Add a top, a bottom and shoes —
              Drape starts matching straight away.
            </p>
          </div>
          <Link
            to="/auth"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Create my closet <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="ink-rule">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} Drape</span>
          <span>Wear what you own.</span>
        </div>
      </footer>
    </div>
  );
}
