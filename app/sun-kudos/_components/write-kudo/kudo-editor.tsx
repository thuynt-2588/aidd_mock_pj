"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import type { KudoDoc } from "@/lib/kudos/kudo-doc";
import type { SunnerOption } from "@/lib/kudos/write-kudo";
import type { WriteKudoMessages } from "@/lib/i18n/kudos-messages";
import { AddLinkBox } from "./add-link-box";
import { readEditor } from "./editor-dom";
import { richTextFont } from "./rich-text-font";
import { SunnerList } from "./sunner-list";
import { useSunnerSearch } from "./use-sunner-search";
import { BoldIcon, ItalicIcon, LinkToolIcon, NumberListIcon, QuoteIcon, StrikeIcon } from "./write-kudo-icons";

type Tool = "bold" | "italic" | "strike" | "numbered" | "link" | "quote";

type KudoEditorProps = {
  t: WriteKudoMessages;
  communityHref: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (doc: KudoDoc) => void;
};

const COMMAND: Partial<Record<Tool, string>> = { bold: "bold", italic: "italic", strike: "strikeThrough", numbered: "insertOrderedList" };
const MENTION = /(?:^|\s)@([^\s@]{0,30})$/;

// document.execCommand is deprecated but is still the only built-in way to
// apply inline formatting to a contentEditable selection in every browser.
function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function closest(node: Node | null, tag: string, root: HTMLElement): HTMLElement | null {
  for (let n: Node | null = node; n && n !== root; n = n.parentNode) {
    if (n instanceof HTMLElement && n.tagName === tag) return n;
  }
  return null;
}

