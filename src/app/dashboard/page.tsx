"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
  fetchAllClasses,
  fetchAllSeries,
  fetchMyClassEnrollments,
  fetchMySeriesEnrollments,
} from "@/lib/supabase/queries";
import type {
  YogaClass,
  YogaSeries,
  ClassEnrollment,
  SeriesEnrollment,
} from "@/types";

type MainTab = "classes" | "series";
type SubTab = "enrolled" | "history";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>("classes");
  const [subTab, setSubTab] = useState<SubTab>("enrolled");
  const [allClasses, setAllClasses] = useState<YogaClass[]>([]);
  const [allSeries, setAllSeries] = useState<YogaSeries[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>(
    [],
  );
  const [seriesEnrollments, setSeriesEnrollments] = useState<
    SeriesEnrollment[]
  >([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetchAllClasses(),
      fetchAllSeries(),
      fetchMyClassEnrollments(),
      fetchMySeriesEnrollments(),
    ])
      .then(([cResult, sResult, ceResult, seResult]) => {
        if (cResult.status === "fulfilled") setAllClasses(cResult.value);
        if (sResult.status === "fulfilled") setAllSeries(sResult.value);
        if (ceResult.status === "fulfilled")
          setClassEnrollments(ceResult.value);
        if (seResult.status === "fulfilled")
          setSeriesEnrollments(seResult.value);
      })
      .finally(() => setDataLoading(false));
  }, []);

  const classMap = new Map(allClasses.map((c) => [c.id, c]));
  const seriesMap = new Map(allSeries.map((s) => [s.id, s]));

  const enrolledClasses = classEnrollments
    .filter((e) => e.status === "enrolled")
    .map((e) => ({ enrollment: e, item: classMap.get(e.class_id) }))
    .filter((e) => e.item);

  const historyClasses = classEnrollments
    .filter((e) => e.status === "completed")
    .map((e) => ({ enrollment: e, item: classMap.get(e.class_id) }))
    .filter((e) => e.item);

  const enrolledSeries = seriesEnrollments
    .filter((e) => e.status === "enrolled")
    .map((e) => ({ enrollment: e, item: seriesMap.get(e.series_id) }))
    .filter((e) => e.item);

  const historySeries = seriesEnrollments
    .filter((e) => e.status === "completed")
    .map((e) => ({ enrollment: e, item: seriesMap.get(e.series_id) }))
    .filter((e) => e.item);

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
        Your enrolled classes, series, and practice history.
      </p>

      {/* Main Tabs: Classes | Series */}
      <div className="mt-8 flex gap-1 rounded-lg bg-surface-hover p-1 w-fit">
        {(["classes", "series"] as MainTab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setMainTab(t);
              setSubTab("enrolled");
            }}
            className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
              mainTab === t
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t === "classes" ? "Classes" : "Series"}
          </button>
        ))}
      </div>

      {/* Sub Tabs: Enrolled | History */}
      <div className="mt-4 flex gap-4 border-b border-border">
        {(["enrolled", "history"] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`pb-2 text-sm font-medium transition-colors ${
              subTab === t
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t === "enrolled" ? "Enrolled" : "History"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : mainTab === "classes" ? (
          subTab === "enrolled" ? (
            enrolledClasses.length === 0 ? (
              <EmptyState message="You haven't enrolled in any classes yet." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledClasses.map(({ enrollment, item }) => (
                  <ClassCard key={enrollment.id} yogaClass={item!} />
                ))}
              </div>
            )
          ) : historyClasses.length === 0 ? (
            <EmptyState message="You haven't completed any classes yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {historyClasses.map(({ enrollment, item }) => (
                <ClassCard key={enrollment.id} yogaClass={item!} completed />
              ))}
            </div>
          )
        ) : subTab === "enrolled" ? (
          enrolledSeries.length === 0 ? (
            <EmptyState message="You haven't enrolled in any series yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledSeries.map(({ enrollment, item }) => (
                <SeriesCard key={enrollment.id} series={item!} />
              ))}
            </div>
          )
        ) : historySeries.length === 0 ? (
          <EmptyState message="You haven't completed any series yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {historySeries.map(({ enrollment, item }) => (
              <SeriesCard key={enrollment.id} series={item!} completed />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <p className="text-muted">{message}</p>
      <Link
        href="/dashboard/browse"
        className="mt-3 inline-block text-sm text-accent hover:underline"
      >
        Browse classes & series →
      </Link>
    </div>
  );
}

function ClassCard({
  yogaClass,
  completed,
}: {
  yogaClass: YogaClass;
  completed?: boolean;
}) {
  return (
    <Link
      href={`/classes/${yogaClass.id}`}
      className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
    >
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
        {completed && (
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Completed ✓
          </span>
        )}
      </div>
      <h3 className="font-semibold">{yogaClass.title}</h3>
      <p className="mt-1 text-sm text-muted line-clamp-2">
        {yogaClass.description}
      </p>
      <p className="mt-3 text-xs text-muted">
        {yogaClass.duration_minutes} min
      </p>
    </Link>
  );
}

function SeriesCard({
  series,
  completed,
}: {
  series: YogaSeries;
  completed?: boolean;
}) {
  return (
    <Link
      href={`/series/${series.id}`}
      className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
    >
      {series.image_url && (
        <img
          src={series.image_url}
          alt={series.title}
          className="mb-3 h-32 w-full rounded-lg object-cover"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        {completed && (
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Completed ✓
          </span>
        )}
      </div>
      <h3 className="font-semibold">{series.title}</h3>
      <p className="mt-1 text-sm text-muted line-clamp-2">
        {series.description}
      </p>
      <p className="mt-3 text-xs text-muted">{series.classes.length} classes</p>
    </Link>
  );
}
