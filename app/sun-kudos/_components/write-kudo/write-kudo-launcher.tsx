"use client";

import { useState } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { PenIcon } from "../kudos-icons";
import { WriteKudoDialog } from "./write-kudo-dialog";

type WriteKudoLauncherProps = { t: KudosMessages; hashtags: string[]; viewerId: string; className: string };

// A.1 "Hôm nay, bạn muốn gửi lời cảm ơn…" pill: opens "Viết Kudo". The dialog
// mounts on open, so every opening starts from an empty draft.
export function WriteKudoLauncher({ t, hashtags, viewerId, className }: WriteKudoLauncherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className={className}>
        <PenIcon />
        <span className="truncate">{t.sendPlaceholder}</span>
      </button>
      {open && <WriteKudoDialog t={t} hashtags={hashtags} viewerId={viewerId} onClose={() => setOpen(false)} />}
    </>
  );
}
