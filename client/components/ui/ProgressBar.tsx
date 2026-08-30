import React from "react"

import { cn } from "../../lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number // 0 to 100
  indeterminate?: boolean
  variant?: "brand" | "success" | "danger" | "warning"
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({
  value = 0,
  indeterminate = false,
  variant = "brand",
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  const variantClasses = {
    brand: "bg-blue-600",
    success: "bg-emerald-600",
    danger: "bg-red-600",
    warning: "bg-amber-500",
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          variantClasses[variant],
          indeterminate && "w-1/3 animate-[indeterminate_1.5s_infinite_linear]",
        )}
        style={indeterminate ? undefined : { width: `${clampedValue}%` }}
      />
    </div>
  )
}

export default ProgressBar
