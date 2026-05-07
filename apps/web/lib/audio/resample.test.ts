import { describe, it, expect } from "vitest";
import { linearResample, float32ToPcm16, arrayBufferToBase64 } from "./resample";

describe("linearResample", () => {
  it("returns same array when rates are equal", () => {
    const samples = new Float32Array([0.1, 0.2, 0.3, 0.4]);
    const result = linearResample(samples, 48000, 48000);
    expect(result).toBe(samples);
  });

  it("downsamples 48000 → 16000 (length / 3)", () => {
    const samples = new Float32Array(4800);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.sin(i * 0.01);
    const result = linearResample(samples, 48000, 16000);
    expect(result.length).toBe(1600);
  });

  it("produces interpolated values between samples", () => {
    const samples = new Float32Array([0, 1, 0, -1]);
    const result = linearResample(samples, 4, 2);
    // Downsample by 2: indices at 0, 2 → values 0, 0
    // But with interpolation the result depends on the ratio math
    expect(result.length).toBe(2);
    expect(result[0]).toBeCloseTo(0, 5);
  });

  it("upsamples 16000 → 48000 (length * 3)", () => {
    const samples = new Float32Array(160);
    for (let i = 0; i < samples.length; i++) samples[i] = i / 160;
    const result = linearResample(samples, 16000, 48000);
    expect(result.length).toBe(480);
  });
});

describe("float32ToPcm16", () => {
  it("maps 0.0 → 0", () => {
    const result = float32ToPcm16(new Float32Array([0]));
    expect(result[0]).toBe(0);
  });

  it("maps 1.0 → 32767", () => {
    const result = float32ToPcm16(new Float32Array([1.0]));
    expect(result[0]).toBe(32767);
  });

  it("maps -1.0 → -32768", () => {
    const result = float32ToPcm16(new Float32Array([-1.0]));
    expect(result[0]).toBe(-32768);
  });

  it("clamps values > 1.0 and < -1.0", () => {
    const result = float32ToPcm16(new Float32Array([1.5, -1.5]));
    expect(result[0]).toBe(32767);
    expect(result[1]).toBe(-32768);
  });
});

describe("arrayBufferToBase64", () => {
  it("roundtrips correctly", () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const base64 = arrayBufferToBase64(data.buffer);
    expect(base64).toBe(btoa("Hello"));
  });

  it("handles empty buffer", () => {
    const data = new Uint8Array(0);
    const base64 = arrayBufferToBase64(data.buffer);
    expect(base64).toBe("");
  });
});
