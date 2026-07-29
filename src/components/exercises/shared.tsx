"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lightbulb, Minus, X } from "lucide-react";
import { animate, createScope } from "animejs";
import { WORD_TYPE_LABEL, type Word } from "@/lib/vocab";
import type { AnswerResultKind } from "@/lib/types";
import { playFeedbackSound } from "@/lib/sound";
import { findGap } from "@/lib/utils";
import { motionMs } from "@/lib/motion";
import { Button } from "@/components/ui/button";

/** Lets a desktop user pick a numbered multiple-choice option (1, 2, 3, …) by pressing that
 * number key, instead of only being able to click — mirrors the 1/2/3/4 labels already shown on
 * each option button. Ignored once answered, and while a modifier key is held (so it never fights
 * browser/OS shortcuts). */
export function useNumberShortcuts(optionCount: number, onSelect: (index: number) => void, disabled: boolean) {
  useEffect(() => {
    if (disabled) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const num = Number(e.key);
      if (!Number.isInteger(num) || num < 1 || num > 9) return;
      const index = num - 1;
      if (index >= optionCount) return;
      e.preventDefault();
      onSelect(index);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [optionCount, onSelect, disabled]);
}

/** Lets a desktop user trigger the Hint button by pressing "1" — deliberately global (fires even
 * while the answer field is focused, unlike useNumberShortcuts) since a hint request is something
 * you usually want mid-typing, not just before starting. Only used by the free-text exercises
 * (translate/gap/sentence), which don't also register useNumberShortcuts, so "1" never double-fires. */
export function useHintShortcut(onTrigger: () => void, disabled: boolean) {
  useEffect(() => {
    if (disabled) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key !== "1") return;
      e.preventDefault();
      onTrigger();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTrigger, disabled]);
}

/** Lets a desktop user build a word-order sentence without a mouse: 1–9 places the tile shown
 * with that number, Backspace removes the most recently placed tile, and Enter checks the answer
 * once every tile is placed. Ignored once answered.
 *
 * The number is each tile's fixed position in the (already shuffled) tile list, not its position
 * among the tiles still available — placing one tile must not renumber the ones left behind, or
 * a learner reading "3" before placing a tile could find it pointing at a different word by the
 * time they act on it. */
export function useTileShortcuts<T extends { key: string }>(
  tokens: readonly T[],
  usedKeys: ReadonlySet<string>,
  onPick: (token: T) => void,
  onUndo: () => void,
  onSubmit: () => void,
  canSubmit: boolean,
  disabled: boolean
) {
  useEffect(() => {
    if (disabled) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        onUndo();
        return;
      }
      if (e.key === "Enter") {
        if (!canSubmit) return;
        e.preventDefault();
        onSubmit();
        return;
      }
      const num = Number(e.key);
      if (!Number.isInteger(num) || num < 1 || num > 9 || num > tokens.length) return;
      const tok = tokens[num - 1];
      if (usedKeys.has(tok.key)) return;
      e.preventDefault();
      onPick(tok);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tokens, usedKeys, onPick, onUndo, onSubmit, canSubmit, disabled]);
}

/** Renders a sentence with the target word's occurrence in bold — used everywhere a full English
 * sentence appears in a solution explanation, so the word being learned always stands out. */
export function boldenWord(sentence: string, word: Word): React.ReactNode {
  const gap = findGap(sentence, word);
  if (!gap) return sentence;
  return (
    <>
      {sentence.slice(0, gap.index)}
      <b className="font-semibold text-ink">{gap.matched}</b>
      {sentence.slice(gap.index + gap.matched.length)}
    </>
  );
}

/** Word-class pill above every exercise. Specialist words carry their track's colour and name
 * instead of the word class, because "which register is this from" is the more useful cue when a
 * Finance session mixes accounting terms with statistics. */
export function Badge({ word }: { word: Word }) {
  const label = word.category === "finance" ? "Finance" : word.category === "math" ? "Math" : WORD_TYPE_LABEL[word.type];
  const grad =
    word.category === "finance"
      ? "from-green to-green-dark"
      : word.category === "math"
      ? "from-amber to-amber-dark"
      : word.type === "adjective"
      ? "from-purple to-purple-dark"
      : "from-blue to-blue-dark";
  return (
    <span
      className={
        "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-white shadow-sm bg-gradient-to-r " +
        grad
      }
    >
      {label}
    </span>
  );
}

/** The one-line instruction that opens every exercise ("Fill in the missing word", "Translate to
 * German", …). Centralised because it was copy-pasted into sixteen files and had drifted to three
 * different bottom margins, so consecutive questions in one session shifted their first line. */
