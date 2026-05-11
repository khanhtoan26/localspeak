"use client";

import { useState } from "react";
import { FileJson, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { JsonAnalysisPanel } from "../components/json-analysis/json-analysis-panel";
import { AudioModePanel } from "../components/audio-mode/audio-mode-panel";

type Mode = "json" | "audio";

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 w-full min-h-[44px] rounded-[14px] px-3 text-left",
        "text-sm font-medium transition-colors duration-[120ms]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "bg-card text-foreground before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-card/60"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function BottomNavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px]",
        "text-[11px] font-semibold transition-colors duration-[120ms]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <div className="min-h-screen bg-background">
      <div
        className="min-h-screen sm:grid sm:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]
                    sm:items-start sm:gap-4 sm:max-w-[1200px] sm:mx-auto sm:p-6"
      >
        <aside
          className="hidden sm:flex flex-col sticky top-6 self-start
                      bg-sidebar rounded-[18px] p-3 gap-2"
        >
          <p className="font-display text-3xl text-foreground px-1 pb-1">
            LocalSpeak
          </p>
          <Separator />
          <p
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]
                        text-subtle px-1 pt-2"
          >
            Practice Tools
          </p>
          <nav aria-label="Main navigation">
            <NavItem
              icon={FileJson}
              label="JSON Analysis"
              active={mode === "json"}
              onClick={() => setMode("json")}
            />
            <NavItem
              icon={Mic}
              label="Live Audio Practice"
              active={mode === "audio"}
              onClick={() => setMode("audio")}
            />
          </nav>
        </aside>
        <main className="min-w-0 p-4 pb-20 sm:p-0 sm:py-6">
          <div hidden={mode !== "json"}>
            <JsonAnalysisPanel />
          </div>
          <div hidden={mode !== "audio"}>
            <AudioModePanel />
          </div>
        </main>
      </div>

      <nav
        aria-label="Main navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50
                   flex h-16 border-t border-border bg-card
                   pb-[env(safe-area-inset-bottom)]"
      >
        <BottomNavItem
          icon={FileJson}
          label="JSON Analysis"
          active={mode === "json"}
          onClick={() => setMode("json")}
        />
        <BottomNavItem
          icon={Mic}
          label="Live Audio"
          active={mode === "audio"}
          onClick={() => setMode("audio")}
        />
      </nav>
    </div>
  );
}
