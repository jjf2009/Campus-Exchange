import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink bg-dots px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 -rotate-6 items-center justify-center rounded-xl border-2 border-ink bg-sun text-ink shadow-brutal">
        {icon ?? <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
