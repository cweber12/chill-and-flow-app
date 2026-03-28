"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  fetchClassById,
  updateClass,
  uploadClassVideo,
  uploadImage,
} from "@/lib/supabase/queries";
import { CLASS_TYPES, DIFFICULTIES, capitalize } from "@/lib/constants";
import type { ClassDifficulty, ClassType, YogaClass } from "@/types";

export default function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [yogaClass, setYogaClass] = useState<YogaClass | null | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchClassById(id).then(setYogaClass);
  }, [id]);

  if (yogaClass === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (yogaClass === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Class not found</h1>
        <Link
          href="/admin/classes"
          className="mt-4 inline-block text-accent hover:underline"
        >
          Back to classes
        </Link>
      </div>
    );
  }

  return <EditClassForm yogaClass={yogaClass} />;
}

function EditClassForm({ yogaClass }: { yogaClass: YogaClass }) {
  const [title, setTitle] = useState(yogaClass.title);
  const [description, setDescription] = useState(yogaClass.description);
  const [type, setType] = useState<ClassType>(yogaClass.type);
  const [difficulty, setDifficulty] = useState<ClassDifficulty>(
    yogaClass.difficulty,
  );
  const [duration, setDuration] = useState(yogaClass.duration_minutes);
  const [location, setLocation] = useState(yogaClass.location);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let video_url = yogaClass.video_url;
      if (videoFile) {
        video_url = await uploadClassVideo(videoFile);
      }

      let image_url = yogaClass.image_url;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      await updateClass(yogaClass.id, {
        title,
        description,
        type,
        difficulty,
        duration_minutes: duration,
        location,
        video_url,
        image_url,
      });
      setMessage("Class updated successfully!");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to update class. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/classes/${yogaClass.id}`}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back to class
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Edit Class</h1>
      <p className="mt-2 text-muted">
        Update this class&apos;s details and video.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="classTitle"
            className="block text-sm font-medium mb-1"
          >
            Class Title
          </label>
          <input
            id="classTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label
            htmlFor="classDescription"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="classDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="classType"
              className="block text-sm font-medium mb-1"
            >
              Type
            </label>
            <select
              id="classType"
              value={type}
              onChange={(e) => setType(e.target.value as ClassType)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {CLASS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="classDifficulty"
              className="block text-sm font-medium mb-1"
            >
              Difficulty
            </label>
            <select
              id="classDifficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ClassDifficulty)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {capitalize(d)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="classDuration"
              className="block text-sm font-medium mb-1"
            >
              Duration (min)
            </label>
            <input
              id="classDuration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              max={120}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="classLocation"
            className="block text-sm font-medium mb-1"
          >
            Location
          </label>
          <input
            id="classLocation"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="e.g. Sedona, AZ"
          />
        </div>

        {/* Background image upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Background Image
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload background image"
            onClick={() => imageInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && imageInputRef.current?.click()
            }
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-6 transition-colors hover:border-accent"
          >
            <svg
              className="mb-2 h-6 w-6 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {imageFile ? (
              <p className="text-sm font-medium text-accent">
                {imageFile.name}
              </p>
            ) : yogaClass.image_url ? (
              <p className="text-sm text-muted">
                Replace background image — click to browse
              </p>
            ) : (
              <p className="text-sm text-muted">
                Upload background image (optional)
              </p>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* Video upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Video</label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload video"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-8 transition-colors hover:border-accent"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
          >
            <svg
              className="mb-2 h-8 w-8 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.869v6.262a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
              />
            </svg>
            {videoFile ? (
              <p className="text-sm font-medium text-accent">
                {videoFile.name}
              </p>
            ) : (
              <p className="text-sm text-muted">
                {yogaClass.video_url ? "Replace video" : "Upload video"} — click
                to browse
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="sr-only"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {message && (
          <p className="text-sm text-accent" role="status">
            {message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href={`/classes/${yogaClass.id}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
