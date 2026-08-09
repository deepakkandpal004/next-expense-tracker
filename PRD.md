# PRD — Expense AI

**Status:** Draft v0.0 · **Product:** Consumer expense tracker · **Author:** Product (AI PRD)

---

## 0. Problem statement

People fail to act on their spending because the story behind the numbers is missing. The app already stores transactions, budgets, deterministic forecasts, and heuristics — but a user has to interpret all of that themselves ("Is eating out actually a problem? Why did I overspend?").

Today:
- Dashboard shows KPIs and category breakdowns but no narrative.
- `/ai-insights` exists but only generates read-only cards on an explicit button press.
- A chat engine (`generateAIAnswer` in `lib/ai.ts`) is already built and unused — **dead code, no UI**.

**Conviction:** an in-app AI copilot — chat, proactive insights, and a monthly digest — is the highest-leverage way to turn a passive log into a decision partner. It must be truthful (source figures visible) and maximally private (model only sees aggregates, never raw transactions).

---

## 1. Problem statement (detailed)

Primary audience: individual consumers tracking personal spending (manual entry + CSV import, no bank sync).

Pain points:
1. **Data dump, not guidance.** Users record transactions and CSV-import, but no one tells them the story: what to watch, what won, why a category jumped.
2. **Insight is bounded by heuristics.** Existing anomalies/forecasts are deterministic formulas; they can flag "slightly up" but not answer "is this worth caring about?" natural-language questions.
3. **There is no single natural place to ask "what's going on with my money?"** Honest answers require juggling /records, /reports, /budgets, /goals — a chore.
4. **Privacy anxiety.** Financial transaction data is sensitive. The MVP must make privacy a first-class, transparent product feature, not a footnote.

---

## 2. Personas

### Hobby — Diya (26, Bengaluru, salaried)
- Stores all expenses manually, forgets intermittently; never sets a budget correctly.
- **frustration:** can't distinguish "normal" from "unusual"; fears being judged; opens dashboard, closes it confused.
- **AI moment:** monthly digest says "You spent ₹8k on Food (up 1.9× vs your 3-mo average), 3 like shop orders, ₹11/order. Brew + 2 orders next month → +₹1,900 savings. Want me to draft a budget?" and Diya can ask "what about entertainment?"

### Planner — "Pat" (34, analyst/freelancer, CSV-imports)
- Quarterly importer; asks precise questions: "list biggest single expenses in July", "what's my recurring monthly gap?", "explain July's low category".
- **needs:** numeric answers that match what `/reports` shows; no fake precision; referable numbers and filters.
- The AI must never approximate when an exact answer is available from the summary.

---

## 3. Product goals

### Goals (MVP)
1. **Answer questions about a user's own finances in plain language** — specifically, truthfully, explained, from summary-only data.
2. **Proactive insights** on demand — before the user asks, within `/ai-insights`, explain the top problems/wins of the period.
3. **Monthly digest** — a narrative "your month review" auto-generated in-app each month from the same aggregates.
4. **Trust by default** — privacy-first (never send raw data), disclosure before use, visible sources.

### Non-goals (MVP)
- No bank/Plaid integrations (manual + CSV only in MVP).
- No AI auto-categorization. Categorization stays user-written + on-demand AI suggestion (`suggestCategory` exists; no writes on create).
- No AI-driven budgets/goals (only *called out*, not actions).
- No email/notifications, multi-user households, mobile-native push.
- No monetization (landing page states "free"; out of scope).

---

## 4. User stories

- As a consumer, I want to ask "how much did I spend on Entertainment last month?" and get a precise answer with figures **so I don't have to comb through /reports manually**.
- As a consumer, I want the model to open `/reports` filters from an answer **so I can drill into source details**.
- As a consumer, I want a monthly digest story of the period **so I get a recurring money review without being an analyst**.
- As a user, I want to be told exactly what data the model will see **so I can trust the feature**.
- As a user with an error, I want graceful errors and quotes over silent failure **so I never see invented numbers**.
- As PM, I want usage, adoption, and correctness metrics **so I can prove value and improve**.

---

## 5. Feature list (MVP / v2 / later)

