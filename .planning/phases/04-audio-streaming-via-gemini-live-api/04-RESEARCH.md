# Phase 4: Audio Streaming via Gemini Live API - Research

**Researched:** 2026-05-08
**Domain:** Real-time audio streaming, Gemini Live API, browser audio capture
**Confidence:** HIGH

## Summary

Phase 4 enables real-time pronunciation coaching by streaming browser audio to Gemini Live API. The architecture uses an ephemeral token pattern: the NestJS backend mints a short-lived token via `ai.authTokens.create()`, the browser uses that token to establish a direct WebSocket connection to Gemini Live API via `@google/genai` SDK (web bundle), streams PCM audio via `sendRealtimeInput()`, and receives text analysis token-by-token via the `onmessage` callback.

The `@google/genai` v1.52.0 SDK already installed in the project provides full support for this flow — both server-side token creation and browser-side Live API connection. The browser captures audio via AudioWorklet (for real-time PCM access), resamples to 16kHz mono, base64-encodes chunks, and sends them as `Blob` objects. Gemini responds with `TEXT` modality only, delivering incremental text in `LiveServerContent.modelTurn.parts[].text`.

**Primary recommendation:** Use the `@google/genai` SDK on both sides — server for token minting (with `apiVersion: 'v1alpha'`), browser for WebSocket session management. AudioWorklet handles capture + resample; no third-party audio library needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01 to D-04: Single Record/Stop button, waveform visualization, no cancel, permission handling
- D-05 to D-08: Token-by-token streaming in "Live Analysis" panel, typing indicator
- D-09 to D-12: POST /api/token endpoint, ephemeral token per session, no caching, error on expiry
- D-13 to D-15: Reference text required before recording, sent in session config
- D-16 to D-19: gemini-2.0-flash model, IELTS coach system instruction, PCM 16-bit mono 16kHz, TEXT response only
- D-20 to D-22: Specific error messages for WebSocket/mic failures, isolated from other UI
- D-23 to D-25: Audio Mode as separate top-level tab, specific layout order, dark analysis panel

### Agent's Discretion
- WebSocket message framing details (follow Gemini Live API spec)
- AudioWorklet implementation details for capturing and resampling
- Exact system instruction wording for the pronunciation coach
- CSS styling of waveform visualization
- Whether to use a third-party audio library or raw Web Audio API

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUD-01 | Stream audio from browser microphone to Gemini Live API via WebSocket | AudioWorklet + SDK `sendRealtimeInput()` with base64 PCM chunks |
| AUD-02 | Record audio and receive real-time streamed analysis | Full duplex: audio sent while text received via `onmessage` callback |
| AUD-03 | Backend provisions ephemeral tokens so browser connects directly | `ai.authTokens.create()` with `liveConnectConstraints` (v1alpha API) |
| AUD-04 | See real-time streamed Gemini analysis while audio is processed | `LiveServerContent.modelTurn.parts[].text` delivers incremental text |
| GEM-03 | Gemini audio-mode identifies pronunciation issues, phoneme errors, pauses, hesitations, drills | System instruction as IELTS coach + reference text in session config |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ephemeral token creation | API / Backend | — | GEMINI_API_KEY must stay server-side; token minted via SDK |
| Audio capture (mic) | Browser / Client | — | getUserMedia + AudioWorklet run in browser |
| WebSocket to Gemini | Browser / Client | — | Direct connection; backend is NOT a proxy |
| Audio resampling (→16kHz) | Browser / Client | — | Must happen before sending; browser native rate varies |
| Streaming text display | Browser / Client | — | Renders incrementally from WebSocket messages |
| System instruction / model config | API / Backend | Browser / Client | Locked in token constraints (server); applied at connect (browser) |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/genai | 1.52.0 | Gemini Live API (token creation + live connect) | Already installed; provides both server and browser bundles [VERIFIED: local package.json] |
| Web Audio API (AudioWorklet) | Browser native | Real-time PCM audio capture | Only way to get raw PCM samples in real-time without MediaRecorder encoding [VERIFIED: Web Audio spec] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @google/genai/web | 1.52.0 | Browser bundle of SDK for Live API | Used in Next.js client components for WebSocket session [VERIFIED: package.json exports] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AudioWorklet | MediaRecorder | MediaRecorder outputs encoded formats (webm/opus), not raw PCM — would need decoding step |
| Raw Web Audio resampling | libsamplerate-js | Adds dependency; linear interpolation is sufficient for speech at 16kHz |
| @google/genai SDK in browser | Raw WebSocket | Loses message framing, session setup, error handling from SDK |

