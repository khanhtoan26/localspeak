import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioModePanel } from "./audio-mode-panel";
import {
  useDeepgramSession,
  type AudioSessionState,
} from "./use-deepgram-session";

vi.mock("./use-deepgram-session", () => ({
  useDeepgramSession: vi.fn(),
}));

const defaultSession: AudioSessionState = {
  status: "idle",
  transcript: {
    final: "",
    interim: "",
    words: [],
  },
  error: null,
  analyserNode: null,
  start: vi.fn(),
  stop: vi.fn(),
};

let session: AudioSessionState;

function setSession(partial: Partial<AudioSessionState> = {}) {
  session = {
    ...defaultSession,
    transcript: partial.transcript ?? defaultSession.transcript,
    ...partial,
  };
}

describe("AudioModePanel", () => {
  beforeEach(() => {
    setSession();
    vi.mocked(useDeepgramSession).mockImplementation(() => session);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("keeps Start Recording disabled until Reference sentence has text", () => {
    render(<AudioModePanel />);

    const startButton = screen.getByRole("button", { name: "Start Recording" });
    expect(startButton).toBeDisabled();
    expect(screen.getAllByText("Your live transcript will appear here.").length).toBeGreaterThanOrEqual(1);

    fireEvent.change(screen.getByLabelText("Reference sentence"), {
      target: { value: "The trees stood near the street." },
    });

    expect(startButton).toBeEnabled();
  });

  it("shows connecting and recording state guidance", () => {
    const { rerender } = render(<AudioModePanel />);

    fireEvent.change(screen.getByLabelText("Reference sentence"), {
      target: { value: "The trees stood near the street." },
    });

    setSession({ status: "connecting" });
    rerender(<AudioModePanel />);
    expect(screen.getByText("Connecting to live transcription...")).toBeInTheDocument();

    setSession({ status: "recording" });
    rerender(<AudioModePanel />);
    expect(screen.getByRole("button", { name: "Stop Recording" })).toBeInTheDocument();
    expect(
      screen.getByText("Recording now. Speak clearly and finish the full sentence."),
    ).toBeInTheDocument();
  });

  it("renders Pronunciation result after a complete transcript", () => {
    const { rerender } = render(<AudioModePanel />);

    fireEvent.change(screen.getByLabelText("Reference sentence"), {
      target: { value: "The trees stood near the street." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start Recording" }));

    setSession({
      status: "complete",
      transcript: {
        interim: "",
        final: "The trees stood near the street.",
        words: [
          { word: "The", confidence: 0.98, start: 0, end: 0.1 },
          { word: "trees", confidence: 0.92, start: 0.2, end: 0.6 },
          { word: "stood", confidence: 0.9, start: 0.7, end: 1.0 },
          { word: "near", confidence: 0.95, start: 1.1, end: 1.3 },
          { word: "the", confidence: 0.97, start: 1.4, end: 1.5 },
          { word: "street", confidence: 0.93, start: 1.6, end: 2.0 },
        ],
      },
    });
    rerender(<AudioModePanel />);

    expect(screen.getByText("Pronunciation result")).toBeInTheDocument();
    expect(screen.getByLabelText("Word pronunciation scores")).toBeInTheDocument();
  });

  it("hides a completed Pronunciation result when the reference changes", () => {
    const { rerender } = render(<AudioModePanel />);

    fireEvent.change(screen.getByLabelText("Reference sentence"), {
      target: { value: "The trees stood near the street." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start Recording" }));

    setSession({
      status: "complete",
      transcript: {
        interim: "",
        final: "The trees stood near the street.",
        words: [
          { word: "The", confidence: 0.98, start: 0, end: 0.1 },
          { word: "trees", confidence: 0.92, start: 0.2, end: 0.6 },
          { word: "stood", confidence: 0.9, start: 0.7, end: 1.0 },
          { word: "near", confidence: 0.95, start: 1.1, end: 1.3 },
          { word: "the", confidence: 0.97, start: 1.4, end: 1.5 },
          { word: "street", confidence: 0.93, start: 1.6, end: 2.0 },
        ],
      },
    });
    rerender(<AudioModePanel />);

    expect(screen.getByText("Pronunciation result")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Reference sentence"), {
      target: { value: "A different sentence for a new attempt." },
    });

    expect(screen.queryByText("Pronunciation result")).not.toBeInTheDocument();
  });
});
