import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Brand buttons.
 *
 * primary   — the ONE orange action a page exists to get. Never two different
 *             primary actions on the same page.
 * secondary — teal outline. Everything that is not the page's goal.
 * ghost     — text with an animated teal underline.
 */
const buttonVariants = cva(
  "group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-heading text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-linear-to-r from-orange-400 to-orange-500 px-6 text-white shadow-[var(--shadow-action)] hover:-translate-y-0.5 hover:from-orange-400 hover:to-orange-600 hover:shadow-[0_16px_34px_-12px_var(--color-orange-500)]",
        secondary:
          "rounded-full border border-teal-500 bg-transparent px-6 text-teal-400 hover:bg-teal-950 hover:text-white",
        ghost:
          "nav-underline rounded-none bg-transparent px-1 text-white hover:text-white",
        // shadcn-internal variants, retained for library components
        default: "rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90",
        destructive:
          "rounded-md bg-destructive px-4 text-destructive-foreground hover:bg-destructive/90",
        outline: "rounded-md border border-navy-600 bg-transparent px-4 text-white hover:bg-navy-800",
        link: "text-teal-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-6 text-sm",
        sm: "min-h-11 px-4 text-xs",
        lg: "min-h-[52px] px-8 text-base",
        icon: "min-h-11 min-w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Adds the sliding ArrowRight used on primary actions. */
  withArrow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withArrow, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const showArrow = withArrow ?? variant === "primary";
    const arrow = showArrow ? (
      <ArrowRight
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:translate-x-1"
      />
    ) : null;

    // In asChild mode Slot accepts exactly one child, so the arrow is appended
    // inside that child rather than beside it.
    const content =
      asChild && arrow && React.isValidElement<{ children?: React.ReactNode }>(children)
        ? React.cloneElement(children, undefined, children.props.children, arrow)
        : children;

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {asChild ? (
          content
        ) : (
          <>
            {children}
            {arrow}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