**Installation:**
```bash
# No new packages needed — @google/genai already installed
# Just ensure it's available to the web app:
pnpm add @google/genai --filter @localspeak/web
```

**Version verification:** `@google/genai@1.52.0` confirmed installed in workspace [VERIFIED: local node_modules]

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Browser (Next.js Client Component)                              │
│                                                                 │
│  ┌──────────┐    ┌────────────┐    ┌──────────────────────┐   │
│  │ Mic      │───▶│AudioWorklet│───▶│ Resample + base64    │   │
│  │(getUserMedia) │(PCM capture)│    │ (48kHz→16kHz mono)   │   │
│  └──────────┘    └────────────┘    └──────────┬───────────┘   │
│                                                │               │
│  ┌──────────────┐                              ▼               │
│  │ Live Analysis │◀── text ◀── onmessage ◀── SDK Session ─────┼──┐
│  │ Panel (UI)    │                         (WebSocket)         │  │
│  └──────────────┘                              │               │  │
│                                        sendRealtimeInput(audio)│  │
│                                                │               │  │
└────────────────────────────────────────────────┼───────────────┘  │
                                                 │                  │
                                                 ▼                  │
                                    ┌────────────────────────┐      │
                                    │  Gemini Live API       │◀─────┘
                                    │  (WebSocket endpoint)  │
                                    │  gemini-2.0-flash      │
                                    └────────────────────────┘
                                                 ▲
┌────────────────────────────────────────────────┼───────────────┐
│ NestJS Backend                                 │               │
│                                                │               │
│  POST /api/token                               │               │
│  ┌─────────────────────────┐                   │               │
│  │ ai.authTokens.create()  │───(mints token)───┘               │
│  │ (v1alpha, GEMINI_API_KEY)│                                  │
│  └─────────────────────────┘                                   │
│       Returns: { token: "...", expiresAt: "..." }              │
└────────────────────────────────────────────────────────────────┘
```

**Flow:**
1. User enters reference text, presses Record
2. Frontend calls `POST /api/token` with reference text
3. Backend mints ephemeral token with locked constraints (model, systemInstruction, responseModalities: TEXT)
4. Frontend receives token, creates `GoogleGenAI({ apiKey: token })` instance
5. Frontend calls `ai.live.connect()` with `apiVersion: 'v1alpha'`
6. AudioWorklet starts capturing → resamples → base64 → `session.sendRealtimeInput({ audio: { data, mimeType } })`
7. `onmessage` callback fires with `LiveServerMessage` → extract `.text` → append to UI
8. User presses Stop → `session.close()` + AudioWorklet disconnect

### Recommended Project Structure
```
apps/api/src/
├── audio-token/              # New module for ephemeral token
│   ├── audio-token.module.ts
│   ├── audio-token.controller.ts
│   └── audio-token.service.ts
apps/web/
├── components/
│   └── audio-mode/           # Audio recording UI
│       ├── audio-mode-panel.tsx       # Main container
│       ├── record-button.tsx          # Record/Stop with waveform
│       ├── live-analysis-panel.tsx    # Streaming text display
│       ├── use-audio-session.ts       # Hook: token + WebSocket lifecycle
│       └── audio-worklet-processor.ts # AudioWorklet processor (separate file)
├── lib/
│   └── audio/
│       ├── resample.ts               # PCM resampling utility
│       └── gemini-live-client.ts     # SDK wrapper for browser
packages/contracts/src/
└── audio-streaming.ts        # Token request/response types
```

### Pattern 1: Ephemeral Token Creation (Backend)
**What:** NestJS endpoint mints a Gemini ephemeral token with locked Live API constraints
**When to use:** Every time user starts a recording session

```typescript
// Source: @google/genai SDK types (verified from dist/genai.d.ts)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { apiVersion: 'v1alpha' }, // Required for ephemeral tokens
});

