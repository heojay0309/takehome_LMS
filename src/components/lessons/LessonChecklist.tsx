"use client";

import Link from "next/link";
import { CourseCompletionNotice } from "@/components/courses/CourseCompletionNotice";
import { CourseProgressBar } from "@/components/courses/CourseProgressBar";
import { LessonChecklistSkeleton } from "@/components/courses/CourseSkeletons";
import { Badge } from "@/components/ui/badge";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/courses";
import { getLessonProgressSummary } from "@/lib/progress";
import { withCatalogContext } from "@/lib/catalog-state";

type LessonChecklistProps = {
  course: Course;
  activeLessonId?: string;
  catalogQuery?: string;
};

export function LessonChecklist({ course, activeLessonId, catalogQuery }: LessonChecklistProps) {
  const { progress, isComplete, toggleLesson, percent, completed, total, isCompleted, isReady } = useCourseProgress(course);

  if (!isReady) return <LessonChecklistSkeleton />;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border bg-muted p-4">
        <CourseProgressBar percent={percent} />
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{completed} of {total} lessons complete · {percent}%</span>
          {isCompleted && <Badge className="border border-primary">Completed</Badge>}
        </div>
        {completed === 0 && (
          <p className="text-sm text-muted-foreground">
            {total === 0 ? "No lessons available yet." : "Your next step starts here. Complete a lesson to begin tracking your progress."}
          </p>
        )}
      </div>
      {!activeLessonId && <CourseCompletionNotice completed={isCompleted} total={total} catalogQuery={catalogQuery} />}
      {course.modules.map((courseModule) => {
        const summary = getLessonProgressSummary(courseModule.lessons, progress);
        return <section key={courseModule.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {courseModule.title}
            </h3>
            <p className="text-sm text-muted-foreground">{summary.completed} of {summary.total} lessons complete</p>
          </div>
          <ul className="space-y-2">
            {courseModule.lessons.map((lesson) => {
              const completed = isComplete(lesson.id);
              const isActive = lesson.id === activeLessonId;

              return (
                <li
                  key={lesson.id}
                  className={cn(
                    "rounded-lg border px-4 py-2",
                    isActive
                      ? "border-primary bg-secondary"
                      : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <label className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-secondary">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => toggleLesson(lesson.id)}
                        className="size-5 cursor-pointer rounded border-input accent-primary"
                      />
                      <span className="sr-only">Mark {lesson.title} {completed ? "incomplete" : "complete"}</span>
                    </label>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={withCatalogContext(`/courses/${course.id}/lessons/${lesson.id}`, catalogQuery)}
                        aria-current={isActive ? "page" : undefined}
                        className="flex min-h-12 items-center font-medium hover:underline"
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {lesson.durationMinutes} min
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>;
      })}
    </div>
  );
}
