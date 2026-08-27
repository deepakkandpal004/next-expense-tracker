# Modular Monolith Architecture — Expense Tracker

**Status:** Migrated from layered (type-based) to **modular monolith (feature-based)** — `src/modules/*`. Production-ready, scales from MVP → 50k users without microservices.

## Why Modular Monolith?

Stage 1 (now): Clean modular monolith → Stage 2: queues/workers → Stage 3: caching/observability → Stage 4: split only heavy domains. Avoids premature microservices while enforcing module boundaries.

Previous structure was `lib/domain/*` + `lib/data/*` + `app/actions/*` + `components/patterns/*` — horizontal layers causing cross-feature coupling (e.g., `dashboard/page.tsx` imported 4 loose loaders from 3 layers = 15 DB queries).

## Target Structure

```
src/
  config/            # env validation (zod), app config — single source for secrets
    env.ts
  database/          # Prisma client with pooling (connection_limit=5)
    client.ts
  common/            # Shared kernel — only truly shared code
    cache/           # Redis: getCache/setCache/deleteCacheByPattern (SCAN)
    utils/date.ts    # boundaryAtStart, nextRecurrenceOccurrence
    errors/          # AppError, ValidationError, etc.
  modules/           # Feature modules — each owns domain+app+infra
    auth/
      domain/auth.domain.ts        # Zod schemas, value objects
      infrastructure/auth.repository.ts # Prisma user/session
      application/auth.service.ts  # createSession, getAuthUser (Redis-cached)
      index.ts       # public API
    records/         # Transactions — pagination, CRUD, import
      domain/records.domain.ts
      infrastructure/records.repository.ts # findByPeriodPaginated(cursor)
      application/records.service.ts
    budgets/, goals/, recurring/, categories/, dashboard/, reports/, ai/
  integrations/      # External SDKs isolated
    openai/          # lib/ai wrapper
    currency/
  jobs/              # Cron handlers (processDueRecurringRecords)
  observability/     # logger, metrics
  health/            # /api/health/redis
```

`lib/` kept as **compat re-exports** (`lib/auth.ts` → `src/modules/auth`, `lib/db.ts` → `src/database/client`) to avoid breaking 40+ imports during migration. New code imports from `@/src/...`.

## Module Contract

Each `src/modules/{feature}` follows:

```
feature/
  domain/       # pure, no I/O, no Prisma, no Redis
  application/  # use-cases, orchestrates domain + infra, handles cache
  infrastructure/ # Prisma, Redis, external calls (only place with `db`)
  presentation/ # (optional) UI components specific to feature
  index.ts      # only exports application + domain types
```

**Rules:**

- `domain` may not import `infrastructure` or `application`.
- `infrastructure` may not import `application`.
- Cross-module imports only via `index.ts` (e.g., `dashboard` may import `records` repo, but not deep files).
- `app/(app)/*/page.tsx` imports only `application` services, never `db` directly.

## Key Production Fixes Included

| Area | Before | After |
|---|---|---|
| **DB pooling** | `lib/db.ts:5` bare `PrismaClient()` → 500 conns | `src/database/client.ts:8` `connection_limit=5&pool_timeout=5` + pooling |
| **Cache invalidation** | `KEYS` blocking + misses `dashboard-bundle` | `lib/cache.ts:32` `SCAN` pipeline + `userAllPattern` unified |
| **Auth latency** | 980ms DB per request | `src/modules/auth/application/auth.service.ts:74` Redis session cache 68ms, warm 269ms |
| **Pagination** | `records.ts:18` load all | `records.repository.ts:30` cursor `take:50` + `nextCursor` |
| **Batch writes** | per-row `create` loop | `records.createMany` batch 500, `recurring.ts:30` `$transaction` batch |

## Migration Path (Incremental)

1. **Done:** `src/config`, `src/database`, `src/common`, `auth`, `records` (incl. pagination), `dashboard`, `budgets`, `goals`, `recurring`, `reports`, `ai` skeletons; `app/(app)/dashboard/page.tsx:3` and `records/page.tsx:3` now use `@/src/modules/*`.
2. **Next:** Move remaining `app/actions/*` into `modules/{feature}/application`, move `components/patterns/records-view` to `modules/records/presentation`, add `eslint no-restricted-imports` to enforce.
3. **Final:** Delete `lib/` re-exports, keep only `src/`. Add `unstable_cache` + `revalidateTag` for ISR, Decimal for money.

## How to Use

```ts
// New code
import { getAuthUser } from "@/src/modules/auth";
import { getRecordsPaginated } from "@/src/modules/records";
import { getDashboardBundle } from "@/src/modules/dashboard";
import { getEnv } from "@/src/config/env";

// Legacy (still works, deprecated)
import { getAuthUser } from "@/lib/auth";
```

## Verification

```
pnpm typecheck && pnpm lint
bash /tmp/bench_pages.sh  # warm <300ms
curl /api/health/redis    # 200
npx prisma validate
```
