import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export function BrandLogo({
  className,
  imageClassName,
  alt = "FreelanceSkills logo",
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/freelanceskills-logo.png"
        alt={alt}
        className={cn("h-10 w-auto max-w-[220px] object-contain", imageClassName)}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
