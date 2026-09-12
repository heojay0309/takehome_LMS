import { BookOpen, Sprout, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/layout/Brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <a href="#auth-content" className="sr-only fixed top-3 left-3 z-50 rounded-full bg-primary px-5 py-3 text-white focus:not-sr-only">
        Skip to sign in
      </a>
      <section aria-labelledby="auth-welcome" className="violet-veil flex flex-col p-6 text-white sm:p-10 lg:min-h-dvh lg:p-14">
        <Brand className="self-start" />
        <div className="my-auto py-10 lg:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">Welcome to your next chapter</p>
          <h1 id="auth-welcome" className="mt-5 max-w-lg text-4xl leading-tight sm:text-5xl xl:text-6xl">
            A little learning.<br />A better you.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            New skills, fresh perspectives, and small steps forward. Make space for the things you want to learn.
          </p>
          <ul className="mt-8 hidden max-w-md space-y-5 lg:block">
            <li className="flex items-center gap-4"><BookOpen className="size-5 shrink-0 text-white/75" aria-hidden="true" />Explore courses that spark your curiosity</li>
            <li className="flex items-center gap-4"><Sprout className="size-5 shrink-0 text-encouragement" aria-hidden="true" />Grow at your own pace</li>
            <li className="flex items-center gap-4"><ArrowUpRight className="size-5 shrink-0 text-white/75" aria-hidden="true" />Pick up where you left off</li>
          </ul>
        </div>
        <p className="hidden border-t border-white/15 pt-6 text-sm text-white/70 lg:block">Your pace. Your possibilities.</p>
      </section>
      <main id="auth-content" tabIndex={-1} className="flex min-w-0 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 max-w-sm text-center text-sm text-muted-foreground">A space to learn, one step at a time.</p>
      </main>
    </div>
  );
}
