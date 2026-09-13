import { LessonPlayerSkeleton } from "@/components/courses/CourseSkeletons";
import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <LoadingState label="Loading lesson" className="flex flex-wrap items-center justify-between gap-4">
        <div aria-hidden="true" className="w-full max-w-lg space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </LoadingState>
      <div className="space-y-4">
        <LessonPlayerSkeleton />
        <Skeleton className="h-8 w-full" />
        <div aria-hidden="true" className="space-y-4 border-t pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}
