// Shape of every string shown on the Homepage (MoMorph i87tDx10uM).

export type AwardSlug =
  | "top-talent"
  | "top-project"
  | "top-project-leader"
  | "best-manager"
  | "signature-2025-creator"
  | "mvp";

export type AwardCopy = { slug: AwardSlug; title: string; description: string };

export interface HomeMessages {
  nav: { about: string; awards: string; kudos: string; standards: string };
  notificationsLabel: string;
  accountLabel: string;
  accountMenu: { profile: string; signOut: string };
  logoAlt: string;
  titleAlt: string;
  countdown: { comingSoon: string; days: string; hours: string; minutes: string };
  event: { timeLabel: string; timeValue: string; placeLabel: string; placeValue: string; broadcast: string };
  cta: { awards: string; kudos: string };
  rootFurther: { intro: string[]; quote: string; quoteNote: string; outro: string[] };
  awardsSection: { caption: string; title: string; detail: string; items: AwardCopy[] };
  kudos: { label: string; title: string; highlight: string; body: string; detail: string; imageAlt: string };
  widgetLabel: string;
  copyright: string;
}
