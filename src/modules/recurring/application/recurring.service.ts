'use server';
import { getAuthUser } from "@/src/modules/auth";
import { processDueRecurringRecords } from "@/lib/data/recurring";
import { CacheKey, deleteCacheByPattern } from "@/src/common/cache";
import { revalidatePath } from "next/cache";
import { createActionBoundary, parsed } from "@/lib/server/action-boundary";

const run = createActionBoundary({ authenticate: getAuthUser, revalidate: revalidatePath, reportError: (s, e) => console.error(`${s} failed`, e) });

export async function processRecurringNow() {
  return run({
    scope: "record",
    input: {},
    parse: () => parsed({}),
    execute: async (actor) => {
      const created = await processDueRecurringRecords(actor.userId);
      if (created > 0) await deleteCacheByPattern(CacheKey.userAllPattern(actor.userId));
      return { created };
    },
    message: "Recurring processed",
    revalidatePaths: ["/recurring", "/dashboard", "/records"],
  });
}
