import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { SectionBoundary } from "@/components/ErrorBoundary";
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
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight,
  User,
  Plus,
  Lock,
  ShieldCheck,
} from "lucide-react";

type NavSection = "Overview" | "My Jobs" | "Applications" | "Payments" | "Settings";

function formatDate(value?: Date | null) {
  if (!value) return "Unknown";
  return value.toLocaleDateString();
}

const NAV_ITEMS: { id: NavSection; icon: React.ElementType; label: string }[] = [
  { id: "Overview", icon: LayoutDashboard, label: "Overview" },
  { id: "My Jobs", icon: Briefcase, label: "My Jobs" },
  { id: "Applications", icon: ClipboardList, label: "Applications" },
  { id: "Payments", icon: Wallet, label: "Payments" },
  { id: "Settings", icon: Settings, label: "Settings" },
];

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const profileStatus = useProfileStatus(user?.id);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const jobsQuery = useQuery({ queryKey: ["firebase", "jobs-by-client", user?.id], queryFn: () => fetchJobsByClient(user!.id), enabled: Boolean(user?.id) });
  const applicationsQuery = useQuery({ queryKey: ["firebase", "applications-by-freelancer", user?.id], queryFn: () => fetchApplicationsForFreelancer(user!.id), enabled: Boolean(user?.id) });
  const chatsQuery = useQuery({ queryKey: ["firebase", "support-chats", user?.id], queryFn: () => fetchSupportChatsForUser(user!.id), enabled: Boolean(user?.id) });
  const myApplications = applicationsQuery.data || [];
  const applicationJobsQuery = useQuery({
    queryKey: ["firebase", "application-jobs", myApplications.map((a) => a.jobId).join(",")],
    queryFn: () => fetchJobsByIds(myApplications.map((a) => a.jobId)),
    enabled: myApplications.length > 0,
  });
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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Please sign in.");
      return uploadProfilePhoto(user.id, file, setUploadProgress);
    },
    onSuccess: (url) => {
      setSettingsDraft((prev) => ({ ...prev, profilePhotoUrl: url }));
    },
  });

  const postedJobs = jobsQuery.data || [];
  const myPayments = paymentsQuery.data || [];

  const statusCfg = {
    loading: { label: "Checking…", dot: "bg-slate-500 animate-pulse", badge: "border-slate-700 text-slate-400" },
    none: { label: "Setup Needed", dot: "bg-amber-500", badge: "border-amber-500/30 text-amber-400" },
    draft: { label: "Draft", dot: "bg-amber-500 animate-pulse", badge: "border-amber-500/30 text-amber-400" },
    published: { label: "Live ✓", dot: "bg-emerald-500", badge: "border-emerald-500/30 text-emerald-400" },
  }[profileStatus.status];

  const renderOverview = () => {
    const fp = profileStatus.profile;
    const strengthInput = {
      firstName: fp?.firstName || fp?.fullName?.split(" ")[0] || "",
      lastName: fp?.lastName || fp?.fullName?.split(" ").slice(1).join(" ") || "",
      title: fp?.title,
      bio: fp?.bio,
      skills: fp?.skills,
      category: fp?.categories?.[0] || fp?.category,
      hourlyRate: fp?.hourlyRate,
      location: fp?.location,
      photo: fp?.photoUrl || fp?.profileImageUrl || fp?.profilePhotoUrl || "",
      portfolioUrl: fp?.portfolioLinks?.[0] || fp?.portfolioUrl || "",
      languages: fp?.languages || [],
      availability: fp?.availability,
    };
    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-900/50 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Welcome back{
              fp?.fullName ? `, ${fp.fullName.split(" ")[0]}` :
              user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""
            }!</h2>
            <p className="text-slate-400 text-sm mt-0.5">Manage your jobs, applications, and profile from here.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs" onClick={() => navigate("/post-job")} data-testid="btn-post-job-quick">
              <Plus className="w-3.5 h-3.5" /> Post a Job
            </Button>
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs gap-1.5" onClick={() => navigate("/jobs")} data-testid="btn-find-work-quick">
              <Briefcase className="w-3.5 h-3.5" /> Find Work
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Jobs Posted", value: postedJobs.length, icon: Briefcase, color: "emerald", testId: "stat-jobs-posted" },
            { label: "Applications Sent", value: myApplications.length, icon: ClipboardList, color: "blue", testId: "stat-applications-sent" },
            { label: "Conversations", value: chatsQuery.data?.length ?? 0, icon: MessageSquare, color: "violet", testId: "stat-conversations" },
            { label: "Total Earned", value: formatAmount(myPayments.reduce((acc, p) => acc + (p.amount || 0), 0)), icon: Wallet, color: "amber", testId: "stat-total-paid", raw: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className={`w-9 h-9 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4.5 h-4.5 text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white" data-testid={stat.testId}>{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile strength + status */}
        <div className="grid md:grid-cols-2 gap-4">
          <ProfileStrengthMeter data={strengthInput} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Profile Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            {profileStatus.status === "draft" && (
              <p className="text-xs text-amber-300/80 leading-relaxed">Your profile is saved but not visible to employers yet. Publish it to start receiving enquiries.</p>
            )}
            {profileStatus.status === "none" && (
              <p className="text-xs text-slate-400 leading-relaxed">You don't have a profile yet. Build one in 60 seconds with our AI builder.</p>
            )}
            {profileStatus.status === "published" && (
              <p className="text-xs text-emerald-300/80 leading-relaxed">Your profile is live and visible to employers. Keep it up to date to attract more work.</p>
            )}
            <div className="flex gap-2 mt-auto">
              {profileStatus.status === "published" ? (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate("/edit-profile")} data-testid="btn-edit-profile">
                  <Edit3 className="w-3 h-3" /> Edit Profile
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => navigate("/cv-upload")} data-testid="btn-build-profile">
                  <Zap className="w-3 h-3" />
                  {profileStatus.status === "draft" ? "Publish Profile" : "Build Profile"}
                </Button>
              )}
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate(`/profile/${user?.id}`)} data-testid="btn-view-profile">
                View Public Profile <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Recent applications */}
        {myApplications.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Applications</h3>
            <div className="space-y-2">
              {myApplications.slice(0, 3).map((app: JobApplication) => {
                const job = applicationJobsQuery.data?.find((j) => j.id === app.jobId);
                return (
                  <div key={app.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <span className="text-sm text-slate-300">{job?.title || "Loading job…"}</span>
                    <Badge className={
                      app.status === "accepted" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      app.status === "rejected" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                      "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }>
                      {app.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {myApplications.length > 3 && (
              <button className="text-xs text-emerald-400 hover:text-emerald-300 mt-3 flex items-center gap-1" onClick={() => setActiveNav("Applications")}>
                View all {myApplications.length} applications <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMyJobs = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Posted Jobs</h3>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs" onClick={() => navigate("/post-job")} data-testid="btn-post-new-job">
          <Plus className="w-3.5 h-3.5" /> Post New Job
        </Button>
      </div>
      {jobsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : postedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-base font-semibold text-white mb-2">No jobs posted yet</h4>
          <p className="text-sm text-slate-400 mb-6">Post your first job and start receiving proposals from verified freelancers.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => navigate("/post-job")}>Post a Job</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {postedJobs.map((job: Job) => (
            <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{job.title}</h4>
                  {job.location && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </p>
                  )}
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">Open</Badge>
              </div>
              {job.description && (
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{job.description}</p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate((job as any).createdAt)}
                </span>
                <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View Proposals <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white">My Applications</h3>
      {applicationsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : myApplications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-base font-semibold text-white mb-2">No applications yet</h4>
          <p className="text-sm text-slate-400 mb-6">Browse open jobs and submit your first proposal.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => navigate("/jobs")}>Browse Jobs</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {myApplications.map((app: JobApplication) => {
            const job = applicationJobsQuery.data?.find((j) => j.id === app.jobId);
            return (
              <div key={app.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all" data-testid={`application-${app.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{job?.title || "Loading…"}</h4>
                    {app.coverLetter && (
                      <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">{app.coverLetter}</p>
                    )}
                  </div>
                  <Badge className={
                    app.status === "accepted" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                    app.status === "rejected" ? "bg-red-500/15 text-red-400 border border-red-500/30" :
                    "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }>
                    {app.status || "Pending"}
                  </Badge>
                </div>
                {app.proposedRate && (
                  <p className="text-sm font-semibold text-emerald-400 mt-2">{formatAmount(app.proposedRate)}</p>
                )}
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Applied {formatDate((app as any).createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-5">
      {/* Escrow Protection Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-slate-900 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center" data-testid="escrow-protection-banner">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm font-bold text-white">PayFast Escrow Protection — Active</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">All payments are held securely in escrow until you approve the work. Funds are released only when you're satisfied.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs gap-1.5 flex-shrink-0"
          onClick={() => navigate("/payments-hub")}
          data-testid="btn-view-escrow-details"
        >
          <ArrowRight className="w-3.5 h-3.5" /> View Details
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Payment History</h3>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total earnings</p>
          <p className="text-xl font-bold text-emerald-400" data-testid="stat-total-earnings">
            {formatAmount(myPayments.reduce((acc, p) => acc + (p.amount || 0), 0))}
          </p>
        </div>
      </div>
      {paymentsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : myPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-base font-semibold text-white mb-2">No payments yet</h4>
          <p className="text-sm text-slate-400">Completed jobs will appear here once payment is released.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          {myPayments.map((payment, i) => (
            <div key={i} className="flex items-center justify-between p-5 border-b border-slate-800 last:border-0" data-testid={`payment-${i}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{(payment as any).description || "Payment received"}</p>
                  <p className="text-xs text-slate-400">{formatDate((payment as any).createdAt)}</p>
                </div>
              </div>
              <span className="text-emerald-400 font-semibold text-sm">+{formatAmount(payment.amount || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">Profile & Settings</h3>

      {saveSuccess && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm" data-testid="save-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      {/* Photo upload */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-white mb-4">Profile Photo</h4>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {settingsDraft.profilePhotoUrl ? (
              <img src={settingsDraft.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5 text-xs"
                onClick={() => document.getElementById("photo-upload")?.click()}
                disabled={uploadPhotoMutation.isPending}
              >
                {uploadPhotoMutation.isPending ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Uploading ({uploadProgress}%)</>
                ) : (
                  <><Camera className="w-3 h-3" /> Upload Photo</>
                )}
              </Button>
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              data-testid="input-photo-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPhotoMutation.mutate(file);
              }}
            />
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
        <h4 className="text-sm font-semibold text-white">Profile Details</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name" className="text-xs text-slate-400">Display Name</Label>
            <Input
              id="settings-name"
              value={settingsDraft.displayName}
              onChange={(e) => setSettingsDraft((p) => ({ ...p, displayName: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              placeholder="Your full name"
              data-testid="input-settings-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-title" className="text-xs text-slate-400">Professional Title</Label>
            <Input
              id="settings-title"
              value={settingsDraft.title}
              onChange={(e) => setSettingsDraft((p) => ({ ...p, title: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              placeholder="e.g. Senior UX Designer"
              data-testid="input-settings-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-location" className="text-xs text-slate-400">Location</Label>
            <Input
              id="settings-location"
              value={settingsDraft.location}
              onChange={(e) => setSettingsDraft((p) => ({ ...p, location: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              placeholder="e.g. Cape Town, South Africa"
              data-testid="input-settings-location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-rate" className="text-xs text-slate-400">Hourly Rate (ZAR)</Label>
            <Input
              id="settings-rate"
              type="number"
              value={settingsDraft.hourlyRate}
              onChange={(e) => setSettingsDraft((p) => ({ ...p, hourlyRate: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              placeholder="e.g. 450"
              data-testid="input-settings-rate"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-bio" className="text-xs text-slate-400">Bio</Label>
          <Textarea
            id="settings-bio"
            value={settingsDraft.bio}
            onChange={(e) => setSettingsDraft((p) => ({ ...p, bio: e.target.value }))}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 min-h-[100px] resize-none"
            placeholder="A short description of your experience and what you do"
            data-testid="textarea-settings-bio"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-skills" className="text-xs text-slate-400">Skills (comma-separated)</Label>
          <Input
            id="settings-skills"
            value={settingsDraft.skills}
            onChange={(e) => setSettingsDraft((p) => ({ ...p, skills: e.target.value }))}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
            placeholder="e.g. React, Node.js, Python"
            data-testid="input-settings-skills"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-availability" className="text-xs text-slate-400">Availability</Label>
          <Input
            id="settings-availability"
            value={settingsDraft.availability}
            onChange={(e) => setSettingsDraft((p) => ({ ...p, availability: e.target.value }))}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
            placeholder="e.g. Available immediately, Part-time"
            data-testid="input-settings-availability"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
          onClick={() => navigate("/edit-profile")}
          data-testid="btn-advanced-builder"
        >
          Edit Profile
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          onClick={() => saveSettingsMutation.mutate()}
          disabled={saveSettingsMutation.isPending}
          data-testid="btn-save-settings"
        >
          {saveSettingsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-5xl mx-auto">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your account, jobs, and profile</p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar nav */}
                <aside className="lg:w-56 shrink-0">
                  <nav className="flex lg:flex-col gap-1" data-testid="dashboard-nav">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        data-testid={`nav-${item.id.toLowerCase().replace(" ", "-")}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left ${
                          activeNav === item.id
                            ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="hidden lg:inline">{item.label}</span>
                        <span className="lg:hidden">{item.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </nav>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <SectionBoundary>
                    {activeNav === "Overview" && renderOverview()}
                    {activeNav === "My Jobs" && renderMyJobs()}
                    {activeNav === "Applications" && renderApplications()}
                    {activeNav === "Payments" && renderPayments()}
                    {activeNav === "Settings" && renderSettings()}
                  </SectionBoundary>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
