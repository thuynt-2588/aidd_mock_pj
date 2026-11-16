import Link from "next/link";
import type { ReactNode } from "react";

import type { KudoDoc, KudoInline } from "@/lib/kudos/kudo-doc";
import { profilePath } from "@/lib/kudos/filters";

// Renders a kudos' rich text (kudos.content_doc) with React elements only.
// Links and mentions sit above the card's "open detail" overlay (z-10).

const LINK = "relative z-10 underline decoration-1 underline-offset-2 hover:opacity-80";

function inline(node: KudoInline, key: number): ReactNode {
  if (node.type === "mention") {
    return (
      <Link key={key} href={profilePath(node.id)} className={`${LINK} no-underline`}>
        @{node.name}
      </Link>
    );
  }
  let el: ReactNode = node.text;
  if (node.bold) el = <strong>{el}</strong>;
  if (node.italic) el = <em>{el}</em>;
  if (node.strike) el = <s>{el}</s>;
  if (node.href) {
    el = (
      <a href={node.href} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
        {el}
      </a>
    );
  }
  return <span key={key}>{el}</span>;
}

const line = (children: KudoInline[]) => (children.length ? children.map(inline) : <br />);

export function KudoContent({ doc }: { doc: KudoDoc }) {
  return doc.blocks.map((block, i) => {
    if (block.type === "ordered-list") {
      return (
        <ol key={i} className="list-decimal pl-6">
          {block.items.map((item, j) => (
            <li key={j}>{line(item)}</li>
          ))}
        </ol>
      );
    }
    if (block.type === "quote") {
      return (
        <blockquote key={i} className="border-l-4 border-saa-border pl-3 italic">
          {line(block.children)}
        </blockquote>
      );
    }
    return <p key={i}>{line(block.children)}</p>;
  });
}
