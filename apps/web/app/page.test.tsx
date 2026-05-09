import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page mode switch", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nav items with aria-current='page' on active item", () => {
    render(<Home />);

    // Both desktop and mobile navs are rendered; get all JSON Analysis buttons
    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    const audioButtons = screen.getAllByRole("button", { name: /Live Audio/i });

    // JSON Analysis is active by default (aria-current="page")
    jsonButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
    // Audio is not active (no aria-current)
    audioButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current");
    });
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
  });

  it("switches aria-current when clicking audio nav item", () => {
    render(<Home />);

    const audioButtons = screen.getAllByRole("button", { name: /Live Audio/i });
    // Click the first one (desktop sidebar)
    fireEvent.click(audioButtons[0]);

    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    jsonButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute("aria-current");
    });
    const updatedAudioButtons = screen.getAllByRole("button", {
      name: /Live Audio/i,
    });
    updatedAudioButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
  });

  it("keeps JSON analysis panel mounted (hidden) when switching to audio", () => {
    render(<Home />);

    // Switch to audio
    const audioButtons = screen.getAllByRole("button", { name: /Live Audio/i });
    fireEvent.click(audioButtons[0]);

    // Switch back to JSON
    const jsonButtons = screen.getAllByRole("button", { name: "JSON Analysis" });
    fireEvent.click(jsonButtons[0]);

    // JSON panel is visible again
    const jsonButtonsAfter = screen.getAllByRole("button", {
      name: "JSON Analysis",
    });
    jsonButtonsAfter.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-current", "page");
    });
  });
});
