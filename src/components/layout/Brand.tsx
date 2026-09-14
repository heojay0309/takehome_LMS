import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Brand({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Learning dashboard — course catalog"
      className={cn('inline-flex min-h-12 items-center gap-3 rounded-md', inverse && 'text-white', className)}
    >
      <BookOpen aria-hidden="true" className="size-8 shrink-0" />
      <span className="text-sm font-semibold tracking-wide">Learning</span>
    </Link>
  );
}
