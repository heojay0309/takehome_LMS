"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Learning navigation">
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className="flex min-h-11 items-center gap-3 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors duration-150 hover:bg-primary hover:text-primary-foreground"
      >
        <BookOpen className="size-5" strokeWidth={1.75} aria-hidden="true" />
        Course catalog
      </Link>
    </nav>
  );
}