### MVP
| ID | Feature | Notes |
|---|---|---|
| F1 | **AI chat** — natural-language questions over period-scoped summaries | wired to existing dead `generateAIAnswer` engine; new chat UI surface; sources+deep-links |
| F2 | **AI insights (real)** — same period, generate on-demand, replaced rule-cards kept as anchors | wire existing `getAiFinancialInsights`; keep deterministic insight for ground truth + AI shares underlying. |
| F3 | **Monthly digest** — auto-generated in-app summary each month | calls same pipeline; new `Digest` table; cron generation; period → month reuse. |
| F4 | **Privacy & consent** — accept disclosure once, feature testable toggle, aggregated-only payload, docs | `AI_DISCLOSURE_VERSION` reuse; `AI settings` section; /ai-transparency page kept fresh. |

### v2
- Threaded conversations + time-filtered chat (multi-turn).
- **Suggest actions** (draft a budget / category change from a chat turn, with explicit confirmation).
- Forecast-aware chat (curates deterministic forecast evidence into Q&A).
- Recurring: link digest to a fixed "first of month" auto-read.
- Better latency: per-user summary caching + cheaper model fallback.

### Later (not addressed)
- Bank sync (Plaid-style) RSS through the same summary-only pipeline.
- Household/multi-account, email digest, plan/forecast simulation ("what if I cut X?"), advice quality audits.

---

## 6. Detailed functional requirements (per MVP feature)

### F1 — AI chat

**Context**
- A chat surface reachable from app nav (`/ai` — recommended) + a "Ask AI" button in the header of `/ai-insights`.
- User selects a **period** (most recent month default; pick any supported range).
- The model context is **exactly the `AiProviderPayload` summary**: period label, currency, transaction count, total income/spending/balance, category aggregate amounts (minor units), and field names. Service explicitly excludes `Record.text`, `id`, amounts per-line, exact dates, merchant info, budgets internal fields.
- Model: `openai/gpt-3.5-turbo` via OpenRouter (existing gateway in `lib/ai.ts`), temperature low (≤0.2), max output tokens capped (~200).
- Response surfaced with **sources**: each numeric claim tags the underlying category → deep-links to `/records` with that category + period filters.
- "I can't answer" behavior: if the answer isn't in context, model returns *"I don't have enough in this period"* instead of guessing.

**Autocomplete / polish**:
- Suggested question chips (e.g., "What can I cut?", "How did income last month compare?").
- Input validation: require ≥1 transaction in period.
- Loading → streaming where provider supports.

**Cost/limits**:
- Per-user daily quota (configurable); show friendly "reached today's checks" when exhausted.
- Output aligned with a hard message size.
- Add `AiChatMessage` table for message storage but **period summaries only re-derived on demand** (never store the prompt).

### F2 — Insights

- `/ai-insights` keeps rating cards as **source anchors** (deterministic flags from forecast/heuristics); the AI narrative block appears only after user clicks **Generate** (respect the current deliberate `generateAi: false` on page load).
- AI narrative: up to 3 of the most impactful concentrations, each with *"why? because X where C category is at `n×` your 3-month average"* and a **drill link**.
- Cache per `[user, periodStart, periodEnd]` in `AiInsightCache` (reuse; no double-call).
- Confidence + disclosure panel retained.

### F3 — Monthly digest

- 1/category/month only if ≥1 transaction in that month.
- Content: one-line month top story; three bullets (biggest, biggest change, best/worst spending du); budget watch (if a budget is set); a suggested action (one, e.g., "reduce latest food spend / consider a goal").
- Generation: on a cron endpoint (V-строитель existing cron) at end of month never on open — or manual button "Regenerate message" in the digest card.
- Storage: `AiDigest` table `(userId, month, data)` with model + version fields; digest reads cached aggregates, not raw records.

### F4 — Privacy, consent, security

- **Given the model is summary-only by design** (`AiProviderPayload` type). Codify as a hard contract:
  - No raw `Record.text` / `id` / per-line dates / merchant names ever reach a model, log, or prompt.
  - Currency + minor-unit amounts are the only numbers.
