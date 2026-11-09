export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** BR-002: "en" only when the value is exactly "en"; anything else falls back to Vietnamese. */
export function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
