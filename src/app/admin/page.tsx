"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

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
        Welcome back
        {user?.user_metadata?.full_name
          ? `, ${user.user_metadata.full_name}`
          : ""}
      </h1>
      <p className="mt-2 text-muted">
        Manage your yoga classes, series, and video content.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/admin/classes"
          title="All Classes"
          description="View all uploaded classes grouped by type."
          icon="📋"
        />
        <DashboardCard
          href="/admin/series"
          title="All Series"
          description="View all series ordered by date created."
          icon="📚"
        />
        <DashboardCard
          href="/admin/profile"
          title="My Profile"
          description="Update your bio, location, and photos for students."
          icon="👤"
        />
        <DashboardCard
          href="/admin/create-class"
          title="Create Class"
          description="Design a new yoga class with details and settings."
          icon="✦"
        />
        <DashboardCard
          href="/admin/create-series"
          title="Create Series"
          description="Group classes into a progressive series."
          icon="☰"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-md"
    >
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  );
}
