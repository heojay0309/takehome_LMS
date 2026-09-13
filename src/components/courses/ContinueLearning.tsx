'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useProgressState } from '@/components/courses/CourseProgressProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourses } from '@/lib/courses';
import { getInProgressCourses } from '@/lib/progress';

export function ContinueLearningSkeleton() {
  return (
    <div role="status" aria-label="Loading your next lesson">
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}

/** One shortcut, not another progress overview; the full list lives in navigation. */
export function ContinueLearning() {
  const { snapshot } = useProgressState();
  if (!snapshot) return <ContinueLearningSkeleton />;
  const current = getInProgressCourses(getCourses(), snapshot.courses)[0];
  // Discovery is already directly below. Avoid a redundant welcome/completion card.
  if (!current) return null;

  const { course, lesson } = current;
  const isLastLesson = snapshot.courses[course.id]?.lastVisited?.lessonId === lesson.id;
  return (
    <Link
      href={`/courses/${course.id}/lessons/${lesson.id}`}
      aria-label={`Resume ${course.title}: ${lesson.title}`}
      className="flex min-h-20 items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-secondary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <PlayCircle className="size-5 shrink-0 text-primary-hover" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-primary-hover">
          {isLastLesson ? 'Resume your last lesson' : 'Continue learning'}
        </span>
        <span className="mt-2 block text-sm text-muted-foreground">
          {course.title} · {lesson.title}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-primary-hover" aria-hidden="true" />
    </Link>
  );
}
