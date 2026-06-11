import { Link } from "wouter";
import { Heart, Star, BadgeCheck, Crown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface GigCardData {
  id: string;
  title: string;
  thumbnail: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLevel: string;
  verificationTier: 0 | 1 | 2 | 3;
  isProVerified: boolean;
  isPromoted: boolean;
  rating: number;
  reviewCount: number;
  priceCents: number;
  isTopPerformer?: boolean;
}

interface GigCardProps {
  gig: GigCardData;
  displayMode?: "list" | "carousel";
  showAd?: boolean;
  onSave?: (gigId: string) => void;
  isSaved?: boolean;
}

export function GigCard({ gig, displayMode = "list", showAd, onSave, isSaved }: GigCardProps) {
  const [saved, setSaved] = useState(isSaved ?? false);
  const priceZar = (gig.priceCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(gig.id);
  };

  const isTopPerformer = gig.verificationTier === 3 || gig.isTopPerformer;
  const isAd = gig.isPromoted || showAd;

  return (
    <div
      className={cn(
        "relative bg-slate-800 rounded-lg border overflow-hidden group cursor-pointer",
        isTopPerformer ? "border-amber-600" : "border-slate-700",
        displayMode === "carousel" ? "w-full" : ""
      )}
      data-testid={`card-gig-${gig.id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        <img
          src={gig.thumbnail || "/placeholder-gig.jpg"}
          alt={gig.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {/* Top-left badge — 'AD' or 'Pro', never both (AD takes priority) */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {isAd ? (
            <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded">
              AD
            </span>
          ) : gig.isProVerified ? (
            <span className="px-2 py-0.5 bg-slate-950 border border-emerald-500 text-white text-[10px] font-bold rounded">
              PRO
            </span>
          ) : null}
        </div>
        {/* Save heart */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-800 transition-colors"
          data-testid={`button-save-gig-${gig.id}`}
        >
          <Heart
            className={cn("w-4 h-4", saved ? "fill-red-500 text-red-500" : "text-white")}
          />
        </button>
      </div>

      {/* Seller row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <img
          src={gig.sellerAvatar || "/placeholder-avatar.jpg"}
          alt={gig.sellerName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex items-center gap-1" data-testid={`badge-tier-gig-${gig.id}`}>
          <span className="text-sm font-semibold text-white">{gig.sellerName}</span>
          {gig.verificationTier === 1 && (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-label="ID Verified" />
          )}
          {gig.verificationTier === 2 && (
            <span className="flex items-center gap-0.5" aria-label="Skills Verified">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <Star className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
            </span>
          )}
          {gig.verificationTier >= 3 && (
            <Crown className="w-3.5 h-3.5 text-amber-400" aria-label="Top Performer" />
          )}
        </div>
      </div>

      {/* Title */}
      <p className="px-3 text-sm text-white font-medium line-clamp-2 leading-snug min-h-[2.5rem]">
        {gig.title}
      </p>

      {/* Rating + Price */}
      <div className="flex items-center justify-between px-3 py-2.5 mt-1">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm text-white font-semibold">{gig.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-500">({gig.reviewCount})</span>
        </div>
        <span className="text-sm font-bold text-white">
          From ZAR {priceZar}
        </span>
      </div>
    </div>
  );
}

export function GigCardSkeleton({ displayMode = "list" }: { displayMode?: "list" | "carousel" }) {
  return (
    <div className={cn(
      "bg-slate-800 rounded-lg border border-slate-700 overflow-hidden animate-pulse",
      displayMode === "carousel" ? "w-full" : ""
    )}>
      <div className="aspect-video bg-slate-700" />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700" />
          <div className="h-3.5 w-24 bg-slate-700 rounded" />
        </div>
      </div>
      <div className="px-3 py-1">
        <div className="h-4 w-full bg-slate-700 rounded mb-1" />
        <div className="h-4 w-3/4 bg-slate-700 rounded" />
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="h-3.5 w-16 bg-slate-700 rounded" />
        <div className="h-3.5 w-20 bg-slate-700 rounded" />
      </div>
    </div>
  );
}
