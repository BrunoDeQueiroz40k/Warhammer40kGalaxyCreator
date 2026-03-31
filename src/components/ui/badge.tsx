import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 pb-1",
  {
    variants: {
      variant: {
        normal:
          "text-slate-200/90 bg-slate-500/20 border-slate-600/50 hover:bg-slate-600/30",
        imperium:
          "text-amber-200/90 bg-amber-500/20 border-amber-600/50 hover:bg-amber-600/30",
        necrons:
          "text-emerald-500 bg-emerald-600/20 border-emerald-500/50 hover:bg-emerald-600/30",
        caos:
          "text-red-500 bg-red-600/20 border-red-500/50 hover:bg-red-600/30",
        orks:
          "text-green-500 bg-green-600/20 border-green-500/50 hover:bg-green-600/30",
        xenos:
          "text-brown-500 bg-brown-600/20 border-brown-500/50 hover:bg-brown-600/30",
        tau:
          "text-blue-500 bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30",
        aeldari:
          "text-purple-500 bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/30",
        dark_eldar:
          "text-pink-500 bg-pink-600/20 border-pink-500/50 hover:bg-pink-600/30",
      },
    },
    defaultVariants: {
      variant: "normal",
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