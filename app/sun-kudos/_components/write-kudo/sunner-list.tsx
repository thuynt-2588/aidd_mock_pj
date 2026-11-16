"use client";

import type { SunnerOption } from "@/lib/kudos/write-kudo";
import { KudoAvatar } from "../kudo-person";

type SunnerListProps = {
  id: string;
  label: string;
  results: SunnerOption[];
  loading: boolean;
  active: number;
  emptyText: string;
  loadingText: string;
  onPick: (s: SunnerOption) => void;
  onHover: (index: number) => void;
  className?: string;
};

// Dropdown of Sunners (recipient B.2 and "@" mentions), styled like the
// hashtag list (p9zO-c4a4x): #00070C, 1px #998C5F, white bold text.
export function SunnerList({ id, label, results, loading, active, emptyText, loadingText, onPick, onHover, className = "" }: SunnerListProps) {
  return (
    <div
      id={id}
      role="listbox"
      aria-label={label}
      className={`z-50 flex max-h-72 flex-col overflow-y-auto rounded-lg border border-saa-border bg-saa-container-2 p-1.5 ${className}`}
    >
      {results.length === 0 ? (
        <p className="px-4 py-3 text-base font-bold leading-6 text-saa-muted">{loading ? loadingText : emptyText}</p>
      ) : (
        results.map((s, i) => (
          <div
            key={s.id}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === active}
            // mousedown keeps the focus (and the caret) where it is.
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(s);
            }}
            onMouseEnter={() => onHover(i)}
            className={`flex cursor-pointer items-center gap-3 rounded-[2px] px-3 py-2 text-saa-text ${i === active ? "bg-saa-accent-selected" : ""}`}
          >
            <KudoAvatar name={s.name} url={s.avatarUrl} size={32} />
            <span className="min-w-0 flex-1 truncate text-base font-bold leading-6 tracking-[0.15px]">{s.name}</span>
            {s.department && <span className="text-sm font-bold text-saa-muted">{s.department}</span>}
          </div>
        ))
      )}
    </div>
  );
}
