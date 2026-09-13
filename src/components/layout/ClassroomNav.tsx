'use client';

import { useId, useRef, useState, type RefObject } from 'react';
import { Menu } from '@base-ui/react/menu';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Archive, CheckCircle2, MoreHorizontal, Route } from 'lucide-react';
import { useProgressState } from '@/components/courses/CourseProgressProvider';
import { EMPTY_PROGRESS, getCourseProgressSummary } from '@/lib/progress';
import { getTrackProgressSummary } from '@/lib/track-progress';
import { AddTrackDialog } from '@/components/onboarding/AddTrackDialog';
import { useOnboardingPreference } from '@/hooks/useOnboardingPreference';
import { GOALS, buildLearningPlan, type Goal } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { SidebarScrollRegion } from '@/components/layout/SidebarScrollRegion';
import { LoadingState } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';

export function ClassroomNav() {
  const { userId } = useOnboardingPreference();
  return <ClassroomNavSession key={userId} />;
}

function TrackActionsMenu({
  goal,
  onArchive,
  feedbackRef,
  canArchive,
}: {
  goal: Goal;
  canArchive: boolean;
  onArchive: () => boolean;
  feedbackRef: RefObject<HTMLParagraphElement | null>;
}) {
  const descriptionId = useId();
  const archivedRef = useRef(false);
  return (
    <Menu.Root
      modal={false}
      onOpenChange={(open) => {
        if (open) archivedRef.current = false;
      }}
    >
      <Menu.Trigger
        aria-label={`Actions for ${GOALS[goal]}`}
        className="flex size-12 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary-hover data-popup-open:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          sideOffset={8}
          align="end"
          className="z-50 outline-none"
        >
          <Menu.Popup
            // Archiving removes the trigger; Escape/dismiss still returns to it.
            finalFocus={() =>
              archivedRef.current ? feedbackRef.current : true
            }
            className="w-64 max-w-[calc(100vw-2rem)] rounded-xl border bg-card p-2 text-foreground shadow-lg outline-none"
          >
            <Menu.Item
              label="Archive track"
              disabled={!canArchive}
              aria-label="Archive track"
              aria-describedby={descriptionId}
              onClick={() => {
                archivedRef.current = onArchive();
              }}
              className="flex min-h-12 cursor-pointer items-start gap-4 rounded-lg p-4 outline-none data-highlighted:bg-secondary data-disabled:cursor-not-allowed data-disabled:text-muted-foreground"
            >
              <Archive
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Archive track
                </span>
                <span
                  id={descriptionId}
                  className="mt-2 block text-xs text-muted-foreground"
                >
                  {canArchive ? 'Hide from your classroom. Progress is kept.' : 'Complete every lesson to archive this track.'}
                </span>
              </span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ClassroomNavSession() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { tracks, archivedTracks, ready, archive, restore, storageAvailable } =
    useOnboardingPreference();
  const { snapshot } = useProgressState();
  const [message, setMessage] = useState('');
  const [lastArchivedGoal, setLastArchivedGoal] = useState<Goal | null>(null);
  const undoGoal = archivedTracks.some(
    (track) => track.goal === lastArchivedGoal,
  )
    ? lastArchivedGoal
    : null;
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  function moveTrack(goal: Goal, toArchive: boolean) {
    if (toArchive) {
      const track = tracks.find((track) => track.goal === goal);
      if (
        !track ||
        !snapshot ||
        !getTrackProgressSummary(buildLearningPlan(track), snapshot.courses)
          .isCompleted
      )
        return false;
      archive(goal);
      setLastArchivedGoal(goal);
    } else {
      restore(goal);
      setLastArchivedGoal(null);
    }
    setMessage(
      `${GOALS[goal]} ${toArchive ? 'archived' : 'restored'}. Lesson progress is kept.`,
    );
    // Keep keyboard focus in the navigation when the action removes its row.
    feedbackRef.current?.focus();
    return true;
  }
  const selected = pathname === '/' ? params.get('track') : null;
  const row =
    'flex min-h-12 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition-colors';
  return (
    <nav aria-label="Your classroom" className="flex h-full min-h-0 flex-col gap-4">
      <h2 className="hidden shrink-0 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase lg:block">
        Your classroom
      </h2>
      <SidebarScrollRegion label="Your classroom navigation" className="max-h-80 space-y-4 lg:max-h-none lg:flex-1">
      {!ready ? (
        <LoadingState label="Loading tracks" className="space-y-4 px-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </LoadingState>
      ) : tracks.length === 0 ? (
        <p className="px-2 text-sm text-muted-foreground">
          {archivedTracks.length > 0
            ? 'No active tracks. Restore an archived track below or add a new one.'
            : 'Add a track to build your classroom.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {tracks.map((track) => {
            const courses = buildLearningPlan(track);
            const progress = snapshot
              ? getTrackProgressSummary(courses, snapshot.courses)
              : null;
            const activeCourse = courses.some(
              (c) =>
                pathname === `/courses/${c.id}` ||
                pathname.startsWith(`/courses/${c.id}/`),
            );
            const expanded = selected === track.goal || activeCourse;
            return (
              <li key={track.goal}>
                <div
                  className={cn(
                    'flex w-full items-start rounded-lg transition-colors hover:bg-secondary focus-within:bg-secondary has-[[data-popup-open]]:bg-secondary',
                    expanded && 'bg-secondary text-secondary-foreground',
                  )}
                >
                  <Link
                    href={`/?track=${track.goal}#learning-path`}
                    aria-current={selected === track.goal ? 'page' : undefined}
                    className={cn(row, 'min-w-0 flex-1')}
                  >
                    {progress?.isCompleted ? (
                      <CheckCircle2
                        className="size-4 shrink-0 text-primary-hover"
                        aria-hidden="true"
                      />
                    ) : (
                      <Route className="size-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block">{GOALS[track.goal]}</span>
                      <span className="mt-2 block text-xs font-normal text-muted-foreground">
                        {progress
                          ? `${progress.status} · ${progress.percent}%`
                          : 'Loading progress…'}
                      </span>
                    </span>
                  </Link>
                  <TrackActionsMenu
                    goal={track.goal}
                    canArchive={progress?.isCompleted ?? false}
                    onArchive={() => moveTrack(track.goal, true)}
                    feedbackRef={feedbackRef}
                  />
                </div>
                {expanded && (
                  <>
                    <ol className="ml-4 mt-2 space-y-2 border-l pl-4">
                      {courses.map((course, index) => {
                        const courseProgress = snapshot
                          ? getCourseProgressSummary(
                              course,
                              snapshot.courses[course.id] ?? EMPTY_PROGRESS,
                            )
                          : null;
                        const href = `/courses/${course.id}`;
                        const active =
                          pathname === href || pathname.startsWith(`${href}/`);
                        return (
                          <li key={course.id}>
                            <Link
                              href={href}
                              aria-current={
                                pathname === href
                                  ? 'page'
                                  : active
                                    ? 'location'
                                    : undefined
                              }
                              className={cn(
                                'block min-h-12 rounded-md px-2 py-2 text-sm hover:bg-muted',
                                active
                                  ? 'font-semibold text-primary-hover'
                                  : 'text-muted-foreground',
                              )}
                            >
                              <span className="mr-1 tabular-nums">
                                {index + 1}.
                              </span>{' '}
                              {course.title}
                              {courseProgress && (
                                <span className="mt-2 block text-xs font-normal text-muted-foreground">
                                  {courseProgress.isCompleted
                                    ? '✓ Completed'
                                    : `${courseProgress.completed}/${courseProgress.total} lessons complete`}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                    {progress && (
                      <div className="px-4 pt-4">
                        <div className="flex flex-col gap-2">
                          <div
                            role="progressbar"
                            aria-label={`${GOALS[track.goal]} track progress`}
                            aria-valuenow={progress.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuetext={`${progress.completed} of ${progress.total} lessons complete`}
                            className="h-1.5 overflow-hidden rounded-full bg-secondary"
                          >
                            <div
                              className="h-full rounded-full bg-progress"
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {progress.completedCourses} of {courses.length}{' '}
                            courses complete
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {ready && archivedTracks.length > 0 && (
        <details className="rounded-lg border border-border px-2">
          <summary className="min-h-12 cursor-pointer py-4 text-xs font-semibold text-muted-foreground">
            Archived tracks ({archivedTracks.length})
          </summary>
          <ul className="space-y-2 pb-4">
            {archivedTracks.map((track) => (
              <li key={track.goal} className="text-sm">
                <Link
                  href={`/?track=${track.goal}#learning-path`}
                  aria-current={selected === track.goal ? 'page' : undefined}
                  className="block min-h-12 rounded-md py-4 font-medium hover:underline"
                >
                  {GOALS[track.goal]}
                </Link>
                <button
                  type="button"
                  onClick={() => moveTrack(track.goal, false)}
                  aria-label={`Restore ${GOALS[track.goal]}`}
                  className="min-h-11 rounded-md px-2 text-xs font-semibold text-primary-hover hover:bg-secondary"
                >
                  Restore track
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      </SidebarScrollRegion>
      <div className="shrink-0 space-y-2">
      <div
        className={
          message ? 'rounded-lg border bg-secondary/40 px-2 py-2' : 'sr-only'
        }
      >
        <p
          ref={feedbackRef}
          role="status"
          tabIndex={-1}
          className="rounded-md text-xs text-muted-foreground"
        >
          {message}
        </p>
        {undoGoal && (
          <button
            type="button"
            onClick={() => moveTrack(undoGoal, false)}
            aria-label={`Undo archiving ${GOALS[undoGoal]}`}
            className="mt-2 min-h-12 rounded-md px-2 text-xs font-semibold text-primary-hover hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Undo
          </button>
        )}
      </div>
      {ready && !storageAvailable && (
        <p role="status" className="px-2 text-xs text-muted-foreground">
          Track changes are saved only in this tab because browser storage is
          unavailable.
        </p>
      )}
      <AddTrackDialog
        className={cn(
          row,
          'w-full border border-dashed border-input text-primary-hover hover:bg-secondary disabled:opacity-50',
        )}
      />
      </div>
    </nav>
  );
}