export function Prompt({ children }: { children: React.ReactNode }) {
  return <div className="text-[13.5px] text-ink-faint mb-3">{children}</div>;
}

export function ContextNote({ word }: { word: Word }) {
  const colloc = word.collocations.length ? word.collocations.join(" · ") : null;
  return (
    <>
      <Row label="Meaning">
        <b className="text-ink font-semibold">{word.de.join(" / ")}</b>
      </Row>
      {word.definition && <Row label="Definition">{word.definition}</Row>}
      <Row label="Type">{WORD_TYPE_LABEL[word.type]}</Row>
      <Row label="Example">
        {boldenWord(word.enSentence, word)}
        <br />
        <span className="text-ink-faint">{word.deSentence}</span>
      </Row>
      {colloc && <Row label="Collocations">{colloc}</Row>}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  // 4px label→value against 12px row→row: the label reads as belonging to the value beneath it
  // rather than floating between two blocks, which the previous near-equal 2px/6px pair blurred.
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1">{label}</div>
      {children}
    </div>
  );
}
export { Row as DetailRow };

const STATUS_MAP: Record<
  AnswerResultKind,
  { cls: string; icon: React.ReactNode; label: string; bg: string; panelBg: string; panelRing: string; btnGrad: string }
> = {
  correct: {
    cls: "text-[#0d7a4f]",
    icon: <Check size={14} />,
    label: "Correct",
    bg: "bg-gradient-to-br from-green to-green-dark",
    panelBg: "bg-green-light/50",
    panelRing: "ring-green/15",
    btnGrad: "from-green to-green-dark",
  },
  almost: {
    cls: "text-[#96690f]",
    icon: <Minus size={14} />,
    label: "Almost — close, but not quite",
    bg: "bg-gradient-to-br from-amber to-amber-dark",
    panelBg: "bg-amber-light/50",
    panelRing: "ring-amber/20",
    btnGrad: "from-amber to-amber-dark",
  },
  incorrect: {
    cls: "text-[#b8271b]",
    icon: <X size={14} />,
    label: "Not quite",
    bg: "bg-gradient-to-br from-red to-red-dark",
    panelBg: "bg-red-light/40",
    panelRing: "ring-red/15",
    btnGrad: "from-blue to-blue-dark",
  },
};

/**
 * Entrance choreography for a freshly-answered question: the panel fades in first, its icon pops in
 * right behind it (elastically for a correct answer — the one moment worth a little flourish — with
 * a plain settle for the other two outcomes), the explanation text and Continue button trail in last.
 * An incorrect answer additionally gets a quick shake, layered on top of the same entrance rather than
 * replacing it. Built with a `createScope` so the whole sequence (and the elements' inline styles)
 * reverts cleanly if the panel unmounts mid-animation — e.g. a fast double-answer.
 */
