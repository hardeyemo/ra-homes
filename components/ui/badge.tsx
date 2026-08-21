import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest",
  {
    variants: {
      variant: {
        default: "bg-ink text-parchment",
        clay: "bg-clay text-parchment",
        sage: "bg-sage-dark text-parchment",
        outline: "border border-ink text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
