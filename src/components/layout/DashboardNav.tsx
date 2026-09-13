'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === '/' && !params.get('track');

  return (
    <nav aria-label="Learning navigation">
      <Link
        href="/"
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-12 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary',
          active && 'bg-secondary text-secondary-foreground',
        )}
      >
        <BookOpen className="size-4 shrink-0" aria-hidden="true" />
        Course catalog
      </Link>
    </nav>
  );
}
