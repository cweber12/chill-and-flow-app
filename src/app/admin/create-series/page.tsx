"use client";

import { useState, useMemo } from "react";
import { getPlaceholderTitle } from "@/lib/mock-data";
import { createSeries } from "@/lib/supabase/queries";

export default function CreateSeriesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titlePlaceholder = useMemo(
    () => `e.g. ${getPlaceholderTitle()} Series`,
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await createSeries({ title, description });
      setMessage(`Series "${title}" created successfully!`);
      setTitle("");
      setDescription("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create series. Please try again.");
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
          {saving ? "Creating…" : "Create Series"}
        </button>
      </form>
    </div>
  );
}
