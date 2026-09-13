import { CourseProgressProvider, ProgressStorageNotice } from "@/components/courses/CourseProgressProvider";
import { TrackProvider } from "@/hooks/useOnboardingPreference";
import { LessonPlaybackProvider } from "@/components/lessons/LessonPlaybackProvider";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CourseProgressProvider><TrackProvider><LessonPlaybackProvider>
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only fixed top-4 left-4 z-50 rounded-full bg-primary px-4 py-4 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="page-gutters mx-auto w-full max-w-7xl flex-1 py-8 lg:py-16">
          <ProgressStorageNotice />
          {children}
        </main>
        <footer className="page-gutters mx-auto w-full max-w-7xl pb-8 text-sm text-muted-foreground">
          Better U Learning · One step at a time.
        </footer>
      </div>
    </div>
    </LessonPlaybackProvider></TrackProvider></CourseProgressProvider>
  );
}
