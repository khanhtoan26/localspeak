import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page mode switch", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Phase 6 practice paths with helper copy and selected state", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", { name: "JSON Analysis" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Live Audio Practice" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByText(
        "Import assessment data to inspect scores, pauses, words, and phonemes.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Record from your microphone and watch the AI coach respond live.",
      ),
    ).toBeInTheDocument();
  });

  it("does not claim Gemini Live while the audio path still uses Deepgram", () => {
    render(<Home />);

    expect(screen.queryByText(/Gemini Live/i)).not.toBeInTheDocument();
  });
});
