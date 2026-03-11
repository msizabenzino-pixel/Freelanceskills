import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, Wallet, Bookmark, Zap, CheckCircle2, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface JobCardProps {
  id?: string | number;
  title: string;
  company: string;
  type: string;
  budget: string;
  location: string;
  postedAt: string;
  tags: string[];
  description: string;
  onApply?: () => void;
  onSave?: () => void;
}

export const JobCard = memo(({ id, title, company, type, budget, location, postedAt, tags, description, onApply, onSave }: JobCardProps) => {
  const { isAuthenticated } = useAuth();
  const isUrgent = type.toLowerCase() === "urgent";

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Limit swipe distance for visual feedback
    if (Math.abs(diff) < 150) {
      setOffsetX(diff);
    }
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setOffsetX(0);
      setIsSwiping(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (onSave) onSave();
    } else if (isRightSwipe) {
      if (onApply) onApply();
    }

    setOffsetX(0);
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-muted/50">
        <div className={cn("flex items-center gap-2 text-primary font-bold transition-opacity", offsetX > 20 ? "opacity-100" : "opacity-0")}>
          <CheckCircle2 className="w-6 h-6" />
          Quick Apply
        </div>
        <div className={cn("flex items-center gap-2 text-accent font-bold transition-opacity", offsetX < -20 ? "opacity-100" : "opacity-0")}>
          Save
          <BookmarkCheck className="w-6 h-6" />
        </div>
      </div>

      <Card 
        ref={cardRef}
        data-testid={`job-card-${id}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ 
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        className="relative z-10 group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/30 overflow-hidden cursor-pointer"
      >
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                {isUrgent && (
                  <Badge variant="destructive" className="animate-pulse flex gap-1 items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold" data-testid="badge-urgent">
                    <Zap className="w-3 h-3" /> Urgent
                  </Badge>
                )}
                {isAuthenticated && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 flex gap-1 items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold" data-testid="badge-quick-apply">
                    <CheckCircle2 className="w-3 h-3" /> Quick Apply
                  </Badge>
                )}
              </div>
              <h3 className="font-display font-bold text-lg text-primary group-hover:text-accent transition-colors">
                {title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">{company}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={(e) => { e.stopPropagation(); onSave?.(); }}
              data-testid={`job-card-save-${id}`}
            >
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
              <Wallet className="w-3.5 h-3.5" />
              {budget}
            </div>
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              {type}
            </div>
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent-foreground px-2.5 py-1 rounded-md font-bold border border-accent/20" data-testid="badge-location">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              {location}
            </div>
          </div>
          <img 
            src={`https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=100&h=100`} 
            alt={`${company} logo`}
            className="w-10 h-10 rounded-md object-cover bg-muted"
            loading="lazy"
          />
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal border-border text-muted-foreground group-hover:border-accent/50 group-hover:text-primary transition-colors">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
          <span data-testid="text-posted-at">Posted {postedAt}</span>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" 
            onClick={(e) => { e.stopPropagation(); onApply?.(); }}
            data-testid={`job-card-apply-${id}`}
          >
            Apply Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
});

JobCard.displayName = "JobCard";
