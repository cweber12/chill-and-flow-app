/**
 * Supabase data access layer.
 * All functions use the browser client and are safe to call from Client Components.
 * RLS on the DB enforces that only authenticated admins can mutate data.
 */

import { createClient } from "./client";
import type {
  YogaClass,
  YogaSeries,
  InstructorProfile,
  StudentProfile,
  ClassEnrollment,
  SeriesEnrollment,
} from "@/types";

// ── Types returned by the join query ─────────────────────────────────────────

interface SeriesRow {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
  series_classes: { class_id: string; position: number }[];
}

// ── Classes ───────────────────────────────────────────────────────────────────

export async function fetchAllClasses(): Promise<YogaClass[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_classes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as YogaClass[];
}

export async function fetchClassById(id: string): Promise<YogaClass | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_classes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as YogaClass;
}

export async function createClass(
  values: Omit<YogaClass, "id" | "created_at" | "instructor_id">,
): Promise<YogaClass> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("yoga_classes")
    .insert({ ...values, instructor_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as YogaClass;
}

export async function updateClass(
  id: string,
  values: Partial<Omit<YogaClass, "id" | "created_at" | "instructor_id">>,
): Promise<YogaClass> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_classes")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as YogaClass;
}

// ── Series ────────────────────────────────────────────────────────────────────

function mapSeriesRow(row: SeriesRow): YogaSeries {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    instructor_id: row.instructor_id,
    created_at: row.created_at,
    classes: [...row.series_classes]
      .sort((a, b) => a.position - b.position)
      .map((sc) => sc.class_id),
  };
}

export async function fetchAllSeries(): Promise<YogaSeries[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_series")
    .select("*, series_classes(class_id, position)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SeriesRow[]).map(mapSeriesRow);
}

export async function fetchSeriesById(id: string): Promise<YogaSeries | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_series")
    .select("*, series_classes(class_id, position)")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapSeriesRow(data as SeriesRow);
}

export async function createSeries(
  values: Pick<YogaSeries, "title" | "description"> & { image_url?: string },
): Promise<YogaSeries> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("yoga_series")
    .insert({ ...values, instructor_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...(data as YogaSeries), classes: [] };
}

export async function updateSeries(
  id: string,
  values: Partial<
    Pick<YogaSeries, "title" | "description"> & { image_url?: string }
  >,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("yoga_series")
    .update(values)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Storage ───────────────────────────────────────────────────────────────────

/**
 * Uploads a video file to the class_videos bucket and returns its public URL.
 * The file is stored under a random UUID path to prevent enumeration.
 */
export async function uploadClassVideo(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("class_videos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("class_videos").getPublicUrl(path);

  return publicUrl;
}

// ── Instructor Profiles ───────────────────────────────────────────────────────

export async function fetchAllInstructors(): Promise<InstructorProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instructor_profiles")
    .select("*")
    .order("full_name");
  if (error) throw new Error(error.message);
  return data as InstructorProfile[];
}

export async function fetchInstructorById(
  id: string,
): Promise<InstructorProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instructor_profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as InstructorProfile;
}

export async function upsertInstructorProfile(
  values: Omit<InstructorProfile, "created_at" | "updated_at">,
): Promise<InstructorProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instructor_profiles")
    .upsert({ ...values, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InstructorProfile;
}

export async function fetchClassesByInstructor(
  instructorId: string,
): Promise<YogaClass[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_classes")
    .select("*")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as YogaClass[];
}

export async function fetchSeriesByInstructor(
  instructorId: string,
): Promise<YogaSeries[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("yoga_series")
    .select("*, series_classes(class_id, position)")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SeriesRow[]).map(mapSeriesRow);
}

/**
 * Uploads a photo to the photos bucket and returns its public URL.
 * Used for both instructor and student profile photos.
 */
export async function uploadPhoto(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(path);

  return publicUrl;
}

/**
 * @deprecated Use uploadPhoto() which uses the shared "photos" bucket.
 */
export async function uploadInstructorPhoto(file: File): Promise<string> {
  return uploadPhoto(file);
}

// ── Student Profiles ──────────────────────────────────────────────────────────

export async function fetchStudentProfile(
  id: string,
): Promise<StudentProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as StudentProfile;
}

export async function upsertStudentProfile(
  values: Omit<StudentProfile, "created_at" | "updated_at">,
): Promise<StudentProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .upsert({ ...values, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as StudentProfile;
}

// ── Follows ───────────────────────────────────────────────────────────────────

export async function followInstructor(instructorId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("instructor_follows")
    .insert({ user_id: user.id, instructor_id: instructorId });
  if (error) throw new Error(error.message);
}

export async function unfollowInstructor(instructorId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("instructor_follows")
    .delete()
    .eq("user_id", user.id)
    .eq("instructor_id", instructorId);
  if (error) throw new Error(error.message);
}

export async function fetchFollowedInstructorIds(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("instructor_follows")
    .select("instructor_id")
    .eq("user_id", user.id);
  if (error) return [];
  return data.map((r) => r.instructor_id);
}

export async function fetchFollowerCount(
  instructorId: string,
): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("instructor_follows")
    .select("*", { count: "exact", head: true })
    .eq("instructor_id", instructorId);
  if (error) return 0;
  return count ?? 0;
}

// ── Class Enrollments ─────────────────────────────────────────────────────────

export async function enrollInClass(classId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("class_enrollments")
    .insert({ user_id: user.id, class_id: classId });
  if (error) throw new Error(error.message);
}

export async function unenrollFromClass(classId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("class_enrollments")
    .delete()
    .eq("user_id", user.id)
    .eq("class_id", classId);
  if (error) throw new Error(error.message);
}

export async function completeClass(classId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("class_enrollments")
    .update({ status: "completed" })
    .eq("user_id", user.id)
    .eq("class_id", classId);
  if (error) throw new Error(error.message);
}

export async function fetchMyClassEnrollments(): Promise<ClassEnrollment[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as ClassEnrollment[];
}

// ── Series Enrollments ────────────────────────────────────────────────────────

export async function enrollInSeries(seriesId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("series_enrollments")
    .insert({ user_id: user.id, series_id: seriesId });
  if (error) throw new Error(error.message);
}

export async function unenrollFromSeries(seriesId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("series_enrollments")
    .delete()
    .eq("user_id", user.id)
    .eq("series_id", seriesId);
  if (error) throw new Error(error.message);
}

export async function fetchMySeriesEnrollments(): Promise<SeriesEnrollment[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("series_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as SeriesEnrollment[];
}

// ── Image uploads (class/series backgrounds) ─────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  return uploadPhoto(file);
}
