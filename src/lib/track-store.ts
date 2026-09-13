import { getOnboardingStorageKey, parseOnboardingPreference, type Answers, type Goal, type OnboardingPreference } from "./onboarding";

export type TrackLibrary = { version: 4; tracks: Answers[]; archivedTracks: Answers[]; skipped: boolean };
export function parseTrackLibrary(raw: string | null): TrackLibrary {
  const empty: TrackLibrary = { version: 4, tracks: [], archivedTracks: [], skipped: false };
  try {
    const value = JSON.parse(raw ?? "null");
    if ((value?.version === 3 || value?.version === 4) && Array.isArray(value.tracks)) {
      const tracks: Answers[] = [];
      for (const answers of value.tracks) {
        const valid = parseOnboardingPreference(JSON.stringify({ version: 2, answers }));
        if (valid && "answers" in valid && !tracks.some(t => t.goal === valid.answers.goal)) tracks.push(valid.answers);
      }
      const archivedTracks: Answers[] = [];
      if (value.version === 4 && Array.isArray(value.archivedTracks)) {
        for (const answers of value.archivedTracks) {
          const valid = parseOnboardingPreference(JSON.stringify({ version: 2, answers }));
          if (valid && "answers" in valid && ![...tracks, ...archivedTracks].some(t => t.goal === valid.answers.goal)) archivedTracks.push(valid.answers);
        }
      }
      return { version: 4, tracks, archivedTracks, skipped: value.skipped === true };
    }
    const legacy = parseOnboardingPreference(raw);
    return { ...empty, tracks: legacy && "answers" in legacy ? [legacy.answers] : [], skipped: Boolean(legacy && "skipped" in legacy) };
  } catch { return empty; }
}
export function createTrackStore(userId: string, getStorage: () => Pick<Storage, "getItem" | "setItem"> = () => window.localStorage) {
  type Snapshot = { library: TrackLibrary; storageAvailable: boolean };
  let snapshot: Snapshot | null = null;
  const key = getOnboardingStorageKey(userId);
  const listeners = new Set<() => void>();
  function read(): Snapshot {
    try { return { library: parseTrackLibrary(getStorage().getItem(key)), storageAvailable: true }; }
    catch { return { library: snapshot?.library ?? parseTrackLibrary(null), storageAvailable: false }; }
  }
  function getSnapshot() { return snapshot ?? (snapshot = read()); }
  function publish(next: Snapshot) { snapshot = next; listeners.forEach(fn => fn()); }
  function currentLibrary() {
    const current = getSnapshot();
    return current.storageAvailable ? read().library : current.library;
  }
  function persist(library: TrackLibrary) {
    let storageAvailable = true;
    try { getStorage().setItem(key, JSON.stringify(library)); } catch { storageAvailable = false; }
    publish({ library, storageAvailable });
  }
  function moveTrack(goal: Goal, archive: boolean) {
    const current = currentLibrary();
    const source = archive ? current.tracks : current.archivedTracks;
    const track = source.find(t => t.goal === goal);
    if (!track) return;
    persist({ ...current,
      tracks: archive ? current.tracks.filter(t => t.goal !== goal) : [...current.tracks, track],
      archivedTracks: archive ? [...current.archivedTracks, track] : current.archivedTracks.filter(t => t.goal !== goal),
    });
  }
  return {
    getSnapshot,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    refresh: (changedKey: string | null) => { if (changedKey === key || changedKey === null) publish(read()); },
    save: (preference: OnboardingPreference | null) => {
      const current = currentLibrary();
      const library: TrackLibrary = preference && "answers" in preference
        ? { version: 4, skipped: false, tracks: [...current.tracks.filter(t => t.goal !== preference.answers.goal), preference.answers], archivedTracks: current.archivedTracks.filter(t => t.goal !== preference.answers.goal) }
        : { ...current, skipped: true };
      persist(library);
    },
    // Archiving changes only the library; per-course progress is never removed.
    archive: (goal: Goal) => moveTrack(goal, true),
    restore: (goal: Goal) => moveTrack(goal, false),
  };
}
