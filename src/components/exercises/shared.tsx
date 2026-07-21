"use client";

import { useEffect, useState } from "react";
import { Check, Lightbulb, Minus, X } from "lucide-react";
import type { Word } from "@/lib/vocab";
import type { AnswerResultKind } from "@/lib/types";
import { playFeedbackSound } from "@/lib/sound";

export function Badge({ word }: { word: Word }) {
  const isAdj = word.type === "adjective";
  return (
    <span
      className={
        "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 text-white shadow-sm bg-gradient-to-r " +
        (isAdj ? "from-purple to-purple-dark" : "from-blue to-blue-dark")
      }
    >
      {isAdj ? "Adjective" : "Verb"}
    </span>
  );
}

export function ContextNote({ word }: { word: Word }) {
  const colloc = word.collocations.length ? word.collocations.join(" · ") : null;
  return (
    <>
      <Row label="Meaning">
        <b className="text-ink font-semibold">{word.de.join(" / ")}</b>
      </Row>
      <Row label="Type">{word.type === "verb" ? "Verb" : "Adjective"}</Row>
      <Row label="Example">
        {word.enSentence}
        <br />
        <span className="text-ink-faint">{word.deSentence}</span>
      </Row>
      {colloc && <Row label="Collocations">{colloc}</Row>}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">{label}</div>
      {children}
    </div>
  );
}
export { Row as DetailRow };

const STATUS_MAP: Record<
  AnswerResultKind,
  { cls: string; icon: React.ReactNode; label: string; bg: string; panelBg: string; btnGrad: string }
> = {
  correct: {
    cls: "text-[#0d7a4f]",
    icon: <Check size={14} />,
    label: "Correct",
    bg: "bg-gradient-to-br from-green to-green-dark",
    panelBg: "bg-green-light/50",
    btnGrad: "from-green to-green-dark",
  },
  almost: {
    cls: "text-[#96690f]",
    icon: <Minus size={14} />,
    label: "Almost — close, but not quite",
    bg: "bg-gradient-to-br from-amber to-amber-dark",
    panelBg: "bg-amber-light/50",
    btnGrad: "from-amber to-amber-dark",
  },
  incorrect: {
    cls: "text-[#b8271b]",
    icon: <X size={14} />,
    label: "Not quite",
    bg: "bg-gradient-to-br from-red to-red-dark",
    panelBg: "bg-red-light/40",
    btnGrad: "from-blue to-blue-dark",
  },
};

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
  useEffect(() => {
    playFeedbackSound(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-4 pt-4 border-t border-line-soft animate-fade-in">
      <div className={"flex items-center gap-2 text-[15px] font-semibold mb-2.5 " + m.cls}>
        <span className={"w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm " + m.bg}>{m.icon}</span>
        {m.label}
      </div>
      <div className={"rounded-xl p-3.5 text-sm leading-relaxed text-ink-soft " + m.panelBg}>{children}</div>
      <button
        autoFocus
        onClick={onContinue}
        className={
          "mt-3 w-full rounded-full text-white font-semibold py-3 text-[15px] transition-all active:scale-[0.97] hover:brightness-110 shadow-[0_10px_22px_-8px_rgba(15,23,42,0.35)] bg-gradient-to-r " +
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
    "w-full text-[16px] px-3.5 py-3 rounded-xl border-[1.5px] outline-none transition-all font-sans " + statusClasses;
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
      // newline as an escape hatch. The free-writing essay in WritingScreen has its own textarea
      // and doesn't use this component, so it's unaffected — Enter there just types a newline.
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

export function useHints(word: Word, targetIsGerman: boolean) {
  const [stage, setStage] = useState(0);
  const [reveal, setReveal] = useState<string | null>(null);
  const [used, setUsed] = useState(0);

  const hints = [
    () => `First letter: "${(targetIsGerman ? word.de[0] : word.en)[0].toUpperCase()}…"`,
    () => `Length: ${(targetIsGerman ? word.de[0] : word.en).length} letters`,
    () => `Word type: ${word.type === "verb" ? "Verb" : "Adjective"}`,
    () => (targetIsGerman ? `English word: ${word.en}` : `German meaning: ${word.de.join(" / ")}`),
    () => `From the example: "${targetIsGerman ? word.deSentence : word.enSentence}"`,
  ];

  function reveal_() {
    if (stage >= hints.length) return;
    setReveal(hints[stage]());
    setStage((s) => s + 1);
    setUsed((u) => u + 1);
  }

  return { reveal, showHint: reveal_, hintsUsed: used };
}

export function ExerciseFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between items-center gap-2.5 mt-4">{children}</div>;
}

export function HintButton({ onClick, children, id }: { onClick: () => void; children: React.ReactNode; id?: string }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-1.5 hover:bg-blue-lighter hover:border-blue/30 hover:text-blue-dark transition-colors"
    >
      {children}
    </button>
  );
}

export function HintIcon() {
  return <Lightbulb size={13} />;
}

export function PrimaryButton({
  onClick,
  children,
  disabled,
  id,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 disabled:bg-[#d1d1d6] disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold px-5 py-3 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)] inline-flex items-center gap-2"
    >
      {children}
    </button>
  );
}
