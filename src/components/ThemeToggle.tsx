import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme (currently ${theme} mode)`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "group relative flex size-9 items-center justify-center rounded-full border border-input bg-card text-foreground shadow-2xs transition-all duration-200 hover:border-primary/40 hover:bg-secondary active:scale-95",
        className,
      )}
    >
      <div className="relative size-4.5">
        <Sun
          className={cn(
            "absolute inset-0 size-full text-amber-500 transition-all duration-300",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
          )}
          strokeWidth={2}
        />
        <Moon
          className={cn(
            "absolute inset-0 size-full text-emerald-400 transition-all duration-300",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
          )}
          strokeWidth={2}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-medium capitalize">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: typeof Sun; desc: string; previewBadge: string }[] = [
    {
      value: "light",
      label: "Light Theme",
      icon: Sun,
      desc: "Warm Sand canvas with rich spruce accents",
      previewBadge: "Sand · Spruce",
    },
    {
      value: "dark",
      label: "Dark Theme",
      icon: Moon,
      desc: "Midnight obsidian background with glowing emerald",
      previewBadge: "Obsidian · Emerald",
    },
    {
      value: "system",
      label: "System Match",
      icon: Monitor,
      desc: "Automatically adapts to your device OS settings",
      previewBadge: "Auto Sync",
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {options.map(({ value, label, icon: Icon, desc, previewBadge }) => {
        const isSelected = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl border p-4.5 text-left transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                : "border-input bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <div>
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-foreground group-hover:text-primary",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {isSelected ? "Active" : previewBadge}
                </span>
              </div>
              <p className="mt-3.5 font-display text-base font-bold text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>

            {/* Visual Mini Canvas Preview Bar */}
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full border border-black/10">
              {value === "light" && (
                <>
                  <span className="w-2/3 bg-[#FAF8F5]" />
                  <span className="w-1/3 bg-[#165B6D]" />
                </>
              )}
              {value === "dark" && (
                <>
                  <span className="w-2/3 bg-[#0C171A]" />
                  <span className="w-1/3 bg-[#199E72]" />
                </>
              )}
              {value === "system" && (
                <>
                  <span className="w-1/2 bg-[#FAF8F5]" />
                  <span className="w-1/2 bg-[#0C171A]" />
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
