import type * as React from "react"
import { BookOpenCheck, ClipboardList, FileJson, Mic } from "lucide-react"

export type SurfaceId = "json" | "audio" | "ielts-practice" | "toeic-practice";

export type NavItem = {
  id: SurfaceId
  label: string
  description: string
  group: "Practice" | "Coming soon"
  enabled: boolean
  badge?: string
  icon: React.ComponentType<{ className?: string }>
}

export const mainNav = [
  {
    id: "json",
    label: "JSON Analysis",
    description: "Analyze pronunciation evidence",
    group: "Practice",
    enabled: true,
    icon: FileJson,
  },
  {
    id: "audio",
    label: "Live Audio Practice",
    description: "Record and compare a sentence",
    group: "Practice",
    enabled: true,
    icon: Mic,
  },
  {
    id: "ielts-practice",
    label: "IELTS Practice",
    description: "Prompt practice coming in Phase 8/9",
    group: "Coming soon",
    enabled: false,
    badge: "Coming soon",
    icon: BookOpenCheck,
  },
  {
    id: "toeic-practice",
    label: "TOEIC Practice",
    description: "TOEIC task practice coming later",
    group: "Coming soon",
    enabled: false,
    badge: "Coming soon",
    icon: ClipboardList,
  },
] as const satisfies readonly NavItem[]

export const practiceNav = mainNav.filter((item) => item.group === "Practice")
export const comingSoonNav = mainNav.filter(
  (item) => item.group === "Coming soon"
)
