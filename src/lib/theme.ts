export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "betteru.theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function parseTheme(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean) {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}

// Static, trusted source only. Runs in <head> before CSS/content can paint.
export const themeInitScript = `(()=>{let t="system";try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch{}const d=t==="dark"||(t!=="light"&&window.matchMedia("${THEME_MEDIA_QUERY}").matches);document.documentElement.classList.toggle("dark",d)})()`;

export interface ThemeEnvironment {
  read: () => unknown;
  write: (preference: ThemePreference) => void;
  systemDark: () => boolean;
  apply: (theme: "light" | "dark") => void;
  listen: (onSystemChange: () => void, onStorageChange: (value: unknown) => void) => () => void;
}

export function createThemeStore() {
  let preference: ThemePreference | null = null;
  let resolvedTheme: "light" | "dark" | null = null;
  let environment: ThemeEnvironment | null = null;
  const listeners = new Set<() => void>();

  function update(next: ThemePreference) {
    preference = next;
    if (environment) {
      resolvedTheme = resolveTheme(next, environment.systemDark());
      environment.apply(resolvedTheme);
    }
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: () => preference,
    getResolvedSnapshot: () => resolvedTheme,
    getServerSnapshot: () => null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    connect(nextEnvironment: ThemeEnvironment) {
      environment = nextEnvironment;
      // Preserve in-memory choices through Strict Mode remounts, even if storage failed.
      if (preference === null) {
        try { preference = parseTheme(environment.read()); }
        catch { preference = "system"; }
      }
      update(preference);
      const stop = environment.listen(
        () => update(preference ?? "system"),
        (value) => update(parseTheme(value)),
      );
      return () => { stop(); environment = null; };
    },
    setPreference(next: ThemePreference) {
      if (!environment) return;
      try { environment.write(next); } catch { /* Still work in this tab. */ }
      update(next);
    },
  };
}
