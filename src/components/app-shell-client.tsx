"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { getLazySupabaseClient } from "@/lib/supabase/lazy-client";
import { useRouter } from "next/navigation";

interface AppShellClientProps {
  children: React.ReactNode;
}

export function AppShellClient({ children }: AppShellClientProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("ユーザー");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getLazySupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "ユーザー"
      );
      setUserEmail(user.email || "");
      setLoading(false);
    };

    checkAuth();

    // リアルタイム認証状態の監視
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push("/login");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        sidebarOpen={isOpen}
        onSidebarToggle={() => setIsOpen(!isOpen)}
        userName={userName}
        userEmail={userEmail}
      />
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <main className={`p-4 mt-16 md:p-6 transition-all duration-300 ${
        isOpen ? 'ml-56' : 'ml-14'
      }`}>
        {children}
      </main>
    </div>
  );
}