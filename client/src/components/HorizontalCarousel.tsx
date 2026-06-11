import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface HorizontalCarouselProps {
  title: string;
  seeAllLink?: string;
  children: React.ReactNode;
  className?: string;
}

export function HorizontalCarousel({ title, seeAllLink, children, className }: HorizontalCarouselProps) {
  return (
    <section className={`mb-8 ${className || ""}`}>
      <header className="flex items-center justify-between mb-3 px-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {seeAllLink && (
          <Link href={seeAllLink} className="text-sm text-emerald-400 underline hover:text-emerald-300">
            See All
          </Link>
        )}
      </header>
      <div className="carousel-container">
        {children}
      </div>
    </section>
  );
}

export function CarouselCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`carousel-card rounded-lg overflow-hidden ${className || ""}`}>
      {children}
    </div>
  );
}
