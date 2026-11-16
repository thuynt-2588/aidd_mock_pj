"use client";

import { useEffect, useId, useRef, useState } from "react";

import { WRITE_LIMITS } from "@/lib/kudos/write-kudo";
import { CheckCircleIcon, CloseIcon, PlusIcon } from "./write-kudo-icons";

type HashtagPickerProps = {
  options: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  label: string;
  maxText: string;
  removeText: string;
  invalid: boolean;
  labelledBy: string;
};

// E.2: chips of the chosen hashtags + the "+ Hashtag / Tối đa 5" button
// (white, 1px #998C5F, radius 8, 48 high). The list (p9zO-c4a4x) comes from
// the hashtags table: click toggles, chosen rows are darker with a check, and
// once 5 are chosen the other rows are disabled.
export function HashtagPicker({ options, value, onChange, label, maxText, removeText, invalid, labelledBy }: HashtagPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const full = value.length >= WRITE_LIMITS.hashtags;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const toggle = (tag: string) => {
    if (value.includes(tag)) onChange(value.filter((t) => t !== tag));
    else if (!full) onChange([...value, tag]);
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={labelledBy}
      className="relative flex min-w-0 flex-1 flex-wrap items-center gap-2"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          // Close the list only, not the dialog.
          e.stopPropagation();
          setOpen(false);
        }
      }}
    >
      {value.map((tag) => (
        <span key={tag} className="flex h-12 items-center gap-1 rounded-lg border border-saa-border bg-white py-1 pl-3 pr-2 text-base font-bold leading-6 text-saa-bg">
          {tag}
          <button
            type="button"
            aria-label={`${removeText} ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="flex size-6 items-center justify-center rounded-full hover:bg-saa-accent/60"
          >
            <CloseIcon className="size-4" />
          </button>
        </span>
      ))}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className={`flex h-12 items-center gap-2 rounded-lg border bg-white px-2 py-1 text-left transition-colors hover:bg-saa-accent/30 ${
            invalid ? "border-saa-badge" : "border-saa-border"
          }`}
        >
          <PlusIcon className="size-6 text-saa-border" />
          <span className="flex flex-col">
            <span className="text-base font-bold leading-6 tracking-[0.15px] text-saa-bg">{label}</span>
            <span className="text-[11px] font-bold leading-4 tracking-[0.5px] text-saa-muted">{maxText}</span>
          </span>
        </button>
        {open && (
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable
            className="absolute left-0 top-full z-50 mt-1 flex max-h-80 w-[318px] flex-col overflow-y-auto rounded-lg border border-saa-border bg-saa-container-2 p-1.5"
          >
            {options.map((tag) => {
              const selected = value.includes(tag);
              const disabled = !selected && full;
              return (
                <div
                  key={tag}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !disabled && toggle(tag)}
                  className={`flex h-10 shrink-0 items-center justify-between gap-2 rounded-[2px] px-4 text-base font-bold leading-6 tracking-[0.15px] text-saa-text ${
                    selected ? "bg-saa-accent-selected" : disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-white/10"
                  }`}
                >
                  <span className="truncate">{tag}</span>
                  {selected ? <CheckCircleIcon className="size-6 text-white" /> : <span className="size-6" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
