"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-messages";
import { kudoDocToText, type KudoDoc } from "@/lib/kudos/kudo-doc";
import {
  KUDO_IMAGE_BUCKET,
  WRITE_LIMITS,
  imageExtension,
  isDraftComplete,
  type DraftError,
  type DraftErrors,
  type DraftField,
  type SunnerOption,
} from "@/lib/kudos/write-kudo";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import { createKudoAction } from "../../actions";
import { useToast } from "../kudos-toast";
import { HashtagPicker } from "./hashtag-picker";
import { ImagePicker, type PickedImage } from "./image-picker";
import { KudoEditor } from "./kudo-editor";
import { RecipientPicker } from "./recipient-picker";
import { CloseIcon, SendPlaneIcon } from "./write-kudo-icons";

export const COMMUNITY_STANDARDS_PATH = "/sun-kudos/community-standards";

type WriteKudoDialogProps = {
  t: KudosMessages;
  hashtags: string[];
  viewerId: string;
  onClose: () => void;
};

const LABEL = "shrink-0 text-[22px] font-bold leading-7 text-saa-bg";
const INPUT =
  "h-14 w-full rounded-lg border bg-white px-6 text-base font-bold leading-6 tracking-[0.15px] text-saa-bg outline-none placeholder:text-saa-muted focus:outline-2 focus:outline-saa-border";

function Required() {
  return (
    <span aria-hidden className="ml-0.5 align-top text-base text-saa-badge">
      *
    </span>
  );
}

