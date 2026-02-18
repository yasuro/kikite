import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectCustomProps extends React.ComponentProps<"select"> {
  required?: boolean;
  hasValue?: boolean;
}

function SelectCustom({ className, required, hasValue, ...props }: SelectCustomProps) {
  // valueが存在するかチェック
  const checkHasValue = hasValue !== undefined ? hasValue : 
    (props.value !== undefined && props.value !== "" && props.value !== "なし") || 
    (props.defaultValue !== undefined && props.defaultValue !== "" && props.defaultValue !== "なし");

  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
        "transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
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

export { SelectCustom }