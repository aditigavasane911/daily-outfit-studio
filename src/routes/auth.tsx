import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Hanger } from "lucide-react";
import { toast } from "sonner";
import { signIn, useSession } from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Drape" },
      { name: "description", content: "Sign in to your Drape digital closet." },
      { property: "og:title", content: "Sign in — Drape" },
      { property: "og:description", content: "Sign in to your Drape digital closet." },
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

  if (session) {
    navigate({ to: "/closet", replace: true });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    signIn(email, mode === "signup" ? name : undefined);
    toast.success(mode === "signup" ? "Closet created — welcome!" : "Welcome back.");
    navigate({ to: "/closet", replace: true });
  };

  const demo = () => {
    signIn("you@example.com", "Demo you");
    toast.success("Preview closet opened.");
    navigate({ to: "/closet", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Hanger className="size-4" strokeWidth={1.75} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Drape</span>
        </div>

        <div className="grain-card mt-8 rounded-2xl p-6 sm:p-8">
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
              <Field label="Your name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya"
                  className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {mode === "signin" ? "Sign in" : "Create my closet"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Preview build — accounts stay on this device for now. Real sign-in arrives with the
              backend phase.
            </p>
            <button
              type="button"
              onClick={demo}
              className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Peek inside the demo closet
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
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