function useFeedbackEntrance(result: AnswerResultKind, rootRef: React.RefObject<HTMLDivElement | null>, iconRef: React.RefObject<HTMLSpanElement | null>, bodyRef: React.RefObject<HTMLDivElement | null>, btnRef: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    const scope = createScope({ root: rootRef }).add(() => {
      animate(rootRef.current!, { opacity: [0, 1], duration: motionMs(160), ease: "outQuad" });
      // opacity has to be animated explicitly: the element ships with an inline `opacity: 0` so it
      // can't flash before this scope runs, and anime.js only clears the properties it animates —
      // without this the icon stays invisible and leaves a hole where the status label starts.
      // Scaling starts from 0.4 rather than 0 so it grows from something visible instead of
      // materialising out of nothing.
      animate(iconRef.current!, {
        opacity: [0, 1],
        scale: result === "correct" ? [0.4, 1.12, 1] : [0.7, 1],
        rotate: result === "correct" ? [-14, 6, 0] : 0,
        duration: motionMs(result === "correct" ? 460 : 260),
        delay: motionMs(90),
        ease: result === "correct" ? "outElastic(1, .6)" : "outBack",
      });
      animate(bodyRef.current!, { opacity: [0, 1], translateY: [8, 0], duration: motionMs(240), delay: motionMs(140), ease: "outQuad" });
      animate(btnRef.current!, { opacity: [0, 1], translateY: [6, 0], duration: motionMs(220), delay: motionMs(220), ease: "outQuad" });
      if (result === "incorrect") {
        animate(rootRef.current!, {
          translateX: [0, -7, 7, -5, 5, -2, 2, 0],
          duration: motionMs(420),
          delay: motionMs(90),
          ease: "outQuad",
        });
      }
    });
    return () => scope.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function FeedbackPanel({
  result,
  children,
  onContinue,
}: {
  result: AnswerResultKind;
  children: React.ReactNode;
  onContinue: () => void;
}) {
  const m = STATUS_MAP[result];
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playFeedbackSound(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFeedbackEntrance(result, rootRef, iconRef, bodyRef, btnRef);

  return (
    <div ref={rootRef} className="mt-5 pt-5 border-t border-line-soft" style={{ opacity: 0 }}>
      <div className={"flex items-center gap-2.5 text-[15px] font-semibold leading-none mb-3 " + m.cls}>
        <span
          ref={iconRef}
          style={{ opacity: 0 }}
          className={"w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm " + m.bg}
        >
          {m.icon}
        </span>
        <span>{m.label}</span>
      </div>
      <div
        ref={bodyRef}
        style={{ opacity: 0 }}
        className={"rounded-xl p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-inset " + m.panelBg + " " + m.panelRing}
      >
        {children}
      </div>
      <button
        ref={btnRef}
        style={{ opacity: 0 }}
        autoFocus
        onClick={onContinue}
        className={
          "mt-4 w-full rounded-full text-white font-semibold py-3 text-[15px] transition-[transform,filter] duration-150 ease-out active:scale-[0.97] hover:brightness-110 shadow-[0_10px_22px_-8px_rgba(15,23,42,0.35)] bg-gradient-to-r " +
          m.btnGrad
        }
      >
        Continue
      </button>
    </div>
  );
}

export function AnswerInput({
  value,
  onChange,
  status,
  disabled,
  placeholder,
  onEnter,
  textarea,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  status: AnswerResultKind | null;
  disabled: boolean;
  placeholder: string;
  onEnter: () => void;
  textarea?: boolean;
  autoFocus?: boolean;
}) {
  const statusClasses = status
    ? status === "correct"
      ? "border-green bg-green-light"
      : status === "almost"
      ? "border-amber bg-amber-light"
      : "border-red bg-red-light"
    : "border-line bg-bg focus:bg-white focus:border-blue focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)]";
  const common =
    "w-full text-[16px] px-4 py-3 rounded-xl border-[1.5px] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out font-sans " +
    statusClasses;
  const props = {
    value,
    disabled,
    placeholder,
    autoFocus,
    autoComplete: "off",
    spellCheck: false,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      // Plain Enter confirms — including in the (2-row) textarea variant, since it's always a
      // single sentence here, never a multi-paragraph text. Shift+Enter still inserts a literal
      // newline as an escape hatch. The free-writing essay in LinkingEssayScreen has its own
      // textarea and doesn't use this component, so it's unaffected — Enter there just types a
      // newline.
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onEnter();
      }
    },
  };
  if (textarea) {
    return <textarea rows={2} className={common + " resize-y"} {...props} />;
  }
  return <input type="text" autoCapitalize="off" className={common} {...props} />;
}

/** Each press reveals one more letter of the target word than the previous press, up to the
 * whole word — rather than switching between unrelated hint types. */
export function useHints(word: Word, targetIsGerman: boolean) {
  const target = targetIsGerman ? word.de[0] : word.en;
  const [count, setCount] = useState(0);
  const [used, setUsed] = useState(0);

  function reveal_() {
    if (count >= target.length) return;
    setCount((c) => c + 1);
    setUsed((u) => u + 1);
  }

  const reveal = count > 0 ? target.slice(0, count) + (count < target.length ? "…" : "") : null;

  return { reveal, showHint: reveal_, hintsUsed: used };
}

export function ExerciseFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between items-center gap-3 mt-5">{children}</div>;
}

export function HintButton({ onClick, children, id }: { onClick: () => void; children: React.ReactNode; id?: string }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="ghost"
      className="h-auto inline-flex items-center gap-1.5 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-2 hover:bg-blue-lighter hover:border-blue/30 hover:text-blue-dark transition-colors duration-150"
    >
      {children}
    </Button>
  );
}

/** Small keycap-style badge, matching the "↵" shown on Check buttons — used next to "Hint" to
 * surface the "1" keyboard shortcut. */
export function KeyBadge({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">{children}</span>;
}

export function HintIcon() {
  return <Lightbulb size={13} />;
}

export function PrimaryButton({
  onClick,
  children,
  disabled,
  id,
  autoFocus,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
}) {
  return (
    <Button
      id={id}
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      className="h-auto rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-none disabled:bg-[#d1d1d6] disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:opacity-100 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)] inline-flex items-center gap-2"
    >
      {children}
    </Button>
  );
}
