import React from "react"

const categories = [
  {
    name: "Documents",
    desc: "Work files & reports",
    count: "PDF, DOCX, TXT",
    icon: (
      <svg className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    ),
  },
  {
    name: "Images",
    desc: "Photos & graphics",
    count: "PNG, JPG, WebP",
    icon: (
      <svg className="h-6 w-6 text-purple-500 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
  {
    name: "Videos",
    desc: "Media files",
    count: "MP4, MOV, MKV",
    icon: (
      <svg className="h-6 w-6 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    name: "Audio",
    desc: "Music & recordings",
    count: "MP3, WAV, FLAC",
    icon: (
      <svg className="h-6 w-6 text-sky-500 dark:text-sky-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    name: "Archives",
    desc: "ZIP, RAR & more",
    count: "ZIP, TAR, GZ",
    icon: (
      <svg className="h-6 w-6 text-amber-500 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v4" />
        <path d="M14 2v4" />
        <path d="M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M10 10v4" />
        <path d="M14 10v4" />
        <path d="M10 14h4" />
      </svg>
    ),
  },
]

export const CategorySection = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
          Keep Everything Organized
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
          Upload, manage and access all your files in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F0F5FD] dark:bg-slate-900 hover:bg-[#E5EFFC] dark:hover:bg-slate-800/90 border border-transparent hover:border-blue-200/80 dark:hover:border-blue-900/60 transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-2xs mb-3.5 transition-transform duration-300 group-hover:scale-105">
              {cat.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{cat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
