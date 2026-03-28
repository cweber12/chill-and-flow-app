"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchInstructorById,
  fetchClassesByInstructor,
  fetchSeriesByInstructor,
} from "@/lib/supabase/queries";
import type { InstructorProfile, YogaClass, YogaSeries } from "@/types";

export default function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [instructor, setInstructor] = useState<
    InstructorProfile | null | undefined
  >(undefined);
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [series, setSeries] = useState<YogaSeries[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    fetchInstructorById(id)
      .then(async (profile) => {
        setInstructor(profile);
        if (profile) {
          const [c, s] = await Promise.all([
            fetchClassesByInstructor(id),
            fetchSeriesByInstructor(id),
          ]);
          setClasses(c);
          setSeries(s);
        }
      })
      .catch(() => setInstructor(null));
  }, [id]);

  // Auto-advance slideshow
  useEffect(() => {
    if (!instructor || instructor.photos.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % instructor.photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [instructor?.photos.length]);

  if (instructor === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (instructor === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Instructor not found</h1>
        <Link
          href="/dashboard/instructors"
          className="mt-4 inline-block text-accent hover:underline"
        >
          Browse instructors
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/dashboard/instructors"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back to instructors
      </Link>

      {/* Photo slideshow */}
      {instructor.photos.length > 0 && (
        <div className="mt-6 relative overflow-hidden rounded-xl aspect-[3/1] bg-surface">
          {instructor.photos.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`${instructor.full_name} photo ${i + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === slideIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {instructor.photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {instructor.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === slideIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {instructor.full_name}
      </h1>
      {instructor.location && (
        <p className="mt-1 text-sm text-muted">📍 {instructor.location}</p>
      )}
      {instructor.bio && (
        <p className="mt-4 text-muted leading-relaxed">{instructor.bio}</p>
      )}

      {/* Classes */}
      {classes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Classes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/classes/${cls.id}`}
                className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {cls.type}
                  </span>
                  <span className="inline-block rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-muted">
                    {cls.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold">{cls.title}</h3>
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {cls.description}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {cls.duration_minutes} min
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Series */}
      {series.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Series</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {series.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
              >
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {s.description}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {s.classes.length} classes
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
