"use client";

import { createContext, createElement, useContext, useMemo, useSyncExternalStore, useEffect, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { createTrackStore } from "@/lib/track-store";

const Context = createContext<ReturnType<typeof useTrackState> | null>(null);
const empty = () => null;
const noopSubscribe = () => () => {};
function useTrackState() {
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id : undefined;
  const store = useMemo(() => userId ? createTrackStore(userId) : null, [userId]);
  const snapshot = useSyncExternalStore(store?.subscribe ?? noopSubscribe, store?.getSnapshot ?? empty, empty);
  useEffect(() => {
    if (!store) return;
    const refresh = (event: StorageEvent) => {
      try { if (event.storageArea === window.localStorage) store.refresh(event.key); } catch { /* Keep in-memory state. */ }
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [store]);
  return { userId, ready: Boolean(snapshot), tracks: snapshot?.library.tracks ?? [],
    archivedTracks: snapshot?.library.archivedTracks ?? [],
    archive: store?.archive ?? (() => {}), restore: store?.restore ?? (() => {}),
    skipped: snapshot?.library.skipped ?? false, storageAvailable: snapshot?.storageAvailable ?? true,
    save: store?.save ?? (() => {}) };
}
export function TrackProvider({ children }: { children: ReactNode }) {
  return createElement(Context.Provider, { value: useTrackState() }, children);
}
export function useOnboardingPreference() {
  const state = useContext(Context);
  if (!state) throw new Error("TrackProvider is required");
  return state;
}
