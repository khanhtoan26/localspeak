import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
        "Record from your microphone and watch live transcript feedback.",
      ),
    ).toBeInTheDocument();
  });

  it("does not claim Gemini Live while the audio path still uses Deepgram", () => {
    render(<Home />);

    expect(screen.queryByText(/Gemini Live/i)).not.toBeInTheDocument();
  });

  it("keeps JSON analysis state mounted across mode switches", () => {
    const { container } = render(<Home />);

    expect(container.querySelector(".status-shell--dashboard")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: "persisted analysis state" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Live Audio Practice" }));
    expect(
      container.querySelector(".status-shell--dashboard"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Reference sentence")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "JSON Analysis" }));
    expect(container.querySelector(".status-shell--dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Speech assessment JSON input")).toHaveValue(
      "persisted analysis state",
    );
  });
});
