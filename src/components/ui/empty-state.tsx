import type { ReactNode } from "react";

export function EmptyState({ title, description, icon, action }: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="panel-padding flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card text-center">
      <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary-hover">
        {icon}
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
