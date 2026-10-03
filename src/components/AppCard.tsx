import * as React from "react";
import { cn } from "@/lib/utils";

/** Base surface for RoteACS content: card fill, hairline border, discreet depth. */
export function AppCard({
  className,
  raised = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { raised?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border p-4",
        raised ? "bg-elevated shadow-raised" : "bg-card shadow-card",
        className,
      )}
      {...props}
    />
  );
}
