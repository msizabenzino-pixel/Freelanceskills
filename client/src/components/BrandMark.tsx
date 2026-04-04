import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export function BrandMark({
  className,
  imageClassName,
  alt = "FreelanceSkills mark",
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      <img
        src="/favcon-fls.png"
        alt={alt}
        className={cn("h-8 w-8 rounded-lg object-cover", imageClassName)}
        decoding="async"
        draggable={false}
      />
    </span>
  );
}
