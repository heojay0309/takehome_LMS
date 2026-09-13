import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { ClassroomNav } from "@/components/layout/ClassroomNav";
import { Brand } from "@/components/layout/Brand";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { UserNav } from "@/components/layout/UserNav";
import { ThemeButtons } from "@/components/layout/ThemeButtons";
import { InProgressCourses } from "@/components/layout/InProgressCourses";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  return (
    <header className="page-gutters border-b bg-card lg:hidden">
      <div className="flex min-h-20 items-center justify-between gap-4 py-4">
        <Brand />
        <UserNav compact />
      </div>
      <div className="space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={<Skeleton className="h-12 w-40 rounded-lg" />}>
            <DashboardNav />
          </Suspense>
          <ThemeButtons compact />
        </div>
        <details className="group/classroom rounded-lg border bg-muted px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Your classroom <ChevronDown className="size-4 shrink-0 transition-transform group-open/classroom:rotate-180" aria-hidden="true" />
          </summary>
          <div className="py-4">
            <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}><ClassroomNav /></Suspense>
          </div>
        </details>
        <details className="group/progress rounded-lg border bg-muted px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Your in-progress courses <ChevronDown className="size-4 shrink-0 transition-transform group-open/progress:rotate-180" aria-hidden="true" />
          </summary>
          <div className="py-4"><InProgressCourses /></div>
        </details>
      </div>
    </header>
  );
}
