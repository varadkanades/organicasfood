import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "brown";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase",
        variant === "default" && "bg-soft-stone text-mid-gray",
        variant === "green" && "bg-sage-green/20 text-deep-forest",
        variant === "brown" && "bg-earthy-brown/10 text-earthy-brown",
        className
      )}
    >
      {children}
    </span>
  );
}
