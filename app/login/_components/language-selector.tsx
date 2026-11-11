"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locale-config";

type LanguageSelectorProps = {
  current: Locale;
  onSelect: (locale: Locale) => void | Promise<void>;
};

const OPTIONS: { locale: Locale; label: string; flag: string }[] = [
  { locale: "vi", label: "VN", flag: "/login/flag-vn.svg" },
  { locale: "en", label: "EN", flag: "/login/flag-en.svg" },
];

// Figma "IC" 24x24 slot holding a 20x15 flag (exported flags are 20x15).
function Flag({ src }: { src: string }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center">
      <Image src={src} alt="" width={20} height={15} className="h-[15px] w-5" />
    </span>
  );
}

const TEXT = "text-base font-bold leading-6 tracking-[0.15px] text-saa-text";

// Trigger 108x56, padding 16, radius 4; Montserrat 700 / 16px / 0.15px.
// List = "Dropdown-ngôn ngữ" (MoMorph hUyaaugye2, Figma 721:4942):
// 1px #998C5F border, #00070C, radius 8, padding 6; items 110x56, the
// selected one highlighted rgba(255,234,158,0.2) with radius 2.
export function LanguageSelector({ current, onSelect }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = OPTIONS.find((o) => o.locale === current) ?? OPTIONS[0];

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${TEXT} flex h-14 w-[108px] items-center justify-between gap-0.5 rounded px-4 transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-white`}
      >
        <span className="flex items-center gap-1">
          <Flag src={selected.flag} />
          {selected.label}
        </span>
        <Image src="/login/chevron-down.svg" alt="" width={24} height={24} className="size-6" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 flex flex-col rounded-lg border border-saa-border bg-saa-container-2 p-1.5"
        >
          {OPTIONS.map(({ locale, label, flag }) => {
            const isSelected = locale === current;
            return (
              <button
                key={locale}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={async () => {
                  setOpen(false);
                  if (!isSelected) await onSelect(locale);
                }}
                className={`${TEXT} flex h-14 w-[110px] items-center gap-1 rounded-[2px] px-4 text-left transition-colors focus-visible:outline-none ${
                  isSelected
                    ? "bg-saa-accent-selected"
                    : "hover:bg-white/10 focus-visible:bg-white/10"
                }`}
              >
                <Flag src={flag} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
