import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  Send, 
  Plus, 
  FileText, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Filter,
  Copy,
  Mail,
  MessageSquare,
  Search,
  Loader2
} from "lucide-react";
import { SERVICE_CATEGORIES } from "@shared/categories";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

export default function InviteBusinesses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"manual" | "bulk" | "list">("manual");
  
  // Manual Form State
  const [manualForm, setManualForm] = useState({
    businessName: "",
    category: "",
    province: "",
    city: "",
    contactPhone: "",
    contactEmail: "",
    websiteUrl: "",
  });

  // Bulk Form State
  const [bulkInput, setBulkInput] = useState("");
  
  // Filter State
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Queries
  const { data: invitations = [], isLoading: isLoadingInvites } = useQuery<any[]>({
    queryKey: ["/api/business-invitations", provinceFilter, categoryFilter],
    queryFn: async () => {
      let url = "/api/business-invitations";
      const params = new URLSearchParams();
      if (provinceFilter !== "all") params.append("province", provinceFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    }
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/business-invitations/stats"],
    queryFn: async () => {
      const res = await fetch("/api/business-invitations/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    }
  });

  // Mutations
  const createInviteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/business-invitations", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business invitation created successfully.",
      });
      setManualForm({
        businessName: "",
        category: "",
        province: "",
        city: "",
        contactPhone: "",
        contactEmail: "",
        websiteUrl: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/business-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-invitations/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invitation",
        variant: "destructive",
      });
    }
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async (businesses: any[]) => {
      const res = await apiRequest("POST", "/api/business-invitations/bulk", { businesses });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Created ${data.created} business invitations.`,
      });
      setBulkInput("");
      setActiveTab("list");
      queryClient.invalidateQueries({ queryKey: ["/api/business-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-invitations/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk invitations",
        variant: "destructive",
      });
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.businessName || !manualForm.category || !manualForm.province || !manualForm.city) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createInviteMutation.mutate(manualForm);
  };

  const handleBulkSubmit = () => {
    if (!bulkInput.trim()) return;
    
    const lines = bulkInput.split("\n");
    const businesses = lines.map(line => {
      const [name, category, city, province, phone] = line.split(",").map(s => s.trim());
      return {
        businessName: name,
        category: category || "trades",
        city: city || "Unknown",
        province: province || "Gauteng",
        contactPhone: phone || null,
      };
    }).filter(b => b.businessName);

    if (businesses.length === 0) {
      toast({
        title: "Invalid input",
        description: "Please provide valid CSV data.",
        variant: "destructive",
      });
      return;
    }

    bulkInviteMutation.mutate(businesses);
  };

  const getClaimLink = (code: string) => `${window.location.origin}/claim-business?code=${code}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard.",
    });
  };

  const shareWhatsApp = (invite: any) => {
    const link = getClaimLink(invite.inviteCode);
    const message = `Hi ${invite.businessName}! You've been invited to join FreelanceSkills, South Africa's leading freelance marketplace. Claim your free business profile here: ${link}. List your services, get discovered by clients, and grow your business online.`;
    window.open(`https://wa.me/${invite.contactPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareEmail = (invite: any) => {
    const link = getClaimLink(invite.inviteCode);
    const subject = `Invitation to join FreelanceSkills`;
    const body = `Hi ${invite.businessName},\n\nYou've been invited to join FreelanceSkills, South Africa's leading freelance marketplace.\n\nClaim your free business profile here: ${link}\n\nList your services, get discovered by clients, and grow your business online.\n\nBest regards,\nThe FreelanceSkills Team`;
    window.location.href = `mailto:${invite.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Invite Businesses</h1>
            <p className="text-muted-foreground">Help grow the network by inviting South African businesses to claim their profiles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card data-testid="stat-total-invites">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                    <h3 className="text-2xl font-bold">{stats?.total || 0}</h3>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-claimed-invites">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claimed</p>
                    <h3 className="text-2xl font-bold text-green-600">{stats?.claimed || 0}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-pending-invites">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <h3 className="text-2xl font-bold text-amber-600">{stats?.pending || 0}</h3>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={activeTab === "manual" ? "default" : "outline"}
              onClick={() => setActiveTab("manual")}
              data-testid="tab-manual"
            >
              <Plus className="w-4 h-4 mr-2" /> Manual Add
            </Button>
            <Button 
              variant={activeTab === "bulk" ? "default" : "outline"}
              onClick={() => setActiveTab("bulk")}
              data-testid="tab-bulk"
            >
              <FileText className="w-4 h-4 mr-2" /> Bulk Add
            </Button>
            <Button 
              variant={activeTab === "list" ? "default" : "outline"}
              onClick={() => setActiveTab("list")}
              data-testid="tab-list"
            >
              <Users className="w-4 h-4 mr-2" /> View All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {activeTab === "manual" && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Enter the business information to generate an invitation code.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input 
                          id="businessName"
                          placeholder="e.g. Cape Town Plumbing Services"
                          value={manualForm.businessName}
                          onChange={(e) => setManualForm({...manualForm, businessName: e.target.value})}
                          required
                          data-testid="input-business-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={manualForm.category} 
                          onValueChange={(v) => setManualForm({...manualForm, category: v})}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Province *</Label>
                        <Select 
                          value={manualForm.province} 
                          onValueChange={(v) => setManualForm({...manualForm, province: v})}
                        >
                          <SelectTrigger data-testid="select-province">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROVINCES.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city"
                          placeholder="e.g. Cape Town"
                          value={manualForm.city}
                          onChange={(e) => setManualForm({...manualForm, city: e.target.value})}
                          required
                          data-testid="input-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input 
                          id="contactPhone"
                          placeholder="e.g. 021 555 1234"
                          value={manualForm.contactPhone}
                          onChange={(e) => setManualForm({...manualForm, contactPhone: e.target.value})}
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address</Label>
                        <Input 
                          id="contactEmail"
                          type="email"
                          placeholder="contact@business.com"
                          value={manualForm.contactEmail}
                          onChange={(e) => setManualForm({...manualForm, contactEmail: e.target.value})}
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input 
                          id="websiteUrl"
                          placeholder="https://www.business.com"
                          value={manualForm.websiteUrl}
                          onChange={(e) => setManualForm({...manualForm, websiteUrl: e.target.value})}
                          data-testid="input-website"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createInviteMutation.isPending}
                      data-testid="button-create-invite"
                    >
                      {createInviteMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Create Invitation</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "bulk" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Invitation</CardTitle>
                  <CardDescription>
                    Paste a CSV-style list of businesses. One business per line.<br />
                    Format: <b>Name, Category ID, City, Province, Phone</b>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Cape Town Plumbing, trades, Cape Town, Western Cape, 0215551234&#10;Joburg Electric, trades, Johannesburg, Gauteng, 0115556789"
                    className="min-h-[200px] font-mono text-sm"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    data-testid="textarea-bulk-invites"
                  />
                  <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
                    <p className="font-semibold mb-1">Available Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_CATEGORIES.map(c => (
                        <code key={c.id} className="bg-background px-1 rounded">{c.id}</code>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleBulkSubmit} 
                    className="w-full"
                    disabled={bulkInviteMutation.isPending}
                    data-testid="button-process-bulk"
                  >
                    {bulkInviteMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Process Bulk Invitations</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "list" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Invitation List</CardTitle>
                      <CardDescription>Manage and share your business invitations.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                          <SelectTrigger className="w-[150px]" data-testid="filter-province">
                            <SelectValue placeholder="All Provinces" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Provinces</SelectItem>
                            {PROVINCES.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]" data-testid="filter-category">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {SERVICE_CATEGORIES.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingInvites ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No invitations found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or create a new invitation.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invitations.map((invite) => (
                            <TableRow key={invite.id} data-testid={`invite-row-${invite.id}`}>
                              <TableCell className="font-medium">
                                {invite.businessName}
                                <div className="text-xs text-muted-foreground font-normal">
                                  {SERVICE_CATEGORIES.find(c => c.id === invite.category)?.name || invite.category}
                                </div>
                              </TableCell>
                              <TableCell>
                                {invite.city}, {invite.province}
                              </TableCell>
                              <TableCell>
                                <Badge variant={invite.status === "claimed" ? "default" : "secondary"}>
                                  {invite.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{invite.inviteCode}</code>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => copyToClipboard(getClaimLink(invite.inviteCode))}
                                    title="Copy Link"
                                    data-testid={`button-copy-${invite.id}`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  {invite.contactPhone && (
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                      onClick={() => shareWhatsApp(invite)}
                                      title="Share on WhatsApp"
                                      data-testid={`button-whatsapp-${invite.id}`}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {invite.contactEmail && (
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() => shareEmail(invite)}
                                      title="Send Email"
                                      data-testid={`button-email-${invite.id}`}
                                    >
                                      <Mail className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    title="Share"
                                    onClick={() => {
                                      if (navigator.share) {
                                        navigator.share({
                                          title: 'Claim your business on FreelanceSkills',
                                          text: `Join FreelanceSkills and grow your business online!`,
                                          url: getClaimLink(invite.inviteCode),
                                        });
                                      } else {
                                        copyToClipboard(getClaimLink(invite.inviteCode));
                                      }
                                    }}
                                    data-testid={`button-share-${invite.id}`}
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
