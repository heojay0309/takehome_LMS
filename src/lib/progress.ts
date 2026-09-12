import { getAllLessons, type Course } from "@/lib/courses";

export type CourseProgress = {
  completedLessonIds: string[];
};

const STORAGE_PREFIX = "betteru-progress";

function getStorageKey(userId: string, courseId: string): string {
  return `${STORAGE_PREFIX}:${userId}:${courseId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCourseProgress(
  userId: string,
  courseId: string,
): CourseProgress {
  if (!isBrowser()) {
    return { completedLessonIds: [] };
  }

  const raw = window.localStorage.getItem(getStorageKey(userId, courseId));
  if (!raw) {
    return { completedLessonIds: [] };
  }

  try {
    const parsed = JSON.parse(raw) as CourseProgress;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds
        : [],
    };
  } catch {
    return { completedLessonIds: [] };
  }
}

export function saveCourseProgress(
  userId: string,
  courseId: string,
  progress: CourseProgress,
): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    getStorageKey(userId, courseId),
    JSON.stringify(progress),
  );
}

export function toggleLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string,
): CourseProgress {
  const progress = getCourseProgress(userId, courseId);
  const completed = new Set(progress.completedLessonIds);

  if (completed.has(lessonId)) {
    completed.delete(lessonId);
  } else {
    completed.add(lessonId);
  }

  const nextProgress = { completedLessonIds: [...completed] };
  saveCourseProgress(userId, courseId, nextProgress);
  return nextProgress;
}

export function getCourseProgressPercent(
  userId: string,
  course: Course,
): number {
  const lessons = getAllLessons(course);
  if (lessons.length === 0) return 0;

  const progress = getCourseProgress(userId, course.id);
  const completedCount = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;

  return Math.round((completedCount / lessons.length) * 100);
}

export function isLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string,
): boolean {
  return getCourseProgress(userId, courseId).completedLessonIds.includes(
    lessonId,
  );
}
