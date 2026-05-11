import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PracticeReadinessStatus = "empty" | "ready" | "recording" | "complete"

type PracticeReadinessCardProps = {
  title: string
  description: string
  status?: PracticeReadinessStatus
  className?: string
}

const statusLabels: Record<PracticeReadinessStatus, string> = {
  empty: "Needs reference",
  ready: "Ready",
  recording: "Recording",
  complete: "Complete",
}

const statusClasses: Record<PracticeReadinessStatus, string> = {
  empty: "border-warning-border bg-warning/5 text-warning-foreground",
  ready: "border-success-border bg-success/5 text-success-foreground",
  recording: "border-primary/20 bg-primary/10 text-primary",
  complete: "border-border bg-muted text-foreground",
}

export function PracticeReadinessCard({
  title,
  description,
  status = "empty",
  className,
}: PracticeReadinessCardProps) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge className={cn("shrink-0 border", statusClasses[status])} variant="outline">
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              status === "empty" && "w-1/4 bg-warning",
              status === "ready" && "w-2/3 bg-success",
              status === "recording" && "w-full bg-primary",
              status === "complete" && "w-full bg-success"
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
