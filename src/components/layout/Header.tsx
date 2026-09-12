import { Brand } from "@/components/layout/Brand";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { UserNav } from "@/components/layout/UserNav";

export function Header() {
  return (
    <header className="border-b bg-card px-4 sm:px-8 lg:px-10">
      <div className="flex min-h-20 items-center justify-between gap-4 py-3">
        <div className="lg:hidden"><Brand /></div>
        <p className="hidden text-sm text-muted-foreground lg:block">
          A little curiosity. A world of possibility.
        </p>
        <UserNav />
      </div>
      <div className="pb-4 lg:hidden"><DashboardNav /></div>
    </header>
  );
}
