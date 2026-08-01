import { activeVocab, allowsSentenceExercises, CONFUSABLE_PAIRS, type Word } from "./vocab";
import { shuffle } from "./utils";
import type { AnswerResultKind, LearningStage, QueueItem, WordState } from "./types";
import type { LearningTuning } from "./learningProfile";
import {
  balancedDirection,
  nextStage,
  pickAvoidingRecent,
  rememberFormat,
  selectByWeakness,
  spacedInsertionIndex,
  spreadByKey,
  type FormatMemory,
} from "./learningEngine";

/** Prefix used for this domain in the shared attempt/format bookkeeping AppShell threads through
 * a session. Vocabulary and grammar share those maps, so the keys have to stay distinct. */
export const vocabKey = (wordId: string) => "v:" + wordId;

export type StageKind = "learn" | "quiz" | "match" | "apply" | "recall" | "produce" | "review";

/** The active-learning task types, i.e. everything that can move a word up the ladder. */
export type ActiveKind = Exclude<StageKind, "learn" | "match" | "review">;

/**
 * Which task types a word can be tested with at each stage.
 *
 * This is the "besser geordnet" half of the redesign. Previously every stage above 0 drew from
 * the same two-entry pool (multiple choice or gap-fill), so the ladder had no shape: the task you
 * got at your very first test was the same task you got just before mastery, and with only two
 * options it repeated constantly.
 *
 * Now the stages mean something, following the standard recognition → retrieval → production
 * progression:
 *
 *  - **Stage 1 — wiedererkennen:** pick it out, or fill it into a context gap.
 *  - **Stage 2 — abrufen:** produce the word itself, from German or from a context gap.
 *  - **Stage 3 — anwenden:** use it in a sentence of your own; the real test before mastery.
 */
const KINDS_BY_STAGE: Record<1 | 2 | 3 | 4, ActiveKind[]> = {
  1: ["quiz", "recall"],
  2: ["recall", "apply"],
  3: ["apply", "produce", "recall"],
  // Stage 4 is long-term review territory; only reached here if a word is re-tested after mastery.
  4: ["apply", "produce", "recall"],
};

/** Every exercise format a mastered word can resurface as during long-term review. All of these
 * generate their own content from the word's fields, so no per-word authoring is needed. */
export type ReviewFormat = "translate" | "mc" | "gap" | "multigap" | "confusable";
const SINGLE_WORD_REVIEW_FORMATS: ReviewFormat[] = ["translate", "mc", "gap"];

/** Picks a review format, avoiding the ones this word most recently appeared as. */
export function pickReviewFormat(recent: string[] = []): ReviewFormat {
  return pickAvoidingRecent(SINGLE_WORD_REVIEW_FORMATS, recent);
}

export interface LearningQueueItem {
  kind: StageKind;
  words: Word[];
  direction: "en-de" | "de-en";
  /** Only set when kind === "review" — which format to render this time. */
  reviewFormat?: ReviewFormat;
}

const KIND_TO_FORMAT: Record<StageKind, QueueItem["format"]> = {
  learn: "learn",
  quiz: "mc",
  match: "match",
  apply: "gap",
  recall: "translate",
  produce: "sentence",
  review: "translate",
};

/** The exercise format a queue item will actually render as — also the value recorded in the
 * format memory, so "don't repeat the last format" compares like with like. */
export function formatForItem(item: LearningQueueItem): QueueItem["format"] {
  return item.kind === "review" ? item.reviewFormat || "translate" : KIND_TO_FORMAT[item.kind];
}

export function toQueueItem(item: LearningQueueItem): QueueItem {
  const multiWord = item.kind === "match" || item.reviewFormat === "multigap" || item.reviewFormat === "confusable";
  const words = multiWord ? item.words : [item.words[0]];
  return { format: formatForItem(item), words, direction: item.direction };
}

/**
 * Which task type to test a word with next. Stage 0 is always the learn card; everything above it
 * draws from that stage's format list while avoiding whatever this word was recently shown as.
 * `allowSentenceKinds` excludes "produce" (writing a free sentence) for finance/math terms — see
 * allowsSentenceExercises(). Every stage's candidate list has at least one other kind left over
 * once "produce" is removed, so this never runs out of options.
 */
export function pickKindForStage(
  stage: LearningStage,
  recent: string[] = [],
  allowSentenceKinds: boolean = true
): Exclude<StageKind, "match" | "review"> {
  if (stage === 0) return "learn";
  const stageCandidates = KINDS_BY_STAGE[stage as 1 | 2 | 3 | 4] ?? KINDS_BY_STAGE[3];
  const candidates = allowSentenceKinds ? stageCandidates : stageCandidates.filter((k) => k !== "produce");
  // The memory stores rendered formats ("gap"), the candidates are task kinds ("apply"). Translate
  // the history back into kinds, keeping its newest-last ordering so the most recent format is the
  // one that actually gets excluded.
  const recentKinds = recent
    .map((fmt) => candidates.find((k) => KIND_TO_FORMAT[k] === fmt))
    .filter((k): k is ActiveKind => k !== undefined);
  return pickAvoidingRecent(candidates, recentKinds);
}

