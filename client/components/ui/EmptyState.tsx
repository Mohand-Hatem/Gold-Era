import React from "react"
import { FolderOpen } from "lucide-react"

import { cn } from "../../lib/utils"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 bg-white/50",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
        {icon || <FolderOpen className="h-7 w-7" />}
      </div>
      <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="max-w-sm text-sm text-slate-500 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  )
}

export default EmptyState
