import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { firebaseAuth, firebaseDb } from "./firebase";
import { getStorage } from "firebase/storage";

export type UserRole = "client" | "freelancer" | "both";

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  locationType: "remote" | "onsite";
  urgency: "normal" | "urgent";
  category: string;
  clientId: string;
  clientName?: string;
  status: "open" | "closed" | "completed";
  createdAt?: Date | null;
}

export interface JobApplication {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName?: string;
  clientId: string;
  status: "pending" | "shortlisted" | "accepted" | "rejected" | "completed";
  coverLetter?: string;
  createdAt?: Date | null;
}

export interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  planType?: "free" | "premium" | "enterprise";
  subscriptionStatus?: "active" | "inactive" | "cancelled";
  onboardingCompleted?: boolean;
  selectedPlanAt?: Date | null;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priceFrom: number;
  availability: string;
  rating?: number;
  taskerId: string;
  taskerName: string;
}

export interface Tasker {
  id: string;
  fullName: string;
  category: string;
  location: string;
  availability: string;
  rating?: number;
  priceFrom?: number;
  bio?: string;
  avatarUrl?: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  serviceId?: string;
  category: string;
  request: string;
  location: string;
  status: "pending" | "reviewed" | "matched" | "completed" | "cancelled";
  createdAt?: Date | null;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  taskerId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  note?: string;
  createdAt?: Date | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  type: "subscription" | "booking" | "withdrawal";
  createdAt?: Date | null;
}

export interface SubscriptionPlan {
  planType: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "cancelled";
  selectedPlanAt?: Date | null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderType: "user" | "support" | "system";
  senderId?: string;
  content: string;
  createdAt?: Date | null;
}

export interface FreelancerProfile {
  userId: string;
  fullName: string;
  profilePhotoUrl?: string;
  bio: string;
  title: string;
  skills: string[];
  expertise: string[];
  categories: string[];
  hourlyRate: number;
  location: string;
  portfolioLinks: string[];
  experienceLevel: string;
  availability: string;
  role: "freelancer";
  onboardingCompleted: boolean;
  updatedAt?: Date | null;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function ensureDb() {
  if (!firebaseDb) throw new Error("Firebase database is not configured.");
  return firebaseDb;
}

const DEMO_JOBS: Job[] = [
  {
    id: "demo-job-1",
    title: "Plumber Needed for Urgent Leak",
    description: "Kitchen pipe leak needs immediate repair today.",
    budget: 3500,
    location: "Cape Town",
    locationType: "onsite",
    urgency: "urgent",
    category: "trades",
    clientId: "demo-client-1",
    clientName: "BuildRight SA",
    status: "open",
    createdAt: new Date(),
  },
  {
    id: "demo-job-2",
    title: "React Frontend Developer",
    description: "Build responsive dashboard screens for startup MVP.",
    budget: 12000,
    location: "Remote",
    locationType: "remote",
    urgency: "normal",
    category: "tech",
    clientId: "demo-client-2",
    clientName: "FlowDesk",
    status: "open",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "demo-job-3",
    title: "House Deep Cleaning",
    description: "3-bedroom house deep cleaning this weekend.",
    budget: 2500,
    location: "Johannesburg",
    locationType: "onsite",
    urgency: "normal",
    category: "cleaning",
    clientId: "demo-client-3",
    clientName: "HomeEase",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 86400000),
  },
];

const DEMO_TASKERS: Tasker[] = [
  {
    id: "demo-tasker-1",
    fullName: "Thabo M.",
    category: "trades",
    location: "Johannesburg",
    availability: "Available Today",
    rating: 4.9,
    priceFrom: 850,
  },
  {
    id: "demo-tasker-2",
    fullName: "Nomvula S.",
    category: "cleaning",
    location: "Cape Town",
    availability: "Available Tomorrow",
    rating: 4.8,
    priceFrom: 650,
  },
  {
    id: "demo-tasker-3",
    fullName: "Lerato M.",
    category: "tech",
    location: "Remote",
    availability: "This Week",
    rating: 5,
    priceFrom: 750,
  },
];

