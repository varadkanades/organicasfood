import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-organic",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh-green/50 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" &&
            "bg-fresh-green text-white hover:bg-deep-forest shadow-sm hover:shadow-md active:scale-[0.98]",
          variant === "secondary" &&
            "bg-soft-stone text-rich-black hover:bg-sage-green/20 active:scale-[0.98]",
          variant === "outline" &&
            "border-2 border-fresh-green text-fresh-green hover:bg-fresh-green hover:text-white active:scale-[0.98]",
          variant === "ghost" &&
            "text-mid-gray hover:text-rich-black hover:bg-soft-stone/60",
          // Sizes
          size === "sm" && "h-9 px-4 text-sm gap-1.5",
          size === "md" && "h-11 px-6 text-sm gap-2",
          size === "lg" && "h-13 px-8 text-base gap-2.5",
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Export both default and named to prevent import mismatches
export default Button;
export { Button };
