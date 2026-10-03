import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Main call-to-action: cyan fill, dark text, 15px/600, 12px radius, 52px touch height. */
export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      block
      className={cn(
        "h-13 rounded-md text-body font-semibold hover:bg-primary active:bg-primary/85 active:translate-y-0 active:scale-[0.98] disabled:opacity-40",
        className,
      )}
      {...props}
    />
  ),
);
PrimaryButton.displayName = "PrimaryButton";
