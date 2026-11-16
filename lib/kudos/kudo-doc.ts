// Rich text of a kudos (D: B / I / S / numbered list / link / quote, "@" mentions).
// Stored as JSON in kudos.content_doc — never HTML — and rendered with React,
// so nothing a sender types can become markup. `normalizeKudoDoc` is the only
// way in: it rebuilds the document from untrusted input and drops anything else.

export type KudoMarks = { bold?: true; italic?: true; strike?: true };

export type KudoInline =
  | ({ type: "text"; text: string; href?: string } & KudoMarks)
  | { type: "mention"; id: string; name: string };

export type KudoBlock =
  | { type: "paragraph"; children: KudoInline[] }
  | { type: "quote"; children: KudoInline[] }
  | { type: "ordered-list"; items: KudoInline[][] };

export type KudoDoc = { version: 1; blocks: KudoBlock[] };

const MAX_BLOCKS = 200;
const MAX_ITEMS = 100;
const MAX_INLINES = 500;
const MAX_TEXT = 2000;
const MAX_NAME = 100;
export const MAX_URL = 2048;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** http(s) URL of at most 2048 characters, or null. */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > MAX_URL) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

function normalizeInlines(input: unknown): KudoInline[] | null {
  if (!Array.isArray(input) || input.length > MAX_INLINES) return null;
  const out: KudoInline[] = [];
  for (const node of input) {
    if (!isRecord(node)) return null;
    if (node.type === "text") {
      if (typeof node.text !== "string" || node.text.length > MAX_TEXT) return null;
      if (node.text === "") continue;
      const inline: KudoInline = { type: "text", text: node.text };
      if (node.bold === true) inline.bold = true;
      if (node.italic === true) inline.italic = true;
      if (node.strike === true) inline.strike = true;
      if (node.href !== undefined) {
        const href = safeHref(node.href);
        if (!href) return null;
        inline.href = href;
      }
      out.push(inline);
    } else if (node.type === "mention") {
      if (typeof node.id !== "string" || !UUID.test(node.id)) return null;
      if (typeof node.name !== "string") return null;
      const name = node.name.trim();
      if (!name || name.length > MAX_NAME) return null;
      out.push({ type: "mention", id: node.id.toLowerCase(), name });
    } else {
      return null;
    }
  }
  return out;
}

/** Rebuilds a KudoDoc from untrusted JSON; null when anything is off. */
export function normalizeKudoDoc(input: unknown): KudoDoc | null {
  if (!isRecord(input) || input.version !== 1 || !Array.isArray(input.blocks)) return null;
  if (input.blocks.length > MAX_BLOCKS) return null;
  const blocks: KudoBlock[] = [];
  for (const block of input.blocks) {
    if (!isRecord(block)) return null;
    if (block.type === "paragraph" || block.type === "quote") {
      const children = normalizeInlines(block.children);
      if (!children) return null;
      blocks.push({ type: block.type, children });
    } else if (block.type === "ordered-list") {
      if (!Array.isArray(block.items) || block.items.length > MAX_ITEMS) return null;
      const items: KudoInline[][] = [];
      for (const item of block.items) {
        const children = normalizeInlines(item);
        if (!children) return null;
        items.push(children);
      }
      blocks.push({ type: "ordered-list", items });
    } else {
      return null;
    }
  }
  return { version: 1, blocks };
}

function inlineText(children: KudoInline[]): string {
  return children.map((c) => (c.type === "mention" ? `@${c.name}` : c.text)).join("");
}

/** Plain text (kudos.content): one line per paragraph / quote / list item. */
export function kudoDocToText(doc: KudoDoc): string {
  const lines: string[] = [];
  for (const block of doc.blocks) {
    if (block.type === "ordered-list") {
      block.items.forEach((item, i) => lines.push(`${i + 1}. ${inlineText(item)}`));
    } else {
      lines.push(inlineText(block.children));
    }
  }
  return lines
    .map((l) => l.replace(/ /g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Ids of the Sunners mentioned with "@". */
export function kudoDocMentions(doc: KudoDoc): string[] {
  const ids = new Set<string>();
  const visit = (children: KudoInline[]) => children.forEach((c) => c.type === "mention" && ids.add(c.id));
  for (const block of doc.blocks) {
    if (block.type === "ordered-list") block.items.forEach(visit);
    else visit(block.children);
  }
  return [...ids];
}
