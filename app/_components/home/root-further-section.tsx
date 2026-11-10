import Image from "next/image";

import type { HomeMessages } from "@/lib/i18n/home-messages";

type RootFurtherSectionProps = { t: HomeMessages };

// Figma uses one text node per block with plain line breaks, so paragraphs
// inside a block have no extra spacing between them.
const PARAGRAPH = "text-justify text-lg font-bold leading-7 text-saa-text lg:text-2xl lg:leading-8";

// B4 (frame y 881–2137): ROOT FURTHER art 290x134, 32px gap, then text spanning the
// full 1152px: intro (24/32) · quote (20/32, centred) · outro, 32px apart.
// Figma spaces this block ~102px from its neighbours instead of the page's
// 120px rhythm, hence the negative vertical margin.
export function RootFurtherSection({ t }: RootFurtherSectionProps) {
  const { intro, quote, quoteNote, outro } = t.rootFurther;
  return (
    <section className="mx-auto -my-[18px] flex w-full max-w-[1152px] flex-col items-center gap-8">
      <Image
        src="/login/root-further-title12.png"
        alt=""
        width={290}
        height={134}
        className="h-[134px] w-[290px] object-contain"
      />
      <div className="flex flex-col gap-8">
        <div>
          {intro.map((p) => (
            <p key={p.slice(0, 24)} className={PARAGRAPH}>
              {p}
            </p>
          ))}
        </div>
        <blockquote className="text-center text-xl font-bold leading-8 text-saa-text">
          <p>{quote}</p>
          <p>{quoteNote}</p>
        </blockquote>
        <div>
          {outro.map((p) => (
            <p key={p.slice(0, 24)} className={PARAGRAPH}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