/**
 * Typed production always shows German and asks for English — you never have to type German, only
 * recognise it. Everything else draws from a balanced bag so the two directions stay evenly mixed
 * across a session instead of clumping the way independent coin flips do.
 */
export function directionForKind(kind: StageKind, reviewFormat?: ReviewFormat): "en-de" | "de-en" {
  if (kind === "produce" || kind === "recall") return "de-en";
  if (kind === "review") return !reviewFormat || reviewFormat === "translate" ? "de-en" : balancedDirection();
  return balancedDirection();
}

export const MATCH_GROUP_SIZE = 4;

/** Pulls as many full groups of MATCH_GROUP_SIZE off the front of the pool as possible. */
export function popMatchGroups(pool: Word[]): { groups: Word[][]; remaining: Word[] } {
  const remaining = [...pool];
  const groups: Word[][] = [];
  while (remaining.length >= MATCH_GROUP_SIZE) {
    groups.push(remaining.splice(0, MATCH_GROUP_SIZE));
  }
  return { groups, remaining };
}

export interface LearningBatch {
  activeWords: Word[];
  reviewWords: Word[];
}

/**
 * Picks the words this session works on, plus the long-term reviews that have come due.
 *
 * Two changes over the previous version, both aimed at making sessions feel less repetitive:
 *
 *  - In-progress words are chosen by how much they actually need work (weakness + staleness, with
 *    noise) instead of a flat shuffle, so the session spends its slots where they matter.
 *  - Brand-new words are capped well below the batch size. A batch of ten unknown words needs a
 *    learn card plus several tests for each, which is precisely the "same few words on a loop"
 *    experience — mixing a few new words into mostly familiar ones spreads the load.
 *
 * Reviews are taken most-overdue-first so a growing backlog actually clears.
 */
