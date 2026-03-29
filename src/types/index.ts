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
export type ClassFormat = "online" | "in-person";

export interface YogaClass {
  id: string;
  title: string;
  description: string;
  type: ClassType;
  difficulty: ClassDifficulty;
  format: ClassFormat;
  duration_minutes: number;
  video_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  address: string;
  location: string;
  created_at: string;
  instructor_id: string;
}

export interface YogaSeries {
  id: string;
  title: string;
  description: string;
  format: ClassFormat;
  location: string;
  address: string;
  classes: string[]; // class IDs
  image_url?: string;
  created_at: string;
  instructor_id: string;
}

export interface InstructorProfile {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  city: string;
  state: string;
  zip: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  bio: string;
  city: string;
  state: string;
  zip: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollment {
  id: string;
  user_id: string;
  class_id: string;
  status: "enrolled" | "completed";
  created_at: string;
}

export interface SeriesEnrollment {
  id: string;
  user_id: string;
  series_id: string;
  status: "enrolled" | "completed";
  created_at: string;
}

export interface ClassRegistration {
  id: string;
  user_id: string;
  class_id: string;
  registered_at: string;
  yoga_class?: YogaClass;
}
