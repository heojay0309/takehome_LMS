'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { useProgressState } from '@/components/courses/CourseProgressProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourses } from '@/lib/courses';
import { getInProgressCourses } from '@/lib/progress';
import { cn } from '@/lib/utils';
import { SidebarScrollRegion } from '@/components/layout/SidebarScrollRegion';

export function InProgressCourses() {
  const { snapshot } = useProgressState();
  const pathname = usePathname();
  const courses = getInProgressCourses(getCourses(), snapshot?.courses ?? {});

  return (
    <nav aria-label="Courses in progress" className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="flex shrink-0 items-center justify-between gap-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        In progress
        {snapshot && (
          <span className="rounded-full bg-secondary px-2 py-0.5 tabular-nums text-secondary-foreground">
            {courses.length}
          </span>
        )}
      </h2>
      {snapshot === null ? (
        <div role="status" className="space-y-2 px-2">
          <span className="sr-only">Loading your courses…</span>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : courses.length === 0 ? (
        <p className="px-2 text-sm text-muted-foreground">
          Start a course and pick up where you left off here.
        </p>
      ) : (
        <SidebarScrollRegion label="In-progress course navigation" className="max-h-72 lg:max-h-none lg:flex-1">
        <ul className="space-y-2">
          {courses.map(({ course, lesson, percent }) => {
            const coursePath = `/courses/${course.id}`;
            const href = `${coursePath}/lessons/${lesson.id}`;
            const isActive =
              pathname === coursePath || pathname.startsWith(`${coursePath}/`);
            return (
              <li key={course.id}>
                <Link
                  href={href}
                  aria-current={
                    pathname === href
                      ? 'page'
                      : isActive
                        ? 'location'
                        : undefined
                  }
                  aria-label={`Resume ${course.title}, ${percent}% complete`}
                  className={cn(
                    'block rounded-lg border p-4 transition-colors hover:border-primary hover:bg-secondary',
                    isActive
                      ? 'border-primary bg-secondary'
                      : 'border-transparent bg-muted',
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm leading-snug font-semibold">
                      {course.title}
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 size-4 shrink-0 text-primary-hover"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {percent === 0 ? 'Ready to begin' : 'Continue learning'}
                    </span>
                    <span className="tabular-nums">{percent}%</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-2 block h-1.5 overflow-hidden rounded-full bg-border"
                  >
                    <span
                      className="block h-full rounded-full bg-progress transition-[width] duration-[380ms]"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        </SidebarScrollRegion>
      )}
    </nav>
  );
}
