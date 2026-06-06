"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#1C2B3A] text-[#F2EDE4] hover:bg-[#1C2B3A]/90 focus-visible:ring-[#1C2B3A]",
        destructive:
          "bg-[#8B3A3A] text-[#F2EDE4] hover:bg-[#8B3A3A]/90 focus-visible:ring-[#8B3A3A]",
        outline:
          "border border-[#1C2B3A]/20 bg-transparent text-[#1C2B3A] hover:bg-[#1C2B3A]/5",
        secondary:
          "bg-[#F2EDE4] text-[#1C2B3A] hover:bg-[#F2EDE4]/80",
        ghost:
          "text-[#1C2B3A] hover:bg-[#1C2B3A]/5",
        link: "text-[#1C2B3A] underline-offset-4 hover:underline",
        ovier:
          "bg-[#C09240] text-[#F2EDE4] hover:bg-[#C09240]/90 font-semibold tracking-wide",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
