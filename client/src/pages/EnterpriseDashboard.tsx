import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Briefcase, 
  BarChart3, 
  Plus, 
  Download, 
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useCurrency } from "@/lib/currency";

export default function EnterpriseDashboard() {
  const { formatAmount } = useCurrency();
  const [bulkJobText, setBulkJobText] = useState("");

  const { data: bookings } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: jobs } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  const enterpriseJobs = jobs?.filter(j => j.clientId === "enterprise-user") || []; // Mocking enterprise jobs for now or filtered by current user
  const totalSpent = bookings?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;

  const handleBulkPost = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for bulk posting would go here
    alert("Bulk posting logic would be implemented here. Text: " + bulkJobText.substring(0, 50) + "...");
    setBulkJobText("");
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary" data-testid="text-enterprise-dashboard-title">
                Enterprise Dashboard
              </h1>
              <p className="text-muted-foreground" data-testid="text-enterprise-dashboard-subtitle">
                Manage your team, bulk postings, and workforce spending.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" data-testid="button-export-data">
                <Download className="w-4 h-4" /> Export Data
              </Button>
              <Button className="gap-2" data-testid="button-bulk-post-trigger">
                <Plus className="w-4 h-4" /> Bulk Post Jobs
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-spending-overview">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatAmount(totalSpent)}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-active-jobs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enterpriseJobs.length}</div>
                <div className="text-xs text-muted-foreground mt-1">across 4 departments</div>
              </CardContent>
            </Card>
            <Card data-testid="card-team-members">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground mt-1">3 pending invitations</div>
              </CardContent>
            </Card>
            <Card data-testid="card-avg-time-to-hire">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 days</div>
                <div className="text-xs text-green-500 mt-1">
                  <span>-0.8 days from avg.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs" data-testid="tab-jobs">Active Jobs</TabsTrigger>
              <TabsTrigger value="bulk" data-testid="tab-bulk">Bulk Posting</TabsTrigger>
              <TabsTrigger value="team" data-testid="tab-team">Team Management</TabsTrigger>
              <TabsTrigger value="spending" data-testid="tab-spending">Spending Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Active Job Postings</CardTitle>
                  <CardDescription>Monitor and manage your current vacancies.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Posted Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enterpriseJobs.length > 0 ? (
                          enterpriseJobs.map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.category}</TableCell>
                              <TableCell>8</TableCell>
                              <TableCell>
                                <Badge variant={job.status === "open" ? "default" : "secondary"}>
                                  {job.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No active jobs found. Start by posting one!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Job Posting</CardTitle>
                  <CardDescription>Paste multiple job descriptions or upload a CSV to post jobs in bulk.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBulkPost} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-jobs">Job Descriptions (JSON or CSV format)</Label>
                      <Textarea 
                        id="bulk-jobs"
                        data-testid="textarea-bulk-jobs"
                        placeholder='[{"title": "Senior React Developer", "category": "Tech", "budget": 50000}, ...]'
                        rows={10}
                        value={bulkJobText}
                        onChange={(e) => setBulkJobText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JSON, CSV. Max 100 jobs per batch.
                      </p>
                      <Button type="submit" data-testid="button-process-bulk">Process Batch</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Member Management</CardTitle>
                  <CardDescription>Manage user roles and permissions for your organisation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search members..." className="pl-8" />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> Invite Member
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Admin User</TableCell>
                          <TableCell>admin@enterprise.co.za</TableCell>
                          <TableCell><Badge variant="outline">Owner</Badge></TableCell>
                          <TableCell><Badge variant="default" className="bg-green-500">Active</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Hiring Manager</TableCell>
                          <TableCell>manager@enterprise.co.za</TableCell>
                          <TableCell><Badge variant="outline">Editor</Badge></TableCell>
                          <TableCell><Badge variant="default" className="bg-green-500">Active</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spending">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Historical spending across all categories.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center border-t">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Spending chart will be displayed here.</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Software Development</span>
                        <span className="text-sm font-bold">{formatAmount(totalSpent * 0.6)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Digital Marketing</span>
                        <span className="text-sm font-bold">{formatAmount(totalSpent * 0.25)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "25%" }} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Graphic Design</span>
                        <span className="text-sm font-bold">{formatAmount(totalSpent * 0.15)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
