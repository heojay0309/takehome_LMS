import { getAllLessons, type Course, type Lesson } from "./courses";

export type CourseProgress = {
  completedLessonIds: string[];
  started?: true;
  lastVisited?: { lessonId: string; at: number };
};

export const EMPTY_PROGRESS: CourseProgress = { completedLessonIds: [] };

export function getProgressStorageKey(userId: string, courseId: string): string {
  return `betteru-progress:${userId}:${courseId}`;
}

// localStorage is untrusted: tolerate old, malformed, and manually edited data.
export function parseCourseProgress(raw: string | null): CourseProgress {
  try {
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("completedLessonIds" in parsed) ||
      !Array.isArray(parsed.completedLessonIds)
    ) {
      return EMPTY_PROGRESS;
    }

    const visit = "lastVisited" in parsed ? parsed.lastVisited : null;
    const lastVisited = typeof visit === "object" && visit !== null &&
      "lessonId" in visit && typeof visit.lessonId === "string" &&
      "at" in visit && typeof visit.at === "number" && Number.isSafeInteger(visit.at) && visit.at >= 0
      ? { lessonId: visit.lessonId, at: visit.at } : undefined;

    return {
      ...(lastVisited ? { lastVisited } : {}),
      ...("started" in parsed && parsed.started === true ? { started: true as const } : {}),
      completedLessonIds: [...new Set(
        parsed.completedLessonIds.filter((id): id is string => typeof id === "string"),
      )],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function getCourseProgressSummary(course: Course, progress: CourseProgress) {
  return getLessonProgressSummary(getAllLessons(course), progress);
}

export function getLessonProgressSummary(lessons: Lesson[], progress: CourseProgress) {
  const completed = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;
  const total = lessons.length;
  const isCompleted = total > 0 && completed === total;
  // Reserve 0% and 100% for genuinely unstarted and completed courses,
  // including catalogs with enough lessons to round a partial result to either.
  const percent = completed === 0 ? 0 : isCompleted ? 100 : Math.max(1, Math.min(99, Math.round(completed / total * 100)));

  return { completed, total, percent, isCompleted };
}

/** Lesson-outline estimate, not the catalog's advertised total duration. */
export function getRemainingLessonMinutes(course: Course, progress: CourseProgress): number {
  return getAllLessons(course).reduce((sum, lesson) =>
    sum + (progress.completedLessonIds.includes(lesson.id) ? 0 : lesson.durationMinutes), 0);
}

export function getInProgressCourses(courses: Course[], progressByCourse: Readonly<Record<string, CourseProgress>>) {
  return courses.flatMap((course) => {
    const progress = progressByCourse[course.id] ?? EMPTY_PROGRESS;
    const continuation = getCourseContinuation(course, progress);
    if (!continuation.isInProgress || !continuation.lesson) return [];
    const validVisit = getAllLessons(course).some((lesson) => lesson.id === progress.lastVisited?.lessonId);
    return [{ course, lesson: continuation.lesson, ...getCourseProgressSummary(course, progress),
      lastVisitedAt: validVisit ? progress.lastVisited?.at ?? 0 : 0 }];
  }).sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
}

export function getCourseContinuation(course: Course, progress: CourseProgress) {
  const summary = getCourseProgressSummary(course, progress);
  const lessons = getAllLessons(course);
  const isStarted = progress.started === true || summary.completed > 0;

  return {
    isStarted,
    // The sidebar includes explicitly started 0% courses; the catalog's
    // assignment-defined In Progress filter still requires a completed lesson.
    isInProgress: isStarted && summary.total > 0 && !summary.isCompleted,
    lesson: lessons.find((lesson) => lesson.id === progress.lastVisited?.lessonId && !progress.completedLessonIds.includes(lesson.id))
      ?? lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? lessons[0],
  };
}
