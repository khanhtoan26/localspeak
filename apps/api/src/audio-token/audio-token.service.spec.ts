import { InternalServerErrorException } from "@nestjs/common";
import { AudioTokenService } from "./audio-token.service";

const mockCreate = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    authTokens: { create: mockCreate },
  })),
  Modality: { TEXT: "TEXT", AUDIO: "AUDIO", IMAGE: "IMAGE" },
}));

describe("AudioTokenService", () => {
  let service: AudioTokenService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "gemini-2.0-flash";
    mockCreate.mockReset();
    service = new AudioTokenService();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  it("returns token and expiresAt on success", async () => {
    mockCreate.mockResolvedValueOnce({ name: "ephemeral-token-123" });

    const result = await service.createToken("Hello world");

    expect(result.token).toBe("ephemeral-token-123");
    expect(result.expiresAt).toBeDefined();
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("passes apiVersion v1alpha to GoogleGenAI constructor", () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    expect(GoogleGenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        httpOptions: { apiVersion: "v1alpha" },
      }),
    );
  });

  it("passes responseModalities TEXT and uses 1 in token config", async () => {
    mockCreate.mockResolvedValueOnce({ name: "tok" });

    await service.createToken("test");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          uses: 1,
          liveConnectConstraints: expect.objectContaining({
            config: expect.objectContaining({
              responseModalities: ["TEXT"],
            }),
          }),
        }),
      }),
    );
  });

  it("includes referenceText in systemInstruction", async () => {
    mockCreate.mockResolvedValueOnce({ name: "tok" });

    await service.createToken("The weather is nice");

    const callArgs = mockCreate.mock.calls[0][0];
    const sysInstruction =
      callArgs.config.liveConnectConstraints.config.systemInstruction;
    expect(sysInstruction).toContain("The weather is nice");
  });

  it("throws InternalServerErrorException when SDK fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API unavailable"));

    await expect(service.createToken("test")).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
