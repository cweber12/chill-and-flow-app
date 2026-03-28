"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchSeriesById, fetchClassesByIds } from "@/lib/supabase/queries";
import type { YogaClass, YogaSeries } from "@/types";

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [series, setSeries] = useState<YogaSeries | null | undefined>(
    undefined,
  );
  const [seriesClasses, setSeriesClasses] = useState<YogaClass[]>([]);

  useEffect(() => {
    fetchSeriesById(id).then(async (s) => {
      setSeries(s);
      if (s && s.classes.length > 0) {
        const classes = await fetchClassesByIds(s.classes);
        // Preserve the order from the series definition
        const classMap = new Map(classes.map((c) => [c.id, c]));
        setSeriesClasses(
          s.classes
            .map((cid) => classMap.get(cid))
            .filter(Boolean) as YogaClass[],
        );
      }
    });
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
          href="/"
          className="mt-4 inline-block text-accent hover:underline"
        >
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/dashboard/browse"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back to browse
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{series.title}</h1>

      <p className="mt-3 text-muted leading-relaxed">{series.description}</p>

      <div className="mt-2 text-xs text-muted">
        {series.classes.length} classes · Created{" "}
        {new Date(series.created_at).toLocaleDateString()}
      </div>

      {/* Classes in series */}
      <div className="mt-10 space-y-4">
        {seriesClasses.map((cls, index) => (
          <Link
            key={cls.id}
            href={`/classes/${cls.id}`}
            className="group flex items-center gap-5 rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-sm">
              Day {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-accent transition-colors">
                {cls.title}
              </h3>
              <p className="mt-0.5 text-sm text-muted line-clamp-1">
                {cls.description}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {cls.type}
              </span>
              <span className="text-xs text-muted">
                {cls.duration_minutes} min
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
