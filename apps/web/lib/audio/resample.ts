/**
 * Linear interpolation resampling from source rate to target rate.
 * Sufficient quality for speech at 16kHz target.
 */
export function linearResample(
  samples: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
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

/**
 * Convert Float32 audio samples (-1.0 to 1.0) to 16-bit PCM Int16Array.
 */
export function float32ToPcm16(float32: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return pcm16;
}

/**
 * Convert ArrayBuffer to base64 string for sending over WebSocket.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
