import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  required?: boolean;
  hasValue?: boolean;
}

function Input({ className, type, required, hasValue, ...props }: InputProps) {
  // valueが存在するかチェック（制御コンポーネントと非制御コンポーネント両方に対応）
  const checkHasValue = hasValue !== undefined ? hasValue : 
    (props.value !== undefined && props.value !== "") || 
    (props.defaultValue !== undefined && props.defaultValue !== "");

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // 必須項目で未入力の場合は薄い赤枠
        required && !checkHasValue && "border-red-300 bg-red-50/30",
        // 入力済みの場合は薄い緑枠
        checkHasValue && "border-green-300 bg-green-50/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
