import { Suspense } from 'react';
import { Brand } from '@/components/layout/Brand';
import { ClassroomNav } from '@/components/layout/ClassroomNav';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { InProgressCourses } from '@/components/layout/InProgressCourses';
import { UserNav } from '@/components/layout/UserNav';
import { ThemeButtons } from '@/components/layout/ThemeButtons';
import { Skeleton } from '@/components/ui/skeleton';

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh min-h-0 flex-col overflow-y-auto border-r bg-sidebar p-4 lg:flex">
      <Brand className="shrink-0" />
      <div className="mt-8 shrink-0">
        <Suspense fallback={<Skeleton className="h-12 w-full rounded-lg" />}>
          <DashboardNav />
        </Suspense>
      </div>
      {/* Split the available middle space 2:1; each section owns its item scroller. */}
      <div className="mt-8 grid min-h-64 flex-1 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
        <Suspense fallback={<Skeleton className="h-full min-h-0 w-full rounded-lg" />}>
          <ClassroomNav />
        </Suspense>
        <InProgressCourses />
      </div>
      <div className="mt-8 shrink-0 space-y-4 border-t pt-4">
        <ThemeButtons />
        <UserNav />
      </div>
    </aside>
  );
}
