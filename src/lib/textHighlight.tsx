import type { ReactNode } from "react";
import type { LanguageToolMatch } from "./languageTool";

/** Renders text with LanguageTool matches highlighted as <mark> spans — built from plain text-node
 * segments using the match offsets, never dangerouslySetInnerHTML, so it's safe regardless of what
 * either the API response or the writer's own text contains. */
export function renderHighlighted(text: string, matches: LanguageToolMatch[]): ReactNode {
  if (matches.length === 0) return text;
  const sorted = [...matches].sort((a, b) => a.offset - b.offset);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((m, i) => {
    if (m.offset < cursor) return;
    if (m.offset > cursor) nodes.push(text.slice(cursor, m.offset));
    const end = m.offset + m.length;
    nodes.push(
      <mark key={i} title={m.shortMessage} className="bg-red-light text-[#b8271b] rounded px-0.5 not-italic">
        {text.slice(m.offset, end)}
      </mark>
    );
    cursor = end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
