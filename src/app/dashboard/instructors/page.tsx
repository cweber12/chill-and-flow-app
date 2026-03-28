"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAllInstructors,
  fetchFollowedInstructorIds,
  followInstructor,
  unfollowInstructor,
} from "@/lib/supabase/queries";
import type { InstructorProfile } from "@/types";

export default function InstructorSearchPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.allSettled([fetchAllInstructors(), fetchFollowedInstructorIds()])
      .then(([iResult, fResult]) => {
        if (iResult.status === "fulfilled") setInstructors(iResult.value);
        if (fResult.status === "fulfilled")
          setFollowedIds(new Set(fResult.value));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFollow = async (id: string) => {
    const isFollowed = followedIds.has(id);
    // Optimistic update
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isFollowed) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (isFollowed) await unfollowInstructor(id);
      else await followInstructor(id);
    } catch {
      // Revert on error
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isFollowed) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const filtered = instructors.filter((inst) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inst.full_name.toLowerCase().includes(q) ||
      inst.location.toLowerCase().includes(q) ||
      inst.bio.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
      <p className="mt-2 text-muted">
        Find an instructor that matches your practice.
      </p>

      {loading && (
        <p className="mt-8 text-sm text-muted">Loading instructors…</p>
      )}

      <div className="mt-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, location, or specialty..."
          className="w-full max-w-md rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((inst) => {
          const isFollowed = followedIds.has(inst.id);
          return (
            <div
              key={inst.id}
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
            >
              <Link href={`/instructors/${inst.id}`}>
                {inst.photos.length > 0 && (
                  <img
                    src={inst.photos[0]}
                    alt={inst.full_name}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="font-semibold group-hover:text-accent transition-colors">
                  {inst.full_name}
                </h3>
                {inst.location && (
                  <p className="mt-0.5 text-xs text-muted">
                    📍 {inst.location}
                  </p>
                )}
                {inst.bio && (
                  <p className="mt-2 text-sm text-muted line-clamp-3">
                    {inst.bio}
                  </p>
                )}
              </Link>
              <button
                onClick={() => handleToggleFollow(inst.id)}
                className={`mt-3 w-full rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                  isFollowed
                    ? "bg-accent/10 text-accent hover:bg-red-50 hover:text-red-600"
                    : "bg-accent text-white hover:bg-accent/80"
                }`}
              >
                {isFollowed ? "Following ✓" : "Follow"}
              </button>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-center text-muted py-12">
            No instructors found.
          </p>
        )}
      </div>
    </div>
  );
}
