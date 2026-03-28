"use client";

import { Navbar } from "@/components/navbar";

export function NavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
