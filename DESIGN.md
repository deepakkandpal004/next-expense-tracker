# Design Brief — Expense AI

**Status:** Design brief (approval gate before code) · **Based on:** `PRD.md` (F1–F4, chat + insights + digest, summary-only AI)
**Grounding:** existing CSS tokens in `app/globals.css` and the current component patterns in `components/`
**In:** dark-only consumer expense app · **Product voice:** calm, precise, quietly confident — a bank you trust, not a casino

---

## 1. Design principles

1. **Truth before comfort.** Every AI statement that references a figure MUST resolve to a visible, clickable number ("₹8,420 · Food · 24 transactions") that deep-links to `/records`. If the answer can't be supported by the summary, the UI says "I don't have that in this period." Never render a floating stat that has no proof. This is the single non-negotiable rule of the product.
2. **Private by visible design.** The user should *feel* the privacy promise every time they touch AI — a recurring "Summaries only · no merchant names" badge next to the AI surfaces, a first-use disclosure, and a settings toggle that visibly switches everything off. Privacy is a UI surface, not a legal footnote.
3. **The app leads; the AI confirms.** Human-reviewable numbers (dashboard KPIs, budget bars, reports) are always the source of truth. AI output is a *transcript layered on top* — visually distinct from authoritative numbers so the user can always separate "the app computed" from "the assistant narrated."

---

## 2. Visual direction

**Mood:** "Midnight ledger" — a warm-black operations room. Data is calm and structural (borders, tables, exact numbers); the AI layer is the one place that glows (subtle cyan, generative, alive). The whole thing should feel like a pool of quiet light around the user's money, not a casino of colored cards.

**References / precedents:**
- **Linear, Notion, Raycast** — dark, restrained surfaces, dense but calm data reads.
- **Monarch / Copilot Money** — the *feeling* of "someone looked at my money and told me the story."
- **Vercel dashboard** — precise typographic hierarchy, almost monastic.
- **ChatGPT / Claude voice** — familiar chat affordances (bubbles, streaming caret, chips) **but** with "proof chips" grafted on that no generic chat UI has.

**What to avoid:**
- 🚫 Big AI-company gradients (purple/orange aurora) — reads as "AI garnish," undermines trust.
- 🚫 Skeuomorphic money (coin icons, cash graphics, flywheel charts) — early-build kitsch.
- 🚫 Aggressive glow on every number — the glow belongs to AI *narration* only. Data stays flat.
- 🚫 Yellow-ink "danger" everywhere — anomalies are opportunities, not alarms. Use warning sparingly (one per insight, max).
- 🚫 Chat that looks like "fake analytics." No invented KPIs; the sources anchor strips are the visual proof.

**Motion language:** 180–220 ms ease on hover; data charts 400 ms ease-out; AI streaming is a soft caret pulse (+ staggered word dots), NOT traveling shimmer arcs. Animations illustrate relationships, never decorate.

---

## 3. Design tokens

> Keep the existing semantic tokens from `app/globals.css` (already correct). This section is the AI layer + usage guidance on top.

### Color

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#000000` | App frame / page background |
| `bg-surface` | `#111318` | Cards, sidebars, chat surface |
| `bg-surface-2` | `#161B22` | Elevated cards, hover fills, hover chips |
| `border-subtle` | `rgba(255,255,255,0.08)` | Card/tile boundaries |
| `border-hover` | `rgba(255,255,255,0.16)` | Active/elevated boundary |
| `primary` | `#00DCE5` | AI accent, focus, active links, "AI" badge, primary actions |
| `primary-muted` | `rgba(0,220,229,0.12)` | AI chip backgrounds, selected states |
| `text-primary` | `#F5F7FA` | Primary copy, headings |
| `text-secondary` | `#9AA3AF` | Body copy, secondary info |
| `text-tertiary` | `#5B6472` | Captions, timestamps, disabled |
| `text-inverse` | `#0A0B0D` | Text on primary fill |
| `success` | `#22C55E` | Income, positive delta, "on track" |
| `danger` | `#F04438` | Overspend, negative delta, destructive dialog |
| `warning` | `#F5A623` | Flag (anomaly, unusual), quota near-limit |

**AI-specific tokens (new):**

| Token | Value | Usage |
|---|---|---|
| `ai-primary` | `#00DCE5` | AI badge, AI links, AI action buttons (same as `primary`) |
| `ai-surface` | `rgba(0,220,229,0.08)` | AI conversation panel background — the only "glow" in the app |
| `ai-border` | `rgba(0,220,229,0.18)` | AI conversation boundary |
| `ai-text` | `#D8FBFD` | AI narration text (slightly lifted blue-white, more luminous than white) |
| `source-chip` | `#E8F0F8` bkg `#111318` 50% | source/citation chip fill + border |

