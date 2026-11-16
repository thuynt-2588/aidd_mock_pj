"use client";

import { useEffect, useId, useRef, useState } from "react";

import { MAX_URL } from "@/lib/kudos/kudo-doc";
import { WRITE_LIMITS, validateLink, type DraftError } from "@/lib/kudos/write-kudo";
import type { WriteKudoMessages } from "@/lib/i18n/kudos-messages";
import { LinkToolIcon, CloseIcon } from "./write-kudo-icons";

type AddLinkBoxProps = {
  initialText: string;
  t: WriteKudoMessages;
  onSave: (text: string, url: string) => void;
  onCancel: () => void;
};

const INPUT =
  "h-14 min-w-0 flex-1 rounded-lg border bg-white px-6 text-base font-bold leading-6 tracking-[0.15px] text-saa-bg outline-none focus:outline-2 focus:outline-saa-border";

// "Thêm đường dẫn" (MoMorph OyDLDuSGEa): 752 wide, cream, radius 24, padding 40.
// Nội dung 1–100 chars, URL http(s) 5–2048; "Lưu" validates, "Hủy" / Esc close.
export function AddLinkBox({ initialText, t, onSave, onCancel }: AddLinkBoxProps) {
  const titleId = useId();
  const textId = useId();
  const urlId = useId();
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<{ text?: DraftError; url?: DraftError }>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const message = (e?: DraftError, isUrl = false) =>
    e === "required" ? t.errors.required : e === "tooLong" ? t.errors.tooLong : e ? (isUrl ? t.errors.url : t.errors.invalid) : null;

  const save = () => {
    const found = validateLink(text, url);
    setErrors(found);
    if (!found.text && !found.url) onSave(text.trim(), url.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-saa-bg/60 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          } else if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
        className="flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-saa-card p-6 sm:p-10"
      >
        <h2 id={titleId} className="text-[32px] font-bold leading-10 text-saa-bg">
          {t.link.title}
        </h2>
        {(
          [
            [textId, t.link.text, text, setText, errors.text, WRITE_LIMITS.linkText, false],
            [urlId, t.link.url, url, setUrl, errors.url, MAX_URL, true],
          ] as const
        ).map(([id, label, value, set, error, max, isUrl], i) => (
          <div key={id} className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label htmlFor={id} className="shrink-0 text-[22px] font-bold leading-7 text-saa-bg">
                {label}
              </label>
              <input
                ref={i === 0 ? firstRef : undefined}
                id={id}
                type={isUrl ? "url" : "text"}
                value={value}
                maxLength={max}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(e) => set(e.target.value)}
                className={`${INPUT} ${error ? "border-saa-badge" : "border-saa-border"}`}
              />
            </div>
            {error && (
              <p id={`${id}-error`} className="text-right text-sm font-bold text-saa-badge">
                {message(error, isUrl)}
              </p>
            )}
          </div>
        ))}
        <div className="flex gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[60px] items-center gap-2 rounded border border-saa-border bg-saa-accent-soft px-10 text-base font-bold text-saa-bg hover:bg-saa-accent/40"
          >
            {t.cancel}
            <CloseIcon />
          </button>
          <button
            type="button"
            onClick={save}
            className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-lg bg-saa-accent text-[22px] font-bold leading-7 text-saa-bg hover:brightness-95"
          >
            {t.link.save}
            <LinkToolIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
