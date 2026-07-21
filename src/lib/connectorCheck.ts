import type { ConnectorCategory } from "./connectors-data";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Deterministic check (unlike the grammar-usage heuristic elsewhere): did the submitted sentence
 * contain at least one of this category's accepted connectors? Multi-word connectors ("as a
 * result", "in order to") are matched as whole phrases; single words as whole words, so "sofa"
 * doesn't falsely match "as".
 */
export function findUsedConnector(text: string, category: ConnectorCategory): string | null {
  const lower = text.toLowerCase();
  for (const c of category.connectors) {
    const pattern = new RegExp("\\b" + escapeRegex(c.toLowerCase()) + "\\b");
    if (pattern.test(lower)) return c;
  }
  return null;
}