- **First-use disclosure** (modal) before any chat/digest — reuse `AI_DISCLOSURE_VERSION`.
- **Settings "AI" section**: master toggle (on/off all AI surfaces), model details, "what is used" → `/ai-transparency`, "Reset caches", per-month quota info.
- **Server enforcement**: all probe payloads validated against contract; add test asserting no forbidden fields in `AiPromptPayload`.
- **`/ai-transparency` public page** documents the exact data sent — keep it current.

---

## 7. Data model sketch

**Existing (Prisma)** — unchanged except minor additions:

- `User`, `Record`, `Budget`, `UserCategory`, `Goal`, `RecurringRecord`, `AiInsightCache`, `Session`, `MutationRequest`, `PasswordResetToken`.

**New:**
| Entity | Key fields | Notes |
|---|---|---|
| `AiConsent` | id, userId (unique), consentVersion, grantedAt, revokedAt? | one per user; gates AI features |
| `AiChatMessage` | id, userId, `periodKey`, role, content, createdAt | store only the useful user message + response; never raw logs |
| `AiChatSession` | id, userId, createdAt, lastActiveAt, title | groups F1 messages (threads v2); MVP may be single-turn |
| `AiDigest` | id, userId, month (`YYYY-MM`, unique), dataJSON, model, createdAt | generation result + version |
| `AiQuota` | id, userId, dateKey, usedCount | simple daily counter |

**Rules:**
- Prompts/summaries are derived from live aggregated query at call-time; nothing raw is persisted.
- `AiChatMessage.content` is display-only; the model produces the response, and we store it for the UI. No prompt/log retention of raw actions.

---

## 8. Edge cases & failure states

| # | Case | Behavior |
|---|---|---|
| 1 | Empty period / no transactions | "Add some transactions first" — no model call, no cost |
| 2 | Provider error / timeout / rate-limit | friendly retry; never serve fabricated numbers |
| 3 | Quota exhausted | "today's AI budget used — come back later" |
| 4 | Very large dataset (10k+ tx) | cap categories in payload (top N + "other"? explicitly labeled); summary stays truthful |
| 5 | Currency switch mid-period | single normalized currency per period; state in payload |
| 6 | Budget semantics: cadence mid-month | digest lists budget from the effective month; if none, skip line |
| 7 | Recurring forecast skew | digest uses actual stored records, not forecast, in MVP |
| 8 | Privacy toggle revoked | immediately hide AI surfaces & chat; keep consent row with revokedAt |
| 9 | Model returns invented figures | model is prompted to answer only from context; source-check UI shows actual numbers |
| 10 | Answer that isn't in data | model must say "not available in your data" |

---

## 9. Success metrics

**Primary (qualitative)**: 
- Users reach & use the chat and digest and report "now I see something useful about my money" — sampled feedback, no hard KPI gate for MVP (as decided).

**Tracking**:
- Adoption: weekly users opening `/ai-insights` or `/chat` ≥ 25% of active cohort.
- Engagement: ≥ 10% of active ask a chat question in week 1; ≥ 5% reask in week 2.
- Correctness: `≥90%` on a 30-question golden set (before rollout to all).
- Quality: answers with sources accepted ≥ 85%.
- Latency & cost: TTFB target < 3s p50, <8s p95; model cost per user < $0.05/mo at scale.
- Trust: 0 forbidden raw-field incidents post-test.

---

## 10. Open questions

1. **Chat surface** — standalone `/chat` page vs tab inside `/ai-insights`. (Recommend a dedicated `/chat`; keep insights as the "preloaded digest".)
2. **Multi-turn** — single-turn (MVP) vs threaded v2 (recommend single-turn for Claude/token simplicity).
3. **Model/version** — keep GPT-3.5-turbo vs upgrade to a better rate model (depends on benchmark answer quality; golden-30 set).
4. **Currency** — answer entirely normalized to user's currency (recommended) vs also original-entry amounts.
5. **Digest delivery** — in-app only in MVP; email v2.
6. **Where do chat "actions" live** — suggestions ("make this a budget") become write operations in v2; in MVP they are suggested text only.

---

## Appendix — Trust glossary

- **summarized data** = category-level aggregates + period counts/currency. Never raw transaction lines.
- **disclosure version** = `AI_DISCLOSURE_VERSION` string shown to users for consent.
- **source link** = a value/claim in an answer tagged to the underlying category/period that deep-links into records.