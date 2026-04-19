/**
 * useProfileStatus — real-time Firestore subscription to the current user's
 * FreelancerProfile document so the Dashboard badge updates the instant
 * "Go Live" flips publishedProfile to true.
 */

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import type { FreelancerProfile } from "@/lib/firebaseAppData";

export type ProfileStatus = "loading" | "none" | "draft" | "published";

interface ProfileStatusResult {
  status: ProfileStatus;
  profile: FreelancerProfile | null;
  score: number;
}

export function useProfileStatus(userId: string | undefined): ProfileStatusResult {
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!userId || !firebaseDb) {
      setStatus("none");
      return;
    }

    const ref = doc(firebaseDb, "freelancerProfiles", userId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setStatus("none");
          setProfile(null);
          setScore(0);
          return;
        }
        const data = snap.data() as FreelancerProfile & { publishedProfile?: boolean; profileScore?: number };
        setProfile(data as FreelancerProfile);
        setScore(data.profileScore ?? 0);
        setStatus(data.publishedProfile ? "published" : "draft");
      },
      () => {
        // Permission error or network — fail gracefully
        setStatus("none");
      }
    );

    return () => unsub();
  }, [userId]);

  return { status, profile, score };
}
