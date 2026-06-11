// Shared card mappers for discovery/personalisation endpoints (Commands 12–14).
// Keep the gig + freelancer card shapes consistent across /api/search and /api/home/*.

export function mapGigCard(r: any) {
  const fullName =
    r.firstName && r.lastName
      ? `${r.firstName} ${r.lastName}`
      : r.firstName || r.profTitle || "Freelancer";
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    priceFrom: r.price,
    duration: r.duration,
    bookingCount: r.bookingCount ?? 0,
    viewCount: r.viewCount ?? 0,
    conversionRate: r.conversionRate ?? 0,
    createdAt: r.createdAt,
    taskerId: r.freelancerId,
    taskerName: fullName,
    location: r.location || "South Africa",
    rating: r.rating ? r.rating / 100 : 0,
    completedJobs: r.completedJobs || 0,
    isPro: !!r.isPro,
    verified: r.kycStatus === "verified",
    photoUrl: r.photoUrl || null,
    skills: r.skills || [],
    bio: r.bio || "",
  };
}

export function mapFreelancerCard(f: any) {
  const fullName =
    f.firstName && f.lastName
      ? `${f.firstName} ${f.lastName}`
      : f.firstName || f.title || "FreelanceSkills Pro";
  const initials = fullName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id: f.id,
    userId: f.userId,
    name: fullName,
    title: f.title || "Verified Freelancer",
    bio: (f.bio || "").substring(0, 140),
    skills: f.skills || [],
    location: f.location || "South Africa",
    hourlyRateCents: f.hourlyRate ?? null,
    hourlyRateFormatted: f.hourlyRate ? `R${Math.round(f.hourlyRate / 100)}/hr` : null,
    rating: f.rating ? f.rating / 100 : null,
    completedJobs: f.completedJobs ?? 0,
    isPro: !!f.isPro,
    isProVerified: !!f.isProVerified,
    identityVerified: !!f.identityVerified,
    skillsVerified: !!f.skillsVerified,
    topPerformer: !!f.topPerformer,
    verificationTier: f.verificationTier ?? 0,
    onTimeDeliveryRate: f.onTimeDeliveryRate ?? null,
    responseRate: f.responseRate ?? null,
    country: f.country || "ZA",
    photoUrl: f.photoUrl || null,
    avatarInitials: initials || "FS",
    availableNow: !!f.availableNow,
  };
}
