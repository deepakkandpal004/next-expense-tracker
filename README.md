# Expense AI — Smart Financial Management Platform

An intelligent, full-stack personal finance and expense tracking application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Redis**. Features privacy-first AI financial insights, automated recurring billing, budgeting, cash flow forecasting, and a modular monolith architecture.

---

## Live Demo

- **Application URL:** [https://next-expense-tracker-rsdeepakg.vercel.app/](https://next-expense-tracker-rsdeepakg.vercel.app/)

---

## Key Features

### 1. Financial Management & Transactions
- **Interactive Dashboard:** Real-time KPI summaries (Net Balance, Monthly Spending, Income, "Safe to Spend" runway calculations).
- **Transaction Records:** Fast CRUD operations, cursor-based pagination (`take: 50`), full-text search, and multi-filter criteria (date range, type, category).
- **Batch Processing:** Support for multi-record operations and CSV transaction import/export.
- **Smart Categorization:** Default and custom user categories with custom icons and color pickers.

### 2. Budgets & Goal Tracking
- **Category Budgets:** Real-time tracking with dynamic threshold alerts (75%, 90%, 100% capacity).
- **Savings Goals:** Visual progress tracking, target dates, and monthly contribution calculators.
- **Recurring Transactions:** Automated recurring scheduler (Daily, Weekly, Monthly, Yearly) processed via cron jobs.

### 3. Privacy-First AI Insights
- **Aggregated Summaries:** Model only receives high-level category totals and counts—never raw transaction descriptions or merchant data.
- **Narrative Analysis:** On-demand AI observations explaining trends, spend spikes, and money leaks.
- **Citation Proof Chips:** Interactive links connecting AI narrative claims directly to filtered transaction queries in `/records`.

### 4. High-Performance Architecture
- **Modular Monolith (`src/modules/*`):** Domain-driven separation (Domain, Application, Infrastructure, Presentation).
- **Redis Caching (`ioredis`):** Cached dashboard bundles and session lookups with automatic pattern-based invalidation (`SCAN`).
- **Resilient Fallbacks:** Fail-open cache architecture ensures the application remains fully functional even if Redis is unreachable.
- **Rate Limiting:** Per-IP brute-force protection on authentication and per-user limits on AI endpoints.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19 (Server & Client Components) |
| **Language** | TypeScript (Strict mode) |
| **Styling & UI** | Tailwind CSS, Motion, Lucide React, Base UI |
| **Data Visualization** | Chart.js, React-Chartjs-2 |
| **Database & ORM** | PostgreSQL (Neon serverless compatible), Prisma ORM |
| **Caching & Rate Limiting** | Redis (ioredis) with SCAN invalidation |
| **Authentication** | Custom secure cookie sessions, SHA-256 token hashing, bcryptjs |
| **AI Integration** | OpenAI API / OpenRouter gateway |
| **Validation & Logging** | Zod runtime schema validation, formatted request logger |

---

## Project Structure

```
next-expense-tracker/
├── app/                          # Next.js App Router (Routes & Layouts)
│   ├── (app)/                   # Authenticated application routes
│   │   ├── dashboard/           # Main financial dashboard
│   │   ├── records/             # Transaction records & filtering
│   │   ├── budgets/             # Budget planning & gauges
│   │   ├── goals/               # Savings goals & milestones
│   │   ├── recurring/           # Recurring schedules
│   │   ├── reports/             # Analytical charts & breakdowns
│   │   ├── categories/          # Category management
│   │   ├── ai-insights/         # AI narrative insights
│   │   └── settings/            # User preferences & sessions
│   ├── (auth)/                  # Auth routes (sign-in, sign-up)
│   ├── (public)/                # Landing pages & legal (about, privacy, ai-transparency)
│   └── api/                     # REST API endpoints & cron handlers
├── src/                         # Modular Monolith Architecture
│   ├── config/                  # Validated environment configurations
│   ├── database/                # Prisma client with connection pooling
│   ├── common/                  # Shared kernel (cache, UI components, types, formatters)
│   └── modules/                 # Feature-based domain modules
│       ├── auth/                # Auth domain, application services & repositories
│       ├── records/             # Record domain, pagination & mutations
│       ├── budgets/             # Budget logic & tracking
│       ├── goals/               # Savings goal calculators
│       ├── recurring/           # Recurrence rules & scheduler
│       ├── categories/          # User category definitions
│       ├── dashboard/           # Aggregated bundle loaders & safe-to-spend
│       ├── reports/             # Cash flow & spending reports
│       └── ai/                  # Summary payload builder & AI connector
├── prisma/                      # Database schema & migrations
└── public/                      # Static assets & icons
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **Package Manager**: `pnpm` (recommended) or `npm`
- **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase)
- **Redis**: Local instance (`brew install redis`) or managed Redis (e.g. Upstash)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/next-expense-tracker.git
cd next-expense-tracker
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"

# Redis Cache & Rate Limiting
REDIS_URL="redis://localhost:6379"

# AI Gateway (OpenRouter or OpenAI)
OPENROUTER_API_KEY="your-openrouter-key"
OPENAI_API_KEY="your-openai-key"

# Background Cron & Security
CRON_SECRET="generate-a-strong-random-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Initialization
Generate the Prisma client and apply database migrations:
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Background Cron Jobs

The application includes an automated recurring transaction processor located at `/api/cron/process-recurring`. It scans for active `RecurringRecord` items that are due and creates corresponding `Record` entries inside a Prisma transaction.

To execute the cron job safely:
```bash
curl -X POST http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Next.js development server |
| `pnpm build` | Generates Prisma client and builds for production |
| `pnpm start` | Starts the production server |
| `pnpm check` | Runs TypeScript typechecks and ESLint checks |
| `pnpm typecheck` | Validates TypeScript types across the codebase |
| `pnpm lint` | Runs ESLint analysis |
| `pnpm vercel-build` | Applies database migrations and triggers production build on Vercel |

---

## License

This project is licensed under the [MIT License](LICENSE).
