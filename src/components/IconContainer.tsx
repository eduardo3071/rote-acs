import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Large vector icon on a raised tile with a thin cyan ring. */
export function IconContainer({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-28 place-items-center rounded-lg border border-border bg-elevated shadow-card",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/15" />
      <Icon className="size-12 text-primary" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
