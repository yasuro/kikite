"use client";

import { AppShellClient } from "@/components/app-shell-client";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellClient>{children}</AppShellClient>;
}