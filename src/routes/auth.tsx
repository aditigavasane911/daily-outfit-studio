import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Database, ShieldCheck, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "@/lib/closet-store";
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Rewear Radar" },
      { name: "description", content: "Sign in to your Rewear Radar digital wardrobe studio." },
      { property: "og:title", content: "Sign in — Rewear Radar" },
      {
        property: "og:description",
        content: "Sign in to your Rewear Radar digital wardrobe studio.",
      },
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : "";
    const hashParams = new URLSearchParams(hash);

    const error = searchParams.get("error") || hashParams.get("error");
    const errorDesc =
      searchParams.get("error_description") || hashParams.get("error_description");

    if (error) {
      if (error === "access_denied") {
        toast.error(
          "Google Sign-In Access Denied: In Google Cloud Console, add your email to 'Test users' or set publishing status to 'In production'.",
          { duration: 8000 },
        );
      } else {
        toast.error(`Authentication error: ${errorDesc || error}`);
      }
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSupabaseConfigured) {
      if (!email.trim()) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }

      setLoading(true);
      try {
        if (mode === "signup") {
          const res = await signUpWithEmail(email.trim(), password, name.trim());
          if (res.session) {
            toast.success(`Account created! Welcome to Rewear Radar, ${name || email.split("@")[0]}!`);
            navigate({ to: "/closet", replace: true });
          } else {
            toast.success("Account created! Please check your email inbox to verify your account.");
          }
        } else {
          await signInWithEmail(email.trim(), password);
          toast.success("Welcome back to Rewear Radar!");
          navigate({ to: "/closet", replace: true });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Authentication failed.";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback if Supabase credentials are not provided yet (Demo mode)
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

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      toast.info("Supabase is in Demo Mode. Connect your Supabase project in .env to use Google OAuth.");
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(errorMsg);
      setLoading(false);
    }
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
      setPassword("demo12345");
    } else {
      setEmail("demo@rewearradar.com");
      setPassword("demo12345");
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
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Rewear Radar
            </span>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              Second Life Fashion Discovery
            </span>
          </div>
        </div>

        {/* Supabase backend status pill */}
        <div className="mt-4 flex justify-center">
          {isSupabaseConfigured ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="size-3.5" />
              Connected to Supabase PostgreSQL & Auth
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="size-2 rounded-full bg-amber-500" />
              Demo Mode (Provide keys in .env for PostgreSQL & Supabase Auth)
            </div>
          )}
        </div>

        {session && (
          <div className="grain-card mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active Session Detected
            </p>
            <p className="mt-1 text-sm text-foreground">
              Signed in as <span className="font-semibold">{session.name}</span> ({session.email})
              {session.isSupabase && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3" /> Supabase
                </span>
              )}
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
                  toast("Signed out. You can now log in or sign up with another account.");
                }}
                className="rounded-full border border-input bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="grain-card mt-6 rounded-2xl p-6 sm:p-8">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-secondary hover:text-foreground active:scale-98 disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">Or with email</span>
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
              <Field label="Your Name" icon={<User className="size-3.5 text-muted-foreground" />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Lin"
                  className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            )}
            <Field label="Email Address" icon={<Mail className="size-3.5 text-muted-foreground" />}>
              <input
                type="email"
                value={email}
                required={isSupabaseConfigured}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Password" icon={<Lock className="size-3.5 text-muted-foreground" />}>
              <input
                type="password"
                value={password}
                required={isSupabaseConfigured}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-98 disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={fillDemoValues}
                title="Fill demo values into form"
                className="rounded-full border border-input bg-secondary px-3.5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
              >
                Autofill
              </button>
            </div>
          </form>

          {/* Quick Demo Access banner */}
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Sparkles className="size-3.5" /> Instant Demo Mode
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Test the wardrobe & AI stylist immediately without logging in.
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
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {children}
    </label>
  );
}
