import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedSessionsPanel } from "./saved-sessions-panel";
import {
  createGeminiFeedbackFixture,
  createJsonAnalysisResponseFixture,
  createSavedSessionFixture,
} from "./test-fixtures";

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

function toListItem(session: ReturnType<typeof createSavedSessionFixture>) {
  const {
    inputMetadata: _inputMetadata,
    metrics: _metrics,
    feedback: _feedback,
    ...listItem
  } = session;
  return listItem;
}

describe("SavedSessionsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "22222222-2222-4222-8222-222222222222"),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("creates and reuses localspeak.ownerKey.v1 for list and save requests", async () => {
    const analysis = createJsonAnalysisResponseFixture();
    const savedSession = createSavedSessionFixture();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({ contract: "saved-session-list.v1", sessions: [] }),
      )
      .mockImplementationOnce(() =>
        jsonResponse({ contract: "saved-session-create.v1", session: savedSession }, true),
      )
      .mockImplementationOnce(() =>
        jsonResponse({
          contract: "saved-session-list.v1",
          sessions: [toListItem(savedSession)],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <SavedSessionsPanel
        analysis={analysis}
        aiCoachState={{ status: "done", feedback: createGeminiFeedbackFixture() }}
        onReopen={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/saved-sessions?ownerKey=22222222-2222-4222-8222-222222222222",
        { cache: "no-store" },
      ),
    );
    expect(window.localStorage.getItem("localspeak.ownerKey.v1")).toBe(
      "22222222-2222-4222-8222-222222222222",
    );

    fireEvent.click(screen.getByRole("button", { name: "Save Result" }));

    await waitFor(() => expect(screen.getByText("Saved to this browser's history.")).toBeInTheDocument());
    const saveCall = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/saved-sessions" && (init as RequestInit).method === "POST",
    );
    expect(saveCall).toBeTruthy();
    const saveBody = JSON.parse((saveCall?.[1] as RequestInit).body as string);
    expect(saveBody).toMatchObject({
      ownerKey: "22222222-2222-4222-8222-222222222222",
      inputMode: "json",
      referenceText: analysis.extracted.referenceText,
    });
    expect(saveBody.metrics.summary.wpm).toBe(analysis.summary.wpm);
    expect(JSON.stringify(saveBody)).not.toContain("vendorPayload");
  });

  it("lists saved sessions and reopens a saved result through detail parsing", async () => {
    const savedSession = createSavedSessionFixture();
    const onReopen = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() =>
          jsonResponse({
            contract: "saved-session-list.v1",
            sessions: [toListItem(savedSession)],
          }),
        )
        .mockImplementationOnce(() =>
          jsonResponse({
            contract: "saved-session-detail.v1",
            session: savedSession,
          }),
        ),
    );

    render(
      <SavedSessionsPanel
        analysis={createJsonAnalysisResponseFixture()}
        aiCoachState={{ status: "idle" }}
        onReopen={onReopen}
      />,
    );

    expect(await screen.findByText("Three trees practice")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reopen Result" }));

    await waitFor(() =>
      expect(onReopen).toHaveBeenCalledWith(
        expect.objectContaining({
          contract: "json-analysis-response.v1",
        }),
        "Reopened saved result",
      ),
    );
  });

  it("surfaces Zod parsing failures as load errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementationOnce(() => jsonResponse({ contract: "saved-session-list.v1" })),
    );

    render(
      <SavedSessionsPanel
        analysis={createJsonAnalysisResponseFixture()}
        aiCoachState={{ status: "idle" }}
        onReopen={vi.fn()}
      />,
    );

    expect(
      await screen.findByText("We couldn't load saved attempts. Refresh and try again."),
    ).toBeInTheDocument();
  });
});
