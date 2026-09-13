import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseGridSkeleton() {
  return (
    <LoadingState label="Loading courses" className="catalog-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-card">
          <Skeleton className="aspect-video shrink-0 rounded-none" />
          <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
            <div className="flex gap-2"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="mt-auto space-y-4 pt-4">
              <Skeleton className="h-12 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </LoadingState>
  );
}

function FilterFieldSkeleton() {
  return <div className="min-w-0 space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-12 w-full" /></div>;
}

export function CourseCatalogSkeleton() {
  return (
    <div className="catalog-surface space-y-8">
      <div aria-hidden="true" className="catalog-toolbar">
        <FilterFieldSkeleton />
        <div className="catalog-filters">{[0, 1, 2].map((key) => <FilterFieldSkeleton key={key} />)}</div>
      </div>
      <div aria-hidden="true" className="flex min-h-12 items-center"><Skeleton className="h-5 w-40" /></div>
      <CourseGridSkeleton />
    </div>
  );
}

export function LessonChecklistSkeleton() {
  return (
    <LoadingState label="Loading course progress" className="space-y-8">
      <div aria-hidden="true" className="space-y-4 rounded-lg border bg-muted p-4">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      {[0, 1].map((section) => (
        <div key={section} aria-hidden="true" className="space-y-4">
          <Skeleton className="h-5 w-2/3" />
          {[0, 1, 2].map((lesson) => <Skeleton key={lesson} className="h-20 w-full rounded-lg" />)}
        </div>
      ))}
    </LoadingState>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-40 rounded-full" />
      <LoadingState label="Loading course details" className="grid items-start gap-8 xl:grid-cols-[1.2fr_1fr]">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div aria-hidden="true" className="min-w-0 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </LoadingState>
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <LessonChecklistSkeleton />
      </div>
    </div>
  );
}

export function LessonPlayerSkeleton() {
  return <LoadingState label="Loading lesson player"><Skeleton className="lesson-player-frame rounded-xl" /></LoadingState>;
}
