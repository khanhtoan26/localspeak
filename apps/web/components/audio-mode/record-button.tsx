"use client";

import { useEffect, useRef } from "react";
import type { AudioSessionStatus } from "./use-audio-session";

interface RecordButtonProps {
  status: AudioSessionStatus;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
  analyserNode: AnalyserNode | null;
}

export function RecordButton({
  status,
  onStart,
  onStop,
  disabled,
  analyserNode,
}: RecordButtonProps) {
  const barsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (status !== "recording" || !analyserNode || !barsRef.current) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    const bars = barsRef.current.children;

    const animate = () => {
      analyserNode.getByteFrequencyData(dataArray);
      const barCount = bars.length;
      const step = Math.floor(dataArray.length / barCount);
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const height = Math.max(4, (value / 255) * 40);
        (bars[i] as HTMLElement).style.height = `${height}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, analyserNode]);

  const isRecording = status === "recording";
  const isConnecting = status === "connecting";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={disabled || isConnecting}
        className={isRecording ? "json-primary-button" : "json-primary-button"}
        style={{
          borderRadius: "999px",
          background: isRecording ? "var(--danger)" : "var(--ink)",
          borderColor: isRecording ? "var(--danger)" : "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {isRecording && (
          <span
            style={{
              width: "10px",
              height: "10px",
              background: "#fca5a5",
              borderRadius: "999px",
              animation: "blink 1s step-end infinite",
            }}
          />
        )}
        {isConnecting ? "Connecting..." : isRecording ? "Stop" : "Record"}
      </button>

      {/* Waveform visualization */}
      {isRecording && (
        <div
          ref={barsRef}
          style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "40px" }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                background: "var(--accent)",
                borderRadius: "2px",
                height: "4px",
                transition: "height 75ms",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
