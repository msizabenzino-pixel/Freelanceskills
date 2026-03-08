import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle2, Building2, MapPin, Briefcase, Search, ArrowRight } from "lucide-react";
import type { BusinessInvitation } from "@shared/models/services";

export default function ClaimBusiness() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  // Get code from URL search params
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const urlCode = params.get("code");
  
  const [inviteCode, setInviteCode] = useState(urlCode || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [profileData, setProfileData] = useState({
    bio: "",
    title: "",
    skills: "",
    hourlyRate: "",
  });

  const { data: invitation, isLoading: isLoadingInvite, error: inviteError } = useQuery<BusinessInvitation>({
    queryKey: ["/api/business-invitations", inviteCode],
    queryFn: async () => {
      if (!inviteCode) return null;
      const res = await fetch(`/api/business-invitations/${inviteCode}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Invitation not found");
        throw new Error("Failed to fetch invitation");
      }
      return res.json();
    },
    enabled: !!inviteCode,
    retry: false,
  });

  const claimMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/business-invitations/${inviteCode}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to claim business");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your business has been claimed and your profile is ready.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Claim failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      // In a real app, this might be a search endpoint
      // For now, we'll try to use the query as an invite code or redirect to a search results page
      // But based on T004, it should "find their invitation by name or email"
      // Since we don't have a specific search-by-name API yet, let's assume we search by code first
      setInviteCode(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or create an account to claim your business.",
      });
      navigate(`/auth?redirect=/claim-business?code=${inviteCode}`);
      return;
    }

    claimMutation.mutate({
      bio: profileData.bio,
      title: profileData.title || invitation?.businessName,
      skills: profileData.skills.split(",").map(s => s.trim()).filter(Boolean),
      hourlyRate: parseInt(profileData.hourlyRate) * 100, // Convert to cents
    });
  };

  if (invitation && invitation.status === "claimed") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4 pt-24">
          <Card className="w-full max-w-md text-center p-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Already Claimed</h1>
            <p className="text-slate-600 mb-6">
              This business invitation for <strong>{invitation.businessName}</strong> has already been claimed.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {!inviteCode || inviteError ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Claim Your Business</h1>
                <p className="text-lg text-slate-600">
                  Find your invitation and grow your business on FreelanceSkills.
                </p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <Label htmlFor="search">Enter your Invitation Code</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="search"
                          placeholder="e.g. BIZ-123-XYZ"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-invite-code-search"
                        />
                        <Button type="submit" disabled={isSearching} data-testid="button-search-invite">
                          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          <span className="ml-2">Find</span>
                        </Button>
                      </div>
                      {inviteError && (
                        <p className="text-sm text-destructive mt-2">
                          Could not find an invitation with that code. Please check and try again.
                        </p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Professional Profile</h3>
                  <p className="text-sm text-slate-500">Get a dedicated page for your business</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Get More Jobs</h3>
                  <p className="text-sm text-slate-500">Access local and international opportunities</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Verified Status</h3>
                  <p className="text-sm text-slate-500">Build trust with the verified business badge</p>
                </div>
              </div>
            </div>
          ) : isLoadingInvite ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-slate-600">Loading your invitation details...</p>
            </div>
          ) : invitation ? (
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900" data-testid="text-business-name">
                        {invitation.businessName}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {invitation.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {invitation.city}, {invitation.province}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-primary/20 text-primary font-semibold text-sm">
                      Invitation Verified
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="font-bold text-amber-900">Account Required</h3>
                      <p className="text-amber-800 text-sm">
                        You need to be signed in to claim this business. Create a free account or sign in to continue.
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button variant="outline" onClick={() => navigate(`/auth?redirect=/claim-business?code=${inviteCode}`)} data-testid="button-login-to-claim">
                        Sign In
                      </Button>
                      <Button onClick={() => navigate(`/auth?mode=register&redirect=/claim-business?code=${inviteCode}`)} data-testid="button-register-to-claim">
                        Create Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Professional Profile</CardTitle>
                  <CardDescription>
                    Tell clients more about your services to start getting hired.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleClaimSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Expert Web Developer"
                          value={profileData.title}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          disabled={!isAuthenticated}
                          data-testid="input-profile-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (R)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          placeholder="e.g. 450"
                          value={profileData.hourlyRate}
                          onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                          disabled={!isAuthenticated}
                          required
                          data-testid="input-profile-rate"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your experience, approach, and why clients should choose you..."
                        className="min-h-[120px]"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isAuthenticated}
                        required
                        data-testid="textarea-profile-bio"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma separated)</Label>
                      <Input
                        id="skills"
                        placeholder="e.g. React, TypeScript, Node.js, UI Design"
                        value={profileData.skills}
                        onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                        disabled={!isAuthenticated}
                        required
                        data-testid="input-profile-skills"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg" 
                      disabled={!isAuthenticated || claimMutation.isPending}
                      data-testid="button-submit-claim"
                    >
                      {claimMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Claiming Business...
                        </>
                      ) : (
                        <>
                          Claim Business & Create Profile
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
