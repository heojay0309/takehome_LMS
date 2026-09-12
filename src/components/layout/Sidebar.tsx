import { Sprout } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { DashboardNav } from "@/components/layout/DashboardNav";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar px-6 py-8 lg:flex">
      <Brand />
      <div className="mt-14">
        <p className="mb-4 px-5 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Your classroom
        </p>
        <DashboardNav />
      </div>
      <div className="mt-auto rounded-xl bg-muted p-5">
        <Sprout className="mb-3 size-6 text-progress" strokeWidth={1.75} aria-hidden="true" />
        <p className="font-heading text-lg font-semibold">A little, every day.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make space to learn something new. Your next step starts here.
        </p>
      </div>
      <p className="mt-6 px-2 text-xs text-muted-foreground">Your pace. Your possibilities.</p>
    </aside>
  );
}