const DEMO_SERVICES: ServiceItem[] = [
  {
    id: "demo-service-1",
    title: "Emergency Plumbing Repair",
    description: "Fast plumbing repairs for leaks and blocked drains.",
    category: "trades",
    location: "Johannesburg",
    priceFrom: 850,
    availability: "Available Today",
    rating: 4.9,
    taskerId: "demo-tasker-1",
    taskerName: "Thabo M.",
  },
  {
    id: "demo-service-2",
    title: "House Cleaning Service",
    description: "Deep cleaning for apartments and family homes.",
    category: "cleaning",
    location: "Cape Town",
    priceFrom: 650,
    availability: "Available Tomorrow",
    rating: 4.8,
    taskerId: "demo-tasker-2",
    taskerName: "Nomvula S.",
  },
  {
    id: "demo-service-3",
    title: "React Web Development",
    description: "Landing pages, dashboards, and web app development.",
    category: "tech",
    location: "Remote",
    priceFrom: 750,
    availability: "This Week",
    rating: 5,
    taskerId: "demo-tasker-3",
    taskerName: "Lerato M.",
  },
];

function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value && "toDate" in (value as Record<string, unknown>)) {
    try {
      const result = (value as { toDate: () => Date }).toDate();
      return result instanceof Date ? result : null;
    } catch {
      return null;
    }
  }
  return null;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

function localProfilePhotoKey(userId: string) {
  return `freelanceskills_local_profile_photo_${userId}`;
}

export async function ensureDefaultServicesSeed() {
  const db = ensureDb();
  const servicesRef = collection(db, "services");
  const snapshot = await getDocs(query(servicesRef, limit(1)));
  if (!snapshot.empty) return;

  const taskersRef = collection(db, "taskers");
  const seedTaskers: Array<Omit<Tasker, "id">> = [
    {
      fullName: "Thabo M.",
      category: "trades",
      location: "Johannesburg",
      availability: "Available Today",
      rating: 4.9,
      priceFrom: 850,
      bio: "Licensed plumber and maintenance expert.",
      avatarUrl:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=400",
    },
    {
      fullName: "Nomvula S.",
      category: "cleaning",
      location: "Cape Town",
      availability: "Available Tomorrow",
      rating: 4.8,
      priceFrom: 650,
      bio: "Residential and office deep-cleaning specialist.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    },
    {
      fullName: "Lerato M.",
      category: "tech",
      location: "Remote",
      availability: "This Week",
      rating: 5,
      priceFrom: 750,
      bio: "Full-stack engineer for startup and enterprise apps.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    },
  ];
  const createdTaskers = await Promise.all(
    seedTaskers.map((tasker) =>
      addDoc(taskersRef, { ...tasker, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    )
  );

  const seed: Omit<ServiceItem, "id">[] = [
    {
      title: "Emergency Plumbing Repair",
      description: "Fast plumbing repairs for leaks, blocked drains, and geysers.",
      category: "trades",
      location: "Johannesburg",
      priceFrom: 850,
      availability: "Available Today",
      rating: 4.9,
      taskerId: createdTaskers[0].id,
      taskerName: "Thabo M.",
    },
    {
      title: "House Cleaning Service",
      description: "Deep cleaning for apartments and family homes.",
      category: "cleaning",
      location: "Cape Town",
      priceFrom: 650,
      availability: "Available Tomorrow",
      rating: 4.8,
      taskerId: createdTaskers[1].id,
      taskerName: "Nomvula S.",
    },
    {
      title: "React Web Development",
      description: "Landing pages, dashboards, and web app development.",
      category: "tech",
      location: "Remote",
      priceFrom: 750,
      availability: "This Week",
      rating: 5,
      taskerId: createdTaskers[2].id,
      taskerName: "Lerato M.",
    },
  ];

  await Promise.all(
    seed.map((service) =>
      addDoc(servicesRef, { ...service, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    )
  );
}

export async function fetchJobsFromFirestore(): Promise<Job[]> {
  try {
    const db = ensureDb();
    const jobsRef = collection(db, "jobs");
    const snapshot = await getDocs(query(jobsRef, orderBy("createdAt", "desc")));
    const jobs = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: toDate(data.createdAt),
      } as Job;
    });
    return jobs.length > 0 ? jobs : DEMO_JOBS;
  } catch {
    return DEMO_JOBS;
  }
}

export async function fetchJobById(jobId: string): Promise<Job | null> {
  try {
    const db = ensureDb();
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (!jobDoc.exists()) return DEMO_JOBS.find((job) => job.id === jobId) || null;
    const data = jobDoc.data() as any;
    return {
      id: jobDoc.id,
      ...data,
      createdAt: toDate(data.createdAt),
    } as Job;
  } catch {
    return DEMO_JOBS.find((job) => job.id === jobId) || null;
  }
}

export async function applyForJobInFirestore(input: {
  jobId: string;
  freelancerId: string;
  freelancerName?: string;
  coverLetter?: string;
}): Promise<{ applied: boolean; applicationId?: string }> {
  const localKey = "freelanceskills_local_job_applications";
  try {
    const db = ensureDb();
    const job = await fetchJobById(input.jobId);
    if (!job) throw new Error("Job not found.");

    const existing = await getDocs(
      query(
        collection(db, "jobApplications"),
        where("jobId", "==", input.jobId),
        where("freelancerId", "==", input.freelancerId),
        limit(1)
      )
    );
    if (!existing.empty) return { applied: false, applicationId: existing.docs[0].id };

    const refDoc = await addDoc(collection(db, "jobApplications"), {
      jobId: input.jobId,
      clientId: job.clientId,
      freelancerId: input.freelancerId,
      freelancerName: input.freelancerName || "Freelancer",
      status: "pending",
      coverLetter: input.coverLetter || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { applied: true, applicationId: refDoc.id };
  } catch {
    const current = safeLocalStorageGet<JobApplication[]>(localKey, []);
    const exists = current.find(
      (item) => item.jobId === input.jobId && item.freelancerId === input.freelancerId
    );
    if (exists) return { applied: false, applicationId: exists.id };
    const application: JobApplication = {
      id: `local-app-${Date.now()}`,
      jobId: input.jobId,
      clientId:
        DEMO_JOBS.find((job) => job.id === input.jobId)?.clientId || "demo-client",
      freelancerId: input.freelancerId,
      freelancerName: input.freelancerName || "Freelancer",
      coverLetter: input.coverLetter || "",
      status: "pending",
      createdAt: new Date(),
    };
    safeLocalStorageSet(localKey, [application, ...current]);
    return { applied: true, applicationId: application.id };
  }
}

export async function fetchApplicationsForFreelancer(userId: string): Promise<JobApplication[]> {
  const localKey = "freelanceskills_local_job_applications";
  const localData = safeLocalStorageGet<JobApplication[]>(localKey, []).filter(
    (app) => app.freelancerId === userId
  );
  try {
    const db = ensureDb();
    const snapshot = await getDocs(
      query(collection(db, "jobApplications"), where("freelancerId", "==", userId))
    );
    const remote = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: toDate(data.createdAt),
      } as JobApplication;
    });
    const merged = [...localData, ...remote];
    return merged.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  } catch {
    return localData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
}

export async function fetchJobsByIds(jobIds: string[]): Promise<Map<string, Job>> {
  if (jobIds.length === 0) return new Map();
  try {
    const db = ensureDb();
    const jobs = new Map<string, Job>();
    await Promise.all(
      jobIds.map(async (jobId) => {
        const snapshot = await getDoc(doc(db, "jobs", jobId));
        if (!snapshot.exists()) return;
        const data = snapshot.data() as any;
        jobs.set(jobId, {
          id: snapshot.id,
          ...data,
          createdAt: toDate(data.createdAt),
        } as Job);
      })
    );
    return jobs;
  } catch {
    const jobs = new Map<string, Job>();
    for (const job of DEMO_JOBS) {
      if (jobIds.includes(job.id)) jobs.set(job.id, job);
    }
    return jobs;
  }
}

export async function fetchJobsByClient(userId: string): Promise<Job[]> {
  try {
    const db = ensureDb();
    const snapshot = await getDocs(
      query(collection(db, "jobs"), where("clientId", "==", userId))
    );
    const items = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: toDate(data.createdAt),
      } as Job;
    });
    return items.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  } catch {
    return DEMO_JOBS.filter((job) => job.clientId === userId);
  }
}

