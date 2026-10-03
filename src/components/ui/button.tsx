import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-primary hover:bg-primary-dark",
        secondary:
          "border border-border bg-elevated text-ink hover:border-primary/60 hover:bg-elevated/70",
        outline: "border border-border bg-transparent text-ink-soft hover:text-ink hover:bg-card",
        ghost: "bg-transparent text-ink-soft hover:bg-elevated hover:text-ink",
        danger: "bg-risk-high text-primary-foreground shadow-risk-high hover:bg-risk-high/85",
        warn: "bg-risk-medium text-primary-foreground shadow-risk-medium hover:bg-risk-medium/85",
        success: "bg-risk-low text-primary-foreground shadow-risk-low hover:bg-risk-low/85",
      },
      size: {
        sm: "h-9 px-3 text-small",
        md: "h-11 px-4 text-body",
        lg: "h-12 px-5 text-subtitle",
        icon: "size-11",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "default", size: "md", block: false },
  },
);

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
