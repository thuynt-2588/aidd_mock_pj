import type { Locale } from "./locale-config";
import { awardsMessagesEn } from "./awards-messages-en";
import type { AwardsMessages } from "./awards-messages-types";
import { awardsMessagesVi } from "./awards-messages-vi";

export type { AwardDetail, AwardPrize, AwardsMessages } from "./awards-messages-types";

const awardsMessages: Record<Locale, AwardsMessages> = { vi: awardsMessagesVi, en: awardsMessagesEn };

export function getAwardsMessages(locale: Locale): AwardsMessages {
  return awardsMessages[locale];
}
