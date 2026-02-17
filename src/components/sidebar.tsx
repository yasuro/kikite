"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  PlusCircle,
  FileDown,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/", label: "受注一覧", icon: ClipboardList },
  { href: "/orders/new", label: "新規受注", icon: PlusCircle },
  { href: "/csv-export", label: "CSV出力", icon: FileDown },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* モバイル: オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r shadow-sm transition-all duration-300 ease-in-out",
          isOpen ? "w-56 translate-x-0" : "w-14 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn(
          "flex flex-col h-full overflow-hidden",
          isOpen ? "w-56" : "w-0 lg:w-14"
        )}>
          {/* トグルボタン（デスクトップのみ） */}
          <div className="hidden lg:flex items-center justify-end px-2 py-3 border-b">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title={isOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 py-2 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "whitespace-nowrap overflow-hidden",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-600")} />
                  <span className={cn(
                    "transition-opacity duration-200",
                    isOpen ? "opacity-100" : "opacity-0 lg:opacity-0"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* バージョン表示（展開時のみ） */}
          {isOpen && (
            <div className="px-4 py-3 border-t text-xs text-gray-400">
              kikite v1.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
