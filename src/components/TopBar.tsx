"use client";

import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={
        "sticky top-0 z-20 flex items-center justify-between py-4 backdrop-blur-md bg-[rgba(250,250,250,0.85)] border-b transition-colors " +
        (scrolled ? "border-line" : "border-transparent")
      }
    >
      <button onClick={goHome} className="flex items-center gap-2.5 font-semibold text-[16px] tracking-tight">
        <span className="w-[9px] h-[9px] rounded-full bg-blue" />
        Vocab Trainer
      </button>
      <div className="flex items-center gap-1">
        <button
          onClick={goList}
          className={"text-[14px] font-medium px-3 py-2 rounded-full transition-colors " + (screen === "list" || screen === "detail" ? "bg-ink text-white" : "text-ink-soft hover:bg-line-soft hover:text-ink")}
        >
          Words
        </button>
        <button
          onClick={goStats}
          className={"text-[14px] font-medium px-3 py-2 rounded-full transition-colors " + (screen === "stats" ? "bg-ink text-white" : "text-ink-soft hover:bg-line-soft hover:text-ink")}
        >
          Stats
        </button>
        <button
          onClick={onLogout}
          title="Abmelden"
          className="text-[14px] font-medium px-3 py-2 rounded-full text-ink-soft hover:bg-line-soft hover:text-ink transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
