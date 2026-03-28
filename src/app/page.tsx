"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/auth-form";

export default function Home() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace(role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, role, loading, router]);

  if (loading || user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      {/* Gradient header */}
      <div
        className="w-full py-16 text-center text-white"
        style={{ background: "var(--ocean-gradient)" }}
      >
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Chill <span className="opacity-80">&</span> Flow
        </h1>
        <p className="mt-4 text-lg opacity-90">
          Find your calm. Flow with intention.
        </p>
      </div>

      <main className="flex flex-1 w-full max-w-4xl flex-col items-center gap-8 px-6 py-12">
        <p className="text-muted text-center max-w-md">
          Sign in to access your yoga practice, or create an account to get
          started.
        </p>
        <AuthForm
          onSuccess={() => {
            router.refresh();
          }}
        />
      </main>

      <footer className="w-full border-t border-border py-6 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} Chill & Flow. All rights reserved.
      </footer>
    </div>
  );
}
