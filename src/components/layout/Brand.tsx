import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Better U — course catalog"
      className={cn("inline-flex min-h-11 items-center gap-3 rounded-md", className)}
    >
      <span className="font-heading text-3xl font-semibold tracking-[-0.06em]">
        better<span className="text-primary"> u</span>
      </span>
      <span className="border-l border-current/20 pl-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
        Learning
      </span>
    </Link>
  );
}
