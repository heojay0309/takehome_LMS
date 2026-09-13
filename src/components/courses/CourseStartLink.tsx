"use client";

import Link from "next/link";
import { useProgressState } from "@/components/courses/CourseProgressProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/ui/loading-state";
import { buttonVariants } from "@/components/ui/button";
import type { Course } from "@/lib/courses";
import { withCatalogContext } from "@/lib/catalog-state";
import { EMPTY_PROGRESS, getCourseContinuation, getCourseProgressSummary } from "@/lib/progress";

export function CourseStartLink({ course, catalogQuery }: { course: Course; catalogQuery?: string }) {
  const { snapshot, startCourse } = useProgressState();
  const progress = snapshot?.courses[course.id] ?? EMPTY_PROGRESS;
  const { lesson, isStarted } = getCourseContinuation(course, progress);
  const { isCompleted } = getCourseProgressSummary(course, progress);

  if (!lesson) return null;
  if (!snapshot) return <LoadingState label="Loading course action"><Skeleton className="h-12 w-40 rounded-full" /></LoadingState>;

  return (
    <Link
      href={withCatalogContext(`/courses/${course.id}/lessons/${lesson.id}`, catalogQuery)}
      onNavigate={() => startCourse(course.id)}
      className={buttonVariants()}
    >
      {isCompleted ? "Review course" : isStarted ? "Continue course" : "Start course"}
    </Link>
  );
}