export function buildLearningBatch(
  getState: (id: string) => WordState,
  totalPracticeSessions: number,
  blockedWordIds: ReadonlySet<string>,
  includeReview: boolean,
  tuning: LearningTuning,
  /** Restricts the pool to a slice of the vocabulary — how the Finance mode reuses this engine
   * without a parallel track. Omit for the general Vocabulary session, which draws from everything. */
  wordFilter?: (word: Word) => boolean
): LearningBatch {
  const pool = wordFilter ? activeVocab(blockedWordIds).filter(wordFilter) : activeVocab(blockedWordIds);
  const newPool = pool.filter((w) => getState(w.id).stage === 0);

  if (!includeReview) {
    // "Nur Neues lernen" means exactly that — brand-new words only, and here the full batch may be
    // new because that is what the learner explicitly asked for.
    return { activeWords: selectByWeakness(newPool, (w) => getState(w.id), tuning.vocabBatchSize), reviewWords: [] };
  }

  const duePool = pool.filter((w) => {
    const s = getState(w.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  duePool.sort((a, b) => (getState(a.id).dueAtSession ?? 0) - (getState(b.id).dueAtSession ?? 0));
  const reviewWords = duePool.slice(0, tuning.vocabReviewSample);

  const inProgressPool = pool.filter((w) => {
    const s = getState(w.id);
    return s.stage >= 1 && s.stage <= 3;
  });
  const inProgressWords = selectByWeakness(inProgressPool, (w) => getState(w.id), tuning.vocabBatchSize);

  // Only top up with new words if in-progress work didn't already fill the batch, and never past
  // the per-session cap on unfamiliar material.
  const room = tuning.vocabBatchSize - inProgressWords.length;
  const newWords = room > 0 ? selectByWeakness(newPool, (w) => getState(w.id), Math.min(room, tuning.maxNewVocabPerSession)) : [];

  return { activeWords: inProgressWords.concat(newWords), reviewWords };
}

export interface InitialQueue {
  queue: LearningQueueItem[];
  /** Words due for a matching round that didn't fill a full group yet — carried in session state
   * and combined with words that reach the same point later in the session. */
  matchPool: Word[];
  /** Seeded with the format each word starts on, so the first follow-up already avoids a repeat. */
  formatMemory: FormatMemory;
}

/**
 * Builds the starting queue for a batch: one task per active word at its current stage, words due
 * for a matching round grouped into fours, and due long-term reviews mixed in with varied formats.
 *
 * The result is ordered with spreadByKey rather than a plain shuffle, so two tasks for the same
 * word never land back to back.
 */
export function buildInitialQueue(batch: LearningBatch, getState: (id: string) => WordState): InitialQueue {
  const quizWords: Word[] = [];
  const items: LearningQueueItem[] = [];
  let formatMemory: FormatMemory = {};

  const remember = (item: LearningQueueItem) => {
    const format = formatForItem(item);
    item.words.forEach((w) => {
      formatMemory = rememberFormat(formatMemory, vocabKey(w.id), format);
    });
    return item;
  };

  batch.activeWords.forEach((word) => {
    const kind = pickKindForStage(getState(word.id).stage, [], allowsSentenceExercises(word));
    // "quiz" words are held back so they can be batched into matching rounds — recognition
    // practice at lower cognitive load — whenever enough of them accumulate.
    if (kind === "quiz") quizWords.push(word);
    else items.push(remember({ kind, words: [word], direction: directionForKind(kind) }));
  });

  const { groups, remaining } = popMatchGroups(shuffle(quizWords));
  groups.forEach((group) => items.push(remember({ kind: "match", words: group, direction: directionForKind("match") })));

  // Review-due words get varied formats: at most one confusable pair per session (only when both
  // members are mastered, so whichever gets quizzed has a valid stage to transition from), at most
  // one multigap pair, and a rotated single-word format for the rest.
  const reviewPool = shuffle(batch.reviewWords.slice());
  const usedIds = new Set<string>();

  for (const [a, b] of CONFUSABLE_PAIRS) {
    const aIsDue = reviewPool.some((w) => w.id === a.id);
    const bIsDue = reviewPool.some((w) => w.id === b.id);
    if (!aIsDue && !bIsDue) continue;
    if (getState(a.id).stage !== 4 || getState(b.id).stage !== 4) continue;
    items.push(remember({ kind: "review", words: [a, b], direction: directionForKind("review", "confusable"), reviewFormat: "confusable" }));
    usedIds.add(a.id);
    usedIds.add(b.id);
    break;
  }

  const remainingReview = reviewPool.filter((w) => !usedIds.has(w.id));
  if (remainingReview.length >= 2 && Math.random() < 0.35) {
    const pairWords = [remainingReview.shift() as Word, remainingReview.shift() as Word];
    items.push(remember({ kind: "review", words: pairWords, direction: directionForKind("review", "multigap"), reviewFormat: "multigap" }));
  }
  remainingReview.forEach((word) => {
    const fmt = pickReviewFormat();
    items.push(remember({ kind: "review", words: [word], direction: directionForKind("review", fmt), reviewFormat: fmt }));
  });

  const queue = spreadByKey(items, (item) => item.words.map((w) => w.id).join("+"));
  return { queue, matchPool: remaining, formatMemory };
}

export interface StageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: StageKind | null;
}

/**
 * Computes a word's next learning stage after an answer, and which task (if any) should follow up
 * later in the same session. The stage ladder itself lives in the shared engine — see nextStage()
 * for why "almost" no longer resets progress and why a wrong answer costs one step rather than all
 * of them.
 *
 * `recentFormats` is this word's format history, so the follow-up task is a different kind of
 * question than the one just answered.
 */
export function nextAfterAnswer(
  kind: StageKind,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number,
  recentFormats: string[],
  tuning: LearningTuning,
  allowSentenceKinds: boolean = true
): StageOutcome {
  const transition = nextStage({
    isLearnCard: kind === "learn",
    isReview: kind === "review",
    currentStage,
    reviewStreak,
    result,
    totalPracticeSessions,
    tuning,
  });

  return {
    stage: transition.stage,
    reviewStreak: transition.reviewStreak,
    dueAtSession: transition.dueAtSession,
    nextKind: transition.followUp ? pickKindForStage(transition.stage, recentFormats, allowSentenceKinds) : null,
  };
}

/**
 * Where a follow-up task should be inserted. `attemptNo` is how many times this word has been
 * answered in this session — the gap widens with each repeat (expanding retrieval), which is the
 * main fix for words feeling like they come back on a loop.
 *
 * Returns null when the remaining queue is too short to space the repeat properly; the caller
 * should then simply not schedule it.
 */
export function insertionIndex(
  currentIndex: number,
  queueLength: number,
  attemptNo: number,
  tuning: LearningTuning
): number | null {
  return spacedInsertionIndex(currentIndex, queueLength, attemptNo, tuning);
}

/** End-of-session cleanup: turns whatever is left in the match pool into one last task rather than
 * leaving those words untested. */
export function flushMatchPool(pool: Word[]): LearningQueueItem[] {
  if (pool.length === 0) return [];
  if (pool.length === 1) return [{ kind: "quiz", words: [pool[0]], direction: directionForKind("quiz") }];
  return [{ kind: "match", words: pool, direction: directionForKind("match") }];
}

/** How many times one word may be asked within a single session, per the active profile. */
export function maxAttemptsPerWord(tuning: LearningTuning): number {
  return tuning.maxAttemptsPerItem;
}

