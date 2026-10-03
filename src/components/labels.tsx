import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * LabelCaps — the app's section header: 11px semibold, uppercase, tracked.
 * (The shadcn `Label` in ui/label.tsx stays untouched for form fields.)
 */
export function LabelCaps({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return <span className={cn("label-caps inline-flex items-center gap-2", className)} {...props} />;
}

/** Chip — pill label used for counts, tags and status. */
export function Chip({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-border bg-elevated px-3 py-1 text-small text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}
