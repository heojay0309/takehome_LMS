"use client";

import { useProgressState } from "@/components/courses/CourseProgressProvider";
import { EMPTY_PROGRESS, getCourseProgressSummary } from "@/lib/progress";
import type { Course } from "@/lib/courses";

export function useCourseProgress(course: Course) {
  const { snapshot, toggleLesson } = useProgressState();
  const progress = snapshot?.courses[course.id] ?? EMPTY_PROGRESS;

  return {
    progress,
    ...getCourseProgressSummary(course, progress),
    isReady: snapshot !== null,
    toggleLesson: (lessonId: string) => toggleLesson(course.id, lessonId),
    isComplete: (lessonId: string) => progress.completedLessonIds.includes(lessonId),
  };
}
