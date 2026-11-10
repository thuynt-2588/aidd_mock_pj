"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locale-config";

type LanguageSelectorProps = {
  current: Locale;
  onSelect: (locale: Locale) => void | Promise<void>;
};

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "vi", label: "VN" },
  { locale: "en", label: "EN" },
];

function Flag({ locale }: { locale: Locale }) {
  // Only the VN flag exists in the design; EN is text only.
  if (locale !== "vi") return null;
  return <Image src="/login/flag-vn.svg" alt="" width={24} height={24} className="size-6" />;
}

// Trigger 108x56, padding 16, radius 4; Montserrat 700 / 16px / 0.15px.
export function LanguageSelector({ current, onSelect }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentLabel = OPTIONS.find((o) => o.locale === current)?.label ?? "VN";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "flex h-14 w-full items-center gap-1 px-4 text-left text-base font-bold leading-6 tracking-[0.15px] text-saa-text transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${itemClass} w-[108px] justify-between gap-0.5 rounded focus-visible:outline-2 focus-visible:outline-white`}
      >
        <span className="flex items-center gap-1">
          <Flag locale={current} />
          {currentLabel}
        </span>
        <Image src="/login/chevron-down.svg" alt="" width={24} height={24} className="size-6" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-[108px] overflow-hidden rounded border border-saa-divider bg-saa-bg"
        >
          {OPTIONS.map(({ locale, label }) => (
            <button
              key={locale}
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await onSelect(locale);
              }}
              className={itemClass}
            >
              <Flag locale={locale} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
