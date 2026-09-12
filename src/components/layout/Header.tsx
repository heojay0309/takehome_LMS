import Link from "next/link";
import { UserNav } from "@/components/layout/UserNav";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          BetterU LMS
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
