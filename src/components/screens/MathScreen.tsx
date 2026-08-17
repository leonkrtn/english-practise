"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Sigma, X, Check } from "lucide-react";
import { MATH_RULES, MATH_TOPIC_LABEL, type MathProblem, type MathRule } from "@/lib/mathRules";
import { checkMathAnswer } from "@/lib/mathAnswerCheck";
import { useMathSolveEnabled } from "@/lib/mathSettings";
import { useStore } from "@/lib/store";
import { xpForAnswer } from "@/lib/gamification";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { AnswerInput, ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Step = { kind: "learn" } | { kind: "solve"; index: number } | { kind: "simplify"; index: number } | { kind: "done" };

function buildSteps(rule: MathRule, solveEnabled: boolean): Step[] {
  const steps: Step[] = [{ kind: "learn" }];
  if (solveEnabled) rule.solve.forEach((_, i) => steps.push({ kind: "solve", index: i }));
  rule.simplify.forEach((_, i) => steps.push({ kind: "simplify", index: i }));
  steps.push({ kind: "done" });
  return steps;
}

export default function MathScreen({ onExit }: { onExit: () => void }) {
  const store = useStore();
  const [solveEnabled] = useMathSolveEnabled();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const byCategory = useMemo(() => {
    const map = new Map<string, MathRule[]>();
    MATH_RULES.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return [...map.entries()];
  }, []);

  const selectedRule = selectedId ? MATH_RULES.find((r) => r.id === selectedId) ?? null : null;
  const steps = selectedRule ? buildSteps(selectedRule, solveEnabled) : [];
  const step = steps[stepIndex];

  // Reaching the end of a rule's Learn/Solve/Simplify flow at least once marks it mastered — there's
  // no spaced-repetition scheduling here (unlike vocab/grammar), just a simple "seen it all" flag.
  useEffect(() => {
    if (selectedRule && step?.kind === "done") store.setLearningStage(selectedRule.id, 4, 0, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRule?.id, step?.kind]);

  function openRule(id: string) {
    setSelectedId(id);
    setStepIndex(0);
  }

  function backToList() {
    setSelectedId(null);
    setStepIndex(0);
  }

  function nextRule() {
    if (!selectedRule) return;
    const i = MATH_RULES.findIndex((r) => r.id === selectedRule.id);
    const next = MATH_RULES[i + 1];
    if (next) openRule(next.id);
    else backToList();
  }

  function recordAnswer(ruleId: string, format: string, result: AnswerResultKind) {
    store.updateWord(ruleId, result);
    store.recordFormatStat(format, result);
    const xp = xpForAnswer(result, 0);
    if (xp > 0) store.addXp(xp);
  }

  return (
    <section className="animate-fade-in pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={selectedRule ? backToList : onExit}
                aria-label={selectedRule ? "Zurück zur Liste" : "Mathematics beenden"}
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            {selectedRule ? <ChevronLeft size={16} /> : <X size={16} />}
          </TooltipTrigger>
          <TooltipContent>{selectedRule ? "Zurück" : "Beenden"}</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight leading-tight truncate">{selectedRule ? selectedRule.title : "Mathematics"}</h1>
          <div className="text-[12.5px] text-ink-faint flex items-center gap-1">
            <Sigma size={12} /> {MATH_TOPIC_LABEL[selectedRule?.topic ?? "differentiation"]}
          </div>
        </div>
      </div>

      {!selectedRule ? (
        <RuleList byCategory={byCategory} onSelect={openRule} />
      ) : (
        <div className="bg-card border border-line-soft rounded-2xl p-5 shadow-sm">
          {step.kind === "learn" && (
            <LearnStep
              rule={selectedRule}
              onContinue={() => {
                recordAnswer(selectedRule.id, "math-learn", "correct");
                setStepIndex((i) => i + 1);
              }}
            />
          )}
          {step.kind === "solve" && (
            <ProblemStep
              key={`${selectedRule.id}-solve-${step.index}`}
              label="Differentiate"
              problem={selectedRule.solve[step.index]}
              onAnswered={(result) => recordAnswer(selectedRule.id, "math-solve", result)}
              onNext={() => setStepIndex((i) => i + 1)}
            />
          )}
          {step.kind === "simplify" && (
            <ProblemStep
              key={`${selectedRule.id}-simplify-${step.index}`}
              label="Simplify"
              problem={selectedRule.simplify[step.index]}
              onAnswered={(result) => recordAnswer(selectedRule.id, "math-simplify", result)}
              onNext={() => setStepIndex((i) => i + 1)}
            />
          )}
          {step.kind === "done" && (
            <DoneStep
              hasNext={MATH_RULES.findIndex((r) => r.id === selectedRule.id) < MATH_RULES.length - 1}
              onNextRule={nextRule}
              onBackToList={backToList}
            />
          )}
        </div>
      )}
    </section>
  );
}

function RuleList({ byCategory, onSelect }: { byCategory: [string, MathRule[]][]; onSelect: (id: string) => void }) {
  const store = useStore();
  return (
    <div className="flex flex-col gap-5">
      {byCategory.map(([category, rules]) => (
        <div key={category}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-faint mb-2">{category}</h2>
          <div className="bg-card border border-line-soft rounded-2xl overflow-hidden">
            {rules.map((rule, i) => {
              const s = store.wordState(rule.id);
              return (
                <div
                  key={rule.id}
                  onClick={() => onSelect(rule.id)}
                  className={
                    "flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-amber-light/40 transition-colors " +
                    (i > 0 ? "border-t border-line-soft" : "")
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink">{rule.title}</div>
                    <Formula tex={rule.formulaTex} className="text-[13px] text-ink-faint" />
                  </div>
                  {s.stage === 4 && <Check size={14} className="text-green shrink-0" />}
                  <div className="text-[11px] text-ink-faint whitespace-nowrap shrink-0">{s.timesSeen ? Math.round(s.score * 20) + "%" : "new"}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LearnStep({ rule, onContinue }: { rule: MathRule; onContinue: () => void }) {
  return (
    <>
      <div className="bg-gradient-to-br from-amber-light to-amber-light/40 rounded-xl p-5 mb-4 text-center">
        <Formula tex={rule.formulaTex} display className="text-[22px]" />
      </div>
      <div className="text-[15px] text-ink-soft leading-relaxed mb-4">{rule.explanation}</div>
      <div className="flex flex-col gap-2.5 mb-5">
        {rule.examples.map((ex, i) => (
          <div key={i} className="bg-bg rounded-xl px-4 py-3 flex items-center gap-2 text-[15px]">
            <Formula tex={ex.problemTex} />
            <span className="text-ink-faint">=</span>
            <Formula tex={ex.solutionTex} />
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onContinue} autoFocus>
        Weiter
      </PrimaryButton>
    </>
  );
}

function ProblemStep({
  label,
  problem,
  onAnswered,
  onNext,
}: {
  label: string;
  problem: MathProblem;
  onAnswered: (result: AnswerResultKind) => void;
  onNext: () => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function check() {
    if (result) return;
    const ok = checkMathAnswer(value, [problem.answer, ...(problem.accepted ?? [])]);
    const res: AnswerResultKind = ok ? "correct" : "incorrect";
    setResult(res);
    onAnswered(res);
  }

  return (
    <>
      <Prompt>{label}</Prompt>
      <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center">
        <Formula tex={problem.promptTex} display className="text-[19px]" />
      </div>
      <AnswerInput
        value={value}
        onChange={setValue}
        status={result}
        disabled={!!result}
        placeholder="e.g. 3*x^2"
        onEnter={check}
      />
      <div className="text-[12px] text-ink-faint mt-1.5">
        Use <code className="font-mono">*</code> for multiplication, <code className="font-mono">^</code> for powers — e.g.{" "}
        <code className="font-mono">3*x^2</code>, <code className="font-mono">e^(2x)</code>.
      </div>
      {!result && (
        <ExerciseFooter>
          <div />
          <PrimaryButton onClick={check} disabled={!value.trim()}>
            Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
          </PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div>
            Correct answer: <code className="font-mono font-semibold text-ink">{problem.answer}</code>
          </div>
        </FeedbackPanel>
      )}
    </>
  );
}

function DoneStep({ hasNext, onNextRule, onBackToList }: { hasNext: boolean; onNextRule: () => void; onBackToList: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green to-green-dark text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Check size={24} />
      </div>
      <div className="text-[16px] font-bold mb-1">Regel abgeschlossen</div>
      <div className="text-[13.5px] text-ink-faint mb-5">Gut gemacht — weiter geht&apos;s.</div>
      <div className="flex flex-col gap-2">
        {hasNext && (
          <PrimaryButton onClick={onNextRule} autoFocus>
            Nächste Regel
          </PrimaryButton>
        )}
        <Button onClick={onBackToList} variant="ghost" className="h-auto text-[13.5px] text-ink-soft py-2">
          Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
}
