import type { Course } from "./courses";
import {
  EMPTY_PROGRESS,
  getProgressStorageKey,
  parseCourseProgress,
  type CourseProgress,
} from "./progress";

type ProgressSnapshot = {
  courses: Record<string, CourseProgress>;
  storageAvailable: boolean;
};

type ProgressStorage = Pick<Storage, "getItem" | "setItem">;

// One instance per signed-in user, owned by the dashboard provider (not a
// module singleton). Snapshots stay referentially stable between updates.
export function createProgressStore(
  userId: string,
  courses: Course[],
  getStorage: () => ProgressStorage = () => window.localStorage,
) {
  let snapshot: ProgressSnapshot | null = null;
  const listeners = new Set<() => void>();
  const storageKeys = new Map(courses.map((course) => [
    getProgressStorageKey(userId, course.id), course.id,
  ]));

  function readCourse(courseId: string, fallback: CourseProgress) {
    try {
      return {
        progress: parseCourseProgress(getStorage().getItem(getProgressStorageKey(userId, courseId))),
        available: true,
      };
    } catch {
      return { progress: fallback, available: false };
    }
  }

  function getSnapshot(): ProgressSnapshot {
    if (snapshot === null) {
      const initial: ProgressSnapshot = { courses: {}, storageAvailable: true };
      for (const course of courses) {
        const result = readCourse(course.id, EMPTY_PROGRESS);
        initial.courses[course.id] = result.progress;
        initial.storageAvailable &&= result.available;
      }
      snapshot = initial;
    }
    return snapshot;
  }

  function publish(next: ProgressSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function save(courseId: string, progress: CourseProgress) {
    const current = getSnapshot();
    let storageAvailable = current.storageAvailable;
    try {
      getStorage().setItem(getProgressStorageKey(userId, courseId), JSON.stringify(progress));
    } catch {
      storageAvailable = false;
    }
    publish({ courses: { ...current.courses, [courseId]: progress }, storageAvailable });
  }

  return {
    getSnapshot,
    // No storage reads during SSR or initial hydration.
    getServerSnapshot: (): null => null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    startCourse(courseId: string) {
      if (!courses.some((course) => course.id === courseId && course.modules.some((section) => section.lessons.length > 0))) return;
      const current = getSnapshot();
      const previous = current.courses[courseId] ?? EMPTY_PROGRESS;
      // Idempotent: revisiting lessons (including Strict Mode effects) must not
      // publish repeatedly or reset a learner's completion state.
      if (previous.started) return;
      const base = current.storageAvailable ? readCourse(courseId, previous).progress : previous;
      save(courseId, { ...base, started: true });
    },
    visitLesson(courseId: string, lessonId: string, at = Date.now()) {
      const course = courses.find((item) => item.id === courseId);
      if (!course?.modules.some((section) => section.lessons.some((lesson) => lesson.id === lessonId)) || !Number.isSafeInteger(at) || at < 0) return;
      const current = getSnapshot();
      const previous = current.courses[courseId] ?? EMPTY_PROGRESS;
      const base = current.storageAvailable ? readCourse(courseId, previous).progress : previous;
      if (base.lastVisited?.lessonId === lessonId && base.lastVisited.at === at) return;
      save(courseId, { ...base, started: true, lastVisited: { lessonId, at } });
    },
    // Video-ended events may repeat (replay, Strict Mode, or another tab).
    // Completion must set a value, never toggle previously completed work off.
    completeLesson(courseId: string, lessonId: string) {
      const course = courses.find((item) => item.id === courseId);
      if (!course?.modules.some((section) => section.lessons.some((lesson) => lesson.id === lessonId))) return;
      const current = getSnapshot();
      const previous = current.courses[courseId] ?? EMPTY_PROGRESS;
      const base = current.storageAvailable ? readCourse(courseId, previous).progress : previous;
      if (base.completedLessonIds.includes(lessonId)) {
        // Refresh this tab if another tab already completed the lesson.
        if (base.started !== previous.started ||
          base.lastVisited?.lessonId !== previous.lastVisited?.lessonId ||
          base.lastVisited?.at !== previous.lastVisited?.at ||
          base.completedLessonIds.length !== previous.completedLessonIds.length ||
          base.completedLessonIds.some((id, index) => id !== previous.completedLessonIds[index])) {
          publish({ ...current, courses: { ...current.courses, [courseId]: base } });
        }
        return;
      }
      save(courseId, { ...base, started: true, completedLessonIds: [...base.completedLessonIds, lessonId] });
    },
    toggleLesson(courseId: string, lessonId: string) {
      const course = courses.find((item) => item.id === courseId);
      if (!course?.modules.some((section) => section.lessons.some((lesson) => lesson.id === lessonId))) return;

      const current = getSnapshot();
      const previous = current.courses[courseId] ?? EMPTY_PROGRESS;
      // Re-read to pick up another tab's changes before writing. When storage
      // has failed, preserve unsaved in-memory work instead of overwriting it.
      const base = current.storageAvailable ? readCourse(courseId, previous).progress : previous;
      const completed = new Set(base.completedLessonIds);
      if (completed.has(lessonId)) completed.delete(lessonId);
      else completed.add(lessonId);
      save(courseId, { ...base, started: true, completedLessonIds: [...completed] });
    },
    // storage events fire in other tabs, not the tab that performed the write.
    // Same-tab changes notify subscribers directly via publish above.
    refresh(storageKey: string | null) {
      const courseId = storageKey === null ? undefined : storageKeys.get(storageKey);
      if (storageKey !== null && !courseId) return;
      const current = getSnapshot();
      const next = { ...current, courses: { ...current.courses } };
      for (const id of courseId ? [courseId] : courses.map((course) => course.id)) {
        const result = readCourse(id, current.courses[id] ?? EMPTY_PROGRESS);
        next.courses[id] = result.progress;
        next.storageAvailable &&= result.available;
      }
      publish(next);
    },
  };
}
