"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { kudosFilterHref, type KudosFilters } from "@/lib/kudos/filters";
import { ChevronDownIcon } from "./kudos-icons";

type FilterDropdownProps = {
  label: string;
  allLabel: string;
  field: keyof KudosFilters;
  options: string[];
  filters: KudosFilters;
};

// B.1.1 Hashtag / B.1.2 Phòng ban: pill button (rgba(255,234,158,.1), 1px
// #998C5F, radius 4) opening a list styled like the language dropdown.
// Choosing an option rewrites the URL; Highlight and All Kudos both re-read it.
export function FilterDropdown({ label, allLabel, field, options, filters }: FilterDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = filters[field];

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

  const choose = (value: string | null) => {
    setOpen(false);
    router.push(kudosFilterHref({ ...filters, [field]: value }), { scroll: false });
  };

  const item = (value: string | null, text: string) => {
    const active = value === selected;
    return (
      <button
        key={text}
        type="button"
        role="menuitemradio"
        aria-checked={active}
        onClick={() => choose(value)}
        className={`flex h-11 w-full items-center whitespace-nowrap rounded-[2px] px-4 text-left text-base font-bold leading-6 tracking-[0.15px] text-saa-text ${
          active ? "bg-saa-accent-selected" : "hover:bg-white/10"
        }`}
      >
        {text}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-14 items-center gap-2 rounded border border-saa-border p-4 text-base font-bold leading-6 tracking-[0.15px] text-saa-text transition-colors hover:bg-saa-accent-selected ${
          selected ? "bg-saa-accent-selected" : "bg-saa-accent-soft"
        }`}
      >
        {selected ?? label}
        <ChevronDownIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full z-40 mt-1 flex max-h-80 min-w-full flex-col overflow-y-auto rounded-lg border border-saa-border bg-saa-container-2 p-1.5"
        >
          {item(null, allLabel)}
          {options.map((o) => item(o, o))}
        </div>
      )}
    </div>
  );
}
