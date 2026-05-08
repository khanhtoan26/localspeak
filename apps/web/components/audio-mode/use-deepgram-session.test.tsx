import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDeepgramSession } from "./use-deepgram-session";

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("useDeepgramSession", () => {
  const websocketCalls: Array<{ url: string; protocols: string[] }> = [];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ accessToken: "browser-jwt" })));
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [],
        }),
      },
    });

    class MockWebSocket {
      static readonly OPEN = 1;
      readyState = 0;
      onopen: ((event: Event) => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: ((event: CloseEvent) => void) | null = null;
      send = vi.fn();
      close = vi.fn();

      constructor(url: string | URL, protocols?: string | string[]) {
        websocketCalls.push({
          url: url.toString(),
          protocols: Array.isArray(protocols) ? protocols : protocols ? [protocols] : [],
        });
      }
    }

    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    websocketCalls.length = 0;
    vi.unstubAllGlobals();
  });

  it("authenticates Deepgram WebSocket with a bearer subprotocol", async () => {
    const { result } = renderHook(() => useDeepgramSession("Talk about your company"));

    await act(async () => {
      await result.current.start();
    });

    expect(websocketCalls).toHaveLength(1);
    expect(websocketCalls[0].protocols).toEqual(["bearer", "browser-jwt"]);
    expect(websocketCalls[0].url).toContain("wss://api.deepgram.com/v1/listen?");
    expect(websocketCalls[0].url).not.toContain("api_key=");
  });
});
