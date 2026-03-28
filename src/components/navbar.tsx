"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, role, loading, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  const isAdmin = role === "admin";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href={user ? (isAdmin ? "/admin" : "/dashboard") : "/"}
          className="text-lg font-semibold tracking-tight"
        >
          Chill <span className="text-accent">&</span> Flow
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {isAdmin ? (
              <>
                <NavLink href="/admin" current={pathname}>
                  Dashboard
                </NavLink>
                <NavDropdown
                  label="Classes"
                  current={pathname}
                  items={[
                    { label: "View All", href: "/admin/classes" },
                    { label: "Create New", href: "/admin/create-class" },
                  ]}
                />
                <NavDropdown
                  label="Series"
                  current={pathname}
                  items={[
                    { label: "View All", href: "/admin/series" },
                    { label: "Create New", href: "/admin/create-series" },
                  ]}
                />
                <NavLink href="/admin/profile" current={pathname}>
                  Profile
                </NavLink>
              </>
            ) : (
              <>
                <NavLink href="/dashboard" current={pathname}>
                  My Classes
                </NavLink>
                <NavLink href="/dashboard/browse" current={pathname}>
                  Browse
                </NavLink>
                <NavLink href="/dashboard/instructors" current={pathname}>
                  Instructors
                </NavLink>
                <NavLink href="/dashboard/profile" current={pathname}>
                  Profile
                </NavLink>
              </>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: string;
  children: React.ReactNode;
}) {
  const isActive = current === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive ? "text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function NavDropdown({
  label,
  current,
  items,
}: {
  label: string;
  current: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = items.some((item) => current.startsWith(item.href));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isActive ? "text-accent" : "text-muted hover:text-foreground"
        }`}
      >
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[140px] rounded-lg border border-border bg-surface shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-accent/10 ${
                current === item.href
                  ? "text-accent font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
