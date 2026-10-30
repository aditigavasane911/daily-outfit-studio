import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Plus, Shirt, Sparkles, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/closet-store";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

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
    toast("Signed out from Rewear Radar — see you tomorrow.");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link to="/closet" className="flex items-center gap-3 group">
            <img
              src={logoImg}
              alt="Rewear Radar Logo"
              className="size-10 rounded-xl object-contain shadow-xs transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Rewear Radar
              </span>
              <span className="-mt-1 text-[10px] font-semibold tracking-wider uppercase text-accent">
                Second Life Fashion Discovery
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1.5 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: false }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-xs"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/closet/add"
              className="hidden items-center gap-2 rounded-full bg-brand-gradient px-4.5 py-2 text-sm font-semibold text-white shadow-xs transition-transform hover:opacity-95 active:scale-95 sm:inline-flex"
            >
              <Plus className="size-4" strokeWidth={2.5} /> Add piece
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="hidden text-right text-xs leading-tight text-muted-foreground sm:block">
                <span className="font-medium text-foreground">{session?.name}</span>
                <span className="block text-[11px] opacity-70">{session?.email}</span>
              </span>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="flex size-9 items-center justify-center rounded-full border border-input bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 px-4 pb-24 pt-6 sm:px-8 lg:px-12 md:pb-12">
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
