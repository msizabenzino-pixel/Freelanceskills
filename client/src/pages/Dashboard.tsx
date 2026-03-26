import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/lib/currency";
import {
  fetchApplicationsForFreelancer,
  fetchJobsByClient,
  fetchJobsByIds,
  fetchSupportChatsForUser,
  fetchUserPayments,
  fetchUserSettings,
  updateUserSettings,
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
    location: "",
    bio: "",
  });
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
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

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await updateUserSettings(user.id, settingsDraft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "settings", user?.id] });
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
    applicationJobsQuery.isLoading;

  const hasError =
    jobsQuery.isError ||
    applicationsQuery.isError ||
    chatsQuery.isError ||
    paymentsQuery.isError ||
    settingsQuery.isError ||
    applicationJobsQuery.isError;

  const navItems: Array<{ key: NavSection; icon: any; count?: number }> = [
    { key: "Overview", icon: Briefcase },
    { key: "My Jobs", icon: Briefcase, count: postedJobs.length + myApplications.length },
    { key: "Messages", icon: MessageSquare, count: myChats.length },
    { key: "Payments", icon: Wallet, count: myPayments.length },
    { key: "Settings", icon: Settings },
  ];

  const renderOverview = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Jobs Posted</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{postedJobs.length}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Applications Sent</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{myApplications.length}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{myChats.length}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Total Paid</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {formatAmount(myPayments.reduce((acc, p) => acc + (p.amount || 0), 0))}
        </CardContent>
      </Card>
    </div>
  );

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
      location: settingsDraft.location || settings.location || "",
      bio: settingsDraft.bio || settings.bio || "",
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Card>
          <CardContent className="py-6 space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input value={data.displayName} onChange={(e) => setSettingsDraft((s) => ({ ...s, displayName: e.target.value }))} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={data.location} onChange={(e) => setSettingsDraft((s) => ({ ...s, location: e.target.value }))} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={data.bio} onChange={(e) => setSettingsDraft((s) => ({ ...s, bio: e.target.value }))} />
            </div>
            <Button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
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
            ) : hasError ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                  <p className="font-semibold text-destructive">Failed to load dashboard data.</p>
                </CardContent>
              </Card>
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
                  {activeNav === "Overview" && renderOverview()}
                  {activeNav === "My Jobs" && renderMyJobs()}
                  {activeNav === "Messages" && renderMessages()}
                  {activeNav === "Payments" && renderPayments()}
                  {activeNav === "Settings" && renderSettings()}
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
