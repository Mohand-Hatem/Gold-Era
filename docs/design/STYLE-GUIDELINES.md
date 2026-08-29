## Brand & Style
The design system focuses on **Minimalism** and **Productive Professionalism**. The intent is to provide a neutral, high-fidelity canvas that disappears, allowing the user's documents and data to take center stage. 

The aesthetic is characterized by:
- **Clarity over Decoration:** Every line and margin serves a functional purpose.
- **Trusted Utility:** A feeling of digital permanence and security through structured alignment and deliberate whitespace.
- **Density Balance:** High information density for data-heavy views (tables/lists) offset by generous outer margins to prevent cognitive overload.

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
