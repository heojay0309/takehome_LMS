"use client";

import Link from "next/link";
import { useCallback } from "react";
import { NextLessonLink } from "@/components/lessons/NextLessonLink";
import { useLessonPlayback } from "@/components/lessons/LessonPlaybackProvider";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, CheckCircle2, Trophy } from "lucide-react";
import { MockVideoPlayer } from "@/components/lessons/MockVideoPlayer";
import { useProgressState } from "@/components/courses/CourseProgressProvider";
import { LessonPlayerSkeleton } from "@/components/courses/CourseSkeletons";
import { getCatalogReturnHref, withCatalogContext } from "@/lib/catalog-state";
import { getLessonCompletionState } from "@/lib/lesson-completion";
import { EMPTY_PROGRESS } from "@/lib/progress";
import type { Course, Lesson } from "@/lib/courses";

const endActionClass = "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&_svg]:size-4 [&_svg]:shrink-0";

export function LessonVideoPlayer({ course, lesson, moduleTitle, catalogQuery }: {
  course: Course;
  lesson: Lesson;
  moduleTitle: string;
  catalogQuery?: string;
}) {
  const { user } = useUser();
  const { snapshot, completeLesson } = useProgressState();
  const { consume } = useLessonPlayback();
  const consumeAutoPlay = useCallback(() => consume(course.id, lesson.id), [consume, course.id, lesson.id]);
  // Do not allow playback to finish before the signed-in progress store exists.
  if (!snapshot) return <LessonPlayerSkeleton />;
  const state = getLessonCompletionState(course, lesson.id, snapshot.courses[course.id] ?? EMPTY_PROGRESS);
  const courseHref = withCatalogContext(`/courses/${course.id}`, catalogQuery);
  const Icon = state.isCompleted ? Trophy : CheckCircle2;

  return (
    <MockVideoPlayer
      key={`${user?.id}:${lesson.id}`}
      title={lesson.title}
      durationMinutes={lesson.durationMinutes}
      courseTitle={course.title}
      moduleTitle={moduleTitle}
      poster={course.thumbnail}
      onComplete={() => completeLesson(course.id, lesson.id)}
      consumeAutoPlay={consumeAutoPlay}
      endScreen={
        <div className="mx-auto w-full max-w-xl space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-amber-200 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500">
            <Icon className="size-7 sm:size-8" aria-hidden="true" />
          </div>
          <div role="status" aria-atomic="true" className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">{state.isCompleted ? "Course complete" : state.lessonComplete ? "Lesson complete" : "Preview finished"}</p>
            <h2 className="text-2xl leading-snug text-balance sm:text-3xl">{state.isCompleted ? "You did it. A new milestone, earned." : state.lessonComplete ? "One lesson closer. Keep it going!" : "Ready for your next step?"}</h2>
            <p className="text-sm text-white/80">{state.isCompleted ? course.title : lesson.title}</p>
            <p className="text-sm text-white/80">{state.completed} of {state.total} lessons complete · {state.percent}%</p>
          </div>
          <div role="progressbar" aria-label="Course completion" aria-valuenow={state.percent} aria-valuemin={0} aria-valuemax={100} className="mx-auto h-2 max-w-sm overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-emerald-300 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${state.percent}%` }} />
          </div>
          {!snapshot.storageAvailable && <p role="status" className="text-xs text-amber-200">Progress is saved only in this tab and may be lost on refresh.</p>}
          {state.isCompleted ? (
            <div className="space-y-4">
              <p className="text-sm text-white/80">Every lesson finished. Take a moment to enjoy what you’ve accomplished.</p>
              <Link href={getCatalogReturnHref(catalogQuery)} className={endActionClass}>Explore more courses <ArrowRight aria-hidden="true" /></Link>
              <Link href={courseHref} className="mx-auto flex min-h-12 w-fit items-center text-sm text-white/80 underline underline-offset-4 hover:text-white">Review your course</Link>
            </div>
          ) : state.nextLesson ? (
            <div className="space-y-4">
              <p className="text-sm text-white/80">{state.isSequentialNext ? "Up next" : "Still to finish"}: {state.nextLesson.title} · {state.nextLesson.durationMinutes} min</p>
              <NextLessonLink courseId={course.id} lessonId={state.nextLesson.id} catalogQuery={catalogQuery} className={endActionClass}>
                {state.isSequentialNext ? "Next lesson" : "Continue learning"} <ArrowRight aria-hidden="true" />
              </NextLessonLink>
            </div>
          ) : <Link href={courseHref} className={endActionClass}>Review course progress</Link>}
        </div>
      }
    />
  );
}
