import { GoogleGenAI, Modality } from "@google/genai";
import type { Session, LiveServerMessage } from "@google/genai";

export interface GeminiLiveCallbacks {
  onOpen: () => void;
  onText: (text: string) => void;
  onTurnComplete: () => void;
  onError: (error: Event) => void;
  onClose: () => void;
}

/**
 * Connect to Gemini Live API using an ephemeral token.
 * Returns the Session for sending audio and closing.
 */
export async function connectToGeminiLive(
  ephemeralToken: string,
  callbacks: GeminiLiveCallbacks,
): Promise<Session> {
  const ai = new GoogleGenAI({
    apiKey: ephemeralToken,
    httpOptions: { apiVersion: "v1alpha" },
  });

  const session = await ai.live.connect({
    model: "gemini-2.0-flash",
    config: { responseModalities: [Modality.TEXT] },
    callbacks: {
      onopen: () => callbacks.onOpen(),
      onmessage: (msg: LiveServerMessage) => {
        if (msg.text) {
          callbacks.onText(msg.text);
        }
        if (msg.serverContent?.turnComplete) {
          callbacks.onTurnComplete();
        }
      },
      onerror: (e: Event) => callbacks.onError(e),
      onclose: () => callbacks.onClose(),
    },
  });

  return session;
}
