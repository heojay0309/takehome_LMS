# BetterU LMS

A frontend take-home built with Next.js 16 (App Router), React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), and Clerk.

## Status

Day 1 setup: Clerk integration, route groups, shadcn configuration, and shared styling. Existing catalog, lesson, and progress scaffolding is preserved; this is **not yet a completed submission**. See [the assignment](./Take_Home.md) for the full requirements.

## Setup

Use Node.js 22 LTS and pnpm 10.12.4 (pinned in `package.json`).

```bash
pnpm install --frozen-lockfile
```

Create `.env.local` with keys from your Clerk application's dashboard:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

Never commit real keys. `.env.local` and Clerk's local configuration are ignored by Git.

```bash
pnpm dev
```

Open http://localhost:3000. Dashboard requests require authentication; `/sign-in` and `/sign-up` are public.

## Architecture

```text
data/courses.json              Provided catalog; original schema preserved
src/
  app/
    (auth)/                    Clerk sign-in and sign-up catch-all routes
    (dashboard)/
      page.tsx                 Catalog
      courses/[courseId]/
        page.tsx               Course detail and modules
        lessons/[lessonId]/
          page.tsx             Lesson and mock player
    layout.tsx                 ClerkProvider, metadata, and Geist fonts
    globals.css                Tailwind and shadcn theme tokens
  components/
    courses/                   Catalog, cards, search, and filters
    lessons/                   Checklist and mock player
    layout/                    Header and Clerk user controls
    ui/                        Shared UI primitives
  hooks/                       useDebouncedValue and useCourseProgress
  lib/                         Typed catalog and localStorage helpers
  proxy.ts                     Clerk request protection (Next.js 16 convention)
components.json                shadcn preset, aliases, and CSS configuration
```

Routes and layouts use Server Components by default. Interactive controls and hooks use Client Components. Lesson completion stays in browser `localStorage`, keyed by Clerk user ID and course ID; there is no backend or database.

shadcn/ui is initialized with the `base-vega` preset and neutral theme. Add primitives as needed rather than installing the entire component library:

```bash
pnpm dlx shadcn@latest add <component>
```

Review generated changes before replacing existing primitives or their call sites.

## Validation

```bash
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
```

Setup verification in the agent environment:

- Route generation and TypeScript checks pass.
- Lint reports two pre-existing issues: synchronous effect-driven state in `useCourseProgress.ts`, and a variable named `module` in `lib/courses.ts`. These remain follow-up work, not suppressed rules.
- Production build is blocked by the sandbox denying Turbopack's local process/port operation. Run `pnpm build` outside that restriction before deployment.
- Browser sign-in/sign-out and protected-route redirects have not been verified end to end.

## Deployment

Deployment is deferred until the core flows and checks are complete.

1. Import the repository into Vercel as a Next.js project.
2. Configure the Clerk environment variables above for the intended deployment environment. Use production keys for production and keep `CLERK_SECRET_KEY` server-only.
3. Configure the production domain in Clerk and complete its production setup. Configure preview environments separately; do not broadly allow arbitrary preview origins.
4. Deploy and verify signed-out redirects, sign-in, user controls/sign-out, and direct navigation to course and lesson routes.

## Trade-offs and remaining work

- This pass stops at setup and documentation; existing feature scaffolding was retained rather than rewritten.
- Static course data and per-browser progress follow the brief. Cross-device sync, backend services, real streaming, and admin features are deliberately out of scope.
- Remaining work includes the lint issues, completion filters/badges, consistent 0% progress, loading states, persistence validation, and responsive/accessibility testing.
- Dark-theme tokens exist, but a theme switcher is not part of this setup.

## AI Usage

The previous project notes record Cursor assistance for Clerk integration and initial scaffolding. This setup pass used an AI coding assistant in Pi/Paseo for repository inspection, cleanup, and documentation; shadcn initialization was run manually in the developer's terminal after agent-side package-manager failures.

Useful prompts/workflows:

1. “Bootstrap the LMS dashboard's foundation and authentication; stop after setup and README.” This kept the pass bounded rather than adding more features.
2. Compare the installed Next.js documentation with the existing structure, then validate with lint, route generation, and TypeScript.
3. Review the generated shadcn theme against the root layout and preserve existing course work during cleanup.

**Correction:** The earlier AI-assisted README justified keeping deprecated `middleware.ts` merely to match the assignment's suggested tree. This pass renamed it to `proxy.ts`, following the installed Next.js 16 documentation while preserving Clerk protection logic. It also removed an unused Inter font and fixed a self-referencing font token introduced during initialization.

## If I had more time

- Test per-user progress, hydration, malformed storage, and account switching.
- Add authentication smoke tests and keyboard/mobile accessibility checks.
- Polish loading, empty, and completion states within the assignment scope.
