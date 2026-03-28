"use client";

import { useState, useMemo, useRef } from "react";
import { getPlaceholderTitle } from "@/lib/mock-data";
import { createClass, uploadClassVideo } from "@/lib/supabase/queries";
import { CLASS_TYPES, DIFFICULTIES, capitalize } from "@/lib/constants";
import type { ClassDifficulty, ClassType } from "@/types";

export default function CreateClassPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ClassType>("vinyasa");
  const [difficulty, setDifficulty] = useState<ClassDifficulty>("beginner");
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const placeholderTitle = useMemo(() => `e.g. ${getPlaceholderTitle()}`, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!videoFile) {
      setMessage("A video file is required.");
      setSaving(false);
      return;
    }

    try {
      const video_url = await uploadClassVideo(videoFile);

      await createClass({ title, description, type, difficulty, duration_minutes: duration, location, video_url });

      setMessage(`Class "${title}" created successfully!`);
      setTitle("");
      setDescription("");
      setType("vinyasa");
      setDifficulty("beginner");
      setDuration(30);
      setLocation("");
      setVideoFile(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
      <p className="mt-2 text-muted">
        Design a yoga class for your students.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="classTitle" className="block text-sm font-medium mb-1">
            Class Title
          </label>
          <input
            id="classTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder={placeholderTitle}
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
            placeholder="Describe the focus, intensity, and what students can expect..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="classType" className="block text-sm font-medium mb-1">
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
              onChange={(e) =>
                setDifficulty(e.target.value as ClassDifficulty)
              }
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
          <label htmlFor="classLocation" className="block text-sm font-medium mb-1">
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

        {/* Video upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Class Video <span className="text-accent">*</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload video"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-8 transition-colors hover:border-accent"
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
              <p className="text-sm font-medium text-accent">{videoFile.name}</p>
            ) : (
              <p className="text-sm text-muted">Click to select a video file</p>
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

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Class"}
        </button>
      </form>
    </div>
  );
}
