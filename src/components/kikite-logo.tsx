import { cn } from "@/lib/utils";

interface KikiteLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "h-6 w-6", text: "text-sm", gap: "gap-1.5" },
  md: { icon: "h-8 w-8", text: "text-base", gap: "gap-2" },
  lg: { icon: "h-10 w-10", text: "text-xl", gap: "gap-2.5" },
  xl: { icon: "h-14 w-14", text: "text-3xl", gap: "gap-3" },
};

export function KikiteLogo({ size = "md", showText = true, className }: KikiteLogoProps) {
  const s = sizeMap[size];

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <KikiteIcon className={s.icon} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-gray-800", s.text)}>
          kikite
        </span>
      )}
    </span>
  );
}

export function KikiteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景: 角丸グラデーション */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="url(#kikite-grad)"
      />

      {/* 受話器シルエット（聞き手 = 電話を聞く） */}
      <path
        d="M13.5 14.5c0-1.1.9-2 2-2h1c.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1h-.5c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5h.5c.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1h-1c-1.1 0-2-.9-2-2v-11z"
        fill="white"
        opacity="0.95"
      />

      {/* 音波1（近い） */}
      <path
        d="M21.5 16c1.2 1.2 1.8 2.7 1.8 4.5s-.6 3.3-1.8 4.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 音波2（遠い） */}
      <path
        d="M25 13.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />

      <defs>
        <linearGradient id="kikite-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
