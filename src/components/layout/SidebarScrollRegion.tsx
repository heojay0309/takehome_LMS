'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Native scrolling with a thumb that disappears after a short idle period. */
export function SidebarScrollRegion({ children, label, className }: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const [scrolling, setScrolling] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (idleTimer.current !== null) clearTimeout(idleTimer.current);
  }, []);

  function onScroll() {
    setScrolling(true);
    if (idleTimer.current !== null) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setScrolling(false), 800);
  }

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
      data-scrolling={scrolling ? 'true' : undefined}
      className={cn(
        'sidebar-scrollbar min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-lg p-1 lg:-mr-2 lg:pr-4 [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      {children}
    </div>
  );
}
