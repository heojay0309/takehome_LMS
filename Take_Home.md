# Frontend Engineer Take-Home: LMS Dashboard

## Overview

Build a modern, responsive Learning Management System (LMS) dashboard where authenticated users can browse course catalogs, view lesson modules, and track progress in real time.

**Expected effort:** ~4–6 hours of focused work  
**Due:** Within 3 calendar days of receiving this brief

---

## Core Stack

- **React / Next.js** (App Router recommended)
- **TypeScript** (strict mode; avoid `any`)
- **Tailwind CSS** + **shadcn/ui** for UI primitives
- **Clerk** for authentication

---

## AI Usage Policy

AI tools are **encouraged** (Cursor, GitHub Copilot, ChatGPT, v0, etc.).

We evaluate engineering judgment, code quality, and UX — not whether you wrote every line by hand.

Your README **must** include an **AI Usage** section covering:

1. Which tools you used
2. 2–3 prompts or workflows that helped most
3. One thing the AI got wrong and how you fixed it

**Optional (recommended):** A 5–10 minute Loom walkthrough of your architecture and one non-obvious decision.

---

## Mock Data

Use the provided course catalog. Do **not** invent a different schema unless you document why in your README.

**File:** [`data/courses.json`](../data/courses.json)

### Schema

```typescript
type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type Lesson = {
  id: string;
  title: string;
  durationMinutes: number;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  thumbnail: string;
  instructor: string;
  rating: number;
  enrolledCount: number;
  modules: Module[];
};
```

**Categories in dataset:** Web Development, Data Science, Design, Business, DevOps, Mobile

**Progress:** Store lesson completion **client-side only** (React state + `localStorage` keyed by Clerk `userId`). No backend or database required.

---

## In Scope

### 1. Authentication (Clerk)

- Protect dashboard routes with Clerk middleware/SDK
- Redirect unauthenticated users away from protected views
- User profile controls: avatar, display name/metadata, sign-out

### 2. Course Catalog & Search

- Filterable course grid:
  - **Category** (from dataset)
  - **Difficulty** (Beginner / Intermediate / Advanced)
  - **Completion status:** All | In Progress | Completed
    - **In Progress:** at least one lesson complete, but course &lt; 100%
    - **Completed:** 100% of lessons complete
- Client-side search with **≥300ms debounce**
  - Search **title** and **description**
- Course cards with:
  - Progress bar
  - Completion badge (when 100%)
  - Metadata tags (category, difficulty, duration)

### 3. Course Detail & Module View

- Interactive lesson checklist
- Toggling a lesson updates the course completion **percentage immediately**
- Mock media player (HTML5 `<video>` placeholder or styled static player UI — no real video hosting)
- Progress persists after page refresh

### 4. UI/UX Polish

- Fully responsive: mobile, tablet, desktop
- Loading skeleton components
- Empty states:
  - No courses match filters/search
  - Course with zero completed lessons (catalog still shows 0% progress)

---

## Out of Scope

Do **not** build:

- Backend API or database
- Admin CMS or course authoring
- Payments, enrollment, or user management beyond Clerk
- Real video hosting or streaming
- WebSockets or server-pushed “real-time” updates
- Email notifications

---

## Suggested Architecture

You are free to organize code as you prefer. We expect something close to:

```
app/
  (auth)/sign-in/...
  (dashboard)/
    page.tsx              # Course catalog
    courses/[courseId]/
      page.tsx            # Course detail + modules
      lessons/[lessonId]/
        page.tsx          # Lesson view + mock player
components/
  courses/                # CourseCard, CourseGrid, Filters, SearchBar
  lessons/                # LessonChecklist, MockVideoPlayer
  layout/                 # Header, UserNav
  ui/                     # shadcn primitives
hooks/
  useDebouncedValue.ts
  useCourseProgress.ts    # localStorage + Clerk userId
lib/
  courses.ts              # Load/filter typed course data
  progress.ts             # Progress helpers
middleware.ts             # Clerk route protection
```

**Custom hooks we expect to see:**

- `useDebouncedValue` — debounced search input
- `useCourseProgress` — read/write lesson completion per user

---

## Definition of Done

- [ ] Unauthenticated users cannot access dashboard routes
- [ ] Signed-in user sees avatar and can sign out
- [ ] Course grid with category, difficulty, and completion filters
- [ ] Debounced search (≥300ms) on title + description
- [ ] Course detail with module/lesson checklist
- [ ] Lesson toggle updates course % immediately
- [ ] Progress persists after refresh (`localStorage` + Clerk `userId`)
- [ ] Mock video player on lesson view
- [ ] Loading skeletons for catalog and detail views
- [ ] Empty state when no search/filter results
- [ ] Responsive layouts on mobile and desktop
- [ ] Public GitHub repo with README (see below)
- [ ] Live deployed demo

---

## Submission Requirements

### 1. Public GitHub Repository

Include a **README.md** with:

1. **Architecture** — routes, key components, hooks
2. **Setup** — install, env vars, `dev` command
3. **Deployment** — host env vars, Clerk allowed origins
4. **Trade-offs** — what you skipped and why (time limits)
5. **AI Usage** — tools, prompts, corrections (required)
6. **If I had more time** — up to 3 bullets

### 2. Live Demo

Deploy to **Vercel** (preferred) or **Cloudflare Pages**.

Free tiers are sufficient for this project. Netlify is acceptable but not required.

**Clerk deployment checklist:**

1. Create a free Clerk application at [clerk.com](https://clerk.com)
2. Add environment variables on your host:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. In Clerk Dashboard → **Domains**, add your production URL (e.g. `https://your-app.vercel.app`)

### 3. Reply Email

Send links to:

- GitHub repository (public)
- Live demo URL
- Optional Loom walkthrough

---

## Evaluation Rubric

| Area | Weight | What “good” looks like |
|------|--------|-------------------------|
| **Delivered product** | 30% | Core flows work; deployed and usable |
| **Code quality** | 25% | Clean components, typed hooks, no `any`, sensible file structure |
| **UX & polish** | 20% | Responsive, skeletons, empty states, accessible patterns |
| **State & data** | 15% | Predictable filters/search/progress persistence |
| **AI + engineering judgment** | 10% | Thoughtful AI use, verification, fixes — not blind paste |

### We de-emphasize

- Memorizing Clerk/Next.js APIs
- Pixel-perfect visual design
- Features outside the defined scope

### Optional bonus (not required)

- 1–2 unit tests for a hook or filter utility
- Keyboard-accessible filter controls
- Dark mode

---

## Good luck — we are excited to see how you approach the problem.
