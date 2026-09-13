import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export function LearningPathSkeleton() {
  return (
    <LoadingState label="Loading learning path" className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div aria-hidden="true" className="panel-padding space-y-4 border-b bg-secondary/40">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div aria-hidden="true" className="panel-padding space-y-4">
        {[0, 1, 2].map((key) => <Skeleton key={key} className="h-24 w-full rounded-lg" />)}
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </LoadingState>
  );
}
