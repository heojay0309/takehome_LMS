"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LearningPathSkeleton } from "@/components/onboarding/LearningPathSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { AddTrackDialog } from "@/components/onboarding/AddTrackDialog";
import { useOnboardingPreference } from "@/hooks/useOnboardingPreference";
import { useProgressState } from "@/components/courses/CourseProgressProvider";
import { formatDuration } from "@/lib/courses";
import { EMPTY_PROGRESS, getCourseProgressSummary } from "@/lib/progress";
import { GOALS, LEVELS, buildLearningPlan } from "@/lib/onboarding";

/** Only the explicitly selected roadmap is shown; the catalog stays easy to reach. */
export function LearningPath() {
  const state = useOnboardingPreference();
  const params = useSearchParams();
  const { snapshot } = useProgressState();
  const requested = params.get("track");
  if (!requested) return null;
  if (!state.ready || !snapshot) return <LearningPathSkeleton />;
  const archived = state.archivedTracks.find((track) => track.goal === requested);
  const selected = state.tracks.find((track) => track.goal === requested) ?? archived;
  if (!selected) return (
    <section aria-labelledby="path-heading" className="panel-padding space-y-4 rounded-xl border bg-card">
      <h2 id="path-heading" className="text-xl">This track isn’t saved here yet</h2>
      <p className="text-sm text-muted-foreground">Choose a saved track in Your classroom, or add one for this account and browser. You can also explore the catalog below.</p>
      <AddTrackDialog />
    </section>
  );
  const courses = buildLearningPlan(selected);
  const completed = courses.filter((course) => getCourseProgressSummary(course, snapshot.courses[course.id] ?? EMPTY_PROGRESS).isCompleted).length;
  return (
    <section aria-labelledby="path-heading" className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="panel-padding border-b bg-secondary/40">
        <p className="mb-2 text-xs font-semibold tracking-widest text-primary-hover uppercase">{archived ? 'Archived learning path' : 'Your learning path'}</p>
        <h2 id="path-heading" className="text-2xl sm:text-3xl">{GOALS[selected.goal]} Track</h2>
        <p className="mt-2 text-sm text-muted-foreground">{LEVELS[selected.experience]} · {courses.length} {courses.length === 1 ? "course" : "courses"} · {formatDuration(courses.reduce((sum, course) => sum + course.durationMinutes, 0))} of catalog content</p>
        <p className="mt-2 text-sm font-medium">{completed} of {courses.length} courses complete in this track</p>
      </div>
      <div className="panel-padding space-y-8">
        {!state.storageAvailable && <p role="status" className="text-sm text-muted-foreground">Your tracks are saved only in this tab because browser storage is unavailable.</p>}
        <ol className="space-y-4">
          {courses.map((course, index) => {
            const summary = getCourseProgressSummary(course, snapshot.courses[course.id] ?? EMPTY_PROGRESS);
            return <li key={course.id} className="flex gap-4 rounded-lg border p-4">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary-hover">{summary.isCompleted ? "✓" : index + 1}</span>
              <div className="min-w-0">
                <Link href={`/courses/${course.id}`} className="inline-flex min-h-12 items-center font-semibold hover:underline">{course.title}</Link>
                <p className="text-sm text-muted-foreground">{course.difficulty} · {formatDuration(course.durationMinutes)} · {summary.isCompleted ? "Completed" : `${summary.completed} of ${summary.total} lessons complete`}</p>
                {course.difficulty === "Advanced" && <p className="mt-2 text-xs text-muted-foreground">Advanced — assumes the earlier foundations are familiar.</p>}
              </div>
            </li>;
          })}
        </ol>
        {archived ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This track is archived. Your lesson progress is kept, and you can revisit any course.</p>
            <button type="button" onClick={() => state.restore(selected.goal)}
              className={buttonVariants({ variant: 'outline' })}>
              Restore track to classroom
            </button>
          </div>
        ) : <AddTrackDialog initialAnswers={selected} />}
      </div>
    </section>
  );
}