// C (toolbar: B, I, S, numbered list, link, quote + "Tiêu chuẩn cộng đồng")
// over D (white, 1px #998C5F, radius 0 0 8 8, 200 high, padding-left 24).
// Typing "@" + name lists Sunners; the pick becomes a mention chip.
export function KudoEditor({ t, communityHref, invalid, describedBy, onChange }: KudoEditorProps) {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [empty, setEmpty] = useState(true);
  const [active, setActive] = useState<Partial<Record<Tool, boolean>>>({});
  const [linkText, setLinkText] = useState<string | null>(null);
  const [mention, setMention] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const { results, loading } = useSunnerSearch(mention);

  const emit = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const doc = readEditor(root);
    setEmpty(!root.textContent?.trim() && !root.querySelector("li, [data-mention-id]"));
    onChange(doc);
  }, [onChange]);

  const refreshState = useCallback(() => {
    const root = ref.current;
    const sel = document.getSelection();
    if (!root || !sel?.rangeCount || !root.contains(sel.anchorNode)) return;
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      strike: document.queryCommandState("strikeThrough"),
      numbered: document.queryCommandState("insertOrderedList"),
      quote: !!closest(sel.anchorNode, "BLOCKQUOTE", root),
      link: !!closest(sel.anchorNode, "A", root),
    });
    // "@name" right before the caret?
    const node = sel.anchorNode;
    if (sel.isCollapsed && node?.nodeType === Node.TEXT_NODE) {
      const before = (node.textContent ?? "").slice(0, sel.anchorOffset);
      const m = MENTION.exec(before);
      setMention(m ? m[1] : null);
      if (!m) setMentionIndex(0);
    } else {
      setMention(null);
    }
  }, [setMention, setMentionIndex]);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshState);
    return () => document.removeEventListener("selectionchange", refreshState);
  }, [refreshState]);

  useEffect(() => {
    exec("styleWithCSS", "false");
  }, []);

  const apply = (tool: Tool) => {
    const root = ref.current;
    if (!root) return;
    root.focus();
    if (tool === "link") {
      const sel = document.getSelection();
      savedRange.current = sel?.rangeCount && root.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
      setLinkText(sel?.toString() ?? "");
      return;
    }
    if (tool === "quote") {
      const sel = document.getSelection();
      exec("formatBlock", closest(sel?.anchorNode ?? null, "BLOCKQUOTE", root) ? "div" : "blockquote");
    } else {
      exec(COMMAND[tool]!);
    }
    refreshState();
    emit();
  };

  /** Puts `node` where `range` is (replacing its content), caret right after it. */
  const insertAt = (range: Range | null, node: Node) => {
    const root = ref.current!;
    root.focus();
    const sel = document.getSelection()!;
    let r = range;
    if (!r || !root.contains(r.startContainer)) {
      r = document.createRange();
      r.selectNodeContents(root);
      r.collapse(false);
    }
    // A fragment is empty once inserted: place the caret after its last node.
    const last = node instanceof DocumentFragment ? node.lastChild : node;
    r.deleteContents();
    r.insertNode(node);
    if (!last) return;
    const after = document.createRange();
    after.setStartAfter(last);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
    emit();
  };

  const saveLink = (text: string, url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.textContent = text;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    setLinkText(null);
    insertAt(savedRange.current, a);
  };

  const pickMention = (s: SunnerOption) => {
    const sel = document.getSelection();
    const node = sel?.anchorNode;
    if (!sel || !node || node.nodeType !== Node.TEXT_NODE) return;
    const offset = sel.anchorOffset;
    const start = (node.textContent ?? "").slice(0, offset).lastIndexOf("@");
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, offset);
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.mentionId = s.id;
    chip.dataset.mentionName = s.name;
    chip.className = "font-bold text-saa-badge";
    chip.textContent = `@${s.name}`;
    const frag = document.createDocumentFragment();
    frag.append(chip, document.createTextNode(" "));
    insertAt(range, frag);
    setMention(null);
  };

  const tool = (name: Tool, label: string, icon: ReactNode, first = false) => (
    <button
      key={name}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={name === "link" ? undefined : !!active[name]}
      // Keep the editor's selection: act on mousedown, never take focus.
      onMouseDown={(e) => {
        e.preventDefault();
        apply(name);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          apply(name);
        }
      }}
      className={`flex h-10 w-14 shrink-0 items-center justify-center border border-saa-border text-saa-bg transition-colors hover:bg-saa-accent/40 ${
        first ? "rounded-tl-lg" : "-ml-px"
      } ${active[name] ? "bg-saa-accent/60" : ""}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="relative flex flex-col">
      <div role="toolbar" aria-label={t.contentLabel} className="flex">
        {tool("bold", t.tools.bold, <BoldIcon />, true)}
        {tool("italic", t.tools.italic, <ItalicIcon />)}
        {tool("strike", t.tools.strike, <StrikeIcon />)}
        {tool("numbered", t.tools.numbered, <NumberListIcon />)}
        {tool("link", t.tools.link, <LinkToolIcon />)}
        {tool("quote", t.tools.quote, <QuoteIcon />)}
        <a
          href={communityHref}
          target="_blank"
          rel="noreferrer"
          className="-ml-px flex h-10 min-w-0 flex-1 items-center justify-center truncate rounded-tr-lg border border-saa-border px-4 text-base font-bold leading-6 tracking-[0.15px] text-[#e46060] underline underline-offset-2 hover:bg-saa-accent/40"
        >
          {t.communityStandards}
        </a>
      </div>
      <div className="relative">
        <div
          ref={ref}
          role="textbox"
          aria-multiline="true"
          aria-label={t.contentLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-controls={mention !== null ? listId : undefined}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={() => {
            emit();
            refreshState();
          }}
          onPaste={(e) => {
            // Plain text only: formatting comes from the toolbar.
            e.preventDefault();
            exec("insertText", e.clipboardData.getData("text/plain"));
          }}
          onDrop={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (mention === null) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setMentionIndex((i) => Math.max(0, Math.min(i + (e.key === "ArrowDown" ? 1 : -1), results.length - 1)));
            } else if ((e.key === "Enter" || e.key === "Tab") && results[mentionIndex]) {
              e.preventDefault();
              pickMention(results[mentionIndex]);
            } else if (e.key === "Escape") {
              e.stopPropagation();
              setMention(null);
            }
          }}
          onBlur={() => setMention(null)}
          // Bold look without a bold font-weight (see rich-text-font.ts).
          className={`kudo-editor kudo-rich ${richTextFont.className} -mt-px h-[200px] overflow-y-auto rounded-b-lg border bg-white px-6 py-4 text-base leading-6 tracking-[0.15px] text-saa-bg outline-none focus:outline-2 focus:outline-saa-border ${
            invalid ? "border-saa-badge" : "border-saa-border"
          }`}
        />
        {empty && (
          <p aria-hidden className="pointer-events-none absolute left-6 top-4 right-6 text-base font-bold leading-6 tracking-[0.15px] text-saa-muted">
            {t.contentPlaceholder}
          </p>
        )}
        {mention !== null && (
          <SunnerList
            id={listId}
            label={t.recipient}
            results={results}
            loading={loading}
            active={mentionIndex}
            emptyText={t.noSunner}
            loadingText={t.searching}
            onPick={pickMention}
            onHover={setMentionIndex}
            className="absolute left-6 top-full mt-1 w-80"
          />
        )}
      </div>
      {linkText !== null && (
        <AddLinkBox
          initialText={linkText}
          t={t}
          onSave={saveLink}
          onCancel={() => {
            setLinkText(null);
            ref.current?.focus();
          }}
        />
      )}
    </div>
  );
}
