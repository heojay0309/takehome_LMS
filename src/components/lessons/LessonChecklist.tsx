"use client";

import Link from "next/link";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/courses";

type LessonChecklistProps = {
  course: Course;
  activeLessonId: string;
};

export function LessonChecklist({ course, activeLessonId }: LessonChecklistProps) {
  const { isComplete, toggleLesson } = useCourseProgress(course);

  return (
    <div className="space-y-6">
      {course.modules.map((module) => (
        <section key={module.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {module.title}
          </h3>
          <ul className="space-y-2">
            {module.lessons.map((lesson) => {
              const completed = isComplete(lesson.id);
              const isActive = lesson.id === activeLessonId;

              return (
                <li
                  key={lesson.id}
                  className={cn(
                    "rounded-lg border px-3 py-2",
                    isActive
                      ? "border-foreground bg-zinc-50 dark:bg-zinc-900"
                      : "border-zinc-200 dark:border-zinc-800",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={() => toggleLesson(lesson.id)}
                      aria-label={`Mark ${lesson.title} complete`}
                      className="mt-1 h-4 w-4 rounded border-zinc-300"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="block font-medium hover:underline"
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {lesson.durationMinutes} min
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
