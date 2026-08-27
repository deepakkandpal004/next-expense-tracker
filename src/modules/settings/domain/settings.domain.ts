import { z } from "zod";

export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional().or(z.literal(""));
export const currencySchema = z.string().trim().length(3, "Currency must be a 3-letter code").transform((v) => v.toUpperCase());

export type UserSettings = {
  name: string;
  email: string;
  currency: string;
};
