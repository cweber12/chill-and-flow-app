"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAllClasses,
  fetchAllSeries,
  fetchAllInstructors,
  fetchFollowedInstructorIds,
  enrollInClass,
  unenrollFromClass,
  enrollInSeries,
  unenrollFromSeries,
  fetchMyClassEnrollments,
  fetchMySeriesEnrollments,
} from "@/lib/supabase/queries";
import { CLASS_TYPES, DIFFICULTIES, capitalize } from "@/lib/constants";
import type {
  ClassDifficulty,
  ClassType,
  InstructorProfile,
  YogaClass,
  YogaSeries,
  ClassEnrollment,
  SeriesEnrollment,
} from "@/types";

const DURATION_RANGES = [
  { label: "All Durations", min: 0, max: Infinity },
  { label: "Under 30 min", min: 0, max: 29 },
  { label: "30-45 min", min: 30, max: 45 },
  { label: "45-60 min", min: 45, max: 60 },
  { label: "Over 60 min", min: 61, max: Infinity },
];

type Tab = "classes" | "series";

export default function BrowseClassesPage() {
  const [tab, setTab] = useState<Tab>("classes");
  const [allClasses, setAllClasses] = useState<YogaClass[]>([]);
  const [allSeries, setAllSeries] = useState<YogaSeries[]>([]);
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>(
    [],
  );
  const [seriesEnrollments, setSeriesEnrollments] = useState<
    SeriesEnrollment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClassType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<
    ClassDifficulty | "all"
  >("all");
  const [durationIndex, setDurationIndex] = useState(0);
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetchAllClasses(),
      fetchAllSeries(),
      fetchAllInstructors(),
      fetchFollowedInstructorIds(),
      fetchMyClassEnrollments(),
      fetchMySeriesEnrollments(),
    ])
      .then(([cResult, sResult, iResult, fResult, ceResult, seResult]) => {
        if (cResult.status === "fulfilled") setAllClasses(cResult.value);
        if (sResult.status === "fulfilled") setAllSeries(sResult.value);
        if (iResult.status === "fulfilled") setInstructors(iResult.value);
        if (fResult.status === "fulfilled") setFollowedIds(fResult.value);
        if (ceResult.status === "fulfilled")
          setClassEnrollments(ceResult.value);
        if (seResult.status === "fulfilled")
          setSeriesEnrollments(seResult.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const instructorMap = new Map(instructors.map((i) => [i.id, i]));
  const followedSet = new Set(followedIds);
  const enrolledClassIds = new Set(
    classEnrollments
      .filter((e) => e.status === "enrolled")
      .map((e) => e.class_id),
  );
  const enrolledSeriesIds = new Set(
    seriesEnrollments
      .filter((e) => e.status === "enrolled")
      .map((e) => e.series_id),
  );

  const locations = [
    ...new Set(allClasses.map((c) => c.location).filter(Boolean)),
  ].sort();

  const range = DURATION_RANGES[durationIndex];

  const filteredClasses = allClasses.filter((cls) => {
    const matchesSearch =
      !search ||
      cls.title.toLowerCase().includes(search.toLowerCase()) ||
      cls.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || cls.type === typeFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || cls.difficulty === difficultyFilter;
    const matchesDuration =
      cls.duration_minutes >= range.min && cls.duration_minutes <= range.max;
    const matchesInstructor =
      instructorFilter === "all" || cls.instructor_id === instructorFilter;
    const matchesLocation =
      locationFilter === "all" || cls.location === locationFilter;
    const matchesFollowed =
      !showFollowedOnly || followedSet.has(cls.instructor_id);
    return (
      matchesSearch &&
      matchesType &&
      matchesDifficulty &&
      matchesDuration &&
      matchesInstructor &&
      matchesLocation &&
      matchesFollowed
    );
  });

  const filteredSeries = allSeries.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesInstructor =
      instructorFilter === "all" || s.instructor_id === instructorFilter;
    const matchesFollowed =
      !showFollowedOnly || followedSet.has(s.instructor_id);
    return matchesSearch && matchesInstructor && matchesFollowed;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Browse</h1>
      <p className="mt-2 text-muted">
        Find the perfect class or series for your practice.
      </p>

      {loading && <p className="mt-8 text-sm text-muted">Loading…</p>}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-surface-hover p-1 w-fit">
        <button
          onClick={() => setTab("classes")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "classes"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          Classes
        </button>
        <button
          onClick={() => setTab("series")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "series"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          Series
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        {followedIds.length > 0 && (
          <button
            onClick={() => setShowFollowedOnly(!showFollowedOnly)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              showFollowedOnly
                ? "bg-accent text-white"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            Following Only
          </button>
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        {tab === "classes" && (
          <>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ClassType | "all")
              }
              aria-label="Filter by type"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Types</option>
              {CLASS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) =>
                setDifficultyFilter(e.target.value as ClassDifficulty | "all")
              }
              aria-label="Filter by difficulty"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Levels</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {capitalize(d)}
                </option>
              ))}
            </select>
            <select
              value={durationIndex}
              onChange={(e) => setDurationIndex(Number(e.target.value))}
              aria-label="Filter by duration"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {DURATION_RANGES.map((r, i) => (
                <option key={i} value={i}>
                  {r.label}
                </option>
              ))}
            </select>
            {locations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                aria-label="Filter by location"
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        {instructors.length > 0 && (
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            aria-label="Filter by instructor"
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="all">All Instructors</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results */}
      <div className="mt-8">
        {tab === "classes" ? (
          filteredClasses.length === 0 ? (
            <p className="text-center text-muted py-12">
              No classes match your filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <BrowseClassCard
                  key={cls.id}
                  yogaClass={cls}
                  instructorName={
                    instructorMap.get(cls.instructor_id)?.full_name
                  }
                  enrolled={enrolledClassIds.has(cls.id)}
                  onEnrollToggle={async () => {
                    if (enrolledClassIds.has(cls.id)) {
                      await unenrollFromClass(cls.id);
                      setClassEnrollments((prev) =>
                        prev.filter((e) => e.class_id !== cls.id),
                      );
                    } else {
                      await enrollInClass(cls.id);
                      setClassEnrollments((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          user_id: "",
                          class_id: cls.id,
                          status: "enrolled",
                          created_at: new Date().toISOString(),
                        },
                      ]);
                    }
                  }}
                />
              ))}
            </div>
          )
        ) : filteredSeries.length === 0 ? (
          <p className="text-center text-muted py-12">
            No series match your filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSeries.map((s) => (
              <BrowseSeriesCard
                key={s.id}
                series={s}
                instructorName={instructorMap.get(s.instructor_id)?.full_name}
                enrolled={enrolledSeriesIds.has(s.id)}
                onEnrollToggle={async () => {
                  if (enrolledSeriesIds.has(s.id)) {
                    await unenrollFromSeries(s.id);
                    setSeriesEnrollments((prev) =>
                      prev.filter((e) => e.series_id !== s.id),
                    );
                  } else {
                    await enrollInSeries(s.id);
                    setSeriesEnrollments((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        user_id: "",
                        series_id: s.id,
                        status: "enrolled",
                        created_at: new Date().toISOString(),
                      },
                    ]);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BrowseSeriesCard({
  series,
  instructorName,
  enrolled,
  onEnrollToggle,
}: {
  series: YogaSeries;
  instructorName?: string;
  enrolled: boolean;
  onEnrollToggle: () => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onEnrollToggle();
    } catch {
      // Revert will happen on next data load
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md">
      <Link href={`/series/${series.id}`}>
        {series.image_url && (
          <img
            src={series.image_url}
            alt={series.title}
            className="mb-3 h-32 w-full rounded-lg object-cover"
          />
        )}
        <h3 className="font-semibold">{series.title}</h3>
        <p className="mt-1 text-sm text-muted line-clamp-2">
          {series.description}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{series.classes.length} classes</span>
        <div className="flex items-center gap-2">
          {instructorName && <span>{instructorName}</span>}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              enrolled
                ? "bg-accent/10 text-accent"
                : "bg-accent text-white hover:bg-accent/80"
            }`}
          >
            {enrolled ? "Enrolled ✓" : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BrowseClassCard({
  yogaClass,
  instructorName,
  enrolled,
  onEnrollToggle,
}: {
  yogaClass: YogaClass;
  instructorName?: string;
  enrolled: boolean;
  onEnrollToggle: () => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onEnrollToggle();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md">
      <Link href={`/classes/${yogaClass.id}`}>
        {yogaClass.image_url && (
          <img
            src={yogaClass.image_url}
            alt={yogaClass.title}
            className="mb-3 h-32 w-full rounded-lg object-cover"
          />
        )}
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
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted">
            {yogaClass.duration_minutes} min
          </span>
          {instructorName && (
            <span className="text-xs text-muted">{instructorName}</span>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            enrolled
              ? "bg-accent/10 text-accent"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
        >
          {enrolled ? "Enrolled ✓" : "Enroll"}
        </button>
      </div>
    </div>
  );
}
