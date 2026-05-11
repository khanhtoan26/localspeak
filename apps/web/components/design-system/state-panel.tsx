import * as React from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type StatePanelTone = "default" | "info" | "success" | "warning" | "destructive"

type StatePanelProps = {
  title: string
  description?: string
  children?: React.ReactNode
  tone?: StatePanelTone
  ariaLive?: "off" | "polite" | "assertive"
  className?: string
}

const toneClasses: Record<StatePanelTone, string> = {
  default: "border-border bg-card",
  info: "border-primary/20 bg-primary/5 text-foreground",
  success: "border-success-border bg-success/5 text-success-foreground",
  warning: "border-warning-border bg-warning/5 text-warning-foreground",
  destructive: "border-destructive-border bg-destructive/5 text-destructive",
}

export function StatePanel({
  title,
  description,
  children,
  tone = "default",
  ariaLive = "polite",
  className,
}: StatePanelProps) {
  return (
    <Alert
      aria-live={ariaLive}
      className={cn("grid-cols-[0_1fr]", toneClasses[tone], className)}
      variant={tone === "destructive" ? "destructive" : "default"}
    >
      <AlertTitle>{title}</AlertTitle>
      {(description || children) ? (
        <AlertDescription>
          {description ? <p className="m-0">{description}</p> : null}
          {children}
        </AlertDescription>
      ) : null}
    </Alert>
  )
}
