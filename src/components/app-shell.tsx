"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "sidebar-open";

export function AppShell({ userName, userEmail, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // ローカルストレージから状態を復元
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      setSidebarOpen(saved === "true");
    }
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
  };

  // 初回レンダリング時のフラッシュ防止
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 border-b bg-white">
          <div className="px-4 h-14 flex items-center">
            <span className="font-bold text-lg text-gray-900">受注管理</span>
          </div>
        </header>
        <div className="flex">
          <div className="w-56 border-r bg-white hidden lg:block" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={userName}
        userEmail={userEmail}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={handleToggle}
      />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={handleToggle} />
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-300",
            "p-4 sm:p-6",
            sidebarOpen ? "lg:ml-0" : "lg:ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
