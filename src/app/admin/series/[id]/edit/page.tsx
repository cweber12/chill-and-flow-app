"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  fetchSeriesById,
  updateSeries,
  uploadImage,
} from "@/lib/supabase/queries";
import type { YogaSeries } from "@/types";

export default function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [series, setSeries] = useState<YogaSeries | null | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchSeriesById(id).then(setSeries);
  }, [id]);

  if (series === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (series === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Series not found</h1>
        <Link
          href="/admin/series"
          className="mt-4 inline-block text-accent hover:underline"
        >
          Back to series
        </Link>
      </div>
    );
  }

  return <EditSeriesForm series={series} />;
}

function EditSeriesForm({ series }: { series: YogaSeries }) {
  const [title, setTitle] = useState(series.title);
  const [description, setDescription] = useState(series.description);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const image_url = imageFile ? await uploadImage(imageFile) : undefined;
      await updateSeries(series.id, {
        title,
        description,
        ...(image_url ? { image_url } : {}),
      });
      setMessage("Series updated successfully!");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to update series. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/series/${series.id}`}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back to series
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Edit Series</h1>
      <p className="mt-2 text-muted">Update this series&apos;s details.</p>

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
            ) : series.image_url ? (
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
            href={`/series/${series.id}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
