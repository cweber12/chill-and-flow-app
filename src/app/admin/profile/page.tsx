"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchInstructorById,
  upsertInstructorProfile,
  uploadInstructorPhoto,
} from "@/lib/supabase/queries";
import type { InstructorProfile } from "@/types";

export default function InstructorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchInstructorById(user.id)
      .then((p) => {
        if (p) {
          setProfile(p);
          setFullName(p.full_name);
          setBio(p.bio);
          setLocation(p.location);
          setPhotos(p.photos);
        }
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadInstructorPhoto(file);
      setPhotos((prev) => [...prev, url]);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to upload photo.",
      );
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const updated = await upsertInstructorProfile({
        id: user.id,
        full_name: fullName,
        bio,
        location,
        photos,
      });
      setProfile(updated);
      setMessage("Profile saved successfully!");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to save profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Instructor Profile
      </h1>
      <p className="mt-2 text-muted">
        Update your bio, location, and photos visible to students.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium mb-1"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="e.g. Sedona, AZ"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            placeholder="Tell students about your teaching style, experience, certifications…"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos</label>
          <div className="flex flex-wrap gap-3">
            {photos.map((url, i) => (
              <div key={url} className="group relative h-24 w-24">
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-accent hover:text-accent transition-colors"
              aria-label="Add photo"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handlePhotoUpload}
          />
        </div>

        {message && (
          <p className="text-sm text-accent" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : profile ? "Save Changes" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
