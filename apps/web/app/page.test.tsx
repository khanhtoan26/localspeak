import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page mode switch", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders default JSON surface as active with one content panel", () => {
    render(<Home />);

    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    const audioButtons = screen.getAllByRole("button", { name: "Live Audio Practice" });

    jsonButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
    audioButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current");
    });
    expect(screen.getAllByLabelText("Speech assessment JSON input")).toHaveLength(1);
  });

  it("does not use aria-pressed (replaced by aria-current)", () => {
    render(<Home />);
    // No button should have aria-pressed
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-pressed");
    });
  });

  it("does not claim Gemini Live while the audio path still uses Deepgram", () => {
    render(<Home />);

    expect(screen.queryByText(/Gemini Live/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Premium coach")).not.toBeInTheDocument();
    expect(screen.queryByText("Premium pronunciation coach")).not.toBeInTheDocument();
    expect(screen.queryByText("Know exactly what to practice next.")).not.toBeInTheDocument();
  });

  it("renders disabled future practice entries as coming soon", () => {
    render(<Home />);

    const ieltsButton = screen.getByRole("button", { name: /IELTS Practice/i });
    const toeicButton = screen.getByRole("button", { name: /TOEIC Practice/i });

    expect(ieltsButton).toBeDisabled();
    expect(toeicButton).toBeDisabled();
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThanOrEqual(2);

    fireEvent.click(ieltsButton);
    expect(screen.getByRole("button", { name: "JSON Analysis" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByLabelText("Reference sentence")).not.toBeVisible();
  });

  it("switches aria-current when clicking audio nav item", () => {
    render(<Home />);

    const audioButtons = screen.getAllByRole("button", { name: "Live Audio Practice" });
    fireEvent.click(audioButtons[0]);

    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    jsonButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current");
    });
    const updatedAudioButtons = screen.getAllByRole("button", {
      name: "Live Audio Practice",
    });
    updatedAudioButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
    expect(screen.getByLabelText("Reference sentence")).toBeVisible();
  });

  it("keeps JSON analysis panel mounted (hidden) when switching to audio", () => {
    render(<Home />);

    const audioButtons = screen.getAllByRole("button", { name: "Live Audio Practice" });
    fireEvent.click(audioButtons[0]);

    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    fireEvent.click(jsonButtons[0]);

    const jsonButtonsAfter = screen.getAllByRole("button", {
      name: "JSON Analysis",
    });
    jsonButtonsAfter.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
  });
});
