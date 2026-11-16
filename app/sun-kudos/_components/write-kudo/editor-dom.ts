import { safeHref, type KudoBlock, type KudoDoc, type KudoInline, type KudoMarks } from "@/lib/kudos/kudo-doc";

// Reads the contentEditable editor (what Chrome / Firefox / Safari produce for
// typing, Enter, execCommand bold / italic / strikeThrough / insertOrderedList /
// formatBlock blockquote, our links and mention chips) into a KudoDoc.
// Anything unknown keeps its text and loses its markup.

type Ctx = KudoMarks & { href?: string };

const BLOCK_TAGS = new Set(["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "SECTION", "ARTICLE", "PRE"]);

function pushText(out: KudoInline[], text: string, ctx: Ctx) {
  if (!text) return;
  const last = out[out.length - 1];
  if (
    last &&
    last.type === "text" &&
    last.bold === ctx.bold &&
    last.italic === ctx.italic &&
    last.strike === ctx.strike &&
    last.href === ctx.href
  ) {
    last.text += text;
    return;
  }
  const node: KudoInline = { type: "text", text };
  if (ctx.bold) node.bold = true;
  if (ctx.italic) node.italic = true;
  if (ctx.strike) node.strike = true;
  if (ctx.href) node.href = ctx.href;
  out.push(node);
}

function marksOf(el: HTMLElement, ctx: Ctx): Ctx {
  const next: Ctx = { ...ctx };
  const tag = el.tagName;
  const style = el.style;
  if (tag === "B" || tag === "STRONG" || Number(style.fontWeight) >= 600 || style.fontWeight === "bold") next.bold = true;
  if (tag === "I" || tag === "EM" || style.fontStyle === "italic") next.italic = true;
  if (tag === "S" || tag === "STRIKE" || tag === "DEL" || style.textDecorationLine?.includes("line-through")) next.strike = true;
  if (tag === "A") {
    const href = safeHref(el.getAttribute("href"));
    if (href) next.href = href;
  }
  return next;
}

/** Splits a block element's content into lines at <br> / nested blocks. */
function lines(el: Node, ctx: Ctx, out: KudoInline[][] = [[]]): KudoInline[][] {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      pushText(out[out.length - 1], (child.textContent ?? "").replace(/​/g, ""), ctx);
      continue;
    }
    if (!(child instanceof HTMLElement)) continue;
    const mentionId = child.dataset.mentionId;
    if (mentionId) {
      out[out.length - 1].push({ type: "mention", id: mentionId, name: child.dataset.mentionName ?? (child.textContent ?? "").replace(/^@/, "") });
      continue;
    }
    if (child.tagName === "BR") {
      out.push([]);
      continue;
    }
    if (BLOCK_TAGS.has(child.tagName) || child.tagName === "BLOCKQUOTE" || child.tagName === "OL" || child.tagName === "UL") {
      if (out[out.length - 1].length) out.push([]);
      lines(child, marksOf(child, ctx), out);
      out.push([]);
      continue;
    }
    lines(child, marksOf(child, ctx), out);
  }
  return out;
}

/** "a<br>" ends with an empty line that is only the caret's placeholder. */
function trimTrailing(ls: KudoInline[][]): KudoInline[][] {
  const copy = [...ls];
  while (copy.length > 1 && copy[copy.length - 1].length === 0) copy.pop();
  return copy;
}

export function readEditor(root: HTMLElement): KudoDoc {
  const blocks: KudoBlock[] = [];
  let loose: Node[] = [];

  const flushLoose = () => {
    if (!loose.length) return;
    const holder = document.createElement("div");
    loose.forEach((n) => holder.appendChild(n.cloneNode(true)));
    trimTrailing(lines(holder, {})).forEach((children) => blocks.push({ type: "paragraph", children }));
    loose = [];
  };

  for (const node of root.childNodes) {
    if (node instanceof HTMLElement && (node.tagName === "OL" || node.tagName === "UL")) {
      flushLoose();
      const items = [...node.children]
        .filter((li) => li.tagName === "LI")
        .map((li) => trimTrailing(lines(li, {})).filter((l) => l.length).flat());
      blocks.push({ type: "ordered-list", items });
    } else if (node instanceof HTMLElement && node.tagName === "BLOCKQUOTE") {
      flushLoose();
      trimTrailing(lines(node, {}))
        .filter((l, i, all) => l.length || (i > 0 && i < all.length - 1))
        .forEach((children) => blocks.push({ type: "quote", children }));
    } else if (node instanceof HTMLElement && BLOCK_TAGS.has(node.tagName)) {
      flushLoose();
      trimTrailing(lines(node, marksOf(node, {})))
        .filter((l, i) => l.length || i === 0)
        .forEach((children) => blocks.push({ type: "paragraph", children }));
    } else {
      loose.push(node);
    }
  }
  flushLoose();
  return { version: 1, blocks };
}
