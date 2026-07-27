"use client";

import { useState } from "react";
import { AlertCircle, Check, Lightbulb, Link2, Loader2 } from "lucide-react";
import type { AnswerResultKind } from "@/lib/types";
import type { ClausePair } from "@/lib/connectors-data";
import { CONNECTOR_CATEGORIES_BY_ID } from "@/lib/connectors-data";
import { findUsedConnector } from "@/lib/connectorCheck";
import { checkText, LanguageToolError, type LanguageToolMatch } from "@/lib/languageTool";
import { renderHighlighted } from "@/lib/textHighlight";
import { Prompt, AnswerInput, ExerciseFooter, FeedbackPanel, HintButton, PrimaryButton } from "./shared";
import { Badge } from "@/components/ui/badge";

export interface LinkingResult {
  pairId: string;
  result: AnswerResultKind;
}

export default function LinkingExercise({
  pair,
  onAnswered,
  onNext,
}: {
  pair: ClausePair;
  onAnswered: (r: LinkingResult) => void;
  onNext: () => void;
}) {
  const category = CONNECTOR_CATEGORIES_BY_ID[pair.categoryId];
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ result: AnswerResultKind; connector: string | null; matches: LanguageToolMatch[] } | null>(
    null
  );

  async function check() {
    if (checking || !text.trim()) return;
    setChecking(true);
    setError(null);
    const connector = findUsedConnector(text, category);
    try {
      const lt = await checkText(text);
      const grammarOk = lt.matches.length === 0;
      // A connector from our curated list plus clean grammar is full marks. Missing our exact
      // wordlist (the writer may have used a valid connector we just don't have listed, or
      // combined the clauses in another correct way) never gets hard-rejected as long as the
      // result is grammatically sound — that's still a good sentence.
      const result: AnswerResultKind = connector ? (grammarOk ? "correct" : "almost") : grammarOk ? "almost" : "incorrect";
      setOutcome({ result, connector, matches: lt.matches });
      onAnswered({ pairId: pair.id, result });
    } catch (e) {
      setError(e instanceof LanguageToolError ? e.message : "Die Prüfung ist fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <Badge className="h-auto inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-white shadow-sm bg-gradient-to-r from-blue to-purple">
        <Link2 size={11} /> {category.labelDe}
      </Badge>
      <Prompt>Verbinde diese beiden Sätze zu einem natürlichen Satz</Prompt>

      <div className="bg-bg rounded-xl p-4 text-[15px] leading-relaxed text-ink flex flex-col gap-2 mb-3">
        <div>{pair.a}</div>
        <div>{pair.b}</div>
      </div>

      {showHint && (
        <div className="flex flex-wrap gap-2 mb-3">
          {category.connectors.map((c) => (
            <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-light text-blue-dark">
              {c}
            </span>
          ))}
        </div>
      )}

      <AnswerInput
        value={text}
        onChange={setText}
        status={outcome ? outcome.result : null}
        disabled={!!outcome || checking}
        placeholder="Dein kombinierter Satz…"
        onEnter={check}
        textarea
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-light text-[#b8271b] text-[13px] px-4 py-3 mt-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {!outcome && (
        <ExerciseFooter>
          <HintButton onClick={() => setShowHint(true)}>
            <Lightbulb size={13} /> Bindewörter zeigen
          </HintButton>
          <PrimaryButton onClick={check} disabled={checking || !text.trim()}>
            {checking ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Wird geprüft…
              </>
            ) : (
              "Prüfen"
            )}
          </PrimaryButton>
        </ExerciseFooter>
      )}

      {outcome && (
        <FeedbackPanel result={outcome.result} onContinue={onNext}>
          <div className="mb-3">
            {outcome.connector ? (
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0d7a4f] mb-1">
                <Check size={14} /> Bindewort erkannt: &quot;{outcome.connector}&quot;
              </div>
            ) : outcome.matches.length === 0 ? (
              <div className="text-[13px] font-semibold text-[#96690f] mb-1">
                Grammatikalisch einwandfrei! Kein {category.labelDe}-Bindewort aus unserer Liste erkannt — für mehr Übung versuch es mal mit:{" "}
                {category.connectors.slice(0, 4).join(", ")}…
              </div>
            ) : (
              <div className="text-[13px] font-semibold text-[#b8271b] mb-1">
                Kein passendes {category.labelDe}-Bindewort gefunden — versuch es mit: {category.connectors.slice(0, 4).join(", ")}…
              </div>
            )}
            <div className="bg-white rounded-lg p-3 leading-relaxed">{renderHighlighted(text, outcome.matches)}</div>
          </div>
          {outcome.matches.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {outcome.matches.map((m, i) => (
                <div key={i} className="text-[13px]">
                  <b className="font-semibold">{m.ruleCategory}:</b> {m.message}
                  {m.replacements.length > 0 && <> → {m.replacements.join(", ")}</>}
                </div>
              ))}
            </div>
          )}
          <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1">So könnte es auch klingen</div>
          <div className="italic">{pair.model}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
