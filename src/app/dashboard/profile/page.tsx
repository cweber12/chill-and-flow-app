"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchStudentProfile,
  upsertStudentProfile,
  uploadPhoto,
} from "@/lib/supabase/queries";
import { LocationInput } from "@/components/ui/location-input";
import type { StudentProfile } from "@/types";

export default function StudentProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchStudentProfile(user.id)
      .then((p) => {
        if (p) {
          setProfile(p);
          setFullName(p.full_name);
          setBio(p.bio);
          setCity(p.city || "");
          setState(p.state || "");
          setZip(p.zip || "");
          setPhotoUrl(p.photo_url);
        } else {
          setFullName(user.user_metadata?.full_name || "");
        }
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Photo must be under 10 MB.");
      return;
    }
    try {
      const url = await uploadPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to upload photo.",
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const updated = await upsertStudentProfile({
        id: user.id,
        full_name: fullName,
        bio,
        city,
        state,
        zip,
        photo_url: photoUrl,
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
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      <p className="mt-2 text-muted">Update your photo, bio, and location.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-hover text-muted text-2xl font-bold">
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {photoUrl ? "Change Photo" : "Upload Photo"}
            </button>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="text-sm text-muted hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handlePhotoUpload}
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
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

        <LocationInput
          city={city}
          state={state}
          zip={zip}
          onCityChange={setCity}
          onStateChange={setState}
          onZipChange={setZip}
        />

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            placeholder="Tell us about yourself, your yoga journey, what you're looking for…"
          />
        </div>

        {message && (
          <p
            className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}
            role="alert"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : profile ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
