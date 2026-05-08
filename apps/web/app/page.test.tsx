import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page mode switch", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders current JSON and audio modes with accessible selected state", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", { name: "JSON Analysis" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Live Audio" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("does not claim Gemini Live while the audio path still uses Deepgram", () => {
    render(<Home />);

    expect(screen.queryByText(/Gemini Live/i)).not.toBeInTheDocument();
  });
});
