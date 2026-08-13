# Expense AI - Smart Financial Tracker

A modern, AI-powered expense tracking application built with Next.js that helps users manage their finances with intelligent insights, smart categorization, and personalized financial recommendations.

## Live Demo

[https://next-expense-tracker-rsdeepakg.vercel.app/](https://next-expense-tracker-rsdeepakg.vercel.app/)

## Features

### Core Features
- **Dashboard** - Overview of financial health with KPIs, spending trends, and quick actions
- **Transaction Management** - Add, edit, and delete income/expense transactions
- **Budget Tracking** - Set and monitor monthly budgets with alerts
- **Financial Goals** - Create and track savings goals with progress visualization
- **Category Management** - Organize transactions by categories

### AI-Powered Features
- **AI Financial Insights** - Personalized spending analysis powered by OpenAI via OpenRouter
- **AI Financial Coach** - Smart recommendations based on spending patterns
- **AI Expense Categorization** - Automatic transaction categorization using AI
- **Spending Pattern Analysis** - Detect unusual spending and trends

### User Experience
- **Dark Mode** - Beautiful dark theme optimized for extended use
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Command Palette** - Quick navigation with Cmd/Ctrl+K
- **Real-time Updates** - Instant feedback on all actions

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons
- **Chart.js** - Data visualization
- **Recharts** - Advanced charting library

### Backend
- **Next.js Server Actions** - Type-safe server-side logic
- **Prisma ORM** - Database toolkit and query builder
- **PostgreSQL** - Robust relational database (via Neon)
- **Redis (ioredis)** - Response caching and rate limiting
- **Zod** - Runtime type validation

### AI Integration
- **OpenAI API** - GPT models for insights and categorization
- **OpenRouter** - AI provider gateway for flexible model access

### Authentication & Security
- **Custom Auth** - Session-based authentication with secure cookies
- **bcryptjs** - Password hashing
- **Redis Rate Limiting** - Per-IP limits on login/register, per-user limits on AI calls
- **Anti-Enumeration** - Generic auth responses (no user discovery)
- **Timing-Safe Secrets** - `timingSafeEqual` verification of the cron secret
- **Fail-Open Cache** - Redis outages never take down the app
- **API Request Logging** - Colored, NestJS-style request logs for API routes

### Infrastructure
- **pnpm** - Fast, disk-efficient package manager
- **pnpm-workspace.yaml overrides** - Pinned transitive dependency versions (zero audit vulnerabilities)

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Prisma Studio** - Database management GUI

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon for serverless)
- Redis (for caching and rate limiting)
- OpenRouter API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/next-expense-tracker.git
cd next-expense-tracker
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-postgresql-direct-connection-string"
REDIS_URL="redis://localhost:6379"
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENAI_API_KEY="your-openai-api-key"
CRON_SECRET="a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Redis powers dashboard/records caching and login/register + AI rate limiting.
Start it locally with:
```bash
brew install redis
brew services start redis
```
Caching and rate limiting fail open — if Redis is down, the app keeps working
(no caching, no rate limits).

4. Initialize the database with the committed migrations:
```bash
npx prisma generate
npx prisma migrate deploy
```

Vercel automatically uses the `vercel-build` package script, which applies
pending production migrations before building the Next.js application. Keep
schema changes in `prisma/migrations` so application code and the production
database are deployed together.

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
next-expense-tracker/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── records/       # Transaction management
│   │   ├── budgets/       # Budget tracking
│   │   ├── goals/         # Savings goals
│   │   └── ai-insights/   # AI-powered insights
│   ├── (public)/          # Public pages (login, register)
│   └── actions/           # Server actions
├── components/            # React components
│   ├── patterns/          # Feature-specific components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── lib/                   # Utility functions and configs
│   ├── ai.ts             # AI integration
│   ├── auth.ts           # Authentication logic
│   ├── redis.ts          # Redis client (single shared connection)
│   ├── cache.ts          # Cache helpers + key builders
│   ├── rate-limit.ts     # Per-IP and per-user rate limiters
│   ├── server/           # Server-only helpers
│   │   └── logger.ts     # Colored API request logger
│   └── domain/           # Business logic
├── prisma/                # Database schema
└── public/               # Static assets
```

## Key Features Explained

### AI Financial Insights
The AI insights page provides personalized financial analysis using OpenAI models:
- Spending trend analysis
- Savings opportunities identification
- Budget recommendations
- Unusual activity detection

### Smart Budgeting
- Set monthly budgets per category
- Real-time tracking against limits
- Visual progress indicators
- Alerts when approaching or exceeding limits

### Goal Tracking
- Create multiple savings goals
- Track progress with visual indicators
- Set monthly contribution targets
- Deadline management

## Caching, Rate Limiting & Logging

### Redis Caching
Dashboard data is cached in Redis for 5 minutes and invalidated automatically
on every mutation (adding/deleting records, setting budgets, updating settings,
etc.) via `deleteCacheByPattern`. A cache miss computes from Postgres and writes
back; Redis failures silently fall back to a direct database read.

### Rate Limiting
- **Login** - 5 requests/minute per IP
- **Register** - 3 requests/10 minutes per IP
- **AI provider calls** - 20 requests/minute per user (protects API costs)
- Rate limits fail open when Redis is unavailable

### API Request Logging
Every API route (`/api/auth/*`, `/api/goals`, cron) is wrapped in
`withApiLogging`, which prints NestJS-style colored logs with method, path,
status code, and duration:
```
12:04:32 [API] POST /api/auth/login 200 240ms
```
Colors auto-disable when output is piped or in production.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct connection string (bypasses pooler for migrations) | Yes |
| `REDIS_URL` | Redis connection string for caching/rate limiting | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | Yes |
| `OPENAI_API_KEY` | OpenAI API key (fallback for OpenRouter) | No |
| `CRON_SECRET` | Secret for authenticating the recurring cron endpoint | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run vercel-build # Apply migrations and build on Vercel
npm run start        # Start production server
npm run check        # Run typecheck + lint
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue in the repository.
