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
        "inline-flex items-center max-w-full rounded-full px-2 py-1 text-xs font-medium",
        variant === "default" && "bg-secondary text-secondary-foreground",
        variant === "secondary" &&
          "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
