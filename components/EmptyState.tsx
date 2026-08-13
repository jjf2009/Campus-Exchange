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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/60">
        {icon ?? <PackageOpen className="h-8 w-8" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
