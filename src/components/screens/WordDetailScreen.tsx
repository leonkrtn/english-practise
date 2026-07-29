"use client";

import { ChevronLeft, Star } from "lucide-react";
import { VOCAB_BY_ID, WORD_TYPE_LABEL } from "@/lib/vocab";
import { useStore } from "@/lib/store";
import { needsIntensification } from "@/lib/intensify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WordDetailScreen({ wordId, onBack, onPractice }: { wordId: string; onBack: () => void; onPractice: (wordId: string) => void }) {
  const store = useStore();
  const w = VOCAB_BY_ID[wordId];
  const s = store.wordState(wordId);

  return (
    <section className="animate-fade-in">
      <Button
        onClick={onBack}
        variant="ghost"
        className="h-auto inline-flex items-center gap-1 text-ink-soft hover:text-ink hover:bg-transparent rounded-full px-0 py-2 mb-3 text-[15px] font-medium"
      >
        <ChevronLeft size={18} />
        Back to Words
      </Button>
      <Badge
        className={
          "h-auto self-start px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 " +
          (w.category === "finance"
            ? "text-green bg-green-light"
            : w.category === "math"
            ? "text-amber bg-amber-light"
            : w.type === "adjective"
            ? "text-purple bg-purple-light"
            : "text-blue bg-blue-light")
        }
      >
        {w.category === "finance" ? "Finance · " : w.category === "math" ? "Math · " : ""}
        {WORD_TYPE_LABEL[w.type]}
      </Badge>
      <h1 className="text-[26px] font-bold tracking-tight mt-1 mb-1">{w.en}</h1>
      <p className="text-ink-soft text-[15px] mb-4 leading-relaxed">{w.de.join(" / ")}</p>

      {w.definition && (
        <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm mb-4">
          <div className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">Definition</div>
          <div className="text-sm text-ink-soft leading-relaxed">{w.definition}</div>
        </div>
      )}

      <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm mb-4">
        <div className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">Example</div>
        <div className="text-sm text-ink-soft leading-relaxed">
          {w.enSentence}
          <br />
          <span className="text-ink-faint">{w.deSentence}</span>
        </div>
        {w.collocations.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[11.5px] uppercase tracking-wide font-bold text-ink-faint mb-0.5">Collocations</div>
            <div className="text-sm text-ink-soft">{w.collocations.join(" · ")}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <Stat value={s.timesSeen} label="Times practiced" />
        <Stat value={s.timesSeen ? Math.round((s.timesCorrect / s.timesSeen) * 100) + "%" : "—"} label="Accuracy" />
        <Stat value={Math.round(s.score * 20) + "%"} label="Mastery" />
        <Stat value={s.spellingErrors} label="Spelling slips" />
        <Stat value={s.hintsUsed} label="Hints used" highlight={needsIntensification(s)} />
      </div>

      {needsIntensification(s) && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-light text-[#96690f] text-[13px] px-3.5 py-3 mb-4">
          Du brauchst bei diesem Wort oft einen Hint — es lohnt sich, es gezielt zu wiederholen.
        </div>
      )}

      <div className="flex gap-2.5">
        <Button
          onClick={() => store.toggleFavorite(wordId)}
          variant="secondary"
          className="flex-1 h-auto rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3 text-[15px] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <Star size={16} fill={s.favorite ? "currentColor" : "none"} className={s.favorite ? "text-amber" : ""} />
          {s.favorite ? "Favorited" : "Add to Favorites"}
        </Button>
        <Button
          onClick={() => onPractice(wordId)}
          className="flex-1 h-auto rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 text-[15px] transition-colors"
        >
          Practice this word
        </Button>
      </div>
    </section>
  );
}

function Stat({ value, label, highlight }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className={"rounded-[14px] p-3.5 border " + (highlight ? "bg-amber-light border-amber/30" : "bg-card border-line-soft")}>
      <div className={"text-[22px] font-bold tracking-tight " + (highlight ? "text-[#96690f]" : "")}>{value}</div>
      <div className="text-[12px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}
