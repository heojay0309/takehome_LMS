import type { ComponentProps } from 'react';
import type { SignIn } from '@clerk/nextjs';

// CSS variables update auth forms, account popovers, and portaled modals
// immediately with the app theme, without remounting an in-progress form.
export const clerkThemeVariables = {
  colorPrimary: 'var(--primary)',
  colorPrimaryForeground: 'var(--primary-foreground)',
  colorNeutral: 'var(--foreground)',
  colorForeground: 'var(--foreground)',
  colorMuted: 'var(--muted)',
  colorMutedForeground: 'var(--muted-foreground)',
  colorBackground: 'var(--card)',
  colorInput: 'var(--card)',
  colorInputForeground: 'var(--foreground)',
  colorBorder: 'var(--border)',
  colorRing: 'var(--primary)',
  colorDanger: 'var(--destructive)',
  colorModalBackdrop: '#000000',
  fontFamily: 'var(--font-hanken), sans-serif',
  fontSize: '1rem',
  borderRadius: '0.75rem',
} satisfies NonNullable<NonNullable<ComponentProps<typeof SignIn>['appearance']>['variables']>;

// Keep Clerk's validation, account recovery, and provider flows intact.
export const clerkAppearance = {
  variables: clerkThemeVariables,
  elements: {
    rootBox: 'w-full min-w-0',
    // Only the outer shell owns rounding and elevation. Clerk's form and
    // footer are separate surfaces; rounding both creates a visible seam.
    cardBox: 'w-full max-w-none gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-card',
    card: 'm-0 w-full min-w-0 gap-4 rounded-none border-0 bg-card p-4 shadow-none sm:gap-6 sm:p-6',
    footer: 'rounded-none border-t border-border bg-muted bg-none p-4 sm:px-8',
    headerTitle:
      'font-heading text-2xl font-semibold tracking-tight text-foreground',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary:
      'min-h-12 rounded-full bg-primary text-primary-foreground shadow-none transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.985]',
    socialButtonsBlockButton: 'min-h-12 rounded-full border-input',
    formFieldInput: 'min-h-12 rounded-md border-input text-base',
    footerActionLink: 'text-primary-hover underline underline-offset-4',
  },
} satisfies NonNullable<ComponentProps<typeof SignIn>['appearance']>;
