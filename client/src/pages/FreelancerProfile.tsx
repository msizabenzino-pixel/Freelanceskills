import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, ShieldCheck, Clock, MessageSquare, Loader2, Edit, Camera, X } from "lucide-react";
import { Link, useParams } from "wouter";
import { useCurrency } from "@/lib/currency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { PortfolioUploader } from "@/components/PortfolioUploader";
import { LevelBadge, getLevelFromStats } from "@/components/LevelBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFreelancerProfile,
  saveFreelancerProfile,
  uploadProfilePhoto,
  type FreelancerProfile as FirebaseFreelancerProfile,
} from "@/lib/firebaseAppData";

export default function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draft, setDraft] = useState({
    fullName: "",
    title: "",
    bio: "",
    location: "",
    hourlyRate: "",
    skills: "",
    expertise: "",
    categories: "",
    availability: "",
    experienceLevel: "",
    portfolioLinks: "",
    profilePhotoUrl: "",
  });

  const profileQuery = useQuery({
    queryKey: ["firebase", "freelancer-profile", id],
    queryFn: () => fetchFreelancerProfile(id!),
    enabled: Boolean(id),
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile) return;
    setDraft({
      fullName: profile.fullName || "",
      title: profile.title || "",
      bio: profile.bio || "",
      location: profile.location || "",
      hourlyRate: String(profile.hourlyRate || ""),
      skills: (profile.skills || []).join(", "),
      expertise: (profile.expertise || []).join(", "),
      categories: (profile.categories || []).join(", "),
      availability: profile.availability || "",
      experienceLevel: profile.experienceLevel || "",
      portfolioLinks: (profile.portfolioLinks || []).join(", "),
      profilePhotoUrl: profile.profilePhotoUrl || "",
    });
  }, [profile]);

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!id) throw new Error("Missing profile id");
      return uploadProfilePhoto(id, file, setUploadProgress);
    },
    onSuccess: (url) => {
      setDraft((prev) => ({ ...prev, profilePhotoUrl: url }));
      toast({ title: "Photo updated", description: "Profile photo uploaded successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing profile id");

      const toList = (value: string) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

      const payload: FirebaseFreelancerProfile = {
        userId: id,
        fullName: draft.fullName.trim() || "Freelancer",
        profilePhotoUrl: draft.profilePhotoUrl.trim(),
        bio: draft.bio.trim(),
        title: draft.title.trim(),
        skills: toList(draft.skills),
        expertise: toList(draft.expertise),
        categories: toList(draft.categories),
        hourlyRate: Number(draft.hourlyRate || 0),
        location: draft.location.trim(),
        portfolioLinks: toList(draft.portfolioLinks),
        experienceLevel: draft.experienceLevel.trim(),
        availability: draft.availability.trim(),
        role: "freelancer",
        onboardingCompleted: true,
      };

      await saveFreelancerProfile(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["firebase", "freelancer-profile", id] });
      setEditOpen(false);
      toast({ title: "Profile saved", description: "Your profile has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-white">Profile not found</h2>
          <p className="text-slate-400">The freelancer profile you're looking for doesn't exist.</p>
          <Link href="/find-talent">
            <Button>Browse Freelancers</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile.fullName || profile.title || "Freelancer";
  const bio = profile.bio || "No bio provided.";
  const hourlyRate = profile.hourlyRate || 0;
  const skills = profile.skills || [];
  const isOwnProfile = user?.id === id;

  const reviewsQuery = useQuery({
    queryKey: ["freelancer-reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/freelancers/${id}/reviews`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: Boolean(id),
  });
  const reviews: Array<{ id: string; rating?: number; comment?: string; createdAt?: Date | string | null }> = reviewsQuery.data ?? [];
  const isLoadingReviews = reviewsQuery.isLoading;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main id="main-content">
        <div className="h-64 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative -mt-24 pb-20 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
                <div className="relative inline-block mb-4">
                  {/* Online pulse ring */}
                  <div className="p-1 rounded-full bg-gradient-to-br from-emerald-500/60 to-teal-500/40">
                    <Avatar className="w-28 h-28 border-4 border-slate-900 shadow-2xl">
                      <AvatarImage src={profile.profilePhotoUrl || `https://avatar.iran.liara.run/public/boy?username=${id}`} />
                      <AvatarFallback className="text-2xl font-black bg-emerald-900 text-emerald-300">{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  {profile.role === "freelancer" && (
                    <div className="absolute bottom-1 right-1 bg-slate-900 rounded-full p-1 shadow-lg border border-slate-700" title="Identity Verified">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    </div>
                  )}
                  {/* Live online dot */}
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" title="Online now" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2" data-testid="text-freelancer-name">{displayName}</h1>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <LevelBadge
                    level={getLevelFromStats(reviews.length, (profile as any).rating ?? 0, 0)}
                    size="md"
                    data-testid="badge-freelancer-level"
                  />
                </div>

                {/* Response rate bar */}
                <div className="w-full max-w-[160px] mx-auto mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Response Rate</span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {profile.responseRate != null ? `${profile.responseRate}%` : "96%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${profile.responseRate ?? 96}%` }}
                    />
                  </div>
                </div>

                <p className="text-slate-400 font-medium mb-4" data-testid="text-freelancer-role">{profile.title}</p>

                <div className="flex justify-center gap-4 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1" data-testid="text-freelancer-location">
                    <MapPin className="w-4 h-4" /> {profile.location || "South Africa"}
                  </div>
                  <div className="flex items-center gap-1" data-testid="text-freelancer-timezone">
                    <Clock className="w-4 h-4" /> 2:00 PM Local
                  </div>
                </div>

                {isOwnProfile && (
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mb-3" data-testid="button-edit-profile-main">
                        <Edit className="w-4 h-4 mr-2" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Freelancer Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={draft.profilePhotoUrl || profile.profilePhotoUrl} />
                            <AvatarFallback>{(draft.fullName || displayName).slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <Label htmlFor="profile-photo-upload" className="cursor-pointer">
                              <Button type="button" variant="outline" asChild>
                                <span><Camera className="w-4 h-4 mr-2" /> Upload Photo</span>
                              </Button>
                            </Label>
                            <input
                              id="profile-photo-upload"
                              className="hidden"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadPhotoMutation.mutate(file);
                              }}
                            />
                            {uploadPhotoMutation.isPending && (
                              <p className="text-xs text-slate-400">Uploading... {uploadProgress}%</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={draft.fullName} onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Professional Title</Label>
                            <Input value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={draft.location} onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Hourly Rate (ZAR)</Label>
                            <Input type="number" value={draft.hourlyRate} onChange={(e) => setDraft((prev) => ({ ...prev, hourlyRate: e.target.value }))} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea className="min-h-[110px]" value={draft.bio} onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Skills (comma separated)</Label>
                            <Input value={draft.skills} onChange={(e) => setDraft((prev) => ({ ...prev, skills: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Expertise (comma separated)</Label>
                            <Input value={draft.expertise} onChange={(e) => setDraft((prev) => ({ ...prev, expertise: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Categories (comma separated)</Label>
                            <Input value={draft.categories} onChange={(e) => setDraft((prev) => ({ ...prev, categories: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Availability</Label>
                            <Input value={draft.availability} onChange={(e) => setDraft((prev) => ({ ...prev, availability: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Experience Level</Label>
                            <Input value={draft.experienceLevel} onChange={(e) => setDraft((prev) => ({ ...prev, experienceLevel: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Portfolio Links (comma separated)</Label>
                            <Input value={draft.portfolioLinks} onChange={(e) => setDraft((prev) => ({ ...prev, portfolioLinks: e.target.value }))} />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="outline" onClick={() => setEditOpen(false)}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                          <Button
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending || !draft.fullName.trim() || !draft.title.trim() || draft.bio.trim().length < 40}
                          >
                            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                            Save Profile
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { value: "100%", label: "Job Success", color: "text-emerald-400" },
                    { value: String(profile.completedJobs ?? 0), label: "Jobs Done", color: "text-sky-400" },
                    { value: profile.responseRate != null ? `${profile.responseRate}%` : "96%", label: "Response Rate", color: "text-violet-400" },
                    { value: profile.rating ? (profile.rating / 100).toFixed(1) : "New", label: "Avg Rating", color: "text-amber-400" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                      <div className={`font-black text-lg ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold shadow-lg mb-3" data-testid="button-hire-freelancer">
                  Hire {displayName.split(" ")[0]}
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-message-freelancer">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
                <h3 className="font-bold text-lg mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 bg-slate-800/60 hover:bg-slate-700 text-slate-300" data-testid={`badge-skill-${skill.toLowerCase()}`}>
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No skills listed</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
                <h3 className="font-bold text-lg mb-4">Certifications</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-1"><ShieldCheck className="w-4 h-4" /></div>
                    <div>
                      <div className="font-semibold text-sm">Identity Verified</div>
                      <div className="text-xs text-slate-400">FreelanceSkills</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">About Me</h2>
                    <p className="text-xl font-medium text-accent mt-1">{formatAmount(hourlyRate)} <span className="text-sm text-slate-400 font-normal">/ hour</span></p>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {bio}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                <Tabs defaultValue="portfolio" className="w-full">
                  <div className="px-6 pt-6 border-b border-slate-800">
                    <TabsList className="bg-transparent p-0 h-auto gap-6">
                      <TabsTrigger value="portfolio" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-slate-400 data-[state=active]:text-emerald-400 text-base" data-testid="tab-portfolio">
                        Portfolio
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-slate-400 data-[state=active]:text-emerald-400 text-base" data-testid="tab-reviews">
                        Reviews ({reviews.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="portfolio" className="p-6">
                    {isOwnProfile && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-emerald-400">Upload Portfolio Items</h3>
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
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <p className="text-slate-400">Portfolio items can be managed from your profile editor.</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="p-6 space-y-6">
                    {isLoadingReviews ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      </div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-emerald-400">Project Review</h4>
                            <div className="flex text-accent">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-current" : "text-muted"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-400 italic mb-3">"{review.comment}"</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span className="bg-secondary px-2 py-1 rounded">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-400">No reviews yet.</p>
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
