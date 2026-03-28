"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchSeriesById, updateSeries } from "@/lib/supabase/queries";
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
        <Link href="/admin/series" className="mt-4 inline-block text-accent hover:underline">
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
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateSeries(series.id, { title, description });
      setMessage("Series updated successfully!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update series. Please try again.");
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
          <label htmlFor="seriesTitle" className="block text-sm font-medium mb-1">
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
          <label htmlFor="seriesDescription" className="block text-sm font-medium mb-1">
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