// "Viết Kudo" (MoMorph ihQ26W78P2, Figma 520:11602): 752-wide cream modal
// (radius 24, padding 40, 32 between rows) over a rgba(0,16,26,.8) mask.
export function WriteKudoDialog({ t, hashtags, viewerId, onClose }: WriteKudoDialogProps) {
  const w = t.write;
  const toast = useToast();
  const ids = { title: useId(), recipient: useId(), badge: useId(), hashtag: useId(), image: useId(), alias: useId(), form: useId() };
  const panelRef = useRef<HTMLDivElement>(null);

  const [recipient, setRecipient] = useState<SunnerOption | null>(null);
  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState<KudoDoc>({ version: 1, blocks: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [alias, setAlias] = useState("");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const contentText = kudoDocToText(doc);
  const overLimit = contentText.length > WRITE_LIMITS.content;
  const complete = isDraftComplete({ receiverId: recipient?.id ?? null, title, contentText, hashtags: tags, anonymous, anonymousName: alias }) && !overLimit;
  const fmt = (n: number) => n.toLocaleString(w.numberLocale);

  // Lock the page behind the modal; give focus back to A.1 when it closes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById(ids.recipient)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [ids.recipient]);

  const close = () => !pending && onClose();
  const clearError = (field: DraftField) => errors[field] && setErrors((e) => ({ ...e, [field]: undefined }));

  const message = (field: DraftField, e?: DraftError) => {
    if (!e) return null;
    if (field === "receiver" && e === "invalid") return w.errors.receiver;
    return w.errors[e];
  };

  const fieldError = (field: DraftField): ReactNode => {
    const text = message(field, errors[field]);
    return text ? (
      <p id={`${ids.form}-${field}`} role="alert" className="text-sm font-bold leading-5 text-saa-badge">
        {text}
      </p>
    ) : null;
  };

  const describedBy = (field: DraftField) => (errors[field] ? `${ids.form}-${field}` : undefined);

  async function uploadImages(): Promise<{ urls: string[]; paths: string[] }> {
    if (!images.length) return { urls: [], paths: [] };
    const supabase = createBrowserSupabaseClient();
    const bucket = supabase.storage.from(KUDO_IMAGE_BUCKET);
    const paths: string[] = [];
    try {
      for (const img of images) {
        const path = `${viewerId}/${crypto.randomUUID()}.${imageExtension(img.file)}`;
        const { error } = await bucket.upload(path, img.file, { contentType: img.file.type, upsert: false });
        if (error) throw error;
        paths.push(path);
      }
    } catch (error) {
      if (paths.length) await bucket.remove(paths);
      throw error;
    }
    return { urls: paths.map((p) => bucket.getPublicUrl(p).data.publicUrl), paths };
  }

  async function submit() {
    if (!complete || pending) return;
    setPending(true);
    setFormError(null);
    let uploaded: string[] = [];
    try {
      let imageUrls: string[];
      try {
        const up = await uploadImages();
        imageUrls = up.urls;
        uploaded = up.paths;
      } catch {
        setFormError(w.errors.upload);
        return;
      }
      const result = await createKudoAction({
        receiverId: recipient?.id ?? null,
        title,
        doc,
        hashtags: tags,
        imageUrls,
        anonymous,
        anonymousName: alias,
      });
      if (result.ok) {
        uploaded = [];
        toast(w.sent);
        onClose();
        return;
      }
      setErrors(result.errors);
      if (result.failed || Object.keys(result.errors).length === 0) setFormError(w.errors.failed);
    } catch {
      setFormError(w.errors.failed);
    } finally {
      if (uploaded.length) await createBrowserSupabaseClient().storage.from(KUDO_IMAGE_BUCKET).remove(uploaded);
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-saa-bg/80"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="flex min-h-full items-start justify-center px-4 py-2.5" onMouseDown={(e) => e.target === e.currentTarget && close()}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ids.title}
          aria-busy={pending || undefined}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            }
          }}
          className="flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-saa-card p-6 text-saa-bg sm:p-10"
        >
          {/* A */}
          <h2 id={ids.title} className="text-center text-2xl font-bold leading-8 sm:text-[32px] sm:leading-10">
            {w.title}
          </h2>

          {/* B: Người nhận */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor={ids.recipient} className={LABEL}>
                {w.recipient}
                <Required />
              </label>
              <RecipientPicker
                inputId={ids.recipient}
                value={recipient}
                onChange={(s) => {
                  setRecipient(s);
                  clearError("receiver");
                }}
                placeholder={w.recipientPlaceholder}
                label={w.recipient}
                emptyText={w.noSunner}
                loadingText={w.searching}
                invalid={!!errors.receiver}
                describedBy={describedBy("receiver")}
              />
            </div>
            {fieldError("receiver")}
          </div>

          {/* Danh hiệu (Frame 552) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <label htmlFor={ids.badge} className={`${LABEL} sm:pt-3.5`}>
              {w.badge}
              <Required />
            </label>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <input
                id={ids.badge}
                value={title}
                maxLength={WRITE_LIMITS.title}
                placeholder={w.badgePlaceholder}
                aria-invalid={!!errors.title || undefined}
                aria-describedby={[`${ids.badge}-hint`, describedBy("title")].filter(Boolean).join(" ")}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                className={`${INPUT} ${errors.title ? "border-saa-badge" : "border-saa-border"}`}
              />
              {fieldError("title")}
              <p id={`${ids.badge}-hint`} className="whitespace-pre-line text-base font-bold leading-6 tracking-[0.15px] text-saa-muted">
                {w.badgeHint}
              </p>
            </div>
          </div>

          {/* Content: C + D, E, F (24 apart) */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <KudoEditor
                t={w}
                communityHref={COMMUNITY_STANDARDS_PATH}
                invalid={!!errors.content}
                describedBy={describedBy("content")}
                onChange={(d) => {
                  setDoc(d);
                  clearError("content");
                }}
              />
              {fieldError("content")}
              {/* D.1: hint (left) + character counter (right, #999; red over the limit). */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-base font-bold leading-6 tracking-[0.5px] text-saa-bg">{w.mentionHint}</p>
                <p
                  data-testid="kudo-counter"
                  aria-label={`${w.counterLabel}: ${contentText.length}/${WRITE_LIMITS.content}`}
                  className={`shrink-0 text-base font-bold leading-6 tracking-[0.5px] ${overLimit ? "text-saa-badge" : "text-saa-muted"}`}
                >
                  {fmt(contentText.length)}/{fmt(WRITE_LIMITS.content)}
                </p>
              </div>
            </div>

            {/* E: Hashtag */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <span id={ids.hashtag} className={`${LABEL} sm:pt-2.5`}>
                  {w.hashtag}
                  <Required />
                </span>
                <HashtagPicker
                  options={hashtags}
                  value={tags}
                  onChange={(next) => {
                    setTags(next);
                    clearError("hashtags");
                  }}
                  label={w.hashtag}
                  maxText={w.hashtagMax}
                  removeText={w.removeHashtag}
                  invalid={!!errors.hashtags}
                  labelledBy={ids.hashtag}
                />
              </div>
              {fieldError("hashtags")}
            </div>

            {/* F: Image */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span id={ids.image} className={LABEL}>
                  {w.image}
                </span>
                <ImagePicker
                  value={images}
                  onChange={(next) => {
                    setImages(next);
                    clearError("images");
                  }}
                  label={w.image}
                  maxText={w.imageMax}
                  removeText={w.removeImage}
                  rejectedText={w.imageRejected}
                  labelledBy={ids.image}
                />
              </div>
              {fieldError("images")}
            </div>
          </div>

          {/* G: Gửi ẩn danh */}
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer items-center gap-4">
              {/* 24px box, radius 4, 1px #999 on white; checked = gold (#998C5F)
                  with a white tick. The real (transparent) checkbox sits on top. */}
              <span className="relative flex size-6 shrink-0">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="peer absolute inset-0 z-10 size-6 cursor-pointer opacity-0"
                />
                <span
                  aria-hidden
                  className="flex size-6 items-center justify-center rounded border border-saa-muted bg-white text-white peer-checked:border-saa-border peer-checked:bg-saa-border peer-focus-visible:outline-2 peer-focus-visible:outline-saa-border"
                >
                  {anonymous && (
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="m6 12 4 4 8-8" />
                    </svg>
                  )}
                </span>
              </span>
              <span className={`text-lg font-bold leading-7 sm:text-[22px] ${anonymous ? "text-saa-bg" : "text-saa-muted"}`}>{w.anonymous}</span>
            </label>
            {anonymous && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <label htmlFor={ids.alias} className={LABEL}>
                    {w.anonymousName}
                    <Required />
                  </label>
                  <input
                    id={ids.alias}
                    value={alias}
                    maxLength={WRITE_LIMITS.alias}
                    required
                    aria-required
                    placeholder={w.anonymousPlaceholder}
                    aria-invalid={!!errors.anonymousName || undefined}
                    aria-describedby={describedBy("anonymousName")}
                    onChange={(e) => {
                      setAlias(e.target.value);
                      clearError("anonymousName");
                    }}
                    className={`${INPUT} min-w-0 flex-1 ${errors.anonymousName ? "border-saa-badge" : "border-saa-border"}`}
                  />
                </div>
                {fieldError("anonymousName")}
              </div>
            )}
          </div>

          {formError && (
            <p role="alert" className="-mb-4 text-center text-base font-bold text-saa-badge">
              {formError}
            </p>
          )}

          {/* H: Hủy + Gửi */}
          <div className="flex gap-4 sm:gap-6">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="flex h-[60px] shrink-0 items-center gap-2 rounded border border-saa-border bg-saa-accent-soft px-6 text-base font-bold leading-6 text-saa-bg transition-colors hover:bg-saa-accent/40 disabled:opacity-50 sm:px-10"
            >
              {w.cancel}
              <CloseIcon />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!complete || pending}
              aria-label={w.send}
              className="flex h-[60px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-saa-accent p-4 text-[22px] font-bold leading-7 text-saa-bg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            >
              {pending ? w.sending : w.send}
              <SendPlaneIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
