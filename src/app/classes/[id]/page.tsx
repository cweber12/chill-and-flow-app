"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchClassById } from "@/lib/supabase/queries";
import type { YogaClass } from "@/types";

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [yogaClass, setYogaClass] = useState<YogaClass | null | undefined>(
    undefined,
  );
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetchClassById(id).then(setYogaClass);
  }, [id]);

  // Still loading
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
        ← Back to classes
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {yogaClass.title}
      </h1>

      <div className="mt-3 flex items-center gap-3">
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {yogaClass.type}
        </span>
        <span className="inline-block rounded-full bg-surface-hover px-3 py-1 text-xs font-medium text-muted">
          {yogaClass.difficulty}
        </span>
        <span className="text-xs text-muted">
          {yogaClass.duration_minutes} min
        </span>
      </div>

      {/* Video player / upload frame */}
      <div className="mt-8">
        {yogaClass.video_url ? (
          <div
            className={`relative overflow-hidden rounded-xl bg-black ${
              fullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
            }`}
          >
            <video
              src={yogaClass.video_url}
              controls
              className="h-full w-full object-contain"
              poster=""
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="absolute top-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white hover:bg-black/80 transition-colors"
            >
              {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface">
            <svg
              className="mb-3 h-10 w-10 text-muted"
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
            <p className="text-sm text-muted">No video uploaded yet</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">About this class</h2>
        <p className="text-muted leading-relaxed">{yogaClass.description}</p>
      </div>
    </div>
  );
}
