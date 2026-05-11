import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetricCardTone = "default" | "success" | "warning" | "destructive"

type MetricCardProps = {
  label: string
  value: React.ReactNode
  description?: string
  trend?: React.ReactNode
  tone?: MetricCardTone
  className?: string
}

const toneClasses: Record<MetricCardTone, string> = {
  default: "border-border",
  success: "border-success-border",
  warning: "border-warning-border",
  destructive: "border-destructive-border",
}

const valueClasses: Record<MetricCardTone, string> = {
  default: "text-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
}

export function MetricCard({
  label,
  value,
  description,
  trend,
  tone = "default",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("min-w-0 gap-4", toneClasses[tone], className)}>
      <CardHeader className="gap-1">
        <CardDescription
          className="font-mono text-xs font-semibold uppercase tracking-[0.08em]"
          data-testid="summary-metric-label"
        >
          {label}
        </CardDescription>
        <CardTitle className={cn("text-3xl leading-none tracking-tight", valueClasses[tone])}>
          {value}
        </CardTitle>
      </CardHeader>
      {(description || trend) ? (
        <CardContent className="space-y-2">
          {description ? (
            <p className="m-0 text-sm text-muted-foreground">{description}</p>
          ) : null}
          {trend ? <div className="text-sm font-medium">{trend}</div> : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
