"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllSeries } from "@/lib/supabase/queries";
import type { YogaSeries } from "@/types";

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<YogaSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSeries()
      .then(setSeries)
      .finally(() => setLoading(false));
  }, []);

  // Sort by date created, newest first (fetchAllSeries already orders by created_at desc)
  const sorted = series;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">All Series</h1>
      <p className="mt-2 text-muted">
        View all series ordered by date created.
      </p>

      {loading && <p className="mt-8 text-sm text-muted">Loading series…</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((series) => (
          <div
            key={series.id}
            className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
          >
            <h3 className="font-semibold">{series.title}</h3>
            <p className="mt-1 text-sm text-muted line-clamp-2">
              {series.description}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{series.classes.length} classes</span>
              <span>{new Date(series.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex gap-3 border-t border-border pt-3">
              <Link
                href={`/series/${series.id}`}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                View
              </Link>
              <Link
                href={`/admin/series/${series.id}/edit`}
                className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
