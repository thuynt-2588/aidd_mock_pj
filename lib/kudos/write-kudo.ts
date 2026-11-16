import { kudoDocToText, normalizeKudoDoc, safeHref, type KudoDoc } from "./kudo-doc";

// "Viết Kudo" (ihQ26W78P2) rules, shared by the dialog (to enable "Gửi" and
// show errors) and createKudoAction (to reject bad input before the RPC,
// which checks the same rules again in SQL).

export const WRITE_LIMITS = {
  title: 100,
  content: 1000,
  hashtags: 5,
  images: 5,
  alias: 50,
  imageBytes: 5 * 1024 * 1024,
  linkText: 100,
} as const;

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
const IMAGE_EXT: Record<(typeof IMAGE_TYPES)[number], string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type DraftField = "receiver" | "title" | "content" | "hashtags" | "images" | "anonymousName";
export type DraftError = "required" | "tooLong" | "tooMany" | "invalid";
export type DraftErrors = Partial<Record<DraftField, DraftError>>;

export type KudoDraftInput = {
  receiverId: string | null;
  title: string;
  doc: KudoDoc;
  hashtags: string[];
  imageUrls: string[];
  anonymous: boolean;
  anonymousName: string;
};

export type CleanKudoDraft = {
  receiverId: string;
  title: string;
  content: string;
  doc: KudoDoc;
  hashtags: string[];
  imageUrls: string[];
  anonymous: boolean;
  anonymousName: string | null;
};

export const KUDO_IMAGE_BUCKET = "kudo-images";

/** Public URL of a user's folder in the kudo-images bucket (trailing slash). */
export function kudoImageFolderUrl(supabaseUrl: string, userId: string): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${KUDO_IMAGE_BUCKET}/${userId}/`;
}

export type SunnerOption = { id: string; name: string; avatarUrl: string | null; department: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** H.2: "Gửi" is enabled once the required fields have something in them
 * (the four always-required ones, plus the nickname when sending anonymously). */
export function isDraftComplete(d: {
  receiverId: string | null;
  title: string;
  contentText: string;
  hashtags: string[];
  anonymous?: boolean;
  anonymousName?: string;
}): boolean {
  if (d.anonymous && !d.anonymousName?.trim()) return false;
  return !!d.receiverId && d.title.trim() !== "" && d.contentText.trim() !== "" && d.hashtags.length > 0;
}

/** F: png / jpeg / webp / gif up to 5 MB. Returns the file extension or null. */
export function imageExtension(file: { type: string; size: number }): string | null {
  if (file.size <= 0 || file.size > WRITE_LIMITS.imageBytes) return null;
  return (IMAGE_EXT as Record<string, string>)[file.type] ?? null;
}

/** C.5 "Thêm đường dẫn": Nội dung 1–100 chars (not only spaces), URL http(s) 5–2048. */
export function validateLink(text: string, url: string): { text?: DraftError; url?: DraftError } {
  const errors: { text?: DraftError; url?: DraftError } = {};
  const t = text.trim();
  if (!t) errors.text = "required";
  else if (t.length > WRITE_LIMITS.linkText) errors.text = "tooLong";
  if (!url.trim()) errors.url = "required";
  else if (!safeHref(url)) errors.url = "invalid";
  return errors;
}

/**
 * Validates untrusted input. `imageUrlPrefix` is the public URL of the
 * sender's own folder in the kudo-images bucket: other URLs are rejected.
 */
export function validateKudoDraft(
  input: unknown,
  ctx: { senderId: string; imageUrlPrefix: string; knownHashtags?: readonly string[] },
): { ok: true; value: CleanKudoDraft } | { ok: false; errors: DraftErrors } {
  const errors: DraftErrors = {};
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;

  const receiverId = typeof raw.receiverId === "string" && UUID.test(raw.receiverId) ? raw.receiverId.toLowerCase() : null;
  if (!raw.receiverId) errors.receiver = "required";
  else if (!receiverId || receiverId === ctx.senderId.toLowerCase()) errors.receiver = "invalid";

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) errors.title = "required";
  else if (title.length > WRITE_LIMITS.title) errors.title = "tooLong";

  const doc = normalizeKudoDoc(raw.doc);
  const content = doc ? kudoDocToText(doc) : "";
  if (!doc) errors.content = "invalid";
  else if (!content) errors.content = "required";
  else if (content.length > WRITE_LIMITS.content) errors.content = "tooLong";

  const tags = Array.isArray(raw.hashtags) ? raw.hashtags : null;
  const hashtags = tags && tags.every((t) => typeof t === "string") ? [...new Set(tags as string[])] : null;
  if (!hashtags) errors.hashtags = "invalid";
  else if (hashtags.length === 0) errors.hashtags = "required";
  else if (hashtags.length > WRITE_LIMITS.hashtags) errors.hashtags = "tooMany";
  else if (ctx.knownHashtags && hashtags.some((t) => !ctx.knownHashtags!.includes(t))) errors.hashtags = "invalid";

  const urls = Array.isArray(raw.imageUrls) ? raw.imageUrls : raw.imageUrls === undefined ? [] : null;
  const imageUrls = urls && urls.every((u) => typeof u === "string") ? (urls as string[]) : null;
  if (!imageUrls) errors.images = "invalid";
  else if (imageUrls.length > WRITE_LIMITS.images) errors.images = "tooMany";
  else if (imageUrls.some((u) => !u.startsWith(ctx.imageUrlPrefix) || !/^[0-9a-f-]{36}\.(png|jpe?g|webp|gif)$/.test(u.slice(ctx.imageUrlPrefix.length)))) {
    errors.images = "invalid";
  }

  const anonymous = raw.anonymous === true;
  const alias = typeof raw.anonymousName === "string" ? raw.anonymousName.trim() : "";
  // G: "Nickname ẩn danh" is required (1–50) once "ẩn danh" is ticked.
  if (anonymous && !alias) errors.anonymousName = "required";
  else if (anonymous && alias.length > WRITE_LIMITS.alias) errors.anonymousName = "tooLong";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      receiverId: receiverId!,
      title,
      content,
      doc: doc!,
      hashtags: hashtags!,
      imageUrls: imageUrls!,
      anonymous,
      anonymousName: anonymous ? alias : null,
    },
  };
}
