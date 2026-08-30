"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Read stored preference
    const stored = localStorage.getItem("filox_theme") as Theme | null
    if (stored === "dark" || stored === "light" || stored === "system") {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      let isDark = false

      if (theme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      } else {
        isDark = theme === "dark"
      }

      if (isDark) {
        root.classList.add("dark")
        setResolvedTheme("dark")
      } else {
        root.classList.remove("dark")
        setResolvedTheme("light")
      }
    }

    applyTheme()

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const listener = () => applyTheme()
      mediaQuery.addEventListener("change", listener)
      return () => mediaQuery.removeEventListener("change", listener)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("filox_theme", newTheme)
  }

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export default ThemeProvider
