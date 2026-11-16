import type { ReactNode } from "react";

// B.1 / B.6 / C.1: caption (24/32) · 1px #2E3940 · title 57/64 #FFEA9E, with
// optional controls on the right of the title (filters).
export function KudosSectionHeader({ caption, title, children }: { caption: string; title: string; children?: ReactNode }) {
  return (
    <div data-testid="kudos-section-header" className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 lg:px-36">
      <p className="text-2xl font-bold leading-8 text-saa-text">{caption}</p>
      <div className="flex flex-wrap items-center justify-between gap-8 border-t border-saa-divider pt-4">
        <h2 className="text-4xl font-bold leading-[1.1] tracking-[-0.25px] text-saa-accent lg:text-[57px] lg:leading-16">{title}</h2>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
