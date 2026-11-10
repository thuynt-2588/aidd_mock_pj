import type { AwardsMessages } from "./awards-messages-types";

// English copy (proposed translation; Figma is Vietnamese-only).
// Award titles and slugs stay unchanged.
export const awardsMessagesEn: AwardsMessages = {
  caption: "Sun* Annual Awards 2025",
  title: "SAA 2025 award system",
  titleAlt: "ROOT FURTHER",
  menuLabel: "Award categories",
  quantityLabel: "Number of awards:",
  prizeLabel: "Prize value:",
  or: "Or",
  awards: [
    {
      slug: "top-talent",
      title: "Top Talent",
      description:
        "The Top Talent award honours all-round outstanding individuals – people who keep proving their solid expertise and exceptional performance, consistently deliver value beyond expectations, and are highly regarded by customers and teammates. Ready to take on any mission the organisation entrusts to them, they are a constant source of inspiration, motivation and positive influence for the whole team.",
      quantity: "10",
      unit: "Individuals",
      prizes: [{ amount: "7,000,000 VND", note: "per award" }],
    },
    {
      slug: "top-project",
      title: "Top Project",
      description:
        "The Top Project award honours outstanding project teams with business results beyond expectations, optimal operational efficiency and dedicated teamwork. These are projects of high technical complexity that optimise resources and costs well, propose valuable ideas to customers, deliver superior profit and receive positive customer feedback. Their members strictly follow internal development standards, setting an example of excellence and professionalism.",
      quantity: "02",
      unit: "Teams",
      prizes: [{ amount: "15,000,000 VND", note: "per award" }],
    },
    {
      slug: "top-project-leader",
      title: "Top Project Leader",
      description:
        "The Top Project Leader award honours outstanding project managers – people who combine solid management skills, a strong ability to inspire and an “Aim High – Be Agile” mindset in every problem and context. Under their leadership, members not only overcome challenges together and reach their goals, but also keep their passion and Wasshoi spirit alive and grow into better, happier versions of themselves.",
      quantity: "03",
      unit: "Individuals",
      prizes: [{ amount: "7,000,000 VND", note: "per award" }],
    },
    {
      slug: "best-manager",
      title: "Best Manager",
      description:
        "The Best Manager award honours exemplary leaders who led their teams to results beyond expectations, with a remarkable impact on business performance and the sustainable growth of the organisation. Under their leadership, the team conquers every goal through versatility, effective collaboration and a flexible, technology-driven mindset in the digital era. They inspire the team to become confident and energetic, ready to embrace – and even lead – revolutionary change.",
      quantity: "01",
      unit: "Individual",
      prizes: [{ amount: "10,000,000 VND" }],
    },
    {
      slug: "signature-2025-creator",
      title: "Signature 2025 - Creator",
      description:
        "The Signature award honours an individual or team that embodies the spirit Sun* is aiming for in each period.\n\nIn 2025, the Signature award honours the Creator – an individual or team with a proactive, sharp mindset who sees opportunity in every challenge and leads by acting first. They spot problems quickly and bring practical solutions that create clear value for projects, customers or the organisation. With a constructive mindset and Sun*'s signature “Creator” spirit, they do not just respond positively to change – they actively drive improvements and help set new standards for how Sun* people create value.",
      quantity: "01",
      unit: "Individual or team",
      prizes: [
        { amount: "5,000,000 VND", note: "for an individual winner" },
        { amount: "8,000,000 VND", note: "for a team winner" },
      ],
    },
    {
      slug: "mvp",
      title: "MVP (Most Valuable Person)",
      menuTitle: "MVP",
      description:
        "The MVP award honours the most outstanding individual of the year – the face that represents the whole Sun* community. They have shown exceptional ability, lasting dedication and far-reaching influence, leaving a strong mark on Sun*'s journey this year.\n\nBeyond outstanding performance and results, they are a source of inspiration through their thinking, actions and positive impact on the team. The MVP embodies every quality of an exemplary Sun* person and carries a great responsibility: to be a role model for the people and spirit of Sun*, helping lead the team to new heights.",
      quantity: "01",
      unit: "Individual",
      prizes: [{ amount: "15,000,000 VND" }],
    },
  ],
};
