"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import type { WritingTopic } from "@/lib/writingTopics";
import { CONNECTOR_CATEGORIES } from "@/lib/connectors-data";
import { findUsedConnector } from "@/lib/connectorCheck";
import { checkText, LanguageToolError, type LanguageToolMatch } from "@/lib/languageTool";
import { renderHighlighted } from "@/lib/textHighlight";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MIN_CATEGORIES } from "@/lib/linkingEssay";

export { MIN_CATEGORIES };

const MIN_WORDS = 60;

export interface LinkingEssayResult {
  text: string;
  categoriesUsed: number;
  categoriesTotal: number;
  issues: LanguageToolMatch[];
}

export default function LinkingEssayScreen({
  topic,
  onExit,
  onFinish,
}: {
  topic: WritingTopic;
  onExit: () => void;
  onFinish: (result: LinkingEssayResult) => void;
}) {
  const [text, setText] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<LanguageToolMatch[] | null>(null);

  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);
  const categoriesUsed = useMemo(() => CONNECTOR_CATEGORIES.map((c) => !!findUsedConnector(text, c)), [text]);
  const usedCount = categoriesUsed.filter(Boolean).length;
  const enoughCategories = usedCount >= MIN_CATEGORIES;

  async function handleCheck() {
    if (checking) return;
    setChecking(true);
    setError(null);
    try {
      const result = await checkText(text);
      setMatches(result.matches);
    } catch (e) {
      setError(e instanceof LanguageToolError ? e.message : "The check failed. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleFinish() {
    onFinish({
      text,
      categoriesUsed: usedCount,
      categoriesTotal: CONNECTOR_CATEGORIES.length,
      issues: matches || [],
    });
  }

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3 shrink-0 w-full max-w-2xl mx-auto">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={onExit}
                aria-label="End writing"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>End writing</TooltipContent>
        </Tooltip>
        <div className="text-[13px] font-semibold text-ink-soft">Free writing</div>
      </div>

      <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-card border border-line-soft rounded-[22px] p-5 lg:p-7 shadow-[0_2px_8px_rgba(15,23,42,0.05),0_24px_48px_-18px_rgba(15,23,42,0.18)] flex flex-col animate-fade-in">
        <Badge className="h-auto self-start px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 text-white shadow-sm bg-gradient-to-r from-green to-green-dark">
          Thema
        </Badge>
        <div className="text-[17px] font-bold tracking-tight mb-1 leading-snug">{topic.prompt}</div>
        <div className="text-[13px] text-ink-faint mb-4">
          Write freely — no sentence given. Use connectors from at least {MIN_CATEGORIES} different categories to link your sentences
          naturally.
        </div>

        <div className="mb-2 text-[11.5px] uppercase tracking-wide font-bold text-ink-faint">
          Bindewort-Kategorien ({usedCount}/{CONNECTOR_CATEGORIES.length})
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CONNECTOR_CATEGORIES.map((c, i) => (
            <Badge
              key={c.id}
              className={
                "h-auto rounded-full px-2.5 py-1 text-[12.5px] font-semibold border-[1.5px] transition-colors " +
                (categoriesUsed[i] ? "border-green bg-green-light text-[#0d7a4f]" : "border-line bg-bg text-ink-soft")
              }
            >
              {categoriesUsed[i] ? <Check size={12} /> : null}
              {c.labelDe}
            </Badge>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMatches(null);
          }}
          disabled={checking}
          placeholder="Write your text in English here…"
          rows={8}
          className="w-full text-[15px] leading-relaxed px-3.5 py-3 rounded-xl border-[1.5px] border-line bg-bg focus:bg-white focus:border-blue focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)] outline-none transition-all font-sans resize-y"
        />
        <div className="flex items-center justify-between mt-1.5 mb-4 text-[12px] text-ink-faint">
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"} {wordCount < MIN_WORDS && `(at least ${MIN_WORDS} recommended)`}
          </span>
          {!enoughCategories && <span className="text-amber font-semibold">Not enough connector categories used yet</span>}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-light text-[#b8271b] text-[13px] px-3.5 py-3 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {matches === null ? (
          <Button
            onClick={handleCheck}
            disabled={checking || text.trim().length === 0}
            variant="ghost"
            className="h-auto w-full rounded-full bg-gradient-to-r from-green to-green-dark hover:brightness-110 hover:bg-transparent hover:text-white disabled:opacity-100 disabled:from-[#d1d1d6] disabled:to-[#d1d1d6] disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold py-3.5 text-[15px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(30,182,118,0.5)] inline-flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Checking…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Check
              </>
            )}
          </Button>
        ) : (
          <div className="animate-fade-in">
            <div className="pt-4 border-t border-line-soft mb-3">
              <div className={"flex items-center gap-2 text-[15px] font-semibold mb-2.5 " + (matches.length === 0 ? "text-[#0d7a4f]" : "text-[#96690f]")}>
                <span
                  className={
                    "w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm " +
                    (matches.length === 0 ? "bg-gradient-to-br from-green to-green-dark" : "bg-gradient-to-br from-amber to-amber-dark")
                  }
                >
                  {matches.length === 0 ? <Check size={14} /> : <AlertCircle size={14} />}
                </span>
                {matches.length === 0 ? "No mistakes found" : `${matches.length} ${matches.length === 1 ? "note" : "notes"} gefunden`}
              </div>
              <div className="bg-bg rounded-xl p-3.5 text-[14.5px] leading-relaxed text-ink whitespace-pre-wrap">
                {renderHighlighted(text, matches)}
              </div>
            </div>

            {matches.length > 0 && (
              <div className="flex flex-col gap-2.5 mb-4">
                {matches.map((m, i) => (
                  <div key={i} className="rounded-xl border border-line-soft bg-card px-3.5 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-amber mb-1">{m.ruleCategory}</div>
                    <div className="text-[13.5px] text-ink-soft mb-1.5">{m.message}</div>
                    {m.replacements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.replacements.map((r, ri) => (
                          <Badge key={ri} className="h-auto px-2 py-0.5 text-[12px] font-semibold rounded-full bg-green-light text-[#0d7a4f]">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setMatches(null)}
                variant="outline"
                className="flex-1 h-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-card hover:bg-line-soft text-ink font-semibold py-3 text-[14px] transition-all active:scale-[0.97]"
              >
                <RefreshCw size={14} /> Weiter bearbeiten
              </Button>
              <Button
                onClick={handleFinish}
                variant="ghost"
                className="flex-1 h-auto rounded-full bg-gradient-to-r from-blue to-blue-dark hover:brightness-110 hover:bg-transparent hover:text-white text-white font-semibold py-3 text-[14px] transition-all active:scale-[0.97] shadow-[0_10px_22px_-8px_rgba(0,113,227,0.5)]"
              >
                Fertig
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
