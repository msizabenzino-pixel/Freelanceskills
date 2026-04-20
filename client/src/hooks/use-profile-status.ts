/**
 * useProfileStatus — reads the current user's profile from the Postgres API.
 *
 * This deliberately avoids Firestore so the Dashboard status badge and the
 * Apply button both read from the SAME source of truth, eliminating the
 * "profile created but Apply says No Profile" bug.
 *
 * Polls every 4 seconds after a go-live action so the badge flips instantly.
 */

import { useQuery } from "@tanstack/react-query";

export type ProfileStatus = "loading" | "none" | "draft" | "published";

interface ProfileStatusResult {
  status: ProfileStatus;
  profile: any | null;
  score: number;
  refetch: () => void;
}

function computeScore(p: any): number {
  if (!p) return 0;
  let score = 0;
  if (p.title) score += 20;
  if (p.bio && p.bio.length >= 40) score += 20;
  if (p.skills && p.skills.length >= 3) score += 20;
  if (p.hourlyRate && p.hourlyRate > 0) score += 20;
  if (p.location) score += 10;
  if (p.publishedProfile) score += 10;
  return score;
}

export function useProfileStatus(userId: string | undefined): ProfileStatusResult {
  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  if (!userId) return { status: "none", profile: null, score: 0, refetch };
  if (isLoading) return { status: "loading", profile: null, score: 0, refetch };
  if (!data) return { status: "none", profile: null, score: 0, refetch };

  const status: ProfileStatus = data.publishedProfile ? "published" : "draft";
  const score = computeScore(data);

  const profile = {
    ...data,
    fullName: data.fullName || "",
    title: data.title || "",
    bio: data.bio || "",
    skills: data.skills || [],
    hourlyRate: data.hourlyRate ? data.hourlyRate / 100 : undefined,
    location: data.location || "",
    categories: [],
    profilePhotoUrl: "",
    portfolioLinks: [],
    availability: undefined,
    publishedProfile: data.publishedProfile,
    profileScore: score,
  };

  return { status, profile, score, refetch };
}
