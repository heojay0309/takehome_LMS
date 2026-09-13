import type { ReactNode } from "react";

/** Announce once; the individual skeleton shapes stay decorative. */
export function LoadingState({ label, className, children }: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}
