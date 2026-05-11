"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type RecordingStatus = "idle" | "connecting" | "recording" | "complete" | "error"

type RecordingControlProps = {
  status: RecordingStatus
  disabled: boolean
  onStart: () => void
  onStop: () => void
  analyserNode?: AnalyserNode | null
  disabledMessage?: string
  className?: string
}

const statusLabels: Record<RecordingStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  recording: "Recording",
  complete: "Complete",
  error: "Error",
}

const statusClasses: Record<RecordingStatus, string> = {
  idle: "border-border bg-muted text-foreground",
  connecting: "border-primary/20 bg-primary/10 text-primary",
  recording: "border-destructive-border bg-destructive/10 text-destructive",
  complete: "border-success-border bg-success/5 text-success-foreground",
  error: "border-destructive-border bg-destructive/5 text-destructive",
}

const progressValue: Record<RecordingStatus, number> = {
  idle: 0,
  connecting: 35,
  recording: 70,
  complete: 100,
  error: 100,
}

export function RecordingControl({
  status,
  disabled,
  onStart,
  onStop,
  analyserNode,
  disabledMessage,
  className,
}: RecordingControlProps) {
  const isRecording = status === "recording"
  const isConnecting = status === "connecting"
  const buttonDisabled = disabled || isConnecting

  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg">Recording control</CardTitle>
            <CardDescription>
              Record one focused attempt and review the transcript before scoring.
            </CardDescription>
          </div>
          <Badge className={cn("shrink-0 border", statusClasses[status])} variant="outline">
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full sm:w-auto"
          disabled={buttonDisabled}
          onClick={isRecording ? onStop : onStart}
          size="lg"
          type="button"
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        {disabled && disabledMessage ? (
          <p className="m-0 text-sm text-muted-foreground">{disabledMessage}</p>
        ) : null}

        <div className="space-y-2" aria-hidden={analyserNode ? undefined : true}>
          <Progress value={progressValue[status]} />
          <div className="flex h-10 items-end gap-1 rounded-md bg-muted p-2">
            {Array.from({ length: 18 }, (_, index) => (
              <span
                className={cn(
                  "w-full rounded-sm bg-primary/30 transition-all",
                  isRecording ? "animate-pulse bg-primary" : "bg-border"
                )}
                key={index}
                style={{ height: `${20 + ((index * 13) % 70)}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
