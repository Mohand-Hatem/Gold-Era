"use client"

import React, { forwardRef } from "react"

import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400 animate-in fade-in">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = "Input"
export default Input
