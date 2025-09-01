import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 pb-1",
  {
    variants: {
      variant: {
        slate:
          "text-slate-200/90 bg-slate-500/20 border-slate-600/50 hover:bg-slate-600/30",
        green:
          "text-green-500 bg-green-600/20 border-green-500/50 hover:bg-green-600/30",
        orange:
          "text-orange-500 bg-orange-600/20 border-orange-500/50 hover:bg-orange-600/30",
        cyan:
          "text-cyan-500 bg-cyan-600/20 border-cyan-500/50 hover:bg-cyan-600/30",
        yellow:
          "text-yellow-500 bg-yellow-600/20 border-yellow-500/50 hover:bg-yellow-600/30",
        red:
          "text-red-500 bg-red-600/20 border-red-500/50 hover:bg-red-600/30",
        blue:
          "text-blue-500 bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30",
        purple:
          "text-purple-500 bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/30",
      },
    },
    defaultVariants: {
      variant: "slate",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };