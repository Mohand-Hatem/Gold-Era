---
name: Structure & Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  h1-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system focuses on **Minimalism** and **Productive Professionalism**. The intent is to provide a neutral, high-fidelity canvas that disappears, allowing the user's documents and data to take center stage. 

The aesthetic is characterized by:
- **Clarity over Decoration:** Every line and margin serves a functional purpose.
- **Trusted Utility:** A feeling of digital permanence and security through structured alignment and deliberate whitespace.
- **Density Balance:** High information density for data-heavy views (tables/lists) offset by generous outer margins to prevent cognitive overload.

## Colors
The palette is built on a foundation of deep neutrals and a functional "Action Blue." 

- **Primary (#0F172A):** Used for high-level navigation, text, and primary headings to establish authority.
- **Brand/Action (#2563EB):** Reserved for primary buttons, active states, and interactive indicators.
- **Surface Tones:** Use a refined gray scale (Slate) for borders and backgrounds. 
  - `bg-main`: #FFFFFF
  - `bg-subtle`: #F8FAFC
  - `border-subtle`: #E2E8F0
  - `border-strong`: #CBD5E1

**Accessibility:** All text-on-background combinations must maintain a minimum contrast ratio of 4.5:1 (WCAG AA). Action states use a darker shade on hover to ensure intent is clear.

## Typography
This design system utilizes a dual-sans approach. **Hanken Grotesk** provides a modern, sharp personality for headlines, while **Inter** ensures maximum legibility for document names and metadata. **JetBrains Mono** is used sparingly for technical metadata like file sizes, timestamps, and checksums to provide a subtle "data-driven" feel.

- **Scale:** Use the 14px `body-md` as the standard for file lists and tables to maximize density without sacrificing readability.
- **Weight:** Use Semibold (600) for interactive labels and Medium (500) for secondary metadata.

## Layout & Spacing
The system is built on a strict **8pt grid**. All margins, paddings, and height increments must be multiples of 8 (or 4 for micro-adjustments).

- **Grid Model:** 12-column fluid grid for desktop with 24px gutters.
- **Sidebar:** Fixed at 280px for desktop, collapsible to 64px (icon only) or hidden on mobile with a hamburger trigger.
- **Density:** 
  - **Default:** 12px vertical padding on table rows.
  - **Compact:** 8px vertical padding for high-volume file explorers.
- **Responsive:** Transition to a single-column layout at 768px. In mobile views, horizontal padding for the main container reduces to 16px.

## Elevation & Depth
Depth is conveyed primarily through **Tonal Layers** rather than heavy shadows. 

- **Level 0 (Base):** #F8FAFC (App background).
- **Level 1 (Cards/Surface):** #FFFFFF with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Popovers/Modals):** #FFFFFF with a subtle ambient shadow (0px 10px 15px -3px rgba(0,0,0,0.05)) and a 1px border.
- **Active State:** Use a 2px "Focus Ring" (#2563EB with 20% opacity) for keyboard navigation and active input states. 

Avoid depth for purely aesthetic reasons; elevation must indicate interactivity or a change in the z-axis (e.g., a file being dragged or a modal window).

## Shapes
The shape language is **Soft (0.25rem)** to maintain a professional, slightly technical feel. 

- **Standard Buttons/Inputs:** 4px (0.25rem) radius.
- **Cards/Containers:** 8px (0.5rem) radius.
- **Selection Overlays:** 4px radius for file row hover states.
- **Badges/Chips:** Full pill (999px) to contrast against the predominantly rectangular grid of the file explorer.

## Components

### Buttons
- **Primary:** Background #0F172A, Text #FFFFFF. Flat, no gradient.
- **Secondary:** Background #FFFFFF, Border #E2E8F0, Text #0F172A.
- **Ghost:** No background or border. Text #64748B. Used for secondary actions in a row.

### File Rows & Lists
- **Structure:** [Icon] [Filename] [Owner] [Last Modified] [Size] [Actions].
- **Hover State:** Apply a background of #F1F5F9.
- **Selected State:** Apply a background of #EFF6FF and a left-accent border of 3px #2563EB.

### File-Type Visual Language
Use a consistent icon set with semantic color coding:
- **PDF:** Red (#EF4444) icon or accent.
- **Sheets/XLSX:** Green (#10B981) icon or accent.
- **Docs/DOCX:** Blue (#3B82F6) icon or accent.
- **Images:** Purple (#8B5CF6).
- **Folders:** Amber (#F59E0B) for high visibility.

### Upload Zones
- **Idle:** Dashed border (2px, #CBD5E1), light gray background.
- **Active (Drag Over):** Blue border (#2563EB), light blue background (#EFF6FF).

### Progress Bars
- **Height:** 4px or 8px.
- **Track:** #E2E8F0.
- **Indicator:** #2563EB. Use a pulsing animation for indeterminate states.

### Data Tables
- **Header:** Sticky, #F8FAFC background, uppercase `label-caps` typography, 1px bottom border.
- **Cells:** 14px `body-md` text. Vertically centered content.
