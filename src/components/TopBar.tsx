"use client";

import { ArrowLeftRight, BarChart3, Flag, Keyboard, LogOut, ScrollText, Settings, Volume2, VolumeX } from "lucide-react";
import type { Screen } from "./AppShell";
import type { Product } from "@/lib/product";
import { useSoundMuted } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LevelPill from "./LevelPill";
import SyncStatus from "./SyncStatus";

export default function TopBar({
  screen,
  xp,
  pendingSync,
  product,
  onSwitchProduct,
  goHome,
  goList,
  goStats,
  goSettings,
  goGoal,
  onShortcuts,
  onLogout,
}: {
  screen: Screen;
  xp: number;
  pendingSync: number;
  product: Product;
  onSwitchProduct: () => void;
  goHome: () => void;
  goList: () => void;
  goStats: () => void;
  goSettings: () => void;
  goGoal: () => void;
  onShortcuts: () => void;
  onLogout: () => void;
}) {
  const [muted, toggleMuted] = useSoundMuted();
  return (
    <div className="shrink-0 flex items-center justify-between gap-2 py-2.5 border-b border-line-soft">
      <div className="flex items-center gap-2.5 min-w-0">
        <button onClick={goHome} aria-label="Home" className="flex items-center shrink-0">
          <span className="text-[19px] font-extrabold tracking-tight bg-gradient-to-r from-blue via-blue-dark to-purple bg-clip-text text-transparent">
            PRACTISE
          </span>
        </button>
        <LevelPill xp={xp} onClick={goStats} />
        <SyncStatus pendingSync={pendingSync} />
      </div>
      <div className="flex items-center gap-1">
        <IconButton onClick={onSwitchProduct} title={product === "finance" ? "Switch to English" : "Switch to Finance"}>
          <ArrowLeftRight size={18} />
        </IconButton>
        <IconButton onClick={toggleMuted} title={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </IconButton>
        <IconButton active={screen === "goal"} onClick={goGoal} title="Goal">
          <Flag size={18} />
        </IconButton>
        <IconButton active={screen === "list" || screen === "detail"} onClick={goList} title="Words">
          <ScrollText size={18} />
        </IconButton>
        <IconButton active={screen === "stats"} onClick={goStats} title="Stats">
          <BarChart3 size={18} />
        </IconButton>
        <IconButton active={screen === "settings"} onClick={goSettings} title="Settings">
          <Settings size={18} />
        </IconButton>
        <IconButton onClick={onShortcuts} title="Keyboard shortcuts (H)">
          <Keyboard size={18} />
        </IconButton>
        <IconButton onClick={onLogout} title="Sign out">
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
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={onClick}
            aria-label={title}
            variant="ghost"
            size="icon"
            className={
              "rounded-full transition-all " +
              (active
                ? "bg-gradient-to-br from-blue to-purple text-white shadow-[0_4px_12px_-4px_rgba(0,113,227,0.5)] hover:from-blue hover:to-purple hover:text-white"
                : "text-ink-soft hover:bg-line-soft hover:text-ink")
            }
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}
