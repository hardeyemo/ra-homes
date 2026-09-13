import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-ink/40 hover:border-ink/30 focus-visible:border-gold focus-visible:bg-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
