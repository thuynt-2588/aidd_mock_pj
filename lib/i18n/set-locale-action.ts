"use server";

import { cookies } from "next/headers";
import {
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  LOCALES,
  type Locale,
} from "./locale-config";

/** Persists the chosen locale. Input is untrusted: anything but the two literals is ignored. */
export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!LOCALES.includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
  });
}
