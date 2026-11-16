"use client";

import { useEffect, useRef, useState } from "react";

import { IMAGE_TYPES, WRITE_LIMITS, imageExtension } from "@/lib/kudos/write-kudo";
import { CloseIcon, PlusIcon } from "./write-kudo-icons";

export type PickedImage = { key: string; file: File; preview: string };

type ImagePickerProps = {
  value: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  label: string;
  maxText: string;
  removeText: string;
  rejectedText: string;
  labelledBy: string;
};

// F: 80x80 thumbnails (radius 18, 1px #998C5F) with a red 20px "x", then the
// "+ Image / Tối đa 5" button, hidden once 5 images are chosen. Files stay in
// the browser until "Gửi" (uploaded then), so a cancelled draft leaves nothing.
export function ImagePicker({ value, onChange, label, maxText, removeText, rejectedText, labelledBy }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState(false);

  // Free the object URLs when the dialog goes away.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  useEffect(() => () => latest.current.forEach((img) => URL.revokeObjectURL(img.preview)), []);

  const add = (files: FileList | null) => {
    if (!files) return;
    const room = WRITE_LIMITS.images - value.length;
    const all = [...files];
    const ok = all.filter((f) => imageExtension(f));
    setRejected(ok.length !== all.length || ok.length > room);
    const added = ok.slice(0, Math.max(room, 0)).map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
    if (added.length) onChange([...value, ...added]);
  };

  const remove = (key: string) => {
    const img = value.find((i) => i.key === key);
    if (img) URL.revokeObjectURL(img.preview);
    setRejected(false);
    onChange(value.filter((i) => i.key !== key));
  };

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        {value.map((img, i) => (
          <div key={img.key} data-testid="kudo-image-thumb" className="relative size-20 shrink-0 rounded-[18px] border border-saa-border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview */}
            <img src={img.preview} alt="" className="size-full rounded-[4px] border border-saa-accent object-cover" />
            <button
              type="button"
              aria-label={`${removeText} ${i + 1}`}
              onClick={() => remove(img.key)}
              className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-saa-badge text-white hover:brightness-110"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        ))}
        {value.length < WRITE_LIMITS.images && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-12 items-center gap-2 rounded-lg border border-saa-border bg-white px-2 py-1 text-left transition-colors hover:bg-saa-accent/30"
          >
            <PlusIcon className="size-6 text-saa-border" />
            <span className="flex flex-col">
              <span className="text-base font-bold leading-6 tracking-[0.15px] text-saa-bg">{label}</span>
              <span className="text-[11px] font-bold leading-4 tracking-[0.5px] text-saa-muted">{maxText}</span>
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {rejected && (
        <p role="alert" className="text-sm font-bold text-saa-badge">
          {rejectedText}
        </p>
      )}
    </div>
  );
}
