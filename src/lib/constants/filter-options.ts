/**
 * Filter options for catalogue page
 */

export const CATEGORY_OPTIONS = ["Curtains", "Blinds", "Sheers", "Shades"] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
