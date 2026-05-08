"use client";

import { useEffect, useRef } from "react";
import type { AudioSessionStatus } from "./use-deepgram-session";

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
    <div className="audio-record-control">
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={disabled || isConnecting}
        className={`json-primary-button audio-record-button${
          isRecording ? " audio-record-button--recording" : ""
        }`}
      >
        {isRecording && (
          <span className="audio-record-button__dot" />
        )}
        {isConnecting ? "Connecting…" : isRecording ? "Stop Recording" : "Record"}
      </button>

      {/* Waveform visualization */}
      {isRecording && (
        <div ref={barsRef} className="audio-waveform" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="audio-waveform__bar" />
          ))}
        </div>
      )}
    </div>
  );
}