const token = await ai.authTokens.create({
  config: {
    expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
    uses: 1, // Single use
    liveConnectConstraints: {
      model: 'gemini-2.0-flash',
      config: {
        responseModalities: ['TEXT'],
        systemInstruction: 'You are an IELTS pronunciation coach...',
      },
    },
  },
});

// token.name is the ephemeral API key string
return { token: token.name, expiresAt: expireTime };
```

### Pattern 2: Browser Live API Connection
**What:** Use SDK in browser with ephemeral token to establish WebSocket session
**When to use:** After receiving token from backend

```typescript
// Source: @google/genai SDK types (verified from dist/genai.d.ts)
import { GoogleGenAI, Modality } from '@google/genai';

// Create SDK instance with ephemeral token (NOT the server API key)
const ai = new GoogleGenAI({
  apiKey: ephemeralToken, // token.name from backend
  httpOptions: { apiVersion: 'v1alpha' },
});

const session = await ai.live.connect({
  model: 'gemini-2.0-flash',
  config: {
    responseModalities: [Modality.TEXT],
    systemInstruction: `You are an IELTS pronunciation coach...
Reference text the learner is attempting: "${referenceText}"`,
  },
  callbacks: {
    onopen: () => setStatus('connected'),
    onmessage: (msg) => {
      // msg.text returns concatenated text from all parts
      if (msg.text) {
        appendToAnalysis(msg.text);
      }
      if (msg.serverContent?.turnComplete) {
        setStatus('complete');
      }
    },
    onerror: (e) => setError('Connection lost — please try again'),
    onclose: () => setStatus('disconnected'),
  },
});
```

### Pattern 3: AudioWorklet for PCM Capture
**What:** Capture raw PCM samples from microphone via AudioWorklet
**When to use:** During recording to get uncompressed audio for Gemini

```typescript
// audio-worklet-processor.ts (runs in AudioWorklet thread)
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][], params: Record<string, Float32Array>) {
    const input = inputs[0][0]; // mono channel
    if (input && input.length > 0) {
      // Post Float32 samples to main thread
      this.port.postMessage({ samples: input });
    }
    return true; // keep processor alive
  }
}
registerProcessor('pcm-processor', PCMProcessor);
```

```typescript
// Main thread: setup and resample
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioCtx = new AudioContext();
const source = audioCtx.createMediaStreamSource(stream);

await audioCtx.audioWorklet.addModule('/audio-worklet-processor.js');
const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
source.connect(workletNode);

workletNode.port.onmessage = (event) => {
  const float32Samples = event.data.samples;
  // Resample from audioCtx.sampleRate (typically 48000) to 16000
  const resampled = linearResample(float32Samples, audioCtx.sampleRate, 16000);
  // Convert to 16-bit PCM
  const pcm16 = float32ToPcm16(resampled);
  // Base64 encode and send
  const base64 = arrayBufferToBase64(pcm16.buffer);
  session.sendRealtimeInput({
    audio: { data: base64, mimeType: 'audio/pcm;rate=16000' },
  });
};
```

### Pattern 4: Linear Resampling
**What:** Downsample from browser's native sample rate (usually 44.1/48kHz) to 16kHz
**When to use:** Every AudioWorklet buffer before sending to Gemini

```typescript
function linearResample(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples;
  const ratio = fromRate / toRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, samples.length - 1);
    const frac = srcIndex - lower;
    result[i] = samples[lower] * (1 - frac) + samples[upper] * frac;
  }
  return result;
}

