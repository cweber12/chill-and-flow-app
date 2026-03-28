// Shared TypeScript types

export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
}

export type ClassDifficulty = "beginner" | "intermediate" | "advanced";
export type ClassType =
  | "vinyasa"
  | "hatha"
  | "yin"
  | "restorative"
  | "power"
  | "meditation";

export interface YogaClass {
  id: string;
  title: string;
  description: string;
  type: ClassType;
  difficulty: ClassDifficulty;
  duration_minutes: number;
  video_url?: string;
  thumbnail_url?: string;
  location: string;
  created_at: string;
  instructor_id: string;
}

export interface YogaSeries {
  id: string;
  title: string;
  description: string;
  classes: string[]; // class IDs
  created_at: string;
  instructor_id: string;
}

export interface InstructorProfile {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface ClassRegistration {
  id: string;
  user_id: string;
  class_id: string;
  registered_at: string;
  yoga_class?: YogaClass;
}
