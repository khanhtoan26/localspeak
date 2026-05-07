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
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={disabled || isConnecting}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-all
          ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
          ${disabled || isConnecting ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {isRecording && (
          <span className="w-3 h-3 bg-red-300 rounded-full animate-pulse" />
        )}
        {isConnecting
          ? "Connecting..."
          : isRecording
            ? "Stop"
            : "Record"}
      </button>

      {/* Waveform visualization */}
      {isRecording && (
        <div
          ref={barsRef}
          className="flex items-end gap-[2px] h-10"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="w-[3px] bg-blue-400 rounded-sm transition-[height] duration-75"
              style={{ height: "4px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
