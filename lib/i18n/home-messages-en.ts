import type { HomeMessages } from "./home-messages-types";
import { homeMessagesVi } from "./home-messages-vi";

// English copy (proposed translation; Figma is Vietnamese-only).
// Proper names (ROOT FURTHER, Sun* Kudos, award titles) stay unchanged.
export const homeMessagesEn: HomeMessages = {
  ...homeMessagesVi,
  nav: { ...homeMessagesVi.nav, standards: "General standards" },
  notificationsLabel: "Notifications",
  accountLabel: "Account",
  event: {
    timeLabel: "Date:",
    timeValue: "26/12/2025",
    placeLabel: "Venue:",
    placeValue: "Âu Cơ Art Center",
    broadcast: "Live-streamed online",
  },
  rootFurther: {
    intro: [
      "Facing the storm-like changes of the AI era and ever-higher customer expectations, Sun* has chosen to diversify its capabilities — not only to excel in its own field, but to reach a higher goal where every Sunner is a “problem-solver”: an expert at solving every problem for projects, customers and society.",
      "Inspired by diverse capabilities, flexible growth and the drive to dig deep and break through in the AI era, “Root Further” was chosen as the official theme of the Sun* Annual Awards 2025.",
      "Beyond its surface meaning, “Root Further” is our journey of reaching further and rooting deeper, touching hidden “geological” layers so we can keep growing and nurture the burning passion of Sun* people to create value. Like roots that keep pushing through every layer of “sediment” to absorb the very best, Sun* people “absorb” nourishment from the times and the market’s challenges to renew themselves every day, broaden their capabilities and firmly “take root” in the AI era — a brand-new, complex and unpredictable layer that also holds countless possibilities.",
    ],
    quote: homeMessagesVi.rootFurther.quote,
    quoteNote: "(An English proverb)",
    outro: [
      "In a storm, only trees with strong enough roots stand firm. An organisation of people who believe in their diverse capabilities, embrace challenges and master change is not only steady in turbulent times but also turns every advantage to account. More than the name of a new chapter, “Root Further” is an encouragement for each of us to believe in ourselves, dig deeper, unlock our potential, break our limits and become our most versatile and outstanding selves. In the AI era, diverse capabilities and harnessing the moment are the preconditions for lasting success.",
      "No one knows how many mysterious “geological” layers still lie deep within the technology industry and modern markets. But once “Root Further” becomes our root spirit, we will not be afraid — we will be eager to meet every unknown on the road ahead, because we believe that within those endless realms, wonders and opportunities to rise are waiting for us.",
    ],
  },
  awardsSection: {
    caption: "Sun* annual awards 2025",
    title: "Award categories",
    detail: "Details",
    items: [
      { slug: "top-talent", title: "Top Talent", description: "Honouring the top individuals who excel in every respect" },
      { slug: "top-project", title: "Top Project", description: "Honouring outstanding projects in every respect, with remarkable revenue" },
      { slug: "top-project-leader", title: "Top Project Leader", description: "Honouring leaders who inspire and drive their projects to break through" },
      { slug: "best-manager", title: "Best Manager", description: "Honouring managers who manage well and lead their teams" },
      { slug: "signature-2025-creator", title: "Signature 2025 - Creator", description: "Honouring managers who manage well and lead their teams" },
      { slug: "mvp", title: "MVP (Most Valuable Person)", description: "Honouring managers who manage well and lead their teams" },
    ],
  },
  kudos: {
    label: "Recognition movement",
    title: "Sun* Kudos",
    highlight: "NEW IN SAA 2025",
    body: "A movement to recognise and thank colleagues — held for every Sunner for the first time. Launching in November 2025, it encourages Sun* people to share recognition and thanks on the system announced by the organising committee. These messages will help the Heads Council when choosing the winners.",
    detail: "Details",
    imageAlt: "Sun* Kudos",
  },
  widgetLabel: "Quick actions",
  copyright: "Copyright by Sun* © 2025",
};
