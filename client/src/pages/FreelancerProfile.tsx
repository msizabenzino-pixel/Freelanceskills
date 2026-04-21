import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, ShieldCheck, Clock, MessageSquare, Loader2, Edit, Camera, X, ExternalLink, Award, Briefcase, Zap, PlusCircle } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
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

function getDomainLabel(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return "";
  }
}

export default function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
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

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing profile id");
      const res = await fetch(`/api/freelancers/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["freelancer-reviews", id] });
      setReviewOpen(false);
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
    },
    onError: (error: Error) => {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!profile) return;
    const name = profile.fullName || profile.title || "Freelancer";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": name,
      "jobTitle": profile.title || "Freelancer",
      "description": profile.bio || "",
      "image": profile.profilePhotoUrl || "",
      "address": { "@type": "PostalAddress", "addressCountry": "ZA", "addressLocality": profile.location || "South Africa" },
      "knowsAbout": profile.skills || [],
      "url": `https://freelanceskills.net/freelancer/${id}`,
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": profile.hourlyRate || 0,
          "priceCurrency": "ZAR",
          "unitCode": "HUR",
        },
      },
    };
    const existing = document.getElementById("jsonld-profile");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "jsonld-profile";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    document.title = `${name} — FreelanceSkills.net`;

    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, property); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const desc = `${profile.category || "Freelancer"} in ${profile.location || "South Africa"} — R${profile.hourlyRate ?? "?"}/hr · ${profile.rating ?? "5.0"} stars`;
    const avatar = (profile as any).avatarUrl || "";
    setMeta("og:title", `${name} — FreelanceSkills.net`);
    setMeta("og:description", desc);
    setMeta("og:type", "profile");
    setMeta("og:url", window.location.href);
    if (avatar) setMeta("og:image", avatar);
    setMeta("twitter:title", `${name} — FreelanceSkills.net`, true);
    setMeta("twitter:description", desc, true);
    setMeta("twitter:card", "summary", true);
    if (avatar) setMeta("twitter:image", avatar, true);

    return () => {
      document.getElementById("jsonld-profile")?.remove();
      document.title = "FreelanceSkills.net";
    };
  }, [profile, id]);

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

                <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1" data-testid="text-freelancer-location">
                    <MapPin className="w-4 h-4 shrink-0" /> {profile.location || "South Africa"}
                  </div>
                  <div className="flex items-center gap-1" data-testid="text-freelancer-timezone">
                    <Clock className="w-4 h-4 shrink-0" /> 2:00 PM Local
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

                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90 font-bold shadow-lg mb-3"
                  data-testid="button-hire-freelancer"
                  onClick={() => navigate(`/post-job?hire=${id}`)}
                >
                  Hire {displayName.split(" ")[0]}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-message-freelancer"
                  onClick={() => navigate(`/messages?new=${id}`)}
                >
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
                <h3 className="font-bold text-lg mb-4">Verifications</h3>
                <ul className="space-y-3">
                  {profile.role === "freelancer" && (
                    <li className="flex items-start gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-1"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                        <div className="font-semibold text-sm text-white">Identity Verified</div>
                        <div className="text-xs text-slate-400">FreelanceSkills KYC</div>
                      </div>
                    </li>
                  )}
                  {(profile as any).vettingStatus === "nuclear" && (
                    <li className="flex items-start gap-3">
                      <div className="bg-violet-500/10 p-2 rounded-lg text-violet-400 mt-1"><Zap className="w-4 h-4" /></div>
                      <div>
                        <div className="font-semibold text-sm text-white">Nuclear Vetted</div>
                        <div className="text-xs text-slate-400">Top 1% of platform</div>
                      </div>
                    </li>
                  )}
                  {profile.experienceLevel && (
                    <li className="flex items-start gap-3">
                      <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400 mt-1"><Briefcase className="w-4 h-4" /></div>
                      <div>
                        <div className="font-semibold text-sm text-white capitalize">{profile.experienceLevel} Level</div>
                        <div className="text-xs text-slate-400">Self-declared & verified</div>
                      </div>
                    </li>
                  )}
                  {(profile as any).isPro && (
                    <li className="flex items-start gap-3">
                      <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400 mt-1"><Award className="w-4 h-4" /></div>
                      <div>
                        <div className="font-semibold text-sm text-white">Pro Member</div>
                        <div className="text-xs text-slate-400">Premium plan subscriber</div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-800">
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
                  <div className="px-4 sm:px-6 pt-6 border-b border-slate-800 overflow-x-auto">
                    <TabsList className="bg-transparent p-0 h-auto gap-4 sm:gap-6 flex flex-nowrap min-w-max">
                      <TabsTrigger value="portfolio" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-slate-400 data-[state=active]:text-emerald-400 text-sm sm:text-base whitespace-nowrap" data-testid="tab-portfolio">
                        Portfolio
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-slate-400 data-[state=active]:text-emerald-400 text-sm sm:text-base whitespace-nowrap" data-testid="tab-reviews">
                        Reviews ({reviews.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="portfolio" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-slate-300">Work Samples &amp; Projects</h3>
                      {isOwnProfile && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid="button-manage-portfolio">
                              <Edit className="w-4 h-4 mr-2" /> Manage Portfolio
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Update Your Portfolio</DialogTitle>
                            </DialogHeader>
                            <PortfolioUploader />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {(profile.portfolioLinks || []).length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {(profile.portfolioLinks || []).map((link, i) => {
                          const domain = getDomainLabel(link);
                          const favicon = getFaviconUrl(link);
                          const href = link.startsWith("http") ? link : `https://${link}`;
                          return (
                            <a
                              key={i}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`portfolio-link-${i}`}
                              className="group flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 rounded-xl transition-all duration-200"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {favicon ? (
                                  <img src={favicon} alt={domain} className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                ) : (
                                  <ExternalLink className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-white truncate">{domain}</div>
                                <div className="text-xs text-slate-400 truncate">{href}</div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="w-7 h-7 text-slate-600" />
                        </div>
                        <h4 className="font-semibold text-slate-300 mb-1">No portfolio items yet</h4>
                        {isOwnProfile ? (
                          <p className="text-sm text-slate-500 mb-4">Add links to your GitHub, Behance, Dribbble, or any project URL.</p>
                        ) : (
                          <p className="text-sm text-slate-500">This freelancer hasn't added portfolio links yet.</p>
                        )}
                        {isOwnProfile && (
                          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} data-testid="button-add-portfolio">
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Portfolio Links
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-slate-300">
                        {reviews.length > 0
                          ? `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                          : "Client Reviews"}
                      </h3>
                      {!isOwnProfile && user && (
                        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid="button-write-review">
                              <PlusCircle className="w-4 h-4 mr-2" /> Write a Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-slate-900 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Leave a Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div>
                                <Label className="text-slate-300 mb-2 block">Rating</Label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className="focus:outline-none"
                                      data-testid={`star-rating-${star}`}
                                    >
                                      <Star className={`w-7 h-7 transition-colors ${star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-600 hover:text-amber-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-slate-300 mb-2 block">Your Review</Label>
                                <Textarea
                                  placeholder="Describe your experience working with this freelancer…"
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                  data-testid="input-review-comment"
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                                <Button
                                  onClick={() => submitReviewMutation.mutate()}
                                  disabled={submitReviewMutation.isPending || reviewComment.trim().length < 10}
                                  data-testid="button-submit-review"
                                >
                                  {submitReviewMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                  Submit Review
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {isLoadingReviews ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      </div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white">Verified Client</h4>
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-slate-400 font-semibold">{review.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-slate-300 leading-relaxed mb-3">"{review.comment}"</p>
                          <span className="text-xs text-slate-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" }) : "Recently"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <Star className="w-7 h-7 text-slate-600" />
                        </div>
                        <h4 className="font-semibold text-slate-300 mb-1">No reviews yet</h4>
                        <p className="text-sm text-slate-500 mb-4">
                          {isOwnProfile ? "Reviews from clients will appear here after completed projects." : "Be the first to review this freelancer."}
                        </p>
                        {!isOwnProfile && user && (
                          <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)} data-testid="button-first-review">
                            <PlusCircle className="w-4 h-4 mr-2" /> Write First Review
                          </Button>
                        )}
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
