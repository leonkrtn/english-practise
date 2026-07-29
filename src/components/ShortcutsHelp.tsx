"use client";

import { KeyBadge } from "@/components/exercises/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Row = { keys: string[]; label: string };
type Group = { title: string; note?: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "Überall",
    note: "Funktioniert auf jedem Screen — außer während du in ein Textfeld tippst.",
    rows: [
      { keys: ["Esc"], label: "Zurück / Session beenden" },
      { keys: ["M"], label: "Ton stumm/an" },
      { keys: ["H"], label: "Diese Übersicht" },
    ],
  },
  {
    title: "Navigation",
    note: "Pausiert, solange eine Session, ein Test oder eine Reading-/Schreibaufgabe läuft — sonst wäre der Fortschritt mit einem Tastendruck weg. Zum Verlassen Esc drücken.",
    rows: [
      { keys: ["G"], label: "Ziel" },
      { keys: ["W"], label: "Wörter" },
      { keys: ["S"], label: "Statistiken" },
      { keys: [","], label: "Einstellungen" },
    ],
  },
  {
    title: "Hauptmenü",
    rows: [
      { keys: ["1", "–", "5"], label: "Modus wählen (Vocabulary, Grammar, Linking, Reading, Test)" },
      { keys: ["Enter"], label: "Session bzw. Test starten" },
      { keys: ["C"], label: "Optionen öffnen (Session-Inhalt / Test-Einstellungen)" },
      { keys: ["R"], label: "„Gelerntes wiederholen“ mit Filtern öffnen" },
      { keys: ["Q"], label: "Speed-Runde starten (nur Vocabulary)" },
    ],
  },
  {
    title: "Während einer Übung",
    rows: [
      { keys: ["1", "–", "4"], label: "Antwortoption wählen (Multiple Choice)" },
      { keys: ["1", "–", "9"], label: "Wortkachel setzen (Satzbau)" },
      { keys: ["1"], label: "Hint anzeigen" },
      { keys: ["⌫"], label: "Letzte Wortkachel zurücknehmen" },
      { keys: ["Enter"], label: "Antwort prüfen / weiter" },
      { keys: ["F"], label: "Wort als Favorit markieren" },
      { keys: ["X"], label: "Wort dauerhaft ausschließen" },
    ],
  },
  {
    title: "Im Test",
    rows: [
      { keys: ["1", "–", "4"], label: "Antwortoption wählen" },
      { keys: ["→"], label: "Nächste Frage (auf der letzten: abgeben)" },
      { keys: ["←"], label: "Vorherige Frage" },
      { keys: ["Enter"], label: "Antwort bestätigen und weiter" },
      { keys: ["Esc"], label: "Test abbrechen (wird nicht benotet)" },
    ],
  },
  {
    title: "Nach einer Session",
    rows: [
      { keys: ["Enter"], label: "Zurück zum Hauptmenü" },
      { keys: ["R"], label: "Fehler wiederholen" },
    ],
  },
  {
    title: "Statistiken",
    rows: [
      { keys: ["1", "–", "5"], label: "Tab wählen (Übersicht, Vokabeln, Grammatik, Tests, Erfolge)" },
      { keys: ["←", "→"], label: "Tab wechseln" },
    ],
  },
  {
    title: "Wortliste",
    rows: [{ keys: ["/"], label: "Suche fokussieren" }],
  },
];

export default function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-[18px] p-6 sm:max-w-[460px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold">Tastenkürzel</DialogTitle>
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
