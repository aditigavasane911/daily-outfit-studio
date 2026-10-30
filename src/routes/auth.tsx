import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "@/lib/closet-store";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Rewear Radar" },
      { name: "description", content: "Sign in to your Rewear Radar digital wardrobe studio." },
      { property: "og:title", content: "Sign in — Rewear Radar" },
      { property: "og:description", content: "Sign in to your Rewear Radar digital wardrobe studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow demo user activity without strict restrictions
    const targetEmail = email.trim() || "demo@rewearradar.com";
    const targetName =
      (mode === "signup" ? name.trim() : undefined) ||
      (email.trim() ? email.split("@")[0]?.replace(/[._]/g, " ") : undefined) ||
      "Demo Stylist";

    signIn(targetEmail, targetName);
    toast.success(
      mode === "signup"
        ? `Wardrobe created for ${targetName} — welcome to Rewear Radar!`
        : `Welcome back to Rewear Radar, ${targetName}!`,
    );
    navigate({ to: "/closet", replace: true });
  };

  const handleInstantDemo = () => {
    signIn("demo@rewearradar.com", "Demo Stylist");
    toast.success("Signed in as Demo Stylist!");
    navigate({ to: "/closet", replace: true });
  };

  const fillDemoValues = () => {
    if (mode === "signup") {
      setName("Marcus Lin");
      setEmail("marcus@rewearradar.com");
      setPassword("demo123");
    } else {
      setEmail("demo@rewearradar.com");
      setPassword("demo123");
    }
    toast.info("Demo credentials filled. Click submit or instant sign-in.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <img
            src={logoImg}
            alt="Rewear Radar Logo"
            className="size-18 rounded-2xl object-contain shadow-md"
          />
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">Rewear Radar</span>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">Second Life Fashion Discovery</span>
          </div>
        </div>

        {session && (
          <div className="grain-card mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active Session Detected
            </p>
            <p className="mt-1 text-sm text-foreground">
              Signed in as <span className="font-semibold">{session.name}</span> ({session.email})
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/closet", replace: true })}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to closet <ArrowRight className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  toast("Signed out. You can now log in or sign up with another demo account.");
                }}
                className="rounded-full border border-input bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Switch account
              </button>
            </div>
          </div>
        )}

        <div className="grain-card mt-6 rounded-2xl p-6 sm:p-8">
          {/* Quick Demo Access banner */}
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Sparkles className="size-3.5" /> Demo Mode Enabled
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No restrictions. Instant sign in or sign up with any details.
                </p>
              </div>
              <button
                type="button"
                onClick={handleInstantDemo}
                className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm transition hover:bg-accent/90"
              >
                Instant Demo
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full py-2 text-sm font-medium transition-colors",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {m === "signin" ? "Sign in" : "Create closet"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Your name (optional for demo)">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus or Demo User"
                  className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            )}
            <Field label="Email or Username">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === "signup" ? "marcus@demo.com or any handle" : "you@example.com or demo"
                }
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Password (optional for demo)">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any password or leave empty"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-brand-gradient py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-98"
              >
                {mode === "signin" ? "Sign in / Demo Access" : "Create closet / Demo Sign up"}
              </button>
              <button
                type="button"
                onClick={fillDemoValues}
                title="Fill demo values into form"
                className="rounded-full border border-input bg-secondary px-3.5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
              >
                Autofill Demo
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Preview build — accounts stay locally on this device.
            </p>
            <button
              type="button"
              onClick={handleInstantDemo}
              className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              1-Click Demo Login (Preloaded Wardrobe)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
