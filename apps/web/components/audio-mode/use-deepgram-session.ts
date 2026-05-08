"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { linearResample, float32ToPcm16 } from "../../lib/audio/resample";

export type AudioSessionStatus =
  | "idle"
  | "connecting"
  | "recording"
  | "complete"
  | "error";

export interface DeepgramWord {
  word: string;
  confidence: number;
  start: number;
  end: number;
}

export interface TranscriptState {
  interim: string;
  final: string;
  words: DeepgramWord[];
}

export interface AudioSessionState {
  status: AudioSessionStatus;
  transcript: TranscriptState;
  error: string | null;
  analyserNode: AnalyserNode | null;
  start: () => Promise<void>;
  stop: () => void;
}

const KEEPALIVE_INTERVAL_MS = 3000;

function buildDeepgramUrl(apiKey: string, referenceText: string): string {
  const params = new URLSearchParams({
    model: "nova-3",
    language: "en-US",
    interim_results: "true",
    smart_format: "true",
    endpointing: "500",
    utterance_end_ms: "1500",
    vad_events: "true",
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
    api_key: apiKey,
  });

  // Add keyterm hints from reference text (boost expected words)
  const words = referenceText
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/[^a-zA-Z'-]/g, "").toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(words)];
  for (const term of unique.slice(0, 20)) {
    params.append("keyterm", term);
  }

  return `wss://api.deepgram.com/v1/listen?${params.toString()}`;
}

export function useDeepgramSession(referenceText: string): AudioSessionState {
  const [status, setStatus] = useState<AudioSessionStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptState>({
    interim: "",
    final: "",
    words: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          // Send CloseStream message
          wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
        }
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
    setAnalyserNode(null);
  }, []);

  const stop = useCallback(() => {
    // Send Finalize to flush remaining audio, then close
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: "Finalize" }));
        // Give Deepgram a moment to return final results, then close
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
          }
          cleanup();
        }, 1500);
      } catch {
        cleanup();
      }
    } else {
      cleanup();
    }
    setStatus((prev) => (prev === "recording" ? "complete" : prev));
  }, [cleanup]);

  const start = useCallback(async () => {
    setStatus("connecting");
    setTranscript({ interim: "", final: "", words: [] });
    setError(null);

    // 1. Fetch API key from backend
    let apiKey: string;
    try {
      const res = await fetch("/api/deepgram-token");
      if (!res.ok) throw new Error("Token fetch failed");
      const data = await res.json();
      apiKey = data.accessToken;
    } catch {
      setError("Unable to connect to AI coach. Check your internet connection and try again.");
      setStatus("error");
      return;
    }

    // 2. Request microphone
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "Microphone access is required. Please allow microphone access in your browser settings.",
      );
      setStatus("error");
      return;
    }
    streamRef.current = stream;

    // 3. Connect WebSocket to Deepgram
    const url = buildDeepgramUrl(apiKey, referenceText);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = async () => {
      setStatus("recording");

      // Start KeepAlive interval
      keepAliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "KeepAlive" }));
        }
      }, KEEPALIVE_INTERVAL_MS);

      // Set up AudioWorklet → PCM pipeline (only after WS is open)
      try {
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        setAnalyserNode(analyser);

        await audioCtx.audioWorklet.addModule("/audio-worklet-processor.js");
        const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");

        workletNode.port.onmessage = (evt: MessageEvent) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          const { samples } = evt.data as { samples: Float32Array };
          const resampled = linearResample(samples, audioCtx.sampleRate, 16000);
          const pcm16 = float32ToPcm16(resampled);
          try {
            ws.send(pcm16.buffer as ArrayBuffer);
          } catch {
            // WebSocket closed
          }
        };

        source.connect(workletNode);
        workletNode.connect(audioCtx.destination);
      } catch {
        setError("Unable to connect to AI coach. Check your internet connection and try again.");
        setStatus("error");
        cleanup();
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string);

        if (msg.type === "Results" && msg.channel?.alternatives?.[0]) {
          const alt = msg.channel.alternatives[0];
          const isFinal = msg.is_final === true;

          if (isFinal && alt.transcript) {
            const newWords: DeepgramWord[] = (alt.words || []).map(
              (w: { word: string; confidence: number; start: number; end: number }) => ({
                word: w.word,
                confidence: w.confidence,
                start: w.start,
                end: w.end,
              }),
            );

            setTranscript((prev) => ({
              interim: "",
              final: prev.final
                ? prev.final + " " + alt.transcript
                : alt.transcript,
              words: [...prev.words, ...newWords],
            }));
          } else if (!isFinal && alt.transcript) {
            setTranscript((prev) => ({
              ...prev,
              interim: alt.transcript,
            }));
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onerror = () => {
      setError("Connection lost — please try again.");
      setStatus("error");
      cleanup();
    };

    ws.onclose = () => {
      setStatus((prev) => (prev === "recording" ? "complete" : prev));
    };
  }, [referenceText, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { status, transcript, error, analyserNode, start, stop };
}
