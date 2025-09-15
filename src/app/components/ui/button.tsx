import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 px-0 py-0 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer [clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]",
  {
    variants: {
      variant: {
        primaris:
          "text-gray-300 text-amber-400 bg-amber-500/10 border border-amber-500/30 transition-all duration-100 hover:bg-amber-500/20",
        secundus:
          "border border-amber-500 text-amber-400 hover:bg-amber-500/10 bg-amber-500/15",
        accept:
          "text-gray-300 text-green-400 bg-green-500/10 border border-green-500/30 transition-all duration-100 hover:bg-green-500/20",
        cancel:
          "text-gray-300 text-red-400 bg-red-500/10 border border-red-500/30 transition-all duration-100 hover:bg-red-500/20",
        white:
          "text-gray-300 text-white bg-white/10 border border-white/30 transition-all duration-100 hover:bg-white/20",
        blue: "text-gray-300 text-blue-400 bg-blue-400/15 border border-blue-500/30 transition-all duration-100 hover:bg-blue-500/20",
        ghost: "text-gray-300 text-amber-400 transition-all duration-100 hover:bg-amber-500/20",
      },
      size: {
        default: "px-0 py-0",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primaris",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "relative group",
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none" />
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
