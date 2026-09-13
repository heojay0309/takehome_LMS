import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
export function Brand({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Better U — course catalog"
      className={cn(
        'inline-flex min-h-12 items-center gap-4 rounded-md',
        className,
      )}
    >
      <Image
        src="https://cdn.prod.website-files.com/60bec73c3161d258cff8900b/63dc839fa80e94c3c72dc7cc_2022%20Logo.png"
        alt="betterU"
        width={56}
        height={40}
        className={inverse ? 'hidden' : 'h-10 w-14 object-contain dark:hidden'}
      />
      <Image
        src="https://cdn.prod.website-files.com/60bec73c3161d258cff8900b/65f4edf00a019f1d7867c5e8_betterulogo-white%201.png"
        alt="betterU"
        width={56}
        height={40}
        className={inverse ? 'h-10 w-14 object-contain' : 'hidden h-10 w-14 object-contain dark:block'}
      />
      <span className="border-l border-current/20 pl-4 text-[10px] font-semibold tracking-[0.18em] uppercase">
        Learning
      </span>
    </Link>
  );
}
