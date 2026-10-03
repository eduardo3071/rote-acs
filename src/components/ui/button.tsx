import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold outline-none select-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-primary hover:bg-primary-dark",
        destructive: "bg-risk-high text-primary-foreground shadow-risk-high hover:bg-risk-high/85",
        danger: "bg-risk-high text-primary-foreground shadow-risk-high hover:bg-risk-high/85",
        warn: "bg-risk-medium text-primary-foreground shadow-risk-medium hover:bg-risk-medium/85",
        success: "bg-risk-low text-primary-foreground shadow-risk-low hover:bg-risk-low/85",
        outline:
          "border border-border bg-transparent text-ink-soft hover:border-primary/60 hover:bg-card hover:text-ink",
        secondary:
          "border border-border bg-elevated text-ink hover:border-primary/60 hover:bg-elevated/70",
        ghost: "bg-transparent text-ink-soft hover:bg-elevated hover:text-ink",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 text-body [&_svg]:size-4",
        md: "h-11 px-4 text-body [&_svg]:size-4",
        sm: "h-9 px-3 text-small [&_svg]:size-4",
        lg: "h-12 px-5 text-subtitle [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
