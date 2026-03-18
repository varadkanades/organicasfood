import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeading({ title, subtitle, centered = true, className }: SectionHeadingProps) {
  return (
    <div className={cn(centered && "text-center", "mb-12", className)}>
      <h2 className="font-heading text-3xl md:text-4xl text-rich-black">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-mid-gray text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
