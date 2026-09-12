import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-foreground text-background",
        variant === "secondary" &&
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}
