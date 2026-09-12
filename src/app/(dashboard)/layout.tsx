import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-50 rounded-full bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="min-w-0">
        <Header />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 text-sm text-muted-foreground sm:px-8 lg:px-10">
          Better U Learning · One step at a time.
        </footer>
      </div>
    </div>
  );
}
