import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  COLOR_PRESETS,
  signOut,
  updateProfile,
  useProfile,
  useSession,
} from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Drape" },
      { name: "description", content: "Tune what Drape knows about your style." },
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

  const save = () => {
    updateProfile({ name, sizes, budget, styleNote, favoriteColors: colors });
    toast.success("Preferences saved — match-ups will use them from now on.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
      </div>

      <section className="grain-card space-y-5 rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Style profile</h2>
        <p className="-mt-3 text-sm text-muted-foreground">
          These preferences shape your future match-ups.
        </p>

        <Field label="Display name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={session?.name} className={inputCls} />
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
                  onClick={() => setColors(on ? colors.filter((x) => x !== c.name) : [...colors, c.name])}
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs transition-colors",
                    on ? "border-primary bg-secondary" : "border-input",
                  )}
                >
                  <span className="size-5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
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
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save preferences
        </button>
      </section>

      <section className="grain-card flex items-center justify-between gap-4 rounded-2xl p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Signed in as</h2>
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
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
