/**
 * Categories domain — taxonomy + validation.
 */
export { CATEGORY_DEFINITIONS, isCategoryId, getCategoryDefinition, type CategoryId } from "@/src/common/domain/categories";
import { z } from "zod";

export const categoryLabelSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(50);
export const categoryColorSchema = z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Color must be hex #RRGGBB").optional();
export const categoryIconSchema = z.string().trim().max(30).optional();
