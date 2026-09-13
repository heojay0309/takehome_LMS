import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { createThemeStore, parseTheme, resolveTheme, themeInitScript, THEME_STORAGE_KEY, type ThemeEnvironment } from "../src/lib/theme";

function setup(saved: unknown = null, dark = false, storageBlocked = false) {
  const store = createThemeStore();
  let applied = "";
  let systemChange = () => {};
  let storageChange: (value: unknown) => void = () => {};
  let stopped = false;
  const environment: ThemeEnvironment = {
    read: () => { if (storageBlocked) throw Error("blocked"); return saved; },
    write: (value) => { if (storageBlocked) throw Error("blocked"); saved = value; },
    systemDark: () => dark,
    apply: (value) => { applied = value; },
    listen: (system, storage) => {
      systemChange = system;
      storageChange = storage;
      return () => { stopped = true; };
    },
  };
  return {
    store, environment,
    applied: () => applied,
    saved: () => saved,
    stopped: () => stopped,
    system: (value: boolean) => { dark = value; systemChange(); },
    storage: (value: unknown) => storageChange(value),
  };
}

test("invalid or absent preferences follow the system", () => {
  for (const value of [null, undefined, "system", "bad", {}, 1]) assert.equal(parseTheme(value), "system");
  assert.equal(parseTheme("dark"), "dark");
  assert.equal(parseTheme("light"), "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("SSR is stable and connection restores saved preference", () => {
  const h = setup("dark");
  assert.equal(h.store.getSnapshot(), null);
  assert.equal(h.store.getServerSnapshot(), null);
  h.store.connect(h.environment);
  assert.equal(h.store.getSnapshot(), "dark");
  assert.equal(h.applied(), "dark");
  assert.equal(h.store.getServerSnapshot(), null);
});

test("system changes are live but do not override an explicit selection", () => {
  const h = setup();
  h.store.connect(h.environment);
  h.system(true);
  assert.equal(h.applied(), "dark");
  h.store.setPreference("light");
  assert.equal(h.saved(), "light");
  h.system(true);
  assert.equal(h.applied(), "light");
  h.store.setPreference("system");
  assert.equal(h.applied(), "dark");
  h.system(false);
  assert.equal(h.applied(), "light");
});

test("storage changes and removal synchronize, and subscriptions clean up", () => {
  const h = setup("light", true);
  let notifications = 0;
  const unsubscribe = h.store.subscribe(() => { notifications++; });
  const disconnect = h.store.connect(h.environment);
  h.storage("dark");
  assert.equal(h.store.getSnapshot(), "dark");
  h.storage(null);
  assert.equal(h.store.getSnapshot(), "system");
  assert.equal(h.applied(), "dark");
  h.storage("invalid");
  assert.equal(h.store.getSnapshot(), "system");
  unsubscribe();
  const previous = notifications;
  h.store.setPreference("light");
  assert.equal(notifications, previous);
  disconnect();
  assert.equal(h.stopped(), true);
});

test("unavailable storage still allows switching and preserves choices on remount", () => {
  const h = setup(null, true, true);
  const disconnect = h.store.connect(h.environment);
  assert.equal(h.applied(), "dark");
  h.store.setPreference("light");
  assert.equal(h.applied(), "light");
  disconnect();
  h.store.connect(h.environment);
  assert.equal(h.applied(), "light");
});

test("resolved snapshot tracks the active button even when preference stays system", () => {
  const h = setup();
  assert.equal(h.store.getResolvedSnapshot(), null);
  h.store.connect(h.environment);
  assert.equal(h.store.getResolvedSnapshot(), "light");
  h.system(true);
  assert.equal(h.store.getSnapshot(), "system");
  assert.equal(h.store.getResolvedSnapshot(), "dark");
  h.store.setPreference("light");
  assert.equal(h.store.getResolvedSnapshot(), "light");
  h.system(true);
  assert.equal(h.store.getResolvedSnapshot(), "light");
});

test("saved selection is restored by a fresh store on reload", () => {
  const h = setup();
  h.store.connect(h.environment);
  h.store.setPreference("dark");
  const reloaded = setup(h.saved());
  reloaded.store.connect(reloaded.environment);
  assert.equal(reloaded.applied(), "dark");
});

test("pre-paint script agrees with the store, including blocked storage", () => {
  for (const saved of [null, "invalid", "system", "light", "dark"]) {
    for (const systemDark of [false, true]) {
      for (const blocked of [false, true]) {
        let applied = false;
        runInNewContext(themeInitScript, {
          localStorage: { getItem: (key: string) => {
            assert.equal(key, THEME_STORAGE_KEY);
            if (blocked) throw Error("blocked");
            return saved;
          } },
          window: { matchMedia: () => ({ matches: systemDark }) },
          document: { documentElement: { classList: { toggle: (name: string, enabled: boolean) => {
            assert.equal(name, "dark"); applied = enabled;
          } } } },
        });
        const h = setup(saved, systemDark, blocked);
        h.store.connect(h.environment);
        assert.equal(applied, h.applied() === "dark");
      }
    }
  }
});
