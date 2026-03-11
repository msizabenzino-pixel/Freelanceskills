export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'freelancer' | 'client' | 'admin';
  isPremium?: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  category: string;
  locationType: 'onsite' | 'remote';
  location?: string;
  latitude?: number;
  longitude?: number;
  clientId: string;
  freelancerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AggregatedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements?: string;
  location: string;
  province: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  source: string;
  sourceUrl?: string;
  category: string;
  jobType: string;
  experienceLevel?: string;
  postedDate?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId?: string;
  aggregatedJobId?: string;
  jobTitle: string;
  company?: string;
  coverLetter?: string;
  resumeSummary?: string;
  status: string;
  source?: string;
  appliedAt?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface Conversation {
  id: number;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Profile extends User {
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  location?: string;
  isVerified?: boolean;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  totalLessons: number;
  imageUrl?: string;
  isFree: boolean;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string;
  orderIndex: number;
  type: string;
  videoUrl?: string;
}

export interface CourseProgress {
  id: number;
  userId: string;
  courseId: number;
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}
