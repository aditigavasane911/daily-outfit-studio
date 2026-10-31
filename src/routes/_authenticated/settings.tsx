import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LogOut, Sparkles, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  COLOR_PRESETS,
  STUDIO_PALETTES,
  signOut,
  updateProfile,
  useProfile,
  useSession,
} from "@/lib/closet-store";
import { ThemeSelector } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Rewear Radar" },
      { name: "description", content: "Tune what Rewear Radar knows about your wardrobe style." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const session = useSession();
  const profile = useProfile();
  const [name, setName] = useState(profile.name);
  const [sizes, setSizes] = useState(profile.sizes);
  const [budget, setBudget] = useState(profile.budget);
  const [styleNote, setStyleNote] = useState(profile.styleNote);
  const [colors, setColors] = useState<string[]>(profile.favoriteColors);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setSizes(profile.sizes);
    setBudget(profile.budget);
    setStyleNote(profile.styleNote);
    setColors(profile.favoriteColors);
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      updateProfile({ name, sizes, budget, styleNote, favoriteColors: colors });
      toast.success("Preferences saved to your profile.");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Account</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure sizing, palette preferences, theme appearance, and wardrobe parameters.
        </p>
      </div>

      <section className="grain-card space-y-4 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Palette className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Theme & Studio Aesthetic
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose your preferred Rewear Radar mode (Light Warm Sand or Dark Midnight Obsidian).
            </p>
          </div>
        </div>

        <ThemeSelector />
      </section>

      <section className="grain-card space-y-5 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-foreground">Style profile</h2>
        <p className="-mt-3 text-sm text-muted-foreground">
          These preferences shape your future daily outfit combinations.
        </p>

        <Field label="Display name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={session?.name}
            className={inputCls}
          />
        </Field>

        <Field label="Your sizes">
          <input
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="Tops M · Bottoms 32 · Shoes 8"
            className={inputCls}
          />
        </Field>

        <Field label="Favourite colours">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => {
              const on = colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() =>
                    setColors(on ? colors.filter((x) => x !== c.name) : [...colors, c.name])
                  }
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-medium transition-all",
                    on
                      ? "bg-primary text-primary-foreground border-transparent shadow-xs font-semibold"
                      : "border-input bg-card text-foreground hover:bg-secondary hover:border-primary/40",
                  )}
                >
                  <span
                    className="size-4.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Budget per piece">
          <input value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls} />
        </Field>

        <Field label="Style in your own words">
          <textarea
            value={styleNote}
            onChange={(e) => setStyleNote(e.target.value)}
            rows={3}
            className={cn(inputCls, "resize-none")}
          />
        </Field>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3 text-sm font-semibold text-white shadow-xs transition-transform hover:opacity-95 active:scale-95 disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </section>

      <section className="grain-card flex items-center justify-between gap-4 rounded-2xl p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Signed in as</h2>
            {session?.isSupabase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3 text-emerald-500" /> Supabase PostgreSQL
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{session?.email}</p>
        </div>
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/auth", replace: true });
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
