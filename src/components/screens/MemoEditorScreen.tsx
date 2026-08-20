"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCustomMemo, type CustomCardInput } from "@/lib/customMemoStore";
import { useStore } from "@/lib/store";
import type { MemoFact, MemoRule } from "@/lib/memo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PrimaryButton } from "@/components/exercises/shared";

const EMPTY: CustomCardInput = { title: "", statement: "", explanation: "", facts: [] };

const cardCount = (n: number) => (n === 1 ? "1 card" : `${n} cards`);

/**
 * The learner's own rule sets: create a set, write cards, practise them alongside the built-in ones.
 *
 * A card is deliberately just a title, a statement and some facts — that is everything the flashcard
 * and facts formats need, and writing distractors or cloze blanks by hand is work nobody does twice.
 * The rest of the Rules mode treats these cards exactly like the shipped ones.
 */
export default function MemoEditorScreen({ onExit, onPractise }: { onExit: () => void; onPractise: (setId: string) => void }) {
  const custom = useCustomMemo();
  const [openSet, setOpenSet] = useState<string | null>(null);
  const [newSetLabel, setNewSetLabel] = useState("");

  const set = custom.sets.find((s) => s.id === openSet) ?? null;

  async function addSet() {
    const label = newSetLabel.trim();
    if (!label) return;
    const id = await custom.createSet(label);
    setNewSetLabel("");
    if (id) setOpenSet(id);
  }

  return (
    <section className="animate-fade-in pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => (set ? setOpenSet(null) : onExit())}
                aria-label="Back"
                variant="ghost"
                size="icon"
                className="rounded-full border border-line bg-card text-ink-soft shrink-0 transition-all hover:bg-line-soft hover:-translate-y-0.5 hover:shadow-sm"
              />
            }
          >
            <X size={16} />
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight leading-tight truncate">{set ? set.label : "My rule sets"}</h1>
          <div className="text-[12.5px] text-ink-faint">
            {set ? cardCount(custom.cardsForSet(set.id).length) : "Write your own cards and learn them like any other set"}
          </div>
        </div>
      </div>

      {custom.unavailable ? (
        <div className="bg-amber-light/60 border border-amber/30 rounded-2xl p-4 text-[13.5px] text-ink-soft leading-relaxed">
          Own sets need database migration <span className="font-mono">0012_custom_memo.sql</span>. Run it in Supabase and reload — the
          built-in rule sets work either way.
        </div>
      ) : set ? (
        <SetEditor setId={set.id} onPractise={() => onPractise(set.id)} onDeleted={() => setOpenSet(null)} />
      ) : (
        <>
          <div className="flex flex-col gap-2.5 mb-4">
            {custom.sets.map((s) => {
              const count = custom.cardsForSet(s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setOpenSet(s.id)}
                  className="w-full bg-card border border-line-soft rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left hover:bg-bg transition-colors"
                >
                  <span className="w-1.5 h-10 rounded-full shrink-0 bg-gradient-to-b from-blue to-purple" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-ink truncate">{s.label}</div>
                    <div className="text-[11.5px] text-ink-faint">{cardCount(count)}</div>
                  </div>
                  <ChevronRight size={16} className="text-ink-faint shrink-0" />
                </button>
              );
            })}
            {custom.sets.length === 0 && (
              <div className="text-center py-10 px-5 text-ink-faint text-sm">
                No sets yet. Name one below — anything you need by heart works: legal definitions, thresholds, a formula sheet of your own.
              </div>
            )}
          </div>

          <div className="bg-card border border-line-soft rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-2">New set</div>
            <div className="flex gap-2">
              <Input
                value={newSetLabel}
                onChange={(e) => setNewSetLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSet()}
                placeholder="Set name, e.g. Lease accounting"
                className="flex-1 text-[15px]"
              />
              <Button onClick={addSet} disabled={!newSetLabel.trim()} className="rounded-xl px-4">
                <Plus size={15} />
                Add
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function SetEditor({ setId, onPractise, onDeleted }: { setId: string; onPractise: () => void; onDeleted: () => void }) {
  const custom = useCustomMemo();
  const store = useStore();
  const cards = useMemo(() => custom.cardsForSet(setId), [custom, setId]);
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <>
      <div className="flex flex-col gap-2.5 mb-3">
        {cards.map((card) =>
          editing === card.id ? (
            <CardForm
              key={card.id}
              initial={toInput(card)}
              onCancel={() => setEditing(null)}
              onSave={async (input) => {
                await custom.updateCard(card.id, input);
                setEditing(null);
              }}
            />
          ) : (
            <div key={card.id} className="bg-card border border-line-soft rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14.5px] font-semibold text-ink">{card.title}</span>
                  {store.words[card.id]?.stage === 4 && (
                    <span className="text-[10px] font-bold uppercase text-green bg-green-light rounded-full px-1.5 py-0.5">learned</span>
                  )}
                </div>
                <div className="text-[13px] text-ink-soft leading-snug mt-0.5">{card.statement}</div>
                {card.facts.length > 0 && (
                  <div className="text-[11.5px] text-ink-faint mt-1">
                    {card.facts.length === 1 ? "1 fact" : `${card.facts.length} facts`}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <IconButton label="Edit card" onClick={() => setEditing(card.id)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton label="Delete card" onClick={() => custom.deleteCard(card.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          )
        )}
      </div>

      {editing === "new" ? (
        <CardForm
          initial={EMPTY}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            await custom.createCard(setId, input);
            setEditing(null);
          }}
        />
      ) : (
        <Button
          onClick={() => setEditing("new")}
          variant="ghost"
          className="w-full h-auto rounded-2xl border-[1.5px] border-dashed border-line bg-transparent py-4 text-[14px] font-semibold text-ink-soft hover:border-blue hover:bg-blue-lighter"
        >
          <Plus size={15} />
          Add a card
        </Button>
      )}

      <div className="flex items-center gap-2 mt-5">
        <PrimaryButton onClick={onPractise} disabled={cards.length === 0}>
          Practise this set
        </PrimaryButton>
        <Button
          onClick={async () => {
            await custom.deleteSet(setId);
            onDeleted();
          }}
          variant="ghost"
          className="h-auto rounded-full border border-line text-[13.5px] text-ink-faint px-4 py-3 hover:bg-red-light hover:text-red hover:border-red/30"
        >
          <Trash2 size={14} />
          Delete set
        </Button>
      </div>
    </>
  );
}

function toInput(card: MemoRule): CustomCardInput {
  return { title: card.title, statement: card.statement, explanation: card.explanation, facts: card.facts };
}

function CardForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: CustomCardInput;
  onSave: (input: CustomCardInput) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [statement, setStatement] = useState(initial.statement);
  const [explanation, setExplanation] = useState(initial.explanation);
  const [facts, setFacts] = useState<MemoFact[]>(initial.facts.length > 0 ? initial.facts : []);
  const [saving, setSaving] = useState(false);

  const setFact = (i: number, patch: Partial<MemoFact>) => setFacts((prev) => prev.map((f, k) => (k === i ? { ...f, ...patch } : f)));

  const canSave = title.trim().length > 0 && statement.trim().length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      statement: statement.trim(),
      explanation: explanation.trim(),
      // A fact with a blank half can't be checked, so it never reaches the drill.
      facts: facts.filter((f) => f.label.trim() && f.value.trim()).map((f) => ({ label: f.label.trim(), value: f.value.trim() })),
    });
    setSaving(false);
  }

  return (
    <div className="bg-card border-[1.5px] border-blue/30 rounded-2xl p-4 flex flex-col gap-3">
      <Field label="Name">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What the rule is called" className="text-[15px]" autoFocus />
      </Field>

      <Field label="Statement to memorise">
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={3}
          placeholder="The sentence you want to be able to say from memory"
          className="w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[15px] leading-relaxed text-ink outline-none focus:border-blue"
        />
      </Field>

      <Field label="Explanation (optional)">
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          placeholder="Context — shown when you first meet the card, never tested"
          className="w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-blue"
        />
      </Field>

      <div>
        <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Facts to recall (optional)</div>
        <div className="flex flex-col gap-2">
          {facts.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input value={f.label} onChange={(e) => setFact(i, { label: e.target.value })} placeholder="Label" className="flex-1 text-[14px]" />
              <Input value={f.value} onChange={(e) => setFact(i, { value: e.target.value })} placeholder="Value" className="flex-1 text-[14px]" />
              <IconButton label="Remove fact" onClick={() => setFacts((prev) => prev.filter((_, k) => k !== i))}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
          <Button
            onClick={() => setFacts((prev) => [...prev, { label: "", value: "" }])}
            variant="ghost"
            className="h-auto self-start rounded-full border border-line bg-transparent px-3 py-2 text-[13px] text-ink-faint hover:bg-blue-lighter hover:text-blue-dark"
          >
            <Plus size={13} />
            Add fact
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <PrimaryButton onClick={save} disabled={!canSave}>
          Save card
        </PrimaryButton>
        <Button onClick={onCancel} variant="ghost" className="h-auto rounded-full border border-line px-4 py-3 text-[13.5px] text-ink-faint">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={onClick}
            aria-label={label}
            variant="ghost"
            size="icon"
            className="rounded-full border border-line bg-card text-ink-faint shrink-0 hover:bg-line-soft hover:text-ink"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
