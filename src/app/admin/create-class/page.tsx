"use client";

import { useState, useEffect, useRef } from "react";
import { getPlaceholderTitle } from "@/lib/mock-data";
import {
  createClass,
  uploadClassVideo,
  uploadImage,
} from "@/lib/supabase/queries";
import { CLASS_TYPES, DIFFICULTIES, capitalize } from "@/lib/constants";
import type { ClassDifficulty, ClassFormat, ClassType } from "@/types";

export default function CreateClassPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<ClassFormat>("online");
  const [type, setType] = useState<ClassType>("vinyasa");
  const [difficulty, setDifficulty] = useState<ClassDifficulty>("beginner");
  const [duration, setDuration] = useState(30);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [placeholderTitle, setPlaceholderTitle] = useState(
    "e.g. Morning Vinyasa Flow",
  );
  useEffect(() => {
    setPlaceholderTitle(`e.g. ${getPlaceholderTitle()}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (format === "online" && !videoFile) {
      setMessage("A video file is required for online classes.");
      setSaving(false);
      return;
    }

    try {
      const video_url = videoFile
        ? await uploadClassVideo(videoFile)
        : undefined;
      const image_url = imageFile ? await uploadImage(imageFile) : undefined;

      await createClass({
        title,
        description,
        format,
        type,
        difficulty,
        duration_minutes: duration,
        address,
        location,
        video_url,
        image_url,
      });

      setMessage(`Class "${title}" created successfully!`);
      setTitle("");
      setDescription("");
      setFormat("online");
      setType("vinyasa");
      setDifficulty("beginner");
      setDuration(30);
      setAddress("");
      setLocation("");
      setVideoFile(null);
      setImageFile(null);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to create class. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
      <p className="mt-2 text-muted">Design a yoga class for your students.</p>

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

        {/* Format toggle */}
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <div className="flex rounded-lg border border-border bg-surface p-1 w-fit">
            <button
              type="button"
              onClick={() => setFormat("online")}
              className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                format === "online"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setFormat("in-person")}
              className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                format === "in-person"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              In-Person
            </button>
          </div>
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
              max={300}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Conditional: In-Person — location fields */}
        {format === "in-person" && (
          <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold">Class Location</p>
            <div>
              <label
                htmlFor="classAddress"
                className="block text-sm font-medium mb-1"
              >
                Street Address
              </label>
              <input
                id="classAddress"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g. 123 Center St, Suite 200"
              />
            </div>
            <div>
              <label
                htmlFor="classLocation"
                className="block text-sm font-medium mb-1"
              >
                City, State
              </label>
              <input
                id="classLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g. Sedona, AZ"
              />
            </div>
          </div>
        )}

        {/* Conditional: Online — video upload */}
        {format === "online" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Class Video <span className="text-accent">*</span>
            </label>
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload video"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
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
                <p className="text-sm font-medium text-accent">
                  {videoFile.name}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Click to select a video file
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
        )}
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
            ) : (
              <p className="text-sm text-muted">
                Click to select a background image (optional)
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
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Class"}
        </button>
      </form>
    </div>
  );
}
