"use client";

import { useState } from "react";
import { FileJson, Mic, Sparkles, Target, Timer } from "lucide-react";
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
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground focus-visible:outline-none",
        active
          ? "bg-card text-foreground before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-primary"
          : "text-[#ded6ca] hover:text-card hover:bg-card/10"
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
        "relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px]",
        "text-[11px] font-semibold transition-colors duration-[120ms]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        active
          ? "text-foreground before:absolute before:top-1 before:h-1 before:w-6 before:rounded-full before:bg-primary"
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">
          {label}
        </span>
      </div>
      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(217,119,87,0.16), transparent 34rem), linear-gradient(135deg, #fafaf7 0%, #f3eee5 100%)",
      }}
    >
      <div
        className="min-h-screen sm:grid sm:grid-cols-[minmax(220px,252px)_minmax(0,1fr)]
                    sm:items-start sm:gap-5 sm:max-w-[1320px] sm:mx-auto sm:p-6"
      >
        <aside
          className="hidden sm:flex flex-col sticky top-6 self-start
                      min-h-[calc(100vh-3rem)] bg-foreground rounded-[28px]
                      p-4 gap-4 shadow-[0_30px_80px_rgba(35,30,23,0.16)]"
        >
          <div className="px-1">
            <p className="font-display text-4xl text-card tracking-[-0.04em]">
              LocalSpeak
            </p>
            <p className="mt-1 text-sm text-[#ded6ca]">
              Premium pronunciation coach
            </p>
          </div>
          <Separator className="bg-card/15" />
          <p
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]
                        text-[#f4eee5] px-1 pt-2"
          >
            Practice Tools
          </p>
          <nav aria-label="Main navigation" className="flex flex-col gap-1">
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
          <section
            aria-label="Today's coaching plan"
            className="mt-auto rounded-[22px] border border-card/10 bg-card/8 p-4 text-card"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#ded6ca]">
              Today
            </p>
            <p className="mt-3 font-display text-3xl leading-none tracking-[-0.04em]">
              5 min
            </p>
            <p className="mt-2 text-sm leading-5 text-[#ded6ca]">
              Find one bottleneck, drill it, then re-score the same sentence.
            </p>
          </section>
        </aside>
        <main className="min-w-0 p-4 pb-24 sm:p-0 sm:py-6">
          <section
            className="mb-5 overflow-hidden rounded-[28px] border border-border bg-card/85
                       p-5 shadow-[0_20px_70px_rgba(35,30,23,0.10)]
                       backdrop-blur md:grid md:grid-cols-[minmax(0,1fr)_360px] md:gap-6"
            aria-label="Coach overview"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Premium coach
              </span>
              <h1 className="mt-5 max-w-[720px] font-display text-4xl leading-[0.96] tracking-[-0.05em] text-foreground sm:text-6xl">
                Know exactly what to practice next.
              </h1>
              <p className="mt-4 max-w-[640px] text-base leading-7 text-muted-foreground sm:text-lg">
                LocalSpeak turns deterministic pronunciation evidence into one
                focused coaching move, with the raw metrics kept close but out
                of the way.
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:mt-0">
              <QuickStat icon={Target} label="Focus" value="1 drill" />
              <QuickStat icon={Timer} label="Loop" value="Analyze -> practice" />
            </div>
          </section>
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
