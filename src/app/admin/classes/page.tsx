"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllClasses } from "@/lib/supabase/queries";
import { CLASS_TYPES, capitalize } from "@/lib/constants";
import type { ClassType, YogaClass } from "@/types";

export default function AdminClassesPage() {
  const [allClasses, setAllClasses] = useState<YogaClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ClassType | "all">("all");

  useEffect(() => {
    fetchAllClasses()
      .then(setAllClasses)
      .finally(() => setLoading(false));
  }, []);

  const grouped = CLASS_TYPES.reduce(
    (acc, type) => {
      acc[type] = allClasses.filter((c) => c.type === type);
      return acc;
    },
    {} as Record<ClassType, YogaClass[]>,
  );

  const displayTypes =
    selectedType === "all" ? CLASS_TYPES : [selectedType as ClassType];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">All Classes</h1>
      <p className="mt-2 text-muted">
        Browse all uploaded classes grouped by type.
      </p>

      {loading && <p className="mt-8 text-sm text-muted">Loading classes…</p>}

      {/* Type filter tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedType === "all"
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {CLASS_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedType === type
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {capitalize(type)}
          </button>
        ))}
      </div>

      {/* Classes by type */}
      <div className="mt-8 space-y-10">
        {displayTypes.map((type) => {
          const classes = grouped[type];
          if (!classes || classes.length === 0) return null;
          return (
            <section key={type}>
              <h2 className="text-xl font-semibold capitalize mb-4">{type}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
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
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted">
                        {cls.duration_minutes} min
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/classes/${cls.id}`}
                          className="text-xs text-muted hover:text-foreground transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/classes/${cls.id}/edit`}
                          className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
