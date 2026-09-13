"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeButtons({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setPreference } = useTheme();

  return (
    <div role="group" aria-label="Color theme" className="flex w-fit shrink-0 items-center gap-1 rounded-full border border-input bg-card p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={resolvedTheme === "light"}
        disabled={resolvedTheme === null}
        onClick={() => setPreference("light")}
        className={compact ? 'max-sm:size-12 max-sm:p-0 bg-secondary text-secondary-foreground dark:bg-transparent dark:text-muted-foreground' : 'bg-secondary text-secondary-foreground dark:bg-transparent dark:text-muted-foreground'}
      >
        <Sun aria-hidden="true" />
        <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Light</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={resolvedTheme === "dark"}
        disabled={resolvedTheme === null}
        onClick={() => setPreference("dark")}
        className={compact ? 'max-sm:size-12 max-sm:p-0 text-muted-foreground dark:bg-secondary dark:text-secondary-foreground' : 'text-muted-foreground dark:bg-secondary dark:text-secondary-foreground'}
      >
        <Moon aria-hidden="true" />
        <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Dark</span>
      </Button>
    </div>
  );
}
