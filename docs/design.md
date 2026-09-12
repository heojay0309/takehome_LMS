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
