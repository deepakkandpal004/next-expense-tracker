/**
 * Jobs — recurring cron handler.
 * Was app/api/cron/process-recurring/route.ts inline.
 * Now isolated for both cron route and manual trigger.
 */
export { processDueRecurringRecords } from "@/lib/data/recurring";
