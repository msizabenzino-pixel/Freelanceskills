import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, ArrowLeft, MessageSquare, ShieldCheck, Zap, Bookmark } from "lucide-react";
import { useState } from "react";

export default function GigDetail() {
  const [location] = useLocation();
  const id = location.split("/gig/")[1]?.split("/")[0] || "";
  const [saved, setSaved] = useState(false);

  const { data: gig, isLoading } = useQuery({
    queryKey: ["/api/services", id],
    queryFn: async () => {
      const res = await fetch(`/api/services/${id}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <GigDetailSkeleton />;
  if (!gig) return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="mb-2">Gig not found</p>
          <Link href="/explore" className="text-emerald-400 text-sm underline">Browse all gigs</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Gigs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                    {gig.photoUrl ? <img src={gig.photoUrl} className="w-full h-full rounded-full object-cover" alt="" /> : "👨‍💻"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white">{gig.title}</h1>
                      {gig.isPro && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">PRO</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                        {gig.rating?.toFixed(1) || "4.8"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {gig.duration || "3-5 days"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {gig.verified ? "Verified" : "Standard"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{gig.description}</p>
                {gig.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {gig.skills.map((s: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{s}</span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reviews */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Reviews ({gig.reviews?.length || 0})</h2>
                {gig.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {gig.reviews.map((r: any, i: number) => (
                      <div key={i} className="border-b border-slate-800 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className="w-3.5 h-3.5 text-amber-400" fill={n <= r.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-400">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No reviews yet. Be the first to book!</p>
                )}
              </Card>
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-black text-white">
                      {gig.priceFrom ? `R${(gig.priceFrom / 100).toFixed(0)}` : "R500"}
                    </div>
                    <div className="text-xs text-slate-500">Starting at</div>
                  </div>
                  <button
                    onClick={() => setSaved(!saved)}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                    data-testid="button-save-gig"
                  >
                    <Bookmark className={cn("w-5 h-5", saved ? "text-emerald-400 fill-current" : "text-slate-500")} />
                  </button>
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold mb-3">
                  <Zap className="w-4 h-4 mr-2" /> Book Now
                </Button>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  <MessageSquare className="w-4 h-4 mr-2" /> Contact Seller
                </Button>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {gig.duration || "3-5 days"} delivery</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Escrow protected</div>
                  <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> {gig.completedJobs || 0}+ completed</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GigDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="w-32 h-6 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-48 h-6" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>
                <Skeleton className="w-full h-24" />
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 p-6">
                <Skeleton className="w-20 h-10 mb-4" />
                <Skeleton className="w-full h-10 mb-3" />
                <Skeleton className="w-full h-10" />
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
