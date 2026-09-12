"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getCourseProgress,
  getCourseProgressPercent,
  toggleLessonComplete,
  type CourseProgress,
} from "@/lib/progress";
import type { Course } from "@/lib/courses";

export function useCourseProgress(course: Course) {
  const { user } = useUser();
  const userId = user?.id ?? "guest";
  const [progress, setProgress] = useState<CourseProgress>({
    completedLessonIds: [],
  });

  useEffect(() => {
    setProgress(getCourseProgress(userId, course.id));
  }, [userId, course.id]);

  const percent = getCourseProgressPercent(userId, course);

  const toggleLesson = useCallback(
    (lessonId: string) => {
      const nextProgress = toggleLessonComplete(userId, course.id, lessonId);
      setProgress(nextProgress);
    },
    [userId, course.id],
  );

  const isComplete = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds],
  );

  return {
    progress,
    percent,
    toggleLesson,
    isComplete,
  };
}
