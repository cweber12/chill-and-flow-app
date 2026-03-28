"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { fetchAllClasses } from "@/lib/supabase/queries";
import type { YogaClass } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    fetchAllClasses()
      .then((c) => setClasses(c.slice(0, 2)))
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome
        {user?.user_metadata?.full_name
          ? `, ${user.user_metadata.full_name}`
          : ""}
      </h1>
      <p className="mt-2 text-muted">
        Your current classes and practice overview.
      </p>

      {/* Registered classes */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Classes</h2>
          <Link
            href="/dashboard/browse"
            className="text-sm text-accent hover:underline"
          >
            Browse more →
          </Link>
        </div>

        {classesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-muted">You haven&apos;t registered for any classes yet.</p>
            <Link
              href="/dashboard/browse"
              className="mt-3 inline-block text-sm text-accent hover:underline"
            >
              Browse classes →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard key={cls.id} yogaClass={cls} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClassCard({ yogaClass }: { yogaClass: YogaClass }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {yogaClass.type}
        </span>
        <span className="inline-block rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-muted">
          {yogaClass.difficulty}
        </span>
      </div>
      <h3 className="font-semibold">{yogaClass.title}</h3>
      <p className="mt-1 text-sm text-muted line-clamp-2">
        {yogaClass.description}
      </p>
      <p className="mt-3 text-xs text-muted">
        {yogaClass.duration_minutes} min
      </p>
    </div>
  );
}
