import { getAllLessons, type Course } from "./courses";
import { getCourseProgressSummary, type CourseProgress } from "./progress";

/** Final-in-sequence is not necessarily the final outstanding lesson. */
export function getLessonCompletionState(course: Course, lessonId: string, progress: CourseProgress) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  const summary = getCourseProgressSummary(course, progress);
  const lessonComplete = index >= 0 && progress.completedLessonIds.includes(lessonId);
  const nextSequential = index >= 0 ? lessons[index + 1] : undefined;
  const nextLesson = summary.isCompleted || index < 0 ? undefined :
    nextSequential ?? lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id));

  return { ...summary, lessonComplete, nextLesson, isSequentialNext: Boolean(nextSequential && nextLesson) };
}