### Type scale (Manrope body / Manrope display)

| Variant | rem / px | Weight | Line-height | Notes |
|---|---|---|---|---|
| Display | 2rem · 32 | 700 | 1.1 | Page title (e.g. "Your money, explained") |
| H1 | 1.5rem · 24 | 700 | 1.2 | Section titles |
| H2 | 1.125rem · 18 | 700 | 1.25 | Card headers |
| Body-L | 1rem · 16 | 450 | 1.5 | Para, chat answer body |
| Body | 0.875rem · 14 | 500 | 1.55 | Reading, chip text |
| Caption | 0.75rem · 12 | 600 | 1.4 | Labels, timestamps, source anchors |
| Micro / tabular | 0.6875rem · 11 | 600 (tab-nums) | 1.3 | Table amounts, KPI meta |

**Why Manrope:** already the app's dial metric — wide, calm lowercase voice that survives on dark — letters line up in number readouts (360° rounded), and at 12px it stays crisp on `tabular-nums`. No new font in MVP. Feeling/weight for AI narration: keep to `Body-L` with lower letter-spacing — the assistant reads like a person, not a chart.

### Spacing scale (4px base)

```
S1: 4px   S2: 8px    S3: 12px   S4: 16px
S5: 20px  S6: 24px  S7: 32px   S8: 48px
Page gutter: 24px (mobile 16px)
Card padding: 20px inside, 16px gaps between chips
```
Rule: **numbers always have 16–20px min space** to any boundary; the AI panel conversation uses 12px vertical rhythm between messages for tightness without clutter.

### Radius

| Token | Value | Usage |
|---|---|---|
| `raw-sm` | 8px | Chips, inputs, small controls |
| `raw-md` | 12px | Cards, tiles, swappable |
| `raw-lg` | 16px | Panel-level containers, chat surface, modals |
| `pill` | 999px | Category pills, badges, status docs |

**Justification:** 8–16px radii on dark avoid the "plastic" look of over-rounded; the chat bubble uses 16/8 compound (asymmetric) so it reads *human*, and the source chips are pills.

### Shadows / elevation

| Level | Value | Usage |
|---|---|---|
| std | `0 1px 2px rgba(0,0,0,0.4)`, `0 0 0 1px rgba(255,255,255,0.02)` | resting cards |
| raised | `0 8px 24px rgba(0,0,0,0.45)` | popovers, dialogs, chat sticky header |
| glow (AI only) | `0 0 0 1px var(--ai-border)`, `0 4px 20px rgba(0,220,229,0.10)` | the conversation panel / active AI chip. This is the **only** glow in the system |

---

## 4. Screen inventory

| Screen | Path | Purpose |
|---|---|---|
| Chat | `/ai` | Ask anything about a period; get sources; follow-up prompt |
| Insights | `/ai-insights` | Scan on-demand AI narrative + anchored deterministic insight |
| Monthly review (Digest) | `/ai-insights#review` or `/digest/[month]` | Read this month's story; regenerate |
| Record detail (modal) | from `/records` | See specifics on a drill source |
| Privacy disclosure (modal) | overlay on first AI use | Consent gate for chat + digest |
| AI settings | `/settings` → "AI" | On/off, quota display, reset caches, model info, transparency link |
| Transparency | `/ai-transparency` (public) | Document exactly what a model sees — a trust page, not marketing |

(Existing screens — `/dashboard`, `/records`, `/budgets`, `/goals`, `/recurring`, `/categories`, `/reports`, `/settings` — unchanged except for nav + "Ask AI" link and delete-anomaly surfaces. This brief covers the **AI surface**.)

---

## 5. User flows

### Flow A — Ask a question (chat) [F1]
1. Enter `/chat` → AI consent modal (if first time) → accept (persist at account level)
2. Chat empty state → 3 prompt chips (`"What can I cut?"` `"Did I spend more this month?"` `"Where did income go?"`)
3. User types or picks a chip + selects optional period (default: current month)
4. Assistant streams the answer; a **SourceStrip** renders below the answer: `Food · ₹8,420 · 24 tx` chips
5. User clicks a source chip → opens `/records` pre-filtered (category + period)
6. (v2 followup) — user asks "and this month vs last?" — threads context is re-earned strictly from summary de-referenced per turn (no raw retained)

### Flow B — Generate insights
1. `/ai-insights` loads: rule cards (deterministic) visible immediately, AI narrative shows "Generate AI narrative"
2. User clicks → quota check → consent check → loading (caret pulse) → narrative appears inline with sources + "confidence" + regenerate
3. Source chips work exactly as in A

