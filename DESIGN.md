# Design System & UI/UX Specification — Expense Tracker

**Product:** Next.js Personal Expense & Wealth Management Platform  
**Design Theme:** Dark Mode ("Midnight Ledger")  
**Design Philosophy:** Data-first, high information density, calm typography, and privacy-first AI narration.

---

## 1. Core Design Principles

1. **Truth & Precision Before Garnish**  
   Every metric, chart node, and AI observation maps directly to verifiable transactional numbers. The user interface emphasizes accurate figures, clear currency formatting (defaulting to ISO currency codes with tabular figures), and immediate access to underlying records.

2. **Visual Separation Between App Data & AI Narration**  
   Deterministic calculations (budgets, totals, cash-flow metrics, safe-to-spend) represent authoritative app state. AI output is visually framed as an interactive narrative layer (glowing cyan highlights `#00DCE5`) layered over the base data.

3. **Privacy by Visible Design**  
   AI surfaces prominently display privacy guarantees (summary-only data transmission, zero raw transaction text/merchant leakage), giving users full control and confidence over their financial information.

4. **Speed, Ergonomics & Keyboard Accessibility**  
   Desktop and power-user ergonomics are built-in with quick navigation shortcuts, command palettes (`Cmd/Ctrl + K`), keyboard-navigable forms, and instant optimistic updates backed by Redis caching.

---

## 2. Visual Direction & Design Tokens

### 2.1 Theme & Aesthetics
- **Aesthetic:** "Midnight Ledger" — structured, high-contrast dark palette with deep obsidian surfaces, subtle hairline borders, and cyan/emerald data accents.
- **Lighting:** Minimalistic glow effects reserved strictly for AI narration, focus rings, and active state highlights.

### 2.2 Color System

| Token Name | Hex / Value | Semantic Role |
|---|---|---|
| `bg-base` | `#000000` | App root canvas / window background |
| `bg-surface` | `#111318` | Standard container cards, sidebars, headers |
| `bg-surface-2` | `#161B22` | Elevated cards, hover states, active menu items |
| `bg-surface-3` | `#21262D` | Modals, floating dropdowns, popovers |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard card and table row separators |
| `border-hover` | `rgba(255, 255, 255, 0.16)` | Interactive hover borders |
| `text-primary` | `#F5F7FA` | Primary headlines, metric values, table headers |
| `text-secondary` | `#9AA3AF` | Supporting body copy, field labels, metadata |
| `text-tertiary` | `#5B6472` | Disabled states, timestamps, placeholder text |
| `primary` | `#00DCE5` | Primary CTA, AI accent, active selection |
| `primary-muted` | `rgba(0, 220, 229, 0.12)` | Pill badges, selected filter tags, active glow |
| `success` | `#22C55E` | Income indicators, positive balance, goal completion |
| `danger` | `#F04438` | Expense indicators, budget deficits, destructive actions |
| `warning` | `#F5A623` | Budget threshold alerts, anomaly warnings |

### 2.3 Typography

- **Primary Font Family:** `Manrope`, system-ui, sans-serif
- **Tabular Numerics:** Applied globally to amounts, metrics, and KPI readouts (`font-variant-numeric: tabular-nums`) to ensure strict columnar alignment.

| Style | Size | Weight | Line Height | Application |
|---|---|---|---|---|
| **Display** | 2.00rem (32px) | 700 | 1.15 | Hero headings, top-level dashboard numbers |
| **Heading 1** | 1.50rem (24px) | 700 | 1.20 | Section headers, modal titles |
| **Heading 2** | 1.125rem (18px) | 600 | 1.25 | Card headers, table section titles |
| **Body Large** | 1.00rem (16px) | 450 / 500 | 1.50 | AI responses, long-form insights |
| **Body Regular**| 0.875rem (14px) | 400 / 500 | 1.55 | Table items, form labels, general UI text |
| **Caption** | 0.75rem (12px) | 500 / 600 | 1.40 | Timestamps, category pills, secondary meta |
| **Micro** | 0.6875rem (11px)| 600 | 1.30 | Compact badges, table sub-indicators |

### 2.4 Spacing & Border Radii

- **Grid Base:** 4px incremental scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px).
- **Corner Radii:**
  - `sm` (8px): Form inputs, filter pills, small badges.
  - `md` (12px): Standard cards, list items, alert boxes.
  - `lg` (16px): Modals, floating sheets, AI response panels.
  - `pill` (999px): Category badges, status indicators.

---

## 3. Layout & Navigation Hierarchy

