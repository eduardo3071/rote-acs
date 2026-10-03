import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const panelVariants = cva("rounded-lg border border-border p-4", {
  variants: {
    tone: {
      base: "bg-card text-card-foreground shadow-card",
      raised: "bg-elevated text-elevated-foreground shadow-raised",
      high: "border-risk-high/45 bg-risk-high/13 text-ink shadow-risk-high",
      medium: "border-risk-medium/45 bg-risk-medium/13 text-ink shadow-risk-medium",
      low: "border-risk-low/45 bg-risk-low/13 text-ink shadow-risk-low",
    },
    pad: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: { tone: "base", pad: "md" },
});

type PanelProps = React.ComponentPropsWithoutRef<"div"> & VariantProps<typeof panelVariants>;

export function Panel({ className, tone, pad, ...props }: PanelProps) {
  return <div data-slot="panel" className={cn(panelVariants({ tone, pad }), className)} {...props} />;
}

export function PanelTitle({ className, ...props }: React.ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cn("text-subtitle text-ink", className)} {...props} />;
}

export function PanelMeta({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-small text-ink-soft", className)} {...props} />;
}

export { panelVariants };
