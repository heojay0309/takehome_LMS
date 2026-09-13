import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <LoadingState label="Loading account access" className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div aria-hidden="true" className="panel-padding space-y-8">
        <div className="space-y-2"><Skeleton className="mx-auto h-8 w-3/4" /><Skeleton className="mx-auto h-5 w-full" /></div>
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-px w-full" />
        {[0, 1].map((key) => <div key={key} className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-full" /></div>)}
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
      <div aria-hidden="true" className="border-t bg-muted p-4 sm:px-8"><Skeleton className="mx-auto h-5 w-3/4" /></div>
    </LoadingState>
  );
}
