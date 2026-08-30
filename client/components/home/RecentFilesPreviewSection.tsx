import React from "react"
import Link from "next/link"
import { ArrowRight, MoreHorizontal, Image as ImageIcon, Folder } from "lucide-react"

const recentFiles = [
  {
    name: "Project_Proposal.pdf",
    owner: "You",
    modified: "May 14, 2024",
    size: "2.4 MB",
    type: "PDF",
    badgeClass: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/50",
    icon: (
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white font-bold text-[9px] shadow-2xs">
        PDF
      </div>
    ),
  },
  {
    name: "Website_Mockup.png",
    owner: "You",
    modified: "May 13, 2024",
    size: "1.8 MB",
    type: "Image",
    badgeClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/70 dark:border-purple-900/50",
    icon: (
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-white shadow-2xs">
        <ImageIcon className="h-3.5 w-3.5" />
      </div>
    ),
  },
  {
    name: "Team_Notes.docx",
    owner: "You",
    modified: "May 12, 2024",
    size: "1.2 MB",
    type: "Document",
    badgeClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50",
    icon: (
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-[10px] shadow-2xs">
        W
      </div>
    ),
  },
  {
    name: "Budget_2024.xlsx",
    owner: "You",
    modified: "May 11, 2024",
    size: "980 KB",
    type: "Spreadsheet",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50",
    icon: (
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-[10px] shadow-2xs">
        X
      </div>
    ),
  },
  {
    name: "Marketing Assets",
    owner: "You",
    modified: "May 10, 2024",
    size: "-",
    type: "Folder",
    badgeClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50",
    icon: (
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400 text-white shadow-2xs">
        <Folder className="h-3.5 w-3.5 fill-current" />
      </div>
    ),
  },
]

export const RecentFilesPreviewSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Files</h2>
          <Link
            href="/register"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 font-semibold">Name</th>
                <th className="py-3 px-3 font-semibold">Owner</th>
                <th className="py-3 px-3 font-semibold">Last Modified</th>
                <th className="py-3 px-3 font-semibold">Size</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentFiles.map((file) => (
                <tr
                  key={file.name}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    {file.icon}
                    <span className="truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">{file.owner}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs font-mono">{file.modified}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs font-mono">{file.size}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${file.badgeClass}`}
                    >
                      {file.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 dark:text-slate-500">
                    <button
                      type="button"
                      className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                      aria-label="Options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
