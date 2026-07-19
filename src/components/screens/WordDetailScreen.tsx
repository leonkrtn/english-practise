"use client";

import { VOCAB_BY_ID } from "@/lib/vocab";
import { useStore } from "@/lib/store";

export default function WordDetailScreen({ wordId, onBack, onPractice }: { wordId: string; onBack: () => void; onPractice: (wordId: string) => void }) {
  const store = useStore();
  const w = VOCAB_BY_ID[wordId];
  const s = store.wordState(wordId);

  return (
    <section className="animate-fade-in">
      <button onClick={onBack} className="block text-ink-soft hover:text-ink rounded-full px-0 py-2 mb-4 text-[15px] font-medium">
        ← Back to Words
      </button>
      <span
        className={
          "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 " +
          (w.type === "adjective" ? "text-purple bg-purple-light" : "text-blue bg-blue-light")
        }
      >
        {w.type === "verb" ? "Verb" : "Adjective"}
      </span>
      <h1 className="text-[30px] font-bold tracking-tight mt-1 mb-1.5">{w.en}</h1>
      <p className="text-ink-soft text-[15px] mb-7 leading-relaxed">{w.de.join(" / ")}</p>

      <div className="bg-card border border-line-soft rounded-2xl p-5 shadow-sm mb-4">
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

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat value={s.timesSeen} label="Times practiced" />
        <Stat value={s.timesSeen ? Math.round((s.timesCorrect / s.timesSeen) * 100) + "%" : "—"} label="Accuracy" />
        <Stat value={Math.round(s.score * 20) + "%"} label="Mastery" />
        <Stat value={s.spellingErrors} label="Spelling slips" />
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => store.toggleFavorite(wordId)}
          className="flex-1 rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px] transition-colors"
        >
          {s.favorite ? "★ Favorited" : "☆ Add to Favorites"}
        </button>
        <button
          onClick={() => onPractice(wordId)}
          className="flex-1 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3.5 text-[15px] transition-colors"
        >
          Practice this word
        </button>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-card border border-line-soft rounded-[14px] p-4.5">
      <div className="text-[26px] font-bold tracking-tight">{value}</div>
      <div className="text-[12.5px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}