function float32ToPcm16(float32: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return pcm16;
}
```

### Anti-Patterns to Avoid
- **Using MediaRecorder for streaming:** MediaRecorder outputs encoded webm/opus, not raw PCM. Would require decoding before sending to Gemini, adding latency and complexity.
- **Proxying audio through backend:** D-09 explicitly states browser connects directly. Backend only mints tokens.
- **Buffering all audio before sending:** Send chunks as they come from AudioWorklet (~128 samples per frame at native rate). Don't batch — Gemini handles incremental input.
- **Using ScriptProcessorNode:** Deprecated in favor of AudioWorklet. ScriptProcessorNode runs on main thread and causes audio glitches.
- **Caching tokens:** D-12 says always request fresh per session. Tokens are single-use anyway.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket framing for Gemini | Custom WebSocket protocol | `@google/genai` SDK `ai.live.connect()` | SDK handles setup messages, auth, reconnection signaling |
| Audio resampling | Complex polyphase filter | Linear interpolation (simple math) | For speech at 16kHz, linear is sufficient quality; no library needed |
| Token management | Custom JWT creation | `ai.authTokens.create()` | SDK handles API call, validation, format |
| VAD (voice activity detection) | Custom silence detection | Gemini's built-in VAD | Server-side VAD is automatic; just send audio continuously |

**Key insight:** The `@google/genai` SDK handles all WebSocket protocol complexity. The main custom code is AudioWorklet (browser capture) and the resampling math — both are straightforward.

## Common Pitfalls

### Pitfall 1: v1alpha API Version Requirement
**What goes wrong:** Token creation fails with 404 or "method not found"
**Why it happens:** Ephemeral tokens only work with `apiVersion: 'v1alpha'` — the default v1beta doesn't support it
**How to avoid:** Always set `httpOptions: { apiVersion: 'v1alpha' }` when creating `GoogleGenAI` instance for token operations
**Warning signs:** HTTP 404 responses from token endpoint

### Pitfall 2: AudioContext Sample Rate Mismatch
**What goes wrong:** Audio sounds sped up or slowed down on Gemini's end
**Why it happens:** Browser AudioContext typically runs at 44100 or 48000 Hz; Gemini expects 16000 Hz
**How to avoid:** Always resample to 16kHz before encoding. Read `audioCtx.sampleRate` dynamically — never hardcode 48000.
**Warning signs:** Gemini transcribes gibberish or fails to detect speech

### Pitfall 3: AudioWorklet File Serving in Next.js
**What goes wrong:** `addModule('/audio-worklet-processor.js')` fails with 404
**Why it happens:** Next.js doesn't automatically serve raw JS files from components directory. AudioWorklet requires a URL to a separate JS file.
**How to avoid:** Place the worklet processor file in `public/` directory (e.g., `public/audio-worklet-processor.js`) so Next.js serves it statically.
**Warning signs:** DOMException when calling `audioCtx.audioWorklet.addModule()`

### Pitfall 4: MIME Type for PCM Audio
**What goes wrong:** Gemini rejects audio input or interprets it incorrectly
**Why it happens:** Wrong mimeType string for PCM data
**How to avoid:** Use `'audio/pcm;rate=16000'` as the mimeType in the Blob object. This tells Gemini it's raw PCM at 16kHz.
**Warning signs:** Gemini returns empty analysis or errors about audio format

### Pitfall 5: AudioWorklet in Secure Context Only
**What goes wrong:** AudioWorklet API not available
**Why it happens:** AudioWorklet requires HTTPS (or localhost). Won't work on plain HTTP.
**How to avoid:** Ensure dev server uses localhost (which is secure context) and production uses HTTPS.
**Warning signs:** `audioContext.audioWorklet` is undefined

### Pitfall 6: Token Expiry During Long Recording
**What goes wrong:** WebSocket drops mid-session
**Why it happens:** Token has finite lifetime (configured in `expireTime`); long recordings may exceed it
**How to avoid:** Set reasonable expireTime (5+ minutes). Per D-11, show error and let user restart — no auto-reconnect in v1.
**Warning signs:** WebSocket closes unexpectedly with auth error

## Code Examples

### Complete Token Endpoint (NestJS)
```typescript
// Source: SDK types verified from dist/genai.d.ts
import { Controller, Post, Body } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Controller('api')
export class AudioTokenController {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: 'v1alpha' },
    });
  }

  @Post('token')
  async createToken(@Body() body: { referenceText: string }) {
    const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const token = await this.ai.authTokens.create({
      config: {
        expireTime,
        uses: 1,
        liveConnectConstraints: {
          model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
          config: {
            responseModalities: ['TEXT'],
            systemInstruction: this.buildSystemInstruction(body.referenceText),
          },
        },
      },
    });

    return { token: token.name, expiresAt: expireTime };
  }

  private buildSystemInstruction(referenceText: string): string {
    return `You are an expert IELTS pronunciation coach specializing in Vietnamese learners.

The learner is attempting to say: "${referenceText}"

Listen to their audio and provide real-time feedback on:
1. Pronunciation accuracy - identify specific phoneme errors using IPA notation
2. Common Vietnamese L1 interference (e.g., /θ/ → /t/, dropped final consonants, cluster reduction)
3. Hesitations, fillers, and unnatural pauses
4. Speech rate and fluency
5. Priority errors to fix first
6. Specific drills to practice

Be concise, direct, and actionable. Address the learner as "you".`;
  }
}
```

### Complete Audio Session Hook (React)
```typescript
// Source: SDK types verified from dist/genai.d.ts
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';

