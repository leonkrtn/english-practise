"use client";

import { BarChart3, LogOut, ScrollText } from "lucide-react";
import type { Screen } from "./AppShell";

export default function TopBar({
  screen,
  goHome,
  goList,
  goStats,
  onLogout,
}: {
  screen: Screen;
  goHome: () => void;
  goList: () => void;
  goStats: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="shrink-0 flex items-center justify-between py-2.5 border-b border-line-soft">
      <button onClick={goHome} className="flex items-center gap-2 font-semibold text-[15px] tracking-tight">
        <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue to-purple shadow-[0_0_6px_rgba(0,113,227,0.5)]" />
        Vocab Trainer
      </button>
      <div className="flex items-center gap-1">
        <IconButton active={screen === "list" || screen === "detail"} onClick={goList} title="Words">
          <ScrollText size={18} />
        </IconButton>
        <IconButton active={screen === "stats"} onClick={goStats} title="Stats">
          <BarChart3 size={18} />
        </IconButton>
        <IconButton onClick={onLogout} title="Abmelden">
          <LogOut size={18} />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={
        "w-8 h-8 rounded-full flex items-center justify-center transition-all " +
        (active
          ? "bg-gradient-to-br from-blue to-purple text-white shadow-[0_4px_12px_-4px_rgba(0,113,227,0.5)]"
          : "text-ink-soft hover:bg-line-soft hover:text-ink")
      }
    >
      {children}
    </button>
  );
}
