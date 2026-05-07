import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusPanel } from "./status-panel";

const healthResponse = {
  status: "ok",
  service: "localspeak-api",
};

const contractResponse = {
  valid: true,
  contract: "speech-assessment-response.v1",
  issues: [],
};

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("StatusPanel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() => jsonResponse(healthResponse))
        .mockImplementationOnce(() => jsonResponse(contractResponse)),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders LocalSpeak status cards and successful API results", async () => {
    render(<StatusPanel />);

    expect(screen.getAllByText("LocalSpeak")).toHaveLength(2);
    expect(screen.getByText("API Health")).toBeInTheDocument();
    expect(screen.getByText("Contract Fixture")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh status/i }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("localspeak-api is responding."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "speech-assessment-response.v1 fixture validates.",
      ),
    ).toBeInTheDocument();
  });

  it("shows actionable API guidance when backend calls fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<StatusPanel />);

    expect(
      await screen.findAllByText(
        "Couldn't reach LocalSpeak API. Start the backend with pnpm dev:api or run pnpm dev, then refresh.",
      ),
    ).toHaveLength(2);
  });

  it("does not show success for malformed API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() => jsonResponse({ status: "ok" }))
        .mockImplementationOnce(() =>
          jsonResponse({
            valid: "false",
            contract: "speech-assessment-response.v1",
            issues: [],
          }),
        ),
    );

    render(<StatusPanel />);

    expect(
      await screen.findAllByText(
        "Couldn't reach LocalSpeak API. Start the backend with pnpm dev:api or run pnpm dev, then refresh.",
      ),
    ).toHaveLength(2);
  });

  it("re-runs both checks when Refresh Status is clicked", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(healthResponse))
      .mockImplementationOnce(() => jsonResponse(contractResponse))
      .mockImplementationOnce(() => jsonResponse(healthResponse))
      .mockImplementationOnce(() => jsonResponse(contractResponse));
    vi.stubGlobal("fetch", fetchMock);

    render(<StatusPanel />);

    await screen.findByText("localspeak-api is responding.");
    await userEvent.click(screen.getByRole("button", { name: /refresh status/i }));

    expect(fetchMock).toHaveBeenCalledWith("/api/health", { cache: "no-store" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contracts/sample-json/validate",
      { cache: "no-store" },
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