type SessionStatus = 'idle' | 'connecting' | 'recording' | 'complete' | 'error';

export function useAudioSession(referenceText: string) {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const start = useCallback(async () => {
    setStatus('connecting');
    setAnalysis('');
    setError(null);

    // 1. Get ephemeral token
    const res = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceText }),
    });
    if (!res.ok) {
      setError('Unable to connect to AI coach. Check your internet connection and try again.');
      setStatus('error');
      return;
    }
    const { token } = await res.json();

    // 2. Connect to Gemini Live API
    const ai = new GoogleGenAI({
      apiKey: token,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    const session = await ai.live.connect({
      model: 'gemini-2.0-flash',
      config: { responseModalities: [Modality.TEXT] },
      callbacks: {
        onopen: () => setStatus('recording'),
        onmessage: (msg: LiveServerMessage) => {
          if (msg.text) {
            setAnalysis(prev => prev + msg.text);
          }
          if (msg.serverContent?.turnComplete) {
            setStatus('complete');
          }
        },
        onerror: () => {
          setError('Connection lost — please try again');
          setStatus('error');
        },
        onclose: () => {
          if (status !== 'complete' && status !== 'error') {
            setStatus('complete');
          }
        },
      },
    });
    sessionRef.current = session;

    // 3. Start audio capture
    await startAudioCapture(session);
  }, [referenceText]);

  const stop = useCallback(() => {
    sessionRef.current?.close();
    stopAudioCapture();
    if (status === 'recording') setStatus('complete');
  }, [status]);

  return { status, analysis, error, start, stop };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ScriptProcessorNode for audio | AudioWorklet | 2018+ (Chrome 66) | Main thread no longer blocked; required for production |
| Manual WebSocket to Gemini | `@google/genai` SDK `ai.live.connect()` | 2025 (SDK v1.x) | SDK handles framing, auth, reconnect signals |
| Server-side API key in browser | Ephemeral tokens via `ai.authTokens.create()` | 2025 (v1alpha) | Secure browser-to-Gemini without exposing master key |

**Deprecated/outdated:**
- `ScriptProcessorNode`: Deprecated, runs on main thread, causes jank. Use AudioWorklet.
- Raw WebSocket to `generativelanguage.googleapis.com/ws/`: SDK abstracts this — don't construct URLs manually.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `token.name` is the string used as `apiKey` in browser SDK instance | Ephemeral Tokens | Token format might differ — need runtime verification |
| A2 | `'audio/pcm;rate=16000'` is the correct mimeType string | Code Examples | Gemini may expect different format string — verify with first integration test |
| A3 | Linear interpolation is sufficient quality for speech resampling to 16kHz | Architecture Patterns | If Gemini rejects audio, may need better resampling algorithm |
| A4 | System instruction can be locked in `liveConnectConstraints.config` | Pattern 1 | If not lockable, instruction must be sent at connect time from browser |
| A5 | Model name `gemini-2.0-flash` works with Live API (vs. `gemini-live-2.5-flash-preview`) | Architecture | SDK docs show `gemini-live-2.5-flash-preview` — may need this specific model name |

## Open Questions

1. **Model name for Live API**
   - What we know: SDK examples show `gemini-live-2.5-flash-preview` and `gemini-2.0-flash-live-preview-04-09` (Vertex). CONTEXT.md says `gemini-2.0-flash`.
   - What's unclear: Whether `gemini-2.0-flash` works with Live API or requires a Live-specific model variant
   - Recommendation: Try `gemini-2.0-flash` first. If fails, fall back to `gemini-live-2.5-flash-preview`. Make model configurable via env var (already have GEMINI_MODEL).

