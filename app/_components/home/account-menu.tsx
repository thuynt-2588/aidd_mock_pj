"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/lib/auth/sign-out-action";
import { PROFILE_PATH } from "./home-nav-items";

type AccountMenuProps = { label: string; profileLabel: string; signOutLabel: string };

const ITEM_CLASS =
  "flex h-12 w-full items-center px-4 text-left text-base font-bold leading-6 tracking-[0.15px] text-saa-text transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none";

// A1.8: 40x40 icon button (1px #998C5F border, radius 4) opening the account menu.
export function AccountMenu({ label, profileLabel, signOutLabel }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded border border-saa-border p-2.5 transition-colors hover:bg-saa-accent-soft focus-visible:outline-2 focus-visible:outline-saa-accent"
      >
        <Image src="/home/icon-user.svg" alt="" width={24} height={24} className="size-6" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded border border-saa-divider bg-saa-bg"
        >
          <Link role="menuitem" href={PROFILE_PATH} className={ITEM_CLASS} onClick={() => setOpen(false)}>
            {profileLabel}
          </Link>
          <form action={signOutAction}>
            <button type="submit" role="menuitem" className={ITEM_CLASS}>
              {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
