---
name: ShowUp Consistency System
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
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#632ecd'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d4ce7'
  on-tertiary-container: '#f6edff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
---

## Brand & Style
The design system embodies the disciplined precision of modern software engineering tools blended with the motivational momentum of elite habit-tracking platforms. Targeted at ambitious computer science students navigating placement prep, algorithms practice, and daily development routines, the visual tone eliminates cognitive clutter while instilling focus, momentum, and authority.

The aesthetic fuses modern technical minimalism with refined product craftsmanship:
- **Crisp Architecture:** Clear typographic hierarchies reminiscent of Notion combined with the micro-tactile surface polish and fluid efficiency of Linear.
- **Intelligent Feedback:** Visuals rely on precise data indicators, streak graphs, tabular metric alignment, and subtle status badges rather than aggressive gamification.
- **Tone:** Methodical, quiet, resilient, and forward-moving.

## Colors
The palette balances technical neutrality with targeted semantic signals, ensuring optimal contrast and hierarchy across day and night coding sessions.

### Color Tokens & Assignments

#### Light Mode
- **Canvas Base:** `#F8F9FA` (Subtle off-white background preventing eye strain)
- **Surface Level 1 (Cards, Modals):** `#FFFFFF` (Crisp white foreground elements)
- **Surface Level 2 (Nested elements, Inset track fields):** `#F1F5F9`
- **Surface Border:** `#E2E8F0` (Crisp micro-outlines)
- **Text Primary:** `#0F172A` (Deep slate charcoal)
- **Text Secondary:** `#64748B` (Muted technical slate)
- **Text Muted / Placeholder:** `#94A3B8`

#### Dark Mode
- **Canvas Base:** `#0B0F19` (Deep midnight navy/charcoal)
- **Surface Level 1:** `#151E2E` (Elevated slate base)
- **Surface Level 2:** `#1E293B` (Interactive cards and active containers)
- **Surface Border:** `#334155` (Soft highlight stroke)
- **Text Primary:** `#F8FAFC`
- **Text Secondary:** `#94A3B8`
- **Text Muted / Placeholder:** `#64748B`

#### Accents & Semantics (Shared)
- **Primary Electric Indigo:** `#2563EB` (Core action targets, active tabs, focus indicators)
- **Success Emerald:** `#10B981` (Completed runs, solved LeetCode challenges, active day streaks)
- **Attention Amber:** `#F59E0B` (Approaching deadlines, pending reviews, warm streaks)
- **Category Purple:** `#8B5CF6` (Core CS domains, System Design, OS architecture)

## Typography
Plus Jakarta Sans provides high clarity, crisp geometry, and friendly structural balance for headlines and body text. JetBrains Mono is leveraged strategically for metadata, algorithmic question IDs, tabular progress numbers, heat-map stats, and streak counts, creating an instant connection to code editors.

### Implementation Guidelines
- Use tabular figures (`font-variant-numeric: tabular-nums`) across all numeric readouts, completion counters, and streak counters to eliminate horizontal layout shifts during counter updates.
- Keep letter spacing slightly condensed on display titles (`-0.02em` to `-0.03em`) for a modern product finish.
- Set uppercase labels in `label-code-sm` with slight positive tracking (`0.02em`) for badges and category chips.

## Layout & Spacing
The layout relies on a mobile-first 4-column fluid layout that seamlessly expands into an 8-column layout on small tablets and foldable devices. 

- **Outer Margins:** Fixed `16px` on standard mobile viewports, transitioning to `24px` on screen widths exceeding `600px`.
- **Vertical Rhythm:** Rooted in an `8px` baseline grid system. Tight component metadata gaps use `4px` (`space-xs`), general card paddings use `16px` to `20px` (`space-md` to `space-lg`), and section gaps consistently occupy `24px` (`space-xl`).
- **Responsive Stacking:** Multi-metric summary bars render in a horizontal single-line row with horizontal drag-scroll on narrow viewports, transitioning to a strict 2-column or 4-column distribution on screens `> 480px`.

## Elevation & Depth
Depth is created via soft ambient shadows combined with structural low-contrast borders.

### Surface Strategy
- **Base Canvas:** Flat `#F8F9FA` (light) / `#0B0F19` (dark) with no shadow.
- **Card Surfaces:** Supported by micro-borders (`1px solid #E2E8F0` in light mode, `#334155` in dark mode) paired with an ultra-diffused shadow:
  `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 16px -4px rgba(15, 23, 42, 0.05);`
- **Active / Dragged Elements:** Elevated with increased diffusion:
  `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 12px 24px -4px rgba(15, 23, 42, 0.08);`
- **Dark Mode Differentiation:** In dark mode, shadows are suppressed in favor of ambient lighting tokens: inner highlight borders (`border-top: 1px solid rgba(255, 255, 255, 0.07)`) and stacked brightness surfaces (`#151E2E` into `#1E293B`).

## Shapes
Primary cards, interactive tiles, and modal views utilize a soft `16px` to `20px` radius (`rounded-lg` to `rounded-xl`). This curvature provides a tactile, modern mobile feel while remaining tight enough to respect the structure of code blocks and grid tables. 

- **Cards & Sheets:** `16px` (`rounded-lg`) standard, scaling to `20px` (`rounded-xl`) for full-width swipeable panels.
- **Input Controls & Buttons:** `10px` to `12px` for balanced touch targets.
- **Status Badges & Pill Chips:** Full pill radius (`9999px`) to visually differentiate quick status chips from actionable structural cards.

## Components

### Buttons
- **Primary:** Filled `#2563EB` background with white text, font size `14px` weight `600`, `12px` border radius, and `12px 20px` padding. Pressed state decreases opacity to `0.9` and scales slightly down (`0.98`).
- **Secondary / Subdued:** Ghost slate tone `#F1F5F9` background (light) or `#1E293B` (dark), with `#0F172A` / `#F8FAFC` text and a subtle border.
- **Destructive:** Soft crimson tint (`#FEE2E2` bg / `#DC2626` text) without full saturated fills to keep screen noise minimal.

### Habit & Streak Cards
- Pure white background (`#FFFFFF`) with `1px solid #E2E8F0` border and `16px` border radius.
- Padding is fixed at `16px`. Left side contains the goal taxonomy badge and title; right side anchors the completion toggle and tabular streak counter (`JetBrains Mono`).

### Badges & Category Chips
- Minimalist status tags using `4px 10px` padding, `9999px` radius, and `label-code-sm` typography.
- **Topic Badges (DSA, OS, SQL):** Accent background at `10%` opacity paired with full-strength text (e.g., `#8B5CF6` at 10% fill with `#7C3AED` text).

### Checkboxes & Day Toggles
- Custom `24x24px` rounded squares (`6px` border radius) with `1.5px` border.
- Unchecked: `#E2E8F0` border and transparent background.
- Checked: `#10B981` solid fill with a crisp white check vector, accompanied by a quick scale pop transition.

### Input Fields
- Inset field with `#F8F9FA` (light) or `#151E2E` (dark) background, `1px solid #E2E8F0` / `#334155` border, and `10px` border radius.
- Focused state features a crisp `2px` ring in `#2563EB` with zero offset.

### Streak / Heat-map Matrix
- Dynamic 7-day or 30-day mini-grid matrices. Each square is an `18x18px` cell with `4px` radius.
- Level 0 (inactive): `#F1F5F9` (light) / `#1E293B` (dark).
- Level 1-4 (intensity): Scales from `#A7F3D0` up to saturated `#10B981`.