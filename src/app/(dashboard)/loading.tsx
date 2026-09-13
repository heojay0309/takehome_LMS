import { CourseCatalogSkeleton } from "@/components/courses/CourseSkeletons";
import { ContinueLearningSkeleton } from "@/components/courses/ContinueLearning";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-9 w-64 max-w-full" />
        <ContinueLearningSkeleton />
      </div>
      <div className="space-y-8">
        <div aria-hidden="true" className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-6 w-80 max-w-full" />
        </div>
        <CourseCatalogSkeleton />
      </div>
    </div>
  );
}
