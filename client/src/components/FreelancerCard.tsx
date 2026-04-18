import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, ShieldCheck, MessageSquare, Briefcase } from "lucide-react";
import { LevelBadge, getLevelFromStats, type FreelancerLevel } from "@/components/LevelBadge";
import { cn } from "@/lib/utils";

interface FreelancerCardProps {
  name: string;
  title: string;
  rate: string;
  rating: number;
  reviews: number;
  skills: string[];
  imageUrl: string;
  verified?: boolean;
  level?: FreelancerLevel;
  responseRate?: number | null;
  completedJobs?: number;
  isPro?: boolean;
  onClick?: () => void;
}

export function FreelancerCard({
  name, title, rate, rating, reviews, skills, imageUrl,
  verified, level, responseRate, completedJobs = 0, isPro = false, onClick,
}: FreelancerCardProps) {
  const resolvedLevel: FreelancerLevel = level ?? (
    isPro ? "pro" : getLevelFromStats(completedJobs, rating, 0)
  );

  return (
    <Card
      className={cn(
        "text-center overflow-hidden transition-all duration-300 border-border/60",
        "hover:shadow-emerald-500/10 hover:shadow-lg hover:border-emerald-500/30",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      data-testid="freelancer-card"
    >
      <div className="h-20 bg-gradient-to-r from-emerald-900/60 to-slate-800/80 relative">
        {resolvedLevel !== "new" && (
          <div className="absolute top-2 right-2">
            <LevelBadge level={resolvedLevel} size="xs" />
          </div>
        )}
      </div>

      <div className="px-6 -mt-10 mb-4">
        <div className="relative inline-block">
          <Avatar className="w-20 h-20 border-4 border-background shadow-md">
            <AvatarImage src={imageUrl} alt={`Profile photo of ${name}`} />
            <AvatarFallback className="bg-emerald-900 text-emerald-300 text-xl font-bold">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          {verified && (
            <div className="absolute bottom-0 right-0 bg-slate-950 rounded-full p-0.5 shadow-sm border border-emerald-500/30" title="Verified Professional">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="space-y-4 px-4 pb-2">
        <div>
          <h3 className="font-bold text-lg text-white leading-tight" data-testid="freelancer-name">{name}</h3>
          <p className="text-sm text-slate-400 font-medium mt-0.5" data-testid="freelancer-title">{title}</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1 font-semibold text-amber-400" data-testid="freelancer-rating">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {typeof rating === "number" ? rating.toFixed(1) : rating}
            <span className="text-slate-500 font-normal text-xs">({reviews})</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="font-semibold text-emerald-400" data-testid="freelancer-rate">
            {rate}<span className="text-slate-500 text-xs font-normal">/hr</span>
          </div>
        </div>

        {(completedJobs > 0 || responseRate != null) && (
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            {completedJobs > 0 && (
              <div className="flex items-center gap-1" data-testid="freelancer-jobs-done">
                <Briefcase className="w-3 h-3 text-slate-500" />
                <span>{completedJobs} job{completedJobs !== 1 ? "s" : ""}</span>
              </div>
            )}
            {responseRate != null && (
              <>
                {completedJobs > 0 && <div className="w-px h-3 bg-slate-700" />}
                <div className="flex items-center gap-1" data-testid="freelancer-response-rate">
                  <MessageSquare className="w-3 h-3 text-slate-500" />
                  <span className={cn(
                    "font-medium",
                    responseRate >= 90 ? "text-emerald-400" : responseRate >= 70 ? "text-amber-400" : "text-slate-400"
                  )}>
                    {responseRate}% response
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-slate-800/70 border-slate-700/50 text-slate-300 text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="secondary" className="bg-slate-800/70 border-slate-700/50 text-slate-400 text-xs font-normal">
              +{skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <button
          className="w-full py-2.5 rounded-lg border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-colors"
          data-testid="button-view-profile"
        >
          View Profile
        </button>
      </CardFooter>
    </Card>
  );
}
