import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ActionBannerVariant = "default" | "success" | "warning" | "destructive"

type ActionBannerProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  variant?: ActionBannerVariant
  className?: string
}

const variantClasses: Record<ActionBannerVariant, string> = {
  default: "border-border bg-card",
  success: "border-success-border bg-success/5",
  warning: "border-warning-border bg-warning/5",
  destructive: "border-destructive-border bg-destructive/5",
}

export function ActionBanner({
  eyebrow,
  title,
  description,
  action,
  variant = "default",
  className,
}: ActionBannerProps) {
  return (
    <Card className={cn("gap-4 overflow-hidden", variantClasses[variant], className)}>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader className="min-w-0 p-0">
          {eyebrow ? (
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <CardTitle className="text-xl leading-tight">{title}</CardTitle>
          {description ? (
            <CardDescription className="max-w-2xl">{description}</CardDescription>
          ) : null}
        </CardHeader>
        {action ? (
          <CardContent className="flex shrink-0 items-center p-0">{action}</CardContent>
        ) : null}
      </div>
    </Card>
  )
}
