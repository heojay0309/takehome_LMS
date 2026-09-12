import type { ComponentProps } from 'react';
import type { SignIn } from '@clerk/nextjs';

// Keep Clerk's validation, account recovery, and provider flows intact.
// The public appearance API styles both authentication routes consistently.
export const clerkAppearance = {
  variables: {
    colorPrimary: '#6d6cb8',
    colorForeground: '#231f20',
    colorMutedForeground: '#625d6c',
    colorBackground: '#ffffff',
    colorInput: '#ffffff',
    colorInputForeground: '#231f20',
    colorDanger: '#bd443c',
    fontFamily: 'var(--font-hanken), sans-serif',
    fontSize: '1rem',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full min-w-0',
    // Only the outer shell owns rounding and elevation. Clerk's form and
    // footer are separate surfaces; rounding both creates a visible seam.
    cardBox: 'w-full max-w-none gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-card',
    card: 'm-0 w-full gap-6 rounded-none border-0 bg-card px-5 py-6 shadow-none sm:px-8 sm:py-8',
    footer: 'rounded-none border-t border-border bg-muted bg-none px-5 py-5 sm:px-8',
    headerTitle:
      'font-heading text-2xl font-semibold tracking-tight text-foreground',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary:
      'min-h-11 rounded-full bg-primary text-white shadow-none transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.985]',
    socialButtonsBlockButton: 'min-h-11 rounded-full border-input',
    formFieldInput: 'min-h-11 rounded-xl border-input',
    footerActionLink: 'text-primary-hover underline underline-offset-4',
  },
} satisfies NonNullable<ComponentProps<typeof SignIn>['appearance']>;
