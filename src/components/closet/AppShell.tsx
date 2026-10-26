import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Plus, Shirt, Sparkles, Settings, LogOut, Hanger } from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/closet-store";

const NAV = [
  { to: "/closet", label: "Closet", icon: Shirt },
  { to: "/outfits", label: "Match-ups", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const navigate = useNavigate();
  const session = useSession();

  const handleSignOut = () => {
    signOut();
    toast("Signed out — see you tomorrow.");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/closet" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Hanger className="size-4" strokeWidth={1.75} />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Drape</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: false }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/closet/add"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              <Plus className="size-4" /> Add piece
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden text-right text-xs leading-tight text-muted-foreground sm:block">
                {session?.name}
                <span className="block text-[11px] opacity-70">{session?.email}</span>
              </span>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex size-9 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-primary"
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
          <Link
            to="/closet/add"
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-medium text-muted-foreground"
          >
            <Plus className="size-5" strokeWidth={1.75} />
            Add
          </Link>
        </div>
      </nav>
    </div>
  );
}
