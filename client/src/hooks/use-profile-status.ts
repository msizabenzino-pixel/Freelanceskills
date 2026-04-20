/**
 * useProfileStatus — reads the current user's profile from the Postgres API.
 *
 * Reads from the SAME source as the Apply button (/api/profile) so the
 * Dashboard badge and Apply gate always agree — no Firestore split-brain.
 *
 * 401 is treated as "loading" (session not ready yet) rather than "none"
 * because setUser() now waits for syncSessionNow() before firing, so a
 * transient 401 on first render means the session is still being established.
 */

import { useQuery } from "@tanstack/react-query";

export type ProfileStatus = "loading" | "none" | "draft" | "published";

interface ProfileStatusResult {
  status: ProfileStatus;
  profile: any | null;
  score: number;
  refetch: () => void;
}

const SENTINEL_401 = "__SESSION_NOT_READY__";

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
    queryKey: ["/api/profile-status", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 401) return SENTINEL_401;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 4000,
    staleTime: 1000,
    retry: false,
  });

  if (!userId) return { status: "none", profile: null, score: 0, refetch };

  // Still in-flight or got a 401 (session not established yet) — stay loading
  if (isLoading || data === SENTINEL_401) {
    return { status: "loading", profile: null, score: 0, refetch };
  }

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
