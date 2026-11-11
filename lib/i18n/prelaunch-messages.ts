import type { Locale } from "./locale-config";

// Copy for "Countdown - Prelaunch page" (MoMorph 8PJQswPZmU). Unit labels stay
// uppercase English in both locales, as in Figma.
export interface PrelaunchMessages {
  title: string;
  units: { days: string; hours: string; minutes: string };
}

const units = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };

const prelaunchMessages: Record<Locale, PrelaunchMessages> = {
  vi: { title: "Sự kiện sẽ bắt đầu sau", units },
  en: { title: "Event starts in", units },
};

export function getPrelaunchMessages(locale: Locale): PrelaunchMessages {
  return prelaunchMessages[locale];
}
