"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { createThemeStore, THEME_MEDIA_QUERY, THEME_STORAGE_KEY } from "@/lib/theme";

const themeStore = createThemeStore();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const media = window.matchMedia(THEME_MEDIA_QUERY);
    return themeStore.connect({
      read: () => window.localStorage.getItem(THEME_STORAGE_KEY),
      write: (value) => window.localStorage.setItem(THEME_STORAGE_KEY, value),
      systemDark: () => media.matches,
      apply: (theme) => document.documentElement.classList.toggle("dark", theme === "dark"),
      listen(onSystemChange, onStorageChange) {
        function handleStorage(event: StorageEvent) {
          // Ignore sessionStorage and unrelated app preferences.
          try {
            if (event.storageArea !== window.localStorage) return;
          } catch { return; }
          if (event.key === THEME_STORAGE_KEY || event.key === null) onStorageChange(event.newValue);
        }
        media.addEventListener("change", onSystemChange);
        window.addEventListener("storage", handleStorage);
        return () => {
          media.removeEventListener("change", onSystemChange);
          window.removeEventListener("storage", handleStorage);
        };
      },
    });
  }, []);

  return children;
}

export function useTheme() {
  const resolvedTheme = useSyncExternalStore(themeStore.subscribe, themeStore.getResolvedSnapshot, themeStore.getServerSnapshot);
  return { resolvedTheme, setPreference: themeStore.setPreference };
}