2. **Token response format**
   - What we know: `AuthToken` interface has `name?: string` field. SDK docs show `token.name` used as apiKey.
   - What's unclear: Whether `token.name` contains the full usable key string or needs transformation
   - Recommendation: Log response shape in first integration test. Have error handling for unexpected format.

3. **Message increments granularity**
   - What we know: `onmessage` fires with `LiveServerMessage` that has `.text` property
   - What's unclear: Whether `.text` returns only the NEW increment or the full accumulated text
   - Recommendation: Based on SDK code (`.text` is a getter on message), likely returns text from THAT message only. Append to state.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 (API), Vitest (Web) |
| Config file | `apps/api/jest.config.ts`, `apps/web/vitest.config.mts` |
| Quick run command | `pnpm --filter @localspeak/api test:unit` |
| Full suite command | `pnpm --filter @localspeak/api test && pnpm --filter @localspeak/web test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUD-01 | Audio streams to Gemini via WebSocket | integration (manual) | Manual — requires mic + live API | ❌ manual-only |
| AUD-02 | Record and receive streamed analysis | integration (manual) | Manual — end-to-end audio flow | ❌ manual-only |
| AUD-03 | Backend provisions ephemeral tokens | unit | `pnpm --filter @localspeak/api test:unit -- --testPathPattern audio-token` | ❌ Wave 0 |
| AUD-04 | Real-time streamed output visible | unit (component) | `pnpm --filter @localspeak/web test -- live-analysis` | ❌ Wave 0 |
| GEM-03 | System instruction produces pronunciation feedback | integration (manual) | Manual — requires live API | ❌ manual-only |

### Sampling Rate
- **Per task commit:** `pnpm --filter @localspeak/api test:unit`
- **Per wave merge:** Full suite both apps
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/api/src/audio-token/audio-token.service.spec.ts` — unit test for token creation (mock SDK)
- [ ] `apps/web/components/audio-mode/__tests__/live-analysis-panel.test.tsx` — component render test
- [ ] `apps/web/lib/audio/__tests__/resample.test.ts` — unit test for resampling math

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A (Phase 5) |
| V3 Session Management | Partial | Ephemeral token is session-scoped, single-use, short-lived |
| V4 Access Control | No | No user-level access control in this phase |
| V5 Input Validation | Yes | Zod validation on POST /api/token request body |
| V6 Cryptography | No | No custom crypto — SDK handles token generation |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure to browser | Information Disclosure | Ephemeral token pattern — server mints short-lived single-use token |
| Token replay | Spoofing | `uses: 1` prevents reuse; short `expireTime` limits window |
| Excessive token requests (DoS) | Denial of Service | Rate limiting on POST /api/token (can add in Phase 5 with auth) |
| Reference text injection | Tampering | Validate/sanitize reference text; limit length; escape in system instruction |

## Sources

### Primary (HIGH confidence)
- `@google/genai` v1.52.0 dist/genai.d.ts — Full type definitions for Live API, AuthTokens, Session, LiveServerMessage [VERIFIED: local package inspection]
- `@google/genai` package.json exports — Browser bundle available at `@google/genai/web` [VERIFIED: local package inspection]
- Existing codebase patterns — NestJS module structure, Zod validation, GoogleGenAI instantiation [VERIFIED: source files]

### Secondary (MEDIUM confidence)
- AudioWorklet API — Standard Web API, well-documented by MDN [CITED: MDN Web Docs / Web Audio API spec]
- PCM audio format for Gemini — `audio/pcm;rate=16000` based on SDK Blob type requiring mimeType [ASSUMED based on Gemini documentation patterns]

### Tertiary (LOW confidence)
- Exact `token.name` behavior — Inferred from SDK type `AuthToken { name?: string }` and code examples [ASSUMED]
- Model name compatibility with Live API — SDK shows specific live model names, unclear if base model works [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SDK verified locally, all types inspected
- Architecture: HIGH — Pattern derived directly from SDK types and existing code
- Pitfalls: MEDIUM — Based on SDK constraints and Web Audio API knowledge; some need runtime validation
- Token API: MEDIUM — Types verified but runtime behavior of `v1alpha` API needs integration testing

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (30 days — SDK API is experimental/v1alpha, may change)
