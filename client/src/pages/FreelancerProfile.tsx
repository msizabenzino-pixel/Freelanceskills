import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, ShieldCheck, Clock, MessageSquare, Loader2, Edit } from "lucide-react";
import { Link, useParams } from "wouter";
import { useCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import type { Profile, Review } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PortfolioUploader } from "@/components/PortfolioUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery<Profile>({
    queryKey: [`/api/profile/${id}`],
    enabled: !!id,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/freelancers/${id}/reviews`],
    enabled: !!id,
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-primary">Profile not found</h2>
          <p className="text-muted-foreground">The freelancer profile you're looking for doesn't exist.</p>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile.title || "Freelancer";
  const bio = profile.bio || "No bio provided.";
  const hourlyRate = profile.hourlyRate || 0;
  const skills = profile.skills || [];
  const isOwnProfile = user?.id === profile.userId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content">
      {/* Header / Cover */}
      <div className="h-64 bg-primary relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative -mt-24 pb-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
              <div className="relative inline-block mb-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={`https://avatar.iran.liara.run/public/boy?username=${profile.id}`} />
                  <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {profile.isPro && (
                  <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm" title="Identity Verified">
                    <ShieldCheck className="w-6 h-6 text-accent fill-accent/20" />
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-primary" data-testid="text-freelancer-name">{displayName}</h1>
              <p className="text-muted-foreground font-medium mb-4" data-testid="text-freelancer-role">{profile.title}</p>
              
              <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1" data-testid="text-freelancer-location">
                  <MapPin className="w-4 h-4" /> {profile.location || "South Africa"}
                </div>
                <div className="flex items-center gap-1" data-testid="text-freelancer-timezone">
                  <Clock className="w-4 h-4" /> 2:00 PM Local
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-border py-4">
                <div data-testid="stat-job-success">
                  <div className="font-bold text-lg text-primary">{profile.rating ? (profile.rating / 5).toFixed(0) + "%" : "100%"}</div>
                  <div className="text-xs text-muted-foreground">Job Success</div>
                </div>
                <div data-testid="stat-jobs-done">
                  <div className="font-bold text-lg text-primary">{profile.completedJobs}</div>
                  <div className="text-xs text-muted-foreground">Jobs Done</div>
                </div>
              </div>

              <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold shadow-lg mb-3" data-testid="button-hire-freelancer">
                Hire {displayName.split(' ')[0]}
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-message-freelancer">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 bg-secondary/50 hover:bg-secondary" data-testid={`badge-skill-${skill.toLowerCase()}`}>
                    {skill}
                  </Badge>
                )) : <p className="text-sm text-muted-foreground">No skills listed</p>}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-4">Certifications</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg text-accent mt-1"><ShieldCheck className="w-4 h-4" /></div>
                  <div>
                    <div className="font-semibold text-sm">Identity Verified</div>
                    <div className="text-xs text-muted-foreground">FreelanceSkills • {new Date().getFullYear()}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-2xl font-bold text-primary">About Me</h2>
                   <p className="text-xl font-medium text-accent mt-1">{formatAmount(hourlyRate)} <span className="text-sm text-muted-foreground font-normal">/ hour</span></p>
                 </div>
              </div>
              
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {bio}
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <Tabs defaultValue="reviews" className="w-full">
                <div className="px-6 pt-6 border-b border-border">
                  <TabsList className="bg-transparent p-0 h-auto gap-6">
                    <TabsTrigger value="portfolio" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-muted-foreground data-[state=active]:text-primary text-base" data-testid="tab-portfolio">
                      Portfolio
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-muted-foreground data-[state=active]:text-primary text-base" data-testid="tab-reviews">
                      Reviews ({reviews?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="portfolio" className="p-6">
                  {isOwnProfile && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-primary">Upload Portfolio Items</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Manage Portfolio
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Update Your Portfolio</DialogTitle>
                            </DialogHeader>
                            <PortfolioUploader />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground">Portfolio items will appear here once uploaded.</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6 space-y-6">
                  {isLoadingReviews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-primary">Project Review</h4>
                          <div className="flex text-accent">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-current" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground italic mb-3">"{review.comment}"</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="bg-secondary px-2 py-1 rounded">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No reviews yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      </main>
      <Footer />
    </div>
  );
}
