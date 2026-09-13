"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { useUser } from "@clerk/nextjs";
import { getCourses } from "@/lib/courses";
import { createProgressStore } from "@/lib/progress-store";

const emptySnapshot = () => null;
const subscribeToNothing = () => () => {};
const ignoreAction = () => {};
const ProgressContext = createContext<{
  snapshot: ReturnType<ReturnType<typeof createProgressStore>["getSnapshot"]> | null;
  toggleLesson: (courseId: string, lessonId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  startCourse: (courseId: string) => void;
  visitLesson: (courseId: string, lessonId: string) => void;
} | null>(null);

export function CourseProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id : undefined;
  const store = useMemo(
    () => userId ? createProgressStore(userId, getCourses()) : null,
    [userId],
  );
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? subscribeToNothing,
    store?.getSnapshot ?? emptySnapshot,
    store?.getServerSnapshot ?? emptySnapshot,
  );

  useEffect(() => {
    if (!store) return;
    const onStorage = (event: StorageEvent) => {
      try {
        if (event.storageArea === window.localStorage) store.refresh(event.key);
      } catch {
        // Storage may be blocked by browser policy. In-memory progress remains usable.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [store]);

  return (
    <ProgressContext.Provider value={{
      snapshot,
      toggleLesson: store?.toggleLesson ?? ignoreAction,
      completeLesson: store?.completeLesson ?? ignoreAction,
      startCourse: store?.startCourse ?? ignoreAction,
      visitLesson: store?.visitLesson ?? ignoreAction,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function ProgressStorageNotice() {
  const { snapshot } = useProgressState();
  if (!snapshot || snapshot.storageAvailable) return null;

  return (
    <p role="status" className="mb-8 rounded-lg border border-border bg-secondary p-4 text-sm text-foreground">
      Browser storage is unavailable. You can keep learning, but some progress is only saved in this tab and may be lost on refresh.
    </p>
  );
}

export function useProgressState() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("Progress hooks must be used inside CourseProgressProvider");
  return context;
}
