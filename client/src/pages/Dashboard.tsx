import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { SectionBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useProfileStatus } from "@/hooks/use-profile-status";
import { useCurrency } from "@/lib/currency";
import { ProfileStrengthMeter } from "@/components/ProfileStrengthMeter";
import {
  fetchFreelancerProfile,
  fetchApplicationsForFreelancer,
  fetchJobsByClient,
  fetchJobsByIds,
  fetchSupportChatsForUser,
  fetchUserPayments,
  fetchUserSettings,
  saveFreelancerProfile,
  uploadProfilePhoto,
  updateUserSettings,
  type FreelancerProfile,
  type Job,
  type JobApplication,
} from "@/lib/firebaseAppData";
import {
  Briefcase,
  MessageSquare,
  Wallet,
  Settings,
  Loader2,
  ChevronRight,
  Save,
  Camera,
  Zap,
  Globe,
  Edit3,
} from "lucide-react";

type NavSection = "Overview" | "My Jobs" | "Messages" | "Payments" | "Settings";

function formatDate(value?: Date | null) {
  if (!value) return "Unknown";
  return value.toLocaleDateString();
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<NavSection>("Overview");
  const [settingsDraft, setSettingsDraft] = useState({
    displayName: "",
    title: "",
    location: "",
    bio: "",
    hourlyRate: "",
    skills: "",
    expertise: "",
    availability: "",
    profilePhotoUrl: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const profileStatus = useProfileStatus(user?.id);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const jobsQuery = useQuery({ queryKey: ["firebase", "jobs-by-client", user?.id], queryFn: () => fetchJobsByClient(user!.id), enabled: Boolean(user?.id) });
  const applicationsQuery = useQuery({ queryKey: ["firebase", "applications-by-freelancer", user?.id], queryFn: () => fetchApplicationsForFreelancer(user!.id), enabled: Boolean(user?.id) });
  const chatsQuery = useQuery({ queryKey: ["firebase", "support-chats", user?.id], queryFn: () => fetchSupportChatsForUser(user!.id), enabled: Boolean(user?.id) });
  const myApplications = applicationsQuery.data || [];
  const applicationJobsQuery = useQuery({ queryKey: ["firebase", "application-jobs", myApplications.map((a) => a.jobId).join(",")], queryFn: () => fetchJobsByIds(myApplications.map((a) => a.jobId)), enabled: myApplications.length > 0 });
  const paymentsQuery = useQuery({ queryKey: ["firebase", "payments", user?.id], queryFn: () => fetchUserPayments(user!.id), enabled: Boolean(user?.id) });
  const settingsQuery = useQuery({ queryKey: ["firebase", "settings", user?.id], queryFn: () => fetchUserSettings(user!.id), enabled: Boolean(user?.id) });
  const freelancerProfileQuery = useQuery({ queryKey: ["firebase", "freelancer-profile-dashboard", user?.id], queryFn: () => fetchFreelancerProfile(user!.id), enabled: Boolean(user?.id) });

  useEffect(() => {
    const profile = freelancerProfileQuery.data;
    if (!profile) return;
    setSettingsDraft((prev) => ({
      ...prev,
      displayName: prev.displayName || profile.fullName || "",
      title: prev.title || profile.title || "",
      location: prev.location || profile.location || "",
      bio: prev.bio || profile.bio || "",
      hourlyRate: prev.hourlyRate || String(profile.hourlyRate || ""),
      skills: prev.skills || (profile.skills || []).join(", "),
      expertise: prev.expertise || (profile.expertise || []).join(", "),
      availability: prev.availability || profile.availability || "",
      profilePhotoUrl: prev.profilePhotoUrl || profile.profilePhotoUrl || "",
    }));
  }, [freelancerProfileQuery.data]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await updateUserSettings(user.id, { displayName: settingsDraft.displayName, location: settingsDraft.location, bio: settingsDraft.bio });
      const toList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
      const payload: FreelancerProfile = {
        userId: user.id,
        fullName: settingsDraft.displayName.trim() || "Freelancer",
        profilePhotoUrl: settingsDraft.profilePhotoUrl.trim(),
        bio: settingsDraft.bio.trim(),
        title: settingsDraft.title.trim(),
        skills: toList(settingsDraft.skills),
        expertise: toList(settingsDraft.expertise),
        categories: freelancerProfileQuery.data?.categories || [],
        hourlyRate: Number(settingsDraft.hourlyRate || 0),
        location: settingsDraft.location.trim(),
        portfolioLinks: freelancerProfileQuery.data?.portfolioLinks || [],
        experienceLevel: freelancerProfileQuery.data?.experienceLevel || "",
        availability: settingsDraft.availability.trim(),
        role: "freelancer",
        onboardingCompleted: true,
      };
      await saveFreelancerProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "settings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["firebase", "freelancer-profile-dashboard", user?.id] });
    },
  });

  const uploadPhotoMutation = useMutation({ mutationFn: async (file: File) => { if (!user?.id) throw new Error("Please sign in."); return uploadProfilePhoto(user.id, file, setUploadProgress); }, onSuccess: (url) => { setSettingsDraft((prev) => ({ ...prev, profilePhotoUrl: url })); } });

  const postedJobs = jobsQuery.data || [];
  const myPayments = paymentsQuery.data || [];
  const myChats = chatsQuery.data || [];

  const renderOverview = () => {
    const fp = profileStatus.profile;
    const strengthInput = {
      firstName: fp?.fullName?.split(" ")[0] ?? "",
      lastName: fp?.fullName?.split(" ").slice(1).join(" ") ?? "",
      title: fp?.title,
      bio: fp?.bio,
      skills: fp?.skills,
      category: fp?.categories?.[0],
      hourlyRate: fp?.hourlyRate,
      location: fp?.location,
      photo: fp?.profilePhotoUrl,
      portfolioUrl: fp?.portfolioLinks?.[0],
      languages: [],
      availability: fp?.availability,
    };
    const statusCfg = {
      loading: { label: "Checking…", dot: "bg-slate-500 animate-pulse", badge: "border-slate-700 text-slate-400" },
      none: { label: "No Profile", dot: "bg-red-500", badge: "border-red-500/30 text-red-400" },
      draft: { label: "Draft", dot: "bg-amber-500 animate-pulse", badge: "border-amber-500/30 text-amber-400" },
      published: { label: "Live ✓", dot: "bg-emerald-500", badge: "border-emerald-500/30 text-emerald-400" },
    }[profileStatus.status];

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <ProfileStrengthMeter data={strengthInput} />
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-foreground">Profile Status</span><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}><span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />{statusCfg.label}</span></div>
            {profileStatus.status === "draft" && <p className="text-xs text-amber-300/80 leading-relaxed">Your profile is saved but not visible to employers yet. Publish it to start receiving enquiries.</p>}
            {profileStatus.status === "none" && <p className="text-xs text-muted-foreground leading-relaxed">You don't have a profile yet. Build one in 60 seconds with our AI builder.</p>}
            {profileStatus.status === "published" && <p className="text-xs text-emerald-300/80 leading-relaxed">Your profile is live and visible to employers. Keep it up to date to attract more work.</p>}
            <div className="flex gap-2 mt-auto">
              {profileStatus.status === "published" ? <Button size="sm" variant="outline" className="gap-1.5 text-xs border-slate-700" onClick={() => navigate("/cv-upload")} data-testid="btn-edit-profile"><Edit3 className="w-3 h-3" /> Edit Profile</Button> : <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => navigate("/cv-upload")} data-testid="btn-build-profile"><Zap className="w-3 h-3" />{profileStatus.status === "draft" ? "Publish Profile" : "Build Profile"}</Button>}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Jobs Posted</CardTitle></CardHeader><CardContent className="text-2xl font-bold" data-testid="stat-jobs-posted">{postedJobs.length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Applications Sent</CardTitle></CardHeader><CardContent className="text-2xl font-bold" data-testid="stat-applications-sent">{myApplications.length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Conversations</CardTitle></CardHeader><CardContent className="text-2xl font-bold" data-testid="stat-conversations">{myChats.length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Paid</CardTitle></CardHeader><CardContent className="text-2xl font-bold" data-testid="stat-total-paid">{formatAmount(myPayments.reduce((acc, p) => acc + (p.amount || 0), 0))}</CardContent></Card>
        </div>
      </div>
    );
  };

  const renderMyJobs = () => (<div className="space-y-6">{postedJobs.length === 0 ? <Card><CardContent className="py-6 text-sm text-muted-foreground">No posted jobs yet.</CardContent></Card> : <div className="grid gap-3">{postedJobs.map((job: Job) => <Card key={job.id}><CardContent className="py-4"><p className="font-semibold">{job.title}</p></CardContent></Card>)}</div>}</div>);
  const renderMessages = () => <div className="space-y-4"><h3 className="text-lg font-semibold">Support & Messages</h3></div>;
  const renderPayments = () => <div className="space-y-4"><h3 className="text-lg font-semibold">Payments</h3></div>;
  const renderSettings = () => <div className="space-y-4"><h3 className="text-lg font-semibold">Settings</h3></div>;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {activeNav === "Overview" && <SectionBoundary>{renderOverview()}</SectionBoundary>}
              {activeNav === "My Jobs" && <SectionBoundary>{renderMyJobs()}</SectionBoundary>}
              {activeNav === "Messages" && <SectionBoundary>{renderMessages()}</SectionBoundary>}
              {activeNav === "Payments" && <SectionBoundary>{renderPayments()}</SectionBoundary>}
              {activeNav === "Settings" && <SectionBoundary>{renderSettings()}</SectionBoundary>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
