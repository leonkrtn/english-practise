"use client";

import { useState } from "react";
import { Check, Lightbulb, Minus, X } from "lucide-react";
import type { Word } from "@/lib/vocab";
import type { AnswerResultKind } from "@/lib/types";

export function Badge({ word }: { word: Word }) {
  const isAdj = word.type === "adjective";
  return (
    <span
      className={
        "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 " +
        (isAdj ? "text-purple bg-purple-light" : "text-blue bg-blue-light")
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

const STATUS_MAP: Record<AnswerResultKind, { cls: string; icon: React.ReactNode; label: string; bg: string }> = {
  correct: { cls: "text-[#0d7a4f]", icon: <Check size={14} />, label: "Correct", bg: "bg-green" },
  almost: { cls: "text-[#96690f]", icon: <Minus size={14} />, label: "Almost — close, but not quite", bg: "bg-amber" },
  incorrect: { cls: "text-[#b8271b]", icon: <X size={14} />, label: "Not quite", bg: "bg-red" },
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
  return (
    <div className="mt-4 pt-4 border-t border-line-soft animate-fade-in">
      <div className={"flex items-center gap-2 text-[15px] font-semibold mb-2.5 " + m.cls}>
        <span className={"w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 " + m.bg}>{m.icon}</span>
        {m.label}
      </div>
      <div className="bg-bg rounded-xl p-3.5 text-sm leading-relaxed text-ink-soft">{children}</div>
      <button
        autoFocus
        onClick={onContinue}
        className="mt-3 w-full rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 text-[15px] transition-colors active:scale-[0.97]"
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
    : "border-line bg-bg focus:bg-white focus:border-blue";
  const common =
    "w-full text-[16px] px-3.5 py-3 rounded-xl border-[1.5px] outline-none transition-colors font-sans " + statusClasses;
  const props = {
    value,
    disabled,
    placeholder,
    autoFocus,
    autoComplete: "off",
    spellCheck: false,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !textarea) {
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
      className="inline-flex items-center gap-1 text-[13px] text-ink-faint bg-transparent border border-line rounded-full px-3 py-1.5 hover:bg-line-soft hover:text-ink transition-colors"
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
      className="rounded-full bg-blue hover:bg-blue-dark disabled:bg-[#d1d1d6] disabled:cursor-not-allowed text-white font-semibold px-5 py-3 text-[15px] transition-colors active:scale-[0.97] inline-flex items-center gap-2"
    >
      {children}
    </button>
  );
}