export async function fetchServicesFromFirestore(): Promise<ServiceItem[]> {
  try {
    const db = ensureDb();
    await ensureDefaultServicesSeed();
    const snapshot = await getDocs(query(collection(db, "services"), orderBy("createdAt", "desc")));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ServiceItem[];
    return data.length > 0 ? data : DEMO_SERVICES;
  } catch {
    return DEMO_SERVICES;
  }
}

export async function fetchTaskersFromFirestore(): Promise<Tasker[]> {
  try {
    const db = ensureDb();
    await ensureDefaultServicesSeed();
    const snapshot = await getDocs(query(collection(db, "taskers"), orderBy("createdAt", "desc")));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Tasker[];
    return data.length > 0 ? data : DEMO_TASKERS;
  } catch {
    return DEMO_TASKERS;
  }
}

export async function createServiceRequest(input: {
  userId: string;
  serviceId?: string;
  category: string;
  request: string;
  location: string;
}): Promise<string> {
  try {
    const db = ensureDb();
    const created = await addDoc(collection(db, "serviceRequests"), {
      ...input,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return created.id;
  } catch {
    const localKey = "freelanceskills_local_service_requests";
    const current = safeLocalStorageGet<ServiceRequest[]>(localKey, []);
    const id = `local-service-request-${Date.now()}`;
    safeLocalStorageSet(localKey, [
      { id, ...input, status: "pending", createdAt: new Date() },
      ...current,
    ]);
    return id;
  }
}

export async function createBooking(input: {
  serviceId: string;
  userId: string;
  taskerId: string;
  note?: string;
}): Promise<string> {
  try {
    const db = ensureDb();
    const created = await addDoc(collection(db, "bookings"), {
      ...input,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return created.id;
  } catch {
    const localKey = "freelanceskills_local_bookings";
    const current = safeLocalStorageGet<Booking[]>(localKey, []);
    const id = `local-booking-${Date.now()}`;
    safeLocalStorageSet(localKey, [
      { id, ...input, status: "pending", createdAt: new Date() },
      ...current,
    ]);
    return id;
  }
}

export async function activateFreePlan(userId: string) {
  try {
    const db = ensureDb();
    await setDoc(
      doc(db, "users", userId),
      {
        planType: "free",
        subscriptionStatus: "active",
        onboardingCompleted: true,
        selectedPlanAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "payments"), {
      userId,
      amount: 0,
      currency: "ZAR",
      status: "paid",
      type: "subscription",
      description: "Free plan activation",
      createdAt: serverTimestamp(),
    });
  } catch {
    safeLocalStorageSet(`freelanceskills_local_plan_${userId}`, {
      planType: "free",
      subscriptionStatus: "active",
      onboardingCompleted: true,
      selectedPlanAt: new Date().toISOString(),
    });
  }
}

export async function getOrCreateSupportChat(userId: string): Promise<string> {
  try {
    const db = ensureDb();
    const existing = await getDocs(
      query(collection(db, "supportChats"), where("userId", "==", userId), limit(1))
    );
    if (!existing.empty) return existing.docs[0].id;

    const created = await addDoc(collection(db, "supportChats"), {
      userId,
      status: "open",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return created.id;
  } catch {
    return `local-support-${userId}`;
  }
}

export function subscribeSupportMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  if (chatId.startsWith("local-support-")) {
    const key = `freelanceskills_local_chat_${chatId}`;
    const emit = () => callback(safeLocalStorageGet<ChatMessage[]>(key, []));
    emit();
    const interval = window.setInterval(emit, 750);
    return () => window.clearInterval(interval);
  }
  try {
    const db = ensureDb();
    const q = query(
      collection(db, "supportChats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            chatId,
            ...data,
            createdAt: toDate(data.createdAt),
          } as ChatMessage;
        });
        callback(messages);
      },
      () => callback([])
    );
  } catch {
    callback([]);
    return () => undefined;
  }
}

export async function sendSupportMessage(input: {
  chatId: string;
  senderType: "user" | "support" | "system";
  senderId?: string;
  content: string;
}) {
  if (input.chatId.startsWith("local-support-")) {
    const key = `freelanceskills_local_chat_${input.chatId}`;
    const current = safeLocalStorageGet<ChatMessage[]>(key, []);
    current.push({
      id: `local-message-${Date.now()}`,
      chatId: input.chatId,
      senderType: input.senderType,
      senderId: input.senderId,
      content: input.content,
      createdAt: new Date(),
    });
    safeLocalStorageSet(key, current);
    return;
  }
  try {
    const db = ensureDb();
    await addDoc(collection(db, "supportChats", input.chatId, "messages"), {
      ...input,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "supportChats", input.chatId), { updatedAt: serverTimestamp() });
  } catch {
    const key = `freelanceskills_local_chat_${input.chatId}`;
    const current = safeLocalStorageGet<ChatMessage[]>(key, []);
    current.push({
      id: `local-message-${Date.now()}`,
      chatId: input.chatId,
      senderType: input.senderType,
      senderId: input.senderId,
      content: input.content,
      createdAt: new Date(),
    });
    safeLocalStorageSet(key, current);
  }
}

export async function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  try {
    if (!firebaseAuth) throw new Error("Firebase auth is not configured.");
    const storage = getStorage();
    const path = `profilePhotos/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    return await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(pct);
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  } catch {
    const dataUrl = await fileToDataUrl(file);
    safeLocalStorageSet(localProfilePhotoKey(userId), dataUrl);
    onProgress?.(100);
    return dataUrl;
  }
}

export async function saveFreelancerProfile(profile: FreelancerProfile) {
  try {
    const db = ensureDb();
    await setDoc(
      doc(db, "freelancerProfiles", profile.userId),
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await setDoc(
      doc(db, "users", profile.userId),
      {
        role: "freelancer",
        onboardingCompleted: true,
        title: profile.title,
        location: profile.location,
        skills: profile.skills,
        profilePhotoUrl: profile.profilePhotoUrl || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    safeLocalStorageSet(`freelanceskills_local_freelancer_profile_${profile.userId}`, profile);
  }
}

export async function fetchFreelancerProfile(userId: string): Promise<FreelancerProfile | null> {
  const local = safeLocalStorageGet<FreelancerProfile | null>(
    `freelanceskills_local_freelancer_profile_${userId}`,
    null
  );

  try {
    const db = ensureDb();
    const [profileSnap, userSnap] = await Promise.all([
      getDoc(doc(db, "freelancerProfiles", userId)),
      getDoc(doc(db, "users", userId)),
    ]);

    if (!profileSnap.exists() && !userSnap.exists()) {
      return local;
    }

    const profileData = (profileSnap.data() || {}) as Record<string, unknown>;
    const userData = (userSnap.data() || {}) as Record<string, unknown>;
    const fullNameRaw =
      String(profileData.fullName || "").trim() ||
      String(userData.displayName || "").trim() ||
      `${String(userData.firstName || "").trim()} ${String(userData.lastName || "").trim()}`.trim();

    return {
      userId,
      fullName: fullNameRaw || "Freelancer",
      profilePhotoUrl: String(profileData.profilePhotoUrl || userData.profilePhotoUrl || "").trim(),
      bio: String(profileData.bio || userData.bio || "").trim(),
      title: String(profileData.title || userData.title || "").trim(),
      skills: normalizeStringArray(profileData.skills ?? userData.skills),
      expertise: normalizeStringArray(profileData.expertise),
      categories: normalizeStringArray(profileData.categories),
      hourlyRate: Number(profileData.hourlyRate || 0),
      location: String(profileData.location || userData.location || "").trim(),
      portfolioLinks: normalizeStringArray(profileData.portfolioLinks),
      experienceLevel: String(profileData.experienceLevel || "").trim(),
      availability: String(profileData.availability || "").trim(),
      role: "freelancer",
      onboardingCompleted: Boolean(profileData.onboardingCompleted ?? userData.onboardingCompleted),
      updatedAt: toDate(profileData.updatedAt),
    };
  } catch {
    return local;
  }
}

export async function fetchUserPayments(userId: string): Promise<PaymentRecord[]> {
  try {
    const db = ensureDb();
    const snapshot = await getDocs(
      query(collection(db, "payments"), where("userId", "==", userId))
    );
    return snapshot.docs
      .map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: toDate(data.createdAt),
        } as PaymentRecord;
      })
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  } catch {
    const localPlan = safeLocalStorageGet<Record<string, unknown> | null>(
      `freelanceskills_local_plan_${userId}`,
      null
    );
    if (!localPlan) return [];
    return [
      {
        id: `local-payment-${userId}`,
        userId,
        amount: 0,
        currency: "ZAR",
        status: "paid",
        type: "subscription",
        createdAt: new Date(),
      },
    ];
  }
}

export async function updateUserSettings(userId: string, settings: Record<string, unknown>) {
  try {
    const db = ensureDb();
    await setDoc(
      doc(db, "users", userId),
      {
        settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    safeLocalStorageSet(`freelanceskills_local_settings_${userId}`, settings);
  }
}

export async function fetchUserSettings(userId: string): Promise<Record<string, any>> {
  try {
    const db = ensureDb();
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) {
      return safeLocalStorageGet<Record<string, unknown>>(
        `freelanceskills_local_settings_${userId}`,
        {}
      );
    }
    const data = snap.data() as any;
    return data.settings || {};
  } catch {
    return safeLocalStorageGet<Record<string, unknown>>(
      `freelanceskills_local_settings_${userId}`,
      {}
    );
  }
}

export async function fetchSupportChatsForUser(userId: string): Promise<Array<{ id: string; status: string; updatedAt?: Date | null }>> {
  try {
    const db = ensureDb();
    const snapshot = await getDocs(
      query(collection(db, "supportChats"), where("userId", "==", userId))
    );
    return snapshot.docs
      .map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          status: data.status || "open",
          updatedAt: toDate(data.updatedAt),
        };
      })
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  } catch {
    return [{ id: `local-support-${userId}`, status: "open", updatedAt: new Date() }];
  }
}
