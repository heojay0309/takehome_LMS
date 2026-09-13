import { Brand } from '@/components/layout/Brand';
import { AuthVideo } from '@/components/layout/AuthVideo';
import { ThemeButtons } from '@/components/layout/ThemeButtons';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <a
        href="#auth-content"
        className="sr-only fixed top-4 left-4 z-50 rounded-full bg-primary px-4 py-4 text-primary-foreground focus:not-sr-only"
      >
        Skip to account access
      </a>
      <aside aria-labelledby="auth-story-heading" className="auth-story violet-veil relative isolate overflow-hidden text-white">
        <AuthVideo />
        <div className="relative z-10 flex min-h-full flex-col p-8 xl:p-12">
          <Brand inverse className="self-start [&_span]:text-white" />
          <div className="my-auto py-16">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">Your next chapter</p>
            <h2 id="auth-story-heading" className="mt-8 max-w-lg text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.12]">
              A little learning.<br />A better you.
            </h2>
            <p className="mt-8 max-w-sm text-lg leading-relaxed text-white/90">
              New skills, fresh perspectives, and small steps forward.
              Make space for the things you want to learn.
            </p>
          </div>
          <p className="max-w-[calc(100%-10rem)] text-sm text-white/80">Your pace. Your possibilities.</p>
        </div>
      </aside>
      <main id="auth-content" tabIndex={-1} className="auth-form-area flex min-w-0 flex-col px-4 py-8 sm:px-8">
        <header className="mx-auto mb-8 flex w-full max-w-[26rem] flex-wrap items-center justify-between gap-4">
          <div className="auth-mobile-brand"><Brand /></div>
          <div className="ml-auto"><ThemeButtons /></div>
        </header>
        <div className="mx-auto my-auto w-full max-w-[26rem] py-2">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary-hover uppercase">Better U Learning</p>
            <h1 className="text-2xl leading-tight sm:text-3xl">Your space to grow.</h1>
            <p className="mt-2 text-sm text-muted-foreground">One small step starts here.</p>
          </div>
          {children}
        </div>
        <p className="mx-auto mt-8 max-w-[26rem] text-center text-xs text-muted-foreground">
          Learn something new. At your own pace.
        </p>
      </main>
    </div>
  );
}
