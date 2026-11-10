import Image from "next/image";
import { Fragment } from "react";

import { splitDescription } from "@/lib/awards/description-lines";
import type { AwardDetail, AwardPrize, AwardsMessages } from "@/lib/i18n/awards-messages";
import { ICON_DIAMOND, ICON_LICENSE, ICON_TARGET, MaskIcon } from "./mask-icon";

type Labels = Pick<AwardsMessages, "quantityLabel" | "prizeLabel" | "or">;
type AwardDetailSectionProps = { award: AwardDetail; labels: Labels; imageRight: boolean; isLast: boolean };

const LABEL = "text-2xl font-bold leading-8 text-saa-accent";
const BIG_VALUE = "text-4xl font-bold leading-11 text-saa-text";
const SMALL_TEXT = "text-sm font-bold leading-5 tracking-[0.1px] text-saa-text";
const Divider = () => <hr className="w-full border-saa-divider" />;

function Prize({ prize, label }: { prize: AwardPrize; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className={`flex items-center gap-4 ${LABEL}`}>
        <MaskIcon src={ICON_LICENSE} />
        {label}
      </p>
      <p className={BIG_VALUE}>{prize.amount}</p>
      {prize.note && <p className={SMALL_TEXT}>{prize.note}</p>}
    </div>
  );
}

// Justified paragraphs like Figma: a blank paragraph keeps one empty line, and
// a line separator starts a new line. The line before it keeps normal word
// spacing (not stretched to full width, as agreed with the user).
function Description({ text }: { text: string }) {
  return (
    <div className="text-justify text-base font-bold leading-6 tracking-[0.5px] text-saa-text">
      {splitDescription(text).map((lines, p) =>
        lines.length === 0 ? (
          <div key={p} aria-hidden className="h-6" />
        ) : (
          <p key={p}>
            {lines.map((line, l) => (
              <Fragment key={l}>
                {l > 0 && " "}
                <span className="block">{line}</span>
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

// D.x: 336px award picture + 480px content (title, description, quantity,
// prize value[s]); pictures alternate left / right. Divider below (not on
// the last award), 80px from the card.
export function AwardDetailSection({ award, labels, imageRight, isLast }: AwardDetailSectionProps) {
  const titleId = `${award.slug}-title`;
  return (
    <section id={award.slug} aria-labelledby={titleId} className="flex scroll-mt-[104px] flex-col gap-20">
      <div className={`flex flex-col gap-10 md:items-start ${imageRight ? "md:flex-row-reverse md:justify-end" : "md:flex-row"}`}>
        <Image
          src={`/home/award-${award.slug}.png`}
          alt=""
          width={336}
          height={336}
          // The exported artwork already includes the gold border and glow.
          className="size-[336px] max-w-full shrink-0 object-contain"
        />
        <div className="flex w-full max-w-[480px] flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h2 id={titleId} className={`flex items-center gap-4 ${LABEL}`}>
              <MaskIcon src={ICON_TARGET} />
              {award.title}
            </h2>
            <Description text={award.description} />
          </div>
          <Divider />
          <div className="flex flex-wrap items-center gap-4">
            <p className={`flex items-center gap-4 ${LABEL}`}>
              <MaskIcon src={ICON_DIAMOND} />
              {labels.quantityLabel}
            </p>
            <p className="flex items-center gap-2">
              <span className={BIG_VALUE}>{award.quantity}</span>
              <span className={`max-w-[66px] whitespace-pre-line ${SMALL_TEXT}`}>{award.unit}</span>
            </p>
          </div>
          <Divider />
          {award.prizes.map((prize, i) => (
            <Fragment key={prize.amount}>
              {i > 0 && (
                <p className="flex items-center gap-2 text-sm font-bold leading-5 tracking-[0.1px] text-saa-divider">
                  {labels.or}
                  <span aria-hidden className="h-px flex-1 bg-saa-divider" />
                </p>
              )}
              <Prize prize={prize} label={labels.prizeLabel} />
            </Fragment>
          ))}
        </div>
      </div>
      {!isLast && <Divider />}
    </section>
  );
}
