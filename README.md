# BetterU LMS

A frontend take-home: authenticated users browse a course catalog, open modules, and track lesson progress in the browser.

**Stack:** Next.js 16 (App Router), React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Clerk.

Progress is client-side only (`localStorage` keyed by Clerk `userId`). There is no backend or database. Dark mode and goal-based learning tracks are extras, not required by the brief.

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

Open [http://localhost:3000](http://localhost:3000). Dashboard routes require authentication; `/sign-in` and `/sign-up` are public.

## Architecture

```text
data/courses.json                 Provided 12-course catalog; original schema preserved
src/
  app/
    (auth)/                       Clerk sign-in and sign-up catch-all routes
    (dashboard)/
      page.tsx                    Catalog, continue-learning, optional track
      courses/[courseId]/
        page.tsx                  Course detail, modules, checklist
        lessons/[lessonId]/
          page.tsx                Lesson view and mock player
      loading.tsx                 Route-level skeletons
    layout.tsx                    ClerkProvider, theme bootstrap, fonts
    globals.css                   Better U tokens, Tailwind, Clerk layer
  components/
    courses/                      Catalog, cards, filters, search, progress UI
    lessons/                      Checklist, mock player, next-lesson controls
    layout/                       Header, sidebar, UserButton, theme toggle
    onboarding/                   Optional track quiz and roadmap (extra)
    ui/                           shadcn / Base UI primitives
  hooks/
    useDebouncedValue.ts          ≥300ms catalog search
    useCourseProgress.ts          Shared progress snapshot for the signed-in user
    useOnboardingPreference.ts    Optional saved tracks (extra)
  lib/
    courses.ts                    Typed catalog load/filter helpers
    catalog-state.ts              URL-owned search and filter params
    progress.ts / progress-store.ts
                                  Parse, persist, and broadcast lesson completion
    clerk-appearance.ts           Clerk color tokens and UserButton slots
    theme.ts                      Light/dark preference (extra)
    onboarding.ts / track-*.ts    Optional learning tracks (extra)
  proxy.ts                        Clerk route protection (Next.js 16)
tests/                            Node test runner + TypeScript (no extra deps)
```

Routes and layouts are Server Components by default. Interactive controls and hooks are Client Components.

`src/proxy.ts` protects everything except `/sign-in` and `/sign-up`. The dashboard layout wraps the tree in `CourseProgressProvider` so catalog cards, the sidebar, and lesson checkboxes share one user-scoped store. Completing a lesson updates the percentage immediately and writes `betteru-progress:{userId}:{courseId}`. Search and filters live in the URL (`q`, `category`, `difficulty`, `status`); typing still debounces 300ms before results change.

shadcn/ui uses the `base-vega` preset. Add primitives as needed rather than installing the whole library:

```bash
pnpm dlx shadcn@latest add <component>
```

## Validation

```bash
pnpm test
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
```

`pnpm test` compiles `tests/` with TypeScript and runs Node's built-in test runner. Output goes to ignored `.test-build/`.

## Deployment

**Live demo:** [https://takehome-lms.vercel.app](https://takehome-lms.vercel.app)

Hosted on Vercel from this GitHub repository.

1. Import the repository into Vercel as a Next.js project.
2. Set the same Clerk variables as local setup. Use production keys for production and keep `CLERK_SECRET_KEY` server-only.
3. In Clerk Dashboard → **Domains**, add `https://takehome-lms.vercel.app`. Configure preview origins separately; do not allow arbitrary preview hosts.
4. After deploy, verify: signed-out users redirect to sign-in, avatar and sign-out work, catalog filters/search work, lesson toggles persist after refresh, and course/lesson URLs load directly.

## Trade-offs

- Progress is `localStorage` keyed by Clerk `userId`, as specified. If storage is blocked, the UI keeps working in memory and shows a warning; that session cannot survive a refresh.
- The mock player marks a lesson complete on the video `ended` event. That is a demo affordance, not verified watch time. The checklist can still undo completion.
- Advertised course duration in the dataset does not equal the sum of lesson durations. Remaining-time copy is labeled as an estimate; `data/courses.json` is not rewritten to make the numbers match.
- Dark mode and learning tracks are extras built after the required catalog, checklist, and persistence. If they add noise, ignore the classroom quiz and judge the catalog.
- No Playwright/Cypress. Unit tests cover progress, filters, and stores; sign-in and layout still need a real browser pass.

## AI Usage

### Tools

- **Claude Design** — pulled Better U color tokens from [betterucare.com](https://www.betterucare.com/) so the dashboard matched an existing brand instead of a generic shadcn theme.
- **Browser devtools** — captured the Better U logo and landing-page video for the signed-out shell.
- **Cursor** — Clerk + Next.js App Router bootstrap after the Create Next App boilerplate (protected routes, sign-in/sign-up, `UserButton`).
- **GPT-6** (including a higher-limit Astra session) — larger UI/UX passes: layout, catalog, lesson player, accessibility.
- **Grok 4.5 / 4.6** — smaller and medium follow-ups after hitting GPT-6 rate limits, so I did not burn the stronger model on one-file fixes.

I treated the models as drafters. I kept the assignment open while reviewing diffs, and I did not accept a change I could not explain.

### Workflows that helped most

1. **Audit the brief against the repo before adding features.** I asked the agent to map the current tree to the Definition of Done (auth, catalog filters, debounce, progress, skeletons, empty states) and list only what was still missing. That stopped me from building extras first.

2. **Research, then write a spec, then implement.** I used LMS reference material (including Blackboard’s strengths around paths and assessment) to decide whether a light onboarding track was worth it. The useful prompt was not “build onboarding.” It was: _propose a goal-based track that stays inside the provided 12-course catalog, with an experience gate, and do not invent new courses._ I wrote that as a short brief in a separate Claude chat, then implemented against the brief.

3. **Name the actual component, don’t say “think harder.”** When hover styling failed on the account control, retrying the same prompt wasted time. Opening `UserNav` showed the UI was Clerk’s `UserButton`, not a local profile card. The next prompt targeted `appearance.elements` (`userButtonTrigger`, `avatarBox`, `userButtonOuterIdentifier`) so the hit area and hover state covered avatar + name together.

### What the AI got wrong

Hover states. The model kept styling inner fragments of the profile control, so hover never covered the whole row (avatar and name). Telling it to try again did not help, because it was still guessing at DOM I had not shown it. I read the Clerk `UserButton` appearance API, pointed the model at those slots, and the fix landed in one pass.

A second miss: onboarding. Asked for suggested courses, the model built a surface-level quiz (“interested in web development?” / “what’s your familiarity?”) that returned a single lesson. I stopped letting it invent product behavior, wrote track guidelines (goal, experience, cross-category sequence, one saved track per goal, no extra catalog data), and only then had it implement. The extra is optional; the required catalog still uses the provided schema.

## If I had more time

1. Sign into the real Better U product with a test account and see how learners actually move through it. I would rather steal one or two patterns that already work than keep guessing from the marketing site.
2. I already added goal-based tracks after looking at how other LMS platforms handle personalization. Next I would show people where they stand against that goal — not just per-course checkboxes — and call out a few achievements when they hit milestones.
3. Add a short Playwright run that signs in, searches and filters the catalog, toggles a lesson, refreshes, and checks that the progress is still there.
