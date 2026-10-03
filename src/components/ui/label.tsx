import * as React from "react";
import { cn } from "@/lib/utils";

/** 11px semibold, uppercase, tracked. Section header of the whole app. */
export function LabelCaps({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return <span className={cn("label-caps inline-flex items-center gap-2", className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
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
