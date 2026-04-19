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
  AlertCircle,
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

  const jobsQuery = useQuery({
    queryKey: ["firebase", "jobs-by-client", user?.id],
    queryFn: () => fetchJobsByClient(user!.id),
    enabled: Boolean(user?.id),
  });

  const applicationsQuery = useQuery({
    queryKey: ["firebase", "applications-by-freelancer", user?.id],
    queryFn: () => fetchApplicationsForFreelancer(user!.id),
    enabled: Boolean(user?.id),
  });

  const chatsQuery = useQuery({
    queryKey: ["firebase", "support-chats", user?.id],
    queryFn: () => fetchSupportChatsForUser(user!.id),
    enabled: Boolean(user?.id),
  });

  const myApplications = applicationsQuery.data || [];

  const applicationJobsQuery = useQuery({
    queryKey: ["firebase", "application-jobs", myApplications.map((a) => a.jobId).join(",")],
    queryFn: () => fetchJobsByIds(myApplications.map((a) => a.jobId)),
    enabled: myApplications.length > 0,
  });

  const paymentsQuery = useQuery({
    queryKey: ["firebase", "payments", user?.id],
    queryFn: () => fetchUserPayments(user!.id),
    enabled: Boolean(user?.id),
  });

  const settingsQuery = useQuery({
    queryKey: ["firebase", "settings", user?.id],
    queryFn: () => fetchUserSettings(user!.id),
    enabled: Boolean(user?.id),
  });

  const freelancerProfileQuery = useQuery({
    queryKey: ["firebase", "freelancer-profile-dashboard", user?.id],
    queryFn: () => fetchFreelancerProfile(user!.id),
    enabled: Boolean(user?.id),
  });

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
      await updateUserSettings(user.id, {
        displayName: settingsDraft.displayName,
        location: settingsDraft.location,
        bio: settingsDraft.bio,
      });

      const toList = (value: string) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

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
  const myChats = chatsQuery.data || [];

  const loadingAny =
    jobsQuery.isLoading ||
    applicationsQuery.isLoading ||
    chatsQuery.isLoading ||
    paymentsQuery.isLoading ||
    settingsQuery.isLoading ||
    applicationJobsQuery.isLoading ||
    freelancerProfileQuery.isLoading;

  const hasError =
    jobsQuery.isError ||
    applicationsQuery.isError ||
    chatsQuery.isError ||
    paymentsQuery.isError ||
    settingsQuery.isError ||
    applicationJobsQuery.isError ||
    freelancerProfileQuery.isError;

  const navItems: Array<{ key: NavSection; icon: any; count?: number }> = [
    { key: "Overview", icon: Briefcase },
    { key: "My Jobs", icon: Briefcase, count: postedJobs.length + myApplications.length },
    { key: "Messages", icon: MessageSquare, count: myChats.length },
    { key: "Payments", icon: Wallet, count: myPayments.length },
    { key: "Settings", icon: Settings },
  ];

  const renderOverview = () => {
    // Build a strength input from the Firestore profile (if available)
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
      loading: { label: "Checking…",  dot: "bg-slate-500 animate-pulse", badge: "border-slate-700 text-slate-400" },
      none:    { label: "No Profile", dot: "bg-red-500",                 badge: "border-red-500/30 text-red-400" },
      draft:   { label: "Draft",      dot: "bg-amber-500 animate-pulse", badge: "border-amber-500/30 text-amber-400" },
      published:{ label: "Live ✓",   dot: "bg-emerald-500",             badge: "border-emerald-500/30 text-emerald-400" },
    }[profileStatus.status];

    return (
      <div className="space-y-6">
        {/* Profile strength + status */}
        <div className="grid md:grid-cols-2 gap-4">
          <ProfileStrengthMeter data={strengthInput} />

          {/* Status card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Profile Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            {profileStatus.status === "draft" && (
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Your profile is saved but not visible to employers yet. Publish it to start receiving enquiries.
              </p>
            )}
            {profileStatus.status === "none" && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                You don't have a profile yet. Build one in 60 seconds with our AI builder.
              </p>
            )}
            {profileStatus.status === "published" && (
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Your profile is live and visible to employers. Keep it up to date to attract more work.
              </p>
            )}
            <div className="flex gap-2 mt-auto">
              {profileStatus.status === "published" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs border-slate-700"
                  onClick={() => navigate("/cv-upload")}
                  data-testid="btn-edit-profile"
                >
                  <Edit3 className="w-3 h-3" /> Edit Profile
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => navigate("/cv-upload")}
                  data-testid="btn-build-profile"
                >
                  <Zap className="w-3 h-3" />
                  {profileStatus.status === "draft" ? "Publish Profile" : "Build Profile"}
                </Button>
              )}
              {profileStatus.status !== "none" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => navigate(`/find-talent/${user?.id ?? ""}`)}
                  data-testid="btn-view-profile"
                >
                  <Globe className="w-3 h-3" /> View Public Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Activity stat cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Jobs Posted</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold" data-testid="stat-jobs-posted">{postedJobs.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Applications Sent</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold" data-testid="stat-applications-sent">{myApplications.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold" data-testid="stat-conversations">{myChats.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Paid</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold" data-testid="stat-total-paid">
              {formatAmount(myPayments.reduce((acc, p) => acc + (p.amount || 0), 0))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderMyJobs = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Jobs You Posted</h3>
        {postedJobs.length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">No posted jobs yet.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {postedJobs.map((job: Job) => (
              <Card key={job.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/jobs/${job.id}`)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.location} • {job.locationType}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{job.status}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Jobs You Applied To</h3>
        {myApplications.length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">No applications yet.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {myApplications.map((app: JobApplication) => {
              const appJob = applicationJobsQuery.data?.get(app.jobId);
              return (
                <Card key={app.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/jobs/${app.jobId}`)}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{appJob?.title || `Job ${app.jobId}`}</p>
                        <p className="text-xs text-muted-foreground">
                          Client: {appJob?.clientName || app.clientId} • Applied: {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{app.status}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Support & Messages</h3>
        <Button onClick={() => {
          const btn = document.querySelector("[data-testid='button-support-chat']") as HTMLButtonElement | null;
          btn?.click();
        }}>
          Open Support Chat
        </Button>
      </div>
      {myChats.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">No conversations yet. Start one from Support Chat.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {myChats.map((chat) => (
            <Card key={chat.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Conversation {chat.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {formatDate(chat.updatedAt)}
                  </p>
                </div>
                <Badge>{chat.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payments</h3>
      {myPayments.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">No payments yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {myPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold capitalize">{payment.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatAmount(payment.amount || 0)}</p>
                  <Badge variant="secondary">{payment.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => {
    const settings = settingsQuery.data || {};
    const data = {
      displayName: settingsDraft.displayName || settings.displayName || "",
      title: settingsDraft.title || freelancerProfileQuery.data?.title || "",
      location: settingsDraft.location || settings.location || "",
      bio: settingsDraft.bio || settings.bio || "",
      hourlyRate: settingsDraft.hourlyRate || String(freelancerProfileQuery.data?.hourlyRate || ""),
      skills: settingsDraft.skills || (freelancerProfileQuery.data?.skills || []).join(", "),
      expertise: settingsDraft.expertise || (freelancerProfileQuery.data?.expertise || []).join(", "),
      availability: settingsDraft.availability || freelancerProfileQuery.data?.availability || "",
      profilePhotoUrl: settingsDraft.profilePhotoUrl || freelancerProfileQuery.data?.profilePhotoUrl || "",
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={data.profilePhotoUrl || "https://avatar.iran.liara.run/public/boy?username=freelancer"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="space-y-2">
                <Label htmlFor="dashboard-photo-upload">Profile Photo</Label>
                <Input
                  id="dashboard-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhotoMutation.mutate(file);
                  }}
                />
                {uploadPhotoMutation.isPending && (
                  <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                )}
              </div>
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={data.displayName} onChange={(e) => setSettingsDraft((s) => ({ ...s, displayName: e.target.value }))} />
            </div>
            <div>
              <Label>Professional Title</Label>
              <Input value={data.title} onChange={(e) => setSettingsDraft((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={data.location} onChange={(e) => setSettingsDraft((s) => ({ ...s, location: e.target.value }))} />
            </div>
            <div>
              <Label>Hourly Rate (ZAR)</Label>
              <Input type="number" value={data.hourlyRate} onChange={(e) => setSettingsDraft((s) => ({ ...s, hourlyRate: e.target.value }))} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={data.bio} onChange={(e) => setSettingsDraft((s) => ({ ...s, bio: e.target.value }))} />
            </div>
            <div>
              <Label>Skills (comma separated)</Label>
              <Input value={data.skills} onChange={(e) => setSettingsDraft((s) => ({ ...s, skills: e.target.value }))} />
            </div>
            <div>
              <Label>Expertise (comma separated)</Label>
              <Input value={data.expertise} onChange={(e) => setSettingsDraft((s) => ({ ...s, expertise: e.target.value }))} />
            </div>
            <div>
              <Label>Availability</Label>
              <Input value={data.availability} onChange={(e) => setSettingsDraft((s) => ({ ...s, availability: e.target.value }))} />
            </div>
            <Button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
            {user?.id && (
              <Button variant="outline" onClick={() => navigate(`/profile/${user.id}`)}>
                <Camera className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AuthGuard message="Sign in to access your dashboard, manage jobs, and track payments.">
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
              <p className="text-muted-foreground">Manage jobs, applications, conversations, payments, and settings.</p>
            </div>

            {loadingAny ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="py-4 space-y-1">
                      {navItems.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setActiveNav(item.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeNav === item.key ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            {item.key}
                          </span>
                          {typeof item.count === "number" && (
                            <span className={`text-xs ${activeNav === item.key ? "text-white/90" : "text-muted-foreground"}`}>
                              {item.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  {hasError && (
                    <Card>
                      <CardContent className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <AlertCircle className="w-4 h-4" />
                          Some dashboard data could not be loaded. Showing available data.
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            jobsQuery.refetch();
                            applicationsQuery.refetch();
                            chatsQuery.refetch();
                            paymentsQuery.refetch();
                            settingsQuery.refetch();
                            applicationJobsQuery.refetch();
                          }}
                        >
                          Retry
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  {activeNav === "Overview" && <SectionBoundary>{renderOverview()}</SectionBoundary>}
                  {activeNav === "My Jobs" && <SectionBoundary>{renderMyJobs()}</SectionBoundary>}
                  {activeNav === "Messages" && <SectionBoundary>{renderMessages()}</SectionBoundary>}
                  {activeNav === "Payments" && <SectionBoundary>{renderPayments()}</SectionBoundary>}
                  {activeNav === "Settings" && <SectionBoundary>{renderSettings()}</SectionBoundary>}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
