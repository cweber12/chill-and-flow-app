"use client";

import { NavbarLayout } from "@/components/ui/navbar-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NavbarLayout>{children}</NavbarLayout>;
}
