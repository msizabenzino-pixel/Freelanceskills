import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/lib/currency";
import { apiJson } from "@/lib/api";
import {
  Star, MapPin, Clock, Calendar, Verified, ArrowLeft, Zap,
  Loader2, CheckCircle2, AlertCircle, Shield, Award, Globe,
  Languages, Wallet, Briefcase, User, Phone,
} from "lucide-react";

interface ServiceDetailData {
  id: string;
  title: string;
  description: string;
  category: string;
  priceFrom: number;
  duration: string;
  bookingCount: number;
  taskerId: string;
  taskerName: string;
  location: string;
  rating: number;
  completedJobs: number;
  isPro: boolean;
  verified: boolean;
  photoUrl: string | null;
  skills: string[];
  hourlyRate: number;
  availability: string;
  availableNow: boolean;
  bio: string;
  experienceLevel: string;
  certifications: string;
  languages: string[];
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  reviews: Array<{ id: string; rating: number; comment: string; createdAt: string }>;
}

export default function ServiceDetail() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const id = window.location.pathname.split("/services/")[1];

  const { data, isLoading, isError } = useQuery<ServiceDetailData>({
    queryKey: ["service", id],
    queryFn: async () => {
      const res = await apiJson<any>(`/api/services/${id}`, { method: "GET" });
      return res;
    },
    enabled: Boolean(id),
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please sign in to book a tasker.");
      if (!data) throw new Error("Service not loaded");
      if (!bookingDate) throw new Error("Please select a date.");
      if (!bookingTime) throw new Error("Please select a time.");

      return apiJson<any>("/api/bookings", {
        method: "POST",
        json: {
          freelancerId: data.taskerId,
          servicePackageId: data.id,
          bookingDate,
          startTime: bookingTime,
          totalAmount: data.priceFrom,
          location: bookingLocation || data.location,
          notes: bookingNotes,
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Booking confirmed!", description: "Your tasker has been notified." });
      setShowBooking(false);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Booking failed", description: error?.message || "Please try again." });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Service not found</h2>
          <p className="mb-4">This service may have been removed or is unavailable.</p>
          <Button onClick={() => navigate("/services")}>Back to Services</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-6 -ml-3" onClick={() => navigate("/services")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Service Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {data.category}
                </Badge>
                {data.verified && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1">
                    <Verified className="w-3 h-3" /> Verified
                  </Badge>
                )}
                {data.isPro && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    <Award className="w-3 h-3 mr-1" /> Pro
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white">{data.title}</h1>
              <p className="text-lg text-slate-400 leading-relaxed">{data.description}</p>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold text-white">{data.rating ? data.rating.toFixed(1) : "0.0"}</span>
                  <span>({data.reviews?.length || 0} reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {data.completedJobs} jobs done
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {data.duration}
                </span>
              </div>

              {/* Skills */}
              {data.skills?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {data.skills.map((skill) => (
                    <span key={skill} className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Tasker profile */}
              <Card className="border-slate-800 bg-slate-900/60">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    About {data.taskerName}
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 shrink-0">
                      {data.taskerName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "T"}
                    </div>
                    <div className="space-y-2 text-sm">
                      {data.bio && <p className="text-slate-300">{data.bio}</p>}
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {data.location}
                        </span>
                        {data.experienceLevel && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" /> {data.experienceLevel}
                          </span>
                        )}
                        {data.availableNow && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Available now
                          </span>
                        )}
                      </div>
                      {data.languages?.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Languages className="w-4 h-4" /> {data.languages.join(", ")}
                        </div>
                      )}
                      {data.certifications && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Award className="w-4 h-4" /> {data.certifications}
                        </div>
                      )}
                      {data.linkedinUrl && (
                        <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          <Globe className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              {data.reviews && data.reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Reviews ({data.reviews.length})</h3>
                  {data.reviews.map((review) => (
                    <Card key={review.id} className="border-slate-800 bg-slate-900/40">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{review.rating}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Booking Panel */}
            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/60 sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Starting from</p>
                    <p className="text-4xl font-bold text-emerald-400">{formatAmount(data.priceFrom)}</p>
                    <p className="text-sm text-slate-500">{data.duration}</p>
                  </div>

                  {!showBooking ? (
                    <Button
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      onClick={() => {
                        if (!user?.id) {
                          navigate(`/login?redirect=${encodeURIComponent(`/services/${data.id}`)}`);
                          return;
                        }
                        setShowBooking(true);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {user?.id ? "Book Now" : "Sign in to Book"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-slate-300 flex items-center gap-1 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Date
                        </Label>
                        <Input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 flex items-center gap-1 mb-1.5">
                          <Clock className="w-3.5 h-3.5" /> Start Time
                        </Label>
                        <Input
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 flex items-center gap-1 mb-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </Label>
                        <Input
                          placeholder={data.location}
                          value={bookingLocation}
                          onChange={(e) => setBookingLocation(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 mb-1.5">Notes</Label>
                        <Textarea
                          placeholder="Any special requests or details..."
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                          onClick={() => bookingMutation.mutate()}
                          disabled={bookingMutation.isPending}
                        >
                          {bookingMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-2" />Confirm Booking</>
                          )}
                        </Button>
                        <Button variant="outline" className="border-slate-700 text-slate-400" onClick={() => setShowBooking(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs text-slate-500 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Escrow-protected payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Pay only when work is done</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>24/7 dispute support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
