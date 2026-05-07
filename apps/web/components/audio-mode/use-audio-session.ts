"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Session } from "@google/genai";
import { connectToGeminiLive } from "../../lib/audio/gemini-live-client";
import {
  linearResample,
  float32ToPcm16,
  arrayBufferToBase64,
} from "../../lib/audio/resample";

export type AudioSessionStatus =
  | "idle"
  | "connecting"
  | "recording"
  | "complete"
  | "error";

export interface AudioSessionState {
  status: AudioSessionStatus;
  analysis: string;
  error: string | null;
  analyserNode: AnalyserNode | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useAudioSession(referenceText: string): AudioSessionState {
  const [status, setStatus] = useState<AudioSessionStatus>("idle");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setAnalyserNode(null);
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setStatus((prev) => (prev === "recording" ? "complete" : prev));
  }, [cleanup]);

  const start = useCallback(async () => {
    setStatus("connecting");
    setAnalysis("");
    setError(null);

    // 1. Fetch ephemeral token
    let token: string;
    try {
      const res = await fetch("/api/audio-token/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceText }),
      });
      if (!res.ok) throw new Error("Token fetch failed");
      const data = await res.json();
      token = data.token;
    } catch {
      setError(
        "Unable to connect to AI coach. Check your internet connection and try again.",
      );
      setStatus("error");
      return;
    }

    // 2. Connect to Gemini Live API
    let session: Session;
    try {
      session = await connectToGeminiLive(token, {
        onOpen: () => setStatus("recording"),
        onText: (text: string) => setAnalysis((prev) => prev + text),
        onTurnComplete: () => setStatus("complete"),
        onError: () => {
          setError("Connection lost — please try again.");
          setStatus("error");
          cleanup();
        },
        onClose: () => {
          setStatus((prev) => (prev === "recording" ? "complete" : prev));
        },
      });
      sessionRef.current = session;
    } catch {
      setError(
        "Unable to connect to AI coach. Check your internet connection and try again.",
      );
      setStatus("error");
      return;
    }

    // 3. Start audio capture
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "Microphone access is required. Please allow microphone access in your browser settings.",
      );
      setStatus("error");
      session.close();
      return;
    }
    streamRef.current = stream;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    setAnalyserNode(analyser);

    await audioCtx.audioWorklet.addModule("/audio-worklet-processor.js");
    const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");

    workletNode.port.onmessage = (event: MessageEvent) => {
      const { samples } = event.data as { samples: Float32Array };
      const resampled = linearResample(samples, audioCtx.sampleRate, 16000);
      const pcm16 = float32ToPcm16(resampled);
      const base64 = arrayBufferToBase64(pcm16.buffer as ArrayBuffer);
      session.sendRealtimeInput({
        audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
      });
    };

    source.connect(workletNode);
    workletNode.connect(audioCtx.destination);
  }, [referenceText, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { status, analysis, error, analyserNode, start, stop };
}
