"use client";

import { NavbarLayout } from "@/components/ui/navbar-layout";

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NavbarLayout>{children}</NavbarLayout>;
}
