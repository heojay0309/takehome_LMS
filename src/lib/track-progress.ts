import type { Course } from "./courses";
import { EMPTY_PROGRESS, getCourseProgressSummary, type CourseProgress } from "./progress";

/** Weight by lessons, not by courses, so partially completed courses count. */
export function getTrackProgressSummary(courses: Course[], progressByCourse: Readonly<Record<string, CourseProgress>>) {
  const summaries = courses.map(course => getCourseProgressSummary(course, progressByCourse[course.id] ?? EMPTY_PROGRESS));
  const completed = summaries.reduce((sum, summary) => sum + summary.completed, 0);
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);
  const completedCourses = summaries.filter(summary => summary.isCompleted).length;
  const isCompleted = courses.length > 0 && completedCourses === courses.length;
  const isStarted = completed > 0 || courses.some(course => progressByCourse[course.id]?.started);
  const percent = completed === 0 ? 0 : isCompleted ? 100 : Math.max(1, Math.min(99, Math.round(completed / total * 100)));
  return { completed, total, completedCourses, isCompleted, percent,
    status: isCompleted ? "Completed" : isStarted ? "In progress" : "Not started" };
}
