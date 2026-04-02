import { Activity, AlertTriangle, BarChart3, Briefcase, DollarSign, Layers, ShieldAlert, Ticket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminOverview } from "@/hooks/admin/useAdminOverview";
import { AdminKpiCard } from "@/components/admin/ui/AdminKpiCard";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminOverviewPage() {
  const overviewQuery = useAdminOverview();

  if (overviewQuery.isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading admin overview...</div>;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-semibold text-destructive">Failed to load overview metrics.</p>
          <Button variant="outline" onClick={() => overviewQuery.refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { kpis, growth, topCategories, topLocations, latestUsers, latestJobs, latestBookings, incidents, activity, source } = overviewQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Executive Overview</h1>
            <p className="text-sm text-muted-foreground">Real-time operations, growth, trust & safety, and platform health.</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={source} />
            <Button variant="outline" size="sm" onClick={() => overviewQuery.refetch()}>Refresh</Button>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminKpiCard title="Total Users" value={kpis.totalUsers} note="All registered users" />
        <AdminKpiCard title="Active Freelancers" value={kpis.activeFreelancers} note="Profiles ready for work" />
        <AdminKpiCard title="Active Clients" value={kpis.activeClients} note="Hiring accounts" />
        <AdminKpiCard title="Total Jobs" value={kpis.totalJobs} note="Open + closed listings" />
        <AdminKpiCard title="Applications" value={kpis.activeApplications} note="Pending + in review" accent="warning" />
        <AdminKpiCard title="Bookings" value={kpis.bookingsCount} note="Service transactions" />
        <AdminKpiCard title="Revenue" value={`R${kpis.totalRevenue.toLocaleString()}`} note="Payments records" accent="success" />
        <AdminKpiCard title="Fraud Cases" value={kpis.fraudCases} note="Active risk events" accent="danger" />
      </section>

      <section className="grid xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />Weekly Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#1d4ed8" fill="#93c5fd" />
                <Area type="monotone" dataKey="jobs" stackId="1" stroke="#0f766e" fill="#99f6e4" />
                <Area type="monotone" dataKey="bookings" stackId="1" stroke="#7c3aed" fill="#ddd6fe" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" />Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#1f2937" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Layers className="w-4 h-4" />Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topCategories.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" />Top Cities / Provinces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topLocations.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4" />Operational Risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Pending disputes</span><strong>{kpis.pendingDisputes}</strong></div>
            <div className="flex justify-between"><span>Moderation queue</span><strong>{kpis.moderationQueue}</strong></div>
            <div className="flex justify-between"><span>Support volume</span><strong>{kpis.supportVolume}</strong></div>
            <div className="flex justify-between"><span>Fraud alerts</span><strong>{kpis.fraudCases}</strong></div>
            <Separator />
            <div className="text-xs text-muted-foreground">Subscription mix</div>
            <div className="flex justify-between text-xs"><span>Free</span><strong>{kpis.freePlan}</strong></div>
            <div className="flex justify-between text-xs"><span>Premium</span><strong>{kpis.premiumPlan}</strong></div>
            <div className="flex justify-between text-xs"><span>Enterprise</span><strong>{kpis.enterprisePlan}</strong></div>
          </CardContent>
        </Card>
      </section>

      <section className="grid xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" />Recent Signups</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestUsers.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.location || "-"}</p>
                </div>
                <AdminStatusBadge status={String(item.status || "active")} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" />Latest Jobs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestJobs.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.location || "-"}</p>
                </div>
                <AdminStatusBadge status={String(item.status || "open")} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Ticket className="w-4 h-4" />Latest Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestBookings.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-2">
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{item.location || "-"}</span>
                  <span>{item.amount ? `R${Number(item.amount).toLocaleString()}` : "-"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity Feed</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activity.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-2">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.createdAt?.toLocaleString() || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4" />Incidents</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {incidents.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-2">
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <AdminStatusBadge status={String(item.status || "open")} />
                  <span className="text-xs text-muted-foreground">{item.createdAt?.toLocaleDateString() || "-"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
