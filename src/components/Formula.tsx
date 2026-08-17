"use client";

import { useMemo } from "react";
import katex from "katex";

/** Renders a LaTeX string via KaTeX. `display` picks the centred block style (own line, larger)
 * over the inline style (sits within surrounding text). Invalid LaTeX renders KaTeX's own inline
 * error markup rather than throwing, since this only ever renders strings we author ourselves. */
export default function Formula({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: display, strict: false }),
    [tex, display]
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
