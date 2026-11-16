"use client";

import { useId, useRef, useState } from "react";

import type { SunnerOption } from "@/lib/kudos/write-kudo";
import { SunnerList } from "./sunner-list";
import { useSunnerSearch } from "./use-sunner-search";
import { CaretDownIcon } from "./write-kudo-icons";

type RecipientPickerProps = {
  inputId: string;
  value: SunnerOption | null;
  onChange: (s: SunnerOption | null) => void;
  placeholder: string;
  label: string;
  emptyText: string;
  loadingText: string;
  invalid: boolean;
  describedBy?: string;
};

// B.2: search field (white, 1px #998C5F, radius 8, 56 high, 16/24 padding)
// with the dropdown arrow. Typing filters other Sunners; picking one fills the
// field. Editing the text again clears the choice (a recipient must be picked).
export function RecipientPicker({ inputId, value, onChange, placeholder, label, emptyText, loadingText, invalid, describedBy }: RecipientPickerProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { results, loading } = useSunnerSearch(open ? text.trim() : null);

  const pick = (s: SunnerOption) => {
    onChange(s);
    setText(s.name);
    setOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        className={`flex h-14 items-center gap-2 rounded-lg border bg-white px-6 focus-within:outline-2 focus-within:outline-saa-border ${
          invalid ? "border-saa-badge" : "border-saa-border"
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results.length ? `${listId}-${active}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          maxLength={100}
          value={text}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setOpen(true);
            if (value) onChange(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && results[active]) {
              e.preventDefault();
              pick(results[active]);
            } else if (e.key === "Escape" && open) {
              // Close the list only, not the dialog.
              e.stopPropagation();
              setOpen(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-base font-bold leading-6 tracking-[0.15px] text-saa-bg outline-none placeholder:text-saa-muted"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={label}
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="text-saa-bg"
        >
          <CaretDownIcon />
        </button>
      </div>
      {open && (
        <SunnerList
          id={listId}
          label={label}
          results={results}
          loading={loading}
          active={active}
          emptyText={emptyText}
          loadingText={loadingText}
          onPick={pick}
          onHover={setActive}
          className="absolute inset-x-0 top-full mt-1"
        />
      )}
    </div>
  );
}
