import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, ShieldCheck } from "lucide-react";

interface FreelancerCardProps {
  name: string;
  title: string;
  rate: string;
  rating: number;
  reviews: number;
  skills: string[];
  imageUrl: string;
  verified?: boolean;
}

export function FreelancerCard({ name, title, rate, rating, reviews, skills, imageUrl, verified }: FreelancerCardProps) {
  return (
    <Card className="text-center overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/20">
      <div className="h-20 bg-gradient-to-r from-primary to-primary/80" />
      <div className="px-6 -mt-10 mb-4">
        <div className="relative inline-block">
          <Avatar className="w-20 h-20 border-4 border-background shadow-md">
            <AvatarImage src={imageUrl} alt={`Profile photo of ${name}`} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          {verified && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm" title="Verified Professional">
              <ShieldCheck className="w-5 h-5 text-accent fill-accent/20" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="space-y-4 px-4 pb-2">
        <div>
          <h3 className="font-bold text-lg text-primary">{name}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1 font-semibold text-primary">
            <Star className="w-4 h-4 fill-accent text-accent" />
            {rating}
            <span className="text-muted-foreground font-normal text-xs">({reviews})</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="font-medium text-primary">
            {rate}<span className="text-muted-foreground text-xs font-normal">/hr</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-secondary/50 text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="secondary" className="bg-secondary/50 text-xs font-normal">
              +{skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <button className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-primary hover:bg-secondary hover:border-secondary-foreground/20 transition-colors">
          View Profile
        </button>
      </CardFooter>
    </Card>
  );
}