### Flow C — Monthly digest
1. On 1st of a month, cron triggers digest generation → stored in `AiDigest`
2. In-app banner on `/dashboard` or `/ai-insights` "September review is ready"
3. User opens digest card → reads the 3 bullets + budget watch + one action → each line has a proof chip
4. User clicks "Regenerate" to get a new draft (cost-capped)

### Flow D — Consent / privacy / off
1. First AI use → modal → "Add only summaries, never raw purchases" + "Learn more" (→ /ai-transparency) + Accept
2. Settings → AI toggler → off hides ALL AI surfaces + chat entry immediately
3. Settings → "Reset cached AI answers" → clears `AiInsightCache` + `AiDigest` (regenerable)

### Flow E — Error / quota
1. Provider fails → inline error: "Couldn't generate this time — retry later" + Retry (never show partial-chart as truth)
2. Quota hits → chip/banner: "You've used today's AI allowance. It resets at midnight."

---

## 6. Per-screen layout

### `/chat`
- **Sections (top→bottom):** Sticky header (`Ask` title, privacy badge right) → conversation list (stack of message bubbles, chat surface bg `ai-surface`) → period selector (small inline drop-down) → composer (textarea + send) → chips row (suggestion chips above composer)
- **Hierarchy:** user message (right, `bg-primary-muted` text-inverse border?) vs AI answer (left, `bg-surface` + `border`) with **SourceStrip** directly under AI bubble
- **Primary action:** the composer "Ask" button
- **Components:** `Bubble`, `SourceStrip` + `SourceChip`, `Composer`, `Chips`, `PrivacyBadge`, `EmptyChat`
- **No left rail**: chat is focused, off-canvas-on-mobile.

### `/ai-insights`
- Header row: Period selector + "Ask AI" shortcut
- Section 1: **Anchor cards** (deterministic): spending, top category, anomalies (1-line) — with a "Raw data" hover
- Section 2: **AI Narrative card**: headline, 3 narrative bullets, each bullet→chip, "Confidence %", "Regenerate", "Privacy badge", "Generated {time}"
- Empty state: "Generate AI insights when you have data"

### Digest card (in /ai-insights)
- Compact card: "Month in short" headline, 3 bullets w/ icons (↑ / ↓ / !), budget watch line, one suggested action
- `Regenerate`, `View in records`, timestamp

### Settings → AI
- Grouped section: "AI Control sliders" **(on/off master)** · "Quota today (3/5)" · "Reset cached AI" · "Model" · "Learn more about AI data" → transparency

### Privacy modal (first-run)
- Shield icon, headline "Your data stays yours", body "The assistant only sees category totals + counts, never your purchase details." Accept/Cancel. Learn more link. Persist.

---

## 7. Component library

### `Chat` components
| Component | Variants | States |
|---|---|---|
| `ChatBubble` | `user` / `assistant` / `system` (quota note) | static · streaming (caret pulse) · error (w/ retry) |
| `SourceStrip` | under-assistant only | empty / 0 (falls back to "no sources") / loading |
| `SourceChip` | category-colored dot + label + amount | default · hover (lift) · pressed (navigates records) |
| `Composer` | multi-line | idle, focus, disabled (quota 0), submitting |
| `SuggestionChip` | text chip (2nd) · icon chip (1st) | default, hover, pressed, disabled |
| `PeriodPicker` | (chevron + dropdown) | default, open, selected, disabled |

### `Data-insight` components
| Component | Variants | States |
|---|---|---|
| `RuleCard` (anchor card) | label + amount + delta | default, flagged(anom), click-off |
| `AINarrativeCard` | headline, bullet list, source chip (`i`) | loading, generated, regenerating, error, empty |
| `ConfidenceBadge` | percentage + label | default, low ("guess") |
| `RegenerateBtn` | icon+text | default, loading (spinner), disabled |

### `System` components (add to chakra)
- `PrivacyBadge` — small shield + "Summarized only" (states: default, tooltip expansion)
- `ConsentModal` — accept/decline + Learn more
- `QuotaBanner` / `QuotaBadge`
- `EmptyState` (with CTA), `ErrorState` (retry), `StreamPrefix` (small cap)

