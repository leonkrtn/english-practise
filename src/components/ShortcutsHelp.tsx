"use client";

import { KeyBadge } from "@/components/exercises/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Row = { keys: string[]; label: string };
type Group = { title: string; note?: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "Everywhere",
    note: "Works on every screen — except while you are typing into a text field.",
    rows: [
      { keys: ["Esc"], label: "Back / end session" },
      { keys: ["M"], label: "Mute / unmute" },
      { keys: ["H"], label: "This overview" },
    ],
  },
  {
    title: "Navigation",
    note: "Paused while a session, test or reading/writing task is running — otherwise one keypress would throw the progress away. Press Esc to leave first.",
    rows: [
      { keys: ["G"], label: "Goal" },
      { keys: ["W"], label: "Words" },
      { keys: ["S"], label: "Statistics" },
      { keys: [","], label: "Settings" },
    ],
  },
  {
    title: "Home",
    rows: [
      { keys: ["1", "–", "6"], label: "Choose mode (Vocabulary, Grammar, Idioms, Linking, Reading, Test)" },
      { keys: ["Enter"], label: "Start session or test" },
      { keys: ["C"], label: "Open options (session content / test settings)" },
      { keys: ["R"], label: "Open \u201creview learned\u201d with filters" },
      { keys: ["Q"], label: "Start speed round (Vocabulary only)" },
    ],
  },
  {
    title: "During an exercise",
    rows: [
      { keys: ["1", "–", "4"], label: "Pick an answer option (multiple choice)" },
      { keys: ["1", "–", "9"], label: "Place a word tile (sentence building)" },
      { keys: ["1"], label: "Show a hint" },
      { keys: ["⌫"], label: "Undo the last word tile" },
      { keys: ["Enter"], label: "Check answer / continue" },
      { keys: ["F"], label: "Mark word as favourite" },
      { keys: ["X"], label: "Exclude the word permanently" },
    ],
  },
  {
    title: "During a test",
    rows: [
      { keys: ["1", "–", "4"], label: "Pick an answer option" },
      { keys: ["→"], label: "Next question (on the last: submit)" },
      { keys: ["←"], label: "Previous question" },
      { keys: ["Enter"], label: "Confirm answer and continue" },
      { keys: ["Esc"], label: "Cancel test (not graded)" },
    ],
  },
  {
    title: "After a session",
    rows: [
      { keys: ["Enter"], label: "Back to home" },
      { keys: ["R"], label: "Repeat mistakes" },
    ],
  },
  {
    title: "Statistics",
    rows: [
      { keys: ["1", "–", "5"], label: "Choose tab (Overview, Vocabulary, Grammar, Tests, Badges)" },
      { keys: ["←", "→"], label: "Switch tab" },
    ],
  },
  {
    title: "Word list",
    rows: [{ keys: ["/"], label: "Focus search" }],
  },
];

export default function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-[18px] p-6 sm:max-w-[460px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-[12px] font-bold uppercase tracking-wide text-ink-faint mb-1.5">{g.title}</div>
              {g.note && <p className="text-[12px] text-ink-faint mb-2 leading-relaxed">{g.note}</p>}
              <div className="flex flex-col gap-2">
                {g.rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-[104px] shrink-0">
                      {row.keys.map((k, j) =>
                        k === "–" ? (
                          <span key={j} className="text-ink-faint text-[12px]">
                            –
                          </span>
                        ) : (
                          <KeyBadge key={j}>{k}</KeyBadge>
                        )
                      )}
                    </div>
                    <div className="text-[13px] text-ink-soft leading-snug">{row.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