### 3.1 App Shell Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (Logo, Command Palette Shortcut, Currency, User Profile) │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ Sidebar       │ Main Content Viewport                                       │
│ ───────────── │ ─────────────────────────────────────────────────────────── │
│ • Dashboard   │ Dynamic page content with sticky headers                    │
│ • Records     │                                                             │
│ • Budgets     │                                                             │
│ • Goals       │                                                             │
│ • Recurring   │                                                             │
│ • Reports     │                                                             │
│ • Categories  │                                                             │
│ • AI Insights │                                                             │
│ • Settings    │                                                             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Breakpoints
- **Mobile (< 640px):** Single-column layout, bottom tab navigation bar, sliding bottom sheets for transaction forms.
- **Tablet (640px – 1024px):** Collapsible slim sidebar, two-column card grids.
- **Desktop (> 1024px):** Fixed left navigation rail (240px), multi-column analytical grids, dense data tables.

---

## 4. Screen-by-Screen Specifications

### 4.1 Dashboard (`/dashboard`)
- **Key Performance Indicators:** Net Balance, Total Monthly Income, Total Monthly Spending, and "Safe to Spend" runway calculation.
- **Cash Flow Visualizations:** Interactive Chart.js / Recharts trend lines tracking monthly income vs. burn.
- **Quick Action Bar:** One-click modals for "Add Expense", "Add Income", and "Transfer".
- **Recent Activity Feed:** Infinite scroll / cursor-paginated transaction previews with category icons and quick-edit options.
- **Smart Budget Progress:** Progress bars with threshold markers (75%, 90%, 100%).

### 4.2 Records Management (`/records`)
- **Data Grid:** Cursor-paginated tabular view supporting date-range filtering, category multiselect, type filtering (Income/Expense), and search query.
- **Batch Operations:** Multi-record selection for bulk deletion or category reassignment.
- **Inline Editing & Quick Add:** Fast-entry input strip supporting natural keyboard navigation (Tab-through fields, Enter to submit).
- **CSV Import/Export:** Drag-and-drop file upload with column mapping preview.

### 4.3 Budgeting (`/budgets`)
- **Overview Metric Cards:** Total Allocated vs. Total Spent with dynamic remaining balance countdown.
- **Category-Specific Budget Gauges:** Visual progress meters featuring color-coded state transitions:
  - Green (< 75% utilized)
  - Amber (75% – 95% utilized)
  - Red (> 95% or exceeded)
- **Rollover & Cadence Selectors:** Monthly and custom interval budgeting.

### 4.4 Financial Goals (`/goals`)
- **Goal Cards:** Target amount, current savings, deadline countdown, and calculated monthly contribution recommendations.
- **Progress Visualizations:** Circular meters and milestone badges.
- **Contribution Modals:** Direct transfer simulation linking account balance to goal deposits.

### 4.5 Recurring Transactions (`/recurring`)
- **Schedule Management:** Automated recurring transaction table with recurrence frequency (Daily, Weekly, Monthly, Yearly).
- **Upcoming Execution Previews:** Projected run dates and calendar ledger preview.
- **Active / Paused Status Switches:** Instant toggle for pausing upcoming automated transactions.

### 4.6 Reports & Analytics (`/reports`)
- **Spending Distribution:** Interactive donut chart breaking down expenses by category.
- **Income vs. Expense Historical Comparison:** Multi-month bar charts with comparative delta percentages.
- **Category Deep Dive:** Drill-down table listing average transaction sizes and frequency per category.

### 4.7 AI Financial Insights (`/ai-insights`)
- **Privacy Assurance Banner:** Visible indicator that only aggregated category totals and period sums are sent to LLMs.
- **On-Demand Narrative Analysis:** Detailed spending observations, recurring leak detection, and actionable budget suggestions.
- **Citation Proof Chips:** Interactive pill links tagging every numerical AI claim to its corresponding filtered record set.

### 4.8 Settings & Customization (`/settings`)
- **Preferences:** Default currency selection (INR, USD, EUR, GBP, etc.), date formats, and number localization.
- **Custom Categories:** Color pickers, Lucide icon selectors, and custom category management.
- **Security & Sessions:** Active session management and password updates.

---

## 5. UI Component Library Patterns

- **Button Variants:** `primary` (cyan fill), `secondary` (surface-2 with border), `destructive` (red tint), `ghost` (transparent text).
- **Inputs & Form Controls:** Dark background inputs with subtle border and cyan focus ring (`ring-1 ring-cyan-500/50`).
- **Data Modals:** Animated overlay backdrop blur (`backdrop-blur-sm bg-black/70`) with smooth scaling entrance.
- **Toast Notifications:** Non-intrusive bottom-right feedback alerts with auto-dismiss and undo capability.

---

## 6. Accessibility & Performance Standards

- **Color Contrast:** All text meets or exceeds WCAG 2.1 AA requirements (contrast ratio > 4.5:1 against surface darks).
- **Keyboard Traps & Focus Rings:** Every interactive element has explicit `:focus-visible` styling and supports standard tab flow.
- **Motion Preferences:** Animations respect `prefers-reduced-motion: reduce` settings.
- **Screen Reader Support:** Semantic HTML tables, ARIA labels on icon buttons, and live region announcements on async mutations.