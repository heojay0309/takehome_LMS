'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { NextLessonLink } from '@/components/lessons/NextLessonLink';
import { useProgressState } from '@/components/courses/CourseProgressProvider';
import { withCatalogContext } from '@/lib/catalog-state';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { getAllLessons, type Course } from '@/lib/courses';

export function LessonNavigation({ course, lessonId, catalogQuery }: { course: Course; lessonId: string; catalogQuery?: string }) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const { isComplete, toggleLesson, isReady, isCompleted } = useCourseProgress(course);
  const { visitLesson } = useProgressState();

  // Record actual lesson visits, including direct URLs and new tabs. Do not
  // record overview visits, prefetches, or subsequent checkbox changes.
  useEffect(() => {
    if (isReady) visitLesson(course.id, lessonId);
  }, [course.id, lessonId, isReady, visitLesson]);

  return (
    <nav aria-label="Lesson navigation" className="space-y-4 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted-foreground">
          Lesson {index + 1} of {lessons.length}
          {isReady && (isCompleted ? ' · Course complete' : isComplete(lessonId) ? ' · Completed' : '')}
        </p>
        <label className="flex min-h-12 cursor-pointer items-center gap-4 text-sm font-medium">
          <input type="checkbox" checked={isComplete(lessonId)} disabled={!isReady} onChange={() => toggleLesson(lessonId)} className="size-5 shrink-0 accent-primary" />
          Mark lesson complete
        </label>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {previous && <Link href={withCatalogContext(`/courses/${course.id}/lessons/${previous.id}`, catalogQuery)} className={buttonVariants({ variant: 'ghost', className: 'self-start' })}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Previous lesson
        </Link>}
        <div className="min-w-0 space-y-2 sm:ml-auto sm:max-w-[55%] sm:text-right">
          <p className="text-xs text-muted-foreground">{next ? `Next: ${next.title} · ${next.durationMinutes} min` : 'End of the lesson sequence. Review your progress in the course outline.'}</p>
          {/* The primary next-step action lives in the video end screen.
              Keep these quieter controls available for skipping and review. */}
          {next ? (
            <NextLessonLink courseId={course.id} lessonId={next.id} catalogQuery={catalogQuery} className={buttonVariants({ variant: 'ghost' })}>
              Next lesson <ArrowRight className="size-4" aria-hidden="true" />
            </NextLessonLink>
          ) : (
            <Link href={withCatalogContext(`/courses/${course.id}`, catalogQuery)} className={buttonVariants({ variant: 'ghost' })}>
              Back to course <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