### Deliberate decisions to confirm
- **AI answer text is `ai-text` (#D8F6F) not pure white** — the faint cyan lift tells the eye at a glance *this layer is AI narration vs app truth* (action#3 + principle 2 in one token).
- **User bubble stays dark (unchanged) so the AI cyan is meaningfully "init".**
- **Source chips are never just text** — they are a `chip` (border, 11.5px) because they are *actions*, not labels.

---

## 8. States (per key screen)

Define each: default, loading, error, empty, success, offline, revoked/off, quota-hit.

### `/chat`
- **Empty:** 3 suggestion chips row above empty composer, no bubbles; privacy badge auto-visible
- **Loading:** sending — user bubble opaque-checked; AI caret pulse; disable send; show ephemera "Thinking"
- **Error (provider):** inline in last AI bubble "Couldn't generate — Retry"; do-not-craft
- **Empty question logic:** composer warns if period has 0 transactions ("Add transactions first")
- **Offline/revoked:** all AI surfaces hidden + composer disabled with "AI disabled in settings"

### `/ai-insights`
- **Default:** anchor cards + "Generate" only
- **Loading:** narrative card shows spinner + "Reading your summary…"
- **Empty:** zero transactions → "Add data to get insights" with CTA to `/records`
- **Error:** error card + regenerate
- **Quota:** banner at top, narrative hidden
- **Success:** narrative displayed with stamps (sources + confidence + generation time)

### Digest
- **None:** "This month's review will appear on the 1st"
- **Loading/regenerate:** spinner on Regenerate
- **Empty data** (no tx that month): friendly stub + CTA
- **One-weird month** (currency switch): note badge "Rates vary if currency changed" (open question)

---

## 9. Responsive behaviour

| | Mobile (<640) | Tablet (640–1024) | Desktop (>1024) |
|---|---|---|---|
| **Nav** | bottom tab bar, all main surfaces reachable ✓ | sidebar collapses to top drawer | full sidebar |
| **Chat** | one column chat, composer sticky down; sources chips wrap to 2 rows | composer wider | `chat panel width max 820px, content steady  . | centered column, chat 64/96 col  |
| **Insights** | stack cards vertically | 2-col grid (anchor + narrative) | 3-col: anchors left, narrative center, action right |
| **Digest** | compact card, `Regenerate` visible | - | side drawer |
| **Bubbles** | full-bleed edge to 16 gutter | max-width 520 with AI narrower than user? (both 480–560) | 560 max |

**Rule:** the AI conversation column is *never* perfectly full-width — max ~700px so the paragraphs stay readable (~60–72 chars/line, no mid-word hyphens). Tables sensitive to 480px.

---

## 10. Accessibility

**Contrast (AA minimum, aim AA+ on text AI):**
- `text-primary #F5F7FA` on `#111318` = 15.6:1 ✓
- `text-secondary #9AA3AF` on `#111318` = 6.5:1 ✓
- `#00DCE5` on `#111318` = 8.9:1 (focus rings, links) ✓
- **warning `#F5A623` on dark = 5.0:1, sufficient for non-text (warnings are icons+badge), but add a text label — never color-only truth.**
- Dont' rely on color alone for income/expense splits (each amount carries a `+`/`−` prefix and tabular alignment — already true in `/records`).

**Focus order (per flow):** no focus traps. In chat: composer first on focusable state; source chips form a focus ring that navigates to /records (Escape returns). Insights: Regenerate next after displayed narrative; "Confidence" is a `<dl>`/aria-describedby, not click.

**Keyboard nav:**
- Composer: Enter = send (Shift+Enter = newline), `/` focuses composer globally (same as search)
- Suggestion chips are buttons (Space/Enter navigate)
- Period selector is a standard button+menu; arrow keys navigate, Enter selects
- `Esc` closes privacy modal / returns focus to original trigger

**ARIA needs:**
- Chat list: `role="log"` or `aria-live="polite"` only on the latest assistant bubble (else screen readers shout every message)
- Source chips: `aria-label="Open Food transactions for this period"`, `role="link"` (but it travels to a filtered route)
- Streaming: the streamed text is in an `aria-busy="true"` container; final message is announced once
- Quota banner: `role="status"` + `aria-live="polite"`
- Settings AI toggle: native `switch` role with clear label "AI assistant"
- Modal focus trap necessary, restore focus on close

**Reduced motion:** all streaming caret pulses + card transitions gate behind `prefers-reduced-motion` → static fallback (fully rendered answer without pulse).

---

## 11. What to validate in the review before code

1. **Decide chat surface once**: I write "dedicated `/chat`", per PRD recommendation. Confirm **now** — it shapes the nav, routing, and components above.
2. Confirm `SourceChip` deep-link contract (which URL params `/records` must pass: `category` + `period=start/end`) — needed before the SourceStrip ships.
3. Confirm model voice constraints in the prompt (no first-person "I", answer "available/not available") to keep AI/prod language tonal.
4. Confirm whether "confidence" is displayed at all — PRD says keep it; designers proposes a **subtle** badge in the footer, not large.

---

*This brief is the single decision doc for the AI feature UI. Adjustments after this need the "what to review" list above."*