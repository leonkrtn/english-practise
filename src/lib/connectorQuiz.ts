import { CONNECTOR_CATEGORIES, type ConnectorCategory } from "./connectors-data";
import { sample, shuffle } from "./utils";

/**
 * Active-recall drill for the connector words themselves — "which word expresses X relationship"
 * — the piece that was missing from Linking: you can combine two given sentences correctly without
 * ever having to *produce* a connector from memory, since the two clauses hint at the relationship.
 * This drill removes that scaffold entirely.
 */
export interface ConnectorQuizItem {
  id: string;
  category: ConnectorCategory;
  answer: string;
  options: string[];
}

const PER_CATEGORY = 2;

export function buildConnectorQuiz(): ConnectorQuizItem[] {
  const items: ConnectorQuizItem[] = [];
  CONNECTOR_CATEGORIES.forEach((cat) => {
    const picks = sample(cat.connectors, Math.min(PER_CATEGORY, cat.connectors.length));
    const otherConnectors = CONNECTOR_CATEGORIES.filter((c) => c.id !== cat.id).flatMap((c) => c.connectors);
    picks.forEach((answer, i) => {
      const distractors = sample(otherConnectors, 3);
      items.push({
        id: `${cat.id}-${i}`,
        category: cat,
        answer,
        options: shuffle([answer, ...distractors]),
      });
    });
  });
  return shuffle(items);
}
