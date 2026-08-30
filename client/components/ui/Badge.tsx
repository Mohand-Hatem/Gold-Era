import React from "react"

import { cn } from "../../lib/utils"

export type BadgeVariant =
  | "default"
  | "brand"
  | "outline"
  | "pdf"
  | "doc"
  | "img"
  | "sheet"
  | "other"
  | "success"
  | "danger"
  | "warning"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    brand: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
    pdf: "bg-red-50 text-red-700 border-red-200 font-semibold",
    doc: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
    img: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
    sheet: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    other: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Helper component rendering the right badge for a file's category or extension.
 */
export function FileTypeBadge({ category, extension }: { category: string; extension?: string }) {
  const normalizedCategory = category.toUpperCase()
  const label = extension ? extension.toUpperCase() : normalizedCategory

  switch (normalizedCategory) {
    case "DOCUMENT":
      if (extension?.toLowerCase() === "pdf") {
        return <Badge variant="pdf">PDF</Badge>
      }
      return <Badge variant="doc">{label || "DOC"}</Badge>
    case "IMAGE":
      return <Badge variant="img">{label || "IMG"}</Badge>
    case "TEXT":
      return <Badge variant="sheet">{label || "TEXT"}</Badge>
    default:
      return <Badge variant="other">{label || "FILE"}</Badge>
  }
}

export default Badge
