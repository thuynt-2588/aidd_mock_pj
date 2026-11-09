import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale, type Locale } from "./locale-config";

/**
 * Reads the visitor's locale from the NEXT_LOCALE cookie (request-time API).
 * With cacheComponents enabled, callers must render inside a <Suspense> boundary.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
