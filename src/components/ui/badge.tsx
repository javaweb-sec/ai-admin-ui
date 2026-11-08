import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-slate-700 dark:text-slate-200",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800/50",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800/50",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
