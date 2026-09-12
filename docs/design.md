# Better U layout direction

Source: the six design-system screenshots supplied for this take-home. They define visual language, not finished dashboard or authentication wireframes.

## Tokens

- Primary: **#6D6CB8**; ink: **#231F20** (explicit values in the slides).
- Supporting violet, cream, teal, and apricot values are visual approximations, not claimed source values. Teal/apricot are reserved for progress and encouragement, never primary actions.
- Display: Quicksand 500–600 with −0.03em tracking. Body/UI: Hanken Grotesk 400–600, 16px / 1.6. Both are the suggested substitute fonts, not official brand font files.
- Actions: pill-shaped; hover darkens; press scales to 0.985.
- Cards: 24px radius, hairline border, subtle violet-tinted shadow.
- Motion: 150ms controls, 220ms transitions, 380ms progress. Reduced motion collapses durations to 1ms.
- Icons: Lucide monoline. A typographic wordmark is a placeholder, not a reproduction of the official logo.

## One-day scope

1. Establish shared theme tokens and primitives.
2. Build a responsive dashboard shell around the existing catalog and lesson routes.
3. Build a branded authentication layout with the real Clerk sign-in/sign-up components.
4. Validate changed code and document remaining checks.

Keep business logic, the supplied course schema, and Clerk route protection intact. No fake progress statistics, dead navigation links, new backend, or full 22-component library. Ship a light theme only for this pass. Existing README edits belong to the author and are not included in layout commits.

## Delivered checklist

- [x] Theme tokens, substitute fonts, pill buttons, 24px cards, and reduced-motion rules.
- [x] Desktop sidebar, compact mobile navigation, account controls, and catalog shell; existing course/lesson routes retained.
- [x] Responsive authentication layout with native Clerk sign-in/sign-up, shared appearance configuration, and an optional desktop video panel.
- [x] Static checks and handoff notes. Browser and production-build verification remain outstanding.

## Validation and handoff

- `next typegen` and `tsc --noEmit`: pass.
- ESLint for all changed TypeScript/React files: pass.
- Full ESLint: still reports the two pre-existing issues in `useCourseProgress.ts` (effect-driven state) and `lib/courses.ts` (a variable named `module`). No rules suppressed or progress logic rewritten in this layout pass.
- Contrast calculations: white on primary **4.68:1**; ink on cream **15.37:1**; muted text on cream **6.00:1**. These checked pairs meet normal-text AA; this is not a complete accessibility audit.
- `git diff --check`: pass.
- Production build was previously blocked by sandbox process/port restrictions; it has not been verified for these changes. Google Fonts also require build-time network access.
- No browser session was available for this pass. Visual fidelity, Clerk-hosted states, and responsive behavior still need manual verification.

Manual release checks:

1. Run `pnpm build`, then inspect at 375px, 768px, and 1440px widths for overflow and readable cards/forms.
2. Tab through skip links, navigation, search/filters, course links, and Clerk controls. Confirm visible focus, then repeat with reduced motion enabled.
3. Verify signed-out redirects, sign-in, sign-up, recovery/verification flows, account controls, and sign-out using the configured Clerk application.
4. Navigate directly to a course and lesson, then return to the catalog. Confirm the shell and existing lesson interactions still work.

## Authentication spacing refinement

- Desktop landscape (at least 1024px) uses a 46/54 split: video and editorial copy on the left, an unobstructed form on the right. Portrait/mobile uses a compact brand header and form instead of stacking a tall hero above account access.
- Form width is capped at 416px with responsive gutters. Content can grow and scroll on short screens; no fixed-height form container clips verification or recovery flows.
- Only Clerk's outer `cardBox` owns the 24px radius, clipping, border, and shadow. The inner card and footer have square joined edges, eliminating nested rounded seams. The footer and Clerk branding remain visible.
- Clerk styles are placed in the `clerk` CSS layer at the provider; Tailwind utilities come afterward so the appearance overrides take precedence. In this SDK, `cssLayerName` is provider-level, not a per-component theme property.
- The existing video URL is preserved in `AuthVideo`. Media is mounted only for wide landscape screens without reduced-motion preference. It is muted, inline, looping, and has an explicit pause/play control. A static violet background remains on network failure or when media is ineligible.
- Type generation, TypeScript, targeted ESLint, and whitespace checks pass for this refinement. Browser and production-build validation remain outstanding. Specifically check Clerk's card/footer join, 320px mobile width, portrait tablets, short laptop screens, pause/play, failed media loading, and live reduced-motion changes.

Implementation correction: the initial Clerk theme used legacy `colorText`/`colorInputText` properties. TypeScript caught them; the shared appearance now uses the installed SDK's `colorForeground`, `colorMutedForeground`, `colorInput`, and `colorInputForeground` names. Authentication remains managed by Clerk, not a custom form.
