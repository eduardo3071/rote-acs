import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Main call-to-action: cyan fill, dark text, 56px tall, 16px radius, soft glow, trailing arrow. */
export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps & { arrow?: boolean }>(
  ({ className, children, arrow = true, ...props }, ref) => (
    <Button
      ref={ref}
      block
      className={cn(
        "group h-14 rounded-lg text-body font-semibold shadow-primary hover:bg-primary active:translate-y-0 active:scale-[0.98] active:bg-primary/85 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && (
        <ArrowRight className="!size-5 transition-transform duration-200 group-active:translate-x-1" aria-hidden />
      )}
    </Button>
  ),
);
PrimaryButton.displayName = "PrimaryButton";
