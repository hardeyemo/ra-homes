import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border text-sm font-semibold tracking-[0.08em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-ink text-parchment shadow-[0_5px_0_hsl(var(--gold-dark))] hover:-translate-y-0.5 hover:border-gold hover:bg-gold-dark hover:shadow-[0_7px_0_hsl(var(--gold-dark))] active:translate-y-0 active:shadow-[0_2px_0_hsl(var(--gold-dark))]",
        outline:
          "border-ink/80 bg-surface text-ink shadow-[0_3px_0_hsl(var(--line))] hover:-translate-y-0.5 hover:border-gold-dark hover:bg-gold hover:text-ink hover:shadow-[0_5px_0_hsl(var(--gold-dark))] active:translate-y-0 active:shadow-none",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-sage-light hover:text-gold-dark",
        link:
          "h-auto border-transparent bg-transparent px-0 text-gold-dark shadow-none hover:text-gold hover:underline underline-offset-4",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
