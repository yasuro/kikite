"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DatePickerSimpleProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DatePickerSimple({
  value,
  onChange,
  placeholder = "日付を選択",
  className,
  disabled = false,
  required = false,
}: DatePickerSimpleProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(
    value || new Date()
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  // クリックアウトで閉じる
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();

  const days = [];
  const previousMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
  
  // 前月の日付
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, previousMonthEnd.getDate() - i));
  }
  
  // 当月の日付
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }
  
  // 次月の日付（6週分になるように）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i));
  }

  const handleSelect = (date: Date) => {
    // ローカル日付として正しく扱うため、時刻を正午に設定
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    onChange?.(localDate);
    setIsOpen(false);
  };

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return value?.toDateString() === date.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "yyyy年MM月dd日", { locale: ja }) : <span>{placeholder}</span>}
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-auto rounded-md border bg-white p-3 shadow-lg">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-semibold text-sm">
              {format(currentMonth, "yyyy年 M月", { locale: ja })}
            </div>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 曜日 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
              <div
                key={day}
                className={cn(
                  "text-xs font-medium text-center py-1.5",
                  i === 0 && "text-red-500",
                  i === 6 && "text-blue-500"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              const dayOfWeek = date.getDay();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(date)}
                  disabled={!isCurrentMonth(date)}
                  className={cn(
                    "h-9 w-9 text-sm rounded-lg transition-all",
                    "hover:bg-gray-100 hover:scale-105",
                    "flex items-center justify-center",
                    isCurrentMonth(date) 
                      ? "text-gray-900 font-medium" 
                      : "text-gray-300 cursor-not-allowed",
                    isToday(date) && "bg-blue-50 text-blue-600 font-bold",
                    isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary/90",
                    dayOfWeek === 0 && isCurrentMonth(date) && "text-red-500",
                    dayOfWeek === 6 && isCurrentMonth(date) && "text-blue-500",
                    isSelected(date) && "text-white"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* フッター */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
                onChange?.(localToday);
                setIsOpen(false);
              }}
              className="flex-1"
            >
              今日
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined);
                setIsOpen(false);
              }}
              className="flex-1"
            >
              クリア
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}