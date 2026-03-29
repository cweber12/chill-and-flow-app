"use client";

import { useState, useEffect, useRef } from "react";
import { getPlaceholderTitle } from "@/lib/mock-data";
import { createSeries, uploadImage } from "@/lib/supabase/queries";
import type { ClassFormat } from "@/types";

export default function CreateSeriesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<ClassFormat>("online");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [titlePlaceholder, setTitlePlaceholder] = useState(
    "e.g. Morning Vinyasa Flow Series",
  );
  useEffect(() => {
    setTitlePlaceholder(`e.g. ${getPlaceholderTitle()} Series`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const image_url = imageFile ? await uploadImage(imageFile) : undefined;
      await createSeries({
        title,
        description,
        format,
        location,
        address,
        image_url,
      });
      setMessage(`Series "${title}" created successfully!`);
      setTitle("");
      setDescription("");
      setFormat("online");
      setLocation("");
      setAddress("");
      setImageFile(null);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to create series. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Create New Series</h1>
      <p className="mt-2 text-muted">
        Group yoga classes into a progressive series.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="seriesTitle"
            className="block text-sm font-medium mb-1"
          >
            Series Title
          </label>
          <input
            id="seriesTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder={titlePlaceholder}
          />
        </div>

        <div>
          <label
            htmlFor="seriesDescription"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="seriesDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            placeholder="Describe the series goal, progression, and target audience..."
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

        {/* Conditional: In-Person — location fields */}
        {format === "in-person" && (
          <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold">Series Location</p>
            <div>
              <label
                htmlFor="seriesAddress"
                className="block text-sm font-medium mb-1"
              >
                Street Address
              </label>
              <input
                id="seriesAddress"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g. 456 Studio Way"
              />
            </div>
            <div>
              <label
                htmlFor="seriesLocation"
                className="block text-sm font-medium mb-1"
              >
                City, State
              </label>
              <input
                id="seriesLocation"
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
          {saving ? "Creating…" : "Create Series"}
        </button>
      </form>
    </div>
  );
}